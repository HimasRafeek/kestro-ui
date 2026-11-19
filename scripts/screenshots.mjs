// Captures README / social images with headless Chrome (isolated temp profile).
// Usage: start the docs site (pnpm dev), then: node scripts/screenshots.mjs [baseUrl]
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, copyFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const base = process.argv[2] ?? "http://localhost:5173/";
const out = resolve(root, ".github/assets");
mkdirSync(out, { recursive: true });

const chrome = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].find((p) => p && existsSync(p));
if (!chrome) throw new Error("Chrome not found — set CHROME_PATH");

const only = process.argv.slice(3);
const allShots = [
  { name: "banner", hash: "#/banner", size: "1280,640", wait: 2500 },
  { name: "hero", hash: "#/", size: "1440,900", wait: 9000 },
  { name: "team", hash: "#/examples/team", size: "1440,900", wait: 15000 },
  { name: "deck", hash: "#/examples/deck", size: "1440,900", wait: 9000 },
  { name: "usage", hash: "#/examples/usage", size: "1440,1400", wait: 4000 },
  { name: "chat", hash: "#/examples/chat?autoplay=Plan%20a%20weekend%20trip%20to%20Lisbon%20next%20Friday", size: "1440,900", wait: 30000 },
  { name: "research", hash: "#/examples/chat?autoplay=Research%20AI%20agent%20adoption", size: "1440,900", wait: 30000 },
  { name: "jarvis", hash: "#/examples/jarvis?noboot=1&autoplay=status", size: "1440,900", wait: 9000, dark: true },
  { name: "run", hash: "#/examples/run", size: "1440,900", wait: 2500 },
  { name: "voice", hash: "#/examples/voice", size: "1440,900", wait: 2500 },
  { name: "gallery", hash: "#/examples/gallery", size: "1440,900", wait: 2500 },
  { name: "docs", hash: "#/components/tool-approval", size: "1440,900", wait: 2500 },
  { name: "tasks", hash: "#/components/task-board", size: "1440,900", wait: 3000 },
  { name: "creator", hash: "#/components/task-creator", size: "1440,1100", wait: 3000 },
];
const shots = only.length ? allShots.filter((s) => only.includes(s.name)) : allShots;

for (const s of shots) {
  const profile = mkdtempSync(join(tmpdir(), "kestro-shot-"));
  const file = join(out, `${s.name}.png`);
  execFileSync(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=2",
    ...(s.dark ? ["--force-dark-mode"] : []),
    `--user-data-dir=${profile}`,
    `--window-size=${s.size}`,
    `--virtual-time-budget=${s.wait}`,
    `--screenshot=${file}`,
    base + s.hash + (s.hash.includes("?") ? "&shot=1" : "?shot=1"),
  ], { stdio: "ignore", timeout: 120000 });
  rmSync(profile, { recursive: true, force: true });
  console.log(`✓ ${s.name}.png`);
}
if (shots.some((s) => s.name === "banner")) copyFileSync(join(out, "banner.png"), resolve(root, "apps/docs/public/og.png"));
console.log("✓ og.png");
