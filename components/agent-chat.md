# AgentChat

> Category: Chat · Package: `kestro-ui`

A complete, batteries-included agent chat: thread, messages, reasoning, tools, approvals, sources, empty state, follow-ups and the prompt input. One component, works with any backend.

## Import

```tsx
import { AgentChat } from "kestro-ui";
```

## Example: agent-chat

```tsx
import { useRef, useState } from "react";
import { AgentChat, type ChatMessage, type ChatStatus } from "kestro-ui";
import { Hotel, Plane, Utensils } from "lucide-react";

const REPLY =
  "Here's a relaxed **3-day Lisbon** plan:\n\n" +
  "1. **Day 1:** Alfama walk, Castelo de São Jorge, sunset at Miradouro da Graça\n" +
  "2. **Day 2:** Belém Tower, pastéis de nata, MAAT museum\n" +
  "3. **Day 3:** Day trip to Sintra's Pena Palace\n\n" +
  "Want me to look for hotels near Baixa?";

export default function Example() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>("ready");
  const timer = useRef<number | undefined>(undefined);

  const stop = () => {
    window.clearTimeout(timer.current);
    window.clearInterval(timer.current);
    setStatus("ready");
  };

  const send = (text: string) => {
    const id = String(Date.now());
    setMessages((m) => [...m, { id: `${id}-u`, role: "user", content: text }]);
    setStatus("submitted");

    timer.current = window.setTimeout(() => {
      setStatus("streaming");
      setMessages((m) => [...m, { id, role: "assistant", parts: [{ type: "text", text: "", state: "streaming" }] }]);
      let i = 0;
      timer.current = window.setInterval(() => {
        i += 6;
        const done = i >= REPLY.length;
        setMessages((m) =>
          m.map((msg) =>
            msg.id === id
              ? { ...msg, parts: [{ type: "text", text: REPLY.slice(0, i), state: done ? "done" : "streaming" }] }
              : msg,
          ),
        );
        if (done) stop();
      }, 30);
    }, 700);
  };

  return (
    <div className="h-[520px] w-full max-w-2xl overflow-hidden rounded-kui border border-kui-border">
      <AgentChat
        messages={messages}
        status={status}
        onSend={send}
        onStop={stop}
        agent={{ name: "Atlas", description: "Your travel concierge for flights, stays and itineraries." }}
        suggestions={[
          { label: "Plan a weekend in Lisbon", icon: <Plane /> },
          { label: "Find a hotel near the beach", icon: <Hotel /> },
          { label: "Best tapas in Barcelona", icon: <Utensils /> },
        ]}
        header
        compact
      />
    </div>
  );
}
```

## API

### <AgentChat />

Batteries-included chat surface: thread, messages, reasoning, tools,
approvals, sources, empty state, follow-ups and the prompt input.

| Prop | Type | Default | Description |
|---|---|---|---|
| `messages` **(required)** | `ChatMessage[]` | — |  |
| `status` | `"error" \| "streaming" \| "ready" \| "submitted"` | `"ready"` |  |
| `onSend` | `((text: string, submission: PromptSubmission) => void)` | — |  |
| `onStop` | `(() => void)` | — |  |
| `onRegenerate` | `((messageId: string) => void)` | — |  |
| `onFeedback` | `((messageId: string, value: Feedback) => void)` | — |  |
| `agent` | `AgentInfo` | — |  |
| `header` | `ReactNode` | — | `true` renders a default header from `agent`; or pass your own node. |
| `welcome` | `{ title?: ReactNode; description?: ReactNode; icon?: ReactNode; }` | — | Empty-state title/description. |
| `suggestions` | `Suggestion[]` | — | Starter prompts shown in the empty state. |
| `followUps` | `Suggestion[]` | — | Follow-up chips shown above the input after the last answer. |
| `models` | `ModelOption[]` | — |  |
| `model` | `string` | — |  |
| `onModelChange` | `((id: string) => void)` | — |  |
| `placeholder` | `string` | — |  |
| `allowAttachments` | `false \| true` | `true` |  |
| `onVoice` | `(() => void)` | — |  |
| `toolbar` | `ReactNode` | — | Extra controls in the prompt toolbar. |
| `error` | `ReactNode` | — | Error message shown at the end of the thread. |
| `onRetry` | `(() => void)` | — |  |
| `compact` | `false \| true` | `false` | Tighter spacing for widgets & side panels. |
| `autoFocus` | `false \| true` | — | Focus the input on mount. Defaults to `true` unless `compact`. |
| `variant` | `"bubble" \| "flat"` | `"bubble"` | Message layout. |
| `className` | `string` | — |  |
| `renderCode` | `((code: string, language: string, streaming: boolean) => ReactNode)` | — |  |
| `renderTool` | `((part: ToolPart, ctx: { name: string; status: ToolStatus; }) => ReactNode)` | — | Return a node to custom-render a tool (generative UI); return undefined for the default card. |
| `renderData` | `((part: DataPart) => ReactNode)` | — | Render custom `data-*` parts. |
| `onToolApproval` | `((decision: { id: string; approved: boolean; part: ToolPart; }) => void)` | — |  |
| `toolTitles` | `Record<string, string>` | — | Friendly titles per tool name, e.g. { web_search: "Searching the web" } |
