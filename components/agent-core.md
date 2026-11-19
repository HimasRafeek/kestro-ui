# AgentCore

> Category: HUD · Package: `kestro-ui`

Arc-reactor style presence for an AI agent. Reacts to state, live loudness and a real audio spectrum from the microphone or TTS output.

## Import

```tsx
import { AgentCore } from "kestro-ui";
```

## Example: agent-core

```tsx
import { useEffect, useState } from "react";
import { AgentCore, Button, HudBackground, useAudioAnalyser, useMicrophone, type CoreState } from "kestro-ui";
import { Mic, MicOff } from "lucide-react";

const states: CoreState[] = ["idle", "listening", "thinking", "speaking", "working", "error", "offline"];

export default function Example() {
  const [state, setState] = useState<CoreState>("speaking");
  const [simLevel, setSimLevel] = useState(0);
  const mic = useMicrophone();
  const { level: micLevel, spectrum } = useAudioAnalyser(mic.stream);

  useEffect(() => {
    if (mic.active || (state !== "speaking" && state !== "listening")) return;
    let raf = 0;
    const loop = (now: number) => {
      const t = now / 1000;
      setSimLevel(0.35 + Math.abs(Math.sin(t * 4.3)) * 0.4 + Math.sin(t * 1.3) * 0.15);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [state, mic.active]);

  const current = mic.active ? "listening" : state;

  return (
    <div
      data-kui-theme="dark"
      className="relative flex w-full max-w-2xl flex-col items-center gap-6 overflow-hidden rounded-kui border border-kui-border bg-kui-bg px-6 py-10 text-kui-fg"
    >
      <HudBackground />
      <AgentCore
        state={current}
        level={mic.active ? micLevel : simLevel}
        spectrum={mic.active ? spectrum : undefined}
        size={280}
        label="Nova"
        sublabel={mic.active ? "Mic live" : current}
      />
      <div className="relative flex flex-wrap justify-center gap-1.5">
        {states.map((s) => (
          <Button
            key={s}
            size="xs"
            variant={current === s ? "accent" : "outline"}
            disabled={mic.active}
            onClick={() => setState(s)}
            className="capitalize"
          >
            {s}
          </Button>
        ))}
      </div>
      <div className="relative flex flex-col items-center gap-2">
        <Button variant={mic.active ? "danger" : "secondary"} onClick={mic.active ? mic.stop : mic.start}>
          {mic.active ? <MicOff /> : <Mic />}
          {mic.active ? "Stop microphone" : "Use microphone"}
        </Button>
        {mic.error ? <p className="text-xs text-kui-danger">{mic.error}</p> : null}
      </div>
    </div>
  );
}
```

## API

### <AgentCore />

Arc-reactor style "presence" for an AI agent — reacts to state and audio.

| Prop | Type | Default | Description |
|---|---|---|---|
| `state` | `"idle" \| "thinking" \| "working" \| "error" \| "offline" \| "listening" \| "speaking"` | `"idle"` |  |
| `level` | `number` | `0` | Live loudness 0–1. |
| `spectrum` | `number[]` | — | Optional frequency bins 0–1 (from useAudioAnalyser). Synthesized from `level` when omitted. |
| `size` | `number` | `300` | Diameter in px. Default 300. |
| `label` | `ReactNode` | — | Center content (e.g. agent name). |
| `sublabel` | `ReactNode` | — |  |
| `className` | `string` | — |  |
