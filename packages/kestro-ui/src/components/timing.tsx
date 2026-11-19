import * as React from "react";
import { Pause, Timer } from "lucide-react";
import { cn } from "../lib/cn";
import { formatDuration } from "../lib/hooks";

/* ========================================================================== */
/*                                   RunTimer                                 */
/* ========================================================================== */

function clock(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

export interface RunTimerProps {
  /** When the run started (ms since epoch). The timer ticks while `running`. */
  startedAt?: number;
  /** Or pass a fixed elapsed time in ms (e.g. for finished runs). */
  elapsed?: number;
  running?: boolean;
  /** Progress 0–100 — used to estimate the time remaining. */
  progress?: number;
  /** Max run time in ms; shows a ring and warns as it gets close. */
  timeout?: number;
  label?: React.ReactNode;
  size?: "sm" | "md";
  className?: string;
}

/** Live elapsed timer for an agent run, with an estimate of time left and an optional timeout ring. */
export function RunTimer({ startedAt, elapsed: elapsedProp, running = true, progress, timeout, label = "Elapsed", size = "md", className }: RunTimerProps) {
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    if (!running || startedAt === undefined) return;
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [running, startedAt]);
  const elapsed = elapsedProp ?? (startedAt !== undefined ? now - startedAt : 0);
  const eta = progress && progress > 2 && progress < 100 && running ? (elapsed / progress) * (100 - progress) : undefined;
  const ratio = timeout ? Math.min(1, elapsed / timeout) : 0;
  const r = 15;
  const c = 2 * Math.PI * r;
  const tone = ratio > 0.9 ? "var(--kui-danger)" : ratio > 0.7 ? "var(--kui-warning)" : "var(--kui-accent)";
  const sm = size === "sm";

  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      {timeout ? (
        <svg viewBox="0 0 36 36" className={cn("-rotate-90", sm ? "size-8" : "size-10")} aria-hidden>
          <circle cx="18" cy="18" r={r} fill="none" stroke="var(--kui-surface-3)" strokeWidth="3" />
          <circle cx="18" cy="18" r={r} fill="none" stroke={tone} strokeWidth="3" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - ratio)} className="transition-[stroke-dashoffset] duration-500" />
        </svg>
      ) : (
        <span className={cn("flex shrink-0 items-center justify-center rounded-lg bg-kui-surface-2 text-kui-fg-muted", sm ? "size-8 [&_svg]:size-3.5" : "size-10 [&_svg]:size-4")}>
          {running ? <Timer /> : <Pause />}
        </span>
      )}
      <div>
        <div className="text-[11px] font-medium tracking-wide text-kui-fg-subtle uppercase">{label}</div>
        <div className={cn("font-mono font-semibold text-kui-fg tabular-nums", sm ? "text-base" : "text-xl")} role="timer" aria-live="off">
          {clock(elapsed)}
          {!running && elapsedProp === undefined ? <span className="ml-2 text-xs font-normal text-kui-fg-subtle">paused</span> : null}
        </div>
        {eta !== undefined ? <div className="text-xs text-kui-fg-subtle">About {formatDuration(eta / 1000)} left</div> : null}
        {timeout && !eta ? <div className="text-xs text-kui-fg-subtle">Limit {formatDuration(timeout / 1000)}</div> : null}
      </div>
    </div>
  );
}

/* ========================================================================== */
/*                              LatencyBreakdown                              */
/* ========================================================================== */

export interface LatencySegment {
  id: string;
  label: React.ReactNode;
  ms: number;
  tone?: "accent" | "info" | "success" | "warning" | "muted";
}

export interface LatencyBreakdownProps {
  segments: LatencySegment[];
  /** Output tokens, to show tokens per second for the generation phase. */
  outputTokens?: number;
  /** Which segment is generation (for tokens/sec). Default "generation". */
  generationId?: string;
  title?: React.ReactNode;
  className?: string;
}

const segColor = {
  accent: "var(--kui-accent)",
  info: "var(--kui-info)",
  success: "var(--kui-success)",
  warning: "var(--kui-warning)",
  muted: "var(--kui-fg-subtle)",
};
const segOrder: LatencySegment["tone"][] = ["muted", "info", "accent", "success", "warning"];

/** Where the time went in one response: queue, time to first token, generation, tools. */
export function LatencyBreakdown({ segments, outputTokens, generationId = "generation", title = "Response time", className }: LatencyBreakdownProps) {
  const total = segments.reduce((a, s) => a + s.ms, 0);
  const gen = segments.find((s) => s.id === generationId);
  const tps = outputTokens && gen && gen.ms > 0 ? outputTokens / (gen.ms / 1000) : undefined;
  return (
    <div className={cn("w-full rounded-kui border border-kui-border bg-kui-surface p-4", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[13px] font-medium text-kui-fg-muted">{title}</h3>
        <span className="font-mono text-lg font-semibold text-kui-fg tabular-nums">{formatDuration(total / 1000)}</span>
      </div>
      <div className="mt-3 flex h-7 gap-[2px] overflow-hidden rounded-kui-sm">
        {segments.map((s, i) => (
          <span
            key={s.id}
            title={`${typeof s.label === "string" ? s.label : s.id}: ${formatDuration(s.ms / 1000)}`}
            className="flex h-full min-w-[3px] items-center justify-center overflow-hidden font-mono text-[10px] text-white/90 transition-[flex-grow] duration-700 ease-kui-out"
            style={{ flexGrow: s.ms, flexBasis: 0, background: segColor[s.tone ?? segOrder[i % segOrder.length] ?? "muted"] }}
          >
            {s.ms / total > 0.12 ? formatDuration(s.ms / 1000) : null}
          </span>
        ))}
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[13px] sm:grid-cols-4">
        {segments.map((s, i) => (
          <li key={s.id} className="min-w-0">
            <span className="flex items-center gap-1.5 text-xs text-kui-fg-subtle">
              <span className="size-2 shrink-0 rounded-[2px]" style={{ background: segColor[s.tone ?? segOrder[i % segOrder.length] ?? "muted"] }} />
              <span className="truncate">{s.label}</span>
            </span>
            <span className="font-mono text-kui-fg tabular-nums">{formatDuration(s.ms / 1000)}</span>
          </li>
        ))}
      </ul>
      {tps !== undefined ? <p className="mt-3 border-t border-kui-border pt-2.5 font-mono text-xs text-kui-fg-muted">{tps.toFixed(1)} tokens/s · {outputTokens?.toLocaleString()} output tokens</p> : null}
    </div>
  );
}

/* ========================================================================== */
/*                                   TimeAgo                                  */
/* ========================================================================== */

const units: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31536000],
  ["month", 2592000],
  ["week", 604800],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
  ["second", 1],
];

export function formatTimeAgo(date: Date | number | string, now = Date.now(), locale?: string) {
  const t = new Date(date).getTime();
  const diff = Math.round((t - now) / 1000);
  if (Math.abs(diff) < 10) return "just now";
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto", style: "short" });
  for (const [unit, secs] of units) {
    if (Math.abs(diff) >= secs || unit === "second") return rtf.format(Math.round(diff / secs), unit);
  }
  return "";
}

/** Relative time ("3 min ago") that updates itself; hover shows the exact time. */
export function TimeAgo({ date, locale, className }: { date: Date | number | string; locale?: string; className?: string }) {
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    const age = Math.abs(Date.now() - new Date(date).getTime());
    const id = setInterval(() => setNow(Date.now()), age < 60_000 ? 5_000 : 30_000);
    return () => clearInterval(id);
  }, [date]);
  const d = new Date(date);
  return (
    <time dateTime={d.toISOString()} title={d.toLocaleString(locale)} className={cn("tabular-nums", className)}>
      {formatTimeAgo(d, now, locale)}
    </time>
  );
}
