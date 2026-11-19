# Markdown

> Category: Chat · Package: `kestro-ui`

Zero-dependency, safe Markdown renderer for LLM output: tables, task lists, code, citations. StreamingMarkdown adds a smooth, frame-paced reveal for bursty token streams.

## Import

```tsx
import { Markdown, StreamingMarkdown } from "kestro-ui";
```

## Example: markdown

```tsx
import { Markdown, type Source } from "kestro-ui";

const sources: Source[] = [
  { url: "https://example.com/energy-report-2026", title: "Global Energy Outlook 2026", snippet: "Solar capacity grew 32% year over year." },
  { url: "https://example.com/battery-costs", title: "Battery pack prices hit record low", snippet: "Average pack prices fell below $90/kWh." },
];

const content = `## Home solar: is it worth it?

Short answer: **usually yes**, especially if you plan to stay *5+ years*. Panel installs grew fast last year [1], and storage keeps getting cheaper [2].

### What to check first
- Roof orientation and shade
- Your average monthly bill
- Local incentives and net metering

### Your checklist
- [x] Pull last 12 months of utility bills
- [x] Get a satellite roof estimate
- [ ] Request 3 installer quotes

| System | Upfront cost | Payback |
| :--- | ---: | ---: |
| 6 kW panels | $14,800 | 7.5 yrs |
| 6 kW + battery | $24,300 | 10.2 yrs |

Estimate savings with \`monthly_bill * 0.7\` as a rough rule of thumb:

\`\`\`python
def payback_years(cost: float, monthly_savings: float) -> float:
    return round(cost / (monthly_savings * 12), 1)

print(payback_years(14_800, 165))  # 7.5
\`\`\`

> **Tip:** quotes vary a lot. The cheapest per-watt price isn't always the best warranty.`;

export default function Example() {
  return (
    <div className="w-full max-w-2xl">
      <Markdown sources={sources}>{content}</Markdown>
    </div>
  );
}
```

## Example: streaming-markdown

```tsx
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
```

## API

### <Markdown />

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` **(required)** | `string` | — |  |
| `streaming` | `false \| true` | `false` | Show a blinking caret at the end of the content. |
| `sources` | `Source[]` | — | Sources used to resolve `[1]`-style inline citations. |
| `renderCode` | `((code: string, language: string, streaming: boolean) => ReactNode)` | — | Override code block rendering (e.g. plug in Shiki). |
| `className` | `string` | — |  |

### <StreamingMarkdown />

Markdown + smooth token reveal + caret. Use this for live LLM output.

| Prop | Type | Default | Description |
|---|---|---|---|
| `streaming` | `false \| true` | `false` | True while tokens are still arriving. |
| `smooth` | `boolean \| SmoothTextOptions` | `true` | Smooth out bursty chunks with a frame-paced reveal. Default true. |
| `className` | `string` | — |  |
| `children` **(required)** | `string` | — |  |
| `sources` | `Source[]` | — | Sources used to resolve `[1]`-style inline citations. |
| `renderCode` | `((code: string, language: string, streaming: boolean) => ReactNode)` | — | Override code block rendering (e.g. plug in Shiki). |
