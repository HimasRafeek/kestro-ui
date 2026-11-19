# ToolCallRow

> Category: Agent transparency · Package: `kestro-ui`

Compact, single-line tool status for dense lists and dashboards, with progress, duration and retry.

## Import

```tsx
import { ToolCallRow } from "kestro-ui";
```

## Example: tool-call-row

```tsx
import { useEffect, useState } from "react";
import { ToolCallRow } from "kestro-ui";
import { CalendarDays, FileText, Search } from "lucide-react";

export default function Example() {
  const [progress, setProgress] = useState(20);

  useEffect(() => {
    const id = setInterval(() => setProgress((p) => (p >= 100 ? 10 : p + 6)), 400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="w-full max-w-xl rounded-kui border border-kui-border bg-kui-surface px-4">
      <ToolCallRow name="search_flights" icon={<Search />} status="running" progress={progress} />
      <ToolCallRow name="check_fare_rules" icon={<FileText />} status="success" durationMs={218} />
      <ToolCallRow name="book_flight" icon={<CalendarDays />} status="waiting" />
      <ToolCallRow name="fetch_receipt" icon={<FileText />} status="error" detail="Airline API timed out after 30s" onRetry={() => {}} />
    </div>
  );
}
```

## API

### <ToolCallRow />

Compact, single-line tool status — for dense lists and dashboards.

| Prop | Type | Default | Description |
|---|---|---|---|
| `name` **(required)** | `string` | — |  |
| `status` **(required)** | `"success" \| "waiting" \| "error" \| "pending" \| "running" \| "denied"` | — |  |
| `icon` | `ReactNode` | — |  |
| `progress` | `number` | — | 0–100 shows a progress bar while running. |
| `durationMs` | `number` | — |  |
| `detail` | `ReactNode` | — |  |
| `onRetry` | `(() => void)` | — |  |
| `className` | `string` | — |  |
