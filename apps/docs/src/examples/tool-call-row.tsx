import { useEffect, useState } from "react";
import { ToolCallRow } from "kestro-ui";
import { CalendarDays, FileText, Search } from "lucide-react";

export default function Example() {
  const [progress, setProgress] = useState(20);

  useEffect(() => {
    const id = setInterval(() => setProgress((p) => (p >= 100 ? 10 : p + 6)), 400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="w-full max-w-xl rounded-kui border border-kui-border bg-kui-surface px-4">
      <ToolCallRow name="search_flights" icon={<Search />} status="running" progress={progress} />
      <ToolCallRow name="check_fare_rules" icon={<FileText />} status="success" durationMs={218} />
      <ToolCallRow name="book_flight" icon={<CalendarDays />} status="waiting" />
      <ToolCallRow name="fetch_receipt" icon={<FileText />} status="error" detail="Airline API timed out after 30s" onRetry={() => {}} />
    </div>
  );
}
