import * as React from "react";
import { ArrowRight, Check, Copy, Plane } from "lucide-react";
import {
  AgentHub,
  AttitudeIndicator,
  Button,
  Message,
  RunCard,
  ToolApproval,
  ToolCall,
  useCopyToClipboard,
  type AgentNodeState,
  type RunStep,
} from "kestro-ui";
import { href } from "../lib/router";
import { GITHUB_URL, NPM_NAME } from "../lib/site";
import { GithubIcon } from "./layout";

function InstallCommand() {
  const { copied, copy } = useCopyToClipboard();
  const cmd = `npm install ${NPM_NAME}`;
  return (
    <button
      onClick={() => copy(cmd)}
      className="group flex h-12 w-full max-w-md cursor-pointer items-center gap-3 rounded-kui border border-kui-border-strong bg-kui-surface-2 px-4 text-left font-mono text-[13px] text-kui-fg transition-colors hover:bg-kui-surface-3"
      aria-label="Copy install command"
    >
      <span className="text-kui-fg-subtle">$</span>
      <span className="flex-1">{cmd}</span>
      {copied ? <Check className="size-4 text-kui-success" /> : <Copy className="size-4 text-kui-fg-subtle group-hover:text-kui-fg" />}
    </button>
  );
}

/** The hero: a real run, playing out, that stops to ask. */
function HeroRun() {
  const [phase, setPhase] = React.useState(0); // 0 thinking, 1 searching, 2 approval, 3 booked, 4 declined
  React.useEffect(() => {
    if (phase > 1) return;
    const id = setTimeout(() => setPhase((p) => p + 1), phase === 0 ? 1800 : 2000);
    return () => clearTimeout(id);
  }, [phase]);

  const steps: RunStep[] = [
    {
      id: "think",
      title: "Thinking",
      description: phase === 0 ? "Comparing direct flights from London to Lisbon…" : "Compared direct flights from London to Lisbon.",
      status: phase === 0 ? "running" : "complete",
      duration: phase === 0 ? undefined : 4,
    },
  ];
  if (phase >= 1)
    steps.push({
      id: "search",
      title: "Search flights",
      status: phase === 1 ? "running" : "complete",
      content: (
        <ToolCall
          name="search_flights"
          status={phase === 1 ? "running" : "success"}
          durationMs={phase === 1 ? undefined : 842}
          input={{ origin: "LHR", destination: "LIS", date: "2026-12-04", passengers: 1 }}
          output={phase === 1 ? undefined : { found: 3, cheapest: "£118", best: "TP 1351 · £142" }}
          defaultOpen
        />
      ),
    });
  if (phase >= 2)
    steps.push({
      id: "approve",
      title: phase === 3 ? "Booked" : phase === 4 ? "Not booked" : "Your approval",
      status: phase === 2 ? "waiting" : phase === 3 ? "complete" : "error",
      content: (
        <ToolApproval
          title="Book TP 1351 for £142?"
          description="London Heathrow → Lisbon · 04 Dec · 11:20–14:05 · Economy. Your card is charged after approval."
          icon={<Plane />}
          rememberLabel={false}
          status={phase === 2 ? "pending" : phase === 3 ? "approved" : "denied"}
          onApprove={() => setPhase(3)}
          onDeny={() => setPhase(4)}
        />
      ),
    });

  return (
    <RunCard
      title="Flight to Lisbon"
      runId="Run 0241"
      status={phase === 2 ? "waiting" : phase === 3 ? "complete" : phase === 4 ? "failed" : "running"}
      steps={steps}
      actions={
        phase >= 3 ? (
          <button onClick={() => setPhase(0)} className="cursor-pointer font-mono text-[11px] text-kui-fg-subtle underline-offset-2 hover:text-kui-fg hover:underline">
            Replay
          </button>
        ) : null
      }
      className="shadow-kui-lg"
    />
  );
}

function CoordinationPreview() {
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1700);
    return () => clearInterval(id);
  }, []);
  const cycle: AgentNodeState[] = ["queued", "working", "working", "done"];
  const agents = [
    { id: "inbox", name: "Inbox", activity: "Triaging 48 emails" },
    { id: "calendar", name: "Calendar", activity: "Finding a slot" },
    { id: "docs", name: "Docs", activity: "Summarizing notes" },
    { id: "crm", name: "CRM", activity: "Updating contacts" },
    { id: "billing", name: "Billing", activity: "Matching invoices" },
  ];
  return (
    <AgentHub
      size={460}
      hub={{ id: "chief", name: "Chief of staff", state: "working", activity: "Coordinating" }}
      agents={agents.map((a, i) => ({ ...a, state: cycle[(tick + i) % cycle.length] }))}
    />
  );
}

const sections = [
  { tag: "Chat", title: "A conversation that shows its work", text: "Messages, streaming Markdown, reasoning and citations." },
  { tag: "Tool calls", title: "Every action, with its arguments", text: "Pending, running, done or failed — collapsible and typed." },
  { tag: "Approvals", title: "Nothing irreversible without a yes", text: "Payments, emails, bookings and deletions wait for the user." },
];

export function Home() {
  return (
    <div className="animate-kui-fade">
      <section className="border-b border-kui-border">
        <div className="mx-auto grid max-w-6xl items-start gap-12 px-4 pt-14 pb-16 sm:px-8 lg:grid-cols-[1fr_1.05fr] lg:pt-20">
          <div className="space-y-7 lg:pt-6">
            <p className="font-mono text-xs tracking-[0.2em] text-kui-fg-muted uppercase">Open source / React</p>
            <h1 className="font-display text-[44px] leading-[0.98] sm:text-[64px]">Interface components for AI agents.</h1>
            <p className="max-w-lg text-lg leading-relaxed text-kui-fg-muted">
              Chat, tool calls, approvals, plans and voice — composable React components for agents that keep people in control.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href={href("/docs/introduction")}>
                <Button variant="accent" size="lg" className="px-6">
                  Get started
                </Button>
              </a>
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg" className="border-kui-fg/70 px-6">
                  <GithubIcon className="size-4" /> View on GitHub
                </Button>
              </a>
            </div>
            <InstallCommand />
          </div>
          <HeroRun />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-8">
        <h2 className="font-display mb-8 text-3xl sm:text-4xl">Built for the moments that matter.</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {sections.map((s, i) => (
            <div key={s.tag} className="flex flex-col rounded-kui border border-kui-border-strong bg-kui-surface">
              <div className="border-b border-kui-border px-4 py-2.5 font-mono text-[11px] tracking-[0.18em] text-kui-fg-muted uppercase">
                0{i + 1} / {s.tag}
              </div>
              <div className="flex-1 space-y-3 p-4">
                {i === 0 ? (
                  <>
                    <Message from="user" avatar={false}>Find a flight to Lisbon next week under £200.</Message>
                    <Message from="assistant" avatar={{ appearance: "monogram", color: "accent", name: "Kestro" }}>
                      <p className="text-[14.5px] leading-relaxed">I'll search direct flights from London and show you the best three.</p>
                    </Message>
                  </>
                ) : i === 1 ? (
                  <ToolCall name="search_flights" status="success" durationMs={842} defaultOpen input={{ origin: "LHR", destination: "LIS", passengers: 1 }} />
                ) : (
                  <ToolApproval title="Book TP 1351 for £142?" description="LHR → LIS · 04 Dec · Economy" icon={<Plane />} rememberLabel={false} />
                )}
              </div>
              <div className="border-t border-kui-border px-4 py-3">
                <p className="font-semibold">{s.title}</p>
                <p className="text-sm text-kui-fg-muted">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-kui-border bg-kui-surface">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-8 lg:grid-cols-2">
          <div className="space-y-4">
            <p className="font-mono text-xs tracking-[0.2em] text-kui-fg-muted uppercase">Multi-agent</p>
            <h2 className="font-display text-3xl sm:text-4xl">See which agent is doing what.</h2>
            <p className="max-w-md text-kui-fg-muted">
              <code className="font-mono text-[0.9em] text-kui-fg">AgentHub</code>, <code className="font-mono text-[0.9em] text-kui-fg">AgentGraph</code> and{" "}
              <code className="font-mono text-[0.9em] text-kui-fg">TraceTree</code> show an orchestrator, the agents it delegates to, and every LLM and tool step underneath — live.
            </p>
            <a href={href("/examples/team")} className="inline-flex items-center gap-1.5 font-medium text-kui-accent hover:underline">
              Open the agent team demo <ArrowRight className="size-4" />
            </a>
          </div>
          <CoordinationPreview />
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-8 lg:grid-cols-[1fr_1fr]">
        <div className="flex justify-center lg:order-2">
          <AttitudeIndicator state="thinking" value={66} label="Awaiting approval" sublabel="Executor / K-03" size={380} />
        </div>
        <div className="space-y-4">
          <p className="font-mono text-xs tracking-[0.2em] text-kui-fg-muted uppercase">Instruments</p>
          <h2 className="font-display text-3xl sm:text-4xl">For agents you watch, not just chat with.</h2>
          <p className="max-w-md text-kui-fg-muted">
            An attitude indicator for agent state, gauges, telemetry charts, event logs and a command console — for operations rooms, voice assistants and long-running runs.
          </p>
          <a href={href("/examples/deck")} className="inline-flex items-center gap-1.5 font-medium text-kui-accent hover:underline">
            Open the flight deck <ArrowRight className="size-4" />
          </a>
        </div>
      </section>

      <section className="border-t border-kui-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-8">
          <h2 className="font-display mb-6 text-3xl">Examples</h2>
          <ExampleGrid />
        </div>
      </section>

      <footer className="border-t border-kui-border py-8 text-center text-sm text-kui-fg-subtle">
        Kestro UI · MIT license ·{" "}
        <a href={GITHUB_URL} className="underline-offset-2 hover:text-kui-fg hover:underline">
          GitHub
        </a>{" "}
        ·{" "}
        <a href="llms.txt" className="underline-offset-2 hover:text-kui-fg hover:underline">
          llms.txt
        </a>
      </footer>
    </div>
  );
}

const examples = [
  { to: "/examples/chat", title: "Agent chat", text: "Travel, research, support and code — with tools, sources and approvals." },
  { to: "/examples/team", title: "Agent team", text: "An orchestrator delegating to four agents, as a tree, a hub and a trace." },
  { to: "/examples/deck", title: "Flight deck", text: "Instrument-panel HUD: attitude indicator, telemetry, event log." },
  { to: "/examples/run", title: "Agent run", text: "A background workflow with a plan, an approval and a generated report." },
  { to: "/examples/jarvis", title: "Voice console", text: "A voice-reactive core, live gauges and a command line." },
  { to: "/examples/voice", title: "Voice & widget", text: "A voice call surface and a support widget on a store page." },
];

export function ExampleGrid() {
  return (
    <div className="grid gap-px overflow-hidden rounded-kui border border-kui-border bg-kui-border sm:grid-cols-2 lg:grid-cols-3">
      {examples.map((e) => (
        <a key={e.to} href={href(e.to)} className="group bg-kui-surface p-5 transition-colors duration-300 hover:bg-kui-surface-2">
          <h3 className="flex items-center gap-2 font-semibold">
            {e.title} <ArrowRight className="size-4 text-kui-fg-subtle transition-transform duration-300 ease-kui-out group-hover:translate-x-1 group-hover:text-kui-accent" />
          </h3>
          <p className="mt-1 text-sm text-kui-fg-muted">{e.text}</p>
        </a>
      ))}
    </div>
  );
}
