import * as React from "react";

export interface SmoothTextOptions {
  /** Minimum reveal speed in characters per second. Default 90. */
  minCps?: number;
  /** Seconds to catch up with any backlog (lower = snappier). Default 0.35. */
  catchUp?: number;
  /** Disable smoothing (renders target immediately). */
  disabled?: boolean;
}

/**
 * requestAnimationFrame with a timer fallback: rAF is paused in background
 * tabs / occluded windows, but text must still arrive.
 */
function scheduleFrame(fn: (now: number) => void) {
  let done = false;
  const raf = requestAnimationFrame((t) => {
    if (done) return;
    done = true;
    clearTimeout(timer);
    fn(t);
  });
  const timer = setTimeout(() => {
    if (done) return;
    done = true;
    cancelAnimationFrame(raf);
    fn(performance.now());
  }, 64);
  return () => {
    done = true;
    cancelAnimationFrame(raf);
    clearTimeout(timer);
  };
}

/**
 * Turns bursty streamed text into a smooth, frame-paced reveal.
 * Network chunks arrive irregularly; this reveals characters at an adaptive
 * rate so the text "flows" instead of jumping. Text that is already complete
 * on mount is shown immediately.
 */
export function useSmoothText(target: string, active: boolean, opts: SmoothTextOptions = {}) {
  const { minCps = 90, catchUp = 0.35, disabled = false } = opts;
  const startEmpty = active && !disabled;
  const [shown, setShown] = React.useState(() => (startEmpty ? "" : target));
  const lenRef = React.useRef(startEmpty ? 0 : target.length);
  const targetRef = React.useRef(target);
  const rafRef = React.useRef<(() => void) | null>(null);
  targetRef.current = target;

  React.useEffect(() => {
    if (disabled || typeof window === "undefined") {
      lenRef.current = target.length;
      setShown(target);
      return;
    }
    // Content was replaced (not appended) → jump to it.
    if (!target.startsWith(shown.slice(0, Math.min(shown.length, target.length)))) {
      lenRef.current = Math.min(lenRef.current, target.length);
    }
    if (lenRef.current >= target.length) {
      if (shown !== target) setShown(target);
      return;
    }
    if (rafRef.current !== null) return; // loop already running

    let last = performance.now();
    let lastCommit = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const full = targetRef.current;
      const backlog = full.length - lenRef.current;
      const cps = Math.max(minCps, backlog / catchUp);
      lenRef.current = Math.min(full.length, lenRef.current + cps * dt);
      // Commit at ~45fps — plenty smooth, half the renders.
      if (now - lastCommit > 22 || lenRef.current >= full.length) {
        lastCommit = now;
        // Avoid splitting a surrogate pair (emoji).
        let end = Math.floor(lenRef.current);
        const code = full.charCodeAt(end - 1);
        if (code >= 0xd800 && code <= 0xdbff) end++;
        setShown(full.slice(0, end));
      }
      if (lenRef.current < full.length) {
        rafRef.current = scheduleFrame(tick);
      } else {
        rafRef.current = null;
      }
    };
    rafRef.current = scheduleFrame(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, disabled, minCps, catchUp]);

  React.useEffect(
    () => () => {
      // Reset so a StrictMode remount (or real remount) can restart the loop.
      rafRef.current?.();
      rafRef.current = null;
    },
    [],
  );

  return { text: shown, isAnimating: shown.length < target.length };
}
