import { useState } from "react";
import { Waveform } from "kestro-ui";

export default function Example() {
  const [level, setLevel] = useState(0.6);

  return (
    <div className="w-full max-w-xl space-y-6">
      <div className="space-y-3 rounded-kui border border-kui-border bg-kui-surface p-5">
        <Waveform level={level} />
        <label className="flex items-center gap-3 text-xs text-kui-fg-muted">
          Level
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={level}
            onChange={(e) => setLevel(Number(e.target.value))}
            className="flex-1 accent-[var(--kui-accent)]"
          />
          <span className="w-8 text-right font-mono tabular-nums">{level.toFixed(2)}</span>
        </label>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <p className="text-xs text-kui-fg-subtle">Bottom-aligned · success tone</p>
          <Waveform level={0.8} mirror={false} bars={32} height={40} tone="success" />
        </div>
        <div className="space-y-2">
          <p className="text-xs text-kui-fg-subtle">Inactive (muted)</p>
          <Waveform active={false} bars={32} height={40} />
        </div>
      </div>
    </div>
  );
}
