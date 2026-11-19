import { ToolCall, ToolCallGroup } from "kestro-ui";
import { CloudRain, CloudSun, Sun } from "lucide-react";

const forecast = [
  { day: "Fri", icon: <Sun />, high: 24, low: 16 },
  { day: "Sat", icon: <CloudSun />, high: 21, low: 15 },
  { day: "Sun", icon: <CloudRain />, high: 18, low: 13 },
];

export default function Example() {
  return (
    <div className="w-full max-w-xl">
      <ToolCallGroup>
        <ToolCall name="geocode" title="Finding location" input={{ place: "Lisbon, Portugal" }} durationMs={210} />
        <ToolCall name="get_weather" title="Weekend forecast" input={{ city: "Lisbon", days: 3 }} durationMs={530} defaultOpen>
          <div className="grid grid-cols-3 gap-2">
            {forecast.map((d) => (
              <div
                key={d.day}
                className="flex flex-col items-center gap-1.5 rounded-kui-sm border border-kui-border bg-kui-surface-2 p-3 [&_svg]:size-6 [&_svg]:text-kui-accent"
              >
                <span className="text-xs font-medium text-kui-fg-muted">{d.day}</span>
                {d.icon}
                <span className="text-sm font-semibold text-kui-fg tabular-nums">
                  {d.high}° <span className="font-normal text-kui-fg-subtle">{d.low}°</span>
                </span>
              </div>
            ))}
          </div>
        </ToolCall>
      </ToolCallGroup>
    </div>
  );
}
