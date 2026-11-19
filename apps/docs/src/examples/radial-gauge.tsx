import { useEffect, useState } from "react";
import { RadialGauge } from "kestro-ui";

const jitter = (v: number, spread: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v + (Math.random() - 0.5) * spread));

export default function Example() {
  const [cpu, setCpu] = useState(42);
  const [confidence, setConfidence] = useState(0.91);
  const [context, setContext] = useState(64_000);
  const [load, setLoad] = useState(58);

  useEffect(() => {
    const id = setInterval(() => {
      setCpu((v) => jitter(v, 30, 5, 98));
      setConfidence((v) => jitter(v, 0.12, 0.55, 0.99));
      setContext((v) => jitter(v, 30_000, 10_000, 195_000));
      setLoad((v) => jitter(v, 40, 10, 99));
    }, 1500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex w-full max-w-2xl flex-wrap justify-center gap-8">
      <RadialGauge label="CPU" value={cpu} unit="%" />
      <RadialGauge label="Confidence" value={confidence} max={1} tone="info" format={(v) => v.toFixed(2)} />
      <RadialGauge label="Context" value={context} max={200_000} tone="warning" format={(v) => `${Math.round(v / 1000)}k`} />
      <RadialGauge label="Queue load" value={load} unit="%" tone="auto" />
    </div>
  );
}
