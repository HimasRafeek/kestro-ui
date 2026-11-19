# LatencyBreakdown

> Category: Time · Package: `kestro-ui`

Where the time went in one response: queue, first token, tools and generation, plus tokens per second.

## Import

```tsx
import { LatencyBreakdown } from "kestro-ui";
```

## Example: latency-breakdown

```tsx
import { LatencyBreakdown } from "kestro-ui";

export default function Example() {
  return (
    <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
      <LatencyBreakdown
        title="Fast answer"
        outputTokens={420}
        segments={[
          { id: "queue", label: "Queue", ms: 40 },
          { id: "ttft", label: "First token", ms: 310 },
          { id: "generation", label: "Generation", ms: 3_900 },
        ]}
      />
      <LatencyBreakdown
        title="Answer with tools"
        outputTokens={980}
        segments={[
          { id: "queue", label: "Queue", ms: 60 },
          { id: "ttft", label: "First token", ms: 540 },
          { id: "tools", label: "Tools (3)", ms: 4_200, tone: "warning" },
          { id: "generation", label: "Generation", ms: 6_100 },
        ]}
      />
    </div>
  );
}
```

## API

### <LatencyBreakdown />

Where the time went in one response: queue, time to first token, generation, tools.

| Prop | Type | Default | Description |
|---|---|---|---|
| `segments` **(required)** | `LatencySegment[]` | — |  |
| `outputTokens` | `number` | — | Output tokens, to show tokens per second for the generation phase. |
| `generationId` | `string` | `"generation"` | Which segment is generation (for tokens/sec). Default "generation". |
| `title` | `ReactNode` | `"Response time"` |  |
| `className` | `string` | — |  |
