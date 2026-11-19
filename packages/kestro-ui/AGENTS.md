# Kestro UI: guide for AI coding assistants

You are using **Kestro UI** (`kestro-ui`), a React + Tailwind CSS v4 component library for AI agent interfaces (chat, reasoning, tool calls, approvals, plans, voice, HUDs). Full docs with every prop: `node_modules/kestro-ui/llms-full.txt` or https://himasrafeek.github.io/kestro-ui/llms-full.txt

## Setup (do this once)

```css
/* main stylesheet */
@import "tailwindcss";
@import "kestro-ui/theme.css";
```

No Tailwind? `import "kestro-ui/styles.css"` instead. Dark mode = `dark` class on `<html>`.

## Rules

1. **Import everything from `"kestro-ui"`** as named exports. There are no deep imports.
2. **For a chat UI, use `<AgentChat />`.** Don't hand-roll message lists. It must live in a container with a height (`h-dvh`, `h-[600px]`, `flex-1 min-h-0`…) because it fills its parent.
3. **Messages** are `ChatMessage` objects: `{ id, role: "user" | "assistant" | "system", content?: string, parts?: ChatMessagePart[] }`. Parts follow the Vercel AI SDK UIMessage format:
   - `{ type: "text", text, state?: "streaming" | "done" }`
   - `{ type: "reasoning", text, state? }`
   - `{ type: "tool-<toolName>", toolCallId, state: "input-streaming" | "input-available" | "approval-requested" | "output-available" | "output-error" | "output-denied", input, output, errorText, approval?: { id } }`
   - `{ type: "source-url", url, title }` (resolves `[1]` citations in text)
   - `{ type: "file", url, filename, mediaType }`
   - `{ type: "data-<name>", data }` → render with `renderData`
4. **Status** is `"ready" | "submitted" | "streaming" | "error"`; pass `onStop` to enable the stop button.
5. **Custom tool UI (generative UI):** use `renderTool={(part, { name, status }) => ReactNode | undefined}`. Return `undefined` for the default card.
6. **Approvals:** handle `onToolApproval={({ id, approved, part }) => …}`, or use `<ToolApproval title details onApprove onDeny status />` directly for any action (payments, emails, bookings, deletes, commands).
7. **Styling:** use the kit's tokens in your own markup: `bg-kui-bg`, `bg-kui-surface`, `bg-kui-surface-2`, `border-kui-border`, `text-kui-fg`, `text-kui-fg-muted`, `text-kui-fg-subtle`, `text-kui-accent`, `rounded-kui`, `shadow-kui`. Re-theme with CSS variables such as `--kui-accent`.
8. Every component accepts `className` (merged with tailwind-merge). Controlled/uncontrolled props follow the `value`/`defaultValue`/`onValueChange` or `open`/`defaultOpen`/`onOpenChange` pattern.

## Minimal example

```tsx
import { useState } from "react";
import { AgentChat, type ChatMessage, type ChatStatus } from "kestro-ui";

export function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>("ready");

  async function send(text: string) {
    setMessages((m) => [...m, { id: crypto.randomUUID(), role: "user", content: text }]);
    setStatus("submitted");
    const reply = await callYourAgent(text); // your backend
    setMessages((m) => [...m, { id: crypto.randomUUID(), role: "assistant", content: reply }]);
    setStatus("ready");
  }

  return (
    <div className="h-dvh">
      <AgentChat
        messages={messages}
        status={status}
        onSend={send}
        agent={{ name: "Atlas", description: "Travel concierge" }}
        suggestions={["Plan a weekend in Lisbon", "Find a quiet hotel"]}
      />
    </div>
  );
}
```

## Component map

- **Chat:** AgentChat, Thread, Message, MessageActions, MessageParts, Markdown, StreamingMarkdown, CodeBlock, TypingIndicator
- **Input:** PromptInput, ModelSelector, Suggestions, EmptyState, Attachment, AttachmentList
- **Transparency:** Reasoning, ToolCall, ToolCallGroup, Sources, SourceCard, SourceChip, InlineCitation
- **Human in the loop:** ToolApproval, AgentQuestion, HandoffBanner
- **Workflows:** TaskPlan, AgentHeader, UsageMeter, ActivityFeed, Artifact, ConversationList
- **Multi-agent:** AgentAvatar, AgentRoster, AgentHandoff
- **Voice:** VoicePanel, VoiceOrb, VoiceWave + hooks useMicrophone, useAudioAnalyser
- **HUD:** AgentCore, HudPanel, HudBackground, RadialGauge, HudStat, Sparkline, Waveform, CommandConsole, BootSequence, DataTicker
- **Tasks:** TaskCreator, TaskBoard, TaskCard, TaskList, TaskStatusBadge
- **Usage & cost:** TokenUsage, ContextWindow, ModelUsageTable, UsageChart, StatTile, TokenCounter
- **Time:** RunTimer, LatencyBreakdown, TimeAgo
- **Agents & models:** AgentCard, AgentPicker, ModelCard, ModelCompare, ModelBadge, AgentDetails (also opens from AgentGraph/AgentHub nodes; pass `model`, `usage`, `steps` on nodes)
- **Tiny chips:** CostTag, LatencyTag, DurationTag, TokensPerSecond, RequestCount, TrendTag, ContextPill, MiniBar, AgentChip, CapabilityTags, MessageMeta
- **Images:** ImageGallery, ImagePreview, Lightbox
- **Multi-agent views:** AgentGraph, AgentHub, TraceTree
- **Instruments:** AttitudeIndicator, RunCard, TelemetryChart, ToolCallRow, SegmentedMeter, EventLog, VoiceDial
- **Embed:** ChatWidget
- **Primitives:** Button, IconButton, Badge, StatusDot, Spinner, Tooltip, Kbd, Card, ShimmerText, Collapse, Switch, SegmentedControl
- **Hooks:** useSmoothText, useStickToBottom, useCopyToClipboard, useControllableState, useAutoResizeTextarea, useElapsed, useAnimationClock
