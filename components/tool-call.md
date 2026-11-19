# ToolCall

> Category: Agent transparency · Package: `kestro-ui`

Shows a tool invocation with arguments, result, status and duration. Pass children to render custom results (generative UI).

## Import

```tsx
import { ToolCall, ToolCallGroup, ToolStatusBadge } from "kestro-ui";
```

## Example: tool-call

```tsx
import { ToolCall } from "kestro-ui";

export default function Example() {
  return (
    <div className="w-full max-w-xl space-y-2">
      <ToolCall name="check_inventory" status="pending" input={{ sku: "SHOE-AIR-42" }} />
      <ToolCall name="web_search" title="Searching the web" status="running" input={{ query: "best ramen in Osaka" }} />
      <ToolCall
        name="get_order_status"
        status="success"
        input={{ order_id: "48213" }}
        output={{ status: "shipped", carrier: "UPS", eta: "2026-11-21" }}
        durationMs={840}
        defaultOpen
      />
      <ToolCall
        name="charge_card"
        status="error"
        input={{ amount: 129.0, currency: "USD" }}
        error="Card declined: insufficient funds."
        onRetry={() => console.log("retry")}
        durationMs={1200}
      />
      <ToolCall name="send_email" status="denied" input={{ to: "team@example.com", subject: "Q3 numbers" }} />
    </div>
  );
}
```

## Example: tool-call-custom

```tsx
import { ToolCall, ToolCallGroup } from "kestro-ui";
import { CloudRain, CloudSun, Sun } from "lucide-react";

const forecast = [
  { day: "Fri", icon: <Sun />, high: 24, low: 16 },
  { day: "Sat", icon: <CloudSun />, high: 21, low: 15 },
  { day: "Sun", icon: <CloudRain />, high: 18, low: 13 },
];

export default function Example() {
  return (
    <div className="w-full max-w-xl">
      <ToolCallGroup>
        <ToolCall name="geocode" title="Finding location" input={{ place: "Lisbon, Portugal" }} durationMs={210} />
        <ToolCall name="get_weather" title="Weekend forecast" input={{ city: "Lisbon", days: 3 }} durationMs={530} defaultOpen>
          <div className="grid grid-cols-3 gap-2">
            {forecast.map((d) => (
              <div
                key={d.day}
                className="flex flex-col items-center gap-1.5 rounded-kui-sm border border-kui-border bg-kui-surface-2 p-3 [&_svg]:size-6 [&_svg]:text-kui-accent"
              >
                <span className="text-xs font-medium text-kui-fg-muted">{d.day}</span>
                {d.icon}
                <span className="text-sm font-semibold text-kui-fg tabular-nums">
                  {d.high}° <span className="font-normal text-kui-fg-subtle">{d.low}°</span>
                </span>
              </div>
            ))}
          </div>
        </ToolCall>
      </ToolCallGroup>
    </div>
  );
}
```

## API

### <ToolCall />

| Prop | Type | Default | Description |
|---|---|---|---|
| `name` **(required)** | `string` | — | Tool identifier, e.g. "web_search". |
| `title` | `ReactNode` | — | Friendly title shown instead of the raw name (e.g. "Searching the web"). |
| `icon` | `ReactNode` | — |  |
| `status` | `"success" \| "error" \| "pending" \| "running" \| "denied"` | `"success"` |  |
| `input` | `unknown` | — |  |
| `output` | `unknown` | — |  |
| `error` | `ReactNode` | — |  |
| `durationMs` | `number` | — | Duration in milliseconds. |
| `children` | `ReactNode` | — | Custom output renderer — overrides the default JSON/text output view. |
| `open` | `false \| true` | — |  |
| `defaultOpen` | `false \| true` | `false` |  |
| `onOpenChange` | `((open: boolean) => void)` | — |  |
| `onRetry` | `(() => void)` | — |  |
| `className` | `string` | — |  |

### <ToolCallGroup />

Stack of tool calls with a subtle connecting header, e.g. "Used 3 tools".

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` **(required)** | `ReactNode` | — |  |
| `label` | `ReactNode` | — |  |
| `className` | `string` | — |  |

### <ToolStatusBadge />

| Prop | Type | Default | Description |
|---|---|---|---|
| `status` **(required)** | `"success" \| "error" \| "pending" \| "running" \| "denied"` | — |  |
