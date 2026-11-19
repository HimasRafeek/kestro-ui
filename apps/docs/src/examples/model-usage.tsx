import { ModelUsageTable } from "kestro-ui";

export default function Example() {
  return (
    <ModelUsageTable
      className="max-w-3xl"
      period="Last 30 days"
      rows={[
        { id: "large", name: "Sonata Large", provider: "Sonata", requests: 8_412, inputTokens: 41_200_000, outputTokens: 6_300_000, cost: 218.1, latency: 1840, delta: 12 },
        { id: "fast", name: "Sonata Fast", provider: "Sonata", requests: 31_906, inputTokens: 52_800_000, outputTokens: 9_100_000, cost: 61.4, latency: 620, delta: -4 },
        { id: "vision", name: "Lumen Vision", provider: "Lumen", requests: 2_244, inputTokens: 9_700_000, outputTokens: 1_200_000, cost: 34.9, latency: 2310, delta: 31 },
        { id: "embed", name: "Orbit Embed", provider: "Orbit", requests: 120_480, inputTokens: 88_000_000, outputTokens: 0, cost: 8.8, latency: 90 },
      ]}
    />
  );
}
