import { useState } from "react";
import { Button, HandoffBanner, type HandoffBannerProps } from "kestro-ui";

const statuses: HandoffBannerProps["status"][] = ["requested", "connecting", "connected", "ended"];

export default function Example() {
  const [status, setStatus] = useState<HandoffBannerProps["status"]>("requested");

  return (
    <div className="w-full max-w-xl space-y-4">
      <HandoffBanner status={status} agentName="Maya from Support" eta="~2 min" onCancel={() => setStatus("ended")} />
      <div className="flex flex-wrap gap-2">
        {statuses.map((s) => (
          <Button key={s} size="xs" variant={s === status ? "secondary" : "ghost"} onClick={() => setStatus(s)}>
            {s}
          </Button>
        ))}
      </div>
    </div>
  );
}
