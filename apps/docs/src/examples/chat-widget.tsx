import { useEffect, useRef, useState } from "react";
import { AgentChat, ChatWidget, type ChatMessage, type ChatStatus } from "kestro-ui";
import { Package, RotateCcw, Ruler } from "lucide-react";

function reply(text: string) {
  const q = text.toLowerCase();
  if (q.includes("order")) return "Your order **#4821** shipped yesterday with UPS and should arrive **Thursday**. Want the tracking link?";
  if (q.includes("return")) return "Returns are free within **30 days**. I can start a return for you now — which item is it?";
  if (q.includes("size")) return "Our Trail Runner 2 fits true to size. If you're between sizes, go **half a size up**.";
  return "Happy to help! I can track orders, start returns, or help you find the right size.";
}

export default function Example() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>("ready");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const send = (text: string) => {
    const id = String(Date.now());
    setMessages((m) => [...m, { id: `${id}-u`, role: "user", content: text }]);
    setStatus("submitted");
    timer.current = window.setTimeout(() => {
      setMessages((m) => [...m, { id, role: "assistant", content: reply(text) }]);
      setStatus("ready");
    }, 900);
  };

  return (
    <div className="relative h-[560px] w-full max-w-2xl overflow-hidden rounded-kui border border-kui-border bg-kui-surface">
      <header className="flex items-center gap-6 border-b border-kui-border px-6 py-4 text-sm">
        <span className="font-semibold text-kui-fg">Trailhead</span>
        <nav className="flex gap-4 text-kui-fg-muted">
          <span>Shoes</span>
          <span>Apparel</span>
          <span>Sale</span>
        </nav>
      </header>
      <div className="space-y-3 px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight text-kui-fg">Built for the long way round.</h1>
        <p className="max-w-sm text-kui-fg-muted">Lightweight trail gear, tested on 4,000 miles of switchbacks.</p>
        <div className="grid grid-cols-3 gap-3 pt-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-kui bg-kui-surface-3" />
          ))}
        </div>
      </div>

      <ChatWidget contained width={340} height={430} title="Trailhead Support" subtitle="AI assistant · replies instantly" greeting="Need help with an order or sizing?">
        <AgentChat
          compact
          messages={messages}
          status={status}
          onSend={send}
          allowAttachments={false}
          agent={{ name: "Trailhead Support", description: "Ask about orders, returns and sizing." }}
          suggestions={[
            { label: "Where's my order?", icon: <Package /> },
            { label: "Start a return", icon: <RotateCcw /> },
            { label: "Size advice", icon: <Ruler /> },
          ]}
        />
      </ChatWidget>
    </div>
  );
}
