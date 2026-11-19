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
