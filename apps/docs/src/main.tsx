import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

// The docs site is dressed in the opt-in Kestro palette.
document.documentElement.dataset.kuiPalette = "kestro";
// `?shot` in the URL freezes motion for README screenshots (headless Chrome skips CSS animations).
if (window.location.hash.includes("shot")) document.documentElement.classList.add("kui-shot");
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
