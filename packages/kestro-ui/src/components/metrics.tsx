import * as React from "react";
import { Coins, TriangleAlert } from "lucide-react";
import { cn } from "../lib/cn";
import { formatNumber } from "../lib/hooks";

/* -------------------------------------------------------------------------- */
/*                                   shared                                   */
/* -------------------------------------------------------------------------- */

export type MetricTone = "accent" | "info" | "success" | "warning" | "danger" | "muted" | "ink";

const toneColor: Record<MetricTone, string> = {
  accent: "var(--kui-accent)",
  info: "var(--kui-info)",
  success: "var(--kui-success)",
  warning: "var(--kui-warning)",
  danger: "var(--kui-danger)",
  muted: "var(--kui-fg-subtle)",
  ink: "var(--kui-fg-muted)",
};

const seriesTones: MetricTone[] = ["accent", "info", "success", "warning", "ink", "muted"];

export function formatCost(value: number, currency = "$") {
  if (value === 0) return `${currency}0`;
  if (value < 0.01) return `${currency}${value.toFixed(4)}`;
  if (value < 1) return `${currency}${value.toFixed(3)}`;
  return `${currency}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Price per 1M tokens. */
export interface TokenPricing {
  input: number;
  output: number;
  cached?: number;
  reasoning?: number;
}

/* ========================================================================== */
/*                                 TokenUsage                                 */
/* ========================================================================== */

export interface TokenUsageProps {
  input: number;
  output: number;
  /** Input tokens served from cache. */
  cached?: number;
  /** Hidden reasoning / thinking tokens. */
  reasoning?: number;
  /** Pricing per 1M tokens — used to compute cost when `cost` is omitted. */
  pricing?: TokenPricing;
  /** Total cost override. */
  cost?: number;
  currency?: string;
  title?: React.ReactNode;
  /** Small caption, e.g. the model name or period. */
  caption?: React.ReactNode;
  className?: string;
}

/** Token breakdown (input, cached, reasoning, output) with per-kind cost. */
export function TokenUsage({ input, output, cached = 0, reasoning = 0, pricing, cost, currency = "$", title = "Token usage", caption, className }: TokenUsageProps) {
  const freshInput = Math.max(0, input - cached);
  const rows = [
    { id: "input", label: "Input", tokens: freshInput, tone: "info" as MetricTone, price: pricing?.input },
    { id: "cached", label: "Cached input", tokens: cached, tone: "success" as MetricTone, price: pricing?.cached ?? (pricing ? pricing.input * 0.1 : undefined) },
    { id: "reasoning", label: "Reasoning", tokens: reasoning, tone: "warning" as MetricTone, price: pricing?.reasoning ?? pricing?.output },
    { id: "output", label: "Output", tokens: output, tone: "accent" as MetricTone, price: pricing?.output },
  ].filter((r) => r.tokens > 0 || r.id === "input" || r.id === "output");
  const total = rows.reduce((a, r) => a + r.tokens, 0);
  const rowCost = (r: (typeof rows)[number]) => (r.price !== undefined ? (r.tokens / 1_000_000) * r.price : undefined);
  const computed = rows.reduce((a, r) => a + (rowCost(r) ?? 0), 0);
  const totalCost = cost ?? (pricing ? computed : undefined);

  return (
    <div className={cn("w-full rounded-kui border border-kui-border bg-kui-surface p-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[13px] font-medium text-kui-fg-muted">{title}</h3>
          <p className="mt-1 font-mono text-2xl font-semibold text-kui-fg tabular-nums">
            {total.toLocaleString()} <span className="text-sm font-normal text-kui-fg-subtle">tokens</span>
          </p>
          {caption ? <p className="mt-0.5 text-xs text-kui-fg-subtle">{caption}</p> : null}
        </div>
        {totalCost !== undefined ? (
          <div className="text-right">
            <p className="text-[13px] font-medium text-kui-fg-muted">Cost</p>
            <p className="mt-1 font-mono text-2xl font-semibold text-kui-fg tabular-nums">{formatCost(totalCost, currency)}</p>
          </div>
        ) : null}
      </div>
      <div className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-kui-surface-3" role="img" aria-label="Token breakdown">
        {rows.map((r) =>
          r.tokens > 0 ? (
            <span
              key={r.id}
              className="h-full transition-[width] duration-700 ease-kui-out not-last:border-r-2 not-last:border-kui-surface"
              style={{ width: `${(r.tokens / Math.max(1, total)) * 100}%`, background: toneColor[r.tone] }}
            />
          ) : null,
        )}
      </div>
      <dl className="mt-3 divide-y divide-kui-border">
        {rows.map((r) => {
          const c = rowCost(r);
          return (
            <div key={r.id} className="flex items-center gap-2.5 py-2 text-[13px]">
              <span className="size-2 shrink-0 rounded-full" style={{ background: toneColor[r.tone] }} />
              <dt className="flex-1 text-kui-fg-muted">{r.label}</dt>
              <dd className="font-mono text-kui-fg tabular-nums">{r.tokens.toLocaleString()}</dd>
              <dd className="w-12 text-right font-mono text-xs text-kui-fg-subtle tabular-nums">{total ? Math.round((r.tokens / total) * 100) : 0}%</dd>
              {pricing ? <dd className="w-20 text-right font-mono text-xs text-kui-fg-muted tabular-nums">{c !== undefined ? formatCost(c, currency) : "—"}</dd> : null}
            </div>
          );
        })}
      </dl>
    </div>
  );
}

/* ========================================================================== */
/*                                ContextWindow                               */
/* ========================================================================== */

export interface ContextSegment {
  id: string;
  label: React.ReactNode;
  tokens: number;
  tone?: MetricTone;
}

export interface ContextWindowProps {
  segments: ContextSegment[];
  /** Model context size in tokens. */
  limit: number;
  title?: React.ReactNode;
  /** "bar" (default) or "grid" (100 cells, one per 1%). */
  variant?: "bar" | "grid";
  /** Usage ratio (0–1) from which to warn. Default 0.8. */
  warnAt?: number;
  /** Warning text; receives the free token count. */
  warning?: (free: number) => React.ReactNode;
  className?: string;
}

/** What's filling the model's context window — system prompt, history, tools, files — and how much is left. */
export function ContextWindow({
  segments,
  limit,
  title = "Context window",
  variant = "bar",
  warnAt = 0.8,
  warning = (free) => `Only ${formatNumber(free)} tokens left — older messages will be summarized soon.`,
  className,
}: ContextWindowProps) {
  const used = segments.reduce((a, s) => a + s.tokens, 0);
  const ratio = Math.min(1, used / Math.max(1, limit));
  const free = Math.max(0, limit - used);
  const colored = segments.map((s, i) => ({ ...s, color: toneColor[s.tone ?? seriesTones[i % seriesTones.length]] }));

  // grid: allocate 100 cells proportionally
  const cells: string[] = [];
  if (variant === "grid") {
    let acc = 0;
    colored.forEach((s) => {
      const n = Math.round(((acc + s.tokens) / limit) * 100) - Math.round((acc / limit) * 100);
      for (let i = 0; i < n && cells.length < 100; i++) cells.push(s.color);
      acc += s.tokens;
    });
    while (cells.length < 100) cells.push("");
  }

  return (
    <div className={cn("w-full rounded-kui border border-kui-border bg-kui-surface p-4", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[13px] font-medium text-kui-fg">{title}</h3>
        <span className="font-mono text-xs text-kui-fg-muted tabular-nums">
          {formatNumber(used)} / {formatNumber(limit)} · {Math.round(ratio * 100)}%
        </span>
      </div>

      {variant === "grid" ? (
        <div className="mt-3 grid grid-cols-20 gap-[3px]" role="img" aria-label={`${Math.round(ratio * 100)}% of context used`}>
          {cells.map((c, i) => (
            <span
              key={i}
              className="aspect-square rounded-[2px] transition-colors duration-500"
              style={{ background: c || "var(--kui-surface-3)", transitionDelay: `${i * 6}ms` }}
            />
          ))}
        </div>
      ) : (
        <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-kui-surface-3" role="img" aria-label={`${Math.round(ratio * 100)}% of context used`}>
          {colored.map((s) => (
            <span
              key={s.id}
              title={`${typeof s.label === "string" ? s.label : s.id}: ${s.tokens.toLocaleString()}`}
              className="h-full transition-[width] duration-700 ease-kui-out not-last:border-r-2 not-last:border-kui-surface"
              style={{ width: `${(s.tokens / limit) * 100}%`, background: s.color }}
            />
          ))}
        </div>
      )}

      <ul className="mt-3 grid gap-x-4 gap-y-1.5 text-[13px] sm:grid-cols-2">
        {colored.map((s) => (
          <li key={s.id} className="flex items-center gap-2">
            <span className="size-2 shrink-0 rounded-[2px]" style={{ background: s.color }} />
            <span className="min-w-0 flex-1 truncate text-kui-fg-muted">{s.label}</span>
            <span className="font-mono text-xs text-kui-fg tabular-nums">{formatNumber(s.tokens)}</span>
          </li>
        ))}
        <li className="flex items-center gap-2">
          <span className="size-2 shrink-0 rounded-[2px] bg-kui-surface-3 ring-1 ring-kui-border-strong ring-inset" />
          <span className="flex-1 text-kui-fg-subtle">Free</span>
          <span className="font-mono text-xs text-kui-fg-subtle tabular-nums">{formatNumber(free)}</span>
        </li>
      </ul>

      {ratio >= warnAt ? (
        <p className="mt-3 flex items-start gap-2 rounded-kui-sm bg-kui-warning-soft px-3 py-2 text-xs text-kui-warning animate-kui-in">
          <TriangleAlert className="mt-px size-3.5 shrink-0" />
          {warning(free)}
        </p>
      ) : null}
    </div>
  );
}

/* ========================================================================== */
/*                                TokenCounter                                */
/* ========================================================================== */

export interface TokenCounterProps {
  tokens: number;
  cost?: number;
  currency?: string;
  /** Optional detail shown on hover, e.g. "812 in · 405 out". */
  detail?: string;
  className?: string;
}

/** Inline "1.2k tok · $0.004" chip for messages, tool calls and runs. */
export function TokenCounter({ tokens, cost, currency = "$", detail, className }: TokenCounterProps) {
  return (
    <span
      title={detail}
      className={cn("inline-flex h-5 items-center gap-1 rounded-md bg-kui-surface-2 px-1.5 font-mono text-[10.5px] text-kui-fg-muted tabular-nums", className)}
    >
      <Coins className="size-3 text-kui-fg-subtle" />
      {formatNumber(tokens)} tok
      {cost !== undefined ? <span className="text-kui-fg-subtle">· {formatCost(cost, currency)}</span> : null}
    </span>
  );
}

/* ========================================================================== */
/*                                 UsageChart                                 */
/* ========================================================================== */

export interface UsageSeries {
  id: string;
  label: string;
  tone?: MetricTone;
}

export interface UsagePoint {
  label: string;
  values: Record<string, number>;
}

export interface UsageChartProps {
  data: UsagePoint[];
  series: UsageSeries[];
  title?: React.ReactNode;
  /** Format values (axis + tooltip). Default compact number. */
  format?: (v: number) => string;
  height?: number;
  className?: string;
}

/** Stacked bar chart of usage over time — tokens or spend per day, split by model or agent. */
export function UsageChart({ data, series, title, format = formatNumber, height = 180, className }: UsageChartProps) {
  const [hover, setHover] = React.useState<number | null>(null);
  const totals = data.map((d) => series.reduce((a, s) => a + (d.values[s.id] ?? 0), 0));
  const max = Math.max(1, ...totals);
  const nice = (() => {
    const p = Math.pow(10, Math.floor(Math.log10(max)));
    return Math.ceil(max / p) * p;
  })();
  const colors = series.map((s, i) => toneColor[s.tone ?? seriesTones[i % seriesTones.length]]);
  const grand = totals.reduce((a, b) => a + b, 0);

  return (
    <div className={cn("w-full rounded-kui border border-kui-border bg-kui-surface p-4", className)}>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <div>
          {title ? <h3 className="text-[13px] font-medium text-kui-fg-muted">{title}</h3> : null}
          <p className="font-mono text-xl font-semibold text-kui-fg tabular-nums">{format(hover !== null ? totals[hover] : grand)}</p>
          <p className="text-xs text-kui-fg-subtle">{hover !== null ? data[hover].label : `Total · ${data.length} periods`}</p>
        </div>
        <ul className="flex flex-wrap gap-3 text-xs text-kui-fg-muted">
          {series.map((s, i) => (
            <li key={s.id} className="flex items-center gap-1.5">
              <span className="size-2 rounded-[2px]" style={{ background: colors[i] }} />
              {s.label}
              {hover !== null ? <span className="font-mono text-kui-fg tabular-nums">{format(data[hover].values[s.id] ?? 0)}</span> : null}
            </li>
          ))}
        </ul>
      </div>
      <div className="relative flex gap-2" style={{ height }}>
        <div className="flex w-10 shrink-0 flex-col justify-between pb-5 text-right font-mono text-[10px] text-kui-fg-subtle tabular-nums">
          <span>{format(nice)}</span>
          <span>{format(nice / 2)}</span>
          <span>0</span>
        </div>
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-x-0 top-0 bottom-5 flex flex-col justify-between">
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-px bg-kui-border" />
            ))}
          </div>
          <div className="absolute inset-x-0 top-0 bottom-5 flex items-end gap-[3px]" onMouseLeave={() => setHover(null)}>
            {data.map((d, i) => (
              <button
                key={d.label + i}
                type="button"
                aria-label={`${d.label}: ${format(totals[i])}`}
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                className="group flex h-full min-w-0 flex-1 cursor-default flex-col justify-end focus-visible:outline-none"
              >
                <span
                  className={cn("flex w-full flex-col-reverse overflow-hidden rounded-t-[3px] transition-[height,opacity] duration-500 ease-kui-out", hover !== null && hover !== i && "opacity-45")}
                  style={{ height: `${(totals[i] / nice) * 100}%` }}
                >
                  {series.map((s, j) => (
                    <span key={s.id} style={{ height: `${totals[i] ? ((d.values[s.id] ?? 0) / totals[i]) * 100 : 0}%`, background: colors[j] }} />
                  ))}
                </span>
              </button>
            ))}
          </div>
          <div className="absolute inset-x-0 bottom-0 flex gap-[3px]">
            {data.map((d, i) => (
              <span key={i} className="min-w-0 flex-1 truncate text-center font-mono text-[10px] text-kui-fg-subtle">
                {data.length > 14 && i % 2 ? "" : d.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
