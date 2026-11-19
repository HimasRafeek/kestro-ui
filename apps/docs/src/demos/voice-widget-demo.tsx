import * as React from "react";
import { AgentChat, AgentQuestion, Button, ChatWidget, HandoffBanner, VoicePanel, type VoiceState } from "kestro-ui";
import { Headset, Package, RotateCcw, ShoppingBag, Truck } from "lucide-react";
import { useSimulatedAgent } from "../lib/simulate";
import { pickScenario } from "./chat-demo";

const script: { state: VoiceState; text: string; ms: number }[] = [
  { state: "connecting", text: "", ms: 1400 },
  { state: "speaking", text: "Hi! I'm Nova. What would you like to cook tonight?", ms: 3200 },
  { state: "listening", text: "“Something quick with salmon and whatever greens I have…”", ms: 3600 },
  { state: "thinking", text: "", ms: 1800 },
  { state: "speaking", text: "Try a 15-minute miso-glazed salmon with garlicky greens. Want me to read you the steps?", ms: 4200 },
  { state: "listening", text: "", ms: 3000 },
];

function VoiceDemo() {
  const [running, setRunning] = React.useState(false);
  const [i, setI] = React.useState(0);
  const [level, setLevel] = React.useState(0);
  const [muted, setMuted] = React.useState(false);
  const [elapsed, setElapsed] = React.useState(0);
  const cur = running ? script[i] : { state: "idle" as VoiceState, text: "Start a call to talk to Nova, a cooking assistant." };

  React.useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => setI((x) => (x + 1) % script.length || 1), script[i].ms);
    return () => clearTimeout(t);
  }, [running, i]);

  React.useEffect(() => {
    if (!running) return;
    let raf = 0;
    const tick = () => {
      const t = performance.now() / 1000;
      const active = cur.state === "speaking" || (cur.state === "listening" && !muted);
      setLevel(active ? Math.abs(Math.sin(t * 7) * 0.5 + Math.sin(t * 13) * 0.3) : 0);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const sec = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(sec);
    };
  }, [running, cur.state, muted]);

  return (
    <div className="flex h-full flex-col items-center justify-center rounded-kui-lg border border-kui-border bg-kui-surface p-6">
      <VoicePanel
        name="Nova"
        state={cur.state}
        level={level}
        transcript={cur.text}
        muted={muted}
        elapsed={running ? elapsed : undefined}
        onToggleMute={running ? () => setMuted((m) => !m) : undefined}
        onEnd={
          running
            ? () => {
                setRunning(false);
                setI(0);
                setElapsed(0);
              }
            : undefined
        }
      />
      {!running ? (
        <Button variant="accent" size="lg" onClick={() => setRunning(true)} className="rounded-full px-6">
          Start voice call
        </Button>
      ) : null}
    </div>
  );
}

function SupportChat() {
  const agent = useSimulatedAgent(pickScenario);
  const [answered, setAnswered] = React.useState(false);
  return (
    <AgentChat
      compact
      messages={agent.messages}
      status={agent.status}
      onSend={(t) => agent.send(t)}
      onStop={agent.stop}
      onToolApproval={({ id, approved }) => agent.respondToApproval(id, approved)}
      agent={{ name: "Northwind Support", description: "Ask about orders, returns and delivery." }}
      welcome={{ title: "Hi there 👋", description: "I can track orders, start returns and answer product questions." }}
      suggestions={[
        { label: "Refund order #4821", icon: <RotateCcw />, value: "I want a refund for order #4821" },
        { label: "Where's my package?", icon: <Truck />, value: "Where is my order #4821?" },
        { label: "Talk to a person", icon: <Headset />, value: "Talk to a person" },
      ]}
      placeholder="Ask about your order…"
      allowAttachments={false}
      renderData={(part) => {
        if (part.type === "data-handoff") return <HandoffBanner status="connecting" eta="~2 min" />;
        if (part.type === "data-question") {
          const q = part.data as { question: string; options: { id: string; label: string; description: string }[] };
          return (
            <AgentQuestion
              question={q.question}
              options={q.options}
              answered={answered}
              className="[&_[role=radiogroup]]:grid-cols-1"
              onSubmit={({ optionIds }) => {
                setAnswered(true);
                agent.send(q.options.find((o) => o.id === optionIds[0])?.label ?? "");
              }}
            />
          );
        }
        return null;
      }}
    />
  );
}

export function VoiceWidgetDemo() {
  return (
    <div className="grid h-full min-h-0 gap-4 overflow-y-auto p-4 lg:grid-cols-2 lg:overflow-hidden">
      <div className="flex min-h-[560px] flex-col gap-3">
        <div>
          <h2 className="text-lg font-semibold">Voice agent</h2>
          <p className="text-sm text-kui-fg-subtle">
            <code className="text-kui-fg-muted">&lt;VoicePanel/&gt;</code> + <code className="text-kui-fg-muted">&lt;VoiceOrb/&gt;</code> react to state and live audio level.
          </p>
        </div>
        <div className="min-h-0 flex-1">
          <VoiceDemo />
        </div>
      </div>

      <div className="flex min-h-[640px] flex-col gap-3">
        <div>
          <h2 className="text-lg font-semibold">Embeddable support widget</h2>
          <p className="text-sm text-kui-fg-subtle">
            <code className="text-kui-fg-muted">&lt;ChatWidget&gt;&lt;AgentChat compact/&gt;&lt;/ChatWidget&gt;</code>: drop an agent onto any website.
          </p>
        </div>
        {/* mock website */}
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-kui-lg border border-kui-border bg-kui-surface">
          <div className="flex items-center gap-2 border-b border-kui-border px-5 py-3">
            <ShoppingBag className="size-5 text-kui-accent" />
            <span className="font-semibold">Northwind</span>
            <div className="ml-auto hidden gap-5 text-sm text-kui-fg-muted sm:flex">
              <span>Shop</span>
              <span>Orders</span>
              <span>Help</span>
            </div>
          </div>
          <div className="space-y-4 p-6 opacity-70">
            <div className="h-36 rounded-kui bg-gradient-to-br from-kui-accent/30 to-kui-surface-3" />
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="flex aspect-square items-center justify-center rounded-kui bg-kui-surface-2">
                    <Package className="size-8 text-kui-fg-subtle" />
                  </div>
                  <div className="h-2.5 w-3/4 rounded bg-kui-surface-3" />
                  <div className="h-2.5 w-1/3 rounded bg-kui-surface-3" />
                </div>
              ))}
            </div>
          </div>
          <ChatWidget
            contained
            title="Northwind Support"
            subtitle="AI assistant · humans on standby"
            greeting="Need help with an order? I can sort it out in seconds."
            width={380}
            height={560}
          >
            <SupportChat />
          </ChatWidget>
        </div>
      </div>
    </div>
  );
}
