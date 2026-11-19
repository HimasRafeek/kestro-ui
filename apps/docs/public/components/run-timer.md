# RunTimer

> Category: Time · Package: `kestro-ui`

Live elapsed timer for a run, with an estimate of time left and an optional timeout ring.

## Import

```tsx
import { RunTimer } from "kestro-ui";
```

## Example: run-timer

```tsx
import { useEffect, useState } from "react";
import { RunTimer } from "kestro-ui";

export default function Example() {
  const [startedAt] = useState(() => Date.now() - 83_000);
  const [progress, setProgress] = useState(40);

  useEffect(() => {
    const id = setInterval(() => setProgress((p) => (p >= 95 ? 40 : p + 1)), 800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="grid w-full max-w-2xl gap-6 rounded-kui border border-kui-border bg-kui-surface p-5 sm:grid-cols-3">
      <RunTimer startedAt={startedAt} progress={progress} label="Research run" />
      <RunTimer startedAt={startedAt} timeout={120_000} label="Timeout 2 min" />
      <RunTimer elapsed={754_000} running={false} label="Finished in" />
    </div>
  );
}
```

## API

### <RunTimer />

Live elapsed timer for an agent run, with an estimate of time left and an optional timeout ring.

| Prop | Type | Default | Description |
|---|---|---|---|
| `startedAt` | `number` | — | When the run started (ms since epoch). The timer ticks while `running`. |
| `elapsed` | `number` | — | Or pass a fixed elapsed time in ms (e.g. for finished runs). |
| `running` | `false \| true` | `true` |  |
| `progress` | `number` | — | Progress 0–100 — used to estimate the time remaining. |
| `timeout` | `number` | — | Max run time in ms; shows a ring and warns as it gets close. |
| `label` | `ReactNode` | `"Elapsed"` |  |
| `size` | `"sm" \| "md"` | `"md"` |  |
| `className` | `string` | — |  |
