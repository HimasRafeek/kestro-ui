import * as React from "react";
import { Check, CircleAlert, Clock, RefreshCw, X } from "lucide-react";
import { cn } from "../lib/cn";
import { formatDuration } from "../lib/hooks";
import { useAnimationClock } from "../lib/audio";
import { useSmoothText } from "../lib/smooth";
import { Spinner } from "./primitives";
import { getToolIcon, type ToolStatus } from "./tool-call";
import type { CoreState } from "./hud";
import type { StepStatus } from "./agent";

const tones = {
  accent: "var(--kui-accent)",
  success: "var(--kui-success)",
  warning: "var(--kui-warning)",
  danger: "var(--kui-danger)",
  info: "var(--kui-info)",
  muted: "var(--kui-fg-subtle)",
};
type InstrumentTone = keyof typeof tones;

/* ========================================================================== */
/*                              AttitudeIndicator                             */
/* ========================================================================== */

export interface AttitudeIndicatorProps {
  state?: CoreState;
  /** Bezel pointer 0–100 (e.g. confidence, progress, context used). */
  value?: number;
  /** Live loudness 0–1 — tilts the horizon while listening/speaking. */
  level?: number;
  /** Large label drawn in the sky (e.g. "Awaiting approval"). */
  label?: React.ReactNode;
  /** Small caption under the label (e.g. "Executor / K-03"). */
  sublabel?: React.ReactNode;
  /** Third line, e.g. "Observe → Propose → Confirm". */
  caption?: React.ReactNode;
  /** Instrument markings color. Default "warning" (ochre). */
  tone?: InstrumentTone;
  size?: number;
  className?: string;
}

/**
 * An aviation attitude indicator re-imagined as an agent's presence:
 * the horizon steadies when idle, rolls gently while thinking, and responds
 * to audio while listening or speaking. The bezel pointer shows `value`.
 */
export function AttitudeIndicator({
  state = "idle",
  value,
  level = 0,
  label,
  sublabel,
  caption,
  tone = "warning",
  size = 420,
  className,
}: AttitudeIndicatorProps) {
  const moving = state === "thinking" || state === "working" || state === "listening" || state === "speaking";
  const t = useAnimationClock(moving);
  const lvl = Math.max(0, Math.min(1, level));
  const mark = tones[tone];
  const alert = state === "error" ? "var(--kui-danger)" : mark;

  let roll = 0;
  let pitch = 0;
  if (state === "thinking" || state === "working") {
    roll = Math.sin(t * 0.9) * 7;
    pitch = Math.sin(t * 0.6) * 4;
  } else if (state === "speaking" || state === "listening") {
    roll = Math.sin(t * 2.2) * lvl * 9;
    pitch = (lvl - 0.3) * -10;
  }

  const R = 100; // viewBox radius
  const face = 66;
  // Clock-style dial: 100/0 at the top, increasing clockwise.
  const polar = (v: number, r: number) => {
    const a = (v / 100) * Math.PI * 2 - Math.PI / 2;
    return { x: Math.cos(a) * r, y: Math.sin(a) * r };
  };

  return (
    <div className={cn("relative shrink-0 select-none", className)} style={{ width: size, height: size }} role="img" aria-label={`Agent ${state}`}>
      <svg viewBox="-100 -100 200 200" className="size-full overflow-visible">
        <defs>
          <clipPath id="kui-ai-face">
            <circle r={face} />
          </clipPath>
        </defs>
        {/* bezel */}
        <circle r={R - 2} fill="var(--kui-surface)" stroke="var(--kui-border-strong)" strokeWidth="1" />
        <circle r={face + 4} fill="none" stroke="var(--kui-border-strong)" strokeWidth="0.6" />
        {Array.from({ length: 50 }, (_, i) => {
          const v = i * 2;
          const major = v % 10 === 0;
          const p1 = polar(v, major ? 80 : 84);
          const p2 = polar(v, 90);
          return <line key={v} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={major ? "var(--kui-fg)" : "var(--kui-fg-subtle)"} strokeWidth={major ? 1.4 : 0.6} />;
        })}
        {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90].map((v) => {
          const p = polar(v, 72);
          return (
            <text key={v} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fontSize="7.5" fontFamily="var(--kui-font-display, inherit)" fontWeight="600" fill="var(--kui-fg)">
              {v === 0 ? 100 : v}
            </text>
          );
        })}
        {/* caution marks */}
        {[25, 75].map((v) => {
          const p1 = polar(v, 82);
          const p2 = polar(v, 91);
          return <line key={v} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={alert} strokeWidth="2.4" />;
        })}
        {/* top & bottom index triangles */}
        <path d="M0,-91 L-4.5,-99 L4.5,-99 Z" fill={alert} />
        <path d={`M0,${face - 4} L-4,${face + 4} L4,${face + 4} Z`} fill={mark} />

        {/* bezel pointer */}
        {value !== undefined ? (
          <g style={{ transform: `rotate(${(Math.max(0, Math.min(100, value)) / 100) * 360}deg)`, transition: "transform 700ms cubic-bezier(0.16,1,0.3,1)" }}>
            <path d="M0,-97 L-3.2,-89 L3.2,-89 Z" fill="var(--kui-fg)" />
          </g>
        ) : null}

        {/* attitude face */}
        <g clipPath="url(#kui-ai-face)">
          <g style={{ transform: `rotate(${roll}deg) translateY(${pitch}px)`, transition: "transform 180ms linear" }}>
            <rect x="-120" y="-120" width="240" height="120" fill="color-mix(in oklch, var(--kui-info) 30%, var(--kui-surface))" />
            <rect x="-120" y="0" width="240" height="120" fill="var(--kui-surface-2)" />
            <line x1="-120" y1="0" x2="120" y2="0" stroke={mark} strokeWidth="1.4" />
            {[10, 20].map((d) => (
              <line key={d} x1={-14} y1={d * 2} x2={14} y2={d * 2} stroke="var(--kui-fg-muted)" strokeWidth="0.7" />
            ))}
            {[10, 20].map((d) => (
              <g key={`l${d}`} fill="var(--kui-fg-muted)" fontSize="6" fontFamily="var(--kui-font-display, inherit)">
                <text x={-24} y={d * 2 + 2} textAnchor="end">−{d}</text>
                <text x={24} y={d * 2 + 2}>−{d}</text>
              </g>
            ))}
            {/* bank wedges */}
            <path d={`M${-face},-12 L${-face + 14},-12 L${-face + 14},0 L${-face},0 Z`} fill="color-mix(in oklch, var(--kui-fg) 8%, transparent)" />
            <path d={`M${face},-12 L${face - 14},-12 L${face - 14},0 L${face},0 Z`} fill="color-mix(in oklch, var(--kui-fg) 8%, transparent)" />
          </g>
          {/* vertical ladder */}
          <line x1="0" y1="-6" x2="0" y2="58" stroke="var(--kui-fg-muted)" strokeWidth="0.7" />
          {[14, 28, 42].map((y) => (
            <line key={y} x1="-5" y1={y} x2="5" y2={y} stroke="var(--kui-fg-muted)" strokeWidth="0.7" />
          ))}
        </g>
        <circle r={face} fill="none" stroke="var(--kui-border-strong)" strokeWidth="1" />
        {/* aircraft symbol */}
        <rect x="-3.2" y="-3.2" width="6.4" height="6.4" fill={alert} stroke="var(--kui-surface)" strokeWidth="0.8" />
      </svg>

      {label || sublabel || caption ? (
        <div className="pointer-events-none absolute inset-x-[22%] top-[24%] flex flex-col items-center text-center">
          {label ? (
            <div className="font-kui-display text-[length:var(--kui-ai-label)] leading-[1.02] font-extrabold tracking-tight text-kui-fg uppercase [font-stretch:125%]" style={{ ["--kui-ai-label" as string]: `${size * 0.062}px` }}>
              {label}
            </div>
          ) : null}
          {sublabel ? <div className="mt-1.5 font-mono text-[length:var(--kui-ai-sub)] tracking-[0.25em] text-kui-fg-muted uppercase" style={{ ["--kui-ai-sub" as string]: `${Math.max(9, size * 0.026)}px` }}>{sublabel}</div> : null}
          {caption ? <div className="mt-1 font-mono text-[length:var(--kui-ai-cap)] tracking-[0.18em] text-kui-fg-muted uppercase" style={{ ["--kui-ai-cap" as string]: `${Math.max(8, size * 0.021)}px` }}>{caption}</div> : null}
        </div>
      ) : null}
    </div>
  );
}

/* ========================================================================== */
/*                                   RunCard                                  */
/* ========================================================================== */

export type RunStatus = "running" | "waiting" | "complete" | "failed" | "paused";

export interface RunStep {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  status: StepStatus;
  /** Seconds. */
  duration?: number;
  /** Rich content under the step — e.g. a <ToolCall/> or <ToolApproval/>. */
  content?: React.ReactNode;
}

export interface RunCardProps {
  title: React.ReactNode;
  runId?: React.ReactNode;
  status?: RunStatus;
  steps: RunStep[];
  /** Header actions. */
  actions?: React.ReactNode;
  className?: string;
}

const runStatus: Record<RunStatus, { label: string; cls: string; icon: React.ReactNode }> = {
  running: { label: "Running", cls: "bg-kui-info-soft text-kui-info border-kui-info/25", icon: <Spinner className="size-3 text-current" /> },
  waiting: { label: "Awaiting approval", cls: "bg-kui-warning-soft text-kui-warning border-kui-warning/30", icon: <CircleAlert /> },
  complete: { label: "Complete", cls: "bg-kui-success-soft text-kui-success border-kui-success/25", icon: <Check /> },
  failed: { label: "Failed", cls: "bg-kui-danger-soft text-kui-danger border-kui-danger/25", icon: <X /> },
  paused: { label: "Paused", cls: "bg-kui-surface-2 text-kui-fg-muted border-kui-border", icon: <Clock /> },
};

function RunStepMarker({ status }: { status: StepStatus }) {
  const base = "relative z-10 flex size-5 shrink-0 items-center justify-center rounded-full";
  if (status === "complete") return <span className={cn(base, "bg-kui-fg text-kui-bg")}><Check className="size-3" strokeWidth={3} /></span>;
  if (status === "error") return <span className={cn(base, "bg-kui-danger text-white")}><X className="size-3" strokeWidth={3} /></span>;
  if (status === "running") return <span className={cn(base, "border-2 border-kui-info bg-kui-surface")}><span className="size-1.5 rounded-full bg-kui-info animate-kui-glow" /></span>;
  if (status === "waiting") return <span className={cn(base, "border-2 border-kui-accent bg-kui-surface")} />;
  return <span className={cn(base, "border-[1.5px] border-kui-border-strong bg-kui-surface")} />;
}

/** A single agent run: title, run id, status chip and a step timeline with rich step content. */
export function RunCard({ title, runId, status = "running", steps, actions, className }: RunCardProps) {
  const st = runStatus[status];
  return (
    <div className={cn("w-full overflow-hidden rounded-kui border border-kui-border-strong bg-kui-surface", className)}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-kui-border px-5 py-3.5">
        <h3 className="font-kui-display text-lg leading-tight font-extrabold tracking-tight text-kui-fg [font-stretch:125%]">{title}</h3>
        {runId ? <span className="border-l border-kui-border pl-4 font-mono text-xs tracking-wider text-kui-fg-muted uppercase">{runId}</span> : null}
        <span className="ml-auto flex items-center gap-2">
          {actions}
          <span key={status} className={cn("inline-flex h-7 items-center gap-1.5 rounded-md border px-2.5 font-mono text-[11px] font-medium animate-kui-pop [&_svg]:size-3.5", st.cls)}>
            {st.icon}
            {st.label}
          </span>
        </span>
      </div>
      <ol className="px-5 py-4">
        {steps.map((s, i) => (
          <li key={s.id} className="relative flex gap-4 pb-5 last:pb-0 animate-kui-in" style={{ animationDelay: `${i * 70}ms` }}>
            {i < steps.length - 1 ? <span aria-hidden className="absolute top-6 bottom-0 left-[9.5px] w-px bg-kui-border-strong" /> : null}
            <span className="pt-0.5">
              <RunStepMarker status={s.status} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className={cn("text-[15px] font-semibold", s.status === "pending" ? "text-kui-fg-muted" : "text-kui-fg")}>{s.title}</p>
                  {s.description ? <p className="mt-0.5 text-[13.5px] text-kui-fg-muted">{s.description}</p> : null}
                </div>
                {s.duration !== undefined ? <span className="shrink-0 pt-0.5 font-mono text-xs text-kui-fg-subtle tabular-nums">{formatDuration(s.duration)}</span> : null}
              </div>
              {s.content ? <div className="mt-3">{s.content}</div> : null}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ========================================================================== */
/*                                TelemetryChart                              */
/* ========================================================================== */

export interface TelemetryChartProps {
  label: React.ReactNode;
  /** Big readout; defaults to the last data point. */
  value?: React.ReactNode;
  unit?: React.ReactNode;
  data: number[];
  /** X-axis labels (shown at even intervals). */
  xLabels?: string[];
  /** Y-axis tick count. Default 4. */
  yTicks?: number;
  min?: number;
  max?: number;
  /** Format y-axis labels. */
  formatY?: (v: number) => string;
  tone?: InstrumentTone;
  height?: number;
  className?: string;
}

/** Readout + gridded line chart for latency, throughput, success rate, cost… */
export function TelemetryChart({
  label,
  value,
  unit,
  data,
  xLabels,
  yTicks = 4,
  min: minProp,
  max: maxProp,
  formatY = (v) => (Math.abs(v) >= 1000 ? v.toLocaleString() : String(Math.round(v * 10) / 10)),
  tone = "warning",
  height = 96,
  className,
}: TelemetryChartProps) {
  const W = 220;
  const H = height;
  const padL = 34;
  const padB = xLabels?.length ? 14 : 4;
  const lo = minProp ?? Math.min(...data);
  const hi = maxProp ?? Math.max(...data);
  const span = hi - lo || 1;
  const x = (i: number) => padL + (i / Math.max(1, data.length - 1)) * (W - padL - 4);
  const y = (v: number) => 4 + (1 - (v - lo) / span) * (H - padB - 8);
  const pts = data.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const color = tones[tone];
  const last = data[data.length - 1];
  return (
    <div className={cn("grid grid-cols-[auto_1fr] items-center gap-4", className)}>
      <div className="min-w-24">
        <div className="font-kui-display text-[11px] font-bold tracking-[0.12em] text-kui-fg-muted uppercase [font-stretch:115%]">{label}</div>
        <div className="mt-1 font-mono text-2xl font-semibold tabular-nums" style={{ color }}>
          {value ?? last}
          {unit ? <span className="ml-1 text-base">{unit}</span> : null}
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full overflow-visible" aria-hidden>
        {Array.from({ length: yTicks + 1 }, (_, i) => {
          const v = lo + (span * i) / yTicks;
          const yy = y(v);
          return (
            <g key={i}>
              <line x1={padL} x2={W - 4} y1={yy} y2={yy} stroke="var(--kui-border)" strokeWidth="0.6" />
              <text x={padL - 4} y={yy} textAnchor="end" dominantBaseline="central" fontSize="7" fill="var(--kui-fg-subtle)" fontFamily="var(--font-mono, monospace)">
                {formatY(v)}
              </text>
            </g>
          );
        })}
        {xLabels?.map((l, i) => {
          const xx = padL + (i / Math.max(1, xLabels.length - 1)) * (W - padL - 4);
          return (
            <g key={l + i}>
              <line x1={xx} x2={xx} y1={4} y2={H - padB} stroke="var(--kui-border)" strokeWidth="0.6" />
              <text x={xx} y={H - 2} textAnchor="middle" fontSize="7" fill="var(--kui-fg-subtle)" fontFamily="var(--font-mono, monospace)">
                {l}
              </text>
            </g>
          );
        })}
        <polyline points={pts} fill="none" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
        {data.map((v, i) => (i % 3 === 0 ? <circle key={i} cx={x(i)} cy={y(v)} r="1.3" fill={color} /> : null))}
        <circle cx={x(data.length - 1)} cy={y(last)} r="2.6" fill={color} />
      </svg>
    </div>
  );
}

/* ========================================================================== */
/*                                 ToolCallRow                                */
/* ========================================================================== */

export interface ToolCallRowProps {
  name: string;
  status: ToolStatus | "waiting";
  icon?: React.ReactNode;
  /** 0–100 shows a progress bar while running. */
  progress?: number;
  durationMs?: number;
  detail?: React.ReactNode;
  onRetry?: () => void;
  className?: string;
}

const rowStatus = {
  pending: { label: "Pending", cls: "bg-kui-surface-2 text-kui-fg-muted", icon: <Clock /> },
  running: { label: "Running", cls: "bg-kui-info-soft text-kui-info", icon: null },
  waiting: { label: "Waiting for approval", cls: "bg-kui-warning-soft text-kui-warning", icon: <Clock /> },
  success: { label: "Complete", cls: "bg-kui-success-soft text-kui-success", icon: <Check /> },
  error: { label: "Failed", cls: "bg-kui-danger-soft text-kui-danger", icon: <X /> },
  denied: { label: "Denied", cls: "bg-kui-warning-soft text-kui-warning", icon: <X /> },
} as const;

/** Compact, single-line tool status — for dense lists and dashboards. */
export function ToolCallRow({ name, status, icon, progress, durationMs, detail, onRetry, className }: ToolCallRowProps) {
  const st = rowStatus[status];
  return (
    <div className={cn("flex min-h-11 items-center gap-3 border-b border-kui-border py-2 last:border-0", className)}>
      <span className="text-kui-fg-muted [&_svg]:size-4">{icon ?? getToolIcon(name)}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-mono text-[13px] text-kui-fg">{name}</span>
        {detail ? <span className="block truncate text-xs text-kui-fg-subtle">{detail}</span> : null}
      </span>
      <span key={status} className={cn("inline-flex h-6 shrink-0 items-center gap-1 rounded-md px-2 font-mono text-[11px] animate-kui-pop [&_svg]:size-3", st.cls)}>
        {st.icon}
        {st.label}
      </span>
      {status === "running" && progress !== undefined ? (
        <span className="flex w-28 shrink-0 items-center gap-2">
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-kui-surface-3">
            <span className="block h-full rounded-full bg-kui-fg-muted transition-[width] duration-500 ease-kui-out" style={{ width: `${progress}%` }} />
          </span>
          <span className="w-8 text-right font-mono text-[11px] text-kui-fg-muted tabular-nums">{Math.round(progress)}%</span>
        </span>
      ) : durationMs !== undefined && status === "success" ? (
        <span className="w-16 shrink-0 text-right font-mono text-[11px] text-kui-fg-subtle tabular-nums">{formatDuration(durationMs / 1000)}</span>
      ) : null}
      {status === "error" && onRetry ? (
        <button type="button" onClick={onRetry} className="inline-flex h-6 shrink-0 cursor-pointer items-center gap-1 rounded-md border border-kui-border px-2 text-[11px] font-medium text-kui-fg-muted hover:text-kui-fg">
          <RefreshCw className="size-3" /> Retry
        </button>
      ) : null}
    </div>
  );
}

/* ========================================================================== */
/*                                SegmentedMeter                              */
/* ========================================================================== */

export interface SegmentedMeterProps {
  value: number;
  max: number;
  segments?: number;
  label?: React.ReactNode;
  /** Right-side caption; defaults to "NN% used". */
  caption?: React.ReactNode;
  /** Text under the bar, e.g. "12,480 / 32,000 tokens". */
  detail?: React.ReactNode;
  tone?: InstrumentTone;
  className?: string;
}

/** Block-style meter for context windows, quotas and budgets. */
export function SegmentedMeter({ value, max, segments = 20, label, caption, detail, tone = "muted", className }: SegmentedMeterProps) {
  const pct = Math.max(0, Math.min(1, max ? value / max : 0));
  const filled = Math.round(pct * segments);
  const color = pct > 0.9 ? tones.danger : pct > 0.75 ? tones.warning : tone === "muted" ? "var(--kui-fg-muted)" : tones[tone];
  return (
    <div className={cn("w-full", className)}>
      {label ? <div className="mb-2 font-mono text-[11px] tracking-wider text-kui-fg-subtle uppercase">{label}</div> : null}
      <div className="flex items-center gap-3">
        <div className="flex flex-1 gap-[3px]" role="meter" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
          {Array.from({ length: segments }, (_, i) => (
            <span
              key={i}
              className="h-3.5 flex-1 rounded-[2px] transition-colors duration-300"
              style={{ background: i < filled ? color : "var(--kui-surface-3)", transitionDelay: `${i * 15}ms` }}
            />
          ))}
        </div>
        <span className="shrink-0 font-mono text-xs text-kui-fg-muted tabular-nums">{caption ?? `${Math.round(pct * 100)}% used`}</span>
      </div>
      {detail ? <div className="mt-1.5 font-mono text-xs text-kui-fg-muted tabular-nums">{detail}</div> : null}
    </div>
  );
}

/* ========================================================================== */
/*                                   EventLog                                 */
/* ========================================================================== */

export interface LogEvent {
  id: string;
  time: string;
  /** Event name, e.g. "run.started", "approval.requested". */
  event: string;
  fields?: Record<string, string | number | boolean>;
  tone?: InstrumentTone;
  /** Reveal fields with a typewriter effect. */
  streaming?: boolean;
}

export interface EventLogProps {
  events: LogEvent[];
  /** Footer prompt, e.g. "Awaiting operator input". */
  footer?: React.ReactNode;
  className?: string;
}

function fieldText(fields?: LogEvent["fields"]) {
  if (!fields) return "";
  return Object.entries(fields)
    .map(([k, v]) => `${k}=${typeof v === "string" ? JSON.stringify(v) : String(v)}`)
    .join("\n");
}

function EventRow({ e }: { e: LogEvent }) {
  const { text } = useSmoothText(fieldText(e.fields), !!e.streaming, { minCps: 220, catchUp: 0.3 });
  return (
    <li className="grid grid-cols-[auto_1fr] gap-x-4 border-b border-kui-border py-2.5 last:border-0 animate-kui-reveal">
      <span className="font-mono text-xs text-kui-fg-subtle tabular-nums">{e.time}</span>
      <div className="min-w-0 font-mono text-[12.5px]">
        <div className="font-semibold" style={{ color: e.tone ? tones[e.tone] : "var(--kui-fg)" }}>{e.event}</div>
        {text ? <pre className="mt-0.5 pl-1 whitespace-pre-wrap text-kui-fg-muted [overflow-wrap:anywhere]">{text}</pre> : null}
      </div>
    </li>
  );
}

/** Structured event stream (`event` + `key=value` fields) for agent runs and audits. */
export function EventLog({ events, footer, className }: EventLogProps) {
  return (
    <div className={cn("w-full", className)}>
      <ul>
        {events.map((e) => (
          <EventRow key={e.id} e={e} />
        ))}
      </ul>
      {footer ? <div className="pt-2.5 font-mono text-[12.5px] text-kui-warning">› {footer}</div> : null}
    </div>
  );
}
