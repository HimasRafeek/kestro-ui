# BootSequence

> Category: HUD · Package: `kestro-ui`

Animated startup checklist for 'agent waking up' moments.

## Import

```tsx
import { BootSequence } from "kestro-ui";
```

## Example: boot-sequence

```tsx
import { useState } from "react";
import { BootSequence, Button } from "kestro-ui";
import { RotateCcw } from "lucide-react";

const steps = [
  "Loading voice profile",
  "Connecting to calendar and inbox",
  "Syncing smart-home devices (12)",
  "Restoring memory from last session",
  "Calibrating wake word",
  "Running safety checks",
];

export default function Example() {
  const [run, setRun] = useState(0);
  const [online, setOnline] = useState(false);

  const replay = () => {
    setOnline(false);
    setRun((r) => r + 1);
  };

  return (
    <div className="flex w-full max-w-md flex-col gap-5 rounded-kui border border-kui-border bg-kui-surface p-6">
      <BootSequence key={run} steps={steps} title="Waking up Nova" onComplete={() => setOnline(true)} />
      <div className="flex min-h-8 items-center justify-between gap-3">
        <p className="text-sm text-kui-fg-muted">
          {online ? <span className="text-kui-success">Good morning. All systems are online.</span> : "Booting…"}
        </p>
        <Button size="sm" variant="outline" onClick={replay}>
          <RotateCcw /> Replay
        </Button>
      </div>
    </div>
  );
}
```

## API

### <BootSequence />

Animated startup checklist — great for agent "wake up" moments and onboarding.

| Prop | Type | Default | Description |
|---|---|---|---|
| `steps` **(required)** | `string[]` | — |  |
| `interval` | `number` | `320` | ms between steps. Default 320. |
| `title` | `ReactNode` | `"Initializing agent"` |  |
| `onComplete` | `(() => void)` | — |  |
| `className` | `string` | — |  |
