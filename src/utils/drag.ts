/**
 * Utility functions for drag-and-drop operations
 */

import type { DropTarget } from "../types/drag";

export function areTargetsEqual(
  a: DropTarget | null,
  b: DropTarget | null
): boolean {
  if (a === b) {
    return true;
  }

  if (!a || !b) {
    return false;
  }

  if (a.type !== b.type) {
    return false;
  }

  if (a.type === "tableau") {
    return b.type === "tableau" && a.pileIndex === b.pileIndex;
  }

  return b.type === "foundation" && a.foundationIndex === b.foundationIndex;
}

export function getDropTargetFromPoint(
  x: number,
  y: number
): DropTarget | null {
  const element = document.elementFromPoint(x, y) as HTMLElement | null;
  if (!element) {
    return null;
  }

  const foundationEl = element.closest<HTMLElement>(
    "[data-foundation-index]"
  );
  if (foundationEl) {
    const foundationIndex = Number(foundationEl.dataset.foundationIndex);
    return Number.isFinite(foundationIndex)
      ? ({ type: "foundation", foundationIndex } as DropTarget)
      : null;
  }

  const tableauEl = element.closest<HTMLElement>("[data-tableau-index]");
  if (tableauEl) {
    const pileIndex = Number(tableauEl.dataset.tableauIndex);
    return Number.isFinite(pileIndex)
      ? ({ type: "tableau", pileIndex } as DropTarget)
      : null;
  }

  return null;
}

export function getSystemReducedMotion(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
