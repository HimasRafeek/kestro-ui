# EmptyState

> Category: Input · Package: `kestro-ui`

Welcome screen shown before the first message.

## Import

```tsx
import { EmptyState } from "kestro-ui";
```

## Example: empty-state

```tsx
import { AgentAvatar, EmptyState, Suggestions } from "kestro-ui";
import { FileSearch, Newspaper, Quote, TrendingUp } from "lucide-react";

export default function Example() {
  return (
    <div className="w-full max-w-2xl">
      <EmptyState
        icon={<AgentAvatar size="lg" name="Scout" />}
        title="What should we research today?"
        description="Scout reads papers, news and reports, then gives you a cited summary."
      >
        <Suggestions
          variant="cards"
          onSelect={(prompt) => console.log(prompt)}
          suggestions={[
            { label: "Market snapshot", description: "EV adoption in Europe, 2026", icon: <TrendingUp /> },
            { label: "Literature review", description: "Sleep and memory consolidation", icon: <FileSearch /> },
            { label: "News digest", description: "This week in AI regulation", icon: <Newspaper /> },
            { label: "Fact check", description: "Verify a quote or statistic", icon: <Quote /> },
          ]}
        />
      </EmptyState>
    </div>
  );
}
```

## API

### <EmptyState />

Welcome screen shown before the first message.

| Prop | Type | Default | Description |
|---|---|---|---|
| `icon` | `ReactNode` | — |  |
| `title` | `ReactNode` | `"How can I help you today?"` |  |
| `description` | `ReactNode` | — |  |
| `children` | `ReactNode` | — |  |
| `className` | `string` | — |  |
