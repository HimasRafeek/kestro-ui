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
