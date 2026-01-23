/**
 * TopBar component - displays seed and game control buttons
 */

import "./TopBar.css";

interface TopBarProps {
  seed: number;
  isSolvable: boolean;
  onNew: () => void;
  onRetry: () => void;
  onFinish: () => void;
  onSolve: () => void;
  onUndo: () => void;
}

export const TopBar = ({
  seed,
  isSolvable,
  onNew,
  onRetry,
  onFinish,
  onSolve,
  onUndo,
}: TopBarProps) => {
  const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

  const handleSeedClick = () => {
    // Copy current URL to clipboard
    navigator.clipboard?.writeText(window.location.href).catch(() => {
      // Ignore copy errors
    });
  };

  return (
    <div className="top-bar">
      {isLocalhost && (
        <div className="seed-display">
          <span
            onClick={handleSeedClick}
            style={{ cursor: 'pointer' }}
            title="Click to copy URL with seed"
          >
            Seed: {seed}
          </span>
          {isSolvable ? <span className="seed-badge">Solvable</span> : null}
        </div>
      )}
      {!isLocalhost && isSolvable && (
        <div className="seed-display">
          <span className="seed-badge">Solvable</span>
        </div>
      )}
      <div className="top-bar-controls">
        <div className="button-group">
          <button onClick={onNew} title="New Game (n)">
            New
          </button>
          <button onClick={onRetry} title="Retry (r)">
            Retry
          </button>
          <button onClick={onFinish} title="Finish (f)">
            Finish
          </button>
          {isLocalhost && (
            <button onClick={onSolve} title="Solve (s)">
              Solve
            </button>
          )}
          <button onClick={onUndo} title="Undo (u)">
            Undo
          </button>
        </div>
      </div>
    </div>
  );
};
