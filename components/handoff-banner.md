# HandoffBanner

> Category: Human in the loop · Package: `kestro-ui`

Escalate a conversation from the AI to a human specialist.

## Import

```tsx
import { HandoffBanner } from "kestro-ui";
```

## Example: handoff-banner

```tsx
import { useState } from "react";
import { Button, HandoffBanner, type HandoffBannerProps } from "kestro-ui";

const statuses: HandoffBannerProps["status"][] = ["requested", "connecting", "connected", "ended"];

export default function Example() {
  const [status, setStatus] = useState<HandoffBannerProps["status"]>("requested");

  return (
    <div className="w-full max-w-xl space-y-4">
      <HandoffBanner status={status} agentName="Maya from Support" eta="~2 min" onCancel={() => setStatus("ended")} />
      <div className="flex flex-wrap gap-2">
        {statuses.map((s) => (
          <Button key={s} size="xs" variant={s === status ? "secondary" : "ghost"} onClick={() => setStatus(s)}>
            {s}
          </Button>
        ))}
      </div>
    </div>
  );
}
```

## API

### <HandoffBanner />

Banner for escalating a conversation from AI to a human (support use-cases).

| Prop | Type | Default | Description |
|---|---|---|---|
| `status` **(required)** | `"requested" \| "connecting" \| "connected" \| "ended"` | — |  |
| `agentName` | `string` | — | Human agent name once connected. |
| `agentAvatar` | `string` | — |  |
| `eta` | `ReactNode` | — | e.g. "~2 min" |
| `onCancel` | `(() => void)` | — |  |
| `className` | `string` | — |  |
