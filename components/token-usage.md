# TokenUsage

> Category: Usage & cost · Package: `kestro-ui`

Token breakdown — input, cached, reasoning, output — with per-kind cost from your pricing. TokenCounter is the inline version.

## Import

```tsx
import { TokenUsage, TokenCounter } from "kestro-ui";
```

## Example: token-usage

```tsx
import { TokenCounter, TokenUsage } from "kestro-ui";

export default function Example() {
  return (
    <div className="w-full max-w-md space-y-4">
      <TokenUsage
        title="This conversation"
        caption="Sonata Large · 14 turns"
        input={48_200}
        cached={31_000}
        reasoning={6_400}
        output={9_850}
        pricing={{ input: 3, output: 15, cached: 0.3 }}
      />
      <p className="flex flex-wrap items-center gap-2 text-sm text-kui-fg-muted">
        Inline, under a message: <TokenCounter tokens={1_217} cost={0.0042} detail="812 in · 405 out" />
      </p>
    </div>
  );
}
```

## API

### <TokenUsage />

Token breakdown (input, cached, reasoning, output) with per-kind cost.

| Prop | Type | Default | Description |
|---|---|---|---|
| `input` **(required)** | `number` | — |  |
| `output` **(required)** | `number` | — |  |
| `cached` | `number` | `0` | Input tokens served from cache. |
| `reasoning` | `number` | `0` | Hidden reasoning / thinking tokens. |
| `pricing` | `TokenPricing` | — | Pricing per 1M tokens — used to compute cost when `cost` is omitted. |
| `cost` | `number` | — | Total cost override. |
| `currency` | `string` | `"$"` |  |
| `title` | `ReactNode` | `"Token usage"` |  |
| `caption` | `ReactNode` | — | Small caption, e.g. the model name or period. |
| `className` | `string` | — |  |

### <TokenCounter />

Inline "1.2k tok · $0.004" chip for messages, tool calls and runs.

| Prop | Type | Default | Description |
|---|---|---|---|
| `tokens` **(required)** | `number` | — |  |
| `cost` | `number` | — |  |
| `currency` | `string` | `"$"` |  |
| `detail` | `string` | — | Optional detail shown on hover, e.g. "812 in · 405 out". |
| `className` | `string` | — |  |
