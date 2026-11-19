# DataTicker

> Category: HUD · Package: `kestro-ui`

Continuously scrolling status strip.

## Import

```tsx
import { DataTicker } from "kestro-ui";
```

## Example: data-ticker

```tsx
import { DataTicker } from "kestro-ui";

const markets = [
  { symbol: "BTC", price: "98,412", change: 2.4 },
  { symbol: "ETH", price: "3,862", change: -1.1 },
  { symbol: "NVDA", price: "1,204.50", change: 3.8 },
  { symbol: "AAPL", price: "241.12", change: 0.6 },
  { symbol: "EUR/USD", price: "1.0872", change: -0.2 },
  { symbol: "GOLD", price: "2,718", change: 0.9 },
];

const system = [
  "Uplink stable · 38 ms",
  "Scout finished competitor scan",
  "3 agents online",
  "Backup completed 04:00",
  <span className="text-kui-warning">1 anomaly flagged in billing</span>,
  "Next calendar sync in 5 min",
];

export default function Example() {
  return (
    <div className="w-full max-w-2xl space-y-4">
      <DataTicker
        items={markets.map((m) => (
          <>
            <span className="text-kui-fg">{m.symbol}</span>
            <span>{m.price}</span>
            <span className={m.change >= 0 ? "text-kui-success" : "text-kui-danger"}>
              {m.change >= 0 ? "▲" : "▼"} {Math.abs(m.change).toFixed(1)}%
            </span>
          </>
        ))}
      />
      <DataTicker items={system} className="text-kui-accent/90" />
    </div>
  );
}
```

## API

### <DataTicker />

Continuously scrolling status strip (markets, system events, agent activity).

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` **(required)** | `ReactNode[]` | — |  |
| `className` | `string` | — |  |
