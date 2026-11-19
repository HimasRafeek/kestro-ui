# ModelCard

> Category: Agents & models · Package: `kestro-ui`

Model spec card: context size, price per 1M tokens, speed, quality and capabilities.

## Import

```tsx
import { ModelCard, ModelBadge } from "kestro-ui";
```

## Example: model-card

```tsx
import { useState } from "react";
import { ModelCard, type ModelInfo } from "kestro-ui";

const models: ModelInfo[] = [
  {
    id: "large",
    name: "Sonata Large",
    provider: "Sonata",
    description: "Best for complex, multi-step work with many tools.",
    context: 200_000,
    pricing: { input: 3, output: 15 },
    speed: 62,
    quality: 5,
    capabilities: ["tools", "vision", "reasoning", "json"],
    badge: "Default",
  },
  {
    id: "fast",
    name: "Sonata Fast",
    provider: "Sonata",
    description: "Quick, low-cost answers for everyday requests.",
    context: 128_000,
    pricing: { input: 0.25, output: 1.25 },
    speed: 180,
    quality: 3,
    capabilities: ["tools", "json", "fast"],
  },
];

export default function Example() {
  const [selected, setSelected] = useState("large");
  return (
    <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
      {models.map((m) => (
        <ModelCard key={m.id} model={m} selected={selected === m.id} onSelect={setSelected} />
      ))}
    </div>
  );
}
```

## API

### <ModelCard />

Spec card for a model: context, pricing, speed, quality and capabilities.

| Prop | Type | Default | Description |
|---|---|---|---|
| `model` **(required)** | `ModelInfo` | — |  |
| `selected` | `false \| true` | — |  |
| `onSelect` | `((id: string) => void)` | — |  |
| `currency` | `string` | `"$"` |  |
| `className` | `string` | — |  |

### <ModelBadge />

Inline model chip: provider tile, name and optional context size.

| Prop | Type | Default | Description |
|---|---|---|---|
| `name` **(required)** | `string` | — |  |
| `provider` | `string` | — |  |
| `context` | `number` | — |  |
| `className` | `string` | — |  |
