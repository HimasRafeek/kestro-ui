# AgentGraph

> Category: Multi-agent · Package: `kestro-ui`

Animated tree of agents: who delegated to whom, who is working, and where work is flowing. Lays itself out and scales to fit. Click any agent for a popover with its activity, model, token usage and steps.

## Import

```tsx
import { AgentGraph, AgentDetails } from "kestro-ui";
```

## Example: agent-graph

```tsx
import { useEffect, useState } from "react";
import { AgentGraph, Button, type AgentNode, type AgentNodeState } from "kestro-ui";

const team = [
  { id: "lead", name: "Concierge", role: "Lead", model: "Sonata Large", provider: "Sonata" },
  { id: "flights", name: "Flights", role: "Search", parentId: "lead", model: "Sonata Fast", provider: "Sonata" },
  { id: "hotels", name: "Hotels", role: "Search", parentId: "lead", model: "Sonata Fast", provider: "Sonata" },
  { id: "reviews", name: "Reviews", role: "Read", parentId: "hotels", model: "Lumen Vision", provider: "Lumen" },
  { id: "pay", name: "Payments", role: "Checkout", parentId: "lead", model: "Sonata Large", provider: "Sonata" },
];

// Which agents are working at each step of the run
const steps: Record<string, AgentNodeState>[] = [
  { lead: "working", flights: "queued", hotels: "queued", reviews: "queued", pay: "queued" },
  { lead: "working", flights: "working", hotels: "working", reviews: "queued", pay: "queued" },
  { lead: "working", flights: "done", hotels: "working", reviews: "working", pay: "queued" },
  { lead: "working", flights: "done", hotels: "done", reviews: "done", pay: "waiting" },
  { lead: "done", flights: "done", hotels: "done", reviews: "done", pay: "done" },
];

const activity: Record<string, string> = {
  lead: "Coordinating 4 agents",
  flights: "Comparing 14 fares LHR → LIS",
  hotels: "Shortlisting hotels in Alfama",
  reviews: "Reading 120 guest reviews",
  pay: "Approve £412 checkout",
};

export default function Example() {
  const [step, setStep] = useState(1);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % steps.length), 2600);
    return () => clearInterval(id);
  }, []);

  const nodes: AgentNode[] = team.map((a, i) => {
    const state = steps[step][a.id];
    const work = state === "queued" ? 0 : (step + 1) * (i + 2); // fake, grows as the run goes on
    return {
      ...a,
      state,
      activity: state === "working" || state === "waiting" ? activity[a.id] : undefined,
      usage: work ? { input: work * 900, output: work * 210, cost: work * 0.0031 } : undefined,
      elapsed: work * 1.7,
      steps: [
        { id: "1", title: "Read the brief", status: state === "queued" ? "pending" : "done" },
        { id: "2", title: activity[a.id], status: state === "working" ? "running" : state === "waiting" ? "waiting" : state === "done" ? "done" : "pending" },
        { id: "3", title: "Report back to Concierge", status: state === "done" ? "done" : "pending" },
      ],
    };
  });

  return (
    <div className="w-full max-w-2xl space-y-4">
      <AgentGraph nodes={nodes} />
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => setStep((s) => (s + 1) % steps.length)}>
          Next step ({step + 1}/{steps.length})
        </Button>
        <span className="text-sm text-kui-fg-muted">Click an agent to see what it's doing.</span>
      </div>
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
| `nodeHeight` | `number` | — |  |
| `levelGap` | `number` | `64` | Space between depth levels. |
| `siblingGap` | `number` | `16` | Space between siblings. |
| `selectedId` | `string` | — |  |
| `onSelect` | `((id: string) => void)` | — |  |
| `showDetails` | `false \| true` | `true` | Open a details popover when a node is clicked. Default true. |
| `renderDetails` | `((node: AgentNode) => ReactNode)` | — | Replace the popover content. |
| `className` | `string` | — |  |

### <AgentDetails />

What one agent is doing: status, current activity, model, token usage, time and recent steps.

| Prop | Type | Default | Description |
|---|---|---|---|
| `node` **(required)** | `Omit<AgentNode, "parentId"> & { parentId?: string \| undefined; }` | — |  |
| `onClose` | `(() => void)` | — |  |
| `className` | `string` | — |  |
