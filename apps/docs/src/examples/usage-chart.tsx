import { UsageChart } from "kestro-ui";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const data = days.map((label, i) => ({
  label,
  values: {
    large: [4.1, 5.3, 4.8, 6.2, 7.4, 2.1, 1.8][i],
    fast: [1.2, 1.6, 1.4, 1.9, 2.3, 0.8, 0.6][i],
    vision: [0.4, 0.9, 0.5, 1.1, 0.7, 0.2, 0.1][i],
  },
}));

export default function Example() {
  return (
    <UsageChart
      className="max-w-2xl"
      title="Spend this week"
      data={data}
      format={(v) => `$${v.toFixed(2)}`}
      series={[
        { id: "large", label: "Sonata Large" },
        { id: "fast", label: "Sonata Fast" },
        { id: "vision", label: "Lumen Vision" },
      ]}
    />
  );
}
