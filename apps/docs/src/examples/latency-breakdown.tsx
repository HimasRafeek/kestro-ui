import { LatencyBreakdown } from "kestro-ui";

export default function Example() {
  return (
    <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
      <LatencyBreakdown
        title="Fast answer"
        outputTokens={420}
        segments={[
          { id: "queue", label: "Queue", ms: 40 },
          { id: "ttft", label: "First token", ms: 310 },
          { id: "generation", label: "Generation", ms: 3_900 },
        ]}
      />
      <LatencyBreakdown
        title="Answer with tools"
        outputTokens={980}
        segments={[
          { id: "queue", label: "Queue", ms: 60 },
          { id: "ttft", label: "First token", ms: 540 },
          { id: "tools", label: "Tools (3)", ms: 4_200, tone: "warning" },
          { id: "generation", label: "Generation", ms: 6_100 },
        ]}
      />
    </div>
  );
}
