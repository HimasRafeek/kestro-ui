# Introduction

**Kestro UI** is an open-source React + Tailwind CSS component library for building interfaces for **AI agents**: chat assistants, research agents, customer-support bots, booking and shopping agents, operations workflows, voice assistants, multi-agent systems and Jarvis-style HUDs.

Agents need more than a chat box. They think, call tools, ask for permission, cite sources, run multi-step plans, hand off to humans and talk out loud. Kestro UI gives every one of those moments a polished, accessible component.

## Principles

- **Batteries included, never locked in.** `<AgentChat />` gives you a complete experience in one line. Every piece inside it (`Reasoning`, `ToolCall`, `ToolApproval`, `PromptInput`…) is exported so you can compose your own.
- **Backend-agnostic.** Messages use a simple `parts` format compatible with the Vercel AI SDK `useChat()`, and plain `{ role, content }` objects work too. Bring LangGraph, Mastra, OpenAI Agents, your own SSE, anything.
- **Human in the loop by default.** Approvals for payments, emails, bookings and deletions; structured questions; plans with live progress; hand-off to a person.
- **Zero heavy dependencies.** Streaming Markdown, syntax highlighting and citations are built in. No `dangerouslySetInnerHTML`.
- **Smooth.** Spring and expo motion, smooth token streaming, and full respect for `prefers-reduced-motion`.
- **AI-native docs.** Every page has a *Copy for AI* button, and the site ships `llms.txt` and `llms-full.txt` so coding assistants use the components correctly.

## What's inside

| Area | Components |
|---|---|
| Chat | `AgentChat`, `Thread`, `Message`, `MessageActions`, `Markdown`, `StreamingMarkdown`, `CodeBlock`, `TypingIndicator` |
| Input | `PromptInput`, `ModelSelector`, `Suggestions`, `EmptyState`, `Attachment` |
| Transparency | `Reasoning`, `ToolCall`, `Sources`, `InlineCitation` |
| Human in the loop | `ToolApproval`, `AgentQuestion`, `HandoffBanner` |
| Workflows | `TaskPlan`, `AgentHeader`, `UsageMeter`, `ActivityFeed`, `Artifact`, `ConversationList` |
| Multi-agent | `AgentAvatar`, `AgentRoster`, `AgentHandoff` |
| Voice | `VoicePanel`, `VoiceOrb`, `VoiceWave`, `useMicrophone`, `useAudioAnalyser` |
| HUD | `AgentCore`, `HudPanel`, `RadialGauge`, `HudStat`, `Sparkline`, `Waveform`, `CommandConsole`, `BootSequence`, `DataTicker` |
| Embed | `ChatWidget` |

Continue with **Installation** to add Kestro UI to your app.
