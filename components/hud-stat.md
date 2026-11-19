# HudStat

> Category: HUD · Package: `kestro-ui`

Telemetry readout with big mono value, delta and live sparkline.

## Import

```tsx
import { HudStat, Sparkline } from "kestro-ui";
```

## Example: hud-stat

```tsx
import { useEffect, useState } from "react";
import { HudStat, Sparkline } from "kestro-ui";
import { Activity, Clock, Users, Zap } from "lucide-react";

const seed = (base: number) => Array.from({ length: 20 }, () => base * (0.85 + Math.random() * 0.3));
const push = (data: number[], base: number) => [...data.slice(1), base * (0.85 + Math.random() * 0.3)];
const last = (data: number[]) => data[data.length - 1];

export default function Example() {
  const [requests, setRequests] = useState(() => seed(1240));
  const [latency, setLatency] = useState(() => seed(320));
  const [sessions, setSessions] = useState(() => seed(86));
  const [tokens, setTokens] = useState(() => seed(48));

  useEffect(() => {
    const id = setInterval(() => {
      setRequests((d) => push(d, 1240));
      setLatency((d) => push(d, 320));
      setSessions((d) => push(d, 86));
      setTokens((d) => push(d, 48));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const delta = (d: number[]) => ((last(d) - d[0]) / d[0]) * 100;

  return (
    <div className="w-full max-w-2xl space-y-6">
      <div className="grid gap-x-8 gap-y-6 rounded-kui border border-kui-border bg-kui-surface p-5 sm:grid-cols-2">
        <HudStat label="Requests / min" icon={<Activity />} value={Math.round(last(requests)).toLocaleString()} delta={delta(requests)} data={requests} />
        <HudStat label="p95 latency" icon={<Clock />} value={Math.round(last(latency))} unit="ms" delta={delta(latency)} invertDelta data={latency} />
        <HudStat label="Live sessions" icon={<Users />} value={Math.round(last(sessions))} delta={delta(sessions)} data={sessions} />
        <HudStat label="Tokens / sec" icon={<Zap />} value={last(tokens).toFixed(1)} unit="k" delta={delta(tokens)} data={tokens} />
      </div>
      <div className="flex items-center gap-4 text-xs text-kui-fg-muted">
        Standalone sparklines
        <Sparkline data={requests} />
        <Sparkline data={latency} tone="warning" fill={false} />
        <Sparkline data={sessions} tone="success" live />
      </div>
    </div>
  );
}
```

## API

### <HudStat />

Telemetry readout: label, big mono value, delta and sparkline.

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` **(required)** | `ReactNode` | — |  |
| `value` **(required)** | `ReactNode` | — |  |
| `unit` | `ReactNode` | — |  |
| `delta` | `number` | — | Percentage change; positive renders as success. |
| `invertDelta` | `false \| true` | — | Invert delta colors (e.g. latency: lower is better). |
| `data` | `number[]` | — |  |
| `icon` | `ReactNode` | — |  |
| `className` | `string` | — |  |

### <Sparkline />

| Prop | Type | Default | Description |
|---|---|---|---|
| `data` **(required)** | `number[]` | — |  |
| `width` | `number` | `120` |  |
| `height` | `number` | `32` |  |
| `tone` | `"accent" \| "success" \| "warning" \| "danger" \| "info"` | `"accent"` |  |
| `fill` | `false \| true` | `true` |  |
| `live` | `false \| true` | `false` | Pulse the last point. |
| `className` | `string` | — |  |
