# TraceTree

> Category: Multi-agent · Package: `kestro-ui`

Nested trace of agent, LLM, tool and retrieval spans with a live waterfall timeline. Running spans grow in real time.

## Import

```tsx
import { TraceTree } from "kestro-ui";
```

## Example: trace-tree

```tsx
import { useEffect, useState } from "react";
import { Button, TraceTree, type TraceSpan } from "kestro-ui";

const trace: TraceSpan[] = [
  { id: "run", name: "Support agent", kind: "agent", start: 0, end: 6400 },
  { id: "guard", parentId: "run", name: "PII check", kind: "guardrail", start: 80, end: 420 },
  { id: "plan", parentId: "run", name: "Understand the request", kind: "llm", start: 450, end: 1700, meta: "640 tok" },
  { id: "kb", parentId: "run", name: "help_center.search", kind: "retrieval", start: 1750, end: 2900, meta: "5 docs" },
  { id: "order", parentId: "run", name: "orders.lookup #4821", kind: "tool", start: 1800, end: 2600 },
  { id: "refund", parentId: "run", name: "Refund specialist", kind: "handoff", start: 3000, end: 5400 },
  { id: "policy", parentId: "refund", name: "Check refund policy", kind: "llm", start: 3100, end: 4300, meta: "1.1k tok" },
  { id: "issue", parentId: "refund", name: "payments.refund $249", kind: "tool", start: 4400, end: 5300 },
  { id: "reply", parentId: "run", name: "Write the reply", kind: "llm", start: 5450, end: 6400, meta: "380 tok" },
];

export default function Example() {
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (now >= 6400) return;
    const id = setTimeout(() => setNow((n) => Math.min(6400, n + 100)), 60);
    return () => clearTimeout(id);
  }, [now]);

  // Only show spans that have started; unfinished ones render as live bars.
  const spans = trace
    .filter((s) => s.start <= now)
    .map((s) => ({ ...s, end: s.end !== undefined && s.end <= now ? s.end : undefined }));

  return (
    <div className="w-full max-w-2xl space-y-3">
      <TraceTree spans={spans} now={now} />
      <Button variant="outline" size="sm" onClick={() => setNow(0)}>
        Replay trace
      </Button>
    </div>
  );
}
```

## API

### <TraceTree />

Nested trace of agent, LLM and tool spans with a live waterfall timeline.

| Prop | Type | Default | Description |
|---|---|---|---|
| `spans` **(required)** | `TraceSpan[]` | — |  |
| `now` | `number` | — | Current time (ms from trace start) for running spans. Auto-advances when omitted. |
| `selectedId` | `string` | — |  |
| `onSelect` | `((id: string) => void)` | — |  |
| `className` | `string` | — |  |
