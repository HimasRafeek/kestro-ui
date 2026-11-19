import * as React from "react";
import { cn } from "../lib/cn";
import { useControllableState } from "../lib/hooks";

/* ========================================================================== */
/*                                    Switch                                  */
/* ========================================================================== */

export interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "value"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  size?: "sm" | "md";
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  { checked, defaultChecked = false, onCheckedChange, size = "md", className, disabled, ...props },
  ref,
) {
  const [on, setOn] = useControllableState({ value: checked, defaultValue: defaultChecked, onChange: onCheckedChange });
  const sm = size === "sm";
  return (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={() => setOn(!on)}
      className={cn(
        "relative inline-flex shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-kui-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kui-accent/50 focus-visible:ring-offset-1 focus-visible:ring-offset-kui-bg disabled:cursor-not-allowed disabled:opacity-45",
        sm ? "h-4 w-7" : "h-5 w-9",
        on ? "bg-kui-accent" : "bg-kui-surface-3 ring-1 ring-kui-border-strong ring-inset",
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "inline-block rounded-full bg-white shadow-sm transition-transform duration-300 ease-kui-spring",
          sm ? "size-3" : "size-4",
          on ? (sm ? "translate-x-3.5" : "translate-x-[18px]") : "translate-x-0.5",
        )}
      />
    </button>
  );
});

/* ========================================================================== */
/*                               SegmentedControl                             */
/* ========================================================================== */

export interface SegmentOption<T extends string = string> {
  value: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends string = string> {
  options: SegmentOption<T>[];
  value?: T;
  defaultValue?: T;
  onValueChange?: (value: T) => void;
  size?: "sm" | "md";
  /** Stretch to the container width. */
  block?: boolean;
  "aria-label"?: string;
  className?: string;
}

/** A compact single-choice toggle group with a sliding indicator. */
export function SegmentedControl<T extends string = string>({
  options,
  value,
  defaultValue,
  onValueChange,
  size = "md",
  block,
  className,
  ...aria
}: SegmentedControlProps<T>) {
  const [current, setCurrent] = useControllableState<T>({ value, defaultValue: defaultValue ?? options[0]?.value, onChange: onValueChange });
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const [indicator, setIndicator] = React.useState<{ left: number; width: number } | null>(null);
  const idx = Math.max(0, options.findIndex((o) => o.value === current));

  React.useLayoutEffect(() => {
    const el = refs.current[idx];
    if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  }, [idx, options.length, block]);

  return (
    <div
      role="radiogroup"
      aria-label={aria["aria-label"]}
      className={cn("relative inline-flex rounded-kui-sm border border-kui-border bg-kui-surface-2 p-0.5", block && "flex w-full", className)}
      onKeyDown={(e) => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        e.preventDefault();
        const dir = e.key === "ArrowRight" ? 1 : -1;
        let n = idx;
        for (let i = 0; i < options.length; i++) {
          n = (n + dir + options.length) % options.length;
          if (!options[n].disabled) break;
        }
        setCurrent(options[n].value);
        refs.current[n]?.focus();
      }}
    >
      {indicator ? (
        <span
          aria-hidden
          className="absolute top-0.5 bottom-0.5 rounded-[calc(var(--kui-radius)*0.5)] bg-kui-surface shadow-kui transition-[left,width] duration-300 ease-kui-out"
          style={{ left: indicator.left, width: indicator.width }}
        />
      ) : null}
      {options.map((o, i) => {
        const active = i === idx;
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            disabled={o.disabled}
            onClick={() => setCurrent(o.value)}
            className={cn(
              "relative z-10 inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-[calc(var(--kui-radius)*0.5)] font-medium whitespace-nowrap transition-colors duration-200 [&_svg]:size-3.5",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kui-accent/40 disabled:cursor-not-allowed disabled:opacity-40",
              size === "sm" ? "h-6 px-2.5 text-xs" : "h-8 px-3 text-[13px]",
              block && "flex-1",
              active ? "text-kui-fg" : "text-kui-fg-subtle hover:text-kui-fg",
            )}
          >
            {o.icon}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
