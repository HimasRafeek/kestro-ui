import * as React from "react";
import { ArrowRight, Check, ChevronDown, CircleDashed, Hand, Headset, Pause, X } from "lucide-react";
import { cn } from "../lib/cn";
import { formatDuration, formatNumber } from "../lib/hooks";
import { AgentAvatar, agentStateLabel, agentStateTone, type AgentAvatarProps, type AgentState } from "./agent-avatar";
import { Badge, Collapse, ShimmerText, Spinner, StatusDot, type Tone } from "./primitives";

/* -------------------------------------------------------------------------- */
/*                                  TaskPlan                                  */
/* -------------------------------------------------------------------------- */

export type StepStatus = "pending" | "running" | "waiting" | "complete" | "error" | "skipped";

export interface PlanStep {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  status: StepStatus;
  /** Seconds. */
  duration?: number;
  /** Rich content attached to the step (approval card, results, logs…). */
  content?: React.ReactNode;
  /** Collapsible details revealed on click. */
  details?: React.ReactNode;
}

export interface TaskPlanProps {
  steps: PlanStep[];
  title?: React.ReactNode;
  /** Show "3 of 6" + progress bar in the header. */
  showProgress?: boolean;
  className?: string;
}

const stepStatusText: Record<StepStatus, string> = {
  pending: "Pending",
  running: "In progress",
  waiting: "Waiting for you",
  complete: "Completed",
  error: "Failed",
  skipped: "Skipped",
};

function StepIcon({ status }: { status: StepStatus }) {
  const base = "relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full";
  switch (status) {
    case "complete":
      return (
        <span className={cn(base, "bg-kui-success text-white")}>
          <Check className="size-3.5" strokeWidth={3} />
        </span>
      );
    case "running":
      return (
        <span className={cn(base, "bg-kui-accent-soft ring-1 ring-kui-accent/40")}>
          <Spinner className="size-3.5 text-kui-accent" />
        </span>
      );
    case "waiting":
      return (
        <span className={cn(base, "bg-kui-warning-soft text-kui-warning ring-1 ring-kui-warning/40")}>
          <Pause className="size-3 fill-current" />
        </span>
      );
    case "error":
      return (
        <span className={cn(base, "bg-kui-danger text-white")}>
          <X className="size-3.5" strokeWidth={3} />
        </span>
      );
    case "skipped":
      return (
        <span className={cn(base, "bg-kui-surface text-kui-fg-subtle")}>
          <CircleDashed className="size-5" />
        </span>
      );
    default:
      return <span className={cn(base, "border-[1.5px] border-kui-border-strong bg-kui-surface")} />;
  }
}

function PlanStepRow({ step, last }: { step: PlanStep; last: boolean }) {
  const [open, setOpen] = React.useState(false);
  const done = step.status === "complete";
  const live = step.status === "running";
  return (
    <li className="relative flex gap-3.5 pb-5 last:pb-0">
      {!last ? (
        <span
          aria-hidden
          className={cn("absolute top-7 bottom-1 left-[11.25px] w-[1.5px] rounded-full", done ? "bg-kui-success/50" : "bg-kui-border-strong")}
        />
      ) : null}
      <StepIcon status={step.status} />
      <div className="min-w-0 flex-1 pt-0.5">
        <button
          type="button"
          disabled={!step.details}
          onClick={() => setOpen((o) => !o)}
          className={cn("flex w-full items-start gap-2 text-left", step.details && "cursor-pointer")}
        >
          <span className="min-w-0 flex-1">
            <span
              className={cn(
                "block text-sm font-medium",
                step.status === "pending" || step.status === "skipped" ? "text-kui-fg-muted" : "text-kui-fg",
              )}
            >
              {live ? <ShimmerText className="font-medium">{step.title}</ShimmerText> : step.title}
            </span>
            <span className="mt-0.5 block text-xs text-kui-fg-subtle">
              {step.description ?? stepStatusText[step.status]}
              {step.duration !== undefined ? ` · ${formatDuration(step.duration)}` : ""}
            </span>
          </span>
          {step.details ? (
            <ChevronDown className={cn("mt-0.5 size-4 shrink-0 text-kui-fg-subtle transition-transform", open && "rotate-180")} />
          ) : null}
        </button>
        {step.details ? (
          <Collapse open={open}>
            <div className="pt-2 text-[13px] text-kui-fg-muted">{step.details}</div>
          </Collapse>
        ) : null}
        {step.content ? <div className="mt-3">{step.content}</div> : null}
      </div>
    </li>
  );
}

/** Vertical timeline of an agent's plan / workflow steps. */
export function TaskPlan({ steps, title, showProgress = true, className }: TaskPlanProps) {
  const done = steps.filter((s) => s.status === "complete" || s.status === "skipped").length;
  const pct = steps.length ? (done / steps.length) * 100 : 0;
  return (
    <div className={cn("w-full", className)}>
      {title || showProgress ? (
        <div className="mb-4 flex items-center gap-3">
          {title ? <h3 className="text-[15px] font-semibold text-kui-fg">{title}</h3> : null}
          {showProgress ? (
            <div className="ml-auto flex items-center gap-2.5">
              <span className="text-xs text-kui-fg-subtle tabular-nums">
                {done} of {steps.length}
              </span>
              <span className="h-1.5 w-20 overflow-hidden rounded-full bg-kui-surface-3">
                <span className="block h-full rounded-full bg-kui-success transition-[width] duration-500" style={{ width: `${pct}%` }} />
              </span>
            </div>
          ) : null}
        </div>
      ) : null}
      <ol>
        {steps.map((s, i) => (
          <PlanStepRow key={s.id} step={s} last={i === steps.length - 1} />
        ))}
      </ol>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 AgentHeader                                */
/* -------------------------------------------------------------------------- */

export interface AgentHeaderProps {
  name: React.ReactNode;
  description?: React.ReactNode;
  state?: AgentState;
  /** Override the state label. */
  stateLabel?: React.ReactNode;
  avatar?: AgentAvatarProps;
  actions?: React.ReactNode;
  className?: string;
}

export function AgentHeader({ name, description, state = "online", stateLabel, avatar, actions, className }: AgentHeaderProps) {
  const live = state === "thinking" || state === "working";
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <AgentAvatar size="md" state={state} name={typeof name === "string" ? name : undefined} {...avatar} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h2 className="truncate text-[15px] font-semibold text-kui-fg">{name}</h2>
          <Badge tone={agentStateTone[state]} dot pulse={live}>
            {stateLabel ?? agentStateLabel[state]}
          </Badge>
        </div>
        {description ? <p className="truncate text-[13px] text-kui-fg-subtle">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-1.5">{actions}</div> : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 UsageMeter                                 */
/* -------------------------------------------------------------------------- */

export interface UsageMeterProps {
  /** Tokens (or credits) used. */
  used: number;
  limit: number;
  input?: number;
  output?: number;
  cached?: number;
  /** Cost in currency units, e.g. 0.046. */
  cost?: number;
  currency?: string;
  unit?: string;
  title?: React.ReactNode;
  /** "card" with breakdown, "bar" inline, or "ring" compact. */
  variant?: "card" | "bar" | "ring";
  className?: string;
}

export function UsageMeter({
  used,
  limit,
  input,
  output,
  cached,
  cost,
  currency = "$",
  unit = "tokens",
  title = "Usage",
  variant = "card",
  className,
}: UsageMeterProps) {
  const pct = Math.min(100, limit > 0 ? (used / limit) * 100 : 0);
  const tone = pct > 90 ? "bg-kui-danger" : pct > 70 ? "bg-kui-warning" : "bg-kui-accent";
  const stroke = pct > 90 ? "var(--kui-danger)" : pct > 70 ? "var(--kui-warning)" : "var(--kui-accent)";

  if (variant === "ring") {
    const r = 8;
    const c = 2 * Math.PI * r;
    return (
      <span
        className={cn("inline-flex items-center gap-1.5 text-xs text-kui-fg-subtle tabular-nums", className)}
        title={`${used.toLocaleString()} / ${limit.toLocaleString()} ${unit}`}
      >
        <svg viewBox="0 0 20 20" className="size-4 -rotate-90">
          <circle cx="10" cy="10" r={r} fill="none" stroke="var(--kui-surface-3)" strokeWidth="3" />
          <circle
            cx="10"
            cy="10"
            r={r}
            fill="none"
            stroke={stroke}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c - (pct / 100) * c}
            className="transition-[stroke-dashoffset] duration-500"
          />
        </svg>
        {Math.round(pct)}%
      </span>
    );
  }

  const bar = (
    <div className="h-2 w-full overflow-hidden rounded-full bg-kui-surface-3">
      <div className={cn("h-full rounded-full transition-[width] duration-500", tone)} style={{ width: `${pct}%` }} />
    </div>
  );

  if (variant === "bar") {
    return (
      <div className={cn("w-full space-y-1.5", className)}>
        <div className="flex justify-between text-xs text-kui-fg-subtle tabular-nums">
          <span>
            {formatNumber(used)} / {formatNumber(limit)} {unit}
          </span>
          <span>{Math.round(pct)}%</span>
        </div>
        {bar}
      </div>
    );
  }

  const rows: [string, React.ReactNode][] = [];
  if (input !== undefined) rows.push(["Input", input.toLocaleString()]);
  if (output !== undefined) rows.push(["Output", output.toLocaleString()]);
  if (cached !== undefined) rows.push(["Cached", cached.toLocaleString()]);
  if (cost !== undefined) rows.push(["Estimated cost", <span className="font-semibold text-kui-fg">{currency}{cost.toFixed(cost < 1 ? 3 : 2)}</span>]);

  return (
    <div className={cn("w-full rounded-kui border border-kui-border bg-kui-surface p-4", className)}>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h3 className="text-[15px] font-semibold text-kui-fg">{title}</h3>
        <span className="text-xs text-kui-fg-subtle tabular-nums">
          {used.toLocaleString()} / {limit.toLocaleString()} {unit}
        </span>
      </div>
      <div className="flex items-center gap-3">
        {bar}
        <span className="text-xs font-medium text-kui-fg-muted tabular-nums">{Math.round(pct)}%</span>
      </div>
      {rows.length ? (
        <dl className="mt-3 divide-y divide-kui-border">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between py-2 text-[13px]">
              <dt className="text-kui-fg-muted">{k}</dt>
              <dd className="text-kui-fg tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                ActivityFeed                                */
/* -------------------------------------------------------------------------- */

export interface ActivityItem {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  time?: React.ReactNode;
  icon?: React.ReactNode;
  tone?: Tone;
}

export function ActivityFeed({ items, className }: { items: ActivityItem[]; className?: string }) {
  return (
    <ul className={cn("w-full divide-y divide-kui-border", className)}>
      {items.map((it) => (
        <li key={it.id} className="flex items-start gap-3 py-2.5 animate-kui-in">
          <span
            className={cn(
              "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border border-kui-border bg-kui-surface-2 text-kui-fg-muted [&_svg]:size-3.5",
              it.tone === "danger" && "border-kui-danger/25 bg-kui-danger-soft text-kui-danger",
              it.tone === "success" && "border-kui-success/25 bg-kui-success-soft text-kui-success",
              it.tone === "accent" && "border-kui-accent/25 bg-kui-accent-soft text-kui-accent",
              it.tone === "warning" && "border-kui-warning/25 bg-kui-warning-soft text-kui-warning",
            )}
          >
            {it.icon ?? <StatusDot tone={it.tone ?? "neutral"} className="size-1.5" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-kui-fg">{it.title}</p>
            {it.description ? <p className="mt-0.5 text-xs text-kui-fg-subtle">{it.description}</p> : null}
          </div>
          {it.time ? <span className="shrink-0 pt-0.5 font-mono text-[11px] text-kui-fg-subtle">{it.time}</span> : null}
        </li>
      ))}
    </ul>
  );
}

/* -------------------------------------------------------------------------- */
/*                         Multi-agent: AgentHandoff                          */
/* -------------------------------------------------------------------------- */

export interface AgentRef {
  name: string;
  avatar?: AgentAvatarProps;
}

/** Inline divider showing control passing from one agent to another. */
export function AgentHandoff({
  from,
  to,
  reason,
  className,
}: {
  from: AgentRef;
  to: AgentRef;
  reason?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3 animate-kui-in", className)}>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-kui-border" />
      <div className="flex items-center gap-2 rounded-full border border-kui-border bg-kui-surface py-1 pr-3 pl-1 text-xs text-kui-fg-muted shadow-kui">
        <AgentAvatar size="xs" name={from.name} {...from.avatar} />
        <span className="font-medium text-kui-fg">{from.name}</span>
        <ArrowRight className="size-3 text-kui-fg-subtle" />
        <AgentAvatar size="xs" name={to.name} {...to.avatar} />
        <span className="font-medium text-kui-fg">{to.name}</span>
        {reason ? <span className="hidden text-kui-fg-subtle sm:inline">· {reason}</span> : null}
      </div>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-kui-border" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                          Multi-agent: AgentRoster                          */
/* -------------------------------------------------------------------------- */

export interface RosterAgent {
  id: string;
  name: string;
  role?: React.ReactNode;
  state: AgentState;
  /** What the agent is doing right now. */
  activity?: React.ReactNode;
  avatar?: AgentAvatarProps;
}

export function AgentRoster({
  agents,
  activeId,
  onSelect,
  className,
}: {
  agents: RosterAgent[];
  activeId?: string;
  onSelect?: (id: string) => void;
  className?: string;
}) {
  return (
    <ul className={cn("w-full space-y-1", className)}>
      {agents.map((a) => {
        const live = a.state === "thinking" || a.state === "working";
        return (
          <li key={a.id}>
            <button
              type="button"
              onClick={() => onSelect?.(a.id)}
              className={cn(
                "flex w-full cursor-pointer items-center gap-3 rounded-kui-sm p-2 text-left transition-colors hover:bg-kui-surface-2",
                activeId === a.id && "bg-kui-surface-2",
              )}
            >
              <AgentAvatar size="sm" name={a.name} state={a.state} {...a.avatar} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-[13px] font-medium text-kui-fg">{a.name}</span>
                  {a.role ? <span className="truncate text-[11px] text-kui-fg-subtle">{a.role}</span> : null}
                </span>
                <span className="block truncate text-xs text-kui-fg-subtle">
                  {a.activity ? live ? <ShimmerText>{a.activity}</ShimmerText> : a.activity : agentStateLabel[a.state]}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/* -------------------------------------------------------------------------- */
/*                         HandoffBanner (human agent)                        */
/* -------------------------------------------------------------------------- */

export interface HandoffBannerProps {
  status: "requested" | "connecting" | "connected" | "ended";
  /** Human agent name once connected. */
  agentName?: string;
  agentAvatar?: string;
  /** e.g. "~2 min" */
  eta?: React.ReactNode;
  onCancel?: () => void;
  className?: string;
}

/** Banner for escalating a conversation from AI to a human (support use-cases). */
export function HandoffBanner({ status, agentName, agentAvatar, eta, onCancel, className }: HandoffBannerProps) {
  const connected = status === "connected";
  return (
    <div
      role="status"
      className={cn(
        "flex w-full items-center gap-3 rounded-kui border px-3.5 py-3 animate-kui-pop",
        connected ? "border-kui-success/30 bg-kui-success-soft" : "border-kui-border bg-kui-surface",
        className,
      )}
    >
      {connected ? (
        <AgentAvatar size="sm" variant="user" name={agentName} src={agentAvatar} state="online" />
      ) : (
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-kui-accent-soft text-kui-accent">
          {status === "ended" ? <Hand className="size-4" /> : <Headset className="size-4" />}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-medium text-kui-fg">
          {status === "requested" && "You asked for a human"}
          {status === "connecting" && <ShimmerText>Connecting you to a support specialist…</ShimmerText>}
          {status === "connected" && `${agentName ?? "A specialist"} joined the conversation`}
          {status === "ended" && "The specialist left the conversation"}
        </p>
        <p className="text-xs text-kui-fg-subtle">
          {status === "connected"
            ? "You're now chatting with a person."
            : status === "ended"
              ? "The AI assistant will continue helping you."
              : eta
                ? <>Estimated wait {eta}</>
                : "We'll notify you as soon as someone is available."}
        </p>
      </div>
      {onCancel && (status === "connecting" || status === "requested") ? (
        <button type="button" onClick={onCancel} className="cursor-pointer text-xs font-medium text-kui-fg-muted hover:text-kui-fg">
          Cancel
        </button>
      ) : null}
    </div>
  );
}
