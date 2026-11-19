import * as React from "react";
import {
  ActivityFeed,
  AgentAvatar,
  AgentRoster,
  Artifact,
  Badge,
  Button,
  Card,
  CodeBlock,
  Markdown,
  TaskPlan,
  ToolApproval,
  UsageMeter,
  type ActivityItem,
  type PlanStep,
  AgentHub,
  type AgentNodeState,
} from "kestro-ui";
import { CalendarPlus, Clock, Cpu, Database, Eye, FileText, Mail, Pause, Play, Search, Wrench, Code } from "lucide-react";

const memo = `# Q4 Board Update

**Revenue** grew **18% QoQ** to **$4.2M ARR**, driven by expansion in mid-market accounts.

## Highlights
- Net revenue retention: **124%**
- Logo churn fell to **1.8%** (from 2.6%)
- Support agent resolves **61%** of tickets end-to-end

## Risks
1. Two enterprise renewals slip to Q1
2. Hiring for solutions engineering is behind plan

> Recommendation: approve the Q1 hiring plan to protect enterprise expansion.`;

const baseSteps: PlanStep[] = [
  { id: "1", title: "Pull revenue data from Stripe", status: "complete", duration: 8, details: "Fetched 2,184 invoices and 312 subscriptions for Oct–Dec." },
  { id: "2", title: "Analyze churn & retention", status: "complete", duration: 14, details: "Compared cohorts by plan and segment; NRR 124%." },
  { id: "3", title: "Draft the board memo", status: "complete", duration: 21 },
  { id: "4", title: "Email memo to 6 board members", status: "waiting" },
  { id: "5", title: "Schedule follow-up meeting", status: "pending" },
];

export function RunDemo() {
  const [steps, setSteps] = React.useState(baseSteps);
  const [approval, setApproval] = React.useState<"pending" | "approved" | "denied">("pending");
  const [paused, setPaused] = React.useState(false);
  const [activity, setActivity] = React.useState<ActivityItem[]>([
    { id: "a1", time: "02:16", title: "Queried Stripe invoices", description: "2,184 rows", icon: <Database /> },
    { id: "a2", time: "02:17", title: "Generated churn analysis", icon: <Search /> },
    { id: "a3", time: "02:18", title: "Requested approval to send email", icon: <Mail />, tone: "warning" },
  ]);
  const [used, setUsed] = React.useState(12480);

  const setStep = (id: string, patch: Partial<PlanStep>) => setSteps((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const decide = (ok: boolean) => {
    setApproval(ok ? "approved" : "denied");
    setActivity((a) => [...a, { id: `a${a.length + 1}`, time: "02:19", title: ok ? "Approval granted" : "Approval denied", tone: ok ? "success" : "danger", icon: <Mail /> }]);
    if (!ok) {
      setStep("4", { status: "skipped", description: "Skipped — denied by you" });
      setStep("5", { status: "skipped" });
      return;
    }
    setStep("4", { status: "running" });
    setTimeout(() => {
      setStep("4", { status: "complete", duration: 3 });
      setStep("5", { status: "running" });
      setUsed((u) => u + 1840);
      setActivity((a) => [...a, { id: `a${a.length + 1}`, time: "02:21", title: "Sent memo to 6 recipients", tone: "success", icon: <Mail /> }]);
    }, 2200);
    setTimeout(() => {
      setStep("5", { status: "complete", duration: 4 });
      setUsed((u) => u + 920);
      setActivity((a) => [...a, { id: `a${a.length + 1}`, time: "02:24", title: "Booked “Q4 review” for Dec 3, 10:00", tone: "success", icon: <CalendarPlus /> }]);
    }, 5200);
  };

  const done = steps.every((s) => s.status === "complete" || s.status === "skipped");

  // Map the plan onto the agents doing the work, for the hub view.
  const stepState = (id: string): AgentNodeState => {
    const st = steps.find((x) => x.id === id)?.status;
    if (st === "complete") return "done";
    if (st === "running") return "working";
    if (st === "waiting") return "waiting";
    if (st === "skipped") return "idle";
    if (st === "error") return "error";
    return "queued";
  };
  const writer = stepState("4");
  const scheduler = stepState("5");

  return (
    <div className="kui-scrollbar h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-8">
        {/* header */}
        <div className="flex flex-wrap items-center gap-4">
          <AgentAvatar size="lg" icon={<FileText />} state={done ? "online" : approval === "pending" ? "waiting" : "working"} />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold tracking-tight">Prepare the Q4 board update</h1>
            <p className="text-sm text-kui-fg-subtle">Started 2 minutes ago · run_8f2a · Operations agent</p>
          </div>
          <Badge tone={done ? "success" : approval === "pending" ? "warning" : "accent"} dot pulse={!done} className="h-7 px-3 text-xs">
            {done ? "Completed" : approval === "pending" ? "Waiting for approval" : paused ? "Paused" : "Running"}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => setPaused((p) => !p)} disabled={done}>
            {paused ? <Play /> : <Pause />} {paused ? "Resume" : "Pause run"}
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <Card className="p-5">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-[15px] font-semibold">Coordination</h3>
                <span className="text-xs text-kui-fg-subtle">Operations lead · 4 agents</span>
              </div>
              <AgentHub
                size={500}
                hub={{ id: "lead", name: "Operations lead", state: done ? "done" : approval === "pending" ? "waiting" : "working", activity: done ? "Run complete" : approval === "pending" ? "Waiting on you" : "Coordinating" }}
                agents={[
                  { id: "researcher", name: "Researcher", role: "Data", state: "done", activity: "Pulled 2,184 invoices" },
                  { id: "analyst", name: "Analyst", role: "Finance", state: "done", activity: "Churn model ready" },
                  {
                    id: "writer",
                    name: "Writer",
                    role: "Comms",
                    state: writer === "idle" ? "error" : writer,
                    activity: writer === "waiting" ? "Needs approval to send" : writer === "working" ? "Sending memo" : writer === "done" ? "Memo sent" : "Not sent",
                  },
                  { id: "scheduler", name: "Scheduler", role: "Calendar", state: scheduler, activity: scheduler === "working" ? "Booking Dec 3, 10:00" : scheduler === "done" ? "Meeting booked" : undefined },
                ]}
              />
            </Card>
            <Card className="p-5">
              <TaskPlan
                title="Execution plan"
                steps={steps.map((s) =>
                  s.id === "4" && (s.status === "waiting" || approval !== "pending")
                    ? {
                        ...s,
                        content: (
                          <ToolApproval
                            title="Send email to 6 board members?"
                            description="The agent drafted the memo and wants to send it from your account."
                            icon={<Mail />}
                            status={approval}
                            details={[
                              { label: "To", value: "board@northwind.com (6)" },
                              { label: "Subject", value: "Q4 Board Update — for review" },
                              { label: "Attachment", value: "board-update.pdf · 184 KB" },
                            ]}
                            rememberLabel="Always allow sending to this list"
                            approveLabel="Send email"
                            onApprove={() => decide(true)}
                            onDeny={() => decide(false)}
                          />
                        ),
                      }
                    : s,
                )}
              />
            </Card>

            <Artifact
              title="board-update.md"
              subtitle="Generated by Writer · v3"
              icon={<FileText />}
              copyText={memo}
              onDownload={() => {}}
              className="max-h-[520px]"
              tabs={[
                { id: "preview", label: "Preview", icon: <Eye />, content: <Markdown className="p-5">{memo}</Markdown> },
                { id: "source", label: "Markdown", icon: <Code />, content: <div className="p-3"><CodeBlock code={memo} language="markdown" filename="board-update.md" showLineNumbers /></div> },
              ]}
              footer={<span className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-kui-success" /> Saved · 214 words</span>}
            />
          </div>

          <div className="space-y-6">
            <Card className="p-4">
              <h3 className="mb-2 text-[15px] font-semibold">Run details</h3>
              <dl className="divide-y divide-kui-border text-[13px]">
                {[
                  [<Cpu key="i" className="size-4" />, "Model", "Auto (reasoning)"],
                  [<Wrench key="i" className="size-4" />, "Tools used", "4"],
                  [<Clock key="i" className="size-4" />, "Elapsed", done ? "02:24" : "02:18"],
                ].map(([icon, k, v], i) => (
                  <div key={i} className="flex items-center gap-2.5 py-2.5">
                    <span className="text-kui-fg-subtle">{icon}</span>
                    <dt className="text-kui-fg-muted">{k}</dt>
                    <dd className="ml-auto font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </Card>
            <UsageMeter used={used} limit={32000} input={Math.round(used * 0.79)} output={Math.round(used * 0.21)} cost={used * 0.0000037} />
            <Card className="p-4">
              <h3 className="mb-2 text-[15px] font-semibold">Agents</h3>
              <AgentRoster
                agents={[
                  { id: "r", name: "Researcher", role: "Data", state: "online", activity: "Finished · 2 sources" },
                  { id: "a", name: "Analyst", role: "Finance", state: "online", activity: "Finished · churn model" },
                  { id: "w", name: "Writer", role: "Comms", state: done ? "online" : approval === "pending" ? "waiting" : "working", activity: done ? "Finished" : approval === "pending" ? "Waiting for your approval" : "Sending email…" },
                ]}
              />
            </Card>
            <Card className="p-4">
              <h3 className="mb-1 text-[15px] font-semibold">Recent activity</h3>
              <ActivityFeed items={activity} />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
