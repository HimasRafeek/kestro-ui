import { AgentAvatar, type AgentState } from "kestro-ui";
import { Bot, Headset, Plane } from "lucide-react";

const states: AgentState[] = ["idle", "online", "thinking", "working", "waiting", "error", "offline"];

export default function Example() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-8">
      <div className="flex items-end gap-4">
        <AgentAvatar size="xs" name="Atlas" />
        <AgentAvatar size="sm" name="Atlas" />
        <AgentAvatar size="md" name="Atlas" />
        <AgentAvatar size="lg" name="Atlas" />
      </div>

      <div className="flex flex-wrap gap-5">
        {states.map((state) => (
          <div key={state} className="flex flex-col items-center gap-2">
            <AgentAvatar size="md" name="Atlas" state={state} />
            <span className="text-xs text-kui-fg-subtle capitalize">{state}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <AgentAvatar size="md" variant="user" name="Maya Chen" state="online" />
        <AgentAvatar size="md" variant="user" name="Diego Ramírez" />
        <AgentAvatar size="md" name="Travel" icon={<Plane />} state="working" />
        <AgentAvatar size="md" name="Support" icon={<Headset />} state="waiting" />
        <AgentAvatar size="md" name="Ops" icon={<Bot />} />
        <AgentAvatar size="md" name="Research Lab" initials />
      </div>
    </div>
  );
}
