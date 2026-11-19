# AgentPicker

> Category: Agents & models · Package: `kestro-ui`

Searchable, keyboard-friendly list for choosing which agent handles something.

## Import

```tsx
import { AgentPicker } from "kestro-ui";
```

## Example: agent-picker

```tsx
import { useState } from "react";
import { AgentPicker } from "kestro-ui";

export default function Example() {
  const [agent, setAgent] = useState("support");
  return (
    <div className="w-full max-w-md space-y-2">
      <AgentPicker
        value={agent}
        onValueChange={setAgent}
        agents={[
          { id: "support", name: "Support", role: "Customer care", description: "Refunds, orders and returns", state: "online", model: "Sonata Fast" },
          { id: "atlas", name: "Atlas", role: "Travel", description: "Flights, hotels, itineraries", state: "working", model: "Sonata Large" },
          { id: "ledger", name: "Ledger", role: "Finance", description: "Invoices and reconciliation", state: "idle", model: "Sonata Fast" },
          { id: "scout", name: "Scout", role: "Research", description: "Market and competitor research", state: "online", model: "Sonata Large", tools: ["web_search"] },
          { id: "lumen", name: "Lumen", role: "Design", description: "Reads screenshots and mockups", state: "offline", model: "Lumen Vision" },
        ]}
      />
      <p className="text-sm text-kui-fg-muted">Assigned to: {agent}</p>
    </div>
  );
}
```

## API

### <AgentPicker />

Searchable list for choosing which agent handles something.

| Prop | Type | Default | Description |
|---|---|---|---|
| `agents` **(required)** | `AgentProfile[]` | — |  |
| `value` | `string` | — |  |
| `defaultValue` | `string` | — |  |
| `onValueChange` | `((id: string) => void)` | — |  |
| `placeholder` | `string` | `"Search agents…"` |  |
| `maxHeight` | `number` | `320` | Max list height before scrolling. Default 320. |
| `className` | `string` | — |  |
