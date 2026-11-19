import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

export default defineConfig({
  base: "./", // relative assets → works on GitHub Pages under /kestro-ui/
  plugins: [react(), tailwindcss()],
  resolve: {
    // Use the library source directly for instant HMR while developing.
    alias: {
      "kestro-ui": fileURLToPath(new URL("../../packages/kestro-ui/src/index.ts", import.meta.url)),
    },
  },
  server: { port: 5173 },
});
