import { TokenCounter, TokenUsage } from "kestro-ui";

export default function Example() {
  return (
    <div className="w-full max-w-md space-y-4">
      <TokenUsage
        title="This conversation"
        caption="Sonata Large · 14 turns"
        input={48_200}
        cached={31_000}
        reasoning={6_400}
        output={9_850}
        pricing={{ input: 3, output: 15, cached: 0.3 }}
      />
      <p className="flex flex-wrap items-center gap-2 text-sm text-kui-fg-muted">
        Inline, under a message: <TokenCounter tokens={1_217} cost={0.0042} detail="812 in · 405 out" />
      </p>
    </div>
  );
}
