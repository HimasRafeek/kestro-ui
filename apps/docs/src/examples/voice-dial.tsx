import { useEffect, useState } from "react";
import { VoiceDial, type VoiceState } from "kestro-ui";

const states: VoiceState[] = ["idle", "listening", "thinking", "speaking"];

export default function Example() {
  const [level, setLevel] = useState(0.4);

  useEffect(() => {
    const id = setInterval(() => setLevel(0.25 + Math.random() * 0.7), 140);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
      {states.map((s) => (
        <div key={s} className="flex flex-col items-center gap-3">
          <VoiceDial state={s} level={level} size={120} />
          <span className="font-mono text-xs text-kui-fg-subtle uppercase">{s}</span>
        </div>
      ))}
    </div>
  );
}
