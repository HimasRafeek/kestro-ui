import * as React from "react";
import { ArrowUp, Mic, Paperclip, Quote, Square, Upload, X } from "lucide-react";
import { cn } from "../lib/cn";
import { useAutoResizeTextarea, useControllableState } from "../lib/hooks";
import { AttachmentList, type AttachmentData } from "./attachment";
import { IconButton, Kbd } from "./primitives";

export type ChatStatus = "ready" | "submitted" | "streaming" | "error";

/** Something the next message refers to — e.g. an image from earlier in the chat. */
export interface PromptReference {
  id: string;
  label: string;
  /** Image URL for a thumbnail. */
  thumbnail?: string;
}

export interface PromptSubmission {
  text: string;
  /** References attached via `references` (e.g. "Ask about this image"). */
  references?: PromptReference[];
  /** Raw files picked/dropped/pasted (when attachments are managed internally). */
  files: File[];
  attachments: AttachmentData[];
}

export interface PromptInputProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onSubmit?: (message: PromptSubmission) => void;
  /** "streaming"/"submitted" turns the send button into a stop button. */
  status?: ChatStatus;
  onStop?: () => void;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  maxRows?: number;

  /** Enable file attachments (button, drag & drop, paste). */
  allowAttachments?: boolean;
  accept?: string;
  /** Controlled attachments. If omitted, attachments are managed internally. */
  attachments?: AttachmentData[];
  onAttach?: (files: File[]) => void;
  onRemoveAttachment?: (id: string) => void;

  /** Context chips shown above the input (e.g. a referenced image). */
  references?: PromptReference[];
  onRemoveReference?: (id: string) => void;

  /** Show a microphone button. */
  onVoice?: () => void;
  voiceActive?: boolean;

  /** Extra controls on the left of the toolbar (e.g. <ModelSelector/>). */
  toolbar?: React.ReactNode;
  /** Extra controls on the right of the toolbar, before send. */
  actions?: React.ReactNode;
  /** Footer hint. `false` hides it. */
  hint?: React.ReactNode | false;
  className?: string;
}

let attachmentSeq = 0;

export const PromptInput = React.forwardRef<HTMLTextAreaElement, PromptInputProps>(function PromptInput(
  {
    value,
    defaultValue = "",
    onValueChange,
    onSubmit,
    status = "ready",
    onStop,
    placeholder = "Ask anything…",
    disabled,
    autoFocus,
    maxRows = 8,
    allowAttachments = true,
    accept,
    attachments: attachmentsProp,
    onAttach,
    onRemoveAttachment,
    references,
    onRemoveReference,
    onVoice,
    voiceActive,
    toolbar,
    actions,
    hint,
    className,
  },
  forwardedRef,
) {
  const [text, setText] = useControllableState({ value, defaultValue, onChange: onValueChange });
  const [internal, setInternal] = React.useState<{ data: AttachmentData; file: File }[]>([]);
  const [dragging, setDragging] = React.useState(false);
  const [composing, setComposing] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);
  React.useImperativeHandle(forwardedRef, () => textareaRef.current as HTMLTextAreaElement);
  useAutoResizeTextarea(textareaRef, text, maxRows);

  const controlledAttachments = attachmentsProp !== undefined;
  const attachments = controlledAttachments ? attachmentsProp! : internal.map((x) => x.data);
  const busy = status === "streaming" || status === "submitted";
  const canSend = !disabled && !busy && (text.trim().length > 0 || attachments.length > 0 || !!references?.length);

  React.useEffect(
    () => () => internal.forEach((x) => x.data.url?.startsWith("blob:") && URL.revokeObjectURL(x.data.url)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const addFiles = (files: File[]) => {
    if (!files.length || !allowAttachments) return;
    onAttach?.(files);
    if (!controlledAttachments) {
      setInternal((prev) => [
        ...prev,
        ...files.map((file) => ({
          file,
          data: {
            id: `att-${++attachmentSeq}`,
            name: file.name,
            size: file.size,
            type: file.type,
            url: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
          },
        })),
      ]);
    }
  };

  const removeAttachment = (id: string) => {
    onRemoveAttachment?.(id);
    if (!controlledAttachments) setInternal((prev) => prev.filter((x) => x.data.id !== id));
  };

  const submit = () => {
    if (!canSend) return;
    onSubmit?.({ text: text.trim(), files: internal.map((x) => x.file), attachments, references });
    setText("");
    if (!controlledAttachments) setInternal([]);
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  return (
    <div className={cn("w-full", className)}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        onDragOver={(e) => {
          if (!allowAttachments || !e.dataTransfer.types.includes("Files")) return;
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false);
        }}
        onDrop={(e) => {
          if (!allowAttachments) return;
          e.preventDefault();
          setDragging(false);
          addFiles(Array.from(e.dataTransfer.files));
        }}
        className={cn(
          "relative flex flex-col rounded-[calc(var(--kui-radius)*1.6)] border border-kui-border bg-kui-surface shadow-kui transition-[border-color,box-shadow]",
          "focus-within:border-kui-border-strong focus-within:shadow-[var(--kui-shadow),0_0_0_4px_color-mix(in_oklch,var(--kui-accent)_10%,transparent)]",
          disabled && "opacity-60",
        )}
      >
        {references?.length ? (
          <div className="flex flex-wrap gap-2 px-3 pt-3">
            {references.map((r) => (
              <span key={r.id} className="inline-flex h-9 max-w-64 items-center gap-2 rounded-kui-sm border border-kui-border bg-kui-surface-2 py-1 pr-1.5 pl-1 text-[13px] text-kui-fg animate-kui-pop">
                {r.thumbnail ? <img src={r.thumbnail} alt="" className="size-7 rounded object-cover" /> : <Quote className="ml-1 size-3.5 text-kui-fg-subtle" />}
                <span className="truncate">{r.label}</span>
                {onRemoveReference ? (
                  <button type="button" aria-label={`Remove ${r.label}`} onClick={() => onRemoveReference(r.id)} className="flex size-5 cursor-pointer items-center justify-center rounded-full text-kui-fg-subtle hover:bg-kui-surface-3 hover:text-kui-fg">
                    <X className="size-3" />
                  </button>
                ) : null}
              </span>
            ))}
          </div>
        ) : null}
        {attachments.length ? <AttachmentList attachments={attachments} onRemove={removeAttachment} className="px-3 pt-3" /> : null}

        <textarea
          ref={textareaRef}
          value={text}
          rows={1}
          disabled={disabled}
          autoFocus={autoFocus}
          placeholder={placeholder}
          onChange={(e) => setText(e.target.value)}
          onCompositionStart={() => setComposing(true)}
          onCompositionEnd={() => setComposing(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !composing && !e.nativeEvent.isComposing) {
              e.preventDefault();
              submit();
            }
          }}
          onPaste={(e) => {
            const files = Array.from(e.clipboardData.files);
            if (files.length && allowAttachments) {
              e.preventDefault();
              addFiles(files);
            }
          }}
          className="kui-scrollbar block w-full resize-none bg-transparent px-4 pt-3.5 pb-1 text-[15px] leading-6 text-kui-fg placeholder:text-kui-fg-subtle focus:outline-none disabled:cursor-not-allowed"
        />

        <div className="flex items-center gap-1 px-2 pt-1 pb-2">
          {allowAttachments ? (
            <>
              <input
                ref={fileRef}
                type="file"
                multiple
                accept={accept}
                hidden
                onChange={(e) => {
                  addFiles(Array.from(e.target.files ?? []));
                  e.target.value = "";
                }}
              />
              <IconButton label="Attach files" onClick={() => fileRef.current?.click()} disabled={disabled}>
                <Paperclip />
              </IconButton>
            </>
          ) : null}
          {toolbar}
          <div className="ml-auto flex items-center gap-1">
            {actions}
            {onVoice ? (
              <IconButton
                label={voiceActive ? "Stop voice" : "Voice input"}
                onClick={onVoice}
                className={cn(voiceActive && "bg-kui-danger-soft text-kui-danger hover:bg-kui-danger-soft hover:text-kui-danger")}
              >
                <Mic />
              </IconButton>
            ) : null}
            {busy ? (
              <button
                type="button"
                aria-label="Stop generating"
                onClick={onStop}
                className="ml-1 flex size-8 cursor-pointer items-center justify-center rounded-full bg-kui-fg text-kui-bg transition-transform hover:scale-105 active:scale-95"
              >
                <Square className="size-3 fill-current" />
              </button>
            ) : (
              <button
                type="submit"
                aria-label="Send message"
                disabled={!canSend}
                className={cn(
                  "ml-1 flex size-8 cursor-pointer items-center justify-center rounded-full transition-all duration-300 ease-kui-out",
                  canSend
                    ? "bg-kui-accent text-kui-accent-fg shadow-[0_4px_14px_-4px_var(--kui-accent)] hover:brightness-110 active:scale-95"
                    : "cursor-not-allowed bg-kui-surface-3 text-kui-fg-subtle",
                )}
              >
                <ArrowUp className="size-4" strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>

        {dragging ? (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center gap-2 rounded-[inherit] border-2 border-dashed border-kui-accent bg-kui-surface/90 text-sm font-medium text-kui-accent backdrop-blur-sm">
            <Upload className="size-4" /> Drop files to attach
          </div>
        ) : null}
      </form>
      {hint !== false ? (
        <div className="mt-2 flex items-center justify-center gap-1.5 px-2 text-center text-[11px] text-kui-fg-subtle">
          {hint ?? (
            <>
              <Kbd>Enter</Kbd> to send · <Kbd>Shift</Kbd>+<Kbd>Enter</Kbd> for a new line
            </>
          )}
        </div>
      ) : null}
    </div>
  );
});
