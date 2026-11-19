import { AgentHandoff, Message } from "kestro-ui";
import { Compass, CreditCard, Hotel } from "lucide-react";

const planner = { name: "Planner", avatar: { icon: <Compass /> } };
const hotels = { name: "Hotels", avatar: { icon: <Hotel /> } };
const booker = { name: "Booker", avatar: { icon: <CreditCard /> } };

export default function Example() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-5">
      <Message from="user">Find us a boutique hotel in Lisbon for Oct 12–15 and book it, max €250/night.</Message>
      <Message from="assistant" name={planner.name} avatar={planner.avatar}>
        On it. I'll have Hotels shortlist options, then Booker will reserve the one you pick.
      </Message>

      <AgentHandoff from={planner} to={hotels} reason="hotel search" />

      <Message from="assistant" name={hotels.name} avatar={hotels.avatar}>
        Top pick: Memmo Alfama — rooftop pool, river views, €232/night. Two backups are within budget too.
      </Message>
      <Message from="user">Memmo looks great, go ahead.</Message>

      <AgentHandoff from={hotels} to={booker} reason="payment" />

      <Message from="assistant" name={booker.name} avatar={booker.avatar}>
        Booked! 3 nights at Memmo Alfama, €696 total. Confirmation #MA-55821 is in your inbox.
      </Message>
    </div>
  );
}
