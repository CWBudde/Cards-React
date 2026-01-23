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

  useEffect(() => {
    const won = isWin(gameState);
    if (won && !hasWonRef.current) {
      setConfettiActive(true);
    }
    hasWonRef.current = won;
    if (!won) {
      setConfettiActive(false);
    }
  }, [gameState]);

  useEffect(() => {
    if (reducedMotion) {
      setConfettiActive(false);
    }
  }, [reducedMotion]);

  return {
    confettiActive,
    setConfettiActive,
  };
}
