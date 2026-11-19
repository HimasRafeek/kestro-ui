# TaskBoard

> Category: Tasks · Package: `kestro-ui`

Kanban board of agent tasks — Queued, Running, Needs you, Done — with drag and drop and live progress.

## Import

```tsx
import { TaskBoard, TaskCard } from "kestro-ui";
```

## Example: task-board

```tsx
import { useEffect, useState } from "react";
import { TaskBoard, type AgentTask } from "kestro-ui";

const initial: AgentTask[] = [
  { id: "1", title: "Chase overdue invoices", status: "queued", agent: { name: "Ledger" }, priority: "high", tags: ["finance"], schedule: "Today 14:00" },
  { id: "2", title: "Weekly competitor pricing", status: "running", agent: { name: "Scout" }, progress: 35, steps: { done: 2, total: 5 }, tags: ["research"] },
  { id: "3", title: "Refund order #4821", status: "needs-input", agent: { name: "Support" }, description: "Approve a $249 refund to the original card.", priority: "urgent" },
  { id: "4", title: "Summarize Q3 board notes", status: "done", agent: { name: "Docs" }, updated: "12m ago", tags: ["docs"] },
  { id: "5", title: "Rebook Lisbon flight", status: "running", agent: { name: "Atlas" }, progress: 70, steps: { done: 4, total: 6 }, tags: ["travel"] },
];

export default function Example() {
  const [tasks, setTasks] = useState(initial);

  // Running tasks make progress on their own
  useEffect(() => {
    const id = setInterval(() => {
      setTasks((list) =>
        list.map((t) => {
          if (t.status !== "running") return t;
          const progress = Math.min(100, (t.progress ?? 0) + 7);
          return progress >= 100 ? { ...t, status: "done", progress, updated: "just now" } : { ...t, progress };
        }),
      );
    }, 1200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="w-full">
      <p className="mb-3 text-sm text-kui-fg-muted">Drag cards between columns.</p>
      <TaskBoard
        tasks={tasks}
        onMove={(id, status) => setTasks((list) => list.map((t) => (t.id === id ? { ...t, status, progress: status === "running" ? (t.progress ?? 0) : t.progress } : t)))}
        onAdd={(status) => setTasks((list) => [...list, { id: String(Date.now()), title: "New task", status, agent: { name: "Scout" } }])}
      />
    </div>
  );
}
```

## API

### <TaskBoard />

Kanban board of agent tasks with drag-and-drop between columns.

| Prop | Type | Default | Description |
|---|---|---|---|
| `tasks` **(required)** | `AgentTask[]` | — |  |
| `columns` | `TaskColumn[]` | `defaultTaskColumns` |  |
| `onMove` | `((taskId: string, status: TaskStatus) => void)` | — | Called when a task is dragged to another column. |
| `onOpen` | `((id: string) => void)` | — |  |
| `onAdd` | `((status: TaskStatus) => void)` | — | Shows a "+" button per column. |
| `className` | `string` | — |  |

### <TaskCard />

Compact card for one agent task: status, agent, progress, schedule, tags.

| Prop | Type | Default | Description |
|---|---|---|---|
| `task` **(required)** | `AgentTask` | — |  |
| `onOpen` | `((id: string) => void)` | — |  |
| `actions` | `ReactNode` | — | Extra controls, rendered in the footer. |
| `draggable` | `false \| true` | — | Enable HTML5 drag (used by TaskBoard). |
| `onDragStart` | `((e: DragEvent<Element>, id: string) => void)` | — |  |
| `selected` | `false \| true` | — |  |
| `className` | `string` | — |  |
