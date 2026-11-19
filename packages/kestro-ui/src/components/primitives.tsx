import * as React from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "../lib/cn";

/* -------------------------------------------------------------------------- */
/*                                   Button                                   */
/* -------------------------------------------------------------------------- */

const buttonVariants = {
  primary:
    "bg-kui-fg text-kui-bg hover:opacity-90 shadow-[0_1px_0_0_rgb(255_255_255/0.12)_inset]",
  accent: "bg-kui-accent text-kui-accent-fg hover:brightness-110 shadow-[0_1px_0_0_rgb(255_255_255/0.18)_inset]",
  secondary: "bg-kui-surface-2 text-kui-fg hover:bg-kui-surface-3 border border-kui-border",
  outline: "border border-kui-border bg-transparent text-kui-fg hover:bg-kui-surface-2",
  ghost: "bg-transparent text-kui-fg-muted hover:bg-kui-surface-2 hover:text-kui-fg",
  danger: "bg-kui-danger text-white hover:brightness-110",
} as const;

const buttonSizes = {
  xs: "h-7 px-2.5 text-xs gap-1.5 rounded-kui-sm",
  sm: "h-8 px-3 text-[13px] gap-1.5 rounded-kui-sm",
  md: "h-9 px-4 text-sm gap-2 rounded-kui-sm",
  lg: "h-11 px-5 text-[15px] gap-2 rounded-kui",
  icon: "size-9 rounded-kui-sm",
  "icon-sm": "size-8 rounded-kui-sm",
  "icon-xs": "size-7 rounded-[calc(var(--kui-radius)*0.5)]",
} as const;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, className, children, disabled, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex shrink-0 cursor-pointer items-center justify-center font-medium whitespace-nowrap select-none",
        "transition-[background-color,color,opacity,filter,box-shadow,transform] duration-150 active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kui-accent/50 focus-visible:ring-offset-1 focus-visible:ring-offset-kui-bg",
        "disabled:pointer-events-none disabled:opacity-45",
        "[&_svg]:size-4 [&_svg]:shrink-0",
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    >
      {loading ? <LoaderCircle className="animate-spin" /> : null}
      {children}
    </button>
  );
});

/* -------------------------------------------------------------------------- */
/*                                    Badge                                   */
/* -------------------------------------------------------------------------- */

const badgeTones = {
  neutral: "bg-kui-surface-2 text-kui-fg-muted border-kui-border",
  accent: "bg-kui-accent-soft text-kui-accent border-transparent",
  success: "bg-kui-success-soft text-kui-success border-transparent",
  warning: "bg-kui-warning-soft text-kui-warning border-transparent",
  danger: "bg-kui-danger-soft text-kui-danger border-transparent",
  info: "bg-kui-info-soft text-kui-info border-transparent",
} as const;

export type Tone = keyof typeof badgeTones;

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  dot?: boolean;
  pulse?: boolean;
}

export function Badge({ tone = "neutral", dot, pulse, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center gap-1.5 rounded-full border px-2 text-[11px] font-medium leading-none whitespace-nowrap",
        "[&_svg]:size-3 [&_svg]:shrink-0",
        badgeTones[tone],
        className,
      )}
      {...props}
    >
      {dot ? <StatusDot tone={tone} pulse={pulse} className="size-1.5" /> : null}
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  StatusDot                                 */
/* -------------------------------------------------------------------------- */

const dotTones: Record<Tone, string> = {
  neutral: "bg-kui-fg-subtle",
  accent: "bg-kui-accent",
  success: "bg-kui-success",
  warning: "bg-kui-warning",
  danger: "bg-kui-danger",
  info: "bg-kui-info",
};

export function StatusDot({
  tone = "success",
  pulse,
  className,
}: {
  tone?: Tone;
  pulse?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("relative inline-flex size-2 shrink-0", className)}>
      {pulse ? (
        <span className={cn("absolute inset-0 rounded-full animate-kui-ping", dotTones[tone])} />
      ) : null}
      <span className={cn("relative inline-flex size-full rounded-full", dotTones[tone])} />
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Spinner                                  */
/* -------------------------------------------------------------------------- */

export function Spinner({ className }: { className?: string }) {
  return (
    <LoaderCircle
      aria-label="Loading"
      className={cn("size-4 shrink-0 animate-spin text-kui-fg-subtle", className)}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Tooltip                                  */
/* -------------------------------------------------------------------------- */

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "bottom";
  className?: string;
}

/** Lightweight CSS-only tooltip (hover & focus). */
export function Tooltip({ content, children, side = "top", className }: TooltipProps) {
  return (
    <span className="group/tooltip relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 rounded-md px-2 py-1 text-[11px] font-medium whitespace-nowrap",
          "bg-kui-fg text-kui-bg opacity-0 shadow-kui transition-[opacity,transform] duration-150 delay-0",
          "group-hover/tooltip:opacity-100 group-hover/tooltip:delay-300 group-focus-within/tooltip:opacity-100",
          side === "top"
            ? "bottom-full mb-1.5 translate-y-0.5 group-hover/tooltip:translate-y-0"
            : "top-full mt-1.5 -translate-y-0.5 group-hover/tooltip:translate-y-0",
          className,
        )}
      >
        {content}
      </span>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 IconButton                                 */
/* -------------------------------------------------------------------------- */

export interface IconButtonProps extends Omit<ButtonProps, "size"> {
  label: string;
  size?: "xs" | "sm" | "md";
  tooltip?: boolean;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, size = "sm", tooltip = true, variant = "ghost", className, ...props },
  ref,
) {
  const btn = (
    <Button
      ref={ref}
      aria-label={label}
      variant={variant}
      size={size === "xs" ? "icon-xs" : size === "sm" ? "icon-sm" : "icon"}
      className={cn(size === "xs" && "[&_svg]:size-3.5", className)}
      {...props}
    />
  );
  return tooltip ? <Tooltip content={label}>{btn}</Tooltip> : btn;
});

/* -------------------------------------------------------------------------- */
/*                                     Kbd                                    */
/* -------------------------------------------------------------------------- */

export function Kbd({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded border border-kui-border bg-kui-surface-2 px-1 font-sans text-[10px] font-medium text-kui-fg-subtle",
        className,
      )}
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*                                    Card                                    */
/* -------------------------------------------------------------------------- */

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-kui border border-kui-border bg-kui-surface text-kui-fg shadow-kui",
        className,
      )}
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*                                ShimmerText                                 */
/* -------------------------------------------------------------------------- */

/** Animated gradient text for live "Thinking…" / "Searching…" labels. */
export function ShimmerText({
  children,
  active = true,
  className,
}: {
  children: React.ReactNode;
  active?: boolean;
  className?: string;
}) {
  return <span className={cn(active ? "kui-shimmer" : "text-kui-fg-muted", className)}>{children}</span>;
}

/* -------------------------------------------------------------------------- */
/*                                 Collapsible                                */
/* -------------------------------------------------------------------------- */

/** Height-animated container (CSS grid trick, no measuring). */
export function Collapse({
  open,
  children,
  className,
}: {
  open: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid transition-[grid-template-rows,opacity,filter] duration-500 ease-kui-out",
        open ? "grid-rows-[1fr] opacity-100 blur-0" : "grid-rows-[0fr] opacity-0 blur-[2px]",
      )}
      aria-hidden={!open}
    >
      <div className={cn("min-h-0 overflow-hidden", className)}>{children}</div>
    </div>
  );
}
