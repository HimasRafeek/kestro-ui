import * as React from "react";
import { ArrowLeft, ArrowRight, Check, Code, Eye, Sparkles } from "lucide-react";
import { Badge, Button, CodeBlock, cn, useCopyToClipboard } from "kestro-ui";
import api from "../generated/api.json";
import { allItems, getExample, NPM_NAME, type RegistryItem } from "../lib/site";
import { href } from "../lib/router";

type ApiEntry = {
  description?: string;
  extendsNative: boolean;
  props: { name: string; type: string; required: boolean; default?: string; description?: string }[];
};
const API = api as Record<string, ApiEntry>;

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { error?: Error }> {
  state: { error?: Error } = {};
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    return this.state.error ? <p className="text-sm text-kui-danger">Preview failed: {this.state.error.message}</p> : this.props.children;
  }
}

export function ExampleCard({ name }: { name: string }) {
  const { Component, code } = getExample(name);
  const [tab, setTab] = React.useState<"preview" | "code">("preview");
  if (!Component) return <p className="text-sm text-kui-fg-subtle">Example “{name}” not found.</p>;
  return (
    <div className="overflow-hidden rounded-kui-lg border border-kui-border bg-kui-surface">
      <div className="flex items-center gap-1 border-b border-kui-border px-2 py-1.5">
        {(["preview", "code"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium capitalize transition-colors",
              tab === t ? "bg-kui-surface-3 text-kui-fg" : "text-kui-fg-subtle hover:text-kui-fg",
            )}
          >
            {t === "preview" ? <Eye className="size-3.5" /> : <Code className="size-3.5" />}
            {t}
          </button>
        ))}
        <span className="ml-auto pr-2 font-mono text-[11px] text-kui-fg-subtle">{name}.tsx</span>
      </div>
      <div className={cn(tab !== "preview" && "hidden")}>
        <div className="relative flex min-h-[340px] items-center justify-center overflow-hidden bg-kui-bg p-6 sm:p-10 [background-image:radial-gradient(var(--kui-border)_1px,transparent_1px)] [background-size:18px_18px]">
          <ErrorBoundary>
            <Component />
          </ErrorBoundary>
        </div>
      </div>
      {tab === "code" ? <CodeBlock code={code ?? ""} language="tsx" filename={`${name}.tsx`} showLineNumbers maxHeight={560} className="rounded-none border-0" /> : null}
    </div>
  );
}

export function PropsTable({ component }: { component: string }) {
  const entry = API[component];
  if (!entry) return null;
  return (
    <section className="space-y-3">
      <h3 className="font-mono text-[15px] font-semibold text-kui-fg">{`<${component} />`}</h3>
      {entry.description ? <p className="text-sm text-kui-fg-muted">{entry.description}</p> : null}
      {entry.props.length ? (
        <div className="kui-scrollbar overflow-x-auto rounded-kui border border-kui-border">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-kui-surface-2 text-xs text-kui-fg-subtle">
              <tr>
                <th className="px-3 py-2 font-medium">Prop</th>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Default</th>
              </tr>
            </thead>
            <tbody>
              {entry.props.map((p) => (
                <tr key={p.name} className="border-t border-kui-border align-top">
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <code className="font-mono text-kui-accent">{p.name}</code>
                    {p.required ? <span className="ml-1 text-kui-danger" title="required">*</span> : null}
                  </td>
                  <td className="px-3 py-2.5">
                    <code className="font-mono text-xs break-words text-kui-fg-muted">{p.type}</code>
                    {p.description ? <p className="mt-1 text-xs leading-relaxed text-kui-fg-subtle">{p.description}</p> : null}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-xs whitespace-nowrap text-kui-fg-subtle">{p.default ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-kui-fg-subtle">No props.</p>
      )}
      {entry.extendsNative ? <p className="text-xs text-kui-fg-subtle">Also accepts all native HTML attributes of the root element.</p> : null}
    </section>
  );
}

/** Markdown version of a component page — for pasting into an AI assistant. */
export function componentMarkdown(item: RegistryItem) {
  const lines = [`# ${item.name} — Kestro UI`, "", item.description, "", "```tsx", `import { ${item.api.join(", ")} } from "${NPM_NAME}";`, "```", ""];
  for (const ex of item.examples) {
    lines.push(`## Example: ${ex}`, "", "```tsx", (getExample(ex).code ?? "").trim(), "```", "");
  }
  for (const c of item.api) {
    const e = API[c];
    if (!e) continue;
    lines.push(`## <${c} /> props`, "");
    if (e.description) lines.push(e.description, "");
    lines.push("| Prop | Type | Default | Description |", "|---|---|---|---|");
    for (const p of e.props) {
      lines.push(`| ${p.name}${p.required ? " (required)" : ""} | \`${p.type.replace(/\|/g, "\\|")}\` | ${p.default ? `\`${p.default}\`` : "—"} | ${p.description ?? ""} |`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

export function ComponentPage({ slug }: { slug: string }) {
  const idx = allItems.findIndex((i) => i.slug === slug);
  const item = allItems[idx];
  const { copied, copy } = useCopyToClipboard();
  if (!item) return <p className="p-10 text-kui-fg-muted">Component not found.</p>;
  const prev = allItems[idx - 1];
  const next = allItems[idx + 1];

  return (
    <article className="mx-auto w-full max-w-4xl space-y-10 px-4 py-10 sm:px-8 animate-kui-in" key={slug}>
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="accent">{item.category}</Badge>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{item.name}</h1>
          <Button variant="outline" size="sm" onClick={() => copy(componentMarkdown(item))}>
            {copied ? <Check className="text-kui-success" /> : <Sparkles />}
            {copied ? "Copied for your AI" : "Copy for AI"}
          </Button>
        </div>
        <p className="max-w-2xl text-[15.5px] leading-relaxed text-kui-fg-muted">{item.description}</p>
      </header>

      <div className="space-y-6">
        {item.examples.map((ex) => (
          <ExampleCard key={ex} name={ex} />
        ))}
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Import</h2>
        <CodeBlock code={`import { ${item.api.join(", ")} } from "${NPM_NAME}";`} language="tsx" filename="Import" />
      </section>

      <section className="space-y-8">
        <h2 className="text-xl font-semibold tracking-tight">API reference</h2>
        {item.api.map((c) => (
          <PropsTable key={c} component={c} />
        ))}
      </section>

      <nav className="flex items-center justify-between gap-4 border-t border-kui-border pt-6">
        {prev ? (
          <a href={href(`/components/${prev.slug}`)} className="group flex items-center gap-2 text-sm text-kui-fg-muted hover:text-kui-fg">
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" /> {prev.name}
          </a>
        ) : (
          <span />
        )}
        {next ? (
          <a href={href(`/components/${next.slug}`)} className="group flex items-center gap-2 text-sm text-kui-fg-muted hover:text-kui-fg">
            {next.name} <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        ) : null}
      </nav>
    </article>
  );
}
