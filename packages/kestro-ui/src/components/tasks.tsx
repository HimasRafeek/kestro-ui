import * as React from "react";
import { CalendarClock, Check, ChevronDown, Clock, MoreHorizontal, Paperclip, Play, Plus, Repeat, ShieldCheck, Zap } from "lucide-react";
import { cn } from "../lib/cn";
import { AgentAvatar } from "./agent-avatar";
import { Button } from "./primitives";
import { SegmentedControl, Switch } from "./controls";
import { useAutoResizeTextarea } from "../lib/hooks";

/* ========================================================================== */
/*                                    Types                                   */
/* ========================================================================== */

export type TaskStatus = "draft" | "queued" | "running" | "needs-input" | "done" | "failed" | "scheduled";
export type TaskPriority = "low" | "normal" | "high" | "urgent";

export interface AgentTask {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  /** Agent working on it. */
  agent?: { name: string; avatar?: string };
  /** 0–100 while running. */
  progress?: number;
  priority?: TaskPriority;
  tags?: string[];
  /** Human-readable schedule or due time, e.g. "Every Mon 09:00" or "Due today". */
  schedule?: string;
  /** e.g. "Updated 2m ago". */
  updated?: string;
  /** Step counter, e.g. { done: 3, total: 5 }. */
  steps?: { done: number; total: number };
}

const statusMeta: Record<TaskStatus, { label: string; cls: string; dot: string }> = {
  draft: { label: "Draft", cls: "text-kui-fg-muted bg-kui-surface-2", dot: "bg-kui-fg-subtle" },
  queued: { label: "Queued", cls: "text-kui-fg-muted bg-kui-surface-2", dot: "bg-kui-fg-subtle" },
  scheduled: { label: "Scheduled", cls: "text-kui-info bg-kui-info-soft", dot: "bg-kui-info" },
  running: { label: "Running", cls: "text-kui-accent bg-kui-accent-soft", dot: "bg-kui-accent" },
  "needs-input": { label: "Needs you", cls: "text-kui-warning bg-kui-warning-soft", dot: "bg-kui-warning" },
  done: { label: "Done", cls: "text-kui-success bg-kui-success-soft", dot: "bg-kui-success" },
  failed: { label: "Failed", cls: "text-kui-danger bg-kui-danger-soft", dot: "bg-kui-danger" },
};

const priorityMeta: Record<TaskPriority, { label: string; bars: number; cls: string }> = {
  low: { label: "Low", bars: 1, cls: "text-kui-fg-subtle" },
  normal: { label: "Normal", bars: 2, cls: "text-kui-fg-muted" },
  high: { label: "High", bars: 3, cls: "text-kui-warning" },
  urgent: { label: "Urgent", bars: 4, cls: "text-kui-danger" },
};

export function TaskStatusBadge({ status, className }: { status: TaskStatus; className?: string }) {
  const m = statusMeta[status];
  return (
    <span key={status} className={cn("inline-flex h-5 shrink-0 items-center gap-1.5 rounded-full px-2 text-[11px] font-medium whitespace-nowrap animate-kui-pop", m.cls, className)}>
      <span className={cn("size-1.5 rounded-full", m.dot, status === "running" && "animate-kui-glow")} />
      {m.label}
    </span>
  );
}

function PriorityIcon({ priority }: { priority: TaskPriority }) {
  const m = priorityMeta[priority];
  return (
    <span className={cn("inline-flex h-3 items-end gap-[2px]", m.cls)} title={`${m.label} priority`} aria-label={`${m.label} priority`}>
      {[1, 2, 3, 4].map((b) => (
        <span key={b} className={cn("w-[3px] rounded-[1px]", b <= m.bars ? "bg-current" : "bg-kui-border-strong")} style={{ height: `${b * 25}%` }} />
      ))}
    </span>
  );
}

/* ========================================================================== */
/*                                   TaskCard                                 */
/* ========================================================================== */

export interface TaskCardProps {
  task: AgentTask;
  onOpen?: (id: string) => void;
  /** Extra controls, rendered in the footer. */
  actions?: React.ReactNode;
  /** Enable HTML5 drag (used by TaskBoard). */
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, id: string) => void;
  selected?: boolean;
  className?: string;
}

/** Compact card for one agent task: status, agent, progress, schedule, tags. */
export function TaskCard({ task, onOpen, actions, draggable, onDragStart, selected, className }: TaskCardProps) {
  const running = task.status === "running";
  return (
    <div
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : undefined}
      draggable={draggable}
      onDragStart={(e) => onDragStart?.(e, task.id)}
      onClick={() => onOpen?.(task.id)}
      onKeyDown={(e) => {
        if (onOpen && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onOpen(task.id);
        }
      }}
      className={cn(
        "group/task relative w-full overflow-hidden rounded-kui border bg-kui-surface p-3 text-left shadow-kui transition-[border-color,box-shadow,transform] duration-300 ease-kui-out animate-kui-pop",
        onOpen && "cursor-pointer hover:-translate-y-px hover:border-kui-border-strong hover:shadow-kui-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kui-accent/40",
        draggable && "cursor-grab active:cursor-grabbing",
        task.status === "needs-input" ? "border-kui-warning/50" : "border-kui-border",
        selected && "ring-2 ring-kui-accent/40",
        className,
      )}
    >
      <div className="flex items-start gap-2">
        <p className="min-w-0 flex-1 text-[13.5px] leading-snug font-medium text-kui-fg">{task.title}</p>
        {task.priority ? <PriorityIcon priority={task.priority} /> : null}
      </div>
      {task.description ? <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-kui-fg-muted">{task.description}</p> : null}
      {task.tags?.length ? (
        <div className="mt-2 flex flex-wrap gap-1">
          {task.tags.map((t) => (
            <span key={t} className="rounded bg-kui-surface-2 px-1.5 py-0.5 text-[10.5px] text-kui-fg-muted">
              {t}
            </span>
          ))}
        </div>
      ) : null}
      {running && task.progress !== undefined ? (
        <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-kui-surface-3">
          <div className="h-full rounded-full bg-kui-accent transition-[width] duration-500 ease-kui-out" style={{ width: `${task.progress}%` }} />
        </div>
      ) : null}
      <div className="mt-3 flex items-center gap-2 text-[11px] text-kui-fg-subtle">
        {task.agent ? <AgentAvatar size="xs" appearance="monogram" name={task.agent.name} src={task.agent.avatar} /> : null}
        <TaskStatusBadge status={task.status} />
        {task.steps ? <span className="tabular-nums">{task.steps.done}/{task.steps.total}</span> : null}
        {task.schedule ? (
          <span className="ml-auto flex min-w-0 items-center gap-1 truncate">
            <Clock className="size-3 shrink-0" />
            <span className="truncate">{task.schedule}</span>
          </span>
        ) : task.updated ? (
          <span className="ml-auto truncate">{task.updated}</span>
        ) : null}
      </div>
      {actions ? <div className="mt-3 flex gap-2 border-t border-kui-border pt-3" onClick={(e) => e.stopPropagation()}>{actions}</div> : null}
    </div>
  );
}

/* ========================================================================== */
/*                                   TaskBoard                                */
/* ========================================================================== */

export interface TaskColumn {
  id: string;
  title: React.ReactNode;
  /** Status assigned when a task is dropped here. */
  status: TaskStatus;
}

export interface TaskBoardProps {
  tasks: AgentTask[];
  columns?: TaskColumn[];
  /** Called when a task is dragged to another column. */
  onMove?: (taskId: string, status: TaskStatus) => void;
  onOpen?: (id: string) => void;
  /** Shows a "+" button per column. */
  onAdd?: (status: TaskStatus) => void;
  className?: string;
}

export const defaultTaskColumns: TaskColumn[] = [
  { id: "queued", title: "Queued", status: "queued" },
  { id: "running", title: "Running", status: "running" },
  { id: "needs-input", title: "Needs you", status: "needs-input" },
  { id: "done", title: "Done", status: "done" },
];

/** Kanban board of agent tasks with drag-and-drop between columns. */
export function TaskBoard({ tasks, columns = defaultTaskColumns, onMove, onOpen, onAdd, className }: TaskBoardProps) {
  const [over, setOver] = React.useState<string | null>(null);
  const columnFor = (t: AgentTask) =>
    columns.find((c) => c.status === t.status)?.id ?? (t.status === "scheduled" || t.status === "draft" ? columns[0]?.id : t.status === "failed" ? columns.find((c) => c.status === "needs-input")?.id : undefined);

  return (
    <div className={cn("kui-scrollbar grid auto-cols-[minmax(240px,1fr)] grid-flow-col gap-3 overflow-x-auto pb-2", className)}>
      {columns.map((col) => {
        const list = tasks.filter((t) => columnFor(t) === col.id);
        return (
          <section
            key={col.id}
            aria-label={typeof col.title === "string" ? col.title : col.id}
            onDragOver={(e) => {
              if (!onMove) return;
              e.preventDefault();
              setOver(col.id);
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setOver(null);
              const id = e.dataTransfer.getData("text/kui-task");
              if (id) onMove?.(id, col.status);
            }}
            className={cn(
              "flex min-h-48 flex-col rounded-kui border bg-kui-surface-2/50 transition-colors duration-200",
              over === col.id ? "border-kui-accent/60 bg-kui-accent-soft" : "border-kui-border",
            )}
          >
            <header className="flex items-center gap-2 px-3 pt-3 pb-2">
              <span className={cn("size-2 rounded-full", statusMeta[col.status].dot)} />
              <h3 className="text-[13px] font-semibold text-kui-fg">{col.title}</h3>
              <span className="text-xs text-kui-fg-subtle tabular-nums">{list.length}</span>
              {onAdd ? (
                <button type="button" aria-label="Add task" onClick={() => onAdd(col.status)} className="ml-auto flex size-6 cursor-pointer items-center justify-center rounded-md text-kui-fg-subtle hover:bg-kui-surface-3 hover:text-kui-fg">
                  <Plus className="size-3.5" />
                </button>
              ) : null}
            </header>
            <div className="flex flex-1 flex-col gap-2 px-2 pb-2">
              {list.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  onOpen={onOpen}
                  draggable={!!onMove}
                  onDragStart={(e, id) => {
                    e.dataTransfer.setData("text/kui-task", id);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                />
              ))}
              {!list.length ? <p className="flex flex-1 items-center justify-center rounded-kui-sm border border-dashed border-kui-border py-6 text-xs text-kui-fg-subtle">Nothing here</p> : null}
            </div>
          </section>
        );
      })}
    </div>
  );
}

/* ========================================================================== */
/*                                   TaskList                                 */
/* ========================================================================== */

export interface TaskListProps {
  tasks: AgentTask[];
  onOpen?: (id: string) => void;
  selectedId?: string;
  /** Row actions, e.g. run / pause / menu. */
  renderActions?: (task: AgentTask) => React.ReactNode;
  className?: string;
}

/** Dense table of agent tasks: status, agent, progress, schedule. */
export function TaskList({ tasks, onOpen, selectedId, renderActions, className }: TaskListProps) {
  return (
    <div className={cn("@container w-full overflow-hidden rounded-kui border border-kui-border bg-kui-surface", className)}>
      <div className="hidden grid-cols-[minmax(0,1fr)_120px_130px_140px_40px] items-center gap-3 border-b border-kui-border bg-kui-surface-2/60 px-4 py-2 text-[11px] font-medium tracking-wide text-kui-fg-subtle uppercase @2xl:grid">
        <span>Task</span>
        <span>Status</span>
        <span>Agent</span>
        <span>Schedule</span>
        <span />
      </div>
      <ul>
        {tasks.map((t) => (
          <li
            key={t.id}
            onClick={() => onOpen?.(t.id)}
            className={cn(
              "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 border-b border-kui-border px-4 py-3 last:border-0 animate-kui-reveal @2xl:grid-cols-[minmax(0,1fr)_120px_130px_140px_40px]",
              onOpen && "cursor-pointer hover:bg-kui-surface-2/60",
              selectedId === t.id && "bg-kui-surface-2",
            )}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {t.priority ? <PriorityIcon priority={t.priority} /> : null}
                <span className="truncate text-[13.5px] font-medium text-kui-fg">{t.title}</span>
              </div>
              {t.status === "running" && t.progress !== undefined ? (
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="h-1 max-w-48 flex-1 overflow-hidden rounded-full bg-kui-surface-3">
                    <span className="block h-full rounded-full bg-kui-accent transition-[width] duration-500 ease-kui-out" style={{ width: `${t.progress}%` }} />
                  </span>
                  <span className="text-[11px] text-kui-fg-subtle tabular-nums">{t.progress}%</span>
                </div>
              ) : t.description ? (
                <p className="truncate text-xs text-kui-fg-subtle">{t.description}</p>
              ) : null}
            </div>
            <div className="justify-self-end @2xl:justify-self-start">
              <TaskStatusBadge status={t.status} />
            </div>
            <div className="hidden min-w-0 items-center gap-2 @2xl:flex">
              {t.agent ? (
                <>
                  <AgentAvatar size="xs" appearance="monogram" name={t.agent.name} src={t.agent.avatar} />
                  <span className="truncate text-[13px] text-kui-fg-muted">{t.agent.name}</span>
                </>
              ) : (
                <span className="text-xs text-kui-fg-subtle">Unassigned</span>
              )}
            </div>
            <span className="hidden truncate text-[13px] text-kui-fg-muted @2xl:block">{t.schedule ?? t.updated ?? "—"}</span>
            <div className="hidden justify-end @2xl:flex" onClick={(e) => e.stopPropagation()}>
              {renderActions?.(t) ?? <MoreHorizontal className="size-4 text-kui-fg-subtle" />}
            </div>
          </li>
        ))}
      </ul>
      {!tasks.length ? <p className="px-4 py-10 text-center text-sm text-kui-fg-subtle">No tasks yet.</p> : null}
    </div>
  );
}

/* ========================================================================== */
/*                                  TaskCreator                               */
/* ========================================================================== */

export interface TaskPermission {
  id: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  /** "allow" runs without asking, "ask" requires approval, "off" disables the tool. */
  defaultMode?: "allow" | "ask" | "off";
}

export interface TaskAgentOption {
  id: string;
  name: string;
  description?: string;
}

export type TaskSchedule = { type: "now" } | { type: "once"; at: string } | { type: "repeat"; every: "hour" | "day" | "weekday" | "week" | "month"; at: string };

export interface NewTask {
  title: string;
  instructions: string;
  agentId?: string;
  schedule: TaskSchedule;
  permissions: Record<string, "allow" | "ask" | "off">;
  /** Max spend in currency units. */
  budget?: number;
  priority: TaskPriority;
  notify: boolean;
  files: File[];
}

export interface TaskCreatorProps {
  agents?: TaskAgentOption[];
  permissions?: TaskPermission[];
  /** Starter templates shown above the instructions. */
  templates?: { label: string; title: string; instructions: string }[];
  currency?: string;
  defaultBudget?: number;
  submitLabel?: React.ReactNode;
  onSubmit?: (task: NewTask) => void;
  onCancel?: () => void;
  className?: string;
}

/** Form for handing an agent a job: what to do, who does it, when, what it may do on its own, and the budget. */
export function TaskCreator({
  agents = [],
  permissions = [],
  templates = [],
  currency = "$",
  defaultBudget = 5,
  submitLabel = "Create task",
  onSubmit,
  onCancel,
  className,
}: TaskCreatorProps) {
  const [title, setTitle] = React.useState("");
  const [instructions, setInstructions] = React.useState("");
  const [agentId, setAgentId] = React.useState(agents[0]?.id);
  const [when, setWhen] = React.useState<"now" | "once" | "repeat">("now");
  const [at, setAt] = React.useState("09:00");
  const [date, setDate] = React.useState("");
  const [every, setEvery] = React.useState<"hour" | "day" | "weekday" | "week" | "month">("weekday");
  const [modes, setModes] = React.useState<Record<string, "allow" | "ask" | "off">>(() => Object.fromEntries(permissions.map((p) => [p.id, p.defaultMode ?? "ask"])));
  const [budget, setBudget] = React.useState<number | "">(defaultBudget);
  const [priority, setPriority] = React.useState<TaskPriority>("normal");
  const [notify, setNotify] = React.useState(true);
  const [files, setFiles] = React.useState<File[]>([]);
  const [advanced, setAdvanced] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const areaRef = React.useRef<HTMLTextAreaElement>(null);
  const id = React.useId();
  useAutoResizeTextarea(areaRef, instructions, 12);

  const canSubmit = title.trim().length > 0 && instructions.trim().length > 0 && (when !== "once" || !!date);
  const schedule: TaskSchedule = when === "now" ? { type: "now" } : when === "once" ? { type: "once", at: `${date}T${at}` } : { type: "repeat", every, at };

  const field = "w-full rounded-kui-sm border border-kui-border bg-kui-surface px-3 text-sm text-kui-fg placeholder:text-kui-fg-subtle transition-colors focus:border-kui-fg-subtle focus:outline-none";
  const label = "mb-1.5 block text-[13px] font-medium text-kui-fg";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit) return;
        onSubmit?.({ title: title.trim(), instructions: instructions.trim(), agentId, schedule, permissions: modes, budget: budget === "" ? undefined : budget, priority, notify, files });
      }}
      className={cn("w-full overflow-hidden rounded-kui-lg border border-kui-border bg-kui-surface shadow-kui", className)}
    >
      <div className="space-y-5 p-5">
        <div>
          <label htmlFor={`${id}-title`} className={label}>
            Task
          </label>
          <input id={`${id}-title`} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Weekly competitor pricing report" className={cn(field, "h-10 text-[15px] font-medium")} />
        </div>

        {templates.length ? (
          <div className="flex flex-wrap gap-1.5">
            {templates.map((t) => (
              <button
                key={t.label}
                type="button"
                onClick={() => {
                  setTitle(t.title);
                  setInstructions(t.instructions);
                }}
                className="inline-flex h-7 cursor-pointer items-center gap-1 rounded-full border border-kui-border px-2.5 text-xs text-kui-fg-muted transition-colors hover:border-kui-border-strong hover:text-kui-fg"
              >
                <Zap className="size-3" /> {t.label}
              </button>
            ))}
          </div>
        ) : null}

        <div>
          <label htmlFor={`${id}-ins`} className={label}>
            Instructions
          </label>
          <div className="rounded-kui-sm border border-kui-border bg-kui-surface transition-colors focus-within:border-kui-fg-subtle">
            <textarea
              id={`${id}-ins`}
              ref={areaRef}
              rows={4}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="What should the agent do, what does a good result look like, and where should it deliver it?"
              className="block w-full resize-none bg-transparent px-3 pt-2.5 text-sm leading-6 text-kui-fg placeholder:text-kui-fg-subtle focus:outline-none"
            />
            <div className="flex flex-wrap items-center gap-2 px-2 pb-2">
              <input
                ref={fileRef}
                type="file"
                multiple
                hidden
                onChange={(e) => {
                  setFiles((f) => [...f, ...Array.from(e.target.files ?? [])]);
                  e.target.value = "";
                }}
              />
              <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-2 text-xs text-kui-fg-muted hover:bg-kui-surface-2 hover:text-kui-fg">
                <Paperclip className="size-3.5" /> Attach
              </button>
              {files.map((f, i) => (
                <span key={f.name + i} className="inline-flex h-6 items-center gap-1 rounded bg-kui-surface-2 px-2 text-[11px] text-kui-fg-muted">
                  {f.name}
                  <button type="button" aria-label={`Remove ${f.name}`} onClick={() => setFiles((x) => x.filter((_, j) => j !== i))} className="cursor-pointer text-kui-fg-subtle hover:text-kui-fg">
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {agents.length ? (
          <div>
            <span className={label}>Agent</span>
            <div role="radiogroup" className="grid gap-2 sm:grid-cols-2">
              {agents.map((a) => {
                const active = a.id === agentId;
                return (
                  <button
                    key={a.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setAgentId(a.id)}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-kui-sm border p-2.5 text-left transition-colors duration-200",
                      active ? "border-kui-accent bg-kui-accent-soft" : "border-kui-border hover:border-kui-border-strong",
                    )}
                  >
                    <AgentAvatar size="sm" appearance="monogram" name={a.name} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium text-kui-fg">{a.name}</span>
                      {a.description ? <span className="block truncate text-xs text-kui-fg-subtle">{a.description}</span> : null}
                    </span>
                    {active ? <Check className="size-4 shrink-0 text-kui-accent" /> : null}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <div>
          <span className={label}>When</span>
          <SegmentedControl
            aria-label="When to run"
            value={when}
            onValueChange={setWhen}
            options={[
              { value: "now", label: "Run now", icon: <Play /> },
              { value: "once", label: "Schedule", icon: <CalendarClock /> },
              { value: "repeat", label: "Repeat", icon: <Repeat /> },
            ]}
          />
          {when !== "now" ? (
            <div className="mt-3 flex flex-wrap items-center gap-2 animate-kui-in">
              {when === "repeat" ? (
                <select value={every} onChange={(e) => setEvery(e.target.value as typeof every)} className={cn(field, "h-9 w-auto cursor-pointer pr-8")} aria-label="Repeat every">
                  <option value="hour">Every hour</option>
                  <option value="day">Every day</option>
                  <option value="weekday">Every weekday</option>
                  <option value="week">Every week</option>
                  <option value="month">Every month</option>
                </select>
              ) : (
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={cn(field, "h-9 w-auto")} aria-label="Date" />
              )}
              {!(when === "repeat" && every === "hour") ? (
                <>
                  <span className="text-sm text-kui-fg-subtle">at</span>
                  <input type="time" value={at} onChange={(e) => setAt(e.target.value)} className={cn(field, "h-9 w-auto")} aria-label="Time" />
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        {permissions.length ? (
          <div>
            <span className={label}>What the agent may do on its own</span>
            <ul className="divide-y divide-kui-border overflow-hidden rounded-kui-sm border border-kui-border">
              {permissions.map((p) => (
                <li key={p.id} className="flex items-center gap-3 px-3 py-2.5">
                  {p.icon ? <span className="text-kui-fg-muted [&_svg]:size-4">{p.icon}</span> : null}
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-medium text-kui-fg">{p.label}</span>
                    {p.description ? <span className="block text-xs text-kui-fg-subtle">{p.description}</span> : null}
                  </span>
                  <SegmentedControl
                    size="sm"
                    aria-label={`Permission for ${typeof p.label === "string" ? p.label : p.id}`}
                    value={modes[p.id]}
                    onValueChange={(v) => setModes((m) => ({ ...m, [p.id]: v }))}
                    options={[
                      { value: "off", label: "Off" },
                      { value: "ask", label: "Ask first" },
                      { value: "allow", label: "Allow" },
                    ]}
                  />
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <button type="button" onClick={() => setAdvanced((a) => !a)} className="inline-flex cursor-pointer items-center gap-1 text-[13px] font-medium text-kui-fg-muted hover:text-kui-fg" aria-expanded={advanced}>
          <ChevronDown className={cn("size-4 transition-transform duration-300 ease-kui-out", advanced && "rotate-180")} />
          Budget, priority & notifications
        </button>
        {advanced ? (
          <div className="grid gap-4 animate-kui-in sm:grid-cols-3">
            <div>
              <label htmlFor={`${id}-budget`} className={label}>
                Spend limit
              </label>
              <div className="flex h-9 items-center rounded-kui-sm border border-kui-border bg-kui-surface px-3 focus-within:border-kui-fg-subtle">
                <span className="text-sm text-kui-fg-subtle">{currency}</span>
                <input
                  id={`${id}-budget`}
                  type="number"
                  min={0}
                  step={0.5}
                  value={budget}
                  onChange={(e) => setBudget(e.target.value === "" ? "" : Number(e.target.value))}
                  className="min-w-0 flex-1 bg-transparent pl-1 text-sm text-kui-fg focus:outline-none"
                />
              </div>
            </div>
            <div>
              <span className={label}>Priority</span>
              <SegmentedControl
                size="sm"
                block
                aria-label="Priority"
                value={priority}
                onValueChange={setPriority}
                options={[
                  { value: "low", label: "Low" },
                  { value: "normal", label: "Normal" },
                  { value: "high", label: "High" },
                ]}
              />
            </div>
            <label className="flex items-center justify-between gap-3 self-end rounded-kui-sm border border-kui-border px-3 py-2">
              <span className="text-[13px] text-kui-fg">Notify me when done</span>
              <Switch checked={notify} onCheckedChange={setNotify} size="sm" aria-label="Notify me when done" />
            </label>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-kui-border bg-kui-surface-2/40 px-5 py-3">
        <span className="flex items-center gap-1.5 text-xs text-kui-fg-subtle">
          <ShieldCheck className="size-3.5" />
          {Object.values(modes).filter((m) => m === "ask").length} action{Object.values(modes).filter((m) => m === "ask").length === 1 ? "" : "s"} will ask before running
        </span>
        <div className="ml-auto flex gap-2">
          {onCancel ? (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          ) : null}
          <Button type="submit" variant="accent" size="sm" disabled={!canSubmit}>
            {when === "now" ? <Play /> : <CalendarClock />}
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
