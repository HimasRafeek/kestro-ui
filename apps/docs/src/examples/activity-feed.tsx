import { useState } from "react";
import { ActivityFeed, Button, type ActivityItem } from "kestro-ui";
import { CalendarCheck, CreditCard, Mail, Package, Plus, TriangleAlert, Truck } from "lucide-react";

const initial: ActivityItem[] = [
  { id: "1", title: "Order #4821 shipped", description: "UPS · arriving Thursday", icon: <Truck />, tone: "success", time: "09:12" },
  { id: "2", title: "Refund issued to Maya Chen", description: "$42.00 to Visa •• 4242", icon: <CreditCard />, tone: "accent", time: "09:05" },
  { id: "3", title: "Low stock: Trail Runner 2, size 9", description: "3 units left in Denver warehouse", icon: <TriangleAlert />, tone: "warning", time: "08:47" },
  { id: "4", title: "Weekly digest sent", description: "1,284 subscribers", icon: <Mail />, time: "08:30" },
];

const extras: Omit<ActivityItem, "id" | "time">[] = [
  { title: "Restock order placed", description: "120 units from supplier", icon: <Package />, tone: "accent" },
  { title: "Demo call booked", description: "Acme Corp · Friday 2:00 PM", icon: <CalendarCheck />, tone: "success" },
  { title: "Payment failed", description: "Card declined for order #4830", icon: <CreditCard />, tone: "danger" },
];

export default function Example() {
  const [items, setItems] = useState(initial);

  const addItem = () => {
    const next = extras[items.length % extras.length];
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
    setItems((prev) => [{ ...next, id: String(Date.now()), time }, ...prev]);
  };

  return (
    <div className="w-full max-w-md rounded-kui border border-kui-border bg-kui-surface px-4 py-3">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-kui-fg">Store agent activity</h3>
        <Button size="xs" variant="outline" onClick={addItem}>
          <Plus /> Add event
        </Button>
      </div>
      <ActivityFeed items={items.slice(0, 6)} />
    </div>
  );
}
