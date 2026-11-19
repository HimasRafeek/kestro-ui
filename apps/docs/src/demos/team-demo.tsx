import * as React from "react";
import {
  ActivityFeed,
  AgentGraph,
  AgentHub,
  Badge,
  Button,
  Card,
  ToolApproval,
  TraceTree,
  cn,
  formatDuration,
  type ActivityItem,
  type AgentNode,
  type AgentNodeState,
  type TraceSpan,
} from "kestro-ui";
import { Pause, Play, RotateCcw, Network, GitFork, Landmark } from "lucide-react";

/*
 * A deterministic, replayable orchestration: everything on screen is derived
 * from the clock `t` (ms) and the moment the user approved the deposit.
 */
const APPROVAL_AT = 12500;

type Ev = { id: string; parent?: string; name: string; kind: TraceSpan["kind"]; start: number; end: number; meta?: string; post?: boolean };

const pre: Ev[] = [
  { id: "planner", name: "Planner", kind: "agent", start: 0, end: Infinity },
  { id: "p-llm", parent: "planner", name: "Break down the brief", kind: "llm", start: 200, end: 1500, meta: "812 tok" },
  { id: "researcher", parent: "planner", name: "Researcher", kind: "agent", start: 1600, end: 8800 },
  { id: "r-search", parent: "researcher", name: "web_search · venues Lisbon 12 ppl", kind: "tool", start: 1800, end: 4100 },
  { id: "r-db", parent: "researcher", name: "venue_db.query", kind: "retrieval", start: 2100, end: 3700, meta: "38 rows" },
  { id: "r-rank", parent: "researcher", name: "Rank 6 venues", kind: "llm", start: 4200, end: 6100, meta: "2.1k tok" },
  { id: "r-reviews", parent: "researcher", name: "read_reviews × 3", kind: "tool", start: 6200, end: 8600 },
  { id: "travel", parent: "planner", name: "Travel", kind: "agent", start: 1700, end: 7900 },
  { id: "t-flights", parent: "travel", name: "search_flights · 4 origins", kind: "tool", start: 1900, end: 5200 },
  { id: "t-llm", parent: "travel", name: "Compare fares", kind: "llm", start: 5300, end: 7600, meta: "1.4k tok" },
  { id: "budget", parent: "planner", name: "Budget", kind: "agent", start: 9000, end: Infinity },
  { id: "b-sum", parent: "budget", name: "sheet.sum · 41 line items", kind: "tool", start: 9200, end: 10700 },
  { id: "b-guard", parent: "budget", name: "Policy check · under €9,000", kind: "guardrail", start: 10800, end: 12300 },
];
// Relative to the approval moment
const post: Ev[] = [
  { id: "b-hold", parent: "budget", name: "venue.hold_deposit €1,200", kind: "tool", start: 200, end: 1500, post: true },
  { id: "writer", parent: "planner", name: "Writer", kind: "agent", start: 1600, end: 6200, post: true },
  { id: "w-llm", parent: "writer", name: "Draft 3-day itinerary", kind: "llm", start: 1800, end: 5900, meta: "3.6k tok", post: true },
  { id: "p-sum", parent: "planner", name: "Summarize for you", kind: "llm", start: 6400, end: 7800, meta: "640 tok", post: true },
];
const PLANNER_END_AFTER = 8000;

const roles: Record<string, string> = { planner: "Lead", researcher: "Venues", travel: "Flights", budget: "Finance", writer: "Docs" };
const activities: Record<string, [number, string][]> = {
  planner: [[0, "Breaking down the brief"], [1600, "Delegating to 3 agents"], [8800, "Waiting on Budget"]],
  researcher: [[1600, "Searching venues near Alfama"], [4200, "Ranking 6 venues"], [6200, "Reading reviews"]],
  travel: [[1700, "Checking fares from 4 cities"], [5300, "Comparing fares"]],
  budget: [[9000, "Adding up 41 line items"], [10800, "Checking travel policy"]],
  writer: [[1600, "Drafting the itinerary"]],
};

export function TeamDemo() {
  const [t, setT] = React.useState(0);
  const [playing, setPlaying] = React.useState(true);
  const [approvedAt, setApprovedAt] = React.useState<number | null>(null);
  const [denied, setDenied] = React.useState(false);
  const [view, setView] = React.useState<"tree" | "hub">("tree");

  const waiting = t >= APPROVAL_AT && approvedAt === null && !denied;
  const finished = approvedAt !== null && t >= approvedAt + PLANNER_END_AFTER;

  React.useEffect(() => {
    if (!playing || waiting || finished || denied) return;
    const id = setInterval(() => setT((x) => x + 100), 100);
    return () => clearInterval(id);
  }, [playing, waiting, finished, denied]);

  const events = React.useMemo(() => {
    const list = pre.map((e) => ({ ...e }));
    if (approvedAt !== null) list.push(...post.map((e) => ({ ...e, start: e.start + approvedAt, end: e.end + approvedAt })));
    const planner = list.find((e) => e.id === "planner")!;
    const budget = list.find((e) => e.id === "budget")!;
    if (approvedAt !== null) {
      planner.end = approvedAt + PLANNER_END_AFTER;
      budget.end = approvedAt + 1600;
    }
    if (denied) {
      planner.end = APPROVAL_AT + 400;
      budget.end = APPROVAL_AT;
    }
    return list;
  }, [approvedAt, denied]);

  const now = Math.min(t, finished ? events[0].end : t);
  const spans: TraceSpan[] = events
    .filter((e) => e.start <= now)
    .map((e) => ({ id: e.id, parentId: e.parent, name: e.name, kind: e.kind, start: e.start, end: e.end <= now ? e.end : undefined, meta: e.meta }));
  if (t >= APPROVAL_AT) {
    spans.push({ id: "b-approve", parentId: "budget", name: denied ? "Deposit declined by you" : "Waiting for your approval", kind: "step", start: APPROVAL_AT, end: approvedAt ?? (denied ? APPROVAL_AT + 300 : undefined), status: denied ? "error" : "ok" });
  }

  const agentIds = ["planner", "researcher", "travel", "budget", "writer"];
  const stateOf = (id: string): AgentNodeState => {
    const e = events.find((x) => x.id === id);
    if (id === "budget" && waiting) return "waiting";
    if (id === "budget" && denied && t >= APPROVAL_AT) return "error";
    if (!e) return "queued";
    if (now < e.start) return "queued";
    if (now >= e.end) return "done";
    return "working";
  };
  const activityOf = (id: string) => {
    const st = stateOf(id);
    if (st === "waiting") return "Needs approval: €1,200 deposit";
    if (st !== "working") return undefined;
    if (id === "planner" && approvedAt !== null) return now > approvedAt + 6400 ? "Summarizing" : "Coordinating Writer";
    const list = activities[id] ?? [];
    const base = id === "writer" ? (approvedAt ?? 0) : 0;
    return [...list].reverse().find(([at]) => now >= at + base)?.[1];
  };
  const nodes: AgentNode[] = agentIds.map((id) => ({
    id,
    name: id[0].toUpperCase() + id.slice(1),
    parentId: id === "planner" ? undefined : "planner",
    role: roles[id],
    state: stateOf(id),
    activity: activityOf(id),
    meta: stateOf(id) === "done" ? `${spans.filter((s) => s.parentId === id).length} steps` : undefined,
  }));

  const feed: ActivityItem[] = [
    { at: 200, title: "Planner started", description: "Team offsite · Lisbon · 12 people · under €9,000" },
    { at: 1600, title: "Delegated venues to Researcher", tone: "accent" as const },
    { at: 1700, title: "Delegated flights to Travel", tone: "accent" as const },
    { at: 7900, title: "Travel finished", description: "Best total €3,940 for 12 travelers", tone: "success" as const },
    { at: 8800, title: "Researcher finished", description: "Shortlisted Casa do Largo (4.8★)", tone: "success" as const },
    { at: 9000, title: "Delegated budget to Budget", tone: "accent" as const },
    { at: APPROVAL_AT, title: "Approval requested", description: "Hold venue deposit of €1,200", tone: "warning" as const },
  ]
    .filter((f) => t >= f.at)
    .map((f, i) => ({ id: `f${i}`, title: f.title, description: f.description, tone: f.tone, time: formatDuration(f.at / 1000) }));
  if (approvedAt !== null) {
    feed.push({ id: "fa", title: "You approved the deposit", tone: "success", time: formatDuration(approvedAt / 1000) });
    if (now >= approvedAt + 1600) feed.push({ id: "fw", title: "Delegated itinerary to Writer", tone: "accent", time: formatDuration((approvedAt + 1600) / 1000) });
    if (finished) feed.push({ id: "fd", title: "Plan ready", description: "€8,410 total · itinerary in your inbox", tone: "success", time: formatDuration((approvedAt + PLANNER_END_AFTER) / 1000) });
  }
  if (denied) feed.push({ id: "fx", title: "You declined the deposit", description: "Planner stopped before paying anything", tone: "danger", time: formatDuration(APPROVAL_AT / 1000) });

  const replay = () => {
    setT(0);
    setApprovedAt(null);
    setDenied(false);
    setPlaying(true);
  };

  const status = denied ? "Stopped" : finished ? "Completed" : waiting ? "Waiting for you" : playing ? "Running" : "Paused";
  const tone = denied ? "danger" : finished ? "success" : waiting ? "warning" : "accent";

  return (
    <div className="kui-scrollbar h-full overflow-y-auto">
      <div className="mx-auto max-w-7xl space-y-5 p-4 sm:p-6">
        <header className="flex flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[11px] tracking-wider text-kui-fg-subtle uppercase">run_31c9 · 5 agents</p>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Plan a 3-day team offsite in Lisbon for 12 people</h1>
          </div>
          <Badge tone={tone} dot pulse={!finished && !denied && !waiting} className="h-7 px-3 text-xs">
            {status}
          </Badge>
          <span className="font-mono text-sm text-kui-fg-muted tabular-nums">{formatDuration(now / 1000)}</span>
          <Button variant="outline" size="sm" onClick={() => setPlaying((p) => !p)} disabled={finished || waiting || denied}>
            {playing ? <Pause /> : <Play />} {playing ? "Pause" : "Resume"}
          </Button>
          <Button variant="outline" size="sm" onClick={replay}>
            <RotateCcw /> Replay
          </Button>
        </header>

        <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
          <div className="min-w-0 space-y-5">
            <Card className="p-4 shadow-none">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold">Coordination</h2>
                <div className="flex rounded-kui-sm border border-kui-border p-0.5" role="tablist">
                  {([["tree", "Tree", <GitFork key="t" />], ["hub", "Hub", <Network key="h" />]] as const).map(([id, label, icon]) => (
                    <button
                      key={id}
                      role="tab"
                      aria-selected={view === id}
                      onClick={() => setView(id)}
                      className={cn(
                        "inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-[calc(var(--kui-radius)*0.5)] px-2.5 text-xs font-medium transition-colors [&_svg]:size-3.5",
                        view === id ? "bg-kui-surface-3 text-kui-fg" : "text-kui-fg-subtle hover:text-kui-fg",
                      )}
                    >
                      {icon}
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {view === "tree" ? (
                <AgentGraph nodes={nodes} className="py-2" />
              ) : (
                <AgentHub hub={nodes[0]} agents={nodes.slice(1)} size={500} />
              )}
            </Card>
            <TraceTree spans={spans} now={now} />
          </div>

          <div className="space-y-5">
            {t >= APPROVAL_AT ? (
              <ToolApproval
                title="Hold a €1,200 venue deposit?"
                description="Budget confirmed the plan fits under €9,000. Casa do Largo needs a refundable deposit to hold the dates."
                icon={<Landmark />}
                status={approvedAt !== null ? "approved" : denied ? "denied" : "pending"}
                details={[
                  { label: "Venue", value: "Casa do Largo, Alfama" },
                  { label: "Dates", value: "Mar 12–14" },
                  { label: "Refundable until", value: "Feb 26" },
                ]}
                rememberLabel={false}
                approveLabel="Hold deposit"
                onApprove={() => setApprovedAt(t)}
                onDeny={() => setDenied(true)}
              />
            ) : null}
            <Card className="p-4 shadow-none">
              <h2 className="mb-1 text-sm font-semibold">Activity</h2>
              <ActivityFeed items={[...feed].reverse()} />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
