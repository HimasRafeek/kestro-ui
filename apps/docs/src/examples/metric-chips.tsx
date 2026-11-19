import {
  AgentChip,
  CapabilityTags,
  ContextPill,
  CostTag,
  DurationTag,
  LatencyTag,
  MessageMeta,
  MiniBar,
  ModelBadge,
  RequestCount,
  TimeAgo,
  TokenCounter,
  TokensPerSecond,
  TrendTag,
} from "kestro-ui";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-kui-border py-3 last:border-0">
      <span className="w-24 shrink-0 text-xs text-kui-fg-subtle">{label}</span>
      {children}
    </div>
  );
}

export default function Example() {
  return (
    <div className="w-full max-w-2xl rounded-kui border border-kui-border bg-kui-surface px-4">
      <Row label="Tokens & cost">
        <TokenCounter tokens={1_217} cost={0.0042} />
        <CostTag value={0.042} />
        <RequestCount value={1_204} />
      </Row>
      <Row label="Time">
        <LatencyTag ms={420} />
        <LatencyTag ms={1_900} label="TTFT" />
        <LatencyTag ms={4_800} />
        <DurationTag seconds={38} />
        <TokensPerSecond value={62} />
        <span className="text-xs text-kui-fg-muted">
          Updated <TimeAgo date={Date.now() - 3 * 60_000} />
        </span>
      </Row>
      <Row label="Trends">
        <TrendTag value={12.5} />
        <TrendTag value={-3.2} />
        <TrendTag value={18} invert />
        <TrendTag value={-22} invert />
      </Row>
      <Row label="Meters">
        <ContextPill used={62_000} limit={200_000} />
        <ContextPill used={182_000} limit={200_000} />
        <MiniBar value={64} />
        <MiniBar value={91} tone="danger" width={48} />
      </Row>
      <Row label="Models">
        <ModelBadge name="Sonata Large" provider="Sonata" context={200_000} />
        <ModelBadge name="Lumen Vision" provider="Lumen" />
        <CapabilityTags capabilities={["tools", "vision", "reasoning", "json"]} />
      </Row>
      <Row label="Agents">
        <AgentChip name="Atlas" state="working" />
        <AgentChip name="Ledger" state="waiting" />
        <AgentChip name="Scout" state="online" />
      </Row>
      <Row label="Message footer">
        <MessageMeta model="Sonata Large" provider="Sonata" tokens={1_217} cost={0.0042} duration={3.4} speed={58} />
      </Row>
    </div>
  );
}
