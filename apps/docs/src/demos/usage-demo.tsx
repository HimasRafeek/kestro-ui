import * as React from "react";
import {
  AgentCard,
  ContextWindow,
  LatencyBreakdown,
  MessageMeta,
  ModelCompare,
  ModelUsageTable,
  RunTimer,
  SegmentedControl,
  StatTile,
  UsageChart,
  type AgentProfile,
} from "kestro-ui";
import { CircleCheck, Clock, Coins, MessagesSquare } from "lucide-react";

type Period = "7d" | "30d";

const spend: Record<Period, { label: string; values: Record<string, number> }[]> = {
  "7d": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label, i) => ({
    label,
    values: { large: [4.1, 5.3, 4.8, 6.2, 7.4, 2.1, 1.8][i], fast: [1.2, 1.6, 1.4, 1.9, 2.3, 0.8, 0.6][i], vision: [0.4, 0.9, 0.5, 1.1, 0.7, 0.2, 0.1][i] },
  })),
  "30d": Array.from({ length: 30 }, (_, i) => ({
    label: String(i + 1),
    values: { large: 3 + Math.sin(i / 3) * 1.6 + (i % 7 > 4 ? -1.8 : 0.8), fast: 1.1 + Math.cos(i / 4) * 0.5, vision: 0.4 + (i % 5 === 0 ? 0.8 : 0.2) },
  })),
};

const agents: AgentProfile[] = [
  { id: "support", name: "Support", role: "Customer care", state: "working", model: "Sonata Fast", tools: ["orders", "refunds", "email"], stats: [{ label: "Tokens", value: "48.2M" }, { label: "Cost", value: "$61" }, { label: "Resolved", value: "71%" }] },
  { id: "atlas", name: "Atlas", role: "Travel", state: "online", model: "Sonata Large", tools: ["flights", "hotels", "calendar"], stats: [{ label: "Tokens", value: "21.6M" }, { label: "Cost", value: "$142" }, { label: "Booked", value: "318" }] },
  { id: "scout", name: "Scout", role: "Research", state: "waiting", model: "Sonata Large", tools: ["web_search", "read_page"], stats: [{ label: "Tokens", value: "14.9M" }, { label: "Cost", value: "$76" }, { label: "Reports", value: "52" }] },
];

export function UsageDemo() {
  const [period, setPeriod] = React.useState<Period>("7d");
  const [startedAt] = React.useState(() => Date.now() - 96_000);
  const scale = period === "7d" ? 1 : 4.3;

  return (
    <div className="kui-scrollbar h-full overflow-y-auto">
      <div className="mx-auto max-w-7xl space-y-5 p-4 sm:p-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] tracking-wider text-kui-fg-subtle uppercase">Workspace · Northwind</p>
            <h1 className="text-2xl font-semibold tracking-tight">Usage</h1>
          </div>
          <SegmentedControl
            aria-label="Period"
            value={period}
            onValueChange={setPeriod}
            options={[
              { value: "7d", label: "Last 7 days" },
              { value: "30d", label: "Last 30 days" },
            ]}
          />
        </header>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile label="Conversations" icon={<MessagesSquare />} value={Math.round(12_480 * scale).toLocaleString()} delta={8.2} trend={[30, 34, 31, 38, 42, 40, 47]} />
          <StatTile label="Resolved by agents" icon={<CircleCheck />} value="71%" delta={3.1} trend={[61, 63, 64, 66, 68, 70, 71]} />
          <StatTile label="Median response" icon={<Clock />} value="1.8s" delta={-12} invertDelta trend={[2.4, 2.2, 2.3, 2.0, 1.9, 1.9, 1.8]} />
          <StatTile label="Spend" icon={<Coins />} value={`$${Math.round(48.3 * scale)}`} delta={14} invertDelta trend={[38, 41, 44, 40, 48, 52, 60]} />
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          <UsageChart
            key={period}
            title="Spend by model"
            data={spend[period]}
            format={(v) => `$${v.toFixed(2)}`}
            series={[
              { id: "large", label: "Sonata Large" },
              { id: "fast", label: "Sonata Fast" },
              { id: "vision", label: "Lumen Vision" },
            ]}
          />
          <ContextWindow
            title="Longest open conversation"
            limit={200_000}
            variant="grid"
            segments={[
              { id: "system", label: "System prompt", tokens: 3_200 },
              { id: "tools", label: "Tool definitions", tokens: 11_400 },
              { id: "files", label: "Files", tokens: 28_600 },
              { id: "history", label: "Conversation", tokens: 121_000 },
            ]}
          />
        </div>

        <ModelUsageTable
          period={period === "7d" ? "Last 7 days" : "Last 30 days"}
          rows={[
            { id: "large", name: "Sonata Large", provider: "Sonata", requests: Math.round(1_960 * scale), inputTokens: 9_600_000 * scale, outputTokens: 1_470_000 * scale, cost: 31.7 * scale, latency: 1840, delta: 12 },
            { id: "fast", name: "Sonata Fast", provider: "Sonata", requests: Math.round(7_420 * scale), inputTokens: 12_300_000 * scale, outputTokens: 2_100_000 * scale, cost: 9.8 * scale, latency: 620, delta: -4 },
            { id: "vision", name: "Lumen Vision", provider: "Lumen", requests: Math.round(520 * scale), inputTokens: 2_250_000 * scale, outputTokens: 280_000 * scale, cost: 3.9 * scale, latency: 2310, delta: 31 },
            { id: "embed", name: "Orbit Embed", provider: "Orbit", requests: Math.round(28_100 * scale), inputTokens: 20_500_000 * scale, outputTokens: 0, cost: 2.9 * scale, latency: 90 },
          ]}
        />

        <div className="grid gap-5 lg:grid-cols-[1fr_1fr_320px]">
          <LatencyBreakdown
            title="Typical answer with tools"
            outputTokens={980}
            segments={[
              { id: "queue", label: "Queue", ms: 60 },
              { id: "ttft", label: "First token", ms: 540 },
              { id: "tools", label: "Tools", ms: 4_200, tone: "warning" },
              { id: "generation", label: "Generation", ms: 6_100 },
            ]}
          />
          <div className="space-y-4 rounded-kui border border-kui-border bg-kui-surface p-4">
            <h3 className="text-[13px] font-medium text-kui-fg-muted">Active run</h3>
            <RunTimer startedAt={startedAt} progress={58} label="Scout · competitor report" />
            <MessageMeta model="Sonata Large" provider="Sonata" tokens={18_240} cost={0.094} speed={58} />
          </div>
          <div className="rounded-kui border border-kui-border bg-kui-surface p-4">
            <h3 className="mb-3 text-[13px] font-medium text-kui-fg-muted">Long-running limit</h3>
            <RunTimer startedAt={startedAt} timeout={180_000} label="Ledger · reconciliation" />
          </div>
        </div>

        <section className="space-y-3">
          <h2 className="text-[15px] font-semibold">Agents</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {agents.map((a) => (
              <AgentCard key={a.id} agent={a} />
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-[15px] font-semibold">Models</h2>
          <ModelCompare
            selectedId="large"
            models={[
              { id: "large", name: "Sonata Large", provider: "Sonata", context: 200_000, pricing: { input: 3, output: 15 }, speed: 62, quality: 5, capabilities: ["tools", "vision", "reasoning"], badge: "Default" },
              { id: "fast", name: "Sonata Fast", provider: "Sonata", context: 128_000, pricing: { input: 0.25, output: 1.25 }, speed: 180, quality: 3, capabilities: ["tools"] },
              { id: "vision", name: "Lumen Vision", provider: "Lumen", context: 64_000, pricing: { input: 1.5, output: 6 }, speed: 95, quality: 4, capabilities: ["tools", "vision"] },
            ]}
          />
        </section>
      </div>
    </div>
  );
}
