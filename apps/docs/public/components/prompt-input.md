# PromptInput

> Category: Input · Package: `kestro-ui`

Auto-growing composer with attachments (button, drag & drop, paste), stop button while streaming, voice button and toolbar slots.

## Import

```tsx
import { PromptInput } from "kestro-ui";
```

## Example: prompt-input

```tsx
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
```

## API

### <PromptInput />

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | — |  |
| `defaultValue` | `string` | `""` |  |
| `onValueChange` | `((value: string) => void)` | — |  |
| `onSubmit` | `((message: PromptSubmission) => void)` | — |  |
| `status` | `"error" \| "streaming" \| "ready" \| "submitted"` | `"ready"` | "streaming"/"submitted" turns the send button into a stop button. |
| `onStop` | `(() => void)` | — |  |
| `placeholder` | `string` | `"Ask anything…"` |  |
| `disabled` | `false \| true` | — |  |
| `autoFocus` | `false \| true` | — |  |
| `maxRows` | `number` | `8` |  |
| `allowAttachments` | `false \| true` | `true` | Enable file attachments (button, drag & drop, paste). |
| `accept` | `string` | — |  |
| `attachments` | `AttachmentData[]` | — | Controlled attachments. If omitted, attachments are managed internally. |
| `onAttach` | `((files: File[]) => void)` | — |  |
| `onRemoveAttachment` | `((id: string) => void)` | — |  |
| `references` | `PromptReference[]` | — | Context chips shown above the input (e.g. a referenced image). |
| `onRemoveReference` | `((id: string) => void)` | — |  |
| `onVoice` | `(() => void)` | — | Show a microphone button. |
| `voiceActive` | `false \| true` | — |  |
| `toolbar` | `ReactNode` | — | Extra controls on the left of the toolbar (e.g. <ModelSelector/>). |
| `actions` | `ReactNode` | — | Extra controls on the right of the toolbar, before send. |
| `hint` | `ReactNode` | — | Footer hint. `false` hides it. |
| `className` | `string` | — |  |

Also accepts the native HTML attributes of its root element.
