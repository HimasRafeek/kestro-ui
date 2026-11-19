# SegmentedMeter

> Category: Workflows · Package: `kestro-ui`

Block-style meter for context windows, quotas and budgets.

## Import

```tsx
import { SegmentedMeter } from "kestro-ui";
```

## Example: segmented-meter

```tsx
import { SegmentedMeter } from "kestro-ui";

export default function Example() {
  return (
    <div className="w-full max-w-md space-y-6 rounded-kui border border-kui-border bg-kui-surface p-5">
      <SegmentedMeter label="Context window" value={12480} max={32000} detail="12,480 / 32,000 tokens" />
      <SegmentedMeter label="Monthly budget" value={41} max={50} caption="$41 of $50" tone="accent" />
      <SegmentedMeter label="Voice minutes" value={590} max={600} segments={30} caption="10 min left" />
    </div>
  );
}
```

## API

### <SegmentedMeter />

Block-style meter for context windows, quotas and budgets.

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` **(required)** | `number` | — |  |
| `max` **(required)** | `number` | — |  |
| `segments` | `number` | `20` |  |
| `label` | `ReactNode` | — |  |
| `caption` | `ReactNode` | — | Right-side caption; defaults to "NN% used". |
| `detail` | `ReactNode` | — | Text under the bar, e.g. "12,480 / 32,000 tokens". |
| `tone` | `"accent" \| "success" \| "warning" \| "danger" \| "info" \| "muted"` | `"muted"` |  |
| `className` | `string` | — |  |
