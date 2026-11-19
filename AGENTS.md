# Working on the Kestro UI repository

Guide for AI coding assistants making changes to this repo. (For *using* the library in an app, see `packages/kestro-ui/AGENTS.md`.)

## Layout

- `packages/kestro-ui/`: the library, published to npm as `kestro-ui`.
  - `src/components/*.tsx`: components, re-exported from `src/index.ts`.
  - `src/lib/`: hooks and utilities (`cn`, `useSmoothText`, `useStickToBottom`, audio hooks, highlighter).
  - `src/theme.css`: design tokens (`--kui-*`), the opt-in Kestro palette, animations and utilities.
- `apps/docs/`: the documentation site (Vite + React, hash-routed for GitHub Pages).
  - `src/registry.json`: every docs page: slug, description, example files and API names.
  - `src/examples/<slug>.tsx`: live examples. The same file is rendered *and* shown as source.
  - `src/content/*.md`: guides.
  - `src/demos/`: full-screen example apps.
- `scripts/`: `extract-api.mjs` (props → `apps/docs/src/generated/api.json`), `generate-llms.mjs` (llms.txt files), `screenshots.mjs` (README images), `deploy-docs.mjs` (publishes `gh-pages`).

## Commands

```bash
pnpm dev           # docs site with the library source hot-reloaded
pnpm docs:gen      # regenerate api.json + llms files after changing props
pnpm typecheck
pnpm build:lib
pnpm deploy:docs   # build docs and push to the gh-pages branch
```

## Rules

- Style only with Tailwind utilities that use the `kui` tokens (`bg-kui-surface`, `text-kui-fg-muted`, `border-kui-border`, `rounded-kui`…). Don't hard-code colors except inside SVG instruments.
- Components must work in light and dark themes, respect `prefers-reduced-motion`, and accept `className`.
- Document props with JSDoc. It feeds the docs props tables and `llms-full.txt`.
- A new component needs an example in `apps/docs/src/examples/`, an entry in `registry.json`, and then `pnpm docs:gen`.
- Don't change the look of existing components without being asked. Add a variant or a new component instead.
- Example copy should be realistic and domain-neutral: travel, support, finance, research, ops. Avoid generic AI-startup visuals.
- The project is solo-maintained, so don't add contribution tooling that invites pull requests.
