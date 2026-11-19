// Publishes apps/docs/dist to the `gh-pages` branch of the `origin` remote.
// Run via `pnpm deploy:docs` (which builds first). No GitHub Actions needed.
import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "apps/docs/dist");
if (!existsSync(join(dist, "index.html"))) throw new Error("apps/docs/dist is missing — run `pnpm build:docs` first.");

const remote = execSync("git remote get-url origin", { cwd: root }).toString().trim();
const sha = execSync("git rev-parse --short HEAD", { cwd: root }).toString().trim();
const tmp = mkdtempSync(join(tmpdir(), "kestro-pages-"));
const run = (cmd) => execSync(cmd, { cwd: tmp, stdio: "inherit" });

try {
  cpSync(dist, tmp, { recursive: true });
  writeFileSync(join(tmp, ".nojekyll"), ""); // serve files as-is
  run("git init -q -b gh-pages");
  run("git add -A");
  run(`git commit -q -m "Deploy docs from ${sha}"`);
  run(`git push -f -q "${remote}" gh-pages`);
  console.log(`✓ Docs deployed from ${sha} to gh-pages`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
