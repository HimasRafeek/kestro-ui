import * as React from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "../lib/cn";
import { AgentAvatar } from "./agent-avatar";

export type Suggestion =
  | string
  | {
      label: React.ReactNode;
      /** Prompt sent on select (defaults to label when it's a string). */
      value?: string;
      description?: React.ReactNode;
      icon?: React.ReactNode;
    };

function valueOf(s: Suggestion) {
  if (typeof s === "string") return s;
  return s.value ?? (typeof s.label === "string" ? s.label : "");
}

export interface SuggestionsProps {
  suggestions: Suggestion[];
  onSelect?: (value: string) => void;
  /** "chips" (compact pills) or "cards" (grid with descriptions). */
  variant?: "chips" | "cards";
  className?: string;
}

export function Suggestions({ suggestions, onSelect, variant = "chips", className }: SuggestionsProps) {
  if (variant === "cards") {
    return (
      <div className={cn("@container w-full", className)}>
        <div className="grid gap-2.5 @lg:grid-cols-2">
        {suggestions.map((s, i) => {
          const o = typeof s === "string" ? { label: s } : s;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect?.(valueOf(s))}
              style={{ animationDelay: `${i * 50}ms` }}
              className="group flex cursor-pointer items-start gap-3 rounded-kui border border-kui-border bg-kui-surface p-3.5 text-left transition-all animate-kui-in hover:-translate-y-px hover:border-kui-border-strong hover:shadow-kui focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kui-accent/40"
            >
              {o.icon ? (
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-kui-surface-2 text-kui-fg-muted transition-colors group-hover:bg-kui-accent-soft group-hover:text-kui-accent [&_svg]:size-4">
                  {o.icon}
                </span>
              ) : null}
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-kui-fg">{o.label}</span>
                {"description" in o && o.description ? (
                  <span className="mt-0.5 block text-[13px] leading-snug text-kui-fg-subtle">{o.description}</span>
                ) : null}
              </span>
              <ArrowUpRight className="size-4 shrink-0 text-kui-fg-subtle opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          );
        })}
        </div>
      </div>
    );
  }
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {suggestions.map((s, i) => {
        const o = typeof s === "string" ? { label: s } : s;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onSelect?.(valueOf(s))}
            className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-kui-border bg-kui-surface px-3.5 text-[13px] text-kui-fg-muted transition-colors hover:border-kui-border-strong hover:bg-kui-surface-2 hover:text-kui-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kui-accent/40 [&_svg]:size-3.5"
          >
            {"icon" in o ? o.icon : null}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

/** Welcome screen shown before the first message. */
export function EmptyState({
  icon,
  title = "How can I help you today?",
  description,
  children,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex w-full flex-col items-center gap-6 py-10 text-center animate-kui-in", className)}>
      <div className="relative">
        <div className="absolute inset-0 -z-10 scale-[2.2] rounded-full bg-kui-accent/20 blur-2xl" />
        {icon ?? <AgentAvatar size="lg" />}
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-kui-fg sm:text-[28px]">{title}</h2>
        {description ? <p className="mx-auto max-w-md text-[15px] text-kui-fg-muted">{description}</p> : null}
      </div>
      {children ? <div className="w-full max-w-2xl">{children}</div> : null}
    </div>
  );
}
