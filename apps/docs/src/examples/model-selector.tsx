import { useState } from "react";
import { ModelSelector, type ModelOption } from "kestro-ui";
import { Brain, Globe, Search, Sparkles, Zap } from "lucide-react";

const models: ModelOption[] = [
  { id: "auto", name: "Auto", icon: <Sparkles />, description: "Routes each request to the best model" },
  { id: "flash", name: "Flash", icon: <Zap />, description: "Fastest replies, lowest cost", badge: "Fast" },
  { id: "reason", name: "Reasoner", icon: <Brain />, description: "Thinks step by step before answering", badge: "Reasoning" },
  { id: "research", name: "Deep research", icon: <Search />, description: "Reads dozens of sources for you", badge: "New" },
  { id: "web", name: "Web agent", icon: <Globe />, description: "Browses sites on your behalf", disabled: true },
];

export default function Example() {
  const [value, setValue] = useState("auto");

  return (
    <div className="flex w-full max-w-xl min-h-96 flex-col items-center gap-3">
      <ModelSelector models={models} value={value} onValueChange={setValue} side="bottom" label="Choose a model" />
      <p className="text-xs text-kui-fg-subtle">
        Selected: <code className="text-kui-fg-muted">{value}</code>
      </p>
    </div>
  );
}
