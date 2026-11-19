# CodeBlock

> Category: Chat · Package: `kestro-ui`

Syntax-highlighted code with copy button, filename, line numbers and a streaming caret. Built-in tiny highlighter, no dependencies.

## Import

```tsx
import { CodeBlock } from "kestro-ui";
```

## Example: code-block

```tsx
import { CodeBlock } from "kestro-ui";

const handler = `import { streamText } from "ai";

export async function POST(req: Request) {
  const { messages } = await req.json();
  const result = streamText({
    model: "anthropic/claude-sonnet",
    system: "You are a friendly travel concierge.",
    messages,
  });
  return result.toUIMessageStreamResponse();
}`;

const query = `SELECT region, SUM(amount) AS revenue
FROM orders
WHERE created_at >= '2026-10-01'
GROUP BY region
ORDER BY revenue DESC;`;

export default function Example() {
  return (
    <div className="w-full max-w-2xl space-y-4">
      <CodeBlock code={handler} language="ts" filename="app/api/chat/route.ts" showLineNumbers />
      <CodeBlock code={query} language="sql" hideHeader />
    </div>
  );
}
```

## API

### <CodeBlock />

| Prop | Type | Default | Description |
|---|---|---|---|
| `code` **(required)** | `string` | — |  |
| `language` | `string` | `""` |  |
| `filename` | `string` | — | Shown in the header instead of the language. |
| `showLineNumbers` | `false \| true` | `false` |  |
| `hideHeader` | `false \| true` | `false` | Hide the header bar (copy button floats on hover instead). |
| `maxHeight` | `string \| number` | — | Max height before scrolling, e.g. 320 or "20rem". |
| `streaming` | `false \| true` | — | Show a blinking caret at the end (while streaming). |
| `actions` | `ReactNode` | — | Extra actions rendered in the header. |
| `className` | `string` | — |  |
