import * as React from "react";
import { ArrowLeftRight, Brain, Check, ChevronRight, CircleAlert, Database, Pause, ShieldCheck, Waypoints, Wrench, Circle } from "lucide-react";
import { cn } from "../lib/cn";
import { formatDuration } from "../lib/hooks";
import { AgentAvatar } from "./agent-avatar";
import { ShimmerText } from "./primitives";

/* ========================================================================== */
/*                                 AgentGraph                                 */
/* ========================================================================== */

export type AgentNodeState = "idle" | "queued" | "working" | "waiting" | "done" | "error";

export interface AgentNode {
  id: string;
  name: string;
  /** Parent (delegating) agent. Nodes without a parent are roots. */
  parentId?: string;
  role?: React.ReactNode;
  state?: AgentNodeState;
  /** What the agent is doing right now. */
  activity?: React.ReactNode;
  /** Small trailing detail, e.g. "3 tools · 4.2s". */
  meta?: React.ReactNode;
  icon?: React.ReactNode;
}

export interface AgentLink {
  from: string;
  to: string;
  /** Animate packets along this link. */
  active?: boolean;
}

export interface AgentGraphProps {
  nodes: AgentNode[];
  /** Extra peer-to-peer links (drawn dashed), in addition to the parent tree. */
  links?: AgentLink[];
  /** Layout direction. Default "right". */
  direction?: "right" | "down";
  nodeWidth?: number;
  nodeHeight?: number;
  /** Space between depth levels. */
  levelGap?: number;
  /** Space between siblings. */
  siblingGap?: number;
  selectedId?: string;
  onSelect?: (id: string) => void;
  className?: string;
}

const nodeStateStyle: Record<AgentNodeState, string> = {
  idle: "border-kui-border",
  queued: "border-kui-border border-dashed",
  working: "border-kui-accent/60 bg-[color-mix(in_oklch,var(--kui-accent)_5%,var(--kui-surface))]",
  waiting: "border-kui-warning/60",
  done: "border-kui-border",
  error: "border-kui-danger/60",
};

const nodeStateLabel: Record<AgentNodeState, string> = {
  idle: "Idle",
  queued: "Queued",
  working: "Working",
  waiting: "Waiting for you",
  done: "Done",
  error: "Failed",
};

const avatarState = {
  idle: "idle",
  queued: "offline",
  working: "working",
  waiting: "waiting",
  done: "online",
  error: "error",
} as const;

type Pos = { x: number; y: number };

function layoutTree(nodes: AgentNode[]) {
  const byParent = new Map<string | undefined, AgentNode[]>();
  const ids = new Set(nodes.map((n) => n.id));
  for (const n of nodes) {
    const p = n.parentId && ids.has(n.parentId) ? n.parentId : undefined;
    if (!byParent.has(p)) byParent.set(p, []);
    byParent.get(p)!.push(n);
  }
  const depth = new Map<string, number>();
  const slot = new Map<string, number>();
  let next = 0;
  let maxDepth = 0;
  const visit = (n: AgentNode, d: number) => {
    depth.set(n.id, d);
    maxDepth = Math.max(maxDepth, d);
    const kids = byParent.get(n.id) ?? [];
    if (!kids.length) {
      slot.set(n.id, next++);
      return;
    }
    kids.forEach((k) => visit(k, d + 1));
    const ys = kids.map((k) => slot.get(k.id)!);
    slot.set(n.id, (Math.min(...ys) + Math.max(...ys)) / 2);
  };
  (byParent.get(undefined) ?? []).forEach((r) => visit(r, 0));
  return { depth, slot, levels: maxDepth + 1, slots: Math.max(1, next) };
}

function curve(a: Pos, b: Pos, horizontal: boolean) {
  if (horizontal) {
    const mx = (a.x + b.x) / 2;
    return `M${a.x},${a.y} C${mx},${a.y} ${mx},${b.y} ${b.x},${b.y}`;
  }
  const my = (a.y + b.y) / 2;
  return `M${a.x},${a.y} C${a.x},${my} ${b.x},${my} ${b.x},${b.y}`;
}

function Packets({ path, color, reverse }: { path: string; color: string; reverse?: boolean }) {
  return (
    <>
      {[0, 0.55, 1.1].map((delay) => (
        <circle key={delay} r="2.6" fill={color}>
          <animateMotion dur="1.65s" begin={`${delay}s`} repeatCount="indefinite" path={path} keyPoints={reverse ? "1;0" : "0;1"} keyTimes="0;1" calcMode="linear" />
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.85;1" dur="1.65s" begin={`${delay}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </>
  );
}

/** Animated tree of agents: who delegated to whom, who's working, and where work is flowing. */
export function AgentGraph({
  nodes,
  links = [],
  direction = "right",
  nodeWidth = 216,
  nodeHeight = 66,
  levelGap = 64,
  siblingGap = 16,
  selectedId,
  onSelect,
  className,
}: AgentGraphProps) {
  const horizontal = direction === "right";
  const { depth, slot, levels, slots } = React.useMemo(() => layoutTree(nodes), [nodes]);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const [avail, setAvail] = React.useState<number | null>(null);

  const width = horizontal ? levels * nodeWidth + (levels - 1) * levelGap : slots * nodeWidth + (slots - 1) * siblingGap;
  const height = horizontal ? slots * nodeHeight + (slots - 1) * siblingGap : levels * nodeHeight + (levels - 1) * levelGap;

  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([e]) => setAvail(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const scale = avail ? Math.min(1, avail / width) : 1;

  const pos = (id: string): Pos => {
    const d = depth.get(id) ?? 0;
    const s = slot.get(id) ?? 0;
    return horizontal
      ? { x: d * (nodeWidth + levelGap), y: s * (nodeHeight + siblingGap) }
      : { x: s * (nodeWidth + siblingGap), y: d * (nodeHeight + levelGap) };
  };
  const out = (id: string): Pos => {
    const p = pos(id);
    return horizontal ? { x: p.x + nodeWidth, y: p.y + nodeHeight / 2 } : { x: p.x + nodeWidth / 2, y: p.y + nodeHeight };
  };
  const inn = (id: string): Pos => {
    const p = pos(id);
    return horizontal ? { x: p.x, y: p.y + nodeHeight / 2 } : { x: p.x + nodeWidth / 2, y: p.y };
  };
  const byId = new Map(nodes.map((n) => [n.id, n]));

  return (
    <div ref={wrapRef} className={cn("w-full", className)}>
      <div style={{ height: height * scale }}>
        <div className="relative origin-top-left" style={{ width, height, transform: `scale(${scale})` }}>
          <svg width={width} height={height} className="absolute inset-0 overflow-visible" aria-hidden>
            {nodes
              .filter((n) => n.parentId && byId.has(n.parentId))
              .map((n) => {
                const st = n.state ?? "idle";
                const d = curve(out(n.parentId!), inn(n.id), horizontal);
                const live = st === "working";
                const color =
                  st === "error" ? "var(--kui-danger)" : st === "waiting" ? "var(--kui-warning)" : live ? "var(--kui-accent)" : st === "done" ? "var(--kui-fg-subtle)" : "var(--kui-border-strong)";
                return (
                  <g key={n.id}>
                    <path d={d} fill="none" stroke={color} strokeWidth={live ? 1.5 : 1.2} strokeDasharray={st === "queued" ? "3 4" : live ? "5 4" : undefined} className={cn("transition-[stroke] duration-500", live && "animate-kui-dash")} />
                    {live ? <Packets path={d} color="var(--kui-accent)" /> : null}
                  </g>
                );
              })}
            {links.map((l, i) => {
              if (!byId.has(l.from) || !byId.has(l.to)) return null;
              const a = pos(l.from);
              const b = pos(l.to);
              const pa = horizontal ? { x: a.x + nodeWidth / 2, y: a.y + nodeHeight } : { x: a.x + nodeWidth, y: a.y + nodeHeight / 2 };
              const pb = horizontal ? { x: b.x + nodeWidth / 2, y: b.y } : { x: b.x, y: b.y + nodeHeight / 2 };
              const d = curve(pa, pb, !horizontal);
              return (
                <g key={`l${i}`}>
                  <path d={d} fill="none" stroke={l.active ? "var(--kui-info)" : "var(--kui-border-strong)"} strokeWidth="1.2" strokeDasharray="2 4" />
                  {l.active ? <Packets path={d} color="var(--kui-info)" /> : null}
                </g>
              );
            })}
          </svg>

          {nodes.map((n) => {
            const p = pos(n.id);
            const st = n.state ?? "idle";
            const selected = selectedId === n.id;
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => onSelect?.(n.id)}
                className={cn(
                  "absolute flex cursor-pointer flex-col justify-center gap-1 overflow-hidden rounded-kui border bg-kui-surface px-3 text-left shadow-kui animate-kui-pop",
                  "transition-[border-color,background-color,box-shadow,opacity] duration-500 ease-kui-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kui-accent/40",
                  nodeStateStyle[st],
                  st === "queued" && "opacity-70",
                  selected && "ring-2 ring-kui-fg/15",
                )}
                style={{ left: p.x, top: p.y, width: nodeWidth, height: nodeHeight, animationDelay: `${(depth.get(n.id) ?? 0) * 90}ms` }}
              >
                <span className="flex items-center gap-2.5">
                  <AgentAvatar size="xs" appearance="monogram" name={n.name} icon={n.icon} state={avatarState[st]} />
                  <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-kui-fg">{n.name}</span>
                  {st === "done" ? <Check className="size-3.5 shrink-0 text-kui-success" /> : null}
                  {st === "error" ? <CircleAlert className="size-3.5 shrink-0 text-kui-danger" /> : null}
                  {st === "waiting" ? <Pause className="size-3.5 shrink-0 fill-current text-kui-warning" /> : null}
                  {n.role && st !== "done" && st !== "error" && st !== "waiting" ? <span className="shrink-0 truncate font-mono text-[10px] text-kui-fg-subtle uppercase">{n.role}</span> : null}
                </span>
                <span className="block truncate pl-[34px] text-xs text-kui-fg-subtle">
                  {st === "working" && n.activity ? <ShimmerText>{n.activity}</ShimmerText> : (n.activity ?? n.meta ?? nodeStateLabel[st])}
                </span>
                {st === "working" ? (
                  <span className="absolute inset-x-0 bottom-0 h-[2px] overflow-hidden bg-kui-accent/10">
                    <span className="block h-full w-1/3 animate-kui-indeterminate bg-kui-accent" />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ========================================================================== */
/*                                  TraceTree                                 */
/* ========================================================================== */

export type SpanKind = "agent" | "llm" | "tool" | "retrieval" | "handoff" | "guardrail" | "step";

export interface TraceSpan {
  id: string;
  parentId?: string;
  name: string;
  kind?: SpanKind;
  /** ms from trace start. */
  start: number;
  /** ms from trace start; omit while the span is still running. */
  end?: number;
  status?: "ok" | "error";
  /** Right-aligned detail, e.g. "1.2k tok · $0.004". */
  meta?: React.ReactNode;
}

export interface TraceTreeProps {
  spans: TraceSpan[];
  /** Current time (ms from trace start) for running spans. Auto-advances when omitted. */
  now?: number;
  selectedId?: string;
  onSelect?: (id: string) => void;
  className?: string;
}

const kindMeta: Record<SpanKind, { icon: React.ReactNode; bar: string; chip: string; label: string }> = {
  agent: { icon: <Waypoints />, bar: "bg-kui-fg-muted", chip: "text-kui-fg bg-kui-surface-3", label: "agent" },
  llm: { icon: <Brain />, bar: "bg-kui-accent", chip: "text-kui-accent bg-kui-accent-soft", label: "llm" },
  tool: { icon: <Wrench />, bar: "bg-kui-info", chip: "text-kui-info bg-kui-info-soft", label: "tool" },
  retrieval: { icon: <Database />, bar: "bg-kui-success", chip: "text-kui-success bg-kui-success-soft", label: "retrieval" },
  handoff: { icon: <ArrowLeftRight />, bar: "bg-kui-warning", chip: "text-kui-warning bg-kui-warning-soft", label: "handoff" },
  guardrail: { icon: <ShieldCheck />, bar: "bg-kui-fg-subtle", chip: "text-kui-fg-muted bg-kui-surface-3", label: "guard" },
  step: { icon: <Circle />, bar: "bg-kui-fg-subtle", chip: "text-kui-fg-muted bg-kui-surface-3", label: "step" },
};

function useTraceClock(enabled: boolean, start: number) {
  const [now, setNow] = React.useState(start);
  React.useEffect(() => {
    if (!enabled) return;
    const t0 = performance.now() - start;
    const id = setInterval(() => setNow(performance.now() - t0), 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);
  return now;
}

/** Nested trace of agent, LLM and tool spans with a live waterfall timeline. */
export function TraceTree({ spans, now: nowProp, selectedId, onSelect, className }: TraceTreeProps) {
  const [collapsed, setCollapsed] = React.useState<Set<string>>(new Set());
  const running = spans.some((s) => s.end === undefined);
  const latest = Math.max(0, ...spans.map((s) => s.end ?? s.start));
  const clock = useTraceClock(running && nowProp === undefined, latest);
  const now = nowProp ?? Math.max(clock, latest);
  const total = Math.max(1, now, latest);

  const children = React.useMemo(() => {
    const m = new Map<string | undefined, TraceSpan[]>();
    const ids = new Set(spans.map((s) => s.id));
    for (const s of spans) {
      const p = s.parentId && ids.has(s.parentId) ? s.parentId : undefined;
      if (!m.has(p)) m.set(p, []);
      m.get(p)!.push(s);
    }
    m.forEach((list) => list.sort((a, b) => a.start - b.start));
    return m;
  }, [spans]);

  const rows: { span: TraceSpan; depth: number; hasKids: boolean }[] = [];
  const walk = (parent: string | undefined, depth: number) => {
    for (const s of children.get(parent) ?? []) {
      const hasKids = (children.get(s.id) ?? []).length > 0;
      rows.push({ span: s, depth, hasKids });
      if (hasKids && !collapsed.has(s.id)) walk(s.id, depth + 1);
    }
  };
  walk(undefined, 0);

  const ticks = [0, 0.25, 0.5, 0.75, 1];
  const toggle = (id: string) =>
    setCollapsed((c) => {
      const n = new Set(c);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <div className={cn("@container w-full overflow-hidden rounded-kui border border-kui-border bg-kui-surface text-[13px]", className)} role="tree">
      <div className="grid grid-cols-[minmax(180px,1fr)_minmax(0,1.3fr)_72px] items-center border-b border-kui-border bg-kui-surface-2/60 px-3 py-2 font-mono text-[10.5px] tracking-wider text-kui-fg-subtle uppercase">
        <span>Span</span>
        <span className="relative hidden h-3 @md:block">
          {ticks.map((t) => (
            <span key={t} className="absolute -translate-x-1/2 tabular-nums" style={{ left: `${t * 100}%`, transform: t === 0 ? "none" : t === 1 ? "translateX(-100%)" : undefined }}>
              {formatDuration((total * t) / 1000)}
            </span>
          ))}
        </span>
        <span className="text-right">Time</span>
      </div>
      <div className="relative">
        {/* tick guides */}
        <div className="pointer-events-none absolute inset-y-0 right-[84px] left-[calc((100%-84px)*0.435+12px)] hidden @md:block" aria-hidden>
          {ticks.slice(1, -1).map((t) => (
            <span key={t} className="absolute inset-y-0 w-px bg-kui-border/70" style={{ left: `${t * 100}%` }} />
          ))}
        </div>
        {rows.map(({ span: s, depth, hasKids }) => {
          const kind = kindMeta[s.kind ?? "step"];
          const end = s.end ?? now;
          const live = s.end === undefined;
          const err = s.status === "error";
          return (
            <div
              key={s.id}
              role="treeitem"
              aria-expanded={hasKids ? !collapsed.has(s.id) : undefined}
              aria-selected={selectedId === s.id}
              onClick={() => onSelect?.(s.id)}
              className={cn(
                "grid cursor-default grid-cols-[minmax(180px,1fr)_minmax(0,1.3fr)_72px] items-center gap-0 border-b border-kui-border/60 px-3 py-1.5 last:border-0 animate-kui-reveal",
                onSelect && "cursor-pointer hover:bg-kui-surface-2/60",
                selectedId === s.id && "bg-kui-surface-2",
              )}
            >
              <span className="flex min-w-0 items-center gap-1.5" style={{ paddingLeft: depth * 14 }}>
                {hasKids ? (
                  <button
                    type="button"
                    aria-label={collapsed.has(s.id) ? "Expand" : "Collapse"}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle(s.id);
                    }}
                    className="flex size-4 shrink-0 cursor-pointer items-center justify-center rounded text-kui-fg-subtle hover:text-kui-fg"
                  >
                    <ChevronRight className={cn("size-3.5 transition-transform duration-300 ease-kui-out", !collapsed.has(s.id) && "rotate-90")} />
                  </button>
                ) : (
                  <span className="w-4 shrink-0" />
                )}
                <span className={cn("flex size-5 shrink-0 items-center justify-center rounded [&_svg]:size-3", err ? "bg-kui-danger-soft text-kui-danger" : kind.chip)}>{kind.icon}</span>
                <span className={cn("truncate font-medium", err ? "text-kui-danger" : "text-kui-fg")}>{s.name}</span>
                {s.meta ? <span className="ml-auto hidden shrink-0 truncate pl-2 font-mono text-[10.5px] text-kui-fg-subtle @lg:inline">{s.meta}</span> : null}
              </span>
              <span className="relative ml-3 hidden h-4 @md:block">
                <span
                  className={cn(
                    "absolute top-1/2 h-2 -translate-y-1/2 rounded-full transition-[left,width] duration-300 ease-out",
                    err ? "bg-kui-danger" : kind.bar,
                    live && "kui-bar-live",
                  )}
                  style={{ left: `${(s.start / total) * 100}%`, width: `max(3px, ${((end - s.start) / total) * 100}%)` }}
                />
              </span>
              <span className={cn("text-right font-mono text-[11px] tabular-nums", live ? "text-kui-accent" : "text-kui-fg-subtle")}>{formatDuration((end - s.start) / 1000)}</span>
            </div>
          );
        })}
        {!rows.length ? <p className="px-3 py-6 text-center text-kui-fg-subtle">No spans yet.</p> : null}
      </div>
    </div>
  );
}

/* ========================================================================== */
/*                         AgentHub (radial / octopus)                        */
/* ========================================================================== */

export interface AgentHubProps {
  /** The orchestrating agent in the center. */
  hub: Omit<AgentNode, "parentId">;
  /** Agents (or tools) the hub reaches out to. */
  agents: Omit<AgentNode, "parentId">[];
  /** Square size in px (scales down to fit). Default 560. */
  size?: number;
  /** Gently sway the tentacles. Default true. */
  sway?: boolean;
  selectedId?: string;
  onSelect?: (id: string) => void;
  className?: string;
}

function tentacle(cx: number, cy: number, tx: number, ty: number, bend: number) {
  // An S-shaped curve from the hub to a satellite: perpendicular offsets in opposite directions.
  const dx = tx - cx;
  const dy = ty - cy;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const c1 = { x: cx + dx * 0.33 + nx * bend, y: cy + dy * 0.33 + ny * bend };
  const c2 = { x: cx + dx * 0.66 - nx * bend, y: cy + dy * 0.66 - ny * bend };
  return `M${cx},${cy} C${c1.x.toFixed(1)},${c1.y.toFixed(1)} ${c2.x.toFixed(1)},${c2.y.toFixed(1)} ${tx.toFixed(1)},${ty.toFixed(1)}`;
}

/** Hub-and-spoke ("octopus") view: an orchestrator reaching out to the agents it coordinates. */
export function AgentHub({ hub, agents, size = 560, sway = true, selectedId, onSelect, className }: AgentHubProps) {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const [avail, setAvail] = React.useState<number | null>(null);
  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([e]) => setAvail(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const scale = avail ? Math.min(1, avail / size) : 1;
  const c = size / 2;
  const hubR = 54;
  const orbit = size / 2 - 64;
  const nodeW = 150;
  const nodeH = 52;

  const card = (n: Omit<AgentNode, "parentId">, x: number, y: number, isHub = false, i = 0) => {
    const st = n.state ?? "idle";
    return (
      <button
        key={n.id}
        type="button"
        onClick={() => onSelect?.(n.id)}
        className={cn(
          "absolute flex cursor-pointer items-center gap-2 overflow-hidden border bg-kui-surface text-left shadow-kui animate-kui-pop",
          "transition-[border-color,background-color,opacity] duration-500 ease-kui-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kui-accent/40",
          isHub ? "flex-col justify-center gap-1 rounded-full text-center" : "rounded-kui px-2.5",
          nodeStateStyle[st],
          st === "queued" && "opacity-70",
          selectedId === n.id && "ring-2 ring-kui-fg/15",
        )}
        style={
          isHub
            ? { left: x - hubR, top: y - hubR, width: hubR * 2, height: hubR * 2 }
            : { left: x - nodeW / 2, top: y - nodeH / 2, width: nodeW, height: nodeH, animationDelay: `${120 + i * 60}ms` }
        }
      >
        <AgentAvatar size={isHub ? "sm" : "xs"} appearance="monogram" color={isHub ? "accent" : "auto"} name={n.name} icon={n.icon} state={avatarState[st]} />
        <span className={cn("min-w-0", isHub ? "px-2" : "flex-1")}>
          <span className={cn("block truncate font-semibold text-kui-fg", isHub ? "text-[12.5px]" : "text-[12.5px]")}>{n.name}</span>
          <span className="block truncate text-[11px] text-kui-fg-subtle">
            {st === "working" && n.activity ? <ShimmerText>{n.activity}</ShimmerText> : (n.activity ?? n.role ?? nodeStateLabel[st])}
          </span>
        </span>
        {st === "working" && !isHub ? (
          <span className="absolute inset-x-0 bottom-0 h-[2px] overflow-hidden bg-kui-accent/10">
            <span className="block h-full w-1/3 animate-kui-indeterminate bg-kui-accent" />
          </span>
        ) : null}
      </button>
    );
  };

  return (
    <div ref={wrapRef} className={cn("w-full", className)}>
      <div className="mx-auto" style={{ width: size * scale, height: size * scale }}>
        <div className="relative origin-top-left" style={{ width: size, height: size, transform: `scale(${scale})` }}>
          <svg width={size} height={size} className="absolute inset-0 overflow-visible" aria-hidden>
            <circle cx={c} cy={c} r={orbit} fill="none" stroke="var(--kui-border)" strokeDasharray="2 6" />
            {agents.map((a, i) => {
              const ang = (i / agents.length) * Math.PI * 2 - Math.PI / 2;
              const tx = c + Math.cos(ang) * orbit;
              const ty = c + Math.sin(ang) * orbit;
              const sx = c + Math.cos(ang) * hubR;
              const sy = c + Math.sin(ang) * hubR;
              const bend = 22 * (i % 2 ? 1 : -1);
              const d1 = tentacle(sx, sy, tx, ty, bend);
              const d2 = tentacle(sx, sy, tx, ty, -bend * 0.6);
              const st = a.state ?? "idle";
              const live = st === "working";
              const color =
                st === "error" ? "var(--kui-danger)" : st === "waiting" ? "var(--kui-warning)" : live ? "var(--kui-accent)" : st === "done" ? "var(--kui-fg-subtle)" : "var(--kui-border-strong)";
              return (
                <g key={a.id}>
                  <path d={d1} fill="none" stroke={color} strokeWidth={live ? 2 : 1.4} strokeLinecap="round" strokeDasharray={st === "queued" ? "3 5" : undefined} className="transition-[stroke] duration-500">
                    {sway && !live ? <animate attributeName="d" values={`${d1};${d2};${d1}`} dur={`${5 + (i % 3)}s`} repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" /> : null}
                  </path>
                  {live ? <Packets path={d1} color="var(--kui-accent)" /> : null}
                </g>
              );
            })}
          </svg>
          {agents.map((a, i) => {
            const ang = (i / agents.length) * Math.PI * 2 - Math.PI / 2;
            return card(a, c + Math.cos(ang) * orbit, c + Math.sin(ang) * orbit, false, i);
          })}
          {card(hub, c, c, true)}
        </div>
      </div>
    </div>
  );
}
