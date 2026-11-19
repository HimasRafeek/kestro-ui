import * as React from "react";
import { Mic, MicOff, PhoneOff } from "lucide-react";
import { cn } from "../lib/cn";
import { ShimmerText } from "./primitives";

export type VoiceState = "idle" | "connecting" | "listening" | "thinking" | "speaking";

export interface VoiceOrbProps {
  state?: VoiceState;
  /** Live audio amplitude 0–1 (mic level while listening, output level while speaking). */
  level?: number;
  /** Diameter in px. */
  size?: number;
  className?: string;
}

/** Animated orb that visualizes a voice agent's state. */
export function VoiceOrb({ state = "idle", level = 0, size = 168, className }: VoiceOrbProps) {
  const active = state === "listening" || state === "speaking";
  const lvl = Math.max(0, Math.min(1, level));
  const scale = active ? 1 + lvl * 0.14 : 1;
  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Voice agent ${state}`}
    >
      {/* glow */}
      <div
        className="absolute -inset-[18%] rounded-full blur-3xl transition-opacity duration-500"
        style={{
          background: "radial-gradient(circle, color-mix(in oklch, var(--kui-accent) 70%, transparent) 0%, transparent 65%)",
          opacity: state === "idle" ? 0.25 : 0.45 + lvl * 0.5,
        }}
      />
      <div
        className={cn("absolute inset-0 transition-transform duration-150 ease-out", state === "idle" && "animate-kui-breathe")}
        style={{ transform: active ? `scale(${scale})` : undefined }}
      >
        <div className="absolute inset-0 overflow-hidden rounded-full shadow-[inset_0_-8px_24px_rgb(0_0_0/0.25),0_20px_50px_-20px_var(--kui-accent)]">
          <div
            className={cn(
              "absolute -inset-1/4",
              state === "thinking" || state === "connecting" ? "animate-kui-spin-fast" : "animate-kui-spin-slow",
            )}
            style={{
              background:
                "conic-gradient(from 0deg, var(--kui-accent), oklch(0.72 0.17 220), oklch(0.75 0.15 320), color-mix(in oklch, var(--kui-accent) 60%, black), var(--kui-accent))",
              filter: "blur(18px)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 32% 26%, rgb(255 255 255 / 0.85) 0%, rgb(255 255 255 / 0.18) 22%, transparent 48%)",
            }}
          />
          <div className="absolute inset-0 rounded-full ring-1 ring-white/20 ring-inset" />
        </div>
      </div>
    </div>
  );
}

/** Instrument-style dial for a voice agent: ticked bezel, level disc and speaking ripples. */
export function VoiceDial({ state = "idle", level = 0, size = 168, className }: VoiceOrbProps) {
  const active = state === "listening" || state === "speaking";
  const busy = state === "thinking" || state === "connecting";
  const lvl = Math.max(0, Math.min(1, level));
  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Voice agent ${state}`}
    >
      {/* ripples while speaking */}
      {state === "speaking"
        ? [0, 1].map((i) => (
            <span
              key={i}
              className="absolute inset-[14%] rounded-full border border-kui-accent/50 animate-kui-ping"
              style={{ animationDelay: `${i * 0.9}s`, animationDuration: "1.8s" }}
            />
          ))
        : null}
      {/* outer ring with ticks */}
      <svg viewBox="0 0 100 100" className={cn("absolute inset-0", busy ? "animate-kui-spin-fast" : "animate-kui-spin-slow")} style={{ animationDuration: busy ? "3s" : "60s" }}>
        <circle cx="50" cy="50" r="48" fill="none" stroke="var(--kui-border-strong)" strokeWidth="0.6" />
        {Array.from({ length: 60 }, (_, i) => {
          const a = (i / 60) * Math.PI * 2;
          const long = i % 5 === 0;
          return (
            <line
              key={i}
              x1={50 + Math.cos(a) * (long ? 43.5 : 45)}
              y1={50 + Math.sin(a) * (long ? 43.5 : 45)}
              x2={50 + Math.cos(a) * 47}
              y2={50 + Math.sin(a) * 47}
              stroke={busy && i < 12 ? "var(--kui-accent)" : "var(--kui-fg-subtle)"}
              strokeWidth={long ? 0.7 : 0.4}
            />
          );
        })}
      </svg>
      {/* face */}
      <div className="absolute inset-[14%] rounded-full border border-kui-border-strong bg-kui-surface shadow-kui" />
      {/* level disc */}
      <div
        className={cn("absolute inset-[26%] rounded-full bg-kui-accent transition-transform duration-150 ease-out", state === "idle" && "animate-kui-breathe")}
        style={{
          transform: `scale(${active ? 0.55 + lvl * 0.45 : busy ? 0.5 : 0.42})`,
          opacity: state === "idle" ? 0.55 : 0.9,
        }}
      />
      <div className="absolute inset-[26%] rounded-full border border-kui-accent/40" />
    </div>
  );
}

/** Small animated equalizer bars — use for "speaking" indicators. */
export function VoiceWave({ bars = 5, active = true, className }: { bars?: number; active?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex h-4 items-center gap-[3px]", className)} aria-hidden>
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className={cn("h-full w-[3px] origin-center rounded-full bg-kui-accent", active ? "animate-kui-wave" : "scale-y-[0.3]")}
          style={{ animationDelay: `${(i % 3) * 0.15 + i * 0.05}s` }}
        />
      ))}
    </span>
  );
}

export interface VoicePanelProps {
  state: VoiceState;
  level?: number;
  /** Agent name shown above the status. */
  name?: React.ReactNode;
  /** Live transcript line (what the user or agent is saying). */
  transcript?: React.ReactNode;
  muted?: boolean;
  onToggleMute?: () => void;
  onEnd?: () => void;
  /** Call duration in seconds. */
  elapsed?: number;
  className?: string;
}

const voiceLabel: Record<VoiceState, string> = {
  idle: "Tap to start talking",
  connecting: "Connecting…",
  listening: "Listening…",
  thinking: "Thinking…",
  speaking: "Speaking",
};

/** A complete voice-call surface: orb, status, transcript and call controls. */
export function VoicePanel({
  state,
  level,
  name,
  transcript,
  muted,
  onToggleMute,
  onEnd,
  elapsed,
  className,
}: VoicePanelProps) {
  const mm = elapsed !== undefined ? `${Math.floor(elapsed / 60)}:${String(Math.floor(elapsed % 60)).padStart(2, "0")}` : null;
  return (
    <div className={cn("flex w-full flex-col items-center gap-7 py-8 text-center", className)}>
      <div className="space-y-1">
        {name ? <div className="text-lg font-semibold text-kui-fg">{name}</div> : null}
        <div className="flex items-center justify-center gap-2 text-sm text-kui-fg-muted">
          {state === "speaking" ? <VoiceWave bars={4} className="h-3" /> : null}
          {state === "thinking" || state === "connecting" ? <ShimmerText>{voiceLabel[state]}</ShimmerText> : voiceLabel[state]}
          {mm ? <span className="text-kui-fg-subtle tabular-nums">· {mm}</span> : null}
        </div>
      </div>
      <VoiceOrb state={state} level={level} />
      <p className="min-h-12 max-w-md text-[15px] leading-relaxed text-kui-fg-muted">{transcript}</p>
      <div className="flex items-center gap-4">
        {onToggleMute ? (
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? "Unmute" : "Mute"}
            className={cn(
              "flex size-14 cursor-pointer items-center justify-center rounded-full border transition-colors",
              muted
                ? "border-transparent bg-kui-fg text-kui-bg"
                : "border-kui-border bg-kui-surface text-kui-fg hover:bg-kui-surface-2",
            )}
          >
            {muted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
          </button>
        ) : null}
        {onEnd ? (
          <button
            type="button"
            onClick={onEnd}
            aria-label="End call"
            className="flex size-14 cursor-pointer items-center justify-center rounded-full bg-kui-danger text-white shadow-[0_8px_24px_-8px_var(--kui-danger)] transition hover:brightness-110 active:scale-95"
          >
            <PhoneOff className="size-5" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
