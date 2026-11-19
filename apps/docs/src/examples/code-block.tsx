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
