import * as React from "react";
import { CircleAlert, RefreshCw } from "lucide-react";
import { cn } from "../lib/cn";
import { AgentAvatar, type AgentAvatarProps, type AgentState } from "./agent-avatar";
import { AgentHeader } from "./agent";
import { Message, MessageActions, TypingIndicator, Thread, type Feedback } from "./message";
import {
  MessageParts,
  getMessageParts,
  getMessageText,
  type ChatMessage,
  type MessagePartsProps,
} from "./message-parts";
import { ModelSelector, type ModelOption } from "./model-selector";
import { PromptInput, type ChatStatus, type PromptReference, type PromptSubmission } from "./prompt-input";
import { EmptyState, Suggestions, type Suggestion } from "./suggestions";
import { Button } from "./primitives";

export interface AgentInfo {
  name: string;
  description?: React.ReactNode;
  avatar?: AgentAvatarProps;
}

export interface AgentChatProps extends Pick<MessagePartsProps, "renderTool" | "renderData" | "onToolApproval" | "toolTitles" | "renderCode"> {
  messages: ChatMessage[];
  status?: ChatStatus;
  onSend?: (text: string, submission: PromptSubmission) => void;
  onStop?: () => void;
  onRegenerate?: (messageId: string) => void;
  onFeedback?: (messageId: string, value: Feedback) => void;

  agent?: AgentInfo;
  /** `true` renders a default header from `agent`; or pass your own node. */
  header?: React.ReactNode | boolean;

  /** Empty-state title/description. */
  welcome?: { title?: React.ReactNode; description?: React.ReactNode; icon?: React.ReactNode };
  /** Starter prompts shown in the empty state. */
  suggestions?: Suggestion[];
  /** Follow-up chips shown above the input after the last answer. */
  followUps?: Suggestion[];

  models?: ModelOption[];
  model?: string;
  onModelChange?: (id: string) => void;

  placeholder?: string;
  allowAttachments?: boolean;
  onVoice?: () => void;
  /** Extra controls in the prompt toolbar. */
  toolbar?: React.ReactNode;

  /** Error message shown at the end of the thread. */
  error?: React.ReactNode;
  onRetry?: () => void;

  /** Tighter spacing for widgets & side panels. */
  compact?: boolean;
  /** Focus the input on mount. Defaults to `true` unless `compact`. */
  autoFocus?: boolean;
  /** Message layout. */
  variant?: "bubble" | "flat";
  className?: string;
}

/**
 * Batteries-included chat surface: thread, messages, reasoning, tools,
 * approvals, sources, empty state, follow-ups and the prompt input.
 */
export function AgentChat({
  messages,
  status = "ready",
  onSend,
  onStop,
  onRegenerate,
  onFeedback,
  agent,
  header,
  welcome,
  suggestions,
  followUps,
  models,
  model,
  onModelChange,
  placeholder,
  allowAttachments = true,
  onVoice,
  toolbar,
  error,
  onRetry,
  compact = false,
  autoFocus,
  variant = "bubble",
  renderTool,
  renderData,
  onToolApproval,
  toolTitles,
  renderCode,
  className,
}: AgentChatProps) {
  const [feedback, setFeedback] = React.useState<Record<string, Feedback>>({});
  const [references, setReferences] = React.useState<PromptReference[]>([]);
  const addImageReference = (img: { src: string; alt?: string }) =>
    setReferences((r) => (r.some((x) => x.id === img.src) ? r : [...r, { id: img.src, label: img.alt || "Image", thumbnail: img.src }]));
  const busy = status === "streaming" || status === "submitted";
  const last = messages[messages.length - 1];
  const showTyping = status === "submitted" && last?.role === "user";
  const agentState: AgentState = busy ? "working" : error ? "error" : "online";
  const agentAvatar: AgentAvatarProps = { name: agent?.name, ...agent?.avatar };

  const send = (text: string, sub?: PromptSubmission) => {
    onSend?.(text, sub ?? { text, files: [], attachments: [], references: references.length ? references : undefined });
    setReferences([]);
  };

  const width = compact ? "max-w-none px-4" : "max-w-3xl px-4 sm:px-6";

  const input = (
    <PromptInput
      onSubmit={(s) => send(s.text, s)}
      status={status}
      onStop={onStop}
      placeholder={placeholder ?? (agent ? `Message ${agent.name}…` : undefined)}
      allowAttachments={allowAttachments}
      onVoice={onVoice}
      references={references}
      onRemoveReference={(id) => setReferences((r) => r.filter((x) => x.id !== id))}
      hint={compact ? false : undefined}
      autoFocus={autoFocus ?? !compact}
      toolbar={
        <>
          {models?.length ? <ModelSelector models={models} value={model} onValueChange={onModelChange} /> : null}
          {toolbar}
        </>
      }
    />
  );

  return (
    <div className={cn("flex h-full min-h-0 w-full flex-col bg-kui-bg text-kui-fg", className)}>
      {header ? (
        <div className="shrink-0 border-b border-kui-border px-4 py-3">
          {header === true ? (
            <AgentHeader name={agent?.name ?? "Assistant"} description={agent?.description} state={agentState} avatar={agentAvatar} />
          ) : (
            header
          )}
        </div>
      ) : null}

      {messages.length === 0 ? (
        <div className="kui-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className={cn("mx-auto my-auto flex w-full flex-col items-center gap-8", width, compact ? "py-6" : "py-12")}>
            <EmptyState
              icon={welcome?.icon ?? <AgentAvatar size="lg" {...agentAvatar} />}
              title={welcome?.title ?? (agent ? `Hi, I'm ${agent.name}` : undefined)}
              description={welcome?.description ?? agent?.description}
              className={compact ? "py-2 [&_h2]:text-xl" : undefined}
            >
              {suggestions?.length ? (
                <Suggestions suggestions={suggestions} onSelect={(v) => send(v)} variant={compact ? "chips" : "cards"} className={compact ? "justify-center" : undefined} />
              ) : null}
            </EmptyState>
            {!compact ? <div className="w-full">{input}</div> : null}
          </div>
        </div>
      ) : (
        <Thread contentClassName={cn(width, compact ? "gap-5 py-5" : undefined)}>
          {messages.map((m, idx) => {
            const isLast = idx === messages.length - 1;
            const streamingThis = isLast && m.role === "assistant" && status === "streaming";
            if (m.role === "user") {
              const text = getMessageText(m);
              const files = getMessageParts(m).filter((p) => p.type === "file");
              return (
                <Message key={m.id} from="user" variant={variant}>
                  {files.length ? (
                    <div className="mb-2">
                      <MessageParts message={{ ...m, parts: files }} onImageReference={addImageReference} />
                    </div>
                  ) : null}
                  {text}
                </Message>
              );
            }
            if (m.role === "system") {
              return (
                <Message key={m.id} from="system">
                  {getMessageText(m)}
                </Message>
              );
            }
            const text = getMessageText(m);
            return (
              <Message
                key={m.id}
                from="assistant"
                name={compact ? undefined : (m.name ?? agent?.name)}
                avatar={compact ? false : { ...agentAvatar, name: m.name ?? agent?.name }}
                variant={variant}
                actions={
                  !streamingThis && text ? (
                    <MessageActions
                      copyText={text}
                      alwaysVisible={isLast}
                      feedback={feedback[m.id] ?? null}
                      onFeedback={(v) => {
                        setFeedback((f) => ({ ...f, [m.id]: v }));
                        onFeedback?.(m.id, v);
                      }}
                      onRegenerate={onRegenerate && isLast ? () => onRegenerate(m.id) : undefined}
                    />
                  ) : null
                }
              >
                <MessageParts
                  message={m}
                  streaming={streamingThis}
                  renderTool={renderTool}
                  renderData={renderData}
                  onToolApproval={onToolApproval}
                  toolTitles={toolTitles}
                  renderCode={renderCode}
                  onImageReference={addImageReference}
                />
              </Message>
            );
          })}
          {showTyping ? (
            <Message from="assistant" avatar={compact ? false : agentAvatar}>
              <TypingIndicator />
            </Message>
          ) : null}
          {error ? (
            <div className="flex items-center gap-3 rounded-kui border border-kui-danger/30 bg-kui-danger-soft px-4 py-3 text-sm text-kui-danger animate-kui-in">
              <CircleAlert className="size-4 shrink-0" />
              <span className="min-w-0 flex-1">{error}</span>
              {onRetry ? (
                <Button size="xs" variant="outline" onClick={onRetry} className="border-kui-danger/30 text-kui-danger">
                  <RefreshCw /> Retry
                </Button>
              ) : null}
            </div>
          ) : null}
        </Thread>
      )}

      {messages.length > 0 || compact ? (
        <div className={cn("mx-auto w-full shrink-0 pb-4", width, compact && "pb-3")}>
          {followUps?.length && !busy && messages.length > 0 ? (
            <Suggestions suggestions={followUps} onSelect={(v) => send(v)} className="mb-3" />
          ) : null}
          {input}
        </div>
      ) : null}
    </div>
  );
}
