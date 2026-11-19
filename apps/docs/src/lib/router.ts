import * as React from "react";

/** Minimal hash router — works on GitHub Pages with zero server config. */
export function useRoute() {
  const read = () => window.location.hash.replace(/^#/, "").split("?")[0] || "/";
  const [path, setPath] = React.useState(read);
  React.useEffect(() => {
    const on = () => {
      setPath(read());
      if (!window.location.hash.includes("?keep")) document.getElementById("kui-main")?.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return path;
}

export const href = (path: string) => `#${path}`;
