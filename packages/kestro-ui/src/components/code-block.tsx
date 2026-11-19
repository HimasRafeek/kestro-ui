import * as React from "react";
import { Check, Copy, FileCode2, Terminal } from "lucide-react";
import { cn } from "../lib/cn";
import { useCopyToClipboard } from "../lib/hooks";
import { highlight } from "../lib/highlight";

export interface CodeBlockProps {
  code: string;
  language?: string;
  /** Shown in the header instead of the language. */
  filename?: string;
  showLineNumbers?: boolean;
  /** Hide the header bar (copy button floats on hover instead). */
  hideHeader?: boolean;
  /** Max height before scrolling, e.g. 320 or "20rem". */
  maxHeight?: number | string;
  /** Show a blinking caret at the end (while streaming). */
  streaming?: boolean;
  /** Extra actions rendered in the header. */
  actions?: React.ReactNode;
  className?: string;
}

const SHELL = new Set(["bash", "sh", "shell", "zsh", "console", "powershell", "ps1", "cmd"]);

export function CodeBlock({
  code,
  language = "",
  filename,
  showLineNumbers = false,
  hideHeader = false,
  maxHeight,
  streaming,
  actions,
  className,
}: CodeBlockProps) {
  const { copied, copy } = useCopyToClipboard();
  const lines = React.useMemo(() => code.replace(/\n$/, "").split("\n"), [code]);
  const highlighted = React.useMemo(() => highlight(code.replace(/\n$/, ""), language), [code, language]);
  const label = filename ?? (language || "text");
  const Icon = SHELL.has(language.toLowerCase()) ? Terminal : FileCode2;

  const copyBtn = (
    <button
      type="button"
      onClick={() => copy(code)}
      className={cn(
        "inline-flex h-6 cursor-pointer items-center gap-1 rounded-md px-1.5 text-[11px] font-medium text-kui-fg-subtle transition-colors",
        "hover:bg-kui-surface-3 hover:text-kui-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kui-accent/40",
      )}
      aria-label={copied ? "Copied" : "Copy code"}
    >
      {copied ? <Check className="size-3.5 text-kui-success" /> : <Copy className="size-3.5" />}
      {hideHeader ? null : copied ? "Copied" : "Copy"}
    </button>
  );

  return (
    <div
      className={cn(
        "group/code relative overflow-hidden rounded-kui-sm border border-kui-border bg-kui-code-bg text-[13px]",
        className,
      )}
    >
      {!hideHeader && (
        <div className="flex h-9 items-center justify-between gap-2 border-b border-kui-border pr-1.5 pl-3">
          <div className="flex min-w-0 items-center gap-2 text-xs text-kui-fg-muted">
            <Icon className="size-3.5 shrink-0 text-kui-fg-subtle" />
            <span className="truncate font-medium">{label}</span>
          </div>
          <div className="flex items-center gap-0.5">
            {actions}
            {copyBtn}
          </div>
        </div>
      )}
      {hideHeader && (
        <div className="absolute top-1.5 right-1.5 z-10 opacity-0 transition-opacity group-hover/code:opacity-100 focus-within:opacity-100">
          {copyBtn}
        </div>
      )}
      <div
        className="kui-scrollbar overflow-auto"
        style={maxHeight !== undefined ? { maxHeight } : undefined}
      >
        <pre className="flex min-w-full w-max py-3 font-mono leading-[1.65] text-kui-fg">
          {showLineNumbers && (
            <span
              aria-hidden
              className="sticky left-0 shrink-0 bg-kui-code-bg pr-4 pl-3 text-right text-kui-fg-subtle/70 select-none"
            >
              {lines.map((_, i) => (
                <span key={i} className="block">
                  {i + 1}
                </span>
              ))}
            </span>
          )}
          <code className={cn("block pr-4", showLineNumbers ? "pl-1" : "pl-4")}>
            {highlighted}
            {streaming ? (
              <span className="ml-px inline-block h-[1.1em] w-[7px] translate-y-[3px] animate-kui-blink bg-kui-accent" />
            ) : null}
          </code>
        </pre>
      </div>
    </div>
  );
}
