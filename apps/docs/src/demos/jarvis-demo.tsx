import * as React from "react";
import {
  AgentCore,
  AgentRoster,
  BootSequence,
  CommandConsole,
  DataTicker,
  HudBackground,
  HudPanel,
  HudStat,
  RadialGauge,
  Waveform,
  cn,
  useAudioAnalyser,
  useMicrophone,
  type ConsoleLine,
  type CoreState,
} from "kestro-ui";
import { Activity, Mic, MicOff, Volume2, VolumeX, Zap } from "lucide-react";

const replies: [RegExp, string][] = [
  [/status|report/, "All systems nominal. 3 agents online, 12 tasks completed today, 2 awaiting your approval."],
  [/weather/, "Lisbon is 17°C and clear. Light showers expected Sunday afternoon — I'd pack a jacket."],
  [/schedule|calendar|meeting/, "You have 3 meetings today. Next up: design review at 14:00 with Maria and Chen."],
  [/scan|security/, "Scan complete. Zero threats across 14 devices. Firewall rules are up to date."],
  [/mail|inbox/, "Inbox triaged: 4 important, 11 newsletters archived, 2 drafts ready for your review."],
  [/hello|hi\b|hey/, "Hello. Systems are online — what can I do for you?"],
  [/help/, "Try: status · weather · schedule · scan · inbox. Or switch on the mic and talk to me."],
];

const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
let n = 0;
const id = () => `l${++n}`;

function useTelemetry() {
  const [t, setT] = React.useState({ cpu: 34, mem: 58, net: 22, latency: [120, 98, 110, 92, 101, 88, 95, 84, 90, 79], tasks: [4, 6, 5, 8, 7, 9, 12] });
  React.useEffect(() => {
    const iv = setInterval(() => {
      setT((p) => {
        const walk = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v + (Math.random() - 0.5) * 14));
        const nextLatency = Math.round(walk(p.latency[p.latency.length - 1], 60, 160));
        return { ...p, cpu: walk(p.cpu, 8, 95), mem: walk(p.mem, 30, 90), net: walk(p.net, 2, 80), latency: [...p.latency.slice(1), nextLatency] };
      });
    }, 1300);
    return () => clearInterval(iv);
  }, []);
  return t;
}

export function JarvisDemo() {
  const [booted, setBooted] = React.useState(() => window.location.hash.includes("noboot"));
  const [state, setState] = React.useState<CoreState>("idle");
  const [simLevel, setSimLevel] = React.useState(0);
  const [voice, setVoice] = React.useState(false);
  const [lines, setLines] = React.useState<ConsoleLine[]>([
    { id: id(), kind: "system", text: "Kestro agent console v1.0 — type 'help' to begin.", time: now() },
  ]);
  const mic = useMicrophone();
  const audio = useAudioAnalyser(mic.stream);
  const tel = useTelemetry();
  const speaking = React.useRef(false);

  const coreState: CoreState = state === "idle" && mic.active ? "listening" : state;
  const level = coreState === "listening" ? audio.level : simLevel;

  const speak = React.useCallback(
    (text: string) =>
      new Promise<void>((resolve) => {
        speaking.current = true;
        setState("speaking");
        let raf = 0;
        const start = performance.now();
        const tick = (t: number) => {
          const s = (t - start) / 1000;
          setSimLevel(0.35 + Math.abs(Math.sin(s * 9) * 0.4 + Math.sin(s * 17) * 0.2));
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        const done = () => {
          cancelAnimationFrame(raf);
          setSimLevel(0);
          speaking.current = false;
          setState("idle");
          resolve();
        };
        if (voice && "speechSynthesis" in window) {
          const u = new SpeechSynthesisUtterance(text);
          u.rate = 1.05;
          u.pitch = 0.9;
          u.onend = done;
          u.onerror = done;
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(u);
        } else {
          setTimeout(done, Math.min(5000, 600 + text.length * 32));
        }
      }),
    [voice],
  );

  const run = React.useCallback(
    async (cmd: string) => {
      setLines((l) => [...l, { id: id(), kind: "input", text: cmd, time: now() }]);
      setState("thinking");
      await new Promise((r) => setTimeout(r, 900));
      const match = replies.find(([re]) => re.test(cmd.toLowerCase()));
      if (!match) {
        setLines((l) => [...l, { id: id(), kind: "error", text: `Command not recognized: "${cmd}". Type 'help'.`, time: now() }]);
        setState("error");
        setTimeout(() => setState("idle"), 1200);
        return;
      }
      const lineId = id();
      setLines((l) => [...l, { id: lineId, kind: "output", text: match[1], time: now(), streaming: true }]);
      await speak(match[1]);
      setLines((l) => l.map((x) => (x.id === lineId ? { ...x, streaming: false } : x)));
    },
    [speak],
  );

  // `#/examples/jarvis?autoplay=<command>` runs a command after boot.
  const autoplayed = React.useRef(false);
  React.useEffect(() => {
    if (!booted || autoplayed.current) return;
    autoplayed.current = true; // StrictMode runs effects twice in dev
    const q = new URLSearchParams(window.location.hash.split("?")[1] ?? "").get("autoplay");
    if (q) run(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booted]);

  return (
    <div className="relative h-full min-h-[760px] overflow-hidden bg-kui-bg text-kui-fg">
      <HudBackground />

      <div className={cn("relative flex h-full flex-col gap-4 p-4 transition-all duration-1000 ease-kui-out", booted ? "opacity-100 blur-0" : "pointer-events-none scale-[0.98] opacity-0 blur-md")}>
        <DataTicker
          items={[
            "Agents online · 3",
            "Tasks today · 12",
            `Latency · ${tel.latency[tel.latency.length - 1]}ms`,
            "Approvals pending · 2",
            "Security · nominal",
            "Next meeting · 14:00 design review",
            "Lisbon · 17°C clear",
          ]}
        />

        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[300px_1fr_360px]">
          {/* left */}
          <div className="flex min-h-0 flex-col gap-4">
            <HudPanel title="Systems" code="SYS-01" scanlines>
              <div className="grid grid-cols-2 gap-2">
                <RadialGauge value={tel.cpu} label="CPU" unit="%" size={112} tone="auto" />
                <RadialGauge value={tel.mem} label="Memory" unit="%" size={112} />
                <RadialGauge value={tel.net} label="Network" unit="MB/s" size={112} tone="info" />
                <RadialGauge value={92} label="Confidence" unit="%" size={112} tone="success" />
              </div>
            </HudPanel>
            <HudPanel title="Telemetry" code="TLM-02" bodyClassName="space-y-4">
              <HudStat label="Response latency" icon={<Activity />} value={tel.latency[tel.latency.length - 1]} unit="ms" delta={-8.4} invertDelta data={tel.latency} />
              <HudStat label="Tasks completed" icon={<Zap />} value={12} delta={33.3} data={tel.tasks} />
            </HudPanel>
          </div>

          {/* center */}
          <div className="flex min-h-[460px] flex-col items-center justify-center gap-6">
            <AgentCore state={coreState} level={level} spectrum={coreState === "listening" ? audio.spectrum : undefined} size={340} label="Kestro" sublabel={coreState} />
            <Waveform level={level} active={coreState === "speaking" || coreState === "listening"} levels={coreState === "listening" ? audio.spectrum : undefined} className="max-w-md" height={40} />
            <div className="flex items-center gap-2">
              <button
                onClick={() => (mic.active ? mic.stop() : mic.start())}
                className={cn(
                  "flex h-10 cursor-pointer items-center gap-2 rounded-full border px-4 font-mono text-[11px] tracking-[0.15em] uppercase transition-all duration-300 ease-kui-out",
                  mic.active ? "border-kui-accent bg-kui-accent-soft text-kui-accent shadow-[0_0_24px_-6px_var(--kui-accent)]" : "border-kui-accent/30 text-kui-fg-muted hover:border-kui-accent hover:text-kui-fg",
                )}
              >
                {mic.active ? <Mic className="size-4" /> : <MicOff className="size-4" />}
                {mic.active ? "Listening" : "Enable mic"}
              </button>
              <button
                onClick={() => setVoice((v) => !v)}
                className={cn(
                  "flex h-10 cursor-pointer items-center gap-2 rounded-full border px-4 font-mono text-[11px] tracking-[0.15em] uppercase transition-all duration-300 ease-kui-out",
                  voice ? "border-kui-accent bg-kui-accent-soft text-kui-accent" : "border-kui-accent/30 text-kui-fg-muted hover:border-kui-accent hover:text-kui-fg",
                )}
              >
                {voice ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
                Voice replies
              </button>
            </div>
            {mic.error ? <p className="font-mono text-xs text-kui-danger">{mic.error}</p> : null}
          </div>

          {/* right */}
          <div className="flex min-h-0 flex-col gap-4">
            <HudPanel title="Agents" code="AGT-03">
              <AgentRoster
                agents={[
                  { id: "a", name: "Atlas", role: "Travel", state: "online", activity: "Watching flight prices" },
                  { id: "b", name: "Sentinel", role: "Security", state: "working", activity: "Monitoring 14 devices" },
                  { id: "c", name: "Ledger", role: "Finance", state: "waiting", activity: "2 payments need approval" },
                ]}
              />
            </HudPanel>
            <CommandConsole lines={lines} onCommand={run} title="Command · CMD-04" height={250} disabled={state === "thinking" || state === "speaking"} placeholder="status, weather, schedule, scan…" />
          </div>
        </div>
      </div>

      {!booted ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center p-6">
          <BootSequence
            interval={260}
            onComplete={() => setBooted(true)}
            steps={[
              "Loading neural core",
              "Calibrating voice interface",
              "Connecting agents: Atlas, Sentinel, Ledger",
              "Syncing calendar & inbox",
              "Establishing secure channel",
              "Rendering HUD",
            ]}
          />
        </div>
      ) : null}
    </div>
  );
}
