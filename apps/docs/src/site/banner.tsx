import { Plane } from "lucide-react";
import { RunCard, ToolApproval, ToolCall } from "kestro-ui";

/** 1280×640 social / README banner — captured by scripts/screenshots.mjs (route #/banner). */
export function Banner() {
  return (
    <div className="relative flex h-[640px] w-[1280px] items-center gap-14 overflow-hidden bg-kui-bg px-16">
      <div className="w-[540px] shrink-0 space-y-6">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-md bg-kui-accent font-display text-xl text-kui-accent-fg">K</span>
          <span className="font-display text-2xl tracking-tight">Kestro UI</span>
        </div>
        <p className="font-mono text-xs tracking-[0.2em] text-kui-fg-muted uppercase">Open source / React + Tailwind</p>
        <h1 className="font-display text-[62px] leading-[0.98]">Interface components for AI agents.</h1>
        <p className="text-xl leading-relaxed text-kui-fg-muted">Chat, tool calls, approvals, multi-agent views, voice and instrument HUDs.</p>
      </div>
      <div className="w-[600px] shrink-0">
        <RunCard
          title="Flight to Lisbon"
          runId="Run 0241"
          status="waiting"
          className="shadow-kui-lg"
          steps={[
            { id: "1", title: "Thinking", description: "Compared direct flights from London to Lisbon.", status: "complete", duration: 4 },
            {
              id: "2",
              title: "Search flights",
              status: "complete",
              content: <ToolCall name="search_flights" status="success" durationMs={842} input={{ origin: "LHR", destination: "LIS", date: "2026-12-04" }} />,
            },
            {
              id: "3",
              title: "Your approval",
              status: "waiting",
              content: <ToolApproval title="Book TP 1351 for £142?" description="LHR → LIS · 04 Dec · Economy" icon={<Plane />} rememberLabel={false} />,
            },
          ]}
        />
      </div>
    </div>
  );
}
