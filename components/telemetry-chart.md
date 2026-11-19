# TelemetryChart

> Category: HUD · Package: `kestro-ui`

Big readout plus a gridded line chart for latency, throughput, success rate or cost.

## Import

```tsx
import { TelemetryChart } from "kestro-ui";
```

## Example: telemetry-chart

```tsx
import { useEffect, useState } from "react";
import { TelemetryChart } from "kestro-ui";

const seed = (base: number, jitter: number) => Array.from({ length: 24 }, (_, i) => base + Math.sin(i / 2) * jitter);

export default function Example() {
  const [latency, setLatency] = useState(() => seed(820, 60));
  const [cost, setCost] = useState(() => seed(0.42, 0.05));

  useEffect(() => {
    const id = setInterval(() => {
      setLatency((d) => [...d.slice(1), Math.max(600, Math.min(1100, d[d.length - 1] + (Math.random() - 0.5) * 120))]);
      setCost((d) => [...d.slice(1), Math.max(0.3, Math.min(0.6, d[d.length - 1] + (Math.random() - 0.5) * 0.06))]);
    }, 900);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="w-full max-w-lg space-y-6 rounded-kui border border-kui-border bg-kui-surface p-5">
      <TelemetryChart
        label="Latency"
        value={Math.round(latency[latency.length - 1])}
        unit="ms"
        data={latency}
        min={400}
        max={1200}
        xLabels={["-20m", "-15m", "-10m", "-5m", "now"]}
      />
      <TelemetryChart
        label="Cost / run"
        value={`$${cost[cost.length - 1].toFixed(2)}`}
        data={cost}
        min={0.2}
        max={0.7}
        formatY={(v) => `$${v.toFixed(2)}`}
        tone="info"
      />
    </div>
  );
}
```

## API

### <TelemetryChart />

Readout + gridded line chart for latency, throughput, success rate, cost…

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` **(required)** | `ReactNode` | — |  |
| `value` | `ReactNode` | — | Big readout; defaults to the last data point. |
| `unit` | `ReactNode` | — |  |
| `data` **(required)** | `number[]` | — |  |
| `xLabels` | `string[]` | — | X-axis labels (shown at even intervals). |
| `yTicks` | `number` | `4` | Y-axis tick count. Default 4. |
| `min` | `number` | — |  |
| `max` | `number` | — |  |
| `formatY` | `((v: number) => string)` | `(v) => (Math.abs(v) >= 1000 ? v.toLocaleString() : String(Math.round(v * 10) / 10))` | Format y-axis labels. |
| `tone` | `"accent" \| "success" \| "warning" \| "danger" \| "info" \| "muted"` | `"warning"` |  |
| `height` | `number` | `96` |  |
| `className` | `string` | — |  |
