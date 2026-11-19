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
