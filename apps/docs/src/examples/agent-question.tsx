import { useState } from "react";
import { AgentQuestion } from "kestro-ui";
import { Building2, House, Tent } from "lucide-react";

type Answer = { optionIds: string[]; text?: string };

export default function Example() {
  const [stay, setStay] = useState<Answer | null>(null);
  const [diet, setDiet] = useState<Answer | null>(null);

  return (
    <div className="w-full max-w-xl space-y-4">
      <AgentQuestion
        question="Where would you like to stay in Kyoto?"
        description="I'll only show options that fit your $180/night budget."
        options={[
          { id: "hotel", label: "Hotel", description: "Central, near Kyoto Station", icon: <Building2 /> },
          { id: "ryokan", label: "Ryokan", description: "Traditional inn with onsen", icon: <House /> },
          { id: "glamping", label: "Glamping", description: "Forest stay in Arashiyama", icon: <Tent /> },
        ]}
        answered={!!stay}
        onSubmit={setStay}
      />

      <AgentQuestion
        question="Any dietary preferences for the meal plan?"
        multiple
        allowCustom
        customPlaceholder="Anything else? e.g. no cilantro"
        options={[
          { id: "veg", label: "Vegetarian" },
          { id: "gf", label: "Gluten-free" },
          { id: "dairy", label: "Dairy-free" },
          { id: "lowcarb", label: "Low carb" },
        ]}
        answered={!!diet}
        onSubmit={setDiet}
        onSkip={() => setDiet({ optionIds: [] })}
      />

      <pre className="rounded-kui-sm bg-kui-surface-2 p-3 text-xs text-kui-fg-muted">
        {JSON.stringify({ stay, diet }, null, 2)}
      </pre>
    </div>
  );
}
