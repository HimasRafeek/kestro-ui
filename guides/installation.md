# Installation

Kestro UI works with **React 18+** and is designed for **Tailwind CSS v4**, but it also ships a pre-compiled stylesheet for apps without Tailwind.

## 1. Install the package

```bash
npm install kestro-ui
# or
pnpm add kestro-ui
```

## 2. Add the styles

### Option A: Tailwind CSS v4 (recommended)

Import the theme after Tailwind in your main stylesheet. It registers the design tokens and tells Tailwind to scan Kestro's components for class names.

```css
/* app.css */
@import "tailwindcss";
@import "kestro-ui/theme.css";
```

### Option B: no Tailwind

Import the pre-compiled CSS once, for example in your root layout:

```tsx
import "kestro-ui/styles.css";
```

## 3. Use a component

```tsx
import { AgentChat, type ChatMessage } from "kestro-ui";
import { useState } from "react";

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  return (
    <div className="h-dvh">
      <AgentChat
        messages={messages}
        agent={{ name: "Atlas", description: "Your travel concierge" }}
        suggestions={["Plan a weekend in Lisbon", "Find a quiet hotel"]}
        onSend={(text) =>
          setMessages((m) => [...m, { id: crypto.randomUUID(), role: "user", content: text }])
        }
      />
    </div>
  );
}
```

## Dark mode

Kestro UI follows a `.dark` class (or `data-theme="dark"`) on any ancestor, the same convention as Tailwind and shadcn/ui:

```html
<html class="dark">
```

## Next.js

All components are client components and the package ships with a `"use client"` directive, so you can import them directly into Server Component pages.

## Requirements

- React 18 or 19
- Tailwind CSS v4 (Option A) or any setup (Option B)
- Modern evergreen browsers (uses `oklch()`, `color-mix()` and container queries)
