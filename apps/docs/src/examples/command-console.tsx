import { useEffect, useRef, useState } from "react";
import { CommandConsole, type ConsoleLine, type ConsoleLineKind } from "kestro-ui";

const now = () => new Date().toLocaleTimeString([], { hour12: false });

const responses: Record<string, { kind: ConsoleLineKind; text: string }> = {
  help: { kind: "output", text: "Available commands: status, scan, help, clear" },
  status: { kind: "success", text: "All systems nominal. Power 98% · 3 agents online · 0 alerts in the last hour." },
  scan: { kind: "warning", text: "Perimeter scan complete. 14 devices found — 1 unrecognized device on the guest network." },
};

export default function Example() {
  const [lines, setLines] = useState<ConsoleLine[]>([
    { id: "boot", kind: "system", text: "NOVA online. Type “help” to see what I can do.", time: now() },
  ]);
  const nextId = useRef(0);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const run = (command: string) => {
    const key = command.toLowerCase();
    if (key === "clear") {
      setLines([]);
      return;
    }
    const reply = responses[key] ?? {
      kind: "error" as const,
      text: `Unknown command “${command}”. Try “help”.`,
    };
    const id = String(nextId.current++);
    setLines((prev) => [
      ...prev,
      { id: `${id}-in`, kind: "input", text: command, time: now() },
      { id, ...reply, time: now(), streaming: true },
    ]);
    const timer = window.setTimeout(() => {
      setLines((prev) => prev.map((l) => (l.id === id ? { ...l, streaming: false } : l)));
    }, 400 + reply.text.length * 10);
    timers.current.push(timer);
  };

  return <CommandConsole className="w-full max-w-xl" title="Nova · shell" lines={lines} onCommand={run} />;
}
