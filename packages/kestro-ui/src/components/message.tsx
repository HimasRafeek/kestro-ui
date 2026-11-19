import * as React from "react";
import { ArrowDown, Check, Copy, Pencil, RefreshCw, ThumbsDown, ThumbsUp } from "lucide-react";
import { cn } from "../lib/cn";
import { useCopyToClipboard, useStickToBottom } from "../lib/hooks";
import { AgentAvatar, type AgentAvatarProps } from "./agent-avatar";
import { IconButton } from "./primitives";

export type MessageRole = "user" | "assistant" | "system";

/* -------------------------------------------------------------------------- */
/*                                   Message                                  */
/* -------------------------------------------------------------------------- */

export interface MessageProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "role"> {
  from: MessageRole;
  /** Display name (shown above assistant messages). */
  name?: React.ReactNode;
  /** Avatar node, avatar props, or `false` to hide. */
  avatar?: React.ReactNode | AgentAvatarProps | false;
  timestamp?: React.ReactNode;
  /** Rendered under the message (e.g. <MessageActions/>). */
  actions?: React.ReactNode;
  /**
   * "bubble": user messages in a bubble on the right (default)
   * "flat":   everything left-aligned with avatars (document style)
   */
  variant?: "bubble" | "flat";
}

function isAvatarProps(x: unknown): x is AgentAvatarProps {
  return !!x && typeof x === "object" && !React.isValidElement(x);
}

export function Message({
  from,
  name,
  avatar,
  timestamp,
  actions,
  variant = "bubble",
  className,
  children,
  ...props
}: MessageProps) {
  if (from === "system") {
    return (
      <div className={cn("flex items-center gap-3 py-1 text-xs text-kui-fg-subtle", className)} {...props}>
        <span className="h-px flex-1 bg-kui-border" />
        <span className="shrink-0">{children}</span>
        <span className="h-px flex-1 bg-kui-border" />
      </div>
    );
  }

  const isUser = from === "user";
  const bubble = isUser && variant === "bubble";

  const avatarNode =
    avatar === false ? null : isAvatarProps(avatar) ? (
      <AgentAvatar size="sm" {...avatar} />
    ) : avatar !== undefined ? (
      avatar
    ) : bubble ? null : (
      <AgentAvatar size="sm" variant={isUser ? "user" : "agent"} name={typeof name === "string" ? name : isUser ? "You" : "Assistant"} />
    );

  if (bubble) {
    return (
      <div className={cn("group/message flex w-full flex-col items-end gap-1.5 animate-kui-in", className)} data-role={from} {...props}>
        <div className="flex max-w-[85%] items-end gap-2.5">
          <div className="min-w-0 rounded-[calc(var(--kui-radius)*1.5)] rounded-br-md bg-kui-user-bubble px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap text-kui-fg [overflow-wrap:anywhere]">
            {children}
          </div>
          {avatarNode}
        </div>
        {actions || timestamp ? (
          <div className={cn("flex items-center gap-2", avatarNode && "pr-10.5")}>
            {timestamp ? <span className="text-[11px] text-kui-fg-subtle">{timestamp}</span> : null}
            {actions}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn("group/message flex w-full gap-3.5 animate-kui-in", className)} data-role={from} {...props}>
      {avatarNode ? <div className="shrink-0 pt-0.5">{avatarNode}</div> : null}
      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        {name || timestamp ? (
          <div className="flex h-8 items-center gap-2 -mb-1">
            {name ? <span className="text-sm font-semibold text-kui-fg">{name}</span> : null}
            {timestamp ? <span className="text-xs text-kui-fg-subtle">{timestamp}</span> : null}
          </div>
        ) : null}
        <div className={cn("flex min-w-0 flex-col gap-3", isUser && "text-[15px] whitespace-pre-wrap text-kui-fg")}>{children}</div>
        {actions}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               MessageActions                               */
/* -------------------------------------------------------------------------- */

export type Feedback = "up" | "down" | null;

export interface MessageActionsProps {
  /** Text copied by the copy button. Omit to hide it. */
  copyText?: string;
  onRegenerate?: () => void;
  onEdit?: () => void;
  feedback?: Feedback;
  onFeedback?: (value: Feedback) => void;
  /** Keep visible instead of revealing on hover. */
  alwaysVisible?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function MessageActions({
  copyText,
  onRegenerate,
  onEdit,
  feedback,
  onFeedback,
  alwaysVisible = false,
  children,
  className,
}: MessageActionsProps) {
  const { copied, copy } = useCopyToClipboard();
  return (
    <div
      className={cn(
        "-ml-1.5 flex items-center gap-0.5 transition-opacity duration-150",
        !alwaysVisible && "opacity-0 group-hover/message:opacity-100 focus-within:opacity-100 [@media(hover:none)]:opacity-100",
        className,
      )}
    >
      {copyText !== undefined ? (
        <IconButton label={copied ? "Copied" : "Copy"} size="xs" onClick={() => copy(copyText)}>
          {copied ? <Check className="text-kui-success" /> : <Copy />}
        </IconButton>
      ) : null}
      {onEdit ? (
        <IconButton label="Edit" size="xs" onClick={onEdit}>
          <Pencil />
        </IconButton>
      ) : null}
      {onFeedback ? (
        <>
          <IconButton
            label="Good response"
            size="xs"
            aria-pressed={feedback === "up"}
            onClick={() => onFeedback(feedback === "up" ? null : "up")}
            className={cn(feedback === "up" && "text-kui-fg")}
          >
            <ThumbsUp className={cn(feedback === "up" && "fill-current")} />
          </IconButton>
          <IconButton
            label="Bad response"
            size="xs"
            aria-pressed={feedback === "down"}
            onClick={() => onFeedback(feedback === "down" ? null : "down")}
            className={cn(feedback === "down" && "text-kui-fg")}
          >
            <ThumbsDown className={cn(feedback === "down" && "fill-current")} />
          </IconButton>
        </>
      ) : null}
      {onRegenerate ? (
        <IconButton label="Regenerate" size="xs" onClick={onRegenerate}>
          <RefreshCw />
        </IconButton>
      ) : null}
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               TypingIndicator                              */
/* -------------------------------------------------------------------------- */

export function TypingIndicator({ label, className }: { label?: React.ReactNode; className?: string }) {
  return (
    <div role="status" aria-label="Assistant is typing" className={cn("inline-flex items-center gap-2.5 py-1.5", className)}>
      <span className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-1.5 rounded-full bg-kui-accent animate-kui-dot"
            style={{ animationDelay: `${i * 0.16}s` }}
          />
        ))}
      </span>
      {label ? <span className="text-sm text-kui-fg-subtle">{label}</span> : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Thread                                   */
/* -------------------------------------------------------------------------- */

export interface ThreadProps {
  children: React.ReactNode;
  /** Classes for the scroll container. */
  className?: string;
  /** Classes for the centered content column. */
  contentClassName?: string;
  /** Hide the floating "scroll to bottom" button. */
  hideScrollButton?: boolean;
}

/** Scrollable message list that sticks to the bottom while content streams. */
export function Thread({ children, className, contentClassName, hideScrollButton }: ThreadProps) {
  const { scrollRef, contentRef, isAtBottom, scrollToBottom } = useStickToBottom<HTMLDivElement>();
  return (
    <div className={cn("relative min-h-0 flex-1", className)}>
      <div ref={scrollRef} className="kui-scrollbar absolute inset-0 overflow-y-auto" role="log" aria-live="polite">
        <div ref={contentRef} className={cn("mx-auto flex w-full max-w-3xl flex-col gap-7 px-4 py-8", contentClassName)}>
          {children}
        </div>
      </div>
      {!hideScrollButton ? (
        <button
          type="button"
          aria-label="Scroll to bottom"
          onClick={() => scrollToBottom()}
          className={cn(
            "absolute bottom-4 left-1/2 z-10 flex size-9 -translate-x-1/2 cursor-pointer items-center justify-center rounded-full border border-kui-border bg-kui-surface text-kui-fg-muted shadow-kui-lg transition-all duration-200 hover:text-kui-fg",
            isAtBottom ? "pointer-events-none translate-y-2 opacity-0" : "opacity-100",
          )}
        >
          <ArrowDown className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
