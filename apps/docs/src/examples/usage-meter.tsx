import { UsageMeter } from "kestro-ui";

export default function Example() {
  return (
    <div className="grid w-full max-w-2xl gap-6 sm:grid-cols-2">
      <UsageMeter title="This conversation" used={48_210} limit={200_000} input={39_870} output={8_340} cached={21_500} cost={0.184} />
      <div className="space-y-6 rounded-kui border border-kui-border bg-kui-surface p-4">
        <div className="space-y-2">
          <p className="text-[13px] font-medium text-kui-fg">Monthly credits</p>
          <UsageMeter variant="bar" used={7_450} limit={10_000} unit="credits" />
        </div>
        <div className="space-y-2">
          <p className="text-[13px] font-medium text-kui-fg">Voice minutes</p>
          <UsageMeter variant="bar" used={2_870} limit={3_000} unit="min" />
        </div>
        <div className="flex items-center justify-between text-[13px] text-kui-fg-muted">
          Context window
          <UsageMeter variant="ring" used={61_000} limit={200_000} />
        </div>
      </div>
    </div>
  );
}
