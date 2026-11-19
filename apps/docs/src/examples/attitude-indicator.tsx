import { useEffect, useState } from "react";
import { AttitudeIndicator, Button, type CoreState } from "kestro-ui";

const states: { state: CoreState; label: string; value: number }[] = [
  { state: "idle", label: "Standing by", value: 10 },
  { state: "thinking", label: "Planning", value: 45 },
  { state: "speaking", label: "Speaking", value: 70 },
  { state: "error", label: "Tool failed", value: 45 },
];

export default function Example() {
  const [i, setI] = useState(1);
  const [level, setLevel] = useState(0);
  const { state, label, value } = states[i];

  // Fake audio level while speaking
  useEffect(() => {
    if (state !== "speaking") return;
    const id = setInterval(() => setLevel(0.3 + Math.random() * 0.6), 120);
    return () => clearInterval(id);
  }, [state]);

  return (
    <div className="flex flex-col items-center gap-5">
      <AttitudeIndicator state={state} level={level} value={value} label={label} sublabel="Concierge / A-01" size={360} />
      <div className="flex flex-wrap justify-center gap-2">
        {states.map((s, j) => (
          <Button key={s.state} size="sm" variant={i === j ? "primary" : "outline"} onClick={() => setI(j)}>
            {s.state}
          </Button>
        ))}
      </div>
    </div>
  );
}
