import * as React from "react";
import {
  Ban,
  Check,
  ChevronDown,
  CircleAlert,
  Clock,
  Code,
  FileText,
  Globe,
  RefreshCw,
  Search,
  Terminal,
  Wrench,
  Database,
  Image as ImageIcon,
  Pencil,
} from "lucide-react";
import { cn } from "../lib/cn";
import { formatDuration, useControllableState } from "../lib/hooks";
import { Badge, Button, Collapse, ShimmerText, Spinner } from "./primitives";
import { CodeBlock } from "./code-block";

export type ToolStatus = "pending" | "running" | "success" | "error" | "denied";

export interface ToolCallProps {
  /** Tool identifier, e.g. "web_search". */
  name: string;
  /** Friendly title shown instead of the raw name (e.g. "Searching the web"). */
  title?: React.ReactNode;
  icon?: React.ReactNode;
  status?: ToolStatus;
  input?: unknown;
  output?: unknown;
  error?: React.ReactNode;
  /** Duration in milliseconds. */
  durationMs?: number;
  /** Custom output renderer — overrides the default JSON/text output view. */
  children?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onRetry?: () => void;
  className?: string;
}

/** Picks a sensible icon from common tool names. */
export function getToolIcon(name: string): React.ReactNode {
  const n = name.toLowerCase();
  if (/(search|lookup|find|grep)/.test(n)) return <Search />;
  if (/(web|browse|fetch|http|url|scrape)/.test(n)) return <Globe />;
  if (/(shell|bash|exec|terminal|command|run)/.test(n)) return <Terminal />;
  if (/(write|edit|patch|update|create)/.test(n)) return <Pencil />;
  if (/(file|read|doc|pdf)/.test(n)) return <FileText />;
  if (/(sql|db|database|query)/.test(n)) return <Database />;
  if (/(image|vision|draw|render)/.test(n)) return <ImageIcon />;
  if (/(code|python|eval|interpret)/.test(n)) return <Code />;
  return <Wrench />;
}

const statusMeta: Record<ToolStatus, { label: string; tone: "neutral" | "accent" | "success" | "danger" | "warning" }> = {
  pending: { label: "Pending", tone: "neutral" },
  running: { label: "Running", tone: "accent" },
  success: { label: "Success", tone: "success" },
  error: { label: "Error", tone: "danger" },
  denied: { label: "Denied", tone: "warning" },
};

export function ToolStatusBadge({ status }: { status: ToolStatus }) {
  const meta = statusMeta[status];
  return (
    <Badge tone={meta.tone} className="animate-kui-pop">
      {status === "pending" && <Clock />}
      {status === "running" && <Spinner className="size-3 text-current" />}
      {status === "success" && <Check />}
      {status === "error" && <CircleAlert />}
      {status === "denied" && <Ban />}
      {meta.label}
    </Badge>
  );
}

function summarize(input: unknown): string {
  if (input == null) return "";
  if (typeof input === "string") return input;
  if (typeof input === "object") {
    const values = Object.values(input as Record<string, unknown>);
    const firstString = values.find((v) => typeof v === "string") as string | undefined;
    if (firstString) return firstString;
    return JSON.stringify(input);
  }
  return String(input);
}

function toCode(value: unknown): { code: string; lang: string } {
  if (typeof value === "string") {
    try {
      return { code: JSON.stringify(JSON.parse(value), null, 2), lang: "json" };
    } catch {
      return { code: value, lang: "text" };
    }
  }
  return { code: JSON.stringify(value, null, 2) ?? String(value), lang: "json" };
}

export function ToolCall({
  name,
  title,
  icon,
  status = "success",
  input,
  output,
  error,
  durationMs,
  children,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  onRetry,
  className,
}: ToolCallProps) {
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const summary = summarize(input);
  const live = status === "running" || status === "pending";
  const hasBody = input !== undefined || output !== undefined || error || children;

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-kui border bg-kui-surface transition-[border-color,box-shadow] duration-500 ease-kui-out animate-kui-in",
        status === "error" ? "border-kui-danger/30" : "border-kui-border",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => hasBody && setOpen(!open)}
        aria-expanded={open}
        className={cn(
          "group flex w-full items-center gap-3 px-3 py-2.5 text-left focus-visible:outline-none",
          hasBody && "cursor-pointer hover:bg-kui-surface-2/60",
        )}
      >
        <span
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-lg border [&_svg]:size-3.5",
            status === "error"
              ? "border-kui-danger/25 bg-kui-danger-soft text-kui-danger"
              : status === "running"
                ? "border-kui-accent/25 bg-kui-accent-soft text-kui-accent"
                : "border-kui-border bg-kui-surface-2 text-kui-fg-muted",
          )}
        >
          {icon ?? getToolIcon(name)}
        </span>
        <span className="flex min-w-0 flex-1 items-baseline gap-2">
          {title ? (
            <span className="max-w-full shrink-0 truncate text-sm font-medium text-kui-fg">
              {status === "running" ? <ShimmerText>{title}</ShimmerText> : title}
            </span>
          ) : (
            <span className="shrink-0 font-mono text-[13px] font-medium text-kui-fg">{name}</span>
          )}
          {summary ? (
            <span className="min-w-0 truncate font-mono text-xs text-kui-fg-subtle">{summary}</span>
          ) : null}
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {durationMs !== undefined && !live ? (
            <span className="text-xs text-kui-fg-subtle tabular-nums">{formatDuration(durationMs / 1000)}</span>
          ) : null}
          <ToolStatusBadge key={status} status={status} />
          {hasBody ? (
            <ChevronDown
              className={cn("size-4 text-kui-fg-subtle transition-transform duration-300 ease-kui-out", open && "rotate-180")}
            />
          ) : null}
        </span>
      </button>

      {hasBody ? (
        <Collapse open={open}>
          <div className="space-y-3 border-t border-kui-border px-3 py-3">
            {input !== undefined ? (
              <section>
                <h4 className="mb-1.5 text-[11px] font-semibold tracking-wide text-kui-fg-subtle uppercase">Arguments</h4>
                <CodeBlock {...(() => { const c = toCode(input); return { code: c.code, language: c.lang }; })()} hideHeader showLineNumbers maxHeight={240} />
              </section>
            ) : null}
            {error ? (
              <section className="flex items-start gap-2.5 rounded-kui-sm border border-kui-danger/25 bg-kui-danger-soft px-3 py-2.5 text-[13px] text-kui-danger">
                <CircleAlert className="mt-0.5 size-4 shrink-0" />
                <div className="min-w-0 flex-1 break-words">{error}</div>
                {onRetry ? (
                  <Button size="xs" variant="outline" onClick={onRetry} className="border-kui-danger/30 text-kui-danger hover:bg-kui-danger/10">
                    <RefreshCw /> Retry
                  </Button>
                ) : null}
              </section>
            ) : null}
            {children || output !== undefined ? (
              <section>
                <h4 className="mb-1.5 text-[11px] font-semibold tracking-wide text-kui-fg-subtle uppercase">Result</h4>
                {children ?? (() => {
                  const c = toCode(output);
                  return <CodeBlock code={c.code} language={c.lang} hideHeader maxHeight={280} />;
                })()}
              </section>
            ) : null}
          </div>
        </Collapse>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/** Stack of tool calls with a subtle connecting header, e.g. "Used 3 tools". */
export function ToolCallGroup({
  children,
  label,
  className,
}: {
  children: React.ReactNode;
  label?: React.ReactNode;
  className?: string;
}) {
  const count = React.Children.count(children);
  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {label !== null ? (
        <div className="text-xs font-medium text-kui-fg-subtle">{label ?? `Used ${count} tool${count === 1 ? "" : "s"}`}</div>
      ) : null}
      {children}
    </div>
  );
}
