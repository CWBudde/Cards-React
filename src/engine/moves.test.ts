/**
 * Tests for move validation and application logic
 */

import { describe, it, expect } from "vitest";
import {
  getMovableStack,
  canDropOnTableau,
  canDropOnFoundation,
  applyMove,
  isWin,
  undo,
} from "./moves";
import { MoveType } from "./types";
import type {
  Card,
  GameState,
  Pile,
  TableauToTableauMove,
  TableauToFoundationMove,
  FoundationToTableauMove,
  FlipMove,
} from "./types";

// Helper to create a card
function createCard(suit: 0 | 1 | 2 | 3, rank: number, faceUp = true): Card {
  return {
    id: suit * 13 + rank,
    suit,
    rank: rank as Card["rank"],
    faceUp,
  };
}

// Helper to create minimal game state for testing
function createTestState(): GameState {
  return {
    tableau: [[], [], [], [], [], [], [], []] as GameState["tableau"],
    foundations: [[], [], [], []] as GameState["foundations"],
    seed: 12345,
    rngState: { seed: 12345, state: [0, 0, 0, 0] },
    moveHistory: [],
    lastMove: null,
  };
}

describe("moves", () => {
  describe("getMovableStack", () => {
    it("should return null for invalid cardIndex (negative)", () => {
      const state = createTestState();
      state.tableau[0] = [createCard(0, 0)];

      const result = getMovableStack(state, 0, -1);
      expect(result).toBeNull();
    });

    it("should return null for invalid cardIndex (out of bounds)", () => {
      const state = createTestState();
      state.tableau[0] = [createCard(0, 0)];

      const result = getMovableStack(state, 0, 5);
      expect(result).toBeNull();
    });

    it("should return null if stack contains face-down cards", () => {
      const state = createTestState();
      state.tableau[0] = [
        createCard(0, 0, false), // face-down
        createCard(1, 1, true),
      ];

      const result = getMovableStack(state, 0, 0);
      expect(result).toBeNull();
    });

    it("should return single card when cardIndex points to top card", () => {
      const state = createTestState();
      const card = createCard(0, 5, true);
      state.tableau[0] = [createCard(1, 6, true), card];

      const result = getMovableStack(state, 0, 1);
      expect(result).toHaveLength(1);
      expect(result![0]).toBe(card);
    });

    it("should return stack of multiple face-up cards", () => {
      const state = createTestState();
      const card1 = createCard(0, 5, true);
      const card2 = createCard(1, 4, true);
      const card3 = createCard(2, 3, true);
      state.tableau[0] = [card1, card2, card3];

      const result = getMovableStack(state, 0, 0);
      expect(result).toHaveLength(3);
      expect(result).toEqual([card1, card2, card3]);
    });

    it("should return partial stack starting from middle", () => {
      const state = createTestState();
      const card1 = createCard(0, 5, true);
      const card2 = createCard(1, 4, true);
      const card3 = createCard(2, 3, true);
      state.tableau[0] = [card1, card2, card3];

      const result = getMovableStack(state, 0, 1);
      expect(result).toHaveLength(2);
      expect(result).toEqual([card2, card3]);
    });
  });

  describe("canDropOnTableau", () => {
    it("should return false for empty stack", () => {
      const targetPile: Pile = [createCard(0, 5)];
      const result = canDropOnTableau([], targetPile);
      expect(result).toBe(false);
    });

    it("should accept King on empty pile", () => {
      const stack = [createCard(0, 12)]; // King of Spades
      const targetPile: Pile = [];

      const result = canDropOnTableau(stack, targetPile);
      expect(result).toBe(true);
    });

    it("should reject non-King on empty pile", () => {
      const stack = [createCard(0, 11)]; // Queen of Spades
      const targetPile: Pile = [];

      const result = canDropOnTableau(stack, targetPile);
      expect(result).toBe(false);
    });

    it("should accept alternating colors descending by 1", () => {
      const stack = [createCard(0, 5)]; // 6 of Spades (Black)
      const targetPile: Pile = [createCard(1, 6)]; // 7 of Hearts (Red)

      const result = canDropOnTableau(stack, targetPile);
      expect(result).toBe(true);
    });

    it("should reject same color", () => {
      const stack = [createCard(0, 5)]; // 6 of Spades (Black)
      const targetPile: Pile = [createCard(2, 6)]; // 7 of Clubs (Black)

      const result = canDropOnTableau(stack, targetPile);
      expect(result).toBe(false);
    });

    it("should reject non-descending rank", () => {
      const stack = [createCard(0, 6)]; // 7 of Spades (Black)
      const targetPile: Pile = [createCard(1, 6)]; // 7 of Hearts (Red)

      const result = canDropOnTableau(stack, targetPile);
      expect(result).toBe(false);
    });

    it("should reject rank descending by more than 1", () => {
      const stack = [createCard(0, 4)]; // 5 of Spades (Black)
      const targetPile: Pile = [createCard(1, 6)]; // 7 of Hearts (Red)

      const result = canDropOnTableau(stack, targetPile);
      expect(result).toBe(false);
    });
  });

  describe("canDropOnFoundation", () => {
    it("should accept Ace on empty foundation", () => {
      const card = createCard(0, 0); // Ace of Spades
      const foundationPile: Pile = [];

      const result = canDropOnFoundation(card, foundationPile);
      expect(result).toBe(true);
    });

    it("should reject non-Ace on empty foundation", () => {
      const card = createCard(0, 1); // 2 of Spades
      const foundationPile: Pile = [];

      const result = canDropOnFoundation(card, foundationPile);
      expect(result).toBe(false);
    });

    it("should accept same suit ascending by 1", () => {
      const card = createCard(0, 1); // 2 of Spades
      const foundationPile: Pile = [createCard(0, 0)]; // Ace of Spades

      const result = canDropOnFoundation(card, foundationPile);
      expect(result).toBe(true);
    });

    it("should reject different suit", () => {
      const card = createCard(1, 1); // 2 of Hearts
      const foundationPile: Pile = [createCard(0, 0)]; // Ace of Spades

      const result = canDropOnFoundation(card, foundationPile);
      expect(result).toBe(false);
    });

    it("should reject non-ascending rank", () => {
      const card = createCard(0, 0); // Ace of Spades
      const foundationPile: Pile = [createCard(0, 0)]; // Ace of Spades

      const result = canDropOnFoundation(card, foundationPile);
      expect(result).toBe(false);
    });

    it("should reject rank ascending by more than 1", () => {
      const card = createCard(0, 2); // 3 of Spades
      const foundationPile: Pile = [createCard(0, 0)]; // Ace of Spades

      const result = canDropOnFoundation(card, foundationPile);
      expect(result).toBe(false);
    });
  });

  describe("applyMove - TableauToTableau", () => {
    it("should move single card between tableau piles", () => {
      const state = createTestState();
      state.tableau[0] = [createCard(0, 5)]; // 6 of Spades
      state.tableau[1] = [createCard(1, 6)]; // 7 of Hearts

      const move: TableauToTableauMove = {
        type: MoveType.TableauToTableau,
        fromPile: 0,
        toPile: 1,
        cardIndex: 0,
      };

      const result = applyMove(state, move);
      expect(result).toBe(true);
      expect(state.tableau[0]).toHaveLength(0);
      expect(state.tableau[1]).toHaveLength(2);
      expect(state.lastMove).toBe(move);
      expect(state.moveHistory).toContain(move);
    });

    it("should move stack of cards between tableau piles", () => {
      const state = createTestState();
      state.tableau[0] = [
        createCard(0, 7),  // 8 of Spades
        createCard(1, 6),  // 7 of Hearts
        createCard(2, 5),  // 6 of Clubs
      ];
      state.tableau[1] = [createCard(3, 8)]; // 9 of Diamonds

      const move: TableauToTableauMove = {
        type: MoveType.TableauToTableau,
        fromPile: 0,
        toPile: 1,
        cardIndex: 0,
      };

      const result = applyMove(state, move);
      expect(result).toBe(true);
      expect(state.tableau[0]).toHaveLength(0);
      expect(state.tableau[1]).toHaveLength(4);
    });

    it("should auto-flip top card after moving cards", () => {
      const state = createTestState();
      state.tableau[0] = [
        createCard(0, 7, false),  // 8 of Spades (face-down)
        createCard(1, 6, true),   // 7 of Hearts (face-up)
      ];
      state.tableau[1] = [createCard(2, 7)]; // 8 of Clubs (for alternating color)

      const move: TableauToTableauMove = {
        type: MoveType.TableauToTableau,
        fromPile: 0,
        toPile: 1,
        cardIndex: 1,
      };

      const result = applyMove(state, move);
      expect(result).toBe(true);
      expect(state.tableau[0]).toHaveLength(1);
      expect(state.tableau[0][0].faceUp).toBe(true); // Auto-flipped
    });

    it("should reject invalid move (wrong colors)", () => {
      const state = createTestState();
      state.tableau[0] = [createCard(0, 5)]; // 6 of Spades (Black)
      state.tableau[1] = [createCard(2, 6)]; // 7 of Clubs (Black)

      const move: TableauToTableauMove = {
        type: MoveType.TableauToTableau,
        fromPile: 0,
        toPile: 1,
        cardIndex: 0,
      };

      const result = applyMove(state, move);
      expect(result).toBe(false);
      expect(state.tableau[0]).toHaveLength(1); // Unchanged
      expect(state.tableau[1]).toHaveLength(1); // Unchanged
    });

    it("should reject moving face-down cards", () => {
      const state = createTestState();
      state.tableau[0] = [
        createCard(0, 5, false), // face-down
        createCard(1, 4, true),
      ];
      state.tableau[1] = [createCard(2, 6)];

      const move: TableauToTableauMove = {
        type: MoveType.TableauToTableau,
        fromPile: 0,
        toPile: 1,
        cardIndex: 0,
      };

      const result = applyMove(state, move);
      expect(result).toBe(false);
    });

    it("should place King on empty pile", () => {
      const state = createTestState();
      state.tableau[0] = [createCard(0, 12)]; // King
      state.tableau[1] = [];

      const move: TableauToTableauMove = {
        type: MoveType.TableauToTableau,
        fromPile: 0,
        toPile: 1,
        cardIndex: 0,
      };

      const result = applyMove(state, move);
      expect(result).toBe(true);
      expect(state.tableau[1]).toHaveLength(1);
    });
  });

  describe("applyMove - TableauToFoundation", () => {
    it("should move Ace to empty foundation", () => {
      const state = createTestState();
      state.tableau[0] = [createCard(0, 0)]; // Ace of Spades

      const move: TableauToFoundationMove = {
        type: MoveType.TableauToFoundation,
        fromPile: 0,
        toFoundation: 0,
      };

      const result = applyMove(state, move);
      expect(result).toBe(true);
      expect(state.tableau[0]).toHaveLength(0);
      expect(state.foundations[0]).toHaveLength(1);
      expect(state.lastMove).toBe(move);
    });

    it("should move ascending same-suit card to foundation", () => {
      const state = createTestState();
      state.tableau[0] = [createCard(0, 1)]; // 2 of Spades
      state.foundations[0] = [createCard(0, 0)]; // Ace of Spades

      const move: TableauToFoundationMove = {
        type: MoveType.TableauToFoundation,
        fromPile: 0,
        toFoundation: 0,
      };

      const result = applyMove(state, move);
      expect(result).toBe(true);
      expect(state.foundations[0]).toHaveLength(2);
    });

    it("should auto-flip after moving to foundation", () => {
      const state = createTestState();
      state.tableau[0] = [
        createCard(0, 2, false), // face-down
        createCard(0, 1, true),  // 2 of Spades
      ];
      state.foundations[0] = [createCard(0, 0)]; // Ace of Spades

      const move: TableauToFoundationMove = {
        type: MoveType.TableauToFoundation,
        fromPile: 0,
        toFoundation: 0,
      };

      const result = applyMove(state, move);
      expect(result).toBe(true);
      expect(state.tableau[0][0].faceUp).toBe(true); // Auto-flipped
    });

    it("should reject wrong suit", () => {
      const state = createTestState();
      state.tableau[0] = [createCard(1, 1)]; // 2 of Hearts
      state.foundations[0] = [createCard(0, 0)]; // Ace of Spades

      const move: TableauToFoundationMove = {
        type: MoveType.TableauToFoundation,
        fromPile: 0,
        toFoundation: 0,
      };

      const result = applyMove(state, move);
      expect(result).toBe(false);
    });

    it("should reject non-Ace on empty foundation", () => {
      const state = createTestState();
      state.tableau[0] = [createCard(0, 1)]; // 2 of Spades

      const move: TableauToFoundationMove = {
        type: MoveType.TableauToFoundation,
        fromPile: 0,
        toFoundation: 0,
      };

      const result = applyMove(state, move);
      expect(result).toBe(false);
    });

    it("should reject empty pile", () => {
      const state = createTestState();

      const move: TableauToFoundationMove = {
        type: MoveType.TableauToFoundation,
        fromPile: 0,
        toFoundation: 0,
      };

      const result = applyMove(state, move);
      expect(result).toBe(false);
    });
  });

  describe("applyMove - FoundationToTableau", () => {
    it("should move card from foundation to tableau", () => {
      const state = createTestState();
      state.foundations[0] = [createCard(0, 1)]; // 2 of Spades
      state.tableau[0] = [createCard(1, 2)]; // 3 of Hearts

      const move: FoundationToTableauMove = {
        type: MoveType.FoundationToTableau,
        fromFoundation: 0,
        toPile: 0,
      };

      const result = applyMove(state, move);
      expect(result).toBe(true);
      expect(state.foundations[0]).toHaveLength(0);
      expect(state.tableau[0]).toHaveLength(2);
      expect(state.lastMove).toBe(move);
    });

    it("should reject invalid drop (wrong color)", () => {
      const state = createTestState();
      state.foundations[0] = [createCard(0, 1)]; // 2 of Spades (Black)
      state.tableau[0] = [createCard(2, 2)]; // 3 of Clubs (Black)

      const move: FoundationToTableauMove = {
        type: MoveType.FoundationToTableau,
        fromFoundation: 0,
        toPile: 0,
      };

      const result = applyMove(state, move);
      expect(result).toBe(false);
    });

    it("should reject empty foundation", () => {
      const state = createTestState();
      state.tableau[0] = [createCard(1, 2)];

      const move: FoundationToTableauMove = {
        type: MoveType.FoundationToTableau,
        fromFoundation: 0,
        toPile: 0,
      };

      const result = applyMove(state, move);
      expect(result).toBe(false);
    });
  });

  describe("applyMove - Flip", () => {
    it("should flip face-down card", () => {
      const state = createTestState();
      state.tableau[0] = [createCard(0, 5, false)];

      const move: FlipMove = {
        type: MoveType.Flip,
        pile: 0,
      };

      const result = applyMove(state, move);
      expect(result).toBe(true);
      expect(state.tableau[0][0].faceUp).toBe(true);
      expect(state.lastMove).toBe(move);
    });

    it("should reject empty pile", () => {
      const state = createTestState();

      const move: FlipMove = {
        type: MoveType.Flip,
        pile: 0,
      };

      const result = applyMove(state, move);
      expect(result).toBe(false);
    });

    it("should reject already face-up card", () => {
      const state = createTestState();
      state.tableau[0] = [createCard(0, 5, true)];

      const move: FlipMove = {
        type: MoveType.Flip,
        pile: 0,
      };

      const result = applyMove(state, move);
      expect(result).toBe(false);
    });
  });

  describe("isWin", () => {
    it("should return false for new game", () => {
      const state = createTestState();
      expect(isWin(state)).toBe(false);
    });

    it("should return false with partial foundations", () => {
      const state = createTestState();
      // Add 13 cards to one foundation
      for (let i = 0; i < 13; i++) {
        state.foundations[0].push(createCard(0, i));
      }
      expect(isWin(state)).toBe(false);
    });

    it("should return true when all 52 cards in foundations", () => {
      const state = createTestState();
      // Add all 13 cards to each foundation
      for (let suit = 0; suit < 4; suit++) {
        for (let rank = 0; rank < 13; rank++) {
          state.foundations[suit].push(createCard(suit as 0 | 1 | 2 | 3, rank));
        }
      }
      expect(isWin(state)).toBe(true);
    });
  });

  describe("undo - TableauToTableau", () => {
    it("should undo tableau to tableau move", () => {
      const state = createTestState();
      state.tableau[0] = [createCard(0, 5)];
      state.tableau[1] = [createCard(1, 6)];

      const move: TableauToTableauMove = {
        type: MoveType.TableauToTableau,
        fromPile: 0,
        toPile: 1,
        cardIndex: 0,
      };

      applyMove(state, move);
      expect(state.tableau[0]).toHaveLength(0);
      expect(state.tableau[1]).toHaveLength(2);

      const undoResult = undo(state);
      expect(undoResult).toBe(true);
      expect(state.tableau[0]).toHaveLength(1);
      expect(state.tableau[1]).toHaveLength(1);
      expect(state.lastMove).toBeNull();
      expect(state.moveHistory).toHaveLength(0);
    });

    it("should undo stack move", () => {
      const state = createTestState();
      state.tableau[0] = [
        createCard(0, 7),
        createCard(1, 6),
        createCard(2, 5),
      ];
      state.tableau[1] = [createCard(3, 8)];

      const move: TableauToTableauMove = {
        type: MoveType.TableauToTableau,
        fromPile: 0,
        toPile: 1,
        cardIndex: 1,
      };

      applyMove(state, move);
      expect(state.tableau[0]).toHaveLength(1);
      expect(state.tableau[1]).toHaveLength(3);

      const undoResult = undo(state);
      expect(undoResult).toBe(true);
      expect(state.tableau[0]).toHaveLength(3);
      expect(state.tableau[1]).toHaveLength(1);
    });
  });

  describe("undo - TableauToFoundation", () => {
    it("should undo tableau to foundation move", () => {
      const state = createTestState();
      state.tableau[0] = [createCard(0, 0)];

      const move: TableauToFoundationMove = {
        type: MoveType.TableauToFoundation,
        fromPile: 0,
        toFoundation: 0,
      };

      applyMove(state, move);
      expect(state.tableau[0]).toHaveLength(0);
      expect(state.foundations[0]).toHaveLength(1);

      const undoResult = undo(state);
      expect(undoResult).toBe(true);
      expect(state.tableau[0]).toHaveLength(1);
      expect(state.foundations[0]).toHaveLength(0);
      expect(state.lastMove).toBeNull();
    });

    it("should reject undo with empty foundation", () => {
      const state = createTestState();
      state.lastMove = {
        type: MoveType.TableauToFoundation,
        fromPile: 0,
        toFoundation: 0,
      };

      const undoResult = undo(state);
      expect(undoResult).toBe(false);
    });
  });

  describe("undo - FoundationToTableau", () => {
    it("should undo foundation to tableau move", () => {
      const state = createTestState();
      state.foundations[0] = [createCard(0, 1)];
      state.tableau[0] = [createCard(1, 2)];

      const move: FoundationToTableauMove = {
        type: MoveType.FoundationToTableau,
        fromFoundation: 0,
        toPile: 0,
      };

      applyMove(state, move);
      expect(state.foundations[0]).toHaveLength(0);
      expect(state.tableau[0]).toHaveLength(2);

      const undoResult = undo(state);
      expect(undoResult).toBe(true);
      expect(state.foundations[0]).toHaveLength(1);
      expect(state.tableau[0]).toHaveLength(1);
      expect(state.lastMove).toBeNull();
    });

    it("should reject undo with empty tableau", () => {
      const state = createTestState();
      state.lastMove = {
        type: MoveType.FoundationToTableau,
        fromFoundation: 0,
        toPile: 0,
      };

      const undoResult = undo(state);
      expect(undoResult).toBe(false);
    });
  });

  describe("undo - Flip", () => {
    it("should undo flip move", () => {
      const state = createTestState();
      state.tableau[0] = [createCard(0, 5, false)];

      const move: FlipMove = {
        type: MoveType.Flip,
        pile: 0,
      };

      applyMove(state, move);
      expect(state.tableau[0][0].faceUp).toBe(true);

      const undoResult = undo(state);
      expect(undoResult).toBe(true);
      expect(state.tableau[0][0].faceUp).toBe(false);
      expect(state.lastMove).toBeNull();
    });

    it("should reject undo on empty pile", () => {
      const state = createTestState();
      state.lastMove = {
        type: MoveType.Flip,
        pile: 0,
      };

      const undoResult = undo(state);
      expect(undoResult).toBe(false);
    });

    it("should reject undo on already face-down card", () => {
      const state = createTestState();
      state.tableau[0] = [createCard(0, 5, false)];
      state.lastMove = {
        type: MoveType.Flip,
        pile: 0,
      };

      const undoResult = undo(state);
      expect(undoResult).toBe(false);
    });
  });

  describe("undo - general", () => {
    it("should return false when no lastMove", () => {
      const state = createTestState();
      const result = undo(state);
      expect(result).toBe(false);
    });
  });
});
