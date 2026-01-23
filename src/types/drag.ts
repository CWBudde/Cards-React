/**
 * Type definitions for drag-and-drop functionality
 */

import type { Card } from "../engine";

export type DragSource =
  | { type: "tableau"; pileIndex: number; cardIndex: number }
  | { type: "foundation"; foundationIndex: number };

export type DropTarget =
  | { type: "tableau"; pileIndex: number }
  | { type: "foundation"; foundationIndex: number };

export interface DragState {
  pointerId: number;
  source: DragSource;
  stack: Card[];
  grabOffset: { x: number; y: number };
  position: { x: number; y: number };
  target: DropTarget | null;
  isTargetValid: boolean;
}

export interface PendingDrag {
  pointerId: number;
  source: DragSource;
  stack: Card[];
  grabOffset: { x: number; y: number };
  startX: number;
  startY: number;
  captureElement: HTMLElement;
}

export const HOVER_HIGHLIGHT_DELAY_MS = 180;
export const DRAG_THRESHOLD_PX = 5;
