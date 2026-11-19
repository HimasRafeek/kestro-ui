# Connect your agent

Kestro UI only cares about two things: a list of **messages** and a **status**. Any backend that can produce those works.

## The message format

```ts
type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content?: string;          // shortcut for one text part
  parts?: ChatMessagePart[]; // rich content, rendered in order
  name?: string;             // agent name (multi-agent)
};
```

Supported parts (compatible with the Vercel AI SDK `UIMessage`):

| Part | Renders as |
|---|---|
| `{ type: "text", text, state? }` | Streaming Markdown with citations |
| `{ type: "reasoning", text, state? }` | `Reasoning` (collapsible thinking) |
| `{ type: "tool-<name>", state, input, output, errorText }` | `ToolCall` |
| `{ type: "tool-<name>", state: "approval-requested", approval: { id } }` | `ToolApproval` |
| `{ type: "source-url", url, title }` | `Sources` + inline `[1]` citations |
| `{ type: "file", url, filename, mediaType }` | `Attachment` |
| `{ type: "data-<name>", data }` | Your own UI via `renderData` |

Tool states map to statuses: `input-streaming` → pending, `input-available` → running, `output-available` → success, `output-error` → error, `output-denied` → denied.

**Status** is one of `"ready" | "submitted" | "streaming" | "error"`.

## Vercel AI SDK

```tsx
import { useChat } from "@ai-sdk/react";
import { AgentChat } from "kestro-ui";

export function Chat() {
  const { messages, status, sendMessage, stop } = useChat();
  return (
    <AgentChat
      messages={messages}
      status={status}
      onSend={(text) => sendMessage({ text })}
      onStop={stop}
    />
  );
}
```

## Any other backend (SSE, WebSocket, LangGraph…)

Keep messages in state and update the last assistant message as chunks arrive:

```tsx
const [messages, setMessages] = useState<ChatMessage[]>([]);
const [status, setStatus] = useState<ChatStatus>("ready");

async function send(text: string) {
  const id = crypto.randomUUID();
  let reply = "";
  setMessages((m) => [
    ...m,
    { id: `${id}-user`, role: "user", content: text },
    { id, role: "assistant", parts: [{ type: "text", text: "" }] },
  ]);
  setStatus("streaming");
  for await (const chunk of streamFromYourAgent(text)) {
    reply += chunk;
    const snapshot = reply;
    setMessages((m) => m.map((msg) => (msg.id === id ? { ...msg, parts: [{ type: "text", text: snapshot }] } : msg)));
  }
  setStatus("ready");
}
```

`StreamingMarkdown` (used inside `AgentChat`) smooths bursty chunks automatically, so the text flows even if your server sends large, irregular pieces.

## Generative UI

Render your own components for specific tools or data parts:

```tsx
<AgentChat
  messages={messages}
  renderTool={(part, { name }) =>
    name === "get_weather" && part.state === "output-available"
      ? <WeatherCard data={part.output} />
      : undefined
  }
  renderData={(part) => (part.type === "data-flights" ? <FlightList flights={part.data} /> : null)}
/>
```

Return `undefined` from `renderTool` to fall back to the default `ToolCall` card.

## Approvals

When a tool part arrives with `state: "approval-requested"`, `AgentChat` shows a `ToolApproval` card and calls `onToolApproval({ id, approved, part })` with the user's decision. Send that decision back to your agent runtime to continue or cancel.
