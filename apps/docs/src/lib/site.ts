import type * as React from "react";
import registry from "../registry.json";

export const GITHUB_URL = "https://github.com/HimasRafeek/kestro-ui";
export const NPM_NAME = "kestro-ui";
export const VERSION = "0.1.0";

export type RegistryItem = { slug: string; name: string; description: string; examples: string[]; api: string[] };
export type Category = { id: string; title: string; items: RegistryItem[] };

export const categories = registry.categories as Category[];
export const guides = registry.guides as { slug: string; title: string }[];
export const allItems = categories.flatMap((c) => c.items.map((i) => ({ ...i, category: c.title })));

// Live example components + their raw source (shown as code).
const modules = import.meta.glob<{ default: React.ComponentType }>("../examples/*.tsx", { eager: true });
const sources = import.meta.glob<string>("../examples/*.tsx", { eager: true, query: "?raw", import: "default" });

export function getExample(name: string) {
  const key = `../examples/${name}.tsx`;
  return { Component: modules[key]?.default, code: sources[key] };
}

const guideFiles = import.meta.glob<string>("../content/*.md", { eager: true, query: "?raw", import: "default" });
export const getGuide = (slug: string) => guideFiles[`../content/${slug}.md`];
