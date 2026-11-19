# Theming

Every color, radius and shadow in Kestro UI is a CSS variable. Override them anywhere: globally, per page, or per component subtree.

## Accent color

```css
:root {
  --kui-accent: oklch(0.66 0.16 160); /* emerald */
}
```

Try the color dots in the top bar of this site: they change exactly one variable.

## All tokens

| Token | Purpose |
|---|---|
| `--kui-bg` | App background |
| `--kui-surface`, `--kui-surface-2`, `--kui-surface-3` | Cards and raised layers |
| `--kui-border`, `--kui-border-strong` | Hairlines and emphasized borders |
| `--kui-fg`, `--kui-fg-muted`, `--kui-fg-subtle` | Text hierarchy |
| `--kui-accent`, `--kui-accent-fg` | Brand color and text on it |
| `--kui-success`, `--kui-warning`, `--kui-danger`, `--kui-info` | Status colors |
| `--kui-user-bubble` | User message bubble |
| `--kui-code-*` | Code block and syntax colors |
| `--kui-radius` | Base corner radius (other radii derive from it) |
| `--kui-shadow`, `--kui-shadow-lg` | Elevation |

Light values live on `:root`; dark values on `.dark`, `[data-theme="dark"]` or `[data-kui-theme="dark"]`.

## Use the tokens in your own code

With Tailwind v4 the tokens become utilities, so your own UI matches the kit:

```tsx
<div className="rounded-kui border border-kui-border bg-kui-surface p-4 text-kui-fg-muted shadow-kui">
  …
</div>
```

## Motion

Kestro ships easing tokens you can reuse: `ease-kui-out` (expo out), `ease-kui-spring` (soft spring), `ease-kui-in-out`, and entrance animations `animate-kui-in`, `animate-kui-pop`, `animate-kui-fade` and `animate-kui-reveal`.

All animations respect `prefers-reduced-motion`.

## Overriding a single component

Every component accepts `className`, and classes are merged with `tailwind-merge`, so your utilities always win:

```tsx
<ToolCall className="rounded-none border-dashed" name="search" status="running" />
```
