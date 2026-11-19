# AttitudeIndicator

> Category: HUD · Package: `kestro-ui`

An aviation attitude indicator as agent presence: the horizon steadies when idle, rolls while thinking and responds to audio. The bezel pointer shows any 0–100 value.

## Import

```tsx
import { AttitudeIndicator } from "kestro-ui";
```

## Example: attitude-indicator

```tsx
import { useEffect, useState } from "react";
import { AttitudeIndicator, Button, type CoreState } from "kestro-ui";

const states: { state: CoreState; label: string; value: number }[] = [
  { state: "idle", label: "Standing by", value: 10 },
  { state: "thinking", label: "Planning", value: 45 },
  { state: "speaking", label: "Speaking", value: 70 },
  { state: "error", label: "Tool failed", value: 45 },
];

export default function Example() {
  const [i, setI] = useState(1);
  const [level, setLevel] = useState(0);
  const { state, label, value } = states[i];

  // Fake audio level while speaking
  useEffect(() => {
    if (state !== "speaking") return;
    const id = setInterval(() => setLevel(0.3 + Math.random() * 0.6), 120);
    return () => clearInterval(id);
  }, [state]);

  return (
    <div className="flex flex-col items-center gap-5">
      <AttitudeIndicator state={state} level={level} value={value} label={label} sublabel="Concierge / A-01" size={360} />
      <div className="flex flex-wrap justify-center gap-2">
        {states.map((s, j) => (
          <Button key={s.state} size="sm" variant={i === j ? "primary" : "outline"} onClick={() => setI(j)}>
            {s.state}
          </Button>
        ))}
      </div>
    </div>
  );
}
```

## API

### <AttitudeIndicator />

An aviation attitude indicator re-imagined as an agent's presence:
the horizon steadies when idle, rolls gently while thinking, and responds
to audio while listening or speaking. The bezel pointer shows `value`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `state` | `"idle" \| "thinking" \| "working" \| "error" \| "offline" \| "listening" \| "speaking"` | `"idle"` |  |
| `value` | `number` | — | Bezel pointer 0–100 (e.g. confidence, progress, context used). |
| `level` | `number` | `0` | Live loudness 0–1 — tilts the horizon while listening/speaking. |
| `label` | `ReactNode` | — | Large label drawn in the sky (e.g. "Awaiting approval"). |
| `sublabel` | `ReactNode` | — | Small caption under the label (e.g. "Executor / K-03"). |
| `caption` | `ReactNode` | — | Third line, e.g. "Observe → Propose → Confirm". |
| `tone` | `"accent" \| "success" \| "warning" \| "danger" \| "info" \| "muted"` | `"warning"` | Instrument markings color. Default "warning" (ochre). |
| `size` | `number` | `420` |  |
| `className` | `string` | — |  |
