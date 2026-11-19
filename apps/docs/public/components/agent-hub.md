# AgentHub

> Category: Multi-agent · Package: `kestro-ui`

Hub-and-spoke view of an orchestrator reaching out to the agents it coordinates, with swaying connections and live work packets.

## Import

```tsx
import { AgentHub } from "kestro-ui";
```

## Example: agent-hub

```tsx
import { useEffect, useState } from "react";
import { AgentHub, type AgentNodeState } from "kestro-ui";

const agents = [
  { id: "inbox", name: "Inbox", activity: "Triaging 48 emails" },
  { id: "calendar", name: "Calendar", activity: "Finding a slot" },
  { id: "docs", name: "Docs", activity: "Summarizing Q3 notes" },
  { id: "crm", name: "CRM", activity: "Updating 12 contacts" },
  { id: "billing", name: "Billing", activity: "Matching invoices" },
  { id: "travel", name: "Travel", activity: "Rebooking a flight" },
];

const cycle: AgentNodeState[] = ["queued", "working", "working", "done"];

export default function Example() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1600);
    return () => clearInterval(id);
  }, []);

  return (
    <AgentHub
      size={520}
      hub={{ id: "chief", name: "Chief of staff", state: "working", activity: "Coordinating 6 agents" }}
      agents={agents.map((a, i) => ({ ...a, state: cycle[(tick + i) % cycle.length] }))}
    />
  );
}
```

## API

### <AgentHub />

Hub-and-spoke ("octopus") view: an orchestrator reaching out to the agents it coordinates.

| Prop | Type | Default | Description |
|---|---|---|---|
| `hub` **(required)** | `Omit<AgentNode, "parentId">` | — | The orchestrating agent in the center. |
| `agents` **(required)** | `Omit<AgentNode, "parentId">[]` | — | Agents (or tools) the hub reaches out to. |
| `size` | `number` | `560` | Square size in px (scales down to fit). Default 560. |
| `sway` | `false \| true` | `true` | Gently sway the tentacles. Default true. |
| `selectedId` | `string` | — |  |
| `onSelect` | `((id: string) => void)` | — |  |
| `className` | `string` | — |  |
