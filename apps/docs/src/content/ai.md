# Using with AI assistants

Kestro UI is designed to be easy for **AI coding assistants** (Claude Code, Cursor, Copilot, Codex, v0…) to use correctly.

## llms.txt

This site publishes machine-readable docs following the [llms.txt](https://llmstxt.org) convention:

- **[llms.txt](./llms.txt)**: a short index of every component with one-line descriptions and links.
- **[llms-full.txt](./llms-full.txt)**: the complete documentation in one file: guides, every example's source code, and full prop tables generated from the TypeScript types.

Point your assistant at it:

```text
Build this with the Kestro UI component library.
Docs: https://himasrafeek.github.io/kestro-ui/llms-full.txt
```

## AGENTS.md in the package

The npm package ships `AGENTS.md` and `llms-full.txt` next to the code, so assistants that read `node_modules` can discover the API offline:

```text
node_modules/kestro-ui/AGENTS.md
node_modules/kestro-ui/llms-full.txt
```

## Copy for AI

Every component page has a **Copy for AI** button. It copies a Markdown version of the page (description, import, example code and props table) that you can paste straight into a chat.

## Tips for prompting

- Ask for *Kestro UI components* and name the ones you want (`AgentChat`, `ToolApproval`, `TaskPlan`…).
- For full chat UIs, ask the assistant to use `<AgentChat>` with the `ChatMessage` parts format.
- For custom tool UIs, ask for `renderTool` / `renderData` instead of re-implementing message rendering.
- Remind it to add `@import "kestro-ui/theme.css";` after `@import "tailwindcss";`.

## Fully typed

Every prop is typed and documented with JSDoc, so editors and assistants get autocomplete and inline docs.
