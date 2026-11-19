import { useState } from "react";
import { Markdown, Message, MessageActions, type Feedback } from "kestro-ui";

const ANSWER =
  "Your order **#48213** shipped this morning via UPS and should arrive **Thursday, Nov 21**. " +
  "I've emailed you the tracking link.";

export default function Example() {
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [regenerations, setRegenerations] = useState(0);

  return (
    <div className="w-full max-w-xl space-y-6">
      <Message from="system">Conversation started · Today 9:41 AM</Message>

      <Message from="user" timestamp="9:41 AM">
        Where is my order? It's been a few days.
      </Message>

      <Message
        from="assistant"
        name="Nova · Support"
        avatar={{ name: "Nova", state: "online" }}
        timestamp="9:41 AM"
        actions={
          <MessageActions
            copyText={ANSWER}
            feedback={feedback}
            onFeedback={setFeedback}
            onRegenerate={() => setRegenerations((n) => n + 1)}
            alwaysVisible
          />
        }
      >
        <Markdown>{ANSWER}</Markdown>
      </Message>

      <p className="text-center text-xs text-kui-fg-subtle">
        Feedback: {feedback ?? "none"} · Regenerated {regenerations}×
      </p>
    </div>
  );
}
