import { useState } from "react";
import { Suggestions } from "kestro-ui";
import { ChefHat, CreditCard, Plane, ShoppingBag } from "lucide-react";

export default function Example() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="w-full max-w-2xl space-y-6">
      <Suggestions
        suggestions={["Track my order", "Change my seat", "Cancel subscription", "Talk to a human"]}
        onSelect={setSelected}
      />

      <Suggestions
        variant="cards"
        onSelect={setSelected}
        suggestions={[
          { label: "Plan a trip", description: "A 4-day food tour of Tokyo", icon: <Plane />, value: "Plan a 4-day food tour of Tokyo" },
          { label: "Find a gift", description: "For a coffee lover, under $50", icon: <ShoppingBag />, value: "Find a gift for a coffee lover under $50" },
          { label: "Cook dinner", description: "Using chicken, rice and spinach", icon: <ChefHat />, value: "What can I cook with chicken, rice and spinach?" },
          { label: "Review spending", description: "Where did my money go in October?", icon: <CreditCard />, value: "Summarize my October spending" },
        ]}
      />

      <p className="text-center text-xs text-kui-fg-subtle">
        Last selected: <span className="text-kui-fg-muted">{selected ?? "nothing yet"}</span>
      </p>
    </div>
  );
}
