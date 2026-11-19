import * as React from "react";
import { Ban, Check, ShieldAlert, ShieldCheck, TriangleAlert } from "lucide-react";
import { cn } from "../lib/cn";
import { Badge, Button } from "./primitives";
import { CodeBlock } from "./code-block";

export type ApprovalStatus = "pending" | "approved" | "denied";
export type RiskLevel = "low" | "medium" | "high";

export interface ApprovalDetail {
  label: React.ReactNode;
  value: React.ReactNode;
}

export interface ToolApprovalProps {
  /** e.g. "Send this email to 3 recipients?", "Book flight for $412?", "Run shell command?" */
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  risk?: RiskLevel;
  /** Key/value rows describing exactly what will happen (amount, recipient, date…). */
  details?: ApprovalDetail[];
  /** Optional command / code preview (rendered as a code block). */
  command?: string;
  commandLanguage?: string;
  /** Any custom preview (email draft, diff, product card…). */
  children?: React.ReactNode;
  status?: ApprovalStatus;
  onApprove?: (opts: { remember: boolean }) => void;
  onDeny?: () => void;
  /** Label for the "remember" checkbox. Pass `false` to hide it. */
  rememberLabel?: React.ReactNode | false;
  approveLabel?: React.ReactNode;
  denyLabel?: React.ReactNode;
  className?: string;
}

const riskMeta: Record<RiskLevel, { label: string; tone: "success" | "warning" | "danger" }> = {
  low: { label: "Low risk", tone: "success" },
  medium: { label: "Needs approval", tone: "warning" },
  high: { label: "High risk", tone: "danger" },
};

/** Human-in-the-loop confirmation for any agent action. */
export function ToolApproval({
  title,
  description,
  icon,
  risk = "medium",
  details,
  command,
  commandLanguage = "bash",
  children,
  status = "pending",
  onApprove,
  onDeny,
  rememberLabel = "Don't ask again for this action",
  approveLabel = "Approve",
  denyLabel = "Deny",
  className,
}: ToolApprovalProps) {
  const [remember, setRemember] = React.useState(false);
  const meta = riskMeta[risk];
  const pending = status === "pending";

  return (
    <div
      role="group"
      aria-label="Approval required"
      className={cn(
        "w-full overflow-hidden rounded-kui border bg-kui-surface shadow-kui animate-kui-pop",
        pending
          ? risk === "high"
            ? "border-kui-danger/35"
            : "border-kui-accent/35 shadow-[0_0_0_4px_color-mix(in_oklch,var(--kui-accent)_8%,transparent)]"
          : "border-kui-border",
        className,
      )}
    >
      <div className="flex items-start gap-3 p-4">
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl border [&_svg]:size-4",
            risk === "high"
              ? "border-kui-danger/25 bg-kui-danger-soft text-kui-danger"
              : "border-kui-accent/20 bg-kui-accent-soft text-kui-accent",
          )}
        >
          {icon ?? (risk === "high" ? <TriangleAlert /> : <ShieldAlert />)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="text-[15px] font-semibold text-kui-fg">{title}</h3>
            {pending ? <Badge tone={meta.tone}>{meta.label}</Badge> : null}
          </div>
          {description ? <p className="mt-1 text-[13.5px] leading-relaxed text-kui-fg-muted">{description}</p> : null}
        </div>
      </div>

      {details?.length || command || children ? (
        <div className="space-y-3 px-4 pb-4">
          {details?.length ? (
            <dl className="divide-y divide-kui-border overflow-hidden rounded-kui-sm border border-kui-border bg-kui-surface-2/40">
              {details.map((d, i) => (
                <div key={i} className="flex items-start justify-between gap-4 px-3 py-2 text-[13px]">
                  <dt className="shrink-0 text-kui-fg-muted">{d.label}</dt>
                  <dd className="min-w-0 text-right font-medium break-words text-kui-fg">{d.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {command ? <CodeBlock code={command} language={commandLanguage} filename={commandLanguage === "bash" ? "shell" : commandLanguage} /> : null}
          {children}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-kui-border bg-kui-surface-2/40 px-4 py-3">
        {pending ? (
          <>
            {rememberLabel !== false ? (
              <label className="flex cursor-pointer items-center gap-2 text-[13px] text-kui-fg-muted select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="size-4 cursor-pointer rounded accent-[var(--kui-accent)]"
                />
                {rememberLabel}
              </label>
            ) : (
              <span />
            )}
            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onDeny}>
                {denyLabel}
              </Button>
              <Button variant={risk === "high" ? "danger" : "accent"} size="sm" onClick={() => onApprove?.({ remember })}>
                {approveLabel}
              </Button>
            </div>
          </>
        ) : (
          <span
            className={cn(
              "flex items-center gap-2 text-[13px] font-medium",
              status === "approved" ? "text-kui-success" : "text-kui-fg-muted",
            )}
          >
            {status === "approved" ? <ShieldCheck className="size-4" /> : <Ban className="size-4" />}
            {status === "approved" ? "Approved — the agent is continuing" : "Denied — the agent won't perform this action"}
          </span>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               AgentQuestion                                */
/* -------------------------------------------------------------------------- */

export interface QuestionOption {
  id: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
}

export interface AgentQuestionProps {
  question: React.ReactNode;
  description?: React.ReactNode;
  options?: QuestionOption[];
  /** Allow selecting several options. */
  multiple?: boolean;
  /** Show a free-text field ("Other…"). */
  allowCustom?: boolean;
  customPlaceholder?: string;
  submitLabel?: React.ReactNode;
  /** Once answered the card locks and shows the answer. */
  answered?: boolean;
  onSubmit?: (answer: { optionIds: string[]; text?: string }) => void;
  onSkip?: () => void;
  className?: string;
}

/** The agent asks the user a structured question (choice or free text). */
export function AgentQuestion({
  question,
  description,
  options = [],
  multiple = false,
  allowCustom = false,
  customPlaceholder = "Type your answer…",
  submitLabel = "Continue",
  answered = false,
  onSubmit,
  onSkip,
  className,
}: AgentQuestionProps) {
  const [selected, setSelected] = React.useState<string[]>([]);
  const [text, setText] = React.useState("");
  const canSubmit = selected.length > 0 || text.trim().length > 0;

  const toggle = (id: string) => {
    if (answered) return;
    if (multiple) setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
    else {
      setSelected([id]);
      if (!allowCustom) onSubmit?.({ optionIds: [id] });
    }
  };

  const showSubmit = multiple || allowCustom;

  return (
    <div className={cn("@container w-full rounded-kui border border-kui-border bg-kui-surface p-4 shadow-kui animate-kui-pop", className)}>
      <h3 className="text-[15px] font-semibold text-kui-fg">{question}</h3>
      {description ? <p className="mt-1 text-[13.5px] text-kui-fg-muted">{description}</p> : null}
      {options.length ? (
        <div role={multiple ? "group" : "radiogroup"} className="mt-3 grid gap-2 @md:grid-cols-2">
          {options.map((o) => {
            const active = selected.includes(o.id);
            return (
              <button
                key={o.id}
                type="button"
                role={multiple ? "checkbox" : "radio"}
                aria-checked={active}
                disabled={answered && !active}
                onClick={() => toggle(o.id)}
                className={cn(
                  "group flex cursor-pointer items-start gap-3 rounded-kui-sm border p-3 text-left transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kui-accent/40 disabled:cursor-default disabled:opacity-45",
                  active
                    ? "border-kui-accent bg-kui-accent-soft"
                    : "border-kui-border hover:border-kui-border-strong hover:bg-kui-surface-2",
                )}
              >
                {o.icon ? (
                  <span className="mt-0.5 shrink-0 text-kui-fg-muted [&_svg]:size-4">{o.icon}</span>
                ) : null}
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-kui-fg">{o.label}</span>
                  {o.description ? <span className="mt-0.5 block text-xs text-kui-fg-muted">{o.description}</span> : null}
                </span>
                <span
                  className={cn(
                    "mt-0.5 flex size-4 shrink-0 items-center justify-center border transition-colors",
                    multiple ? "rounded" : "rounded-full",
                    active ? "border-kui-accent bg-kui-accent text-kui-accent-fg" : "border-kui-border-strong",
                  )}
                >
                  {active ? <Check className="size-3" strokeWidth={3} /> : null}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
      {allowCustom && !answered ? (
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && canSubmit) onSubmit?.({ optionIds: selected, text: text.trim() || undefined });
          }}
          placeholder={customPlaceholder}
          className="mt-2 h-10 w-full rounded-kui-sm border border-kui-border bg-kui-surface px-3 text-sm text-kui-fg placeholder:text-kui-fg-subtle focus:border-kui-accent focus:ring-4 focus:ring-kui-accent/10 focus:outline-none"
        />
      ) : null}
      {(showSubmit || onSkip) && !answered ? (
        <div className="mt-3 flex items-center justify-end gap-2">
          {onSkip ? (
            <Button variant="ghost" size="sm" onClick={onSkip}>
              Skip
            </Button>
          ) : null}
          {showSubmit ? (
            <Button
              variant="accent"
              size="sm"
              disabled={!canSubmit}
              onClick={() => onSubmit?.({ optionIds: selected, text: text.trim() || undefined })}
            >
              {submitLabel}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
