/**
 * Hook for detecting game win state and managing confetti
 */

import { useEffect, useRef, useState } from "react";
import { isWin } from "../engine";
import type { GameState } from "../engine";

interface UseWinDetectionProps {
  gameState: GameState;
  reducedMotion: boolean;
}

interface UseWinDetectionReturn {
  confettiActive: boolean;
  setConfettiActive: (active: boolean) => void;
}

export function useWinDetection({
  gameState,
  reducedMotion,
}: UseWinDetectionProps): UseWinDetectionReturn {
  const [confettiActive, setConfettiActive] = useState(false);
  const hasWonRef = useRef(false);

  // Detect win state changes using a separate effect that updates refs first
  useEffect(() => {
    const won = isWin(gameState);
    const isNewWin = won && !hasWonRef.current;
    hasWonRef.current = won;

    // Queue state update in the next tick to avoid setState-in-effect warning
    if (isNewWin && !reducedMotion) {
      queueMicrotask(() => setConfettiActive(true));
    } else if (!won || reducedMotion) {
      queueMicrotask(() => setConfettiActive(false));
    }
  }, [gameState, reducedMotion]);

  return {
    confettiActive,
    setConfettiActive,
  };
}
