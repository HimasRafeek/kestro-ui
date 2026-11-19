# AgentAvatar

> Category: Multi-agent · Package: `kestro-ui`

Avatar with live status (online, working, waiting, error, offline) and gradient agent tile.

## Import

```tsx
import { AgentAvatar } from "kestro-ui";
```

## Example: agent-avatar

```tsx
import { AgentAvatar, type AgentState } from "kestro-ui";
import { Bot, Headset, Plane } from "lucide-react";

const states: AgentState[] = ["idle", "online", "thinking", "working", "waiting", "error", "offline"];

export default function Example() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-8">
      <div className="flex items-end gap-4">
        <AgentAvatar size="xs" name="Atlas" />
        <AgentAvatar size="sm" name="Atlas" />
        <AgentAvatar size="md" name="Atlas" />
        <AgentAvatar size="lg" name="Atlas" />
      </div>

      <div className="flex flex-wrap gap-5">
        {states.map((state) => (
          <div key={state} className="flex flex-col items-center gap-2">
            <AgentAvatar size="md" name="Atlas" state={state} />
            <span className="text-xs text-kui-fg-subtle capitalize">{state}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <AgentAvatar size="md" variant="user" name="Maya Chen" state="online" />
        <AgentAvatar size="md" variant="user" name="Diego Ramírez" />
        <AgentAvatar size="md" name="Travel" icon={<Plane />} state="working" />
        <AgentAvatar size="md" name="Support" icon={<Headset />} state="waiting" />
        <AgentAvatar size="md" name="Ops" icon={<Bot />} />
        <AgentAvatar size="md" name="Research Lab" initials />
      </div>
    </div>
  );
}
```

## API

### <AgentAvatar />

| Prop | Type | Default | Description |
|---|---|---|---|
| `name` | `string` | — | Used for initials & accessible label. |
| `src` | `string` | — |  |
| `icon` | `ReactNode` | — | Custom icon; defaults to a sparkle (gradient) or a monogram of `name` (monogram). |
| `initials` | `false \| true` | — | Show initials instead of the icon (e.g. for human users). |
| `state` | `"idle" \| "online" \| "thinking" \| "working" \| "waiting" \| "error" \| "offline"` | — |  |
| `size` | `"xs" \| "sm" \| "md" \| "lg"` | `"sm"` |  |
| `variant` | `"agent" \| "user"` | `"agent"` | "agent" renders the accent gradient, "user" a neutral tile. |
| `appearance` | `"gradient" \| "monogram"` | `"gradient"` | Agent tile style. "gradient" (default) is the accent gradient tile; "monogram" is a flat letter tile tinted by `color`. |
| `color` | `"accent" \| "auto" \| "ink" \| (string & {})` | `"auto"` | Monogram tile color: a CSS color, "accent", "ink", or "auto" (a muted color picked from the name so each agent is recognisable). Default "auto". |
| `className` | `string` | — |  |
