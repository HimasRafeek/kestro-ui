# Switch

> Category: Primitives · Package: `kestro-ui`

Switch and SegmentedControl — the toggles used by settings, permissions and task forms.

## Import

```tsx
import { Switch, SegmentedControl } from "kestro-ui";
```

## Example: controls

```tsx
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
```

## API

### <Switch />

| Prop | Type | Default | Description |
|---|---|---|---|
| `checked` | `false \| true` | — |  |
| `defaultChecked` | `false \| true` | `false` |  |
| `onCheckedChange` | `((checked: boolean) => void)` | — |  |
| `size` | `"sm" \| "md"` | `"md"` |  |

Also accepts the native HTML attributes of its root element.

### <SegmentedControl />

A compact single-choice toggle group with a sliding indicator.

| Prop | Type | Default | Description |
|---|---|---|---|
| `options` **(required)** | `SegmentOption<T>[]` | — |  |
| `value` | `T` | — |  |
| `defaultValue` | `T` | — |  |
| `onValueChange` | `((value: T) => void)` | — |  |
| `size` | `"sm" \| "md"` | `"md"` |  |
| `block` | `false \| true` | — | Stretch to the container width. |
| `aria-label` | `string` | — |  |
| `className` | `string` | — |  |
