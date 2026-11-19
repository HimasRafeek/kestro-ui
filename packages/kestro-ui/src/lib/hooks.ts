import * as React from "react";

/** Copy text to the clipboard and expose a short-lived `copied` flag. */
export function useCopyToClipboard(timeout = 1600) {
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  React.useEffect(() => () => clearTimeout(timer.current), []);

  const copy = React.useCallback(
    async (text: string) => {
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          const el = document.createElement("textarea");
          el.value = text;
          el.style.position = "fixed";
          el.style.opacity = "0";
          document.body.appendChild(el);
          el.select();
          document.execCommand("copy");
          el.remove();
        }
        setCopied(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), timeout);
        return true;
      } catch {
        return false;
      }
    },
    [timeout],
  );

  return { copied, copy };
}

/** State that can be either controlled (value + onChange) or uncontrolled (defaultValue). */
export function useControllableState<T>(opts: {
  value?: T;
  defaultValue: T;
  onChange?: (value: T) => void;
}) {
  const { value, defaultValue, onChange } = opts;
  const [internal, setInternal] = React.useState<T>(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? (value as T) : internal;
  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;

  const setValue = React.useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved =
        typeof next === "function" ? (next as (prev: T) => T)(current) : next;
      if (!isControlled) setInternal(resolved);
      onChangeRef.current?.(resolved);
    },
    [current, isControlled],
  );

  return [current, setValue] as const;
}

/** Grow a textarea with its content, between `minRows` and `maxRows`. */
export function useAutoResizeTextarea(
  ref: React.RefObject<HTMLTextAreaElement | null>,
  value: string,
  maxRows = 8,
) {
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    const styles = window.getComputedStyle(el);
    const lineHeight = parseFloat(styles.lineHeight) || 24;
    const padding = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
    const max = lineHeight * maxRows + padding;
    el.style.height = `${Math.min(el.scrollHeight, max)}px`;
    el.style.overflowY = el.scrollHeight > max ? "auto" : "hidden";
  }, [ref, value, maxRows]);
}

/**
 * Keep a scroll container pinned to the bottom while content streams in,
 * unless the user has scrolled up to read.
 */
export function useStickToBottom<T extends HTMLElement = HTMLDivElement>(threshold = 80) {
  const scrollRef = React.useRef<T | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const [isAtBottom, setIsAtBottom] = React.useState(true);
  const atBottomRef = React.useRef(true);

  const scrollToBottom = React.useCallback((behavior: ScrollBehavior = "smooth") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
      const next = distance <= threshold;
      atBottomRef.current = next;
      setIsAtBottom(next);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [threshold]);

  React.useEffect(() => {
    const content = contentRef.current;
    if (!content || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      if (atBottomRef.current) scrollToBottom("auto");
    });
    ro.observe(content);
    scrollToBottom("auto");
    return () => ro.disconnect();
  }, [scrollToBottom]);

  return { scrollRef, contentRef, isAtBottom, scrollToBottom };
}

/** Call `handler` on pointer down outside of `ref` or when Escape is pressed. */
export function useDismiss(
  ref: React.RefObject<HTMLElement | null>,
  open: boolean,
  handler: () => void,
) {
  const handlerRef = React.useRef(handler);
  handlerRef.current = handler;
  React.useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) handlerRef.current();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handlerRef.current();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, ref]);
}

/** Measure elapsed seconds while `active` is true; freezes the value when it turns false. */
export function useElapsed(active: boolean) {
  const start = React.useRef<number | null>(null);
  const [elapsed, setElapsed] = React.useState(0);
  React.useEffect(() => {
    if (!active) return;
    if (start.current === null) start.current = Date.now();
    const id = setInterval(() => {
      setElapsed((Date.now() - (start.current ?? Date.now())) / 1000);
    }, 250);
    return () => {
      clearInterval(id);
      if (start.current !== null) setElapsed((Date.now() - start.current) / 1000);
    };
  }, [active]);
  return elapsed;
}

export function formatDuration(seconds: number) {
  if (seconds < 1) return `${Math.max(0, Math.round(seconds * 1000))}ms`;
  if (seconds < 60) return `${seconds < 10 ? seconds.toFixed(1) : Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

export function formatNumber(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return String(n);
}
