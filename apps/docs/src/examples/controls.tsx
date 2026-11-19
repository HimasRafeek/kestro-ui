import { useState } from "react";
import { SegmentedControl, Switch } from "kestro-ui";
import { Bot, Hand, Zap } from "lucide-react";

export default function Example() {
  const [mode, setMode] = useState("ask");
  const [voice, setVoice] = useState(true);
  const [memory, setMemory] = useState(false);

  return (
    <div className="w-full max-w-sm space-y-5 rounded-kui border border-kui-border bg-kui-surface p-5">
      <div className="space-y-2">
        <p className="text-[13px] font-medium">Autonomy</p>
        <SegmentedControl
          block
          aria-label="Autonomy"
          value={mode}
          onValueChange={setMode}
          options={[
            { value: "manual", label: "Manual", icon: <Hand /> },
            { value: "ask", label: "Ask first", icon: <Bot /> },
            { value: "auto", label: "Auto", icon: <Zap /> },
          ]}
        />
      </div>
      <label className="flex items-center justify-between">
        <span className="text-[13px]">Voice replies</span>
        <Switch checked={voice} onCheckedChange={setVoice} aria-label="Voice replies" />
      </label>
      <label className="flex items-center justify-between">
        <span className="text-[13px]">Remember past conversations</span>
        <Switch checked={memory} onCheckedChange={setMemory} aria-label="Remember past conversations" />
      </label>
    </div>
  );
}
