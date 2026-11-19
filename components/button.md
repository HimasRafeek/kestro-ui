# Button

> Category: Primitives · Package: `kestro-ui`

Buttons and icon buttons with variants, sizes and loading state.

## Import

```tsx
import { Button, IconButton } from "kestro-ui";
```

## Example: button

```tsx
import { Button, IconButton } from "kestro-ui";
import { Copy, Mail, Plus, Send, Sparkles, Trash2 } from "lucide-react";

export default function Example() {
  return (
    <div className="w-full max-w-xl space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Button>Primary</Button>
        <Button variant="accent">
          <Sparkles /> Ask agent
        </Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">
          <Trash2 /> Delete
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button size="xs">Extra small</Button>
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">
          <Send /> Large
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="accent" loading>
          Booking…
        </Button>
        <Button variant="outline" disabled>
          <Mail /> Disabled
        </Button>
        <IconButton label="Copy" size="xs">
          <Copy />
        </IconButton>
        <IconButton label="New chat" variant="outline">
          <Plus />
        </IconButton>
        <IconButton label="Delete conversation" size="md" variant="secondary">
          <Trash2 />
        </IconButton>
      </div>
    </div>
  );
}
```

## API

### <Button />

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `"accent" \| "danger" \| "primary" \| "secondary" \| "outline" \| "ghost"` | `"primary"` |  |
| `size` | `"xs" \| "sm" \| "md" \| "lg" \| "icon" \| "icon-sm" \| "icon-xs"` | `"md"` |  |
| `loading` | `false \| true` | — |  |

Also accepts the native HTML attributes of its root element.

### <IconButton />

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` **(required)** | `string` | — |  |
| `size` | `"xs" \| "sm" \| "md"` | `"sm"` |  |
| `tooltip` | `false \| true` | `true` |  |
| `variant` | `"accent" \| "danger" \| "primary" \| "secondary" \| "outline" \| "ghost"` | `"ghost"` |  |
| `loading` | `false \| true` | — |  |

Also accepts the native HTML attributes of its root element.
