import { useEffect, useState } from "react";
import { AgentHub, type AgentNodeState } from "kestro-ui";

const agents = [
  { id: "inbox", name: "Inbox", activity: "Triaging 48 emails" },
  { id: "calendar", name: "Calendar", activity: "Finding a slot" },
  { id: "docs", name: "Docs", activity: "Summarizing Q3 notes" },
  { id: "crm", name: "CRM", activity: "Updating 12 contacts" },
  { id: "billing", name: "Billing", activity: "Matching invoices" },
  { id: "travel", name: "Travel", activity: "Rebooking a flight" },
];

const cycle: AgentNodeState[] = ["queued", "working", "working", "done"];

export default function Example() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1600);
    return () => clearInterval(id);
  }, []);

  return (
    <AgentHub
      size={520}
      hub={{ id: "chief", name: "Chief of staff", state: "working", activity: "Coordinating 6 agents" }}
      agents={agents.map((a, i) => ({ ...a, state: cycle[(tick + i) % cycle.length] }))}
    />
  );
}
