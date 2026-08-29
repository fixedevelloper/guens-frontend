"use client";

import { useEffect, useState } from "react";

/** SSR-safe matchMedia hook - starts false (matches nothing) until mounted, then tracks live. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);
    mql.addEventListener("change", listener);
    return () => mql.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

/** Matches Tailwind's default `lg` breakpoint (1024px) - see tailwind.config / globals.css. */
export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1024px)");
}
