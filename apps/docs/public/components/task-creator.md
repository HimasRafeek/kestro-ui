# TaskCreator

> Category: Tasks · Package: `kestro-ui`

Hand an agent a job: what to do, which agent, when it runs (now, scheduled or repeating), what it may do without asking, and a spend limit.

## Import

```tsx
import { TaskCreator } from "kestro-ui";
```

## Example: task-creator

```tsx
import { useState } from "react";
import { TaskCreator, type NewTask } from "kestro-ui";
import { CreditCard, Globe, Mail, Table } from "lucide-react";

export default function Example() {
  const [created, setCreated] = useState<NewTask | null>(null);

  return (
    <div className="w-full max-w-xl space-y-3">
      <TaskCreator
        agents={[
          { id: "scout", name: "Scout", description: "Research & monitoring" },
          { id: "ledger", name: "Ledger", description: "Finance & invoices" },
        ]}
        templates={[
          { label: "Competitor prices", title: "Weekly competitor pricing report", instructions: "Check the pricing pages of our 5 main competitors, note any changes since last week, and email me a short summary table." },
          { label: "Chase invoices", title: "Chase overdue invoices", instructions: "Find invoices more than 14 days overdue and draft a polite reminder for each customer." },
        ]}
        permissions={[
          { id: "web", label: "Browse the web", icon: <Globe />, defaultMode: "allow" },
          { id: "sheets", label: "Edit spreadsheets", icon: <Table />, defaultMode: "allow" },
          { id: "email", label: "Send email", description: "From your work address", icon: <Mail />, defaultMode: "ask" },
          { id: "pay", label: "Make payments", icon: <CreditCard />, defaultMode: "off" },
        ]}
        onSubmit={setCreated}
        onCancel={() => setCreated(null)}
      />
      {created ? (
        <pre className="kui-scrollbar max-h-48 overflow-auto rounded-kui border border-kui-border bg-kui-code-bg p-3 font-mono text-xs text-kui-fg-muted">
          {JSON.stringify({ ...created, files: created.files.map((f) => f.name) }, null, 2)}
        </pre>
      ) : null}
    </div>
  );
}
```

## API

### <TaskCreator />

Form for handing an agent a job: what to do, who does it, when, what it may do on its own, and the budget.

| Prop | Type | Default | Description |
|---|---|---|---|
| `agents` | `TaskAgentOption[]` | `[]` |  |
| `permissions` | `TaskPermission[]` | `[]` |  |
| `templates` | `{ label: string; title: string; instructions: string; }[]` | `[]` | Starter templates shown above the instructions. |
| `currency` | `string` | `"$"` |  |
| `defaultBudget` | `number` | `5` |  |
| `submitLabel` | `ReactNode` | `"Create task"` |  |
| `onSubmit` | `((task: NewTask) => void)` | — |  |
| `onCancel` | `(() => void)` | — |  |
| `className` | `string` | — |  |
