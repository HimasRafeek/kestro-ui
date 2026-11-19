import { useRef, useState } from "react";
import { ModelSelector, PromptInput, type ChatStatus } from "kestro-ui";
import { Brain, Sparkles, Zap } from "lucide-react";

const models = [
  { id: "auto", name: "Auto", icon: <Sparkles />, description: "Picks the best model per request" },
  { id: "fast", name: "Fast", icon: <Zap />, description: "Quick answers for everyday tasks", badge: "Fast" },
  { id: "deep", name: "Deep think", icon: <Brain />, description: "Multi-step reasoning", badge: "Reasoning" },
];

export default function Example() {
  const [status, setStatus] = useState<ChatStatus>("ready");
  const [model, setModel] = useState("auto");
  const [listening, setListening] = useState(false);
  const [last, setLast] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const stop = () => {
    window.clearTimeout(timer.current);
    setStatus("ready");
  };

  return (
    <div className="w-full max-w-xl space-y-3">
      <PromptInput
        placeholder="Ask about your spending, budgets or bills…"
        status={status}
        onStop={stop}
        onSubmit={({ text }) => {
          setLast(text);
          setStatus("streaming");
          timer.current = window.setTimeout(() => setStatus("ready"), 2000);
        }}
        onVoice={() => setListening((v) => !v)}
        voiceActive={listening}
        toolbar={<ModelSelector models={models} value={model} onValueChange={setModel} />}
      />
      {last ? (
        <p className="text-center text-xs text-kui-fg-subtle">
          Sent with <span className="text-kui-fg-muted">{model}</span>: “{last}”
        </p>
      ) : null}
    </div>
  );
}
