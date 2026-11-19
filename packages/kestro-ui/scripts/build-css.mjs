// Builds the two CSS entry points shipped with the package:
//  - dist/theme.css  : design tokens + animations + @source for Tailwind v4 users
//  - dist/styles.css : fully compiled stylesheet for apps without Tailwind
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const cli = join(dirname(require.resolve("@tailwindcss/cli/package.json")), "dist/index.mjs");

mkdirSync("dist", { recursive: true });
copyFileSync("src/theme.css", "dist/theme.css");
execFileSync(process.execPath, [cli, "-i", "src/styles.css", "-o", "dist/styles.css", "--minify"], { stdio: "inherit" });
console.log("✓ CSS built: dist/theme.css, dist/styles.css");
