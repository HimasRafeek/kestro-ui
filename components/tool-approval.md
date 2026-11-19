# ToolApproval

> Category: Human in the loop · Package: `kestro-ui`

Ask the user before the agent acts: payments, emails, bookings, deletions, shell commands. Supports details, previews, risk levels and 'remember' choice.

## Import

```tsx
import { ToolApproval } from "kestro-ui";
```

## Example: tool-approval

```tsx
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
```

## Example: tool-approval-command

```tsx
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
```

## API

### <ToolApproval />

Human-in-the-loop confirmation for any agent action.

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` **(required)** | `ReactNode` | — | e.g. "Send this email to 3 recipients?", "Book flight for $412?", "Run shell command?" |
| `description` | `ReactNode` | — |  |
| `icon` | `ReactNode` | — |  |
| `risk` | `"low" \| "medium" \| "high"` | `"medium"` |  |
| `details` | `ApprovalDetail[]` | — | Key/value rows describing exactly what will happen (amount, recipient, date…). |
| `command` | `string` | — | Optional command / code preview (rendered as a code block). |
| `commandLanguage` | `string` | `"bash"` |  |
| `children` | `ReactNode` | — | Any custom preview (email draft, diff, product card…). |
| `status` | `"pending" \| "denied" \| "approved"` | `"pending"` |  |
| `onApprove` | `((opts: { remember: boolean; }) => void)` | — |  |
| `onDeny` | `(() => void)` | — |  |
| `rememberLabel` | `ReactNode` | `"Don't ask again for this action"` | Label for the "remember" checkbox. Pass `false` to hide it. |
| `approveLabel` | `ReactNode` | `"Approve"` |  |
| `denyLabel` | `ReactNode` | `"Deny"` |  |
| `className` | `string` | — |  |
