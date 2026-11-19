import { AgentHeader, Button, IconButton } from "kestro-ui";
import { Ellipsis, Headset, Phone, Plane, Search, Settings, Share2 } from "lucide-react";

export default function Example() {
  return (
    <div className="w-full max-w-xl divide-y divide-kui-border rounded-kui border border-kui-border bg-kui-surface">
      <AgentHeader
        className="p-4"
        name="Atlas"
        description="Travel concierge · books flights, hotels and dinners"
        state="online"
        avatar={{ icon: <Plane /> }}
        actions={
          <>
            <IconButton label="Share">
              <Share2 />
            </IconButton>
            <IconButton label="More">
              <Ellipsis />
            </IconButton>
          </>
        }
      />
      <AgentHeader
        className="p-4"
        name="Scout"
        description="Researching competitor pricing across 14 sites"
        state="working"
        stateLabel="Researching"
        avatar={{ icon: <Search /> }}
        actions={
          <Button size="sm" variant="outline">
            Stop
          </Button>
        }
      />
      <AgentHeader
        className="p-4"
        name="Nova Support"
        description="Waiting for you to confirm the refund"
        state="waiting"
        avatar={{ icon: <Headset /> }}
        actions={
          <>
            <IconButton label="Call">
              <Phone />
            </IconButton>
            <Button size="sm" variant="accent">
              Review
            </Button>
          </>
        }
      />
      <AgentHeader
        className="p-4"
        name="Ops Runner"
        description="Lost connection to the deployment cluster"
        state="error"
        actions={
          <IconButton label="Settings">
            <Settings />
          </IconButton>
        }
      />
    </div>
  );
}
