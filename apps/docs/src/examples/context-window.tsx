import { useEffect, useState } from "react";
import { ContextWindow } from "kestro-ui";

export default function Example() {
  const [history, setHistory] = useState(62_000);

  // The conversation grows until it nears the limit, then resets
  useEffect(() => {
    const id = setInterval(() => setHistory((h) => (h > 150_000 ? 62_000 : h + 9_000)), 1200);
    return () => clearInterval(id);
  }, []);

  const segments = [
    { id: "system", label: "System prompt", tokens: 3_200 },
    { id: "tools", label: "Tool definitions", tokens: 11_400 },
    { id: "files", label: "Attached files", tokens: 18_600 },
    { id: "history", label: "Conversation", tokens: history },
  ];

  return (
    <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
      <ContextWindow segments={segments} limit={200_000} />
      <ContextWindow segments={segments} limit={200_000} variant="grid" title="Same, as a grid" />
    </div>
  );
}
