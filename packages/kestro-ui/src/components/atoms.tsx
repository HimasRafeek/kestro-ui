import * as React from "react";
import { Activity, AudioLines, Braces, Brain, Clock, Coins, Eye, Gauge, Hash, TrendingDown, TrendingUp, Wrench, Zap } from "lucide-react";
import { cn } from "../lib/cn";
import { formatDuration, formatNumber } from "../lib/hooks";
import { AgentAvatar, agentStateTone, type AgentState } from "./agent-avatar";
import { StatusDot } from "./primitives";
import { formatCost } from "./metrics";
import { ModelBadge, type ModelCapability } from "./directory";
import { Sparkline } from "./hud";

/*
 * Tiny, inline building blocks for usage, time, models and agents.
 * They share one shape — a 20px chip — so they line up in any row.
 */

const chip = "inline-flex h-5 shrink-0 items-center gap-1 rounded-md bg-kui-surface-2 px-1.5 font-mono text-[10.5px] whitespace-nowrap text-kui-fg-muted tabular-nums [&_svg]:size-3 [&_svg]:text-kui-fg-subtle";

/* ---------------------------------- money --------------------------------- */

/** "$0.042" */
export function CostTag({ value, currency = "$", className }: { value: number; currency?: string; className?: string }) {
  return (
    <span className={cn(chip, className)} title={`Cost ${formatCost(value, currency)}`}>
      <Coins />
      {formatCost(value, currency)}
    </span>
  );
}

/* ---------------------------------- time ---------------------------------- */

export interface LatencyTagProps {
  ms: number;
  /** [good, slow] thresholds in ms. Default [800, 2500]. */
  thresholds?: [number, number];
  label?: string;
  className?: string;
}

/** "842ms" — green, ochre or red by threshold. */
export function LatencyTag({ ms, thresholds = [800, 2500], label, className }: LatencyTagProps) {
  const tone = ms <= thresholds[0] ? "success" : ms <= thresholds[1] ? "warning" : "danger";
  return (
    <span className={cn(chip, className)} title={label ?? "Latency"}>
      <StatusDot tone={tone} className="size-1.5" />
      {label ? <span className="text-kui-fg-subtle">{label}</span> : null}
      {formatDuration(ms / 1000)}
    </span>
  );
}

/** "4.2s" with a clock. */
export function DurationTag({ seconds, className }: { seconds: number; className?: string }) {
  return (
    <span className={cn(chip, className)} title="Duration">
      <Clock />
      {formatDuration(seconds)}
    </span>
  );
}

/** "48 tok/s" */
export function TokensPerSecond({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn(chip, className)} title="Output speed">
      <Gauge />
      {value < 10 ? value.toFixed(1) : Math.round(value)} tok/s
    </span>
  );
}

/** "1,204 req" */
export function RequestCount({ value, label = "req", className }: { value: number; label?: string; className?: string }) {
  return (
    <span className={cn(chip, className)} title="Requests">
      <Hash />
      {value < 10_000 ? value.toLocaleString() : formatNumber(value)} {label}
    </span>
  );
}

/* --------------------------------- trends --------------------------------- */

export interface TrendTagProps {
  /** Percent change, e.g. 12.5 or -3. */
  value: number;
  /** For metrics where lower is better (cost, latency). */
  invert?: boolean;
  className?: string;
}

/** "▲ 12.5%" — green when it's good news. */
export function TrendTag({ value, invert, className }: TrendTagProps) {
  const up = value >= 0;
  const good = invert ? !up : up;
  return (
    <span
      className={cn(
        "inline-flex h-5 shrink-0 items-center gap-0.5 rounded-md px-1.5 font-mono text-[10.5px] tabular-nums [&_svg]:size-3",
        value === 0 ? "bg-kui-surface-2 text-kui-fg-muted" : good ? "bg-kui-success-soft text-kui-success" : "bg-kui-danger-soft text-kui-danger",
        className,
      )}
    >
      {up ? <TrendingUp /> : <TrendingDown />}
      {Math.abs(value).toFixed(Math.abs(value) < 10 ? 1 : 0)}%
    </span>
  );
}

/* --------------------------------- meters --------------------------------- */

/** Mini ring + percent, e.g. context used. */
export function ContextPill({ used, limit, label = "ctx", className }: { used: number; limit: number; label?: string; className?: string }) {
  const pct = Math.min(1, used / Math.max(1, limit));
  const r = 5;
  const c = 2 * Math.PI * r;
  const color = pct > 0.9 ? "var(--kui-danger)" : pct > 0.75 ? "var(--kui-warning)" : "var(--kui-accent)";
  return (
    <span className={cn(chip, className)} title={`${used.toLocaleString()} / ${limit.toLocaleString()} tokens`}>
      <svg viewBox="0 0 14 14" className="!size-3 -rotate-90" aria-hidden>
        <circle cx="7" cy="7" r={r} fill="none" stroke="var(--kui-surface-3)" strokeWidth="2.5" />
        <circle cx="7" cy="7" r={r} fill="none" stroke={color} strokeWidth="2.5" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} />
      </svg>
      <span className="text-kui-fg-subtle">{label}</span>
      {Math.round(pct * 100)}%
    </span>
  );
}

/** Thin inline percentage bar. */
export function MiniBar({ value, max = 100, tone = "accent", width = 64, className }: { value: number; max?: number; tone?: "accent" | "success" | "warning" | "danger" | "info" | "muted"; width?: number; className?: string }) {
  const pct = Math.min(100, (value / Math.max(1, max)) * 100);
  const color = tone === "muted" ? "var(--kui-fg-subtle)" : `var(--kui-${tone})`;
  return (
    <span className={cn("inline-block h-1.5 shrink-0 overflow-hidden rounded-full bg-kui-surface-3 align-middle", className)} style={{ width }} role="meter" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      <span className="block h-full rounded-full transition-[width] duration-700 ease-kui-out" style={{ width: `${pct}%`, background: color }} />
    </span>
  );
}

/* --------------------------------- agents --------------------------------- */

/** Mini avatar + name + status dot. */
export function AgentChip({ name, state, avatar, className }: { name: string; state?: AgentState; avatar?: string; className?: string }) {
  return (
    <span className={cn("inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full border border-kui-border bg-kui-surface py-0.5 pr-2.5 pl-0.5 text-[12px] font-medium text-kui-fg", className)}>
      <AgentAvatar size="xs" appearance="monogram" name={name} src={avatar} className="[&>span:first-child]:rounded-full [&>span:first-child]:size-5" />
      {name}
      {state ? <StatusDot tone={agentStateTone[state]} pulse={state === "working" || state === "thinking"} className="size-1.5" /> : null}
    </span>
  );
}

/* --------------------------------- models --------------------------------- */

const capIcons: Record<ModelCapability, React.ReactNode> = {
  vision: <Eye />,
  tools: <Wrench />,
  reasoning: <Brain />,
  audio: <AudioLines />,
  json: <Braces />,
  fast: <Zap />,
};

/** Icon-only capability row with tooltips (vision, tools, reasoning…). */
export function CapabilityTags({ capabilities, className }: { capabilities: ModelCapability[]; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {capabilities.map((c) => (
        <span key={c} title={c[0].toUpperCase() + c.slice(1)} aria-label={c} className="flex size-5 items-center justify-center rounded-md bg-kui-surface-2 text-kui-fg-muted [&_svg]:size-3">
          {capIcons[c]}
        </span>
      ))}
    </span>
  );
}

/* ---------------------------------- rows ---------------------------------- */

export interface MessageMetaProps {
  model?: string;
  provider?: string;
  tokens?: number;
  cost?: number;
  /** Seconds. */
  duration?: number;
  /** Tokens per second. */
  speed?: number;
  currency?: string;
  className?: string;
}

/** One-line footer for an answer or run: model · tokens · cost · time · speed. */
export function MessageMeta({ model, provider, tokens, cost, duration, speed, currency, className }: MessageMetaProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {model ? <ModelBadge name={model} provider={provider} className="h-5 text-[11px]" /> : null}
      {tokens !== undefined ? (
        <span className={chip}>
          <Activity />
          {formatNumber(tokens)} tok
        </span>
      ) : null}
      {cost !== undefined ? <CostTag value={cost} currency={currency} /> : null}
      {duration !== undefined ? <DurationTag seconds={duration} /> : null}
      {speed !== undefined ? <TokensPerSecond value={speed} /> : null}
    </div>
  );
}

export interface StatTileProps {
  label: React.ReactNode;
  value: React.ReactNode;
  /** Percent change vs. previous period. */
  delta?: number;
  invertDelta?: boolean;
  /** Sparkline data. */
  trend?: number[];
  icon?: React.ReactNode;
  caption?: React.ReactNode;
  className?: string;
}

/** Dashboard KPI tile: label, big value, change and a sparkline. */
export function StatTile({ label, value, delta, invertDelta, trend, icon, caption, className }: StatTileProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-2 rounded-kui border border-kui-border bg-kui-surface p-4", className)}>
      <div className="flex items-center gap-1.5 text-[13px] text-kui-fg-muted [&_svg]:size-3.5 [&_svg]:text-kui-fg-subtle">
        {icon}
        <span className="truncate">{label}</span>
        {delta !== undefined ? <TrendTag value={delta} invert={invertDelta} className="ml-auto" /> : null}
      </div>
      <div className="flex items-end justify-between gap-3">
        <span className="truncate font-mono text-2xl font-semibold text-kui-fg tabular-nums">{value}</span>
        {trend?.length ? <Sparkline data={trend} width={80} height={28} tone={delta !== undefined && (invertDelta ? delta > 0 : delta < 0) ? "danger" : "accent"} /> : null}
      </div>
      {caption ? <span className="text-xs text-kui-fg-subtle">{caption}</span> : null}
    </div>
  );
}
