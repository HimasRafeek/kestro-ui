import { SegmentedMeter } from "kestro-ui";

export default function Example() {
  return (
    <div className="w-full max-w-md space-y-6 rounded-kui border border-kui-border bg-kui-surface p-5">
      <SegmentedMeter label="Context window" value={12480} max={32000} detail="12,480 / 32,000 tokens" />
      <SegmentedMeter label="Monthly budget" value={41} max={50} caption="$41 of $50" tone="accent" />
      <SegmentedMeter label="Voice minutes" value={590} max={600} segments={30} caption="10 min left" />
    </div>
  );
}
