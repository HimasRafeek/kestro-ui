# VoicePanel

> Category: Voice · Package: `kestro-ui`

A full voice-call surface with animated orb, status, transcript and call controls. Includes VoiceOrb and VoiceWave.

## Import

```tsx
import { VoicePanel, VoiceOrb, VoiceWave } from "kestro-ui";
```

## Example: voice-panel

```tsx
import { useEffect, useState } from "react";
import { Button, VoiceOrb, VoicePanel, VoiceWave, type VoiceState } from "kestro-ui";
import { Phone } from "lucide-react";

const script: { state: VoiceState; ms: number; text?: string }[] = [
  { state: "connecting", ms: 1400 },
  { state: "speaking", ms: 3800, text: "Hi Sam, it's Ava from Northwind Dental — calling to confirm your cleaning tomorrow at 10 AM." },
  { state: "listening", ms: 3000, text: "Could we move it to the afternoon instead?" },
  { state: "thinking", ms: 1400 },
  { state: "speaking", ms: 3800, text: "Of course. I have 2:30 or 4:15 open — which works better for you?" },
];

export default function Example() {
  const [inCall, setInCall] = useState(true);
  const [step, setStep] = useState(0);
  const [muted, setMuted] = useState(false);
  const [level, setLevel] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const { state, ms, text } = script[step];

  useEffect(() => {
    if (!inCall) return;
    const id = setTimeout(() => setStep((s) => (s + 1 < script.length ? s + 1 : 2)), ms);
    return () => clearTimeout(id);
  }, [inCall, step, ms]);

  useEffect(() => {
    if (!inCall) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [inCall]);

  useEffect(() => {
    const audible = state === "speaking" || (state === "listening" && !muted);
    if (!inCall || !audible) {
      setLevel(0);
      return;
    }
    let raf = 0;
    const loop = (now: number) => {
      const t = now / 1000;
      setLevel(0.25 + Math.abs(Math.sin(t * 5.2)) * 0.5 + Math.sin(t * 1.7) * 0.15);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [inCall, state, muted]);

  const start = () => {
    setStep(0);
    setElapsed(0);
    setInCall(true);
  };

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-6">
      <div className="w-full rounded-kui border border-kui-border bg-kui-surface">
        {inCall ? (
          <VoicePanel
            name="Ava · Northwind Dental"
            state={state}
            level={level}
            transcript={text}
            elapsed={state === "connecting" ? undefined : elapsed}
            muted={muted}
            onToggleMute={() => setMuted((m) => !m)}
            onEnd={() => setInCall(false)}
          />
        ) : (
          <div className="flex flex-col items-center gap-4 py-16 text-sm text-kui-fg-muted">
            Call ended · {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}
            <Button variant="accent" onClick={start}>
              <Phone /> Call again
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-5">
        {(["idle", "connecting", "listening", "thinking", "speaking"] as const).map((s) => (
          <VoiceOrb key={s} state={s} level={0.6} size={44} />
        ))}
        <VoiceWave />
        <VoiceWave bars={7} active={false} />
      </div>
    </div>
  );
}
```

## API

### <VoicePanel />

A complete voice-call surface: orb, status, transcript and call controls.

| Prop | Type | Default | Description |
|---|---|---|---|
| `state` **(required)** | `"idle" \| "thinking" \| "connecting" \| "listening" \| "speaking"` | — |  |
| `level` | `number` | — |  |
| `name` | `ReactNode` | — | Agent name shown above the status. |
| `transcript` | `ReactNode` | — | Live transcript line (what the user or agent is saying). |
| `muted` | `false \| true` | — |  |
| `onToggleMute` | `(() => void)` | — |  |
| `onEnd` | `(() => void)` | — |  |
| `elapsed` | `number` | — | Call duration in seconds. |
| `className` | `string` | — |  |

### <VoiceOrb />

Animated orb that visualizes a voice agent's state.

| Prop | Type | Default | Description |
|---|---|---|---|
| `state` | `"idle" \| "thinking" \| "connecting" \| "listening" \| "speaking"` | `"idle"` |  |
| `level` | `number` | `0` | Live audio amplitude 0–1 (mic level while listening, output level while speaking). |
| `size` | `number` | `168` | Diameter in px. |
| `className` | `string` | — |  |

### <VoiceWave />

Small animated equalizer bars — use for "speaking" indicators.

| Prop | Type | Default | Description |
|---|---|---|---|
| `bars` | `number` | `5` |  |
| `active` | `false \| true` | `true` |  |
| `className` | `string` | — |  |
