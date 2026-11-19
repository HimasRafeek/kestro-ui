import * as React from "react";
import { Sparkles } from "lucide-react";
import { cn } from "../lib/cn";
import { StatusDot, type Tone } from "./primitives";

export type AgentState = "idle" | "online" | "thinking" | "working" | "waiting" | "error" | "offline";

const stateTone: Record<AgentState, Tone> = {
  idle: "neutral",
  online: "success",
  thinking: "accent",
  working: "accent",
  waiting: "warning",
  error: "danger",
  offline: "neutral",
};

const stateLabel: Record<AgentState, string> = {
  idle: "Idle",
  online: "Online",
  thinking: "Thinking",
  working: "Working",
  waiting: "Waiting for input",
  error: "Error",
  offline: "Offline",
};

const sizes = {
  xs: { box: "size-6 rounded-md [&_svg]:size-3", dot: "size-2 -right-0.5 -bottom-0.5", text: "text-[10px]" },
  sm: { box: "size-8 rounded-lg [&_svg]:size-4", dot: "size-2.5 -right-0.5 -bottom-0.5", text: "text-xs" },
  md: { box: "size-10 rounded-xl [&_svg]:size-5", dot: "size-3 -right-0.5 -bottom-0.5", text: "text-sm" },
  lg: { box: "size-14 rounded-2xl [&_svg]:size-7", dot: "size-3.5 right-0 bottom-0", text: "text-lg" },
};

export interface AgentAvatarProps {
  /** Used for initials & accessible label. */
  name?: string;
  src?: string;
  /** Custom icon; defaults to a sparkle (gradient) or a monogram of `name` (monogram). */
  icon?: React.ReactNode;
  /** Show initials instead of the icon (e.g. for human users). */
  initials?: boolean;
  state?: AgentState;
  size?: keyof typeof sizes;
  /** "agent" renders the accent gradient, "user" a neutral tile. */
  variant?: "agent" | "user";
  /**
   * Agent tile style. "gradient" (default) is the accent gradient tile;
   * "monogram" is a flat letter tile tinted by `color`.
   */
  appearance?: "gradient" | "monogram";
  /**
   * Monogram tile color: a CSS color, "accent", "ink", or "auto" (a muted
   * color picked from the name so each agent is recognisable). Default "auto".
   */
  color?: "auto" | "accent" | "ink" | (string & {});
  className?: string;
}

// Muted, field-guide tones — readable with ink text in light and dark themes.
const TILE_TONES = [
  "oklch(0.8 0.045 245)", // slate blue
  "oklch(0.86 0.06 85)", // sand
  "oklch(0.82 0.05 150)", // sage
  "oklch(0.8 0.06 40)", // clay
  "oklch(0.84 0.012 250)", // stone
  "oklch(0.8 0.045 200)", // lichen
];

function toneFor(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return TILE_TONES[h % TILE_TONES.length];
}

function getInitials(name?: string, single = false) {
  if (!name) return single ? "A" : "?";
  const parts = name.trim().split(/\s+/);
  if (single) return (parts[0]?.[0] ?? "A").toUpperCase();
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

export function AgentAvatar({
  name,
  src,
  icon,
  initials,
  state,
  size = "sm",
  variant = "agent",
  appearance = "gradient",
  color = "auto",
  className,
}: AgentAvatarProps) {
  const monogram = variant === "agent" && appearance === "monogram";
  const tile =
    color === "accent"
      ? { background: "var(--kui-accent)", color: "var(--kui-accent-fg)" }
      : color === "ink"
        ? { background: "var(--kui-fg)", color: "var(--kui-bg)" }
        : { background: color === "auto" ? toneFor(name) : color, color: "oklch(0.2 0.014 255)" };
  const s = sizes[size];
  const live = state === "thinking" || state === "working";
  return (
    <span
      className={cn("relative inline-flex shrink-0", className)}
      role="img"
      aria-label={[name, state ? stateLabel[state] : null].filter(Boolean).join(" — ") || "Avatar"}
    >
      <span
        className={cn(
          "inline-flex items-center justify-center overflow-hidden font-semibold select-none",
          s.box,
          s.text,
          monogram
            ? "tracking-tight"
            : variant === "agent"
              ? "bg-[radial-gradient(120%_120%_at_20%_0%,color-mix(in_oklch,var(--kui-accent)_70%,white)_0%,var(--kui-accent)_45%,color-mix(in_oklch,var(--kui-accent)_55%,black)_100%)] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_4px_12px_-4px_color-mix(in_oklch,var(--kui-accent)_60%,transparent)]"
              : "border border-kui-border bg-kui-surface-3 text-kui-fg-muted",
        )}
        style={monogram && !src ? tile : undefined}
      >
        {src ? (
          <img src={src} alt="" className="size-full object-cover" />
        ) : monogram ? (
          (icon ?? getInitials(name, !initials))
        ) : initials || variant === "user" ? (
          (icon ?? getInitials(name))
        ) : (
          (icon ?? <Sparkles />)
        )}
      </span>
      {state ? (
        <StatusDot
          tone={stateTone[state]}
          pulse={live}
          className={cn("absolute rounded-full ring-2 ring-kui-bg", s.dot)}
        />
      ) : null}
    </span>
  );
}

export { stateLabel as agentStateLabel, stateTone as agentStateTone };
