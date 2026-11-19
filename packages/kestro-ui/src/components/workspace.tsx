import * as React from "react";
import { Check, Copy, Download, MessageSquare, Plus, Search, Trash2, X } from "lucide-react";
import { cn } from "../lib/cn";
import { useCopyToClipboard } from "../lib/hooks";
import { Button, IconButton, Kbd, Spinner } from "./primitives";

/* -------------------------------------------------------------------------- */
/*                                  Artifact                                  */
/* -------------------------------------------------------------------------- */

export interface ArtifactTab {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

export interface ArtifactProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  tabs?: ArtifactTab[];
  defaultTab?: string;
  /** Text for the built-in copy button. */
  copyText?: string;
  onDownload?: () => void;
  onClose?: () => void;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  /** Body when not using tabs. */
  children?: React.ReactNode;
  className?: string;
}

/** Side panel / card for generated documents, code, charts, itineraries, etc. */
export function Artifact({
  title,
  subtitle,
  icon,
  tabs,
  defaultTab,
  copyText,
  onDownload,
  onClose,
  actions,
  footer,
  children,
  className,
}: ArtifactProps) {
  const [tab, setTab] = React.useState(defaultTab ?? tabs?.[0]?.id);
  const { copied, copy } = useCopyToClipboard();
  const current = tabs?.find((t) => t.id === tab);

  return (
    <div className={cn("flex min-h-0 w-full flex-col overflow-hidden rounded-kui-lg border border-kui-border bg-kui-surface shadow-kui", className)}>
      <div className="flex items-center gap-3 border-b border-kui-border px-4 py-3">
        {icon ? (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-kui-accent-soft text-kui-accent [&_svg]:size-4">{icon}</span>
        ) : null}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-kui-fg">{title}</h3>
          {subtitle ? <p className="truncate text-xs text-kui-fg-subtle">{subtitle}</p> : null}
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          {actions}
          {copyText !== undefined ? (
            <IconButton label={copied ? "Copied" : "Copy"} onClick={() => copy(copyText)}>
              {copied ? <Check className="text-kui-success" /> : <Copy />}
            </IconButton>
          ) : null}
          {onDownload ? (
            <IconButton label="Download" onClick={onDownload}>
              <Download />
            </IconButton>
          ) : null}
          {onClose ? (
            <IconButton label="Close" onClick={onClose}>
              <X />
            </IconButton>
          ) : null}
        </div>
      </div>
      {tabs?.length ? (
        <div role="tablist" className="flex gap-1 border-b border-kui-border px-3 py-1.5">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={t.id === tab}
              onClick={() => setTab(t.id)}
              className={cn(
                "inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium transition-colors [&_svg]:size-3.5",
                t.id === tab ? "bg-kui-surface-3 text-kui-fg" : "text-kui-fg-subtle hover:text-kui-fg",
              )}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      ) : null}
      <div className="kui-scrollbar min-h-0 flex-1 overflow-auto">{current ? current.content : children}</div>
      {footer ? <div className="border-t border-kui-border px-4 py-2 text-xs text-kui-fg-subtle">{footer}</div> : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              ConversationList                              */
/* -------------------------------------------------------------------------- */

export interface ConversationItem {
  id: string;
  title: string;
  /** Group heading, e.g. "Today", "Previous 7 days". */
  group?: string;
  icon?: React.ReactNode;
  /** Show a spinner — the agent is working in this thread. */
  running?: boolean;
  unread?: boolean;
}

export interface ConversationListProps {
  items: ConversationItem[];
  activeId?: string;
  onSelect?: (id: string) => void;
  onNew?: () => void;
  onDelete?: (id: string) => void;
  newLabel?: React.ReactNode;
  searchable?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

/** Sidebar with threads grouped by date, search and "New chat". */
export function ConversationList({
  items,
  activeId,
  onSelect,
  onNew,
  onDelete,
  newLabel = "New chat",
  searchable = true,
  header,
  footer,
  className,
}: ConversationListProps) {
  const [query, setQuery] = React.useState("");
  const filtered = query ? items.filter((i) => i.title.toLowerCase().includes(query.toLowerCase())) : items;
  const groups = React.useMemo(() => {
    const map = new Map<string, ConversationItem[]>();
    for (const it of filtered) {
      const g = it.group ?? "";
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(it);
    }
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <nav className={cn("flex h-full min-h-0 w-full flex-col bg-kui-bg", className)} aria-label="Conversations">
      {header ? <div className="px-3 pt-3">{header}</div> : null}
      <div className="space-y-2 p-3">
        {onNew ? (
          <Button variant="accent" className="w-full justify-start" onClick={onNew}>
            <Plus /> {newLabel}
          </Button>
        ) : null}
        {searchable ? (
          <label className="flex h-9 items-center gap-2 rounded-kui-sm border border-kui-border bg-kui-surface px-2.5 text-kui-fg-subtle focus-within:border-kui-border-strong">
            <Search className="size-4 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="min-w-0 flex-1 bg-transparent text-[13px] text-kui-fg placeholder:text-kui-fg-subtle focus:outline-none"
            />
            <Kbd>⌘K</Kbd>
          </label>
        ) : null}
      </div>
      <div className="kui-scrollbar min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {groups.map(([group, list]) => (
          <div key={group} className="mb-3">
            {group ? <div className="px-2.5 pt-2 pb-1.5 text-[11px] font-semibold tracking-wide text-kui-fg-subtle uppercase">{group}</div> : null}
            <ul className="space-y-px">
              {list.map((it) => {
                const active = it.id === activeId;
                return (
                  <li key={it.id} className="group/item relative">
                    <button
                      type="button"
                      onClick={() => onSelect?.(it.id)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-kui-sm px-2.5 text-left text-[13.5px] transition-colors",
                        active ? "bg-kui-surface-3 font-medium text-kui-fg" : "text-kui-fg-muted hover:bg-kui-surface-2 hover:text-kui-fg",
                        onDelete && "pr-9",
                      )}
                    >
                      <span className="shrink-0 text-kui-fg-subtle [&_svg]:size-4">
                        {it.running ? <Spinner className="size-4 text-kui-accent" /> : (it.icon ?? <MessageSquare />)}
                      </span>
                      <span className="truncate">{it.title}</span>
                      {it.unread ? <span className="ml-auto size-1.5 shrink-0 rounded-full bg-kui-accent" /> : null}
                    </button>
                    {onDelete ? (
                      <button
                        type="button"
                        aria-label={`Delete ${it.title}`}
                        onClick={() => onDelete(it.id)}
                        className="absolute top-1/2 right-1.5 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-kui-fg-subtle opacity-0 transition-opacity group-hover/item:opacity-100 hover:bg-kui-surface-3 hover:text-kui-danger focus-visible:opacity-100"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        {!filtered.length ? <p className="px-3 py-6 text-center text-[13px] text-kui-fg-subtle">No conversations found</p> : null}
      </div>
      {footer ? <div className="border-t border-kui-border p-3">{footer}</div> : null}
    </nav>
  );
}
