import * as React from "react";
import {
  AgentAvatar,
  AttitudeIndicator,
  Button,
  EventLog,
  RadialGauge,
  TaskPlan,
  TelemetryChart,
  cn,
  type CoreState,
  type LogEvent,
  type PlanStep,
} from "kestro-ui";
import { CornerDownLeft, RotateCcw } from "lucide-react";

const clock = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
const walk = (arr: number[], lo: number, hi: number, step: number) => {
  const next = Math.max(lo, Math.min(hi, arr[arr.length - 1] + (Math.random() - 0.5) * step));
  return [...arr.slice(1), Math.round(next * 10) / 10];
};
const seed = (base: number, jitter: number, n = 30) => Array.from({ length: n }, (_, i) => base + Math.sin(i * 0.7) * jitter + (Math.random() - 0.5) * jitter);

type Phase = "search" | "rules" | "approval" | "booking" | "done" | "denied";

function Panel({ title, children, className }: { title: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-kui border border-kui-border-strong bg-kui-surface", className)}>
      <h2 className="border-b border-kui-border px-4 py-2.5 font-display text-[13px] tracking-[0.08em] uppercase">{title}</h2>
      <div className="p-4">{children}</div>
    </section>
  );
}

export function FlightDeckDemo() {
  const [phase, setPhase] = React.useState<Phase>("search");
  const [latency, setLatency] = React.useState(() => seed(840, 60));
  const [tps, setTps] = React.useState(() => seed(46, 5));
  const [success, setSuccess] = React.useState(() => seed(98.3, 0.4));
  const [time, setTime] = React.useState(clock());
  const [events, setEvents] = React.useState<LogEvent[]>(() => [
    { id: "e1", time: clock(), event: "run.started", fields: { agent: "K-03", task: "book_flight" } },
  ]);
  const [command, setCommand] = React.useState("");
  const [speakLevel, setSpeakLevel] = React.useState(0);

  // live telemetry + clock
  React.useEffect(() => {
    const id = setInterval(() => {
      setLatency((d) => walk(d, 650, 1100, 70));
      setTps((d) => walk(d, 30, 60, 6));
      setSuccess((d) => walk(d, 97, 99.6, 0.35));
      setTime(clock());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const push = (e: Omit<LogEvent, "id" | "time">) =>
    setEvents((list) => [...list.map((x) => ({ ...x, streaming: false })), { ...e, id: `e${list.length + 1}`, time: clock(), streaming: true }]);

  // scripted run
  React.useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    if (phase === "search")
      t = setTimeout(() => {
        push({ event: "search_flights complete", fields: { origin: "LHR", destination: "LIS", date: "2026-12-04", results: 24 } });
        setPhase("rules");
      }, 2200);
    if (phase === "rules")
      t = setTimeout(() => {
        push({ event: "check_fare_rules complete", fields: { fare_id: "TP1351", changeable: true, refundable: false, baggage: "1 x 23kg" } });
        setTimeout(() => {
          push({ event: "approval.requested", tone: "warning", fields: { action: "book_flight", flight_id: "TP1351", price: "£142.00" } });
          setPhase("approval");
        }, 900);
      }, 2400);
    if (phase === "booking")
      t = setTimeout(() => {
        push({ event: "book_flight complete", tone: "success", fields: { pnr: "QX7P2L", seat: "14A", total: "£142.00" } });
        setPhase("done");
      }, 2600);
    return () => clearTimeout(t);
  }, [phase]);

  // simulated voice level while "speaking" a confirmation
  React.useEffect(() => {
    if (phase !== "booking") return;
    let raf = 0;
    const tick = (now: number) => {
      setSpeakLevel(0.3 + Math.abs(Math.sin(now / 130) * 0.5));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      setSpeakLevel(0);
    };
  }, [phase]);

  const coreState: CoreState = phase === "search" || phase === "rules" ? "thinking" : phase === "booking" ? "speaking" : phase === "denied" ? "error" : "idle";
  const label = { search: "Searching", rules: "Checking fares", approval: "Awaiting approval", booking: "Booking", done: "Booked", denied: "Stopped" }[phase];
  const progress = { search: 22, rules: 48, approval: 66, booking: 84, done: 100, denied: 66 }[phase];

  const steps: PlanStep[] = [
    { id: "a", title: "Compare flights", description: "Query LHR → LIS · 04 Dec", status: phase === "search" ? "running" : "complete" },
    { id: "b", title: "Check fare rules", description: "Changes, baggage, fare type", status: phase === "search" ? "pending" : phase === "rules" ? "running" : "complete" },
    {
      id: "c",
      title: "Confirm booking",
      description: phase === "denied" ? "Declined by operator" : "Request operator approval",
      status: phase === "approval" ? "waiting" : phase === "booking" ? "running" : phase === "done" ? "complete" : phase === "denied" ? "error" : "pending",
    },
  ];

  const decide = (ok: boolean) => {
    push({ event: ok ? "approval.granted" : "approval.denied", tone: ok ? "success" : "danger", fields: { by: "operator", action: "book_flight" } });
    setPhase(ok ? "booking" : "denied");
  };
  const reset = () => {
    setEvents([{ id: "e1", time: clock(), event: "run.started", fields: { agent: "K-03", task: "book_flight" } }]);
    setPhase("search");
  };

  const roster = [
    { name: "Research", state: phase === "search" ? "working" : "idle", label: phase === "search" ? "Searching" : "Idle" },
    { name: "Planner", state: "online", label: phase === "done" ? "Complete" : "Coordinating" },
    { name: "Executor", state: phase === "approval" ? "waiting" : phase === "booking" ? "working" : phase === "denied" ? "error" : "idle", label: phase === "approval" ? "Waiting" : phase === "booking" ? "Booking" : "Idle" },
  ] as const;

  return (
    <div data-kui-theme="dark" className="kui-scrollbar h-full overflow-y-auto bg-kui-bg text-kui-fg">
      <div className="mx-auto max-w-[1500px] space-y-3 p-3 sm:p-4">
        <header className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-kui border border-kui-border-strong bg-kui-surface px-4 py-3">
          <span className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-md bg-kui-fg font-display text-sm text-kui-bg">K</span>
            <span className="font-display text-lg tracking-[0.02em] uppercase sm:text-xl">Kestro UI / Agent HUD</span>
          </span>
          <span className="ml-auto font-mono text-xs tracking-wider text-kui-fg-muted uppercase">Session 0241</span>
          <span className="font-mono text-xs tracking-wider text-kui-fg-muted uppercase tabular-nums">Local time {time}</span>
          <span className="inline-flex h-7 items-center gap-2 rounded-md border border-kui-success/40 bg-kui-success-soft px-2.5 font-mono text-[11px] tracking-wider text-kui-success uppercase">
            <span className="size-1.5 rounded-full bg-kui-success" /> Connected
          </span>
        </header>

        <div className="grid gap-3 xl:grid-cols-[360px_1fr_380px]">
          <div className="space-y-3">
            <Panel title="Telemetry">
              <div className="space-y-4 divide-y divide-kui-border [&>*+*]:pt-4">
                <TelemetryChart label="Latency" value={Math.round(latency[latency.length - 1])} unit="ms" data={latency} min={400} max={1200} />
                <TelemetryChart label="Tokens / sec" value={tps[tps.length - 1].toFixed(1)} data={tps} min={0} max={80} />
                <TelemetryChart label="Tool success" value={`${success[success.length - 1].toFixed(1)}%`} data={success} min={96} max={100} formatY={(v) => `${v.toFixed(1)}%`} />
              </div>
            </Panel>
            <Panel title="Run plan">
              <TaskPlan steps={steps} showProgress={false} />
            </Panel>
          </div>

          <section className="relative flex min-h-[620px] flex-col items-center justify-center gap-4 rounded-kui border border-kui-border-strong bg-kui-surface p-4">
            <AttitudeIndicator state={coreState} level={speakLevel} value={progress} label={label} sublabel="Executor / K-03" caption="Observe → Propose → Confirm" size={430} />
            <div className="grid w-full max-w-[560px] grid-cols-[auto_1fr_auto] items-end gap-3">
              <RadialGauge value={39} label="Context" unit="%" size={128} tone="warning" />
              <div className="mb-3 rounded-kui border border-kui-border-strong bg-kui-bg/60 p-3 text-center">
                {phase === "approval" ? (
                  <>
                    <p className="font-semibold">Book TP 1351 for £142?</p>
                    <p className="font-mono text-[11px] tracking-wider text-kui-fg-muted uppercase">LHR → LIS · 04 Dec</p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <Button variant="outline" onClick={() => decide(false)} className="font-mono text-xs tracking-wider uppercase">Deny</Button>
                      <Button variant="accent" onClick={() => decide(true)} className="font-mono text-xs tracking-wider uppercase">Approve</Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="font-semibold">{phase === "done" ? "Booked · PNR QX7P2L" : phase === "denied" ? "Booking declined" : phase === "booking" ? "Booking TP 1351…" : "Working on it…"}</p>
                    <p className="font-mono text-[11px] tracking-wider text-kui-fg-muted uppercase">{phase === "done" ? "Seat 14A · £142.00" : "LHR → LIS · 04 Dec"}</p>
                    {phase === "done" || phase === "denied" ? (
                      <Button variant="outline" size="sm" onClick={reset} className="mt-3 font-mono text-xs tracking-wider uppercase">
                        <RotateCcw /> Run again
                      </Button>
                    ) : null}
                  </>
                )}
              </div>
              <RadialGauge value={0.42} max={2} label="Budget" size={128} tone="warning" format={(v) => `£${v.toFixed(2)}`} />
            </div>
          </section>

          <Panel title="Command console" className="flex flex-col">
            <div className="kui-scrollbar max-h-[560px] overflow-y-auto">
              <EventLog events={events} footer={phase === "approval" ? "Awaiting operator input" : undefined} />
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!command.trim()) return;
                push({ event: `operator.${command.trim().split(/\s+/)[0].toLowerCase()}`, fields: { input: command.trim() } });
                setCommand("");
              }}
              className="mt-3 flex items-center gap-2 rounded-kui-sm border border-kui-border-strong bg-kui-bg/60 px-3"
            >
              <input value={command} onChange={(e) => setCommand(e.target.value)} placeholder="Enter a command…" className="h-10 min-w-0 flex-1 bg-transparent font-mono text-[13px] placeholder:text-kui-fg-subtle focus:outline-none" />
              <button type="submit" aria-label="Send command" className="flex size-7 cursor-pointer items-center justify-center rounded border border-kui-border-strong text-kui-fg-muted hover:text-kui-fg">
                <CornerDownLeft className="size-3.5" />
              </button>
            </form>
          </Panel>
        </div>

        <footer className="flex flex-wrap items-center gap-x-8 gap-y-3 rounded-kui border border-kui-border-strong bg-kui-surface px-5 py-4">
          <span className="font-display text-base tracking-[0.06em] uppercase">Agent roster</span>
          {roster.map((a) => (
            <span key={a.name} className="flex items-center gap-3 border-l border-kui-border pl-6">
              <AgentAvatar appearance="monogram" color="oklch(0.9 0.008 250)" name={a.name} size="md" />
              <span>
                <span className="block font-display text-[13px] tracking-[0.06em] uppercase">{a.name}</span>
                <span className="flex items-center gap-1.5 text-[13px] text-kui-fg-muted">
                  <span className={cn("size-1.5 rounded-full", a.state === "waiting" ? "bg-kui-warning" : a.state === "working" ? "bg-kui-info" : a.state === "error" ? "bg-kui-danger" : "bg-kui-success")} />
                  {a.label}
                </span>
              </span>
            </span>
          ))}
          <span className="ml-auto font-mono text-xs tracking-wider text-kui-fg-muted uppercase">3 agents / 2 tools / {phase === "approval" ? 1 : 0} approval</span>
        </footer>
      </div>
    </div>
  );
}
