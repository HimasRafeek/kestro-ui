import { useEffect, useState } from "react";
import { Button, TaskPlan, type PlanStep } from "kestro-ui";
import { Play, RotateCcw } from "lucide-react";

const initialSteps: PlanStep[] = [
  { id: "dates", title: "Poll the team for dates", status: "pending" },
  { id: "venue", title: "Shortlist venues near Lisbon", status: "pending" },
  {
    id: "budget",
    title: "Check budget with finance",
    status: "pending",
    details: "€18,400 approved for 24 people · flights, 3 nights, catering and one group activity.",
  },
  { id: "book", title: "Book flights and hotel", status: "pending" },
  { id: "invite", title: "Send calendar invites", status: "pending" },
];

export default function Example() {
  const [steps, setSteps] = useState(initialSteps);
  const [running, setRunning] = useState(false);

  const finished = steps.every((s) => s.status === "complete");

  useEffect(() => {
    if (finished) setRunning(false);
  }, [finished]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSteps((prev) => {
        const i = prev.findIndex((s) => s.status !== "complete");
        return prev.map((s, idx) => {
          if (idx !== i) return s;
          if (s.status === "pending") return { ...s, status: "running" };
          return { ...s, status: "complete", duration: 2 + idx * 3 };
        });
      });
    }, 900);
    return () => clearInterval(id);
  }, [running]);

  return (
    <div className="w-full max-w-md space-y-5 rounded-kui border border-kui-border bg-kui-surface p-5">
      <TaskPlan title="Plan a team offsite" steps={steps} />
      <div className="flex gap-2">
        <Button size="sm" variant="accent" onClick={() => setRunning(true)} disabled={running || finished}>
          <Play /> Run
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setRunning(false);
            setSteps(initialSteps);
          }}
        >
          <RotateCcw /> Reset
        </Button>
      </div>
    </div>
  );
}
