import * as React from "react";
import { Brain, ChevronDown } from "lucide-react";
import { cn } from "../lib/cn";
import { formatDuration, useControllableState, useElapsed } from "../lib/hooks";
import { Collapse, ShimmerText, Spinner } from "./primitives";
import { StreamingMarkdown } from "./markdown";

export interface ReasoningProps {
  /** The reasoning text (markdown) — or pass `children`. */
  content?: string;
  children?: React.ReactNode;
  /** True while the model is still thinking. */
  streaming?: boolean;
  /** Seconds spent thinking. Measured automatically if omitted. */
  duration?: number;
  /** Optional one-line summary shown under the title. */
  summary?: React.ReactNode;
  /** "card" (bordered) or "inline" (minimal, flows with the message). */
  variant?: "card" | "inline";
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Label overrides. */
  labels?: { thinking?: React.ReactNode; thought?: (seconds: number) => React.ReactNode };
  className?: string;
}

function lastLine(text?: string) {
  if (!text) return "";
  const lines = text.trim().split("\n").filter((l) => l.trim());
  return (lines[lines.length - 1] ?? "").replace(/[*_`#>]/g, "").trim();
}

export function Reasoning({
  content,
  children,
  streaming = false,
  duration,
  summary,
  variant = "card",
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  labels,
  className,
}: ReasoningProps) {
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const elapsed = useElapsed(streaming);
  const seconds = duration ?? elapsed;
  const preview = summary ?? (streaming ? lastLine(content) : null);
  const card = variant === "card";

  const title = streaming
    ? (labels?.thinking ?? "Thinking")
    : (labels?.thought?.(seconds) ?? (seconds > 0 ? `Thought for ${formatDuration(seconds)}` : "Thought process"));

  return (
    <div
      className={cn(
        "w-full",
        card && "rounded-kui border border-kui-border bg-kui-surface transition-colors",
        card && open && "bg-kui-surface",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className={cn(
          "group flex w-full cursor-pointer items-center gap-3 text-left focus-visible:outline-none",
          card ? "rounded-kui px-3.5 py-2.5 hover:bg-kui-surface-2/60" : "py-1",
        )}
      >
        {card ? (
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-kui-border bg-kui-surface-2 text-kui-fg-muted">
            {streaming ? <Spinner className="size-3.5 text-kui-accent" /> : <Brain className="size-3.5" />}
          </span>
        ) : streaming ? null : (
          <Brain className="size-4 shrink-0 text-kui-fg-subtle" />
        )}
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5 text-sm font-medium text-kui-fg">
            {streaming ? <ShimmerText>{title}</ShimmerText> : <span className={cn(!card && "text-kui-fg-muted group-hover:text-kui-fg")}>{title}</span>}
            {!card && (
              <ChevronDown
                className={cn("size-3.5 text-kui-fg-subtle transition-transform duration-300 ease-kui-out", open ? "rotate-0" : "-rotate-90")}
              />
            )}
          </span>
          {card && preview && !open ? (
            <span className="mt-0.5 block truncate text-xs text-kui-fg-subtle">{preview}</span>
          ) : null}
        </span>
        {card && (
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-kui-fg-subtle transition-transform duration-300 ease-kui-out group-hover:text-kui-fg-muted",
              open && "rotate-180",
            )}
          />
        )}
      </button>
      <Collapse open={open}>
        <div
          className={cn(
            "text-[13.5px] leading-6 text-kui-fg-muted",
            card ? "mx-3.5 mb-3.5 border-l-2 border-kui-border pl-4" : "mt-1.5 mb-1 ml-2 border-l-2 border-kui-border pl-4",
          )}
        >
          {content !== undefined ? (
            <StreamingMarkdown streaming={streaming} className="text-[13.5px] text-kui-fg-muted [&_strong]:text-kui-fg-muted">
              {content}
            </StreamingMarkdown>
          ) : (
            children
          )}
        </div>
      </Collapse>
    </div>
  );
}
