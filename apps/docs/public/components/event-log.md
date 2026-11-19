# EventLog

> Category: HUD · Package: `kestro-ui`

Structured event stream (event name + key=value fields) for agent runs and audit trails.

## Import

```tsx
import { EventLog } from "kestro-ui";
```

## Example: event-log

```tsx
import { useEffect, useState } from "react";
import { Button, EventLog, type LogEvent } from "kestro-ui";

const script: Omit<LogEvent, "id" | "time">[] = [
  { event: "run.started", fields: { agent: "support-02", ticket: 88213 } },
  { event: "orders.lookup complete", fields: { order: "#4821", status: "delivered" } },
  { event: "policy.check complete", fields: { refundable: true, window_days: 30 } },
  { event: "approval.requested", tone: "warning", fields: { action: "refund", amount: "$249.00" } },
];

const stamp = () => new Date().toLocaleTimeString([], { hour12: false });

export default function Example() {
  const [events, setEvents] = useState<LogEvent[]>([]);

  useEffect(() => {
    if (events.length >= script.length) return;
    const id = setTimeout(() => {
      setEvents((list) => [
        ...list.map((e) => ({ ...e, streaming: false })),
        { ...script[list.length], id: String(list.length), time: stamp(), streaming: true },
      ]);
    }, 900);
    return () => clearTimeout(id);
  }, [events]);

  return (
    <div className="w-full max-w-lg space-y-3">
      <div className="rounded-kui border border-kui-border bg-kui-surface px-4 py-1">
        <EventLog events={events} footer={events.length === script.length ? "Awaiting operator input" : undefined} />
      </div>
      <Button variant="outline" size="sm" onClick={() => setEvents([])}>
        Replay
      </Button>
    </div>
  );
}
```

## API

### <EventLog />

Structured event stream (`event` + `key=value` fields) for agent runs and audits.

| Prop | Type | Default | Description |
|---|---|---|---|
| `events` **(required)** | `LogEvent[]` | — |  |
| `footer` | `ReactNode` | — | Footer prompt, e.g. "Awaiting operator input". |
| `className` | `string` | — |  |
