# AgentGraph

> Category: Multi-agent · Package: `kestro-ui`

Animated tree of agents: who delegated to whom, who is working, and where work is flowing. Lays itself out and scales to fit.

## Import

```tsx
import { AgentGraph } from "kestro-ui";
```

## Example: agent-graph

```tsx
import { useEffect, useState } from "react";
import { AgentGraph, Button, type AgentNode, type AgentNodeState } from "kestro-ui";

const team = [
  { id: "lead", name: "Concierge", role: "Lead" },
  { id: "flights", name: "Flights", role: "Search", parentId: "lead" },
  { id: "hotels", name: "Hotels", role: "Search", parentId: "lead" },
  { id: "reviews", name: "Reviews", role: "Read", parentId: "hotels" },
  { id: "pay", name: "Payments", role: "Checkout", parentId: "lead" },
];

// Which agents are working at each step of the run
const steps: Record<string, AgentNodeState>[] = [
  { lead: "working", flights: "queued", hotels: "queued", reviews: "queued", pay: "queued" },
  { lead: "working", flights: "working", hotels: "working", reviews: "queued", pay: "queued" },
  { lead: "working", flights: "done", hotels: "working", reviews: "working", pay: "queued" },
  { lead: "working", flights: "done", hotels: "done", reviews: "done", pay: "waiting" },
  { lead: "done", flights: "done", hotels: "done", reviews: "done", pay: "done" },
];

export default function Example() {
  const [step, setStep] = useState(1);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % steps.length), 2200);
    return () => clearInterval(id);
  }, []);

  const nodes: AgentNode[] = team.map((a) => ({
    ...a,
    state: steps[step][a.id],
    activity: steps[step][a.id] === "waiting" ? "Approve £412 checkout" : undefined,
  }));

  return (
    <div className="w-full max-w-2xl space-y-4">
      <AgentGraph nodes={nodes} />
      <Button variant="outline" size="sm" onClick={() => setStep((s) => (s + 1) % steps.length)}>
        Next step ({step + 1}/{steps.length})
      </Button>
    </div>
  );
}
```

## API

### <AgentGraph />

Animated tree of agents: who delegated to whom, who's working, and where work is flowing.

| Prop | Type | Default | Description |
|---|---|---|---|
| `nodes` **(required)** | `AgentNode[]` | — |  |
| `links` | `AgentLink[]` | `[]` | Extra peer-to-peer links (drawn dashed), in addition to the parent tree. |
| `direction` | `"down" \| "right"` | `"right"` | Layout direction. Default "right". |
| `nodeWidth` | `number` | `216` |  |
| `nodeHeight` | `number` | `66` |  |
| `levelGap` | `number` | `64` | Space between depth levels. |
| `siblingGap` | `number` | `16` | Space between siblings. |
| `selectedId` | `string` | — |  |
| `onSelect` | `((id: string) => void)` | — |  |
| `className` | `string` | — |  |
