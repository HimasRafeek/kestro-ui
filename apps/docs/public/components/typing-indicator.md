# TypingIndicator

> Category: Chat · Package: `kestro-ui`

Animated three-dot indicator for when the agent is preparing a response.

## Import

```tsx
import { TypingIndicator } from "kestro-ui";
```

## Example: typing-indicator

```tsx
import { Message, TypingIndicator } from "kestro-ui";

export default function Example() {
  return (
    <div className="w-full max-w-xl space-y-6">
      <Message from="user">Can you find me a vegetarian lasagna recipe?</Message>
      <Message from="assistant" name="Basil" avatar={{ name: "Basil", state: "thinking" }}>
        <TypingIndicator />
      </Message>
      <Message from="assistant" name="Basil" avatar={{ name: "Basil", state: "working" }}>
        <TypingIndicator label="Checking 12 recipe sites…" />
      </Message>
    </div>
  );
}
```

## API

### <TypingIndicator />

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `ReactNode` | — |  |
| `className` | `string` | — |  |
