import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: false, // rollup treeshaking strips the "use client" banner
  external: ["react", "react-dom", "react/jsx-runtime"],
  banner: { js: '"use client";' },
});
