# HudPanel

> Category: HUD · Package: `kestro-ui`

Sci-fi framed panel with corner brackets, scanlines and glow, plus an ambient HudBackground grid.

## Import

```tsx
import { HudPanel, HudBackground } from "kestro-ui";
```

## Example: hud-panel

```tsx
import { Badge, HudBackground, HudPanel, Sparkline } from "kestro-ui";

const telemetry = [
  { label: "Uplink", value: "Stable", tone: "text-kui-success" },
  { label: "Latency", value: "38 ms", tone: "text-kui-fg" },
  { label: "Active tasks", value: "7", tone: "text-kui-fg" },
  { label: "Anomalies", value: "1", tone: "text-kui-warning" },
];

export default function Example() {
  return (
    <div data-kui-theme="dark" className="relative flex w-full max-w-2xl justify-center overflow-hidden rounded-kui bg-kui-bg p-10 text-kui-fg">
      <HudBackground />
      <HudPanel
        className="w-full max-w-sm"
        title="Systems overview"
        code="SYS-01"
        status={
          <Badge tone="success" dot pulse>
            Nominal
          </Badge>
        }
        scanlines
        glow
      >
        <dl className="divide-y divide-kui-accent/10 font-mono text-xs">
          {telemetry.map((row) => (
            <div key={row.label} className="flex justify-between py-2">
              <dt className="tracking-wider text-kui-fg-subtle uppercase">{row.label}</dt>
              <dd className={row.tone}>{row.value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-3 flex items-center justify-between gap-4">
          <span className="font-mono text-[10px] tracking-[0.18em] text-kui-fg-subtle uppercase">Throughput · 1h</span>
          <Sparkline data={[12, 18, 15, 22, 28, 24, 31, 27, 35, 33, 41]} width={140} live />
        </div>
      </HudPanel>
    </div>
  );
}
```

## API

### <HudPanel />

Sci-fi framed panel with corner brackets — the building block of HUD layouts.

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `ReactNode` | — |  |
| `code` | `ReactNode` | — | Small code shown on the right of the header, e.g. "SYS-01". |
| `status` | `ReactNode` | — | Right-side header slot (status, actions). |
| `scanlines` | `false \| true` | — | Subtle CRT scanlines + moving scan bar. |
| `glow` | `false \| true` | — | Accent glow around the border. |
| `bodyClassName` | `string` | — |  |

Also accepts the native HTML attributes of its root element.

### <HudBackground />

Ambient grid + glow + optional sweeping scan line. Place inside a `relative` container.

| Prop | Type | Default | Description |
|---|---|---|---|
| `scan` | `false \| true` | `true` |  |
| `className` | `string` | — |  |
