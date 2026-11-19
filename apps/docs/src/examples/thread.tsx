import { useState } from "react";
import { Button, Message, Thread } from "kestro-ui";
import { Plus } from "lucide-react";

type Line = { id: number; from: "user" | "assistant"; text: string };

const script = [
  "Is the 2 TB NVMe drive compatible with my laptop?",
  "Yes! Your model has an M.2 2280 slot that supports PCIe 4.0, so it will work at full speed.",
  "Great. Does it come with a heatsink?",
  "It doesn't, but your laptop has a built-in thermal pad over the slot, so you won't need one.",
  "Can it arrive by Friday?",
  "Order in the next 3 hours and choose Express — it arrives Thursday.",
];

export default function Example() {
  const [lines, setLines] = useState<Line[]>(
    script.slice(0, 4).map((text, i) => ({ id: i, from: i % 2 ? "assistant" : "user", text })),
  );

  const add = () =>
    setLines((ls) => {
      const i = ls.length;
      return [...ls, { id: i, from: i % 2 ? "assistant" : "user", text: script[i % script.length] }];
    });

  return (
    <div className="w-full max-w-xl space-y-3">
      <div className="flex h-[420px] flex-col overflow-hidden rounded-kui border border-kui-border bg-kui-bg">
        <Thread contentClassName="gap-5 py-5">
          {lines.map((l) => (
            <Message key={l.id} from={l.from} name={l.from === "assistant" ? "Shopper" : undefined}>
              {l.text}
            </Message>
          ))}
        </Thread>
      </div>
      <Button variant="outline" size="sm" onClick={add}>
        <Plus /> Add message
      </Button>
    </div>
  );
}
