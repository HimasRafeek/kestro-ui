# AgentHeader

> Category: Workflows · Package: `kestro-ui`

Agent identity with live state badge and actions.

## Import

```tsx
import { AgentHeader } from "kestro-ui";
```

## Example: agent-header

```tsx
import { AgentHeader, Button, IconButton } from "kestro-ui";
import { Ellipsis, Headset, Phone, Plane, Search, Settings, Share2 } from "lucide-react";

export default function Example() {
  return (
    <div className="w-full max-w-xl divide-y divide-kui-border rounded-kui border border-kui-border bg-kui-surface">
      <AgentHeader
        className="p-4"
        name="Atlas"
        description="Travel concierge · books flights, hotels and dinners"
        state="online"
        avatar={{ icon: <Plane /> }}
        actions={
          <>
            <IconButton label="Share">
              <Share2 />
            </IconButton>
            <IconButton label="More">
              <Ellipsis />
            </IconButton>
          </>
        }
      />
      <AgentHeader
        className="p-4"
        name="Scout"
        description="Researching competitor pricing across 14 sites"
        state="working"
        stateLabel="Researching"
        avatar={{ icon: <Search /> }}
        actions={
          <Button size="sm" variant="outline">
            Stop
          </Button>
        }
      />
      <AgentHeader
        className="p-4"
        name="Nova Support"
        description="Waiting for you to confirm the refund"
        state="waiting"
        avatar={{ icon: <Headset /> }}
        actions={
          <>
            <IconButton label="Call">
              <Phone />
            </IconButton>
            <Button size="sm" variant="accent">
              Review
            </Button>
          </>
        }
      />
      <AgentHeader
        className="p-4"
        name="Ops Runner"
        description="Lost connection to the deployment cluster"
        state="error"
        actions={
          <IconButton label="Settings">
            <Settings />
          </IconButton>
        }
      />
    </div>
  );
}
```

## API

### <AgentHeader />

| Prop | Type | Default | Description |
|---|---|---|---|
| `name` **(required)** | `ReactNode` | — |  |
| `description` | `ReactNode` | — |  |
| `state` | `"idle" \| "online" \| "thinking" \| "working" \| "waiting" \| "error" \| "offline"` | `"online"` |  |
| `stateLabel` | `ReactNode` | — | Override the state label. |
| `avatar` | `AgentAvatarProps` | — |  |
| `actions` | `ReactNode` | — |  |
| `className` | `string` | — |  |
