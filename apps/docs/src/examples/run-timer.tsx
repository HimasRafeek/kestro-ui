import { useEffect, useState } from "react";
import { RunTimer } from "kestro-ui";

export default function Example() {
  const [startedAt] = useState(() => Date.now() - 83_000);
  const [progress, setProgress] = useState(40);

  useEffect(() => {
    const id = setInterval(() => setProgress((p) => (p >= 95 ? 40 : p + 1)), 800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="grid w-full max-w-2xl gap-6 rounded-kui border border-kui-border bg-kui-surface p-5 sm:grid-cols-3">
      <RunTimer startedAt={startedAt} progress={progress} label="Research run" />
      <RunTimer startedAt={startedAt} timeout={120_000} label="Timeout 2 min" />
      <RunTimer elapsed={754_000} running={false} label="Finished in" />
    </div>
  );
}
