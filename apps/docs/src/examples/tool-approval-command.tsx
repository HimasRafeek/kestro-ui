import { useState } from "react";
import { ToolApproval, type ApprovalStatus } from "kestro-ui";
import { Trash2 } from "lucide-react";

export default function Example() {
  const [cleanup, setCleanup] = useState<ApprovalStatus>("pending");
  const [shell, setShell] = useState<ApprovalStatus>("pending");

  return (
    <div className="w-full max-w-xl space-y-4">
      <ToolApproval
        risk="high"
        icon={<Trash2 />}
        title="Delete 1,204 CRM records?"
        description="These contacts haven't been active in 2 years. This can't be undone."
        details={[
          { label: "Object", value: "Contacts" },
          { label: "Filter", value: "last_activity < 2024-11-01" },
          { label: "Records", value: "1,204" },
        ]}
        rememberLabel={false}
        approveLabel="Delete records"
        status={cleanup}
        onApprove={() => setCleanup("approved")}
        onDeny={() => setCleanup("denied")}
      />

      <ToolApproval
        risk="high"
        title="Run shell command?"
        description="The ops agent wants to restart the payments service on production."
        command="kubectl rollout restart deployment/payments -n prod"
        status={shell}
        onApprove={() => setShell("approved")}
        onDeny={() => setShell("denied")}
      />
    </div>
  );
}
