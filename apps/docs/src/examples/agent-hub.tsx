import { useEffect, useState } from "react";
import { AgentHub, type AgentNodeState } from "kestro-ui";

const agents = [
  { id: "inbox", name: "Inbox", activity: "Triaging 48 emails", model: "Sonata Fast" },
  { id: "calendar", name: "Calendar", activity: "Finding a slot", model: "Sonata Fast" },
  { id: "docs", name: "Docs", activity: "Summarizing Q3 notes", model: "Sonata Large" },
  { id: "crm", name: "CRM", activity: "Updating 12 contacts", model: "Orbit Mini" },
  { id: "billing", name: "Billing", activity: "Matching invoices", model: "Sonata Large" },
  { id: "travel", name: "Travel", activity: "Rebooking a flight", model: "Sonata Large" },
];

const cycle: AgentNodeState[] = ["queued", "working", "working", "done"];

export default function Example() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1600);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="w-full max-w-2xl space-y-2">
      <AgentHub
        size={540}
        hub={{ id: "chief", name: "Chief of staff", state: "working", activity: "Coordinating 6 agents", model: "Sonata Large", usage: { input: 18_400 + tick * 600, output: 4_100 + tick * 150, cost: 0.12 + tick * 0.004 } }}
        agents={agents.map((a, i) => {
          const state = cycle[(tick + i) % cycle.length];
          const work = (tick % 20) + i + 1;
          return {
            ...a,
            state,
            usage: { input: work * 1_200, output: work * 260, cost: work * 0.002 },
            steps: [
              { id: "a", title: a.activity, status: state === "working" ? "running" : state === "done" ? "done" : "pending" },
              { id: "b", title: "Report to Chief of staff", status: state === "done" ? "done" : "pending" },
            ],
          };
        })}
      />
      <p className="text-center text-sm text-kui-fg-muted">Click any agent for its model, tokens and steps.</p>
    </div>
  );
}
