# Changelog

All notable changes to `kestro-ui` are documented here. The project follows [Semantic Versioning](https://semver.org).

## 0.1.0

First public release.

- **Chat:** `AgentChat`, `Thread`, `Message`, `MessageActions`, `MessageParts`, `Markdown`, `StreamingMarkdown`, `CodeBlock`, `TypingIndicator`.
- **Input:** `PromptInput`, `ModelSelector`, `Suggestions`, `EmptyState`, `Attachment`.
- **Transparency:** `Reasoning`, `ToolCall`, `ToolCallRow`, `Sources`, `SourceChip`, `InlineCitation`.
- **Human in the loop:** `ToolApproval`, `AgentQuestion`, `HandoffBanner`.
- **Workflows:** `RunCard`, `TaskPlan`, `AgentHeader`, `UsageMeter`, `SegmentedMeter`, `ActivityFeed`, `Artifact`, `ConversationList`.
- **Multi-agent:** `AgentGraph`, `AgentHub`, `TraceTree`, `AgentAvatar`, `AgentRoster`, `AgentHandoff`.
- **Voice:** `VoicePanel`, `VoiceOrb`, `VoiceDial`, `VoiceWave`, `useMicrophone`, `useAudioAnalyser`.
- **HUD:** `AttitudeIndicator`, `AgentCore`, `HudPanel`, `RadialGauge`, `TelemetryChart`, `HudStat`, `Sparkline`, `Waveform`, `EventLog`, `CommandConsole`, `BootSequence`, `DataTicker`.
- **Embed:** `ChatWidget`.
- **Tasks:** `TaskCreator`, `TaskBoard`, `TaskCard`, `TaskList`.
- **Usage & cost:** `TokenUsage`, `ContextWindow`, `ModelUsageTable`, `UsageChart`, `StatTile`, `TokenCounter`.
- **Time:** `RunTimer`, `LatencyBreakdown`, `TimeAgo`.
- **Agents & models:** `AgentCard`, `AgentPicker`, `ModelCard`, `ModelCompare`, `ModelBadge`, and `AgentDetails` popovers in `AgentGraph` / `AgentHub`.
- **Tiny chips:** `CostTag`, `LatencyTag`, `DurationTag`, `TokensPerSecond`, `RequestCount`, `TrendTag`, `ContextPill`, `MiniBar`, `AgentChip`, `CapabilityTags`, `MessageMeta`.
- **Images:** `ImageGallery`, `ImagePreview`, `Lightbox` (zoom, pan, keyboard), with image references in the composer.
- **Controls:** `Switch`, `SegmentedControl`.
- Optional Kestro palette via `data-kui-palette="kestro"`.
