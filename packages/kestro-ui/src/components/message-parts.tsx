import * as React from "react";
import { AttachmentList, type AttachmentData } from "./attachment";
import { ImageGallery, type ImageItem } from "./media";
import { StreamingMarkdown, type MarkdownProps } from "./markdown";
import { Reasoning } from "./reasoning";
import { Sources, type Source } from "./sources";
import { ToolCall, type ToolStatus } from "./tool-call";
import { ToolApproval } from "./approval";
import { TypingIndicator } from "./message";

/*
 * Message shape — intentionally compatible with the Vercel AI SDK `UIMessage`
 * (`useChat().messages`), but with no dependency on it. Plain `content` strings work too.
 */

export interface TextPart {
  type: "text";
  text: string;
  state?: "streaming" | "done";
}
export interface ReasoningPart {
  type: "reasoning";
  text: string;
  state?: "streaming" | "done";
  /** Seconds (extension). */
  duration?: number;
}
export type ToolPartState =
  | "input-streaming"
  | "input-available"
  | "approval-requested"
  | "approval-responded"
  | "output-available"
  | "output-error"
  | "output-denied";
export interface ToolPart {
  /** `tool-${name}` or "dynamic-tool" (with `toolName`). */
  type: string;
  toolName?: string;
  toolCallId?: string;
  state: ToolPartState;
  input?: unknown;
  output?: unknown;
  errorText?: string;
  approval?: { id: string; approved?: boolean; reason?: string };
  /** Friendly title (extension). */
  title?: string;
  /** Duration in ms (extension). */
  durationMs?: number;
}
export interface SourceUrlPart {
  type: "source-url";
  sourceId?: string;
  url: string;
  title?: string;
  snippet?: string;
}
export interface FilePart {
  type: "file";
  mediaType?: string;
  filename?: string;
  url?: string;
}
export interface DataPart {
  type: string; // `data-${name}`
  id?: string;
  data: unknown;
}

export type ChatMessagePart = TextPart | ReasoningPart | ToolPart | SourceUrlPart | FilePart | DataPart | { type: "step-start" };

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  parts?: ChatMessagePart[];
  /** Shortcut for a single text part. */
  content?: string;
  /** Agent name override for this message (multi-agent). */
  name?: string;
  createdAt?: Date | string | number;
}

export const isToolPart = (p: { type: string }): p is ToolPart => p.type.startsWith("tool-") || p.type === "dynamic-tool";
export const isDataPart = (p: { type: string }): p is DataPart => p.type.startsWith("data-");

export function getToolName(p: ToolPart) {
  return p.toolName ?? (p.type.startsWith("tool-") ? p.type.slice(5) : "tool");
}

export function toolStatusFromState(state: ToolPartState): ToolStatus {
  switch (state) {
    case "input-streaming":
      return "pending";
    case "input-available":
    case "approval-responded":
      return "running";
    case "output-available":
      return "success";
    case "output-error":
      return "error";
    case "output-denied":
      return "denied";
    default:
      return "pending";
  }
}

/** "order_id" → "Order id", "bookFlight" → "Book flight" */
export function humanize(key: string) {
  const s = key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").trim().toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function getMessageParts(m: ChatMessage): ChatMessagePart[] {
  if (m.parts?.length) return m.parts;
  return m.content ? [{ type: "text", text: m.content }] : [];
}

export function getMessageText(m: ChatMessage) {
  return getMessageParts(m)
    .filter((p): p is TextPart => p.type === "text")
    .map((p) => p.text)
    .join("\n\n");
}

export interface MessagePartsProps {
  message: ChatMessage;
  /** The message is currently being streamed. */
  streaming?: boolean;
  /** Return a node to custom-render a tool (generative UI); return undefined for the default card. */
  renderTool?: (part: ToolPart, ctx: { name: string; status: ToolStatus }) => React.ReactNode | undefined;
  /** Render custom `data-*` parts. */
  renderData?: (part: DataPart) => React.ReactNode;
  onToolApproval?: (decision: { id: string; approved: boolean; part: ToolPart }) => void;
  /** Friendly titles per tool name, e.g. { web_search: "Searching the web" } */
  toolTitles?: Record<string, string>;
  renderCode?: MarkdownProps["renderCode"];
  /** Adds "Ask about this image" to the lightbox of image attachments. */
  onImageReference?: (image: ImageItem) => void;
}

/** Renders every part of a message: text, reasoning, tools, approvals, sources, files. */
export function MessageParts({
  message,
  streaming = false,
  renderTool,
  renderData,
  onToolApproval,
  toolTitles,
  renderCode,
  onImageReference,
}: MessagePartsProps) {
  const parts = getMessageParts(message);
  const sources: Source[] = parts
    .filter((p): p is SourceUrlPart => p.type === "source-url")
    .map((p) => ({ id: p.sourceId, url: p.url, title: p.title, snippet: p.snippet }));
  const fileParts = parts.filter((p): p is FilePart => p.type === "file");
  const isImage = (p: FilePart) => !!p.url && (p.mediaType?.startsWith("image/") || /\.(png|jpe?g|gif|webp|avif|svg)$/i.test(p.filename ?? p.url));
  const images: ImageItem[] = fileParts.filter(isImage).map((p, i) => ({ id: `${message.id}-img${i}`, src: p.url!, alt: p.filename }));
  const files: AttachmentData[] = fileParts
    .filter((p) => !isImage(p))
    .map((p, i) => ({ id: `${message.id}-f${i}`, name: p.filename ?? "file", type: p.mediaType, url: p.url }));

  const visible = parts.filter((p) => p.type !== "source-url" && p.type !== "file" && p.type !== "step-start");
  const lastIdx = visible.length - 1;

  if (!visible.length && streaming) return <TypingIndicator />;

  return (
    <>
      {images.length ? <ImageGallery images={images} onReference={onImageReference ? (img) => onImageReference(img) : undefined} /> : null}
      {files.length ? <AttachmentList attachments={files} /> : null}
      {visible.map((part, i) => {
        const key = `${message.id}-${i}`;
        const isLast = i === lastIdx;
        if (part.type === "text") {
          const p = part as TextPart;
          if (!p.text && !(streaming && isLast)) return null;
          return (
            <StreamingMarkdown key={key} streaming={streaming && isLast && p.state !== "done"} sources={sources} renderCode={renderCode}>
              {p.text}
            </StreamingMarkdown>
          );
        }
        if (part.type === "reasoning") {
          const p = part as ReasoningPart;
          const live = p.state === "streaming" || (p.state === undefined && streaming && isLast);
          return <Reasoning key={key} content={p.text} streaming={live} duration={p.duration} />;
        }
        if (isToolPart(part)) {
          const name = getToolName(part);
          const status = toolStatusFromState(part.state);
          const custom = renderTool?.(part, { name, status });
          if (custom !== undefined) return <React.Fragment key={key}>{custom}</React.Fragment>;
          if (part.state === "approval-requested") {
            const id = part.approval?.id ?? part.toolCallId ?? key;
            return (
              <ToolApproval
                key={key}
                title={toolTitles?.[name] ? `${toolTitles[name]}?` : `Allow ${humanize(name).toLowerCase()}?`}
                description="The agent wants to perform this action and needs your permission."
                details={
                  part.input && typeof part.input === "object"
                    ? Object.entries(part.input as Record<string, unknown>).map(([k, v]) => ({
                        label: humanize(k),
                        value: typeof v === "string" ? v : JSON.stringify(v),
                      }))
                    : undefined
                }
                onApprove={() => onToolApproval?.({ id, approved: true, part })}
                onDeny={() => onToolApproval?.({ id, approved: false, part })}
              />
            );
          }
          return (
            <ToolCall
              key={key}
              name={name}
              title={part.title ?? toolTitles?.[name]}
              status={status}
              input={part.input}
              output={part.output}
              error={part.errorText}
              durationMs={part.durationMs}
            />
          );
        }
        if (isDataPart(part)) return <React.Fragment key={key}>{renderData?.(part) ?? null}</React.Fragment>;
        return null;
      })}
      {sources.length && !streaming ? <Sources sources={sources} /> : null}
    </>
  );
}
