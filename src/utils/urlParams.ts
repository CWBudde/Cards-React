/**
 * URL parameter utilities for seed management
 */

const SEED_PARAM = "seed";

/**
 * Read seed from URL search parameters
 */
export function readSeedFromUrl(): number | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const params = new URLSearchParams(window.location.search);
    const seedParam = params.get(SEED_PARAM);

    if (seedParam === null) {
      return null;
    }

    const seed = Number(seedParam);
    return Number.isFinite(seed) && seed > 0 ? seed : null;
  } catch {
    return null;
  }
}

/**
 * Update URL with the current seed (without page reload)
 */
export function updateUrlWithSeed(seed: number): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const url = new URL(window.location.href);
    url.searchParams.set(SEED_PARAM, String(seed));
    window.history.replaceState({}, "", url.toString());
  } catch {
    // Ignore URL update errors
  }
}

/**
 * Remove seed from URL (without page reload)
 */
export function removeSeedFromUrl(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const url = new URL(window.location.href);
    url.searchParams.delete(SEED_PARAM);
    window.history.replaceState({}, "", url.toString());
  } catch {
    // Ignore URL update errors
  }
}
