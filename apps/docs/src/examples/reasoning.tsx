import { useState } from "react";
import { Button, Reasoning } from "kestro-ui";

const thoughts = `The user wants to fly **NYC → Tokyo** in late March under $900.

- Direct flights from JFK start around $1,150, too expensive.
- One-stop via Seoul on Mar 24 is $812 with a 2h layover.
- Checking whether Haneda or Narita is closer to their hotel in Shibuya…`;

export default function Example() {
  const [streaming, setStreaming] = useState(true);

  return (
    <div className="w-full max-w-xl space-y-4">
      <Reasoning content={thoughts} streaming={streaming} />
      <Button variant="outline" size="xs" onClick={() => setStreaming((s) => !s)}>
        {streaming ? "Finish thinking" : "Resume thinking"}
      </Button>

      <Reasoning
        duration={14}
        content="Compared 3 refund policies. The order is within the 30-day window and unopened, so a full refund applies."
      />

      <Reasoning
        variant="inline"
        duration={6}
        defaultOpen
        content="Converted 2 cups of flour to **250 g** and scaled the recipe from 4 to 6 servings."
      />
    </div>
  );
}
