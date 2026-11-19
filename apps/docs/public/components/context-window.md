# ContextWindow

> Category: Usage & cost · Package: `kestro-ui`

What's filling the model's context — system prompt, tools, files, conversation — as a bar or a 100-cell grid, with a warning before it runs out.

## Import

```tsx
import { ContextWindow } from "kestro-ui";
```

## Example: context-window

```tsx
import { useEffect, useState } from "react";
import { ContextWindow } from "kestro-ui";

export default function Example() {
  const [history, setHistory] = useState(62_000);

  // The conversation grows until it nears the limit, then resets
  useEffect(() => {
    const id = setInterval(() => setHistory((h) => (h > 150_000 ? 62_000 : h + 9_000)), 1200);
    return () => clearInterval(id);
  }, []);

  const segments = [
    { id: "system", label: "System prompt", tokens: 3_200 },
    { id: "tools", label: "Tool definitions", tokens: 11_400 },
    { id: "files", label: "Attached files", tokens: 18_600 },
    { id: "history", label: "Conversation", tokens: history },
  ];

  return (
    <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
      <ContextWindow segments={segments} limit={200_000} />
      <ContextWindow segments={segments} limit={200_000} variant="grid" title="Same, as a grid" />
    </div>
  );
}
```

## API

### <ContextWindow />

What's filling the model's context window — system prompt, history, tools, files — and how much is left.

| Prop | Type | Default | Description |
|---|---|---|---|
| `segments` **(required)** | `ContextSegment[]` | — |  |
| `limit` **(required)** | `number` | — | Model context size in tokens. |
| `title` | `ReactNode` | `"Context window"` |  |
| `variant` | `"bar" \| "grid"` | `"bar"` | "bar" (default) or "grid" (100 cells, one per 1%). |
| `warnAt` | `number` | `0.8` | Usage ratio (0–1) from which to warn. Default 0.8. |
| `warning` | `((free: number) => ReactNode)` | `(free) => `Only ${formatNumber(free)} tokens left — older messages will be summarized soon.`` | Warning text; receives the free token count. |
| `className` | `string` | — |  |
