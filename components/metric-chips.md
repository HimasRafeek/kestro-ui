# Metric chips

> Category: Usage & cost · Package: `kestro-ui`

Tiny inline building blocks: cost, latency, duration, speed, requests, trends, context, mini bars, model and agent chips, and a one-line message footer.

## Import

```tsx
import { CostTag, LatencyTag, DurationTag, TokensPerSecond, RequestCount, TrendTag, ContextPill, MiniBar, AgentChip, CapabilityTags, MessageMeta, TimeAgo } from "kestro-ui";
```

## Example: metric-chips

```tsx
import {
  AgentChip,
  CapabilityTags,
  ContextPill,
  CostTag,
  DurationTag,
  LatencyTag,
  MessageMeta,
  MiniBar,
  ModelBadge,
  RequestCount,
  TimeAgo,
  TokenCounter,
  TokensPerSecond,
  TrendTag,
} from "kestro-ui";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-kui-border py-3 last:border-0">
      <span className="w-24 shrink-0 text-xs text-kui-fg-subtle">{label}</span>
      {children}
    </div>
  );
}

export default function Example() {
  return (
    <div className="w-full max-w-2xl rounded-kui border border-kui-border bg-kui-surface px-4">
      <Row label="Tokens & cost">
        <TokenCounter tokens={1_217} cost={0.0042} />
        <CostTag value={0.042} />
        <RequestCount value={1_204} />
      </Row>
      <Row label="Time">
        <LatencyTag ms={420} />
        <LatencyTag ms={1_900} label="TTFT" />
        <LatencyTag ms={4_800} />
        <DurationTag seconds={38} />
        <TokensPerSecond value={62} />
        <span className="text-xs text-kui-fg-muted">
          Updated <TimeAgo date={Date.now() - 3 * 60_000} />
        </span>
      </Row>
      <Row label="Trends">
        <TrendTag value={12.5} />
        <TrendTag value={-3.2} />
        <TrendTag value={18} invert />
        <TrendTag value={-22} invert />
      </Row>
      <Row label="Meters">
        <ContextPill used={62_000} limit={200_000} />
        <ContextPill used={182_000} limit={200_000} />
        <MiniBar value={64} />
        <MiniBar value={91} tone="danger" width={48} />
      </Row>
      <Row label="Models">
        <ModelBadge name="Sonata Large" provider="Sonata" context={200_000} />
        <ModelBadge name="Lumen Vision" provider="Lumen" />
        <CapabilityTags capabilities={["tools", "vision", "reasoning", "json"]} />
      </Row>
      <Row label="Agents">
        <AgentChip name="Atlas" state="working" />
        <AgentChip name="Ledger" state="waiting" />
        <AgentChip name="Scout" state="online" />
      </Row>
      <Row label="Message footer">
        <MessageMeta model="Sonata Large" provider="Sonata" tokens={1_217} cost={0.0042} duration={3.4} speed={58} />
      </Row>
    </div>
  );
}
```

## API

### <CostTag />

"$0.042"

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` **(required)** | `number` | — |  |
| `currency` | `string` | `"$"` |  |
| `className` | `string` | — |  |

### <LatencyTag />

"842ms" — green, ochre or red by threshold.

| Prop | Type | Default | Description |
|---|---|---|---|
| `ms` **(required)** | `number` | — |  |
| `thresholds` | `[number, number]` | `[800, 2500]` | [good, slow] thresholds in ms. Default [800, 2500]. |
| `label` | `string` | — |  |
| `className` | `string` | — |  |

### <DurationTag />

"4.2s" with a clock.

| Prop | Type | Default | Description |
|---|---|---|---|
| `seconds` **(required)** | `number` | — |  |
| `className` | `string` | — |  |

### <TokensPerSecond />

"48 tok/s"

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` **(required)** | `number` | — |  |
| `className` | `string` | — |  |

### <RequestCount />

"1,204 req"

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` **(required)** | `number` | — |  |
| `label` | `string` | `"req"` |  |
| `className` | `string` | — |  |

### <TrendTag />

"▲ 12.5%" — green when it's good news.

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` **(required)** | `number` | — | Percent change, e.g. 12.5 or -3. |
| `invert` | `false \| true` | — | For metrics where lower is better (cost, latency). |
| `className` | `string` | — |  |

### <ContextPill />

Mini ring + percent, e.g. context used.

| Prop | Type | Default | Description |
|---|---|---|---|
| `used` **(required)** | `number` | — |  |
| `limit` **(required)** | `number` | — |  |
| `label` | `string` | `"ctx"` |  |
| `className` | `string` | — |  |

### <MiniBar />

Thin inline percentage bar.

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` **(required)** | `number` | — |  |
| `max` | `number` | `100` |  |
| `tone` | `"accent" \| "success" \| "warning" \| "danger" \| "info" \| "muted"` | `"accent"` |  |
| `width` | `number` | `64` |  |
| `className` | `string` | — |  |

### <AgentChip />

Mini avatar + name + status dot.

| Prop | Type | Default | Description |
|---|---|---|---|
| `name` **(required)** | `string` | — |  |
| `state` | `"idle" \| "online" \| "thinking" \| "working" \| "waiting" \| "error" \| "offline"` | — |  |
| `avatar` | `string` | — |  |
| `className` | `string` | — |  |

### <CapabilityTags />

Icon-only capability row with tooltips (vision, tools, reasoning…).

| Prop | Type | Default | Description |
|---|---|---|---|
| `capabilities` **(required)** | `ModelCapability[]` | — |  |
| `className` | `string` | — |  |

### <MessageMeta />

One-line footer for an answer or run: model · tokens · cost · time · speed.

| Prop | Type | Default | Description |
|---|---|---|---|
| `model` | `string` | — |  |
| `provider` | `string` | — |  |
| `tokens` | `number` | — |  |
| `cost` | `number` | — |  |
| `duration` | `number` | — | Seconds. |
| `speed` | `number` | — | Tokens per second. |
| `currency` | `string` | — |  |
| `className` | `string` | — |  |

### <TimeAgo />

Relative time ("3 min ago") that updates itself; hover shows the exact time.

| Prop | Type | Default | Description |
|---|---|---|---|
| `date` **(required)** | `string \| number \| Date` | — |  |
| `locale` | `string` | — |  |
| `className` | `string` | — |  |
