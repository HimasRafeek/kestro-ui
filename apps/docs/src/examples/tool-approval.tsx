import { useState } from "react";
import { Button, ToolApproval, type ApprovalStatus } from "kestro-ui";
import { Plane, RotateCcw } from "lucide-react";

export default function Example() {
  const [status, setStatus] = useState<ApprovalStatus>("pending");

  return (
    <div className="w-full max-w-xl space-y-3">
      <ToolApproval
        icon={<Plane />}
        title="Book this flight for $412?"
        description="Atlas found a nonstop that matches your preferences and will charge your saved card."
        details={[
          { label: "Flight", value: "TAP 202 · JFK → LIS" },
          { label: "Departs", value: "Fri, Dec 12 · 7:45 PM" },
          { label: "Seat", value: "14A (window)" },
          { label: "Payment", value: "Visa •••• 4242" },
          { label: "Total", value: "$412.60" },
        ]}
        status={status}
        approveLabel="Book for $412.60"
        onApprove={() => setStatus("approved")}
        onDeny={() => setStatus("denied")}
      />
      {status !== "pending" ? (
        <Button variant="ghost" size="xs" onClick={() => setStatus("pending")}>
          <RotateCcw /> Reset
        </Button>
      ) : null}
    </div>
  );
}
