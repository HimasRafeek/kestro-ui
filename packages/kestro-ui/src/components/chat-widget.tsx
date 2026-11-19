import * as React from "react";
import { MessageCircle, Minus, X } from "lucide-react";
import { cn } from "../lib/cn";
import { useControllableState } from "../lib/hooks";
import { AgentAvatar, type AgentAvatarProps } from "./agent-avatar";
import { IconButton } from "./primitives";

export interface ChatWidgetProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  avatar?: AgentAvatarProps;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  position?: "bottom-right" | "bottom-left";
  /** Teaser bubble shown next to the launcher while closed. */
  greeting?: React.ReactNode;
  launcherIcon?: React.ReactNode;
  /** Render inline (position: absolute within parent) instead of fixed to the viewport. */
  contained?: boolean;
  width?: number;
  height?: number;
  /** Panel body — typically <AgentChat compact /> */
  children: React.ReactNode;
  className?: string;
}

/** Floating launcher + chat panel for embedding an agent on any website. */
export function ChatWidget({
  title = "Assistant",
  subtitle = "Typically replies instantly",
  avatar,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  position = "bottom-right",
  greeting,
  launcherIcon,
  contained = false,
  width = 400,
  height = 640,
  children,
  className,
}: ChatWidgetProps) {
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const [teaser, setTeaser] = React.useState(true);
  const right = position === "bottom-right";

  return (
    <div
      className={cn(
        contained ? "absolute top-5 justify-end" : "fixed",
        "pointer-events-none bottom-5 z-[60] flex flex-col gap-3",
        right ? "right-5 items-end" : "left-5 items-start",
        className,
      )}
    >
      <div
        role="dialog"
        aria-label={typeof title === "string" ? title : "Chat"}
        aria-hidden={!open}
        className={cn(
          "flex min-h-0 flex-col overflow-hidden rounded-[calc(var(--kui-radius)*1.8)] border border-kui-border bg-kui-bg shadow-kui-lg transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
          right ? "origin-bottom-right" : "origin-bottom-left",
          open ? "pointer-events-auto scale-100 opacity-100" : "pointer-events-none h-0 scale-90 opacity-0",
        )}
        style={{
          width: `min(${width}px, calc(100vw - 2.5rem))`,
          height: open ? (contained ? height : `min(${height}px, calc(100dvh - 7.5rem))`) : 0,
        }}
      >
        <div className="flex shrink-0 items-center gap-3 border-b border-kui-border bg-kui-surface px-4 py-3">
          <AgentAvatar size="sm" state="online" {...avatar} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-kui-fg">{title}</div>
            <div className="truncate text-xs text-kui-fg-subtle">{subtitle}</div>
          </div>
          <IconButton label="Minimize" tooltip={false} onClick={() => setOpen(false)}>
            <Minus />
          </IconButton>
        </div>
        <div className="flex min-h-0 flex-1 flex-col">{open ? children : null}</div>
      </div>

      <div className={cn("pointer-events-auto flex items-end gap-3", !right && "flex-row-reverse")}>
        {greeting && !open && teaser ? (
          <div className="relative max-w-64 rounded-kui border border-kui-border bg-kui-surface px-3.5 py-2.5 text-[13.5px] text-kui-fg shadow-kui-lg animate-kui-pop">
            {greeting}
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => setTeaser(false)}
              className="absolute -top-2 -right-2 flex size-5 cursor-pointer items-center justify-center rounded-full border border-kui-border bg-kui-surface text-kui-fg-subtle shadow-kui hover:text-kui-fg"
            >
              <X className="size-3" />
            </button>
          </div>
        ) : null}
        <button
          type="button"
          aria-label={open ? "Close chat" : "Open chat"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="relative flex size-14 cursor-pointer items-center justify-center rounded-full bg-kui-accent text-kui-accent-fg shadow-[0_12px_32px_-8px_var(--kui-accent)] transition-transform duration-300 ease-kui-out hover:scale-105 active:scale-95"
        >
          <span className={cn("absolute transition-all duration-200", open ? "scale-50 rotate-90 opacity-0" : "opacity-100")}>
            {launcherIcon ?? <MessageCircle className="size-6" />}
          </span>
          <span className={cn("absolute transition-all duration-200", open ? "opacity-100" : "scale-50 -rotate-90 opacity-0")}>
            <X className="size-6" />
          </span>
        </button>
      </div>
    </div>
  );
}
