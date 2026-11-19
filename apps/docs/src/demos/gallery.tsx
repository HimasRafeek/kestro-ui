import * as React from "react";
import {
  AgentAvatar,
  AgentHandoff,
  AgentHeader,
  AgentQuestion,
  Attachment,
  Badge,
  Button,
  CodeBlock,
  EmptyState,
  HandoffBanner,
  Message,
  MessageActions,
  ModelSelector,
  PromptInput,
  Reasoning,
  SourceChip,
  Sources,
  Suggestions,
  ToolApproval,
  ToolCall,
  TypingIndicator,
  UsageMeter,
  VoiceOrb,
  VoiceWave,
  ShimmerText,
  type Feedback,
} from "kestro-ui";
import { Brain, Code2, Plane, Search, Sparkles, Zap, CreditCard, Utensils, Hotel, MapPin } from "lucide-react";

function Tile({ title, code, children, className }: { title: string; code: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`flex flex-col rounded-kui-lg border border-kui-border bg-kui-surface ${className ?? ""}`}>
      <header className="flex items-center justify-between gap-3 border-b border-kui-border px-4 py-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        <code className="truncate font-mono text-[11px] text-kui-fg-subtle">{code}</code>
      </header>
      <div className="flex flex-1 flex-col gap-3 p-4">{children}</div>
    </section>
  );
}

const sources = [
  { url: "https://www.visitlisboa.com/en", title: "Visit Lisboa — Official guide", snippet: "Neighbourhoods, events and transport tips for Lisbon." },
  { url: "https://en.wikipedia.org/wiki/Alfama", title: "Alfama — Wikipedia", snippet: "The oldest district of Lisbon, spreading on the slope between the castle and the Tagus." },
  { url: "https://www.timeout.com/lisbon", title: "Time Out Lisbon" },
];

export function Gallery() {
  const [feedback, setFeedback] = React.useState<Feedback>(null);
  const [model, setModel] = React.useState("auto");
  return (
    <div className="kui-scrollbar h-full overflow-y-auto">
      <div className="mx-auto max-w-7xl p-4 sm:p-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Components</h1>
            <p className="mt-1 text-kui-fg-muted">Building blocks for any AI agent: chat, support, research, voice, workflows.</p>
          </div>
          <Badge tone="accent">40+ components · React + Tailwind v4</Badge>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <Tile title="Messages" code="<Message from>">
            <Message from="user">Find a quiet café near Alfama</Message>
            <Message from="assistant" name="Atlas" actions={<MessageActions copyText="…" feedback={feedback} onFeedback={setFeedback} onRegenerate={() => {}} alwaysVisible />}>
              <p className="text-[15px] leading-7">
                Try <b>Café da Garagem</b>: river views, calm after 3pm <SourceChip source={sources[0]} index={1} className="ml-1 align-middle" />
              </p>
            </Message>
          </Tile>

          <Tile title="Tool calls" code="<ToolCall status>">
            <ToolCall name="search_hotels" status="pending" input={{ city: "Lisbon" }} />
            <ToolCall name="web_search" title="Searching the web" status="running" input={{ query: "best pastéis de nata" }} />
            <ToolCall name="get_weather" status="success" durationMs={820} input={{ city: "Lisbon" }} output={{ high: "17°C", summary: "Sunny" }} defaultOpen={false} />
            <ToolCall name="charge_card" status="error" input={{ amount: 142 }} error="Card declined: insufficient funds" onRetry={() => {}} />
          </Tile>

          <Tile title="Reasoning" code="<Reasoning streaming>">
            <Reasoning streaming content={"Comparing three itineraries…\nChecking opening hours for the castle"} />
            <Reasoning duration={4.2} content={"The user prefers quiet places, so I filtered out tourist hotspots and ranked by reviews mentioning *calm* or *quiet*."} />
            <Reasoning variant="inline" duration={12} content="Inline variant for minimal layouts." />
          </Tile>

          <Tile title="Approval (human-in-the-loop)" code="<ToolApproval>" className="md:col-span-2 xl:col-span-1">
            <ToolApproval
              title="Pay €86.00 for 2 museum tickets?"
              description="Charged to your saved Visa ending 4242."
              icon={<CreditCard />}
              details={[
                { label: "Merchant", value: "Museu Nacional do Azulejo" },
                { label: "Date", value: "Sat, Nov 28 · 10:30" },
              ]}
            />
          </Tile>

          <Tile title="Agent asks a question" code="<AgentQuestion>">
            <AgentQuestion
              question="What kind of dinner are you in the mood for?"
              multiple
              allowCustom
              options={[
                { id: "a", label: "Seafood", icon: <Utensils /> },
                { id: "b", label: "Fado & dinner", icon: <Sparkles /> },
                { id: "c", label: "Rooftop", icon: <Hotel /> },
                { id: "d", label: "Near my hotel", icon: <MapPin /> },
              ]}
            />
          </Tile>

          <Tile title="Sources & citations" code="<Sources> <SourceChip>">
            <Sources sources={sources} defaultOpen />
            <div className="flex flex-wrap gap-2">
              <SourceChip source={sources[0]} index={1} />
              <SourceChip source={sources[1]} />
            </div>
          </Tile>

          <Tile title="Prompt input" code="<PromptInput>" className="md:col-span-2">
            <PromptInput
              hint={false}
              placeholder="Ask anything…"
              toolbar={
                <ModelSelector
                  value={model}
                  onValueChange={setModel}
                  label="Mode"
                  models={[
                    { id: "auto", name: "Auto", description: "Best for most tasks", icon: <Sparkles /> },
                    { id: "fast", name: "Fast", description: "Instant answers", icon: <Zap />, badge: "Fast" },
                    { id: "think", name: "Think deeper", description: "Reasoning for hard problems", icon: <Brain /> },
                  ]}
                />
              }
              onVoice={() => {}}
            />
            <Suggestions suggestions={[{ label: "Plan a trip", icon: <Plane /> }, { label: "Research a topic", icon: <Search /> }, { label: "Write code", icon: <Code2 /> }]} />
          </Tile>

          <Tile title="Attachments" code="<Attachment>">
            <Attachment attachment={{ id: "1", name: "itinerary.pdf", size: 2_400_000 }} onRemove={() => {}} />
            <Attachment attachment={{ id: "2", name: "budget.csv", size: 84_000 }} onRemove={() => {}} />
            <Attachment attachment={{ id: "3", name: "passport-scan.png", size: 1_200_000, progress: 62 }} onRemove={() => {}} />
            <Attachment attachment={{ id: "4", name: "video.mov", error: "File too large (max 25 MB)" }} onRemove={() => {}} />
          </Tile>

          <Tile title="Presence & status" code="<AgentAvatar state>">
            <div className="flex items-center justify-around py-2">
              {(["online", "working", "waiting", "error", "offline"] as const).map((s) => (
                <div key={s} className="flex flex-col items-center gap-2">
                  <AgentAvatar size="md" state={s} />
                  <span className="text-xs text-kui-fg-subtle capitalize">{s}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 rounded-kui-sm border border-kui-border px-3 py-2">
              <TypingIndicator label="Atlas is typing" />
              <VoiceWave className="ml-auto" />
            </div>
            <AgentHeader name="Atlas" description="Travel & research agent" state="working" stateLabel="Searching flights" />
          </Tile>

          <Tile title="Multi-agent & human handoff" code="<AgentHandoff> <HandoffBanner>">
            <AgentHandoff from={{ name: "Planner" }} to={{ name: "Booker", avatar: { icon: <Plane /> } }} reason="ready to book" />
            <HandoffBanner status="connecting" eta="~2 min" onCancel={() => {}} />
            <HandoffBanner status="connected" agentName="Maria" />
          </Tile>

          <Tile title="Usage" code="<UsageMeter variant>">
            <UsageMeter used={12480} limit={32000} input={9840} output={2640} cost={0.046} />
            <UsageMeter variant="bar" used={27900} limit={32000} />
            <div className="flex items-center gap-4 text-sm text-kui-fg-muted">
              Compact ring: <UsageMeter variant="ring" used={30500} limit={32000} />
            </div>
          </Tile>

          <Tile title="Code block" code="<CodeBlock>" className="md:col-span-2">
            <CodeBlock
              filename="agent.ts"
              language="ts"
              showLineNumbers
              code={`import { AgentChat } from "kestro-ui";\n\n// Works with any backend: AI SDK, LangGraph, your own SSE\nexport function App() {\n  const { messages, status, sendMessage } = useChat();\n  return <AgentChat messages={messages} status={status} onSend={(text) => sendMessage({ text })} />;\n}`}
            />
          </Tile>

          <Tile title="Voice orb" code="<VoiceOrb state>">
            <div className="flex flex-1 items-center justify-around py-4">
              <div className="flex flex-col items-center gap-3">
                <VoiceOrb state="idle" size={84} />
                <span className="text-xs text-kui-fg-subtle">Idle</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <VoiceOrb state="thinking" size={84} />
                <ShimmerText className="text-xs">Thinking</ShimmerText>
              </div>
            </div>
          </Tile>

          <Tile title="Empty state" code="<EmptyState>" className="md:col-span-2">
            <EmptyState title="What will you build?" description="Start a conversation with your agent." className="py-4">
              <Suggestions suggestions={["Summarize my inbox", "Plan a team offsite", "Analyze this CSV"]} className="justify-center" />
            </EmptyState>
          </Tile>

          <Tile title="Buttons & badges" code="<Button> <Badge>">
            <div className="flex flex-wrap gap-2">
              <Button variant="accent">Accent</Button>
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge>Neutral</Badge>
              <Badge tone="accent" dot pulse>Running</Badge>
              <Badge tone="success">Success</Badge>
              <Badge tone="warning">Needs approval</Badge>
              <Badge tone="danger">Error</Badge>
              <Badge tone="info">Info</Badge>
            </div>
          </Tile>
        </div>
      </div>
    </div>
  );
}
