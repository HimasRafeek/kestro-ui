import * as React from "react";
import { cn } from "../lib/cn";
import { useAnimationClock } from "../lib/audio";
import { useStickToBottom } from "../lib/hooks";
import { useSmoothText } from "../lib/smooth";

/* ========================================================================== */
/*                                 AgentCore                                  */
/* ========================================================================== */

export type CoreState = "idle" | "listening" | "thinking" | "speaking" | "working" | "error" | "offline";

export interface AgentCoreProps {
  state?: CoreState;
  /** Live loudness 0–1. */
  level?: number;
  /** Optional frequency bins 0–1 (from useAudioAnalyser). Synthesized from `level` when omitted. */
  spectrum?: number[];
  /** Diameter in px. Default 300. */
  size?: number;
  /** Center content (e.g. agent name). */
  label?: React.ReactNode;
  sublabel?: React.ReactNode;
  className?: string;
}

const coreColor: Record<CoreState, string> = {
  idle: "var(--kui-accent)",
  listening: "var(--kui-accent)",
  thinking: "var(--kui-info)",
  speaking: "var(--kui-accent)",
  working: "var(--kui-accent)",
  error: "var(--kui-danger)",
  offline: "var(--kui-fg-subtle)",
};

const SPOKES = 72;

/** Arc-reactor style "presence" for an AI agent — reacts to state and audio. */
export function AgentCore({ state = "idle", level = 0, spectrum, size = 300, label, sublabel, className }: AgentCoreProps) {
  const live = state === "listening" || state === "speaking" || state === "thinking" || state === "working";
  const t = useAnimationClock(live && !spectrum);
  const lvl = Math.max(0, Math.min(1, level));
  const color = coreColor[state];
  const fast = state === "thinking" || state === "working";

  const bars = React.useMemo(() => {
    return Array.from({ length: SPOKES }, (_, i) => {
      if (spectrum?.length) {
        // Mirror the spectrum so low frequencies sit at the top and both halves match.
        const half = SPOKES / 2;
        const pos = i < half ? i : SPOKES - 1 - i;
        const v = spectrum[Math.floor((pos / half) * spectrum.length)] ?? 0;
        return Math.max(0.04, v);
      }
      if (!live) return 0.05;
      const base = state === "thinking" || state === "working" ? 0.25 : lvl;
      const n = Math.sin(i * 0.55 + t * 5) * 0.5 + Math.sin(i * 1.7 - t * 3.3) * 0.35 + Math.sin(i * 0.21 + t * 1.4) * 0.15;
      return Math.max(0.05, base * (0.55 + 0.45 * n));
    });
  }, [spectrum, live, lvl, t, state]);

  const glow = state === "offline" ? 0.1 : state === "idle" ? 0.35 : 0.5 + lvl * 0.5;

  return (
    <div
      className={cn("relative shrink-0 select-none", state === "offline" && "grayscale", className)}
      style={{ width: size, height: size, ["--core" as string]: color }}
      role="img"
      aria-label={`Agent ${state}`}
    >
      {/* ambient glow */}
      <div
        className="absolute inset-[8%] rounded-full blur-3xl transition-opacity duration-700"
        style={{ background: "radial-gradient(circle, color-mix(in oklch, var(--core) 75%, transparent), transparent 70%)", opacity: glow }}
      />

      {/* outer tick ring */}
      <svg viewBox="0 0 200 200" className="absolute inset-0 animate-kui-spin-slow" style={{ animationDuration: fast ? "12s" : "40s" }}>
        {Array.from({ length: 120 }, (_, i) => {
          const a = (i / 120) * Math.PI * 2;
          const long = i % 10 === 0;
          const r1 = long ? 91 : 94;
          return (
            <line
              key={i}
              x1={100 + Math.cos(a) * r1}
              y1={100 + Math.sin(a) * r1}
              x2={100 + Math.cos(a) * 97}
              y2={100 + Math.sin(a) * 97}
              stroke="var(--core)"
              strokeWidth={long ? 0.9 : 0.4}
              opacity={long ? 0.8 : 0.35}
            />
          );
        })}
      </svg>

      {/* dashed segment ring (counter-rotating) */}
      <svg viewBox="0 0 200 200" className="absolute inset-0 animate-kui-spin-rev" style={{ animationDuration: fast ? "6s" : "24s" }}>
        <circle cx="100" cy="100" r="85" fill="none" stroke="var(--core)" strokeWidth="1.2" strokeDasharray="38 10 3 10" opacity="0.55" />
        <circle cx="100" cy="100" r="80" fill="none" stroke="var(--core)" strokeWidth="0.4" opacity="0.3" />
      </svg>

      {/* spectrum spokes */}
      <svg viewBox="0 0 200 200" className="absolute inset-0">
        {bars.map((v, i) => {
          const a = (i / SPOKES) * Math.PI * 2 - Math.PI / 2;
          const r0 = 56;
          const r1 = r0 + 4 + v * 20;
          return (
            <line
              key={i}
              x1={100 + Math.cos(a) * r0}
              y1={100 + Math.sin(a) * r0}
              x2={100 + Math.cos(a) * r1}
              y2={100 + Math.sin(a) * r1}
              stroke="var(--core)"
              strokeWidth="1.6"
              strokeLinecap="round"
              opacity={0.35 + v * 0.65}
            />
          );
        })}
      </svg>

      {/* thinking comet */}
      <svg
        viewBox="0 0 200 200"
        className={cn("absolute inset-0 animate-kui-spin-fast transition-opacity duration-500", fast ? "opacity-100" : "opacity-0")}
      >
        <circle cx="100" cy="100" r="50" fill="none" stroke="var(--core)" strokeWidth="2" strokeLinecap="round" strokeDasharray="60 254" />
      </svg>

      {/* core */}
      <div
        className="absolute inset-[29%] rounded-full transition-transform duration-150 ease-out"
        style={{ transform: `scale(${1 + (state === "speaking" || state === "listening" ? lvl * 0.08 : 0)})` }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, color-mix(in oklch, var(--core) 30%, white) 0%, var(--core) 28%, color-mix(in oklch, var(--core) 35%, transparent) 58%, transparent 72%)",
            opacity: 0.55 + glow * 0.45,
          }}
        />
        <div className="absolute inset-[14%] rounded-full border border-white/25" />
        <div className="absolute inset-[30%] rounded-full border border-white/15 animate-kui-breathe" />
      </div>

      {label || sublabel ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {label ? <div className="font-mono text-sm font-semibold tracking-[0.25em] text-white uppercase kui-glow-text">{label}</div> : null}
          {sublabel ? <div className="mt-1 font-mono text-[10px] tracking-[0.2em] text-white/70 uppercase">{sublabel}</div> : null}
        </div>
      ) : null}
    </div>
  );
}

/* ========================================================================== */
/*                                  HudPanel                                  */
/* ========================================================================== */

export interface HudPanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  /** Small code shown on the right of the header, e.g. "SYS-01". */
  code?: React.ReactNode;
  /** Right-side header slot (status, actions). */
  status?: React.ReactNode;
  /** Subtle CRT scanlines + moving scan bar. */
  scanlines?: boolean;
  /** Accent glow around the border. */
  glow?: boolean;
  bodyClassName?: string;
}

/** Sci-fi framed panel with corner brackets — the building block of HUD layouts. */
export function HudPanel({ title, code, status, scanlines, glow, className, bodyClassName, children, ...props }: HudPanelProps) {
  const corner = "pointer-events-none absolute size-3 border-kui-accent";
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[calc(var(--kui-radius)*0.5)] border border-kui-accent/20 bg-kui-surface/70 backdrop-blur-md animate-kui-pop",
        glow && "shadow-[0_0_0_1px_color-mix(in_oklch,var(--kui-accent)_15%,transparent),0_0_40px_-10px_color-mix(in_oklch,var(--kui-accent)_45%,transparent)]",
        className,
      )}
      {...props}
    >
      <span className={cn(corner, "top-0 left-0 border-t-2 border-l-2")} />
      <span className={cn(corner, "top-0 right-0 border-t-2 border-r-2")} />
      <span className={cn(corner, "bottom-0 left-0 border-b-2 border-l-2")} />
      <span className={cn(corner, "right-0 bottom-0 border-r-2 border-b-2")} />
      {scanlines ? (
        <>
          <div className="pointer-events-none absolute inset-0 kui-hud-scanlines" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 animate-kui-scan bg-gradient-to-b from-transparent via-kui-accent/[0.06] to-transparent" />
        </>
      ) : null}
      {title || code || status ? (
        <div className="relative flex items-center gap-2 border-b border-kui-accent/15 px-3.5 py-2 font-mono text-[10.5px] tracking-[0.18em] text-kui-fg-muted uppercase">
          <span className="size-1.5 bg-kui-accent animate-kui-glow" />
          <span className="truncate text-kui-fg">{title}</span>
          <span className="ml-auto flex items-center gap-2">
            {status}
            {code ? <span className="text-kui-accent/80">{code}</span> : null}
          </span>
        </div>
      ) : null}
      <div className={cn("relative p-3.5", bodyClassName)}>{children}</div>
    </div>
  );
}

/* ========================================================================== */
/*                                 RadialGauge                                */
/* ========================================================================== */

export interface RadialGaugeProps {
  value: number;
  max?: number;
  label?: React.ReactNode;
  unit?: string;
  size?: number;
  /** Fixed tone, or thresholds chosen automatically when "auto". */
  tone?: "accent" | "success" | "warning" | "danger" | "info" | "auto";
  /** Format the center value. */
  format?: (value: number) => React.ReactNode;
  className?: string;
}

const toneVar = {
  accent: "var(--kui-accent)",
  success: "var(--kui-success)",
  warning: "var(--kui-warning)",
  danger: "var(--kui-danger)",
  info: "var(--kui-info)",
};

/** 270° arc gauge for telemetry: CPU, confidence, context window, latency… */
export function RadialGauge({ value, max = 100, label, unit, size = 132, tone = "accent", format, className }: RadialGaugeProps) {
  const pct = Math.max(0, Math.min(1, value / max));
  const r = 42;
  const c = 2 * Math.PI * r;
  const arc = c * 0.75;
  const resolved = tone === "auto" ? (pct > 0.85 ? "danger" : pct > 0.65 ? "warning" : "success") : tone;
  const color = toneVar[resolved];
  return (
    <div className={cn("relative inline-flex shrink-0 flex-col items-center", className)} style={{ width: size }}>
      <svg viewBox="0 0 100 100" style={{ width: size, height: size }} className="rotate-[135deg]">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--kui-surface-3)" strokeWidth="5" strokeDasharray={`${arc} ${c}`} strokeLinecap="round" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${arc * pct} ${c}`}
          className="transition-[stroke-dasharray] duration-700 ease-kui-out"
          style={{ filter: `drop-shadow(0 0 4px color-mix(in oklch, ${color} 60%, transparent))` }}
        />
        {Array.from({ length: 28 }, (_, i) => {
          const a = (i / 27) * Math.PI * 1.5;
          return (
            <line
              key={i}
              x1={50 + Math.cos(a) * 34}
              y1={50 + Math.sin(a) * 34}
              x2={50 + Math.cos(a) * (i % 3 === 0 ? 30.5 : 32)}
              y2={50 + Math.sin(a) * (i % 3 === 0 ? 30.5 : 32)}
              stroke="var(--kui-fg-subtle)"
              strokeWidth="0.6"
              opacity={i / 27 <= pct ? 0.9 : 0.35}
            />
          );
        })}
      </svg>
      <div className="absolute inset-x-0 top-0 flex flex-col items-center justify-center" style={{ height: size }}>
        <span className="font-mono text-[1.45em] leading-none font-semibold text-kui-fg tabular-nums" style={{ fontSize: size * 0.19 }}>
          {format ? format(value) : Math.round(value)}
          {unit ? <span className="ml-0.5 text-[0.5em] text-kui-fg-subtle">{unit}</span> : null}
        </span>
      </div>
      {label ? <span className="-mt-3 font-mono text-[10px] tracking-[0.18em] text-kui-fg-subtle uppercase">{label}</span> : null}
    </div>
  );
}

/* ========================================================================== */
/*                                  Sparkline                                 */
/* ========================================================================== */

export interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  tone?: keyof typeof toneVar;
  fill?: boolean;
  /** Pulse the last point. */
  live?: boolean;
  className?: string;
}

function smoothPath(points: [number, number][]) {
  if (points.length < 2) return "";
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i - 1] ?? points[i];
    const [x1, y1] = points[i];
    const [x2, y2] = points[i + 1];
    const [x3, y3] = points[i + 2] ?? points[i + 1];
    const c1x = x1 + (x2 - x0) / 6;
    const c1y = y1 + (y2 - y0) / 6;
    const c2x = x2 - (x3 - x1) / 6;
    const c2y = y2 - (y3 - y1) / 6;
    d += ` C${c1x},${c1y} ${c2x},${c2y} ${x2},${y2}`;
  }
  return d;
}

export function Sparkline({ data, width = 120, height = 32, tone = "accent", fill = true, live = false, className }: SparklineProps) {
  const id = React.useId();
  const min = Math.min(...data);
  const max = Math.max(...data);
  const pts: [number, number][] = data.map((v, i) => [
    (i / Math.max(1, data.length - 1)) * width,
    height - 3 - ((v - min) / (max - min || 1)) * (height - 6),
  ]);
  const line = smoothPath(pts);
  const color = toneVar[tone];
  const last = pts[pts.length - 1];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={cn("overflow-visible", className)} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && line ? <path d={`${line} L${width},${height} L0,${height} Z`} fill={`url(#${id})`} /> : null}
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      {last ? (
        <>
          {live ? <circle cx={last[0]} cy={last[1]} r="5" fill={color} className="animate-kui-glow" opacity="0.3" /> : null}
          <circle cx={last[0]} cy={last[1]} r="2" fill={color} />
        </>
      ) : null}
    </svg>
  );
}

/* ========================================================================== */
/*                                   HudStat                                  */
/* ========================================================================== */

export interface HudStatProps {
  label: React.ReactNode;
  value: React.ReactNode;
  unit?: React.ReactNode;
  /** Percentage change; positive renders as success. */
  delta?: number;
  /** Invert delta colors (e.g. latency: lower is better). */
  invertDelta?: boolean;
  data?: number[];
  icon?: React.ReactNode;
  className?: string;
}

/** Telemetry readout: label, big mono value, delta and sparkline. */
export function HudStat({ label, value, unit, delta, invertDelta, data, icon, className }: HudStatProps) {
  const good = delta === undefined ? null : invertDelta ? delta < 0 : delta >= 0;
  return (
    <div className={cn("min-w-0", className)}>
      <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.18em] text-kui-fg-subtle uppercase [&_svg]:size-3">
        {icon}
        {label}
      </div>
      <div className="mt-1 flex items-end justify-between gap-3">
        <div className="flex items-baseline gap-1">
          <span className="font-mono text-2xl font-semibold text-kui-fg tabular-nums">{value}</span>
          {unit ? <span className="font-mono text-xs text-kui-fg-subtle">{unit}</span> : null}
          {delta !== undefined ? (
            <span className={cn("ml-1.5 font-mono text-[11px]", good ? "text-kui-success" : "text-kui-danger")}>
              {delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}%
            </span>
          ) : null}
        </div>
        {data?.length ? <Sparkline data={data} width={84} height={26} live tone={good === false ? "danger" : "accent"} /> : null}
      </div>
    </div>
  );
}

/* ========================================================================== */
/*                                  Waveform                                  */
/* ========================================================================== */

export interface WaveformProps {
  /** Bins 0–1. When omitted, bars are synthesized from `level`. */
  levels?: number[];
  level?: number;
  bars?: number;
  height?: number;
  active?: boolean;
  /** Mirror bars around the vertical center. */
  mirror?: boolean;
  tone?: keyof typeof toneVar;
  className?: string;
}

export function Waveform({ levels, level = 0.5, bars = 48, height = 48, active = true, mirror = true, tone = "accent", className }: WaveformProps) {
  const t = useAnimationClock(active && !levels);
  const values = Array.from({ length: bars }, (_, i) => {
    if (levels?.length) return levels[Math.floor((i / bars) * levels.length)] ?? 0;
    if (!active) return 0.06;
    const n = Math.sin(i * 0.45 + t * 6) * 0.5 + Math.sin(i * 1.3 - t * 4) * 0.3 + 0.2;
    const env = Math.sin((i / (bars - 1)) * Math.PI); // taper edges
    return Math.max(0.06, Math.abs(n) * level * (0.4 + env * 0.6));
  });
  return (
    <div className={cn("flex w-full items-center gap-[2px]", className)} style={{ height }} aria-hidden>
      {values.map((v, i) => (
        <span
          key={i}
          className={cn("min-w-[2px] flex-1 rounded-full transition-[height] duration-75", !mirror && "self-end")}
          style={{
            height: `${Math.max(6, v * 100)}%`,
            background: toneVar[tone],
            opacity: 0.45 + v * 0.55,
            boxShadow: v > 0.5 ? `0 0 8px color-mix(in oklch, ${toneVar[tone]} 60%, transparent)` : undefined,
          }}
        />
      ))}
    </div>
  );
}

/* ========================================================================== */
/*                               CommandConsole                               */
/* ========================================================================== */

export type ConsoleLineKind = "input" | "output" | "system" | "success" | "warning" | "error";

export interface ConsoleLine {
  id: string;
  kind: ConsoleLineKind;
  text: string;
  time?: string;
  /** Typewriter-reveal this line (use for the line currently streaming). */
  streaming?: boolean;
}

export interface CommandConsoleProps {
  lines: ConsoleLine[];
  onCommand?: (command: string) => void;
  prompt?: string;
  placeholder?: string;
  title?: React.ReactNode;
  /** Height of the scroll area. Default 280. */
  height?: number | string;
  disabled?: boolean;
  className?: string;
}

const lineCls: Record<ConsoleLineKind, string> = {
  input: "text-kui-fg",
  output: "text-kui-fg-muted",
  system: "text-kui-accent",
  success: "text-kui-success",
  warning: "text-kui-warning",
  error: "text-kui-danger",
};

const linePrefix: Record<ConsoleLineKind, string> = {
  input: "›",
  output: " ",
  system: "◆",
  success: "✓",
  warning: "!",
  error: "✕",
};

function ConsoleRow({ line }: { line: ConsoleLine }) {
  const { text, isAnimating } = useSmoothText(line.text, !!line.streaming, { minCps: 140, catchUp: 0.25 });
  return (
    <div className={cn("flex gap-2.5 animate-kui-reveal", lineCls[line.kind])}>
      {line.time ? <span className="shrink-0 text-kui-fg-subtle/70">{line.time}</span> : null}
      <span className={cn("w-3 shrink-0 text-center", line.kind === "input" ? "text-kui-accent" : "opacity-80")}>{linePrefix[line.kind]}</span>
      <span className="min-w-0 flex-1 whitespace-pre-wrap [overflow-wrap:anywhere]">
        {text}
        {line.streaming || isAnimating ? <span className="ml-0.5 inline-block h-[1em] w-[0.55em] translate-y-[2px] animate-kui-blink bg-kui-accent" /> : null}
      </span>
    </div>
  );
}

/** Terminal-style command line for operating an agent by text commands. */
export function CommandConsole({
  lines,
  onCommand,
  prompt = "›",
  placeholder = "Type a command…",
  title = "Command",
  height = 280,
  disabled,
  className,
}: CommandConsoleProps) {
  const { scrollRef, contentRef } = useStickToBottom<HTMLDivElement>(40);
  const [value, setValue] = React.useState("");
  const [history, setHistory] = React.useState<string[]>([]);
  const [cursor, setCursor] = React.useState(-1);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const submit = () => {
    const v = value.trim();
    if (!v) return;
    onCommand?.(v);
    setHistory((h) => [v, ...h].slice(0, 50));
    setCursor(-1);
    setValue("");
  };

  return (
    <div
      className={cn("flex flex-col overflow-hidden rounded-[calc(var(--kui-radius)*0.5)] border border-kui-accent/20 bg-kui-code-bg font-mono text-[12.5px] leading-relaxed", className)}
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex items-center gap-2 border-b border-kui-accent/15 px-3 py-2 text-[10.5px] tracking-[0.18em] text-kui-fg-subtle uppercase">
        <span className="flex gap-1">
          <span className="size-2 rounded-full bg-kui-danger/70" />
          <span className="size-2 rounded-full bg-kui-warning/70" />
          <span className="size-2 rounded-full bg-kui-success/70" />
        </span>
        <span className="ml-1.5">{title}</span>
      </div>
      <div ref={scrollRef} className="kui-scrollbar overflow-y-auto px-3 py-2.5" style={{ height }}>
        <div ref={contentRef} className="space-y-1">
          {lines.map((l) => (
            <ConsoleRow key={l.id} line={l} />
          ))}
        </div>
      </div>
      {onCommand ? (
        <label className="flex items-center gap-2.5 border-t border-kui-accent/15 px-3 py-2.5">
          <span className="text-kui-accent kui-glow-text">{prompt}</span>
          <input
            ref={inputRef}
            value={value}
            disabled={disabled}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
              else if (e.key === "ArrowUp" && history.length) {
                e.preventDefault();
                const n = Math.min(history.length - 1, cursor + 1);
                setCursor(n);
                setValue(history[n]);
              } else if (e.key === "ArrowDown") {
                e.preventDefault();
                const n = cursor - 1;
                setCursor(n);
                setValue(n >= 0 ? history[n] : "");
              }
            }}
            placeholder={placeholder}
            spellCheck={false}
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent text-kui-fg caret-[var(--kui-accent)] placeholder:text-kui-fg-subtle/60 focus:outline-none disabled:opacity-50"
          />
        </label>
      ) : null}
    </div>
  );
}

/* ========================================================================== */
/*                                BootSequence                                */
/* ========================================================================== */

export interface BootSequenceProps {
  steps: string[];
  /** ms between steps. Default 320. */
  interval?: number;
  title?: React.ReactNode;
  onComplete?: () => void;
  className?: string;
}

/** Animated startup checklist — great for agent "wake up" moments and onboarding. */
export function BootSequence({ steps, interval = 320, title = "Initializing agent", onComplete, className }: BootSequenceProps) {
  const [n, setN] = React.useState(0);
  const done = n >= steps.length;
  const cb = React.useRef(onComplete);
  cb.current = onComplete;

  React.useEffect(() => {
    if (done) {
      const id = setTimeout(() => cb.current?.(), 450);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => setN((x) => x + 1), interval * (0.6 + Math.random() * 0.8));
    return () => clearTimeout(id);
  }, [n, done, interval]);

  const pct = Math.round((Math.min(n, steps.length) / steps.length) * 100);
  return (
    <div className={cn("w-full max-w-md font-mono text-[12px]", className)}>
      <div className="mb-3 flex items-center justify-between text-[10.5px] tracking-[0.2em] text-kui-accent uppercase">
        <span className={cn(!done && "animate-kui-flicker")}>{done ? "System online" : title}</span>
        <span className="tabular-nums">{pct}%</span>
      </div>
      <div className="mb-4 h-[3px] overflow-hidden rounded-full bg-kui-surface-3">
        <div
          className="h-full bg-kui-accent shadow-[0_0_10px_var(--kui-accent)] transition-[width] duration-300 ease-kui-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <ul className="space-y-1.5">
        {steps.slice(0, n + 1).map((s, i) => (
          <li key={i} className="flex items-center gap-3 animate-kui-reveal">
            <span className="min-w-0 flex-1 truncate text-kui-fg-muted">{s}</span>
            {i < n ? (
              <span className="text-kui-success">[ OK ]</span>
            ) : (
              <span className="animate-kui-blink text-kui-fg-subtle">[ .. ]</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ========================================================================== */
/*                                HudBackground                               */
/* ========================================================================== */

/** Ambient grid + glow + optional sweeping scan line. Place inside a `relative` container. */
export function HudBackground({ scan = true, className }: { scan?: boolean; className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div className="absolute inset-0 kui-hud-grid" />
      <div
        className="absolute top-1/2 left-1/2 size-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, color-mix(in oklch, var(--kui-accent) 35%, transparent), transparent 70%)" }}
      />
      {scan ? (
        <div className="absolute inset-x-0 top-0 h-full animate-kui-scan bg-gradient-to-b from-transparent via-kui-accent/[0.07] to-transparent" style={{ animationDuration: "7s" }} />
      ) : null}
    </div>
  );
}

/* ========================================================================== */
/*                                 DataTicker                                 */
/* ========================================================================== */

/** Continuously scrolling status strip (markets, system events, agent activity). */
export function DataTicker({ items, className }: { items: React.ReactNode[]; className?: string }) {
  const row = (
    <div className="flex shrink-0 items-center gap-8 pr-8">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-2 whitespace-nowrap">
          <span className="size-1 rounded-full bg-kui-accent" />
          {it}
        </span>
      ))}
    </div>
  );
  return (
    <div
      className={cn(
        "relative overflow-hidden border-y border-kui-accent/15 py-1.5 font-mono text-[11px] tracking-wider text-kui-fg-muted uppercase",
        "[mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]",
        className,
      )}
    >
      <div className="flex w-max animate-kui-marquee hover:[animation-play-state:paused]">
        {row}
        {row}
      </div>
    </div>
  );
}
