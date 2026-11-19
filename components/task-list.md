# TaskList

> Category: Tasks · Package: `kestro-ui`

Dense table of agent tasks with status, agent, progress, schedule and row actions.

## Import

```tsx
import { TaskList, TaskStatusBadge } from "kestro-ui";
```

## Example: task-list

```tsx
import { useState } from "react";
import { IconButton, TaskList, type AgentTask } from "kestro-ui";
import { Pause, Play } from "lucide-react";

const initial: AgentTask[] = [
  { id: "1", title: "Morning inbox digest", status: "scheduled", agent: { name: "Inbox" }, schedule: "Every weekday · 08:00", priority: "normal" },
  { id: "2", title: "Monitor flight prices LHR → LIS", status: "running", agent: { name: "Atlas" }, progress: 62, schedule: "Every hour" },
  { id: "3", title: "Reconcile Stripe payouts", status: "failed", agent: { name: "Ledger" }, description: "Bank API returned 401 — reconnect the account.", priority: "high" },
  { id: "4", title: "Draft newsletter", status: "done", agent: { name: "Writer" }, updated: "Yesterday" },
];

export default function Example() {
  const [tasks, setTasks] = useState(initial);
  const [selected, setSelected] = useState<string>();
  const toggle = (id: string) =>
    setTasks((list) => list.map((t) => (t.id === id ? { ...t, status: t.status === "running" ? "queued" : "running", progress: t.progress ?? 0 } : t)));

  return (
    <TaskList
      className="max-w-3xl"
      tasks={tasks}
      selectedId={selected}
      onOpen={setSelected}
      renderActions={(t) => (
        <IconButton label={t.status === "running" ? "Pause" : "Run now"} size="xs" onClick={() => toggle(t.id)}>
          {t.status === "running" ? <Pause /> : <Play />}
        </IconButton>
      )}
    />
  );
}
```

## API

### <TaskList />

Dense table of agent tasks: status, agent, progress, schedule.

| Prop | Type | Default | Description |
|---|---|---|---|
| `tasks` **(required)** | `AgentTask[]` | — |  |
| `onOpen` | `((id: string) => void)` | — |  |
| `selectedId` | `string` | — |  |
| `renderActions` | `((task: AgentTask) => ReactNode)` | — | Row actions, e.g. run / pause / menu. |
| `className` | `string` | — |  |

### <TaskStatusBadge />

| Prop | Type | Default | Description |
|---|---|---|---|
| `status` **(required)** | `"running" \| "failed" \| "draft" \| "queued" \| "needs-input" \| "done" \| "scheduled"` | — |  |
| `className` | `string` | — |  |
