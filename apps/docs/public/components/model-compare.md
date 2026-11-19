# ModelCompare

> Category: Agents & models · Package: `kestro-ui`

Side-by-side model table that highlights the best value in each column.

## Import

```tsx
import { ModelCompare } from "kestro-ui";
```

## Example: model-compare

```tsx
import { useState } from "react";
import { ModelCompare } from "kestro-ui";

export default function Example() {
  const [selected, setSelected] = useState("large");
  return (
    <ModelCompare
      className="max-w-3xl"
      selectedId={selected}
      onSelect={setSelected}
      models={[
        { id: "large", name: "Sonata Large", provider: "Sonata", context: 200_000, pricing: { input: 3, output: 15 }, speed: 62, quality: 5, capabilities: ["tools", "vision", "reasoning"], badge: "Default" },
        { id: "fast", name: "Sonata Fast", provider: "Sonata", context: 128_000, pricing: { input: 0.25, output: 1.25 }, speed: 180, quality: 3, capabilities: ["tools"] },
        { id: "vision", name: "Lumen Vision", provider: "Lumen", context: 64_000, pricing: { input: 1.5, output: 6 }, speed: 95, quality: 4, capabilities: ["tools", "vision"] },
        { id: "mini", name: "Orbit Mini", provider: "Orbit", context: 32_000, pricing: { input: 0.1, output: 0.4 }, speed: 240, quality: 2, capabilities: [] },
      ]}
    />
  );
}
```

## API

### <ModelCompare />

Side-by-side model comparison. The best value in each numeric column is highlighted.

| Prop | Type | Default | Description |
|---|---|---|---|
| `models` **(required)** | `ModelInfo[]` | — |  |
| `selectedId` | `string` | — |  |
| `onSelect` | `((id: string) => void)` | — |  |
| `currency` | `string` | `"$"` |  |
| `capabilities` | `ModelCapability[]` | `["tools", "vision", "reasoning"]` | Capabilities to show as columns. Default: tools, vision, reasoning. |
| `className` | `string` | — |  |
