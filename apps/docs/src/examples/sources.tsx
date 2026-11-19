import { InlineCitation, SourceCard, SourceChip, Sources, type Source } from "kestro-ui";

const sources: Source[] = [
  { url: "https://example.com/health/coffee-study", title: "Coffee and longevity: a 10-year cohort study", snippet: "Moderate intake of 2–3 cups a day was linked to lower mortality." },
  { url: "https://news.example.org/caffeine-sleep", title: "How late is too late for caffeine?", snippet: "Caffeine's half-life averages around 5 hours in healthy adults." },
  { url: "https://example.net/nutrition/guidelines", title: "Dietary guidelines 2025–2030", snippet: "Up to 400 mg of caffeine per day is considered safe for most adults." },
];

export default function Example() {
  return (
    <div className="w-full max-w-xl space-y-5">
      <p className="text-[15px] leading-relaxed text-kui-fg">
        Two to three cups of coffee a day is linked to a longer life
        <InlineCitation index={1} source={sources[0]} />, but try to stop by early afternoon since caffeine lingers for
        hours
        <InlineCitation index={2} source={sources[1]} />.
      </p>

      <Sources sources={sources} defaultOpen />

      <div className="flex flex-wrap gap-2">
        <SourceChip source={sources[2]} />
        <SourceChip source={sources[0]} index={1} />
      </div>

      <SourceCard source={sources[2]} index={3} />
    </div>
  );
}
