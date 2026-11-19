import { useState } from "react";
import { AgentRoster, type RosterAgent } from "kestro-ui";
import { CalendarCheck, Compass, CreditCard, Hotel, Plane } from "lucide-react";

const agents: RosterAgent[] = [
  { id: "planner", name: "Planner", role: "Orchestrator", state: "online", activity: "Coordinating 4 agents", avatar: { icon: <Compass /> } },
  { id: "flights", name: "Flights", role: "Search", state: "working", activity: "Comparing 38 fares to Lisbon…", avatar: { icon: <Plane /> } },
  { id: "hotels", name: "Hotels", role: "Search", state: "thinking", activity: "Ranking hotels near Alfama…", avatar: { icon: <Hotel /> } },
  { id: "booker", name: "Booker", role: "Payments", state: "waiting", activity: "Needs approval for €2,140", avatar: { icon: <CreditCard /> } },
  { id: "calendar", name: "Calendar", role: "Scheduling", state: "idle", avatar: { icon: <CalendarCheck /> } },
];

export default function Example() {
  const [activeId, setActiveId] = useState("planner");
  const active = agents.find((a) => a.id === activeId);

  return (
    <div className="w-full max-w-sm rounded-kui border border-kui-border bg-kui-surface p-2">
      <p className="px-2 pt-1 pb-2 text-[11px] font-semibold tracking-wide text-kui-fg-subtle uppercase">Trip team</p>
      <AgentRoster agents={agents} activeId={activeId} onSelect={setActiveId} />
      <p className="mt-2 border-t border-kui-border px-2 pt-2.5 pb-1 text-xs text-kui-fg-muted">
        Viewing <span className="font-medium text-kui-fg">{active?.name}</span>'s workspace
      </p>
    </div>
  );
}
