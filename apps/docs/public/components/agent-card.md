# AgentCard

> Category: Agents & models · Package: `kestro-ui`

Agent profile: identity, live status, model, tools and key stats, with actions.

## Import

```tsx
import { AgentCard } from "kestro-ui";
```

## Example: agent-card

```tsx
import { useState } from "react";
import { AgentCard, Button, type AgentProfile } from "kestro-ui";

const agents: AgentProfile[] = [
  {
    id: "atlas",
    name: "Atlas",
    role: "Travel concierge",
    description: "Finds flights and hotels, watches prices and books with your approval.",
    state: "online",
    model: "Sonata Large",
    tools: ["search_flights", "search_hotels", "book", "calendar"],
    stats: [
      { label: "Tasks", value: "1,204" },
      { label: "Success", value: "97%" },
      { label: "Avg time", value: "38s" },
    ],
  },
  {
    id: "ledger",
    name: "Ledger",
    role: "Finance assistant",
    description: "Reconciles payouts, chases invoices and flags anything unusual.",
    state: "working",
    model: "Sonata Fast",
    tools: ["stripe", "sheets", "email", "bank_feed", "slack"],
    stats: [
      { label: "Tasks", value: "486" },
      { label: "Success", value: "99%" },
      { label: "Saved", value: "$12k" },
    ],
  },
];

export default function Example() {
  const [selected, setSelected] = useState("atlas");
  return (
    <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
      {agents.map((a) => (
        <AgentCard
          key={a.id}
          agent={a}
          selected={selected === a.id}
          onSelect={setSelected}
          actions={
            <>
              <Button size="xs" variant="outline">Settings</Button>
              <Button size="xs" variant="ghost">Run history</Button>
            </>
          }
        />
      ))}
    </div>
  );
}
```

## API

### <AgentCard />

Profile card for an agent: identity, status, model, tools and key stats.

| Prop | Type | Default | Description |
|---|---|---|---|
| `agent` **(required)** | `AgentProfile` | — |  |
| `selected` | `false \| true` | — |  |
| `onSelect` | `((id: string) => void)` | — |  |
| `actions` | `ReactNode` | — | Footer actions (buttons). |
| `maxTools` | `number` | `4` | Max tool chips before "+N". Default 4. |
| `className` | `string` | — |  |
