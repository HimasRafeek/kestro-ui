# RunCard

> Category: Workflows · Package: `kestro-ui`

One agent run at a glance: title, run id, status chip and a step timeline that can hold tool calls and approvals.

## Import

```tsx
import { RunCard } from "kestro-ui";
```

## Example: run-card

```tsx
import { useState } from "react";
import { RunCard, ToolApproval, ToolCall } from "kestro-ui";
import { Mail } from "lucide-react";

export default function Example() {
  const [decision, setDecision] = useState<"pending" | "approved" | "denied">("pending");

  return (
    <RunCard
      className="max-w-xl"
      title="Weekly investor update"
      runId="Run 0388"
      status={decision === "pending" ? "waiting" : decision === "approved" ? "complete" : "failed"}
      steps={[
        { id: "1", title: "Pull this week's metrics", description: "Revenue, churn and pipeline from 3 sources.", status: "complete", duration: 6 },
        {
          id: "2",
          title: "Draft the email",
          status: "complete",
          duration: 11,
          content: <ToolCall name="docs.write" status="success" durationMs={2140} input={{ template: "investor-update", words: 280 }} />,
        },
        {
          id: "3",
          title: decision === "approved" ? "Sent" : "Send to 14 investors",
          status: decision === "pending" ? "waiting" : decision === "approved" ? "complete" : "error",
          content: (
            <ToolApproval
              title="Send this update to 14 investors?"
              icon={<Mail />}
              rememberLabel={false}
              status={decision}
              onApprove={() => setDecision("approved")}
              onDeny={() => setDecision("denied")}
            />
          ),
        },
      ]}
    />
  );
}
```

## API

### <RunCard />

A single agent run: title, run id, status chip and a step timeline with rich step content.

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` **(required)** | `ReactNode` | — |  |
| `runId` | `ReactNode` | — |  |
| `status` | `"waiting" \| "running" \| "complete" \| "failed" \| "paused"` | `"running"` |  |
| `steps` **(required)** | `RunStep[]` | — |  |
| `actions` | `ReactNode` | — | Header actions. |
| `className` | `string` | — |  |
