import { Badge, Button, Kbd, ShimmerText, Spinner, StatusDot, Tooltip } from "kestro-ui";
import { Check, Info } from "lucide-react";

export default function Example() {
  return (
    <div className="w-full max-w-xl space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge>Neutral</Badge>
        <Badge tone="accent">New</Badge>
        <Badge tone="success">
          <Check /> Delivered
        </Badge>
        <Badge tone="warning" dot>
          Awaiting approval
        </Badge>
        <Badge tone="danger">Payment failed</Badge>
        <Badge tone="info" dot pulse>
          Live
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-5 text-sm text-kui-fg-muted">
        <span className="flex items-center gap-2">
          <StatusDot pulse /> Online
        </span>
        <span className="flex items-center gap-2">
          <StatusDot tone="warning" /> Away
        </span>
        <span className="flex items-center gap-2">
          <Spinner /> Loading
        </span>
        <ShimmerText>Searching 48 hotels…</ShimmerText>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm text-kui-fg-muted">
        <span className="flex items-center gap-1">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
          <span className="ml-1">to open the command menu</span>
        </span>
        <Tooltip content="Prices include taxes and fees">
          <Button variant="ghost" size="xs">
            <Info /> Hover me
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}
