import * as React from "react";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { cn } from "../lib/cn";
import { Collapse } from "./primitives";

export interface Source {
  id?: string;
  url: string;
  title?: string;
  snippet?: string;
  /** Favicon URL. When omitted a colored letter tile is generated from the domain. */
  favicon?: string;
}

export function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function hueFrom(text: string) {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) % 360;
  return h;
}

export function SourceIcon({ source, className }: { source: Source; className?: string }) {
  const domain = getDomain(source.url);
  const [failed, setFailed] = React.useState(false);
  if (source.favicon && !failed) {
    return (
      <img
        src={source.favicon}
        alt=""
        onError={() => setFailed(true)}
        className={cn("size-4 shrink-0 rounded-[4px] bg-white object-contain", className)}
      />
    );
  }
  const hue = hueFrom(domain);
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex size-4 shrink-0 items-center justify-center rounded-[4px] text-[9px] font-bold text-white uppercase",
        className,
      )}
      style={{ background: `oklch(0.62 0.14 ${hue})` }}
    >
      {domain[0]}
    </span>
  );
}

/* -------------------------------------------------------------------------- */

export interface SourcesProps {
  sources: Source[];
  defaultOpen?: boolean;
  /** Label override, receives the count. */
  label?: (count: number) => React.ReactNode;
  className?: string;
}

/** Collapsible "Used N sources" block with favicon stack. */
export function Sources({ sources, defaultOpen = false, label, className }: SourcesProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  if (!sources.length) return null;
  return (
    <div className={cn("@container w-full", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="group inline-flex h-8 cursor-pointer items-center gap-2 rounded-full border border-kui-border bg-kui-surface py-1 pr-2.5 pl-1.5 text-xs font-medium text-kui-fg-muted transition-colors hover:bg-kui-surface-2 hover:text-kui-fg"
      >
        <span className="flex -space-x-1.5">
          {sources.slice(0, 4).map((s, i) => (
            <SourceIcon key={s.id ?? i} source={s} className="size-[18px] rounded-full ring-2 ring-kui-surface" />
          ))}
        </span>
        {label ? label(sources.length) : `${sources.length} source${sources.length === 1 ? "" : "s"}`}
        <ChevronDown className={cn("size-3.5 transition-transform duration-300 ease-kui-out", open && "rotate-180")} />
      </button>
      <Collapse open={open}>
        <ol className="mt-2 grid gap-1.5 @lg:grid-cols-2">
          {sources.map((s, i) => (
            <li key={s.id ?? i}>
              <SourceCard source={s} index={i + 1} />
            </li>
          ))}
        </ol>
      </Collapse>
    </div>
  );
}

export function SourceCard({ source, index, className }: { source: Source; index?: number; className?: string }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group flex h-full items-start gap-2.5 rounded-kui-sm border border-kui-border bg-kui-surface p-2.5 transition-colors hover:border-kui-border-strong hover:bg-kui-surface-2",
        className,
      )}
    >
      <SourceIcon source={source} className="mt-0.5" />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-[13px] font-medium text-kui-fg">
          {index !== undefined && <span className="text-kui-fg-subtle tabular-nums">[{index}]</span>}
          <span className="truncate">{source.title ?? getDomain(source.url)}</span>
        </span>
        <span className="block truncate text-xs text-kui-fg-subtle">{getDomain(source.url)}</span>
        {source.snippet ? (
          <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-kui-fg-muted">{source.snippet}</span>
        ) : null}
      </span>
      <ArrowUpRight className="size-3.5 shrink-0 text-kui-fg-subtle opacity-0 transition-opacity group-hover:opacity-100" />
    </a>
  );
}

/** Pill-shaped source link: "[1] Title ↗" */
export function SourceChip({ source, index, className }: { source: Source; index?: number; className?: string }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex h-7 max-w-64 items-center gap-1.5 rounded-kui-sm border border-kui-border bg-kui-surface px-2 text-xs text-kui-fg-muted transition-colors hover:border-kui-border-strong hover:text-kui-fg",
        className,
      )}
    >
      {index !== undefined ? (
        <span className="text-kui-fg-subtle tabular-nums">[{index}]</span>
      ) : (
        <SourceIcon source={source} className="size-3.5" />
      )}
      <span className="truncate">{source.title ?? getDomain(source.url)}</span>
      <ArrowUpRight className="size-3 shrink-0 text-kui-fg-subtle" />
    </a>
  );
}

/** Inline numbered citation with a hover card preview. */
export function InlineCitation({ index, source }: { index: number; source?: Source }) {
  if (!source) {
    return <sup className="text-kui-fg-subtle">[{index}]</sup>;
  }
  return (
    <span className="group/cite relative inline-block align-baseline">
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mx-0.5 inline-flex h-[18px] min-w-[18px] -translate-y-px items-center justify-center rounded-md bg-kui-surface-3 px-1 text-[10.5px] font-semibold text-kui-fg-muted no-underline tabular-nums transition-colors hover:bg-kui-accent hover:text-kui-accent-fg"
      >
        {index}
      </a>
      <span className="pointer-events-none invisible absolute bottom-full left-1/2 z-50 mb-2 w-72 -translate-x-1/2 translate-y-1 rounded-kui-sm border border-kui-border bg-kui-surface p-3 text-left opacity-0 shadow-kui-lg transition-all duration-300 ease-kui-out group-hover/cite:pointer-events-auto group-hover/cite:visible group-hover/cite:translate-y-0 group-hover/cite:opacity-100">
        <span className="flex items-center gap-2 text-xs text-kui-fg-subtle">
          <SourceIcon source={source} />
          {getDomain(source.url)}
        </span>
        <span className="mt-1.5 block text-[13px] leading-snug font-medium text-kui-fg">
          {source.title ?? source.url}
        </span>
        {source.snippet ? (
          <span className="mt-1 line-clamp-3 block text-xs leading-relaxed font-normal text-kui-fg-muted">
            {source.snippet}
          </span>
        ) : null}
      </span>
    </span>
  );
}
