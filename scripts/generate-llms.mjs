// Generates AI-readable documentation from the same sources as the docs site:
//   apps/docs/public/llms.txt              — index (llmstxt.org format)
//   apps/docs/public/llms-full.txt         — everything in one file
//   apps/docs/public/components/<slug>.md  — one page per component
//   packages/kestro-ui/llms-full.txt       — shipped inside the npm package
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const docs = resolve(root, "apps/docs");
const SITE = "https://himasrafeek.github.io/kestro-ui";
const read = (p) => readFileSync(resolve(docs, p), "utf8");

const registry = JSON.parse(read("src/registry.json"));
const api = JSON.parse(read("src/generated/api.json"));
const pkg = JSON.parse(readFileSync(resolve(root, "packages/kestro-ui/package.json"), "utf8"));

const esc = (s) => String(s).replace(/\|/g, "\\|").replace(/\n/g, " ");

function propsTable(name) {
  const e = api[name];
  if (!e) return "";
  const out = [`### <${name} />`, ""];
  if (e.description) out.push(e.description, "");
  if (e.props.length) {
    out.push("| Prop | Type | Default | Description |", "|---|---|---|---|");
    for (const p of e.props) {
      out.push(`| \`${p.name}\`${p.required ? " **(required)**" : ""} | \`${esc(p.type)}\` | ${p.default ? `\`${esc(p.default)}\`` : "—"} | ${esc(p.description ?? "")} |`);
    }
  } else out.push("No props.");
  if (e.extendsNative) out.push("", "Also accepts the native HTML attributes of its root element.");
  return out.join("\n");
}

function componentDoc(item, category) {
  const lines = [
    `# ${item.name}`,
    "",
    `> Category: ${category} · Package: \`${pkg.name}\``,
    "",
    item.description,
    "",
    "## Import",
    "",
    "```tsx",
    `import { ${item.api.join(", ")} } from "${pkg.name}";`,
    "```",
    "",
  ];
  for (const ex of item.examples) {
    const file = resolve(docs, `src/examples/${ex}.tsx`);
    if (!existsSync(file)) continue;
    lines.push(`## Example: ${ex}`, "", "```tsx", readFileSync(file, "utf8").trim(), "```", "");
  }
  lines.push("## API", "");
  for (const c of item.api) lines.push(propsTable(c), "");
  return lines.join("\n");
}

const header = [
  `# Kestro UI`,
  "",
  `> ${pkg.description}`,
  "",
  `Install: \`npm i ${pkg.name}\`. With Tailwind CSS v4 add \`@import "tailwindcss"; @import "${pkg.name}/theme.css";\` to your CSS. Without Tailwind: \`import "${pkg.name}/styles.css"\`. Dark mode: add the \`dark\` class to an ancestor. All components are named exports of \`${pkg.name}\`.`,
  "",
  "Fastest path: `<AgentChat messages={messages} status={status} onSend={(text) => …} />` renders a complete agent chat. Messages are `{ id, role, content }` or `{ id, role, parts }` where parts follow the Vercel AI SDK UIMessage format (text, reasoning, tool-<name>, source-url, file, data-<name>).",
  "",
];

// ---------- llms.txt (index) ----------
const index = [...header, "## Guides", ""];
for (const g of registry.guides) index.push(`- [${g.title}](${SITE}/guides/${g.slug}.md)`);
index.push("");
for (const cat of registry.categories) {
  index.push(`## ${cat.title}`, "");
  for (const i of cat.items) index.push(`- [${i.name}](${SITE}/components/${i.slug}.md): ${i.description}`);
  index.push("");
}
index.push("## Optional", "", `- [Full documentation in one file](${SITE}/llms-full.txt)`, `- [Source code](https://github.com/HimasRafeek/kestro-ui)`, "");

// ---------- per-page markdown + llms-full.txt ----------
const full = [...header];
mkdirSync(resolve(docs, "public/components"), { recursive: true });
mkdirSync(resolve(docs, "public/guides"), { recursive: true });

for (const g of registry.guides) {
  const md = read(`src/content/${g.slug}.md`);
  writeFileSync(resolve(docs, `public/guides/${g.slug}.md`), md);
  full.push(md.trim(), "", "---", "");
}
for (const cat of registry.categories) {
  for (const i of cat.items) {
    const md = componentDoc(i, cat.title);
    writeFileSync(resolve(docs, `public/components/${i.slug}.md`), md);
    full.push(md.trim(), "", "---", "");
  }
}

// Components without a dedicated page still get their API listed.
const documented = new Set(registry.categories.flatMap((c) => c.items.flatMap((i) => i.api)));
const rest = Object.keys(api).filter((n) => !documented.has(n));
if (rest.length) {
  full.push("# Other exports", "");
  for (const n of rest) full.push(propsTable(n), "");
}

writeFileSync(resolve(docs, "public/llms.txt"), index.join("\n"));
writeFileSync(resolve(docs, "public/llms-full.txt"), full.join("\n"));
writeFileSync(resolve(root, "packages/kestro-ui/llms-full.txt"), full.join("\n"));
console.log(`✓ llms.txt, llms-full.txt (${Math.round(full.join("\n").length / 1024)} KB) and ${registry.categories.reduce((a, c) => a + c.items.length, 0)} component pages generated`);
