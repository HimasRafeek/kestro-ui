import * as React from "react";
import {
  AgentChat,
  AgentQuestion,
  ConversationList,
  AgentAvatar,
  IconButton,
  UsageMeter,
  HandoffBanner,
} from "kestro-ui";
import {
  BookOpen,
  Code2,
  Globe,
  Headset,
  LineChart,
  PanelLeft,
  Plane,
  Share,
  Sparkles,
  Zap,
  Brain,
} from "lucide-react";
import { useSimulatedAgent, type Scenario } from "../lib/simulate";


/* ----------------------------- demo scenarios ----------------------------- */

const travel: Scenario = async (a) => {
  await a.reasoning(
    "The user wants a weekend in Lisbon. I should check flight options for Friday evening departures and Sunday returns, compare price vs. duration, then propose the best value option and ask before booking anything.\n\nI'll search flights first, then check the weather forecast so I can suggest what to pack.",
  );
  await a.tool("search_flights", { from: "LHR", to: "LIS", depart: "2026-11-27", return: "2026-11-29", adults: 1 }, { results: 14, cheapest: 118, currency: "GBP" }, { title: "Searching flights", ms: 1800 });
  a.data("flights", [
    { id: "f1", airline: "TAP Air Portugal", dep: "18:40", arr: "21:25", dur: "2h 45m", stops: "Direct", price: 142, tag: "Best value" },
    { id: "f2", airline: "British Airways", dep: "17:15", arr: "20:05", dur: "2h 50m", stops: "Direct", price: 168 },
    { id: "f3", airline: "easyJet", dep: "06:10", arr: "08:55", dur: "2h 45m", stops: "Direct", price: 118, tag: "Cheapest" },
  ]);
  await a.tool("get_weather", { city: "Lisbon", dates: "Nov 27–29" }, { high: "17°C", low: "11°C", summary: "Mostly sunny, light showers Sunday" }, { title: "Checking the forecast", ms: 900 });
  await a.text(
    "I found **14 flights** for your Lisbon weekend. The best balance of price and timing is **TAP Air Portugal at £142** — you leave after work on Friday and land in time for a late dinner in Alfama.\n\n**Forecast:** mostly sunny, 11–17°C, with light showers on Sunday, so bring a light jacket.\n\nShall I book the TAP flight for you?",
  );
  const ok = await a.approval("book_flight", { flight: "TP 1351 · LHR → LIS", date: "Fri, Nov 27 · 18:40", passenger: "Alex Morgan", total: "£142.00" });
  await a.text(
    ok
      ? "Done! ✈️ Your flight is **confirmed** — booking reference `QX7P2L`. I've added it to your calendar and emailed the e-ticket.\n\nWant me to find a hotel near **Chiado** or **Príncipe Real** next?"
      : "No problem — I haven't booked anything. Let me know if you'd like different times or a different airline.",
  );
};

const research: Scenario = async (a) => {
  await a.reasoning(
    "I need recent, credible data on how teams are adopting AI agents. Plan:\n1. Search for 2026 survey data\n2. Pull adoption rates by function\n3. Summarize with citations and a comparison table.",
  );
  await a.tool("web_search", { query: "AI agent adoption enterprise survey 2026", limit: 5 }, { results: 5 }, { title: "Searching the web", ms: 1500 });
  await a.tool("read_page", { url: "https://example.com/state-of-agents-2026" }, { words: 4210 }, { title: "Reading 3 sources", ms: 1200 });
  a.sources([
    { url: "https://example.com/state-of-agents-2026", title: "State of AI Agents 2026", snippet: "A survey of 1,200 companies on how they deploy autonomous agents in production." },
    { url: "https://research.example.org/agents-at-work", title: "Agents at Work: Field Study", snippet: "Support and operations teams report the highest time savings from agents." },
    { url: "https://news.example.net/agents-budget", title: "Budgets shift toward agentic AI", snippet: "Spending on agent platforms grew sharply year over year." },
  ]);
  await a.text(
    "## Key findings\n\nAgent adoption is now mainstream in customer-facing and operational teams [1]. The biggest gains come from **support** and **operations**, where agents resolve routine work end-to-end [2].\n\n| Function | Using agents | Top use case |\n|---|:---:|---|\n| Customer support | 64% | Ticket triage & resolution |\n| Operations | 51% | Back-office workflows |\n| Sales | 43% | Research & outreach |\n| Engineering | 58% | Code review & testing |\n\n### What this means\n- Start with **high-volume, well-defined** tasks\n- Keep a **human in the loop** for anything irreversible\n- Track _resolution rate_, not just usage [3]\n\nWant me to turn this into a one-page brief?",
  );
};

const support: Scenario = async (a) => {
  await a.tool("lookup_order", { order_id: "#4821" }, { status: "delivered", item: "Noise-cancelling headphones", delivered: "Nov 14", total: "$249.00" }, { title: "Looking up your order", ms: 1100 });
  await a.text("I found order **#4821** — *Noise-cancelling headphones*, delivered on Nov 14 for **$249.00**. It's still within the 30-day return window.");
  a.data("question", {
    question: "How would you like to resolve this?",
    options: [
      { id: "refund", label: "Full refund", description: "Back to your card in 3–5 days" },
      { id: "replace", label: "Replacement", description: "Ships free tomorrow" },
      { id: "credit", label: "Store credit", description: "$260 — includes a 5% bonus" },
      { id: "human", label: "Talk to a person", description: "Avg. wait ~2 min" },
    ],
  });
};

const supportFollowUp: Scenario = async (a, prompt) => {
  if (/person/i.test(prompt)) {
    a.data("handoff", { status: "connecting" });
    await a.text("I'm connecting you with a support specialist now. I've shared the order details so you won't need to repeat anything.");
    return;
  }
  await a.tool("create_return", { order_id: "#4821", resolution: prompt }, { rma: "RMA-20931", label: "emailed" }, { title: "Creating your return", ms: 1200 });
  await a.text(`All set! **${prompt}** is on its way. Your return reference is \`RMA-20931\` and a prepaid shipping label has been emailed to you. 📦`);
};

const coding: Scenario = async (a) => {
  await a.reasoning("A debounce hook needs a stable callback ref, a timer ref, and cleanup on unmount. I'll write it in TypeScript with generics.");
  await a.text(
    "Here's a small, type-safe `useDebounce` hook:\n\n```tsx\nimport { useEffect, useState } from \"react\";\n\nexport function useDebounce<T>(value: T, delay = 300): T {\n  const [debounced, setDebounced] = useState(value);\n\n  useEffect(() => {\n    // Reset the timer every time the value changes\n    const id = setTimeout(() => setDebounced(value), delay);\n    return () => clearTimeout(id);\n  }, [value, delay]);\n\n  return debounced;\n}\n```\n\nUse it like this:\n\n```tsx\nconst query = useDebounce(search, 400);\n```",
    { speed: 12 },
  );
};

export function pickScenario(prompt: string): Scenario {
  const p = prompt.toLowerCase();
  if (/(trip|flight|travel|lisbon|weekend|hotel)/.test(p)) return travel;
  if (/^(full refund|replacement|store credit|talk to a person)$/.test(p)) return supportFollowUp;
  if (/(refund|order|return|support|headphone)/.test(p)) return support;
  if (/(code|hook|react|function|debounce|bug)/.test(p)) return coding;
  return research;
}

/* --------------------------------- view ---------------------------------- */

const models = [
  { id: "auto", name: "Auto", description: "Picks the best model for each task", icon: <Sparkles /> },
  { id: "fast", name: "Fast", description: "Quick answers for everyday tasks", icon: <Zap />, badge: "Fast" },
  { id: "deep", name: "Deep Research", description: "Thinks longer, searches more sources", icon: <Brain />, badge: "New" },
];

const threads = [
  { id: "1", title: "Weekend in Lisbon", group: "Today", icon: <Plane /> },
  { id: "2", title: "Refund for order #4821", group: "Today", icon: <Headset />, unread: true },
  { id: "3", title: "AI agent adoption research", group: "Today", icon: <LineChart />, running: true },
  { id: "4", title: "Onboarding email sequence", group: "Yesterday", icon: <BookOpen /> },
  { id: "5", title: "useDebounce hook", group: "Yesterday", icon: <Code2 /> },
  { id: "6", title: "Compare CRM vendors", group: "Previous 7 days", icon: <Globe /> },
];

export function ChatDemo() {
  const agent = useSimulatedAgent(pickScenario);
  const [active, setActive] = React.useState("1");
  const [model, setModel] = React.useState("auto");
  const [sidebar, setSidebar] = React.useState(true);
  const [answered, setAnswered] = React.useState<Record<number, boolean>>({});

  // `#/examples/chat?autoplay=<prompt>` starts a conversation (used for screenshots & demos).
  const autoplayed = React.useRef(false);
  React.useEffect(() => {
    if (autoplayed.current) return;
    autoplayed.current = true; // StrictMode runs effects twice in dev
    const q = new URLSearchParams(window.location.hash.split("?")[1] ?? "").get("autoplay");
    if (q) agent.send(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-full min-h-0">
      {sidebar ? (
        <aside className="hidden w-72 shrink-0 border-r border-kui-border md:block">
          <ConversationList
            items={threads}
            activeId={active}
            onSelect={setActive}
            onNew={agent.reset}
            onDelete={() => {}}
            newLabel="New conversation"
            footer={
              <div className="flex items-center gap-3">
                <AgentAvatar variant="user" name="Alex Morgan" size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium">Alex Morgan</div>
                  <div className="text-xs text-kui-fg-subtle">Pro plan</div>
                </div>
                <UsageMeter variant="ring" used={12480} limit={32000} />
              </div>
            }
          />
        </aside>
      ) : null}
      <main className="flex min-w-0 flex-1 flex-col">
        <AgentChat
          messages={agent.messages}
          status={agent.status}
          onSend={(t) => agent.send(t)}
          onStop={agent.stop}
          onRegenerate={() => {}}
          onToolApproval={({ id, approved }) => agent.respondToApproval(id, approved)}
          agent={{ name: "Atlas", description: "Your everyday AI agent — research, travel, support & more" }}
          header={
            <div className="flex items-center gap-2">
              <IconButton label="Toggle sidebar" onClick={() => setSidebar((s) => !s)}>
                <PanelLeft />
              </IconButton>
              <div className="text-sm">
                <span className="text-kui-fg-subtle">Atlas / </span>
                <span className="font-medium">{threads.find((t) => t.id === active)?.title}</span>
              </div>
              <div className="ml-auto">
                <IconButton label="Share">
                  <Share />
                </IconButton>
              </div>
            </div>
          }
          models={models}
          model={model}
          onModelChange={setModel}
          toolTitles={{ book_flight: "Book this flight" }}
          welcome={{ title: "What can I do for you?", description: "Atlas can plan trips, research topics, sort out orders and write code — with your approval at every important step." }}
          suggestions={[
            { label: "Plan a weekend in Lisbon", description: "Flights, weather & booking", icon: <Plane />, value: "Plan a weekend trip to Lisbon next Friday" },
            { label: "Research AI agent adoption", description: "With sources & a summary table", icon: <LineChart /> },
            { label: "Get a refund for my order", description: "Order #4821 · headphones", icon: <Headset />, value: "I want a refund for order #4821" },
            { label: "Write a useDebounce hook", description: "TypeScript + React", icon: <Code2 /> },
          ]}
          followUps={agent.messages.length ? ["Make it shorter", "Turn this into a brief", "What should I do next?"] : undefined}
          renderData={(part) => {
            if (part.type === "data-flights") {
              const flights = part.data as { id: string; airline: string; dep: string; arr: string; dur: string; stops: string; price: number; tag?: string }[];
              return (
                <div className="grid gap-2 sm:grid-cols-3">
                  {flights.map((f) => (
                    <div key={f.id} className="rounded-kui border border-kui-border bg-kui-surface p-3 transition-colors hover:border-kui-border-strong">
                      <div className="flex items-center justify-between text-xs text-kui-fg-subtle">
                        <span className="truncate">{f.airline}</span>
                        {f.tag ? <span className="rounded-full bg-kui-accent-soft px-1.5 py-px text-[10px] font-semibold text-kui-accent">{f.tag}</span> : null}
                      </div>
                      <div className="mt-2 flex items-baseline gap-1.5 font-semibold tabular-nums">
                        {f.dep} <span className="text-xs font-normal text-kui-fg-subtle">→</span> {f.arr}
                      </div>
                      <div className="text-xs text-kui-fg-subtle">{f.dur} · {f.stops}</div>
                      <div className="mt-2 text-lg font-semibold">£{f.price}</div>
                    </div>
                  ))}
                </div>
              );
            }
            if (part.type === "data-handoff") return <HandoffBanner status="connecting" eta="~2 min" />;
            if (part.type === "data-question") {
              const q = part.data as { question: string; options: { id: string; label: string; description: string }[] };
              const key = agent.messages.length;
              return (
                <AgentQuestion
                  question={q.question}
                  options={q.options}
                  answered={answered[key]}
                  onSubmit={({ optionIds }) => {
                    setAnswered((s) => ({ ...s, [key]: true }));
                    const label = q.options.find((o) => o.id === optionIds[0])?.label ?? "";
                    agent.send(label);
                  }}
                />
              );
            }
            return null;
          }}
        />
      </main>
    </div>
  );
}
