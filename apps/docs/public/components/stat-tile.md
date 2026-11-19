# StatTile

> Category: Usage & cost · Package: `kestro-ui`

Dashboard KPI tile: label, big value, trend and sparkline.

## Import

```tsx
import { StatTile } from "kestro-ui";
```

## Example: stat-tile

```tsx
import { StatTile } from "kestro-ui";
import { CircleCheck, Clock, Coins, MessagesSquare } from "lucide-react";

export default function Example() {
  return (
    <div className="grid w-full max-w-3xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatTile label="Conversations" icon={<MessagesSquare />} value="12,480" delta={8.2} trend={[30, 34, 31, 38, 42, 40, 47]} />
      <StatTile label="Resolved by agent" icon={<CircleCheck />} value="71%" delta={3.1} trend={[61, 63, 64, 66, 68, 70, 71]} />
      <StatTile label="Median response" icon={<Clock />} value="1.8s" delta={-12} invertDelta trend={[2.4, 2.2, 2.3, 2.0, 1.9, 1.9, 1.8]} />
      <StatTile label="Spend" icon={<Coins />} value="$323" delta={14} invertDelta trend={[38, 41, 44, 40, 48, 52, 60]} caption="Last 7 days" />
    </div>
  );
}
```

## API

### <StatTile />

Dashboard KPI tile: label, big value, change and a sparkline.

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` **(required)** | `ReactNode` | — |  |
| `value` **(required)** | `ReactNode` | — |  |
| `delta` | `number` | — | Percent change vs. previous period. |
| `invertDelta` | `false \| true` | — |  |
| `trend` | `number[]` | — | Sparkline data. |
| `icon` | `ReactNode` | — |  |
| `caption` | `ReactNode` | — |  |
| `className` | `string` | — |  |
