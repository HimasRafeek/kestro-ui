import * as React from "react";
import type { ChatMessage, ChatMessagePart, ChatStatus, ToolPart } from "kestro-ui";

/**
 * A tiny fake "agent backend" for the playground. In a real app you'd use
 * the Vercel AI SDK's useChat(), LangGraph, your own SSE stream, etc. —
 * the components only care about the `messages` + `status` shape.
 */

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let seq = 0;
const uid = (p = "m") => `${p}-${Date.now().toString(36)}-${++seq}`;

export interface ScenarioCtl {
  reasoning(text: string, opts?: { speed?: number }): Promise<void>;
  tool(name: string, input: unknown, output: unknown, opts?: { ms?: number; title?: string; error?: string }): Promise<void>;
  approval(name: string, input: Record<string, unknown>): Promise<boolean>;
  text(markdown: string, opts?: { speed?: number }): Promise<void>;
  sources(list: { url: string; title?: string; snippet?: string }[]): void;
  data(name: string, data: unknown): void;
  wait(ms: number): Promise<void>;
}

export type Scenario = (ctl: ScenarioCtl, prompt: string) => Promise<void>;

export function useSimulatedAgent(pick: (prompt: string) => Scenario, initial: ChatMessage[] = []) {
  const [messages, setMessages] = React.useState<ChatMessage[]>(initial);
  const [status, setStatus] = React.useState<ChatStatus>("ready");
  const abort = React.useRef(false);
  const approvals = React.useRef(new Map<string, (ok: boolean) => void>());

  const patch = (id: string, fn: (parts: ChatMessagePart[]) => ChatMessagePart[]) =>
    setMessages((ms) => ms.map((m) => (m.id === id ? { ...m, parts: fn(m.parts ?? []) } : m)));

  const send = React.useCallback(async (text: string) => {
    abort.current = false;
    const userMsg: ChatMessage = { id: uid("u"), role: "user", parts: [{ type: "text", text }] };
    setMessages((ms) => [...ms, userMsg]);
    setStatus("submitted");
    await sleep(700);
    const id = uid("a");
    setMessages((ms) => [...ms, { id, role: "assistant", parts: [] }]);
    setStatus("streaming");

    const stopped = () => abort.current;

    const streamInto = async (kind: "text" | "reasoning", full: string, speed: number) => {
      let idx = -1;
      patch(id, (p) => {
        idx = p.length;
        return [...p, { type: kind, text: "", state: "streaming" } as ChatMessagePart];
      });
      const tokens = full.match(/\S+\s*|\s+/g) ?? [];
      let acc = "";
      for (let i = 0; i < tokens.length; i++) {
        if (stopped()) break;
        acc += tokens[i];
        const snapshot = acc;
        patch(id, (p) => p.map((x, j) => (j === idx ? ({ ...x, text: snapshot } as ChatMessagePart) : x)));
        await sleep(speed + Math.random() * speed);
      }
      patch(id, (p) => p.map((x, j) => (j === idx ? ({ ...x, state: "done" } as ChatMessagePart) : x)));
    };

    const ctl: ScenarioCtl = {
      reasoning: (t, o) => streamInto("reasoning", t, o?.speed ?? 18),
      text: (t, o) => streamInto("text", t, o?.speed ?? 22),
      async tool(name, input, output, o) {
        if (stopped()) return;
        const toolCallId = uid("call");
        const started = Date.now();
        patch(id, (p) => [...p, { type: `tool-${name}`, toolCallId, state: "input-available", input, title: o?.title } as ToolPart]);
        await sleep(o?.ms ?? 1400);
        patch(id, (p) =>
          p.map((x) =>
            (x as ToolPart).toolCallId === toolCallId
              ? ({
                  ...x,
                  state: o?.error ? "output-error" : "output-available",
                  output: o?.error ? undefined : output,
                  errorText: o?.error,
                  durationMs: Date.now() - started,
                } as ToolPart)
              : x,
          ),
        );
      },
      approval(name, input) {
        const toolCallId = uid("call");
        patch(id, (p) => [...p, { type: `tool-${name}`, toolCallId, state: "approval-requested", input, approval: { id: toolCallId } } as ToolPart]);
        setStatus("ready");
        return new Promise<boolean>((resolve) => {
          approvals.current.set(toolCallId, (ok) => {
            setStatus("streaming");
            patch(id, (p) =>
              p.map((x) =>
                (x as ToolPart).toolCallId === toolCallId
                  ? ({ ...x, state: ok ? "output-available" : "output-denied", output: ok ? { status: "confirmed" } : undefined } as ToolPart)
                  : x,
              ),
            );
            resolve(ok);
          });
        });
      },
      sources(list) {
        patch(id, (p) => [...p, ...list.map((s) => ({ type: "source-url" as const, url: s.url, title: s.title, snippet: s.snippet }))]);
      },
      data(name, data) {
        patch(id, (p) => [...p, { type: `data-${name}`, data } as ChatMessagePart]);
      },
      wait: (ms) => sleep(ms).then(() => undefined),
    };

    try {
      await pick(text)(ctl, text);
    } finally {
      setStatus("ready");
    }
  }, [pick]);

  const stop = React.useCallback(() => {
    abort.current = true;
    setStatus("ready");
  }, []);

  const respondToApproval = React.useCallback((callId: string, approved: boolean) => {
    approvals.current.get(callId)?.(approved);
    approvals.current.delete(callId);
  }, []);

  const reset = React.useCallback(() => {
    abort.current = true;
    setMessages([]);
    setStatus("ready");
  }, []);

  return { messages, setMessages, status, send, stop, respondToApproval, reset };
}
