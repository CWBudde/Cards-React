/**
 * Main App component
 */

import { useState } from "react";
import {
  isSolvableSeed,
  readStoredCardBackStyle,
  useGame,
} from "./hooks/useGame";
import { useLayout } from "./hooks/useLayout";
import { useDragAndDrop } from "./hooks/useDragAndDrop";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useReducedMotion } from "./hooks/useReducedMotion";
import { useWinDetection } from "./hooks/useWinDetection";
import { TopBar } from "./components/TopBar";
import { Foundations } from "./components/Foundations";
import { Tableau } from "./components/Tableau";
import { Card } from "./components/Card";
import { Confetti } from "./components/Confetti";
import "./App.css";

function App() {
  const {
    gameState,
    startNewGame,
    retryGame,
    performUndo,
    performMove,
    performFinish,
    performSolve,
  } = useGame();
  const layout = useLayout();
  const [cardBackStyle] = useState(() => readStoredCardBackStyle());
  const reducedMotion = useReducedMotion();

  const handleFinish = () => {
    performFinish();
  };

  const handleSolve = () => {
    performSolve(200);
  };

  useKeyboardShortcuts({
    onNew: startNewGame,
    onRetry: retryGame,
    onUndo: performUndo,
    onFinish: handleFinish,
    onSolve: handleSolve,
  });

  const { confettiActive, setConfettiActive } = useWinDetection({
    gameState,
    reducedMotion,
  });

  const {
    dragState,
    hoverTarget,
    hoverIsValid,
    dragPreviewRef,
    startTableauDrag,
    startFoundationDrag,
    handleTableauDoubleClick,
  } = useDragAndDrop({
    gameState,
    performMove,
  });

  return (
    <div className={`app${reducedMotion ? " reduced-motion" : ""}`}>
      <TopBar
        seed={gameState.seed}
        isSolvable={isSolvableSeed(gameState.seed)}
        onNew={() => startNewGame()}
        onRetry={retryGame}
        onFinish={handleFinish}
        onSolve={handleSolve}
        onUndo={performUndo}
      />
      <Foundations
        foundations={gameState.foundations}
        cardWidth={layout.cardWidth}
        cardHeight={layout.cardHeight}
        cardBackStyle={cardBackStyle}
        spacing={layout.foundationSpacing}
        onCardPointerDown={startFoundationDrag}
        draggingFoundation={
          dragState?.source.type === "foundation"
            ? { foundationIndex: dragState.source.foundationIndex }
            : null
        }
        dropTarget={hoverTarget?.type === "foundation" ? hoverTarget : null}
        isDropTargetValid={hoverIsValid}
      />
      <Tableau
        tableau={gameState.tableau}
        cardWidth={layout.cardWidth}
        cardHeight={layout.cardHeight}
        cardBackStyle={cardBackStyle}
        overlapDistance={layout.tableauOverlap}
        spacing={layout.tableauSpacing}
        tableauTopOffset={layout.tableauTopOffset}
        onCardPointerDown={startTableauDrag}
        onCardDoubleClick={handleTableauDoubleClick}
        draggingTableau={
          dragState?.source.type === "tableau"
            ? {
                pileIndex: dragState.source.pileIndex,
                cardIndex: dragState.source.cardIndex,
              }
            : null
        }
        dropTarget={hoverTarget?.type === "tableau" ? hoverTarget : null}
        isDropTargetValid={hoverIsValid}
      />
      {dragState ? (
        <div className="drag-layer">
          <div
            className="drag-preview"
            ref={dragPreviewRef}
            style={{
              transform: `translate(${dragState.position.x}px, ${dragState.position.y}px)`,
            }}
          >
            {dragState.stack.map((card, index) => (
              <div
                key={card.id}
                className="drag-card"
                style={{
                  top: `${index * layout.tableauOverlap}px`,
                }}
              >
                <Card
                  card={card}
                  width={layout.cardWidth}
                  height={layout.cardHeight}
                  cardBackStyle={cardBackStyle}
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}
      <Confetti
        active={confettiActive && !reducedMotion}
        onComplete={() => setConfettiActive(false)}
      />
    </div>
  );
}

export default App;
