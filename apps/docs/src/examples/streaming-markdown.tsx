import { useEffect, useRef, useState } from "react";
import { Button, StreamingMarkdown } from "kestro-ui";
import { RotateCcw } from "lucide-react";

const FULL = `### Weeknight lemon garlic pasta

Ready in **20 minutes**, serves 2.

1. Boil 200 g spaghetti in well-salted water.
2. Meanwhile, sizzle 3 sliced garlic cloves in olive oil until *just* golden.
3. Toss the pasta with the garlic, zest of 1 lemon, a splash of pasta water and parmesan.

> Finish with black pepper and chopped parsley. A handful of spinach works great too.`;

export default function Example() {
  const [text, setText] = useState("");
  const [streaming, setStreaming] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const replay = () => {
    window.clearInterval(timer.current);
    setText("");
    setStreaming(true);
    let i = 0;
    timer.current = window.setInterval(() => {
      i += 2 + Math.floor(Math.random() * 28);
      setText(FULL.slice(0, i));
      if (i >= FULL.length) {
        window.clearInterval(timer.current);
        setStreaming(false);
      }
    }, 120);
  };

  useEffect(() => {
    replay();
    return () => window.clearInterval(timer.current);
  }, []);

  return (
    <div className="w-full max-w-xl space-y-4">
      <div className="min-h-64 rounded-kui border border-kui-border bg-kui-surface p-5">
        <StreamingMarkdown streaming={streaming}>{text}</StreamingMarkdown>
      </div>
      <Button variant="outline" size="sm" onClick={replay}>
        <RotateCcw /> Replay
      </Button>
    </div>
  );
}
