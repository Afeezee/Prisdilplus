// ============================================================
// Prisdil+ Scoring Engine
// ============================================================

import { Move } from './types';

export interface RoundScore {
  player1Score: number;
  player2Score: number;
}

/**
 * Scores a single round using classic Prisoner's Dilemma payoff matrix.
 *
 * C vs C → 3, 3
 * D vs D → 1, 1
 * D vs C → 5, 0
 * C vs D → 0, 5
 */
export function scoreRound(move1: Move, move2: Move): RoundScore {
  if (move1 === 'C' && move2 === 'C') {
    return { player1Score: 3, player2Score: 3 };
  }
  if (move1 === 'D' && move2 === 'D') {
    return { player1Score: 1, player2Score: 1 };
  }
  if (move1 === 'D' && move2 === 'C') {
    return { player1Score: 5, player2Score: 0 };
  }
  // move1 === 'C' && move2 === 'D'
  return { player1Score: 0, player2Score: 5 };
}

/**
 * Returns a description of the round outcome.
 */
export function describeOutcome(move1: Move, move2: Move): string {
  if (move1 === 'C' && move2 === 'C') return 'Mutual Cooperation';
  if (move1 === 'D' && move2 === 'D') return 'Mutual Defection';
  if (move1 === 'D' && move2 === 'C') return 'Player 1 Exploits';
  return 'Player 2 Exploits';
}
