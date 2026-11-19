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
