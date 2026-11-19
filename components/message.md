# Message

> Category: Chat · Package: `kestro-ui`

A single chat message for user, assistant or system roles, with avatar, name, timestamp and hover actions (copy, feedback, regenerate).

## Import

```tsx
import { Message, MessageActions } from "kestro-ui";
```

## Example: message

```tsx
import { useState } from "react";
import { Markdown, Message, MessageActions, type Feedback } from "kestro-ui";

const ANSWER =
  "Your order **#48213** shipped this morning via UPS and should arrive **Thursday, Nov 21**. " +
  "I've emailed you the tracking link.";

export default function Example() {
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [regenerations, setRegenerations] = useState(0);

  return (
    <div className="w-full max-w-xl space-y-6">
      <Message from="system">Conversation started · Today 9:41 AM</Message>

      <Message from="user" timestamp="9:41 AM">
        Where is my order? It's been a few days.
      </Message>

      <Message
        from="assistant"
        name="Nova · Support"
        avatar={{ name: "Nova", state: "online" }}
        timestamp="9:41 AM"
        actions={
          <MessageActions
            copyText={ANSWER}
            feedback={feedback}
            onFeedback={setFeedback}
            onRegenerate={() => setRegenerations((n) => n + 1)}
            alwaysVisible
          />
        }
      >
        <Markdown>{ANSWER}</Markdown>
      </Message>

      <p className="text-center text-xs text-kui-fg-subtle">
        Feedback: {feedback ?? "none"} · Regenerated {regenerations}×
      </p>
    </div>
  );
}
```

## API

### <Message />

| Prop | Type | Default | Description |
|---|---|---|---|
| `from` **(required)** | `"user" \| "assistant" \| "system"` | — |  |
| `name` | `ReactNode` | — | Display name (shown above assistant messages). |
| `avatar` | `ReactNode \| AgentAvatarProps` | — | Avatar node, avatar props, or `false` to hide. |
| `timestamp` | `ReactNode` | — |  |
| `actions` | `ReactNode` | — | Rendered under the message (e.g. <MessageActions/>). |
| `variant` | `"bubble" \| "flat"` | `"bubble"` | "bubble": user messages in a bubble on the right (default) "flat":   everything left-aligned with avatars (document style) |

Also accepts the native HTML attributes of its root element.

### <MessageActions />

| Prop | Type | Default | Description |
|---|---|---|---|
| `copyText` | `string` | — | Text copied by the copy button. Omit to hide it. |
| `onRegenerate` | `(() => void)` | — |  |
| `onEdit` | `(() => void)` | — |  |
| `feedback` | `"up" \| "down"` | — |  |
| `onFeedback` | `((value: Feedback) => void)` | — |  |
| `alwaysVisible` | `false \| true` | `false` | Keep visible instead of revealing on hover. |
| `children` | `ReactNode` | — |  |
| `className` | `string` | — |  |
