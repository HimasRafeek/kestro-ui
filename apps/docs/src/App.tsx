import * as React from "react";
import { ArrowLeft } from "lucide-react";
import { Markdown } from "kestro-ui";
import { useRoute, href } from "./lib/router";
import { getGuide, guides } from "./lib/site";
import { Sidebar, TopNav } from "./site/layout";
import { Home, ExampleGrid } from "./site/home";
import { ComponentPage } from "./site/component-page";
import { ChatDemo } from "./demos/chat-demo";
import { RunDemo } from "./demos/run-demo";
import { VoiceWidgetDemo } from "./demos/voice-widget-demo";
import { JarvisDemo } from "./demos/jarvis-demo";
import { TeamDemo } from "./demos/team-demo";
import { FlightDeckDemo } from "./demos/flight-deck-demo";
import { Gallery } from "./demos/gallery";
import { Banner } from "./site/banner";

const demos: Record<string, { title: string; el: React.ReactNode }> = {
  chat: { title: "Agent Chat", el: <ChatDemo /> },
  team: { title: "Agent team", el: <TeamDemo /> },
  deck: { title: "Flight deck", el: <FlightDeckDemo /> },
  jarvis: { title: "Voice console", el: <JarvisDemo /> },
  run: { title: "Agent Run", el: <RunDemo /> },
  voice: { title: "Voice & Widget", el: <VoiceWidgetDemo /> },
  gallery: { title: "Component gallery", el: <Gallery /> },
};

function GuidePage({ slug }: { slug: string }) {
  const md = getGuide(slug);
  const i = guides.findIndex((g) => g.slug === slug);
  const next = guides[i + 1];
  return (
    <article key={slug} className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-8 animate-kui-in">
      {md ? (
        <Markdown className="text-[15.5px] [&_h1]:text-4xl [&_h1]:mb-5 [&_h2]:mt-10 [&_h2]:border-t [&_h2]:border-kui-border [&_h2]:pt-8 [&_p]:text-kui-fg-muted [&_li]:text-kui-fg-muted">
          {md}
        </Markdown>
      ) : (
        <p className="text-kui-fg-muted">Page not found.</p>
      )}
      {next ? (
        <a href={href(`/docs/${next.slug}`)} className="mt-12 flex items-center justify-between rounded-kui border border-kui-border p-4 transition-colors hover:border-kui-accent/40">
          <span className="text-sm text-kui-fg-subtle">Next</span>
          <span className="font-medium">{next.title} →</span>
        </a>
      ) : null}
    </article>
  );
}

export function App() {
  const path = useRoute();
  const [menu, setMenu] = React.useState(false);

  if (path === "/banner") return <Banner />;

  // Full-screen demos
  const demo = path.match(/^\/examples\/([\w-]+)/)?.[1];
  if (demo && demos[demo]) {
    return (
      <div className="flex h-dvh flex-col">
        <TopNav path={path} />
        <div className="flex h-10 shrink-0 items-center gap-3 border-b border-kui-border px-4 text-sm">
          <a href={href("/examples")} className="flex items-center gap-1.5 text-kui-fg-muted hover:text-kui-fg">
            <ArrowLeft className="size-4" /> Examples
          </a>
          <span className="text-kui-fg-subtle">/</span>
          <span className="font-medium">{demos[demo].title}</span>
        </div>
        <div className="min-h-0 flex-1">{demos[demo].el}</div>
      </div>
    );
  }

  if (path === "/") {
    return (
      <div id="kui-main" className="h-dvh overflow-y-auto">
        <TopNav path={path} />
        <Home />
      </div>
    );
  }

  let page: React.ReactNode;
  const comp = path.match(/^\/components\/([\w-]+)/)?.[1];
  const guide = path.match(/^\/docs\/([\w-]+)/)?.[1];
  if (comp) page = <ComponentPage slug={comp} />;
  else if (guide) page = <GuidePage slug={guide} />;
  else if (path.startsWith("/examples"))
    page = (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-8 animate-kui-in">
        <h1 className="mb-2 text-3xl font-semibold tracking-tight">Examples</h1>
        <p className="mb-8 text-kui-fg-muted">Complete, interactive screens built only with Kestro UI components.</p>
        <ExampleGrid />
      </div>
    );
  else page = <p className="p-10 text-kui-fg-muted">Not found.</p>;

  return (
    <div id="kui-main" className="h-dvh overflow-y-auto">
      <TopNav path={path} onMenu={() => setMenu(true)} />
      <div className="flex">
        <Sidebar path={path} open={menu} onClose={() => setMenu(false)} />
        <main className="min-w-0 flex-1">{page}</main>
      </div>
    </div>
  );
}
