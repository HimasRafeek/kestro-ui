import * as React from "react";
import { AudioLines, Braces, Brain, Check, Eye, Gauge, Search, Wrench, Zap } from "lucide-react";
import { cn } from "../lib/cn";
import { formatNumber, useControllableState } from "../lib/hooks";
import { AgentAvatar, agentStateLabel, agentStateTone, type AgentState } from "./agent-avatar";
import { Badge } from "./primitives";
import { formatCost } from "./metrics";

/* ========================================================================== */
/*                                  AgentCard                                 */
/* ========================================================================== */

export interface AgentStat {
  label: React.ReactNode;
  value: React.ReactNode;
}

export interface AgentProfile {
  id: string;
  name: string;
  role?: string;
  description?: string;
  state?: AgentState;
  /** Model the agent runs on. */
  model?: string;
  tools?: string[];
  stats?: AgentStat[];
  avatar?: string;
}

export interface AgentCardProps {
  agent: AgentProfile;
  selected?: boolean;
  onSelect?: (id: string) => void;
  /** Footer actions (buttons). */
  actions?: React.ReactNode;
  /** Max tool chips before "+N". Default 4. */
  maxTools?: number;
  className?: string;
}

/** Profile card for an agent: identity, status, model, tools and key stats. */
export function AgentCard({ agent, selected, onSelect, actions, maxTools = 4, className }: AgentCardProps) {
  const tools = agent.tools ?? [];
  const Tag = onSelect ? "button" : "div";
  return (
    <div className={cn("flex w-full flex-col overflow-hidden rounded-kui border bg-kui-surface shadow-kui transition-[border-color,box-shadow] duration-300 ease-kui-out animate-kui-pop", selected ? "border-kui-accent ring-2 ring-kui-accent/20" : "border-kui-border", className)}>
      <Tag
        type={onSelect ? "button" : undefined}
        onClick={onSelect ? () => onSelect(agent.id) : undefined}
        aria-pressed={onSelect ? selected : undefined}
        className={cn("flex flex-1 flex-col gap-3 p-4 text-left", onSelect && "cursor-pointer hover:bg-kui-surface-2/50 focus-visible:outline-none")}
      >
        <div className="flex items-start gap-3">
          <AgentAvatar size="md" appearance="monogram" name={agent.name} src={agent.avatar} state={agent.state} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-[15px] font-semibold text-kui-fg">{agent.name}</span>
              {selected ? <Check className="size-4 shrink-0 text-kui-accent" /> : null}
            </div>
            {agent.role ? <span className="block truncate text-[13px] text-kui-fg-muted">{agent.role}</span> : null}
          </div>
          {agent.state ? <Badge tone={agentStateTone[agent.state]} dot pulse={agent.state === "working" || agent.state === "thinking"}>{agentStateLabel[agent.state]}</Badge> : null}
        </div>
        {agent.description ? <p className="line-clamp-2 text-[13px] leading-relaxed text-kui-fg-muted">{agent.description}</p> : null}
        {agent.model || tools.length ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {agent.model ? <ModelBadge name={agent.model} /> : null}
            {tools.slice(0, maxTools).map((t) => (
              <span key={t} className="inline-flex h-6 items-center gap-1 rounded-md bg-kui-surface-2 px-2 font-mono text-[11px] text-kui-fg-muted">
                <Wrench className="size-3 text-kui-fg-subtle" />
                {t}
              </span>
            ))}
            {tools.length > maxTools ? <span className="text-[11px] text-kui-fg-subtle">+{tools.length - maxTools}</span> : null}
          </div>
        ) : null}
        {agent.stats?.length ? (
          <dl className="mt-auto grid grid-cols-3 gap-2 border-t border-kui-border pt-3">
            {agent.stats.slice(0, 3).map((s, i) => (
              <div key={i} className="min-w-0">
                <dt className="truncate text-[11px] text-kui-fg-subtle">{s.label}</dt>
                <dd className="truncate font-mono text-sm font-semibold text-kui-fg tabular-nums">{s.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </Tag>
      {actions ? <div className="flex gap-2 border-t border-kui-border bg-kui-surface-2/40 px-4 py-2.5">{actions}</div> : null}
    </div>
  );
}

/* ========================================================================== */
/*                                 AgentPicker                                */
/* ========================================================================== */

export interface AgentPickerProps {
  agents: AgentProfile[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  placeholder?: string;
  /** Max list height before scrolling. Default 320. */
  maxHeight?: number;
  className?: string;
}

/** Searchable list for choosing which agent handles something. */
export function AgentPicker({ agents, value, defaultValue, onValueChange, placeholder = "Search agents…", maxHeight = 320, className }: AgentPickerProps) {
  const [selected, setSelected] = useControllableState({ value, defaultValue: defaultValue ?? "", onChange: onValueChange });
  const [q, setQ] = React.useState("");
  const [active, setActive] = React.useState(0);
  const list = agents.filter((a) => `${a.name} ${a.role ?? ""} ${a.description ?? ""} ${(a.tools ?? []).join(" ")}`.toLowerCase().includes(q.toLowerCase()));
  const id = React.useId();

  return (
    <div className={cn("w-full overflow-hidden rounded-kui border border-kui-border bg-kui-surface", className)}>
      <label className="flex h-10 items-center gap-2 border-b border-kui-border px-3 text-kui-fg-subtle">
        <Search className="size-4 shrink-0" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setActive(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(list.length - 1, a + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(0, a - 1));
            } else if (e.key === "Enter" && list[active]) {
              e.preventDefault();
              setSelected(list[active].id);
            }
          }}
          placeholder={placeholder}
          aria-controls={id}
          className="min-w-0 flex-1 bg-transparent text-sm text-kui-fg placeholder:text-kui-fg-subtle focus:outline-none"
        />
      </label>
      <ul id={id} role="listbox" className="kui-scrollbar overflow-y-auto p-1" style={{ maxHeight }}>
        {list.map((a, i) => {
          const isSel = a.id === selected;
          return (
            <li
              key={a.id}
              role="option"
              aria-selected={isSel}
              onMouseEnter={() => setActive(i)}
              onClick={() => setSelected(a.id)}
              className={cn("flex cursor-pointer items-center gap-3 rounded-kui-sm px-2.5 py-2 transition-colors", i === active && "bg-kui-surface-2")}
            >
              <AgentAvatar size="sm" appearance="monogram" name={a.name} src={a.avatar} state={a.state} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-[13.5px] font-medium text-kui-fg">{a.name}</span>
                  {a.role ? <span className="truncate text-xs text-kui-fg-subtle">{a.role}</span> : null}
                </span>
                {a.description ? <span className="block truncate text-xs text-kui-fg-muted">{a.description}</span> : null}
              </span>
              {a.model ? <span className="hidden shrink-0 font-mono text-[11px] text-kui-fg-subtle sm:inline">{a.model}</span> : null}
              <span className={cn("flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors", isSel ? "border-kui-accent bg-kui-accent text-kui-accent-fg" : "border-kui-border-strong")}>
                {isSel ? <Check className="size-3" strokeWidth={3} /> : null}
              </span>
            </li>
          );
        })}
        {!list.length ? <li className="px-3 py-6 text-center text-sm text-kui-fg-subtle">No agents match “{q}”.</li> : null}
      </ul>
    </div>
  );
}

/* ========================================================================== */
/*                                Model components                            */
/* ========================================================================== */

export type ModelCapability = "vision" | "tools" | "reasoning" | "audio" | "json" | "fast";

const capMeta: Record<ModelCapability, { label: string; icon: React.ReactNode }> = {
  vision: { label: "Vision", icon: <Eye /> },
  tools: { label: "Tools", icon: <Wrench /> },
  reasoning: { label: "Reasoning", icon: <Brain /> },
  audio: { label: "Audio", icon: <AudioLines /> },
  json: { label: "JSON", icon: <Braces /> },
  fast: { label: "Fast", icon: <Zap /> },
};

export interface ModelInfo {
  id: string;
  name: string;
  provider?: string;
  description?: string;
  /** Context window in tokens. */
  context?: number;
  /** Max output tokens. */
  maxOutput?: number;
  /** Price per 1M tokens. */
  pricing?: { input: number; output: number };
  /** Output speed in tokens per second. */
  speed?: number;
  /** Time to first token in ms. */
  latency?: number;
  /** 1–5 relative quality score. */
  quality?: number;
  capabilities?: ModelCapability[];
  badge?: string;
}

function providerTone(p = "") {
  let h = 0;
  for (let i = 0; i < p.length; i++) h = (h * 31 + p.charCodeAt(i)) >>> 0;
  return ["oklch(0.8 0.045 245)", "oklch(0.86 0.06 85)", "oklch(0.82 0.05 150)", "oklch(0.8 0.06 40)", "oklch(0.8 0.045 200)"][h % 5];
}

/** Inline model chip: provider tile, name and optional context size. */
export function ModelBadge({ name, provider, context, className }: { name: string; provider?: string; context?: number; className?: string }) {
  return (
    <span className={cn("inline-flex h-6 max-w-full items-center gap-1.5 rounded-md border border-kui-border bg-kui-surface pr-2 pl-1 text-[12px] text-kui-fg", className)}>
      <span className="flex size-4 shrink-0 items-center justify-center rounded-[4px] text-[9px] font-bold text-[oklch(0.2_0.014_255)]" style={{ background: providerTone(provider ?? name) }}>
        {(provider ?? name)[0]?.toUpperCase()}
      </span>
      <span className="truncate font-medium">{name}</span>
      {context ? <span className="shrink-0 font-mono text-[10.5px] text-kui-fg-subtle">{formatNumber(context)}</span> : null}
    </span>
  );
}

function Dots({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <span className="inline-flex gap-[3px]" aria-label={`${value} of ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={cn("h-1.5 w-3 rounded-full", i < value ? "bg-kui-fg-muted" : "bg-kui-surface-3")} />
      ))}
    </span>
  );
}

export interface ModelCardProps {
  model: ModelInfo;
  selected?: boolean;
  onSelect?: (id: string) => void;
  currency?: string;
  className?: string;
}

/** Spec card for a model: context, pricing, speed, quality and capabilities. */
export function ModelCard({ model: m, selected, onSelect, currency = "$", className }: ModelCardProps) {
  const Tag = onSelect ? "button" : "div";
  return (
    <Tag
      type={onSelect ? "button" : undefined}
      onClick={onSelect ? () => onSelect(m.id) : undefined}
      aria-pressed={onSelect ? selected : undefined}
      className={cn(
        "flex w-full flex-col gap-3 rounded-kui border bg-kui-surface p-4 text-left shadow-kui transition-[border-color,box-shadow,transform] duration-300 ease-kui-out animate-kui-pop",
        onSelect && "cursor-pointer hover:-translate-y-px hover:border-kui-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kui-accent/40",
        selected ? "border-kui-accent ring-2 ring-kui-accent/20" : "border-kui-border",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-[oklch(0.2_0.014_255)]" style={{ background: providerTone(m.provider ?? m.name) }}>
          {(m.provider ?? m.name)[0]?.toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-[15px] font-semibold text-kui-fg">{m.name}</span>
            {m.badge ? <Badge tone="accent">{m.badge}</Badge> : null}
          </div>
          {m.provider ? <span className="text-[13px] text-kui-fg-subtle">{m.provider}</span> : null}
        </div>
        {selected ? <Check className="size-4 shrink-0 text-kui-accent" /> : null}
      </div>
      {m.description ? <p className="text-[13px] leading-relaxed text-kui-fg-muted">{m.description}</p> : null}
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[13px]">
        {m.context ? (
          <div>
            <dt className="text-[11px] text-kui-fg-subtle">Context</dt>
            <dd className="font-mono text-kui-fg tabular-nums">{formatNumber(m.context)} tokens</dd>
          </div>
        ) : null}
        {m.pricing ? (
          <div>
            <dt className="text-[11px] text-kui-fg-subtle">Price / 1M (in · out)</dt>
            <dd className="font-mono text-kui-fg tabular-nums">
              {formatCost(m.pricing.input, currency)} · {formatCost(m.pricing.output, currency)}
            </dd>
          </div>
        ) : null}
        {m.speed ? (
          <div>
            <dt className="text-[11px] text-kui-fg-subtle">Speed</dt>
            <dd className="flex items-center gap-1.5 font-mono text-kui-fg tabular-nums">
              <Gauge className="size-3.5 text-kui-fg-subtle" />
              {m.speed} tok/s
            </dd>
          </div>
        ) : null}
        {m.quality ? (
          <div>
            <dt className="text-[11px] text-kui-fg-subtle">Quality</dt>
            <dd className="pt-1">
              <Dots value={m.quality} />
            </dd>
          </div>
        ) : null}
      </dl>
      {m.capabilities?.length ? (
        <div className="flex flex-wrap gap-1.5 border-t border-kui-border pt-3">
          {m.capabilities.map((c) => (
            <span key={c} className="inline-flex h-6 items-center gap-1 rounded-md bg-kui-surface-2 px-2 text-[11px] text-kui-fg-muted [&_svg]:size-3">
              {capMeta[c].icon}
              {capMeta[c].label}
            </span>
          ))}
        </div>
      ) : null}
    </Tag>
  );
}

export interface ModelCompareProps {
  models: ModelInfo[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  currency?: string;
  /** Capabilities to show as columns. Default: tools, vision, reasoning. */
  capabilities?: ModelCapability[];
  className?: string;
}

/** Side-by-side model comparison. The best value in each numeric column is highlighted. */
export function ModelCompare({ models, selectedId, onSelect, currency = "$", capabilities = ["tools", "vision", "reasoning"], className }: ModelCompareProps) {
  const best = {
    context: Math.max(...models.map((m) => m.context ?? 0)),
    input: Math.min(...models.map((m) => m.pricing?.input ?? Infinity)),
    output: Math.min(...models.map((m) => m.pricing?.output ?? Infinity)),
    speed: Math.max(...models.map((m) => m.speed ?? 0)),
    quality: Math.max(...models.map((m) => m.quality ?? 0)),
  };
  const hl = (on: boolean) => (on ? "font-semibold text-kui-success" : "text-kui-fg");
  return (
    <div className={cn("kui-scrollbar w-full overflow-x-auto rounded-kui border border-kui-border bg-kui-surface", className)}>
      <table className="w-full min-w-[640px] text-left text-[13px]">
        <thead className="bg-kui-surface-2/60 text-[11px] font-medium tracking-wide text-kui-fg-subtle uppercase">
          <tr>
            <th className="px-4 py-2.5 font-medium">Model</th>
            <th className="px-3 py-2.5 text-right font-medium">Context</th>
            <th className="px-3 py-2.5 text-right font-medium">In / 1M</th>
            <th className="px-3 py-2.5 text-right font-medium">Out / 1M</th>
            <th className="px-3 py-2.5 text-right font-medium">Speed</th>
            <th className="px-3 py-2.5 font-medium">Quality</th>
            {capabilities.map((c) => (
              <th key={c} className="px-3 py-2.5 text-center font-medium">
                {capMeta[c].label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {models.map((m) => (
            <tr
              key={m.id}
              onClick={() => onSelect?.(m.id)}
              aria-selected={selectedId === m.id}
              className={cn("border-t border-kui-border transition-colors", onSelect && "cursor-pointer hover:bg-kui-surface-2/60", selectedId === m.id && "bg-kui-accent-soft")}
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {selectedId === m.id ? <Check className="size-3.5 shrink-0 text-kui-accent" /> : <span className="w-3.5" />}
                  <ModelBadge name={m.name} provider={m.provider} />
                  {m.badge ? <Badge tone="accent">{m.badge}</Badge> : null}
                </div>
              </td>
              <td className={cn("px-3 py-3 text-right font-mono tabular-nums", hl(!!m.context && m.context === best.context))}>{m.context ? formatNumber(m.context) : "—"}</td>
              <td className={cn("px-3 py-3 text-right font-mono tabular-nums", hl(m.pricing?.input === best.input))}>{m.pricing ? formatCost(m.pricing.input, currency) : "—"}</td>
              <td className={cn("px-3 py-3 text-right font-mono tabular-nums", hl(m.pricing?.output === best.output))}>{m.pricing ? formatCost(m.pricing.output, currency) : "—"}</td>
              <td className={cn("px-3 py-3 text-right font-mono tabular-nums", hl(!!m.speed && m.speed === best.speed))}>{m.speed ? `${m.speed}/s` : "—"}</td>
              <td className="px-3 py-3">{m.quality ? <Dots value={m.quality} /> : "—"}</td>
              {capabilities.map((c) => (
                <td key={c} className="px-3 py-3 text-center">
                  {m.capabilities?.includes(c) ? <Check className="mx-auto size-4 text-kui-success" /> : <span className="text-kui-fg-subtle">—</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ========================================================================== */
/*                               ModelUsageTable                              */
/* ========================================================================== */

export interface ModelUsageRow {
  id: string;
  name: string;
  provider?: string;
  requests: number;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  /** Average latency in ms. */
  latency?: number;
  /** Percent change in cost vs. previous period. */
  delta?: number;
}

export interface ModelUsageTableProps {
  rows: ModelUsageRow[];
  currency?: string;
  /** Period caption, e.g. "Last 30 days". */
  period?: React.ReactNode;
  onSelect?: (id: string) => void;
  className?: string;
}

/** Usage per model: requests, tokens, cost, share of spend and latency, with a totals row. */
export function ModelUsageTable({ rows, currency = "$", period, onSelect, className }: ModelUsageTableProps) {
  const totalCost = rows.reduce((a, r) => a + r.cost, 0);
  const sorted = [...rows].sort((a, b) => b.cost - a.cost);
  const sum = (k: "requests" | "inputTokens" | "outputTokens") => rows.reduce((a, r) => a + r[k], 0);
  return (
    <div className={cn("kui-scrollbar w-full overflow-x-auto rounded-kui border border-kui-border bg-kui-surface", className)}>
      {period ? <div className="border-b border-kui-border px-4 py-2.5 text-[13px] font-medium text-kui-fg">Usage by model <span className="font-normal text-kui-fg-subtle">· {period}</span></div> : null}
      <table className="w-full min-w-[680px] text-left text-[13px]">
        <thead className="text-[11px] font-medium tracking-wide text-kui-fg-subtle uppercase">
          <tr>
            <th className="px-4 py-2 font-medium">Model</th>
            <th className="px-3 py-2 text-right font-medium">Requests</th>
            <th className="px-3 py-2 text-right font-medium">Input</th>
            <th className="px-3 py-2 text-right font-medium">Output</th>
            <th className="px-3 py-2 text-right font-medium">Latency</th>
            <th className="px-3 py-2 font-medium">Share of spend</th>
            <th className="px-4 py-2 text-right font-medium">Cost</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => {
            const share = totalCost ? (r.cost / totalCost) * 100 : 0;
            return (
              <tr key={r.id} onClick={() => onSelect?.(r.id)} className={cn("border-t border-kui-border animate-kui-reveal", onSelect && "cursor-pointer hover:bg-kui-surface-2/60")}>
                <td className="px-4 py-2.5">
                  <ModelBadge name={r.name} provider={r.provider} />
                </td>
                <td className="px-3 py-2.5 text-right font-mono tabular-nums">{r.requests.toLocaleString()}</td>
                <td className="px-3 py-2.5 text-right font-mono text-kui-fg-muted tabular-nums">{formatNumber(r.inputTokens)}</td>
                <td className="px-3 py-2.5 text-right font-mono text-kui-fg-muted tabular-nums">{formatNumber(r.outputTokens)}</td>
                <td className="px-3 py-2.5 text-right font-mono text-kui-fg-muted tabular-nums">{r.latency !== undefined ? `${(r.latency / 1000).toFixed(r.latency < 10000 ? 2 : 1)}s` : "—"}</td>
                <td className="px-3 py-2.5">
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-24 overflow-hidden rounded-full bg-kui-surface-3">
                      <span className="block h-full rounded-full bg-kui-accent transition-[width] duration-700 ease-kui-out" style={{ width: `${share}%` }} />
                    </span>
                    <span className="w-9 font-mono text-xs text-kui-fg-subtle tabular-nums">{Math.round(share)}%</span>
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <span className="flex items-center justify-end gap-2">
                    {r.delta !== undefined ? (
                      <span className={cn("font-mono text-[10.5px] tabular-nums", r.delta > 0 ? "text-kui-danger" : "text-kui-success")}>
                        {r.delta > 0 ? "▲" : "▼"}
                        {Math.abs(r.delta).toFixed(0)}%
                      </span>
                    ) : null}
                    <span className="font-mono font-semibold text-kui-fg tabular-nums">{formatCost(r.cost, currency)}</span>
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t border-kui-border-strong bg-kui-surface-2/40 font-medium">
            <td className="px-4 py-2.5 text-kui-fg">Total</td>
            <td className="px-3 py-2.5 text-right font-mono tabular-nums">{sum("requests").toLocaleString()}</td>
            <td className="px-3 py-2.5 text-right font-mono tabular-nums">{formatNumber(sum("inputTokens"))}</td>
            <td className="px-3 py-2.5 text-right font-mono tabular-nums">{formatNumber(sum("outputTokens"))}</td>
            <td />
            <td />
            <td className="px-4 py-2.5 text-right font-mono font-semibold text-kui-fg tabular-nums">{formatCost(totalCost, currency)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
