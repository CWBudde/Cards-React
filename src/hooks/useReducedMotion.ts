/**
 * Hook for detecting and respecting reduced motion preferences
 */

import { useEffect, useState } from "react";
import { getSystemReducedMotion } from "../utils/drag";

export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(() =>
    getSystemReducedMotion()
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return reducedMotion;
}
