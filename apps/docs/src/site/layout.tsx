import * as React from "react";
import { Menu, Moon, Sun, X, Bot } from "lucide-react";
import { cn } from "kestro-ui";
import { categories, guides, GITHUB_URL, VERSION } from "../lib/site";
import { href } from "../lib/router";

export function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <a href={href("/")} className={cn("flex items-center gap-2 font-semibold tracking-tight", className)}>
      <span className="flex size-7 items-center justify-center rounded-md bg-kui-accent font-display text-[15px] text-kui-accent-fg">K</span>
      <span className="font-display text-[15px] tracking-tight">Kestro UI</span>
    </a>
  );
}

// "" = the palette's own accent (rufous in Kestro), which adapts to light/dark.
const accents = [
  { name: "Rufous", value: "", swatch: "oklch(0.6 0.14 45)" },
  { name: "Slate blue", value: "oklch(0.55 0.1 250)", swatch: "oklch(0.55 0.1 250)" },
  { name: "Moss", value: "oklch(0.56 0.1 148)", swatch: "oklch(0.56 0.1 148)" },
  { name: "Ochre", value: "oklch(0.66 0.13 78)", swatch: "oklch(0.66 0.13 78)" },
  { name: "Ink", value: "oklch(0.3 0.02 255)", swatch: "oklch(0.3 0.02 255)" },
];

export function useTheme() {
  const [dark, setDark] = React.useState(() => {
    try {
      const saved = localStorage.getItem("kui-theme");
      if (saved) return saved === "dark";
    } catch {}
    return typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  });
  const [accent, setAccent] = React.useState(() => {
    try {
      return localStorage.getItem("kui-accent-v2") ?? "";
    } catch {
      return accents[0].value;
    }
  });
  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    try {
      localStorage.setItem("kui-theme", dark ? "dark" : "light");
    } catch {}
  }, [dark]);
  React.useEffect(() => {
    if (accent) document.documentElement.style.setProperty("--kui-accent", accent);
    else document.documentElement.style.removeProperty("--kui-accent");
    try {
      localStorage.setItem("kui-accent-v2", accent);
    } catch {}
  }, [accent]);
  return { dark, setDark, accent, setAccent };
}

export function TopNav({ path, onMenu }: { path: string; onMenu?: () => void }) {
  const { dark, setDark, accent, setAccent } = useTheme();
  const link = (to: string, label: string, match: string) => (
    <a
      href={href(to)}
      className={cn(
        "rounded-md px-2.5 py-1.5 text-[13.5px] font-medium transition-colors",
        path.startsWith(match) ? "text-kui-fg" : "text-kui-fg-muted hover:text-kui-fg",
      )}
    >
      {label}
    </a>
  );
  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-kui-border bg-kui-bg/80 px-4 backdrop-blur-xl">
      {onMenu ? (
        <button onClick={onMenu} className="-ml-1 flex size-8 items-center justify-center rounded-md text-kui-fg-muted lg:hidden" aria-label="Open menu">
          <Menu className="size-5" />
        </button>
      ) : null}
      <Logo />
      <span className="hidden rounded-full border border-kui-border px-2 py-0.5 font-mono text-[10.5px] text-kui-fg-subtle sm:inline">v{VERSION}</span>
      <nav className="ml-2 hidden items-center gap-0.5 md:flex">
        {link("/docs/introduction", "Docs", "/docs")}
        {link("/components/agent-chat", "Components", "/components")}
        {link("/examples", "Examples", "/examples")}
        {link("/docs/ai", "For AI", "/docs/ai")}
      </nav>
      <div className="ml-auto flex items-center gap-2">
        <div className="mr-1 hidden items-center gap-1.5 sm:flex" aria-label="Accent color">
          {accents.map((a) => (
            <button
              key={a.name}
              title={a.name}
              aria-label={`${a.name} accent`}
              onClick={() => setAccent(a.value)}
              className={cn("size-3.5 cursor-pointer rounded-full ring-offset-2 ring-offset-kui-bg transition", accent === a.value ? "ring-2 ring-kui-fg-muted" : "hover:scale-125")}
              style={{ background: a.swatch }}
            />
          ))}
        </div>
        <button
          onClick={() => setDark(!dark)}
          className="flex size-8 cursor-pointer items-center justify-center rounded-md text-kui-fg-muted transition-colors hover:bg-kui-surface-2 hover:text-kui-fg"
          aria-label="Toggle theme"
        >
          {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex size-8 items-center justify-center rounded-md text-kui-fg-muted transition-colors hover:bg-kui-surface-2 hover:text-kui-fg"
          aria-label="GitHub"
        >
          <GithubIcon className="size-[18px]" />
        </a>
      </div>
    </header>
  );
}

export function Sidebar({ path, open, onClose }: { path: string; open: boolean; onClose: () => void }) {
  const item = (to: string, label: string) => {
    const active = path === to;
    return (
      <a
        key={to}
        href={href(to)}
        onClick={onClose}
        className={cn(
          "block rounded-md px-2.5 py-1.5 text-[13.5px] transition-colors",
          active ? "bg-kui-accent-soft font-medium text-kui-accent" : "text-kui-fg-muted hover:bg-kui-surface-2 hover:text-kui-fg",
        )}
      >
        {label}
      </a>
    );
  };
  const content = (
    <div className="space-y-6 p-4 pb-16">
      <div>
        <div className="mb-1.5 px-2.5 text-[11px] font-semibold tracking-wider text-kui-fg-subtle uppercase">Getting started</div>
        {guides.map((g) => item(`/docs/${g.slug}`, g.title))}
        {item("/examples", "Examples")}
      </div>
      {categories.map((c) => (
        <div key={c.id}>
          <div className="mb-1.5 flex items-center gap-1.5 px-2.5 text-[11px] font-semibold tracking-wider text-kui-fg-subtle uppercase">
            {c.id === "hud" ? <Bot className="size-3 text-kui-accent" /> : null}
            {c.title}
          </div>
          {c.items.map((i) => item(`/components/${i.slug}`, i.name))}
        </div>
      ))}
    </div>
  );
  return (
    <>
      <aside className="kui-scrollbar sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-64 shrink-0 overflow-y-auto border-r border-kui-border lg:block">{content}</aside>
      <div className={cn("fixed inset-0 z-50 lg:hidden", open ? "pointer-events-auto" : "pointer-events-none")}>
        <div className={cn("absolute inset-0 bg-black/50 transition-opacity duration-300", open ? "opacity-100" : "opacity-0")} onClick={onClose} />
        <div
          className={cn(
            "kui-scrollbar absolute inset-y-0 left-0 w-72 overflow-y-auto border-r border-kui-border bg-kui-bg transition-transform duration-500 ease-kui-out",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex h-14 items-center justify-between border-b border-kui-border px-4">
            <Logo />
            <button onClick={onClose} aria-label="Close menu" className="text-kui-fg-muted">
              <X className="size-5" />
            </button>
          </div>
          {content}
        </div>
      </div>
    </>
  );
}
