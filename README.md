# Cards

Modern implementation of a solitaire game clone using Vite + React + TypeScript. [Try it online](https://meko-christian.github.io/Cards/).

## Repository layout

- cards-web: Vite + React + TypeScript app
- GAME_SPEC.md: gameplay/spec notes
- PLAN.md: milestone checklist

## Quick start

From the repo root:

- Install: yarn --cwd cards-web install
- Dev server: yarn --cwd cards-web dev
- Build: yarn --cwd cards-web build
- Preview: yarn --cwd cards-web preview
- Tests: yarn --cwd cards-web test

## Game Rules

This is a solitaire variant with 8 tableau piles (instead of the standard 7) and no stock/waste pile—all 52 cards are dealt at the start.

### Setup

- 8 tableau piles with capacities of 3, 4, 5, 6, 7, 8, 9, and 10 cards
- Each pile has 3 face-down cards; remaining cards are face-up
- 4 empty foundation piles (one per suit)

### Moving Cards

- **Tableau to tableau**: Move stacks of face-up cards in alternating colors and descending rank. Only Kings can fill empty piles.
- **Tableau to foundation**: Move single cards to foundations by suit, ascending from Ace to King.
- Face-down cards flip automatically when exposed.

### Keyboard Shortcuts

| Key | Action                        |
| --- | ----------------------------- |
| `n` | New game                      |
| `r` | Retry (same seed)             |
| `f` | Finish (auto-move safe cards) |
| `s` | Solve (auto-solve attempt)    |
| `u` | Undo                          |

## Notes

- Seeds are persisted in localStorage.
- Reduced motion can be toggled in the UI and respects system preferences.
