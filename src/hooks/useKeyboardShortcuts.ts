/**
 * Hook for managing keyboard shortcuts
 */

import { useCallback, useEffect } from "react";

interface UseKeyboardShortcutsProps {
  onNew: () => void;
  onRetry: () => void;
  onUndo: () => void;
  onFinish: () => void;
  onSolve: () => void;
}

export function useKeyboardShortcuts({
  onNew,
  onRetry,
  onUndo,
  onFinish,
  onSolve,
}: UseKeyboardShortcutsProps): void {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.target && (event.target as HTMLElement).tagName === "INPUT") {
        return;
      }

      switch (event.key.toLowerCase()) {
        case "n":
          onNew();
          break;
        case "r":
          onRetry();
          break;
        case "u":
          onUndo();
          break;
        case "f":
          onFinish();
          break;
        case "s":
          onSolve();
          break;
        default:
          break;
      }
    },
    [onFinish, onNew, onRetry, onSolve, onUndo]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
