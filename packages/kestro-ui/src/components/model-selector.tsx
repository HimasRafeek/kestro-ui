import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "../lib/cn";
import { useControllableState, useDismiss } from "../lib/hooks";

export interface ModelOption {
  id: string;
  name: string;
  description?: string;
  icon?: React.ReactNode;
  /** Small tag, e.g. "Fast", "Reasoning", "New". */
  badge?: string;
  disabled?: boolean;
}

export interface ModelSelectorProps {
  models: ModelOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  /** Which side the menu opens on. Defaults to "top" (good inside a prompt input). */
  side?: "top" | "bottom";
  align?: "start" | "end";
  /** Header label inside the menu. */
  label?: React.ReactNode;
  className?: string;
}

/** Dropdown for picking a model, agent, persona or mode. */
export function ModelSelector({
  models,
  value,
  defaultValue,
  onValueChange,
  side = "top",
  align = "start",
  label,
  className,
}: ModelSelectorProps) {
  const [selected, setSelected] = useControllableState({
    value,
    defaultValue: defaultValue ?? models[0]?.id ?? "",
    onChange: onValueChange,
  });
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const id = React.useId();
  useDismiss(rootRef, open, () => setOpen(false));

  const current = models.find((m) => m.id === selected) ?? models[0];

  React.useEffect(() => {
    if (open) {
      setActive(Math.max(0, models.findIndex((m) => m.id === selected)));
      requestAnimationFrame(() => listRef.current?.focus());
    }
  }, [open, models, selected]);

  const choose = (m: ModelOption) => {
    if (m.disabled) return;
    setSelected(m.id);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % models.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + models.length) % models.length);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const m = models[active];
      if (m) choose(m);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className={cn("relative inline-flex", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "inline-flex h-8 max-w-56 cursor-pointer items-center gap-1.5 rounded-kui-sm px-2.5 text-[13px] font-medium text-kui-fg-muted transition-colors",
          "hover:bg-kui-surface-2 hover:text-kui-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kui-accent/40",
          open && "bg-kui-surface-2 text-kui-fg",
        )}
      >
        {current?.icon ? <span className="shrink-0 [&_svg]:size-4">{current.icon}</span> : null}
        <span className="truncate">{current?.name ?? "Select"}</span>
        <ChevronDown className={cn("size-3.5 shrink-0 opacity-60 transition-transform", open && "rotate-180")} />
      </button>

      {open ? (
        <div
          ref={listRef}
          id={id}
          role="listbox"
          tabIndex={-1}
          aria-activedescendant={`${id}-${active}`}
          onKeyDown={onKeyDown}
          className={cn(
            "absolute z-50 w-72 rounded-kui border border-kui-border bg-kui-surface p-1 shadow-kui-lg animate-kui-pop focus:outline-none",
            side === "top" ? "bottom-full mb-2" : "top-full mt-2",
            align === "start" ? "left-0" : "right-0",
          )}
        >
          {label ? <div className="px-2.5 pt-1.5 pb-1 text-[11px] font-semibold tracking-wide text-kui-fg-subtle uppercase">{label}</div> : null}
          {models.map((m, i) => {
            const isSelected = m.id === current?.id;
            return (
              <div
                key={m.id}
                id={`${id}-${i}`}
                role="option"
                aria-selected={isSelected}
                aria-disabled={m.disabled}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(m)}
                className={cn(
                  "flex cursor-pointer items-start gap-2.5 rounded-[calc(var(--kui-radius)*0.6)] px-2.5 py-2 transition-colors",
                  i === active && "bg-kui-surface-2",
                  m.disabled && "cursor-not-allowed opacity-45",
                )}
              >
                {m.icon ? <span className="mt-0.5 shrink-0 text-kui-fg-muted [&_svg]:size-4">{m.icon}</span> : null}
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 text-[13px] font-medium text-kui-fg">
                    {m.name}
                    {m.badge ? (
                      <span className="rounded-full bg-kui-accent-soft px-1.5 py-px text-[10px] font-semibold text-kui-accent">
                        {m.badge}
                      </span>
                    ) : null}
                  </span>
                  {m.description ? <span className="mt-0.5 block text-xs text-kui-fg-subtle">{m.description}</span> : null}
                </span>
                {isSelected ? <Check className="mt-0.5 size-4 shrink-0 text-kui-accent" /> : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
