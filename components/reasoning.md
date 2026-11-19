# Reasoning

> Category: Agent transparency · Package: `kestro-ui`

Collapsible thinking block with live shimmer, last-line preview and automatic duration.

## Import

```tsx
import { Reasoning } from "kestro-ui";
```

## Example: reasoning

```tsx
import { useState } from "react";
import { Button, Reasoning } from "kestro-ui";

const thoughts = `The user wants to fly **NYC → Tokyo** in late March under $900.

- Direct flights from JFK start around $1,150, too expensive.
- One-stop via Seoul on Mar 24 is $812 with a 2h layover.
- Checking whether Haneda or Narita is closer to their hotel in Shibuya…`;

export default function Example() {
  const [streaming, setStreaming] = useState(true);

  return (
    <div className="w-full max-w-xl space-y-4">
      <Reasoning content={thoughts} streaming={streaming} />
      <Button variant="outline" size="xs" onClick={() => setStreaming((s) => !s)}>
        {streaming ? "Finish thinking" : "Resume thinking"}
      </Button>

      <Reasoning
        duration={14}
        content="Compared 3 refund policies. The order is within the 30-day window and unopened, so a full refund applies."
      />

      <Reasoning
        variant="inline"
        duration={6}
        defaultOpen
        content="Converted 2 cups of flour to **250 g** and scaled the recipe from 4 to 6 servings."
      />
    </div>
  );
}
```

## API

### <Reasoning />

| Prop | Type | Default | Description |
|---|---|---|---|
| `content` | `string` | — | The reasoning text (markdown) — or pass `children`. |
| `children` | `ReactNode` | — |  |
| `streaming` | `false \| true` | `false` | True while the model is still thinking. |
| `duration` | `number` | — | Seconds spent thinking. Measured automatically if omitted. |
| `summary` | `ReactNode` | — | Optional one-line summary shown under the title. |
| `variant` | `"card" \| "inline"` | `"card"` | "card" (bordered) or "inline" (minimal, flows with the message). |
| `open` | `false \| true` | — |  |
| `defaultOpen` | `false \| true` | `false` |  |
| `onOpenChange` | `((open: boolean) => void)` | — |  |
| `labels` | `{ thinking?: ReactNode; thought?: ((seconds: number) => ReactNode) \| undefined; }` | — | Label overrides. |
| `className` | `string` | — |  |
