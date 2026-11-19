# ConversationList

> Category: Workflows · Package: `kestro-ui`

Sidebar of threads grouped by date, with search, new chat, running and unread states.

## Import

```tsx
import { ConversationList } from "kestro-ui";
```

## Example: conversation-list

```tsx
import { useState } from "react";
import { ConversationList, type ConversationItem } from "kestro-ui";
import { ChartLine, Coffee, Headset, Plane, ShoppingCart } from "lucide-react";

const initial: ConversationItem[] = [
  { id: "1", group: "Today", title: "Lisbon offsite logistics", icon: <Plane />, running: true },
  { id: "2", group: "Today", title: "Q3 churn analysis", icon: <ChartLine />, unread: true },
  { id: "3", group: "Today", title: "Refund for order #4821", icon: <Headset /> },
  { id: "4", group: "Yesterday", title: "Gift ideas under $50", icon: <ShoppingCart /> },
  { id: "5", group: "Yesterday", title: "Best espresso grinders 2026", icon: <Coffee />, unread: true },
  { id: "6", group: "Yesterday", title: "Draft investor update" },
  { id: "7", group: "Previous 7 days", title: "Summarize onboarding calls" },
  { id: "8", group: "Previous 7 days", title: "Compare CRM pricing" },
];

export default function Example() {
  const [items, setItems] = useState(initial);
  const [activeId, setActiveId] = useState("2");

  return (
    <div className="h-[440px] w-72 overflow-hidden rounded-kui border border-kui-border">
      <ConversationList
        items={items}
        activeId={activeId}
        onSelect={(id) => {
          setActiveId(id);
          setItems((prev) => prev.map((i) => (i.id === id ? { ...i, unread: false } : i)));
        }}
        onNew={() => {
          const id = String(Date.now());
          setItems((prev) => [{ id, group: "Today", title: "New conversation" }, ...prev]);
          setActiveId(id);
        }}
        onDelete={(id) => setItems((prev) => prev.filter((i) => i.id !== id))}
      />
    </div>
  );
}
```

## API

### <ConversationList />

Sidebar with threads grouped by date, search and "New chat".

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` **(required)** | `ConversationItem[]` | — |  |
| `activeId` | `string` | — |  |
| `onSelect` | `((id: string) => void)` | — |  |
| `onNew` | `(() => void)` | — |  |
| `onDelete` | `((id: string) => void)` | — |  |
| `newLabel` | `ReactNode` | `"New chat"` |  |
| `searchable` | `false \| true` | `true` |  |
| `header` | `ReactNode` | — |  |
| `footer` | `ReactNode` | — |  |
| `className` | `string` | — |  |
