// ============================================================
// Prisdil+ Strategy Engine — Computer opponent strategies
// ============================================================

import { Move, StrategyType, RoundResult } from './types';

/**
 * Compute the computer's move for a given strategy and game history.
 */
export function getStrategyMove(
  strategy: StrategyType,
  history: RoundResult[],
  currentRound: number
): Move {
  switch (strategy) {
    case 'random':
      return randomStrategy();
    case 'always_defect':
      return alwaysDefect();
    case 'tit_for_tat':
      return titForTat(history);
    case 'forgiving_tit_for_tat':
      return forgivingTitForTat(history);
    case 'grudger':
      return grudger(history);
    case 'suspicious_tit_for_tat':
      return suspiciousTitForTat(history);
    case 'pavlov':
      return pavlov(history);
    default:
      return randomStrategy();
  }
}

/** P(C) = 0.5, P(D) = 0.5 */
function randomStrategy(): Move {
  return Math.random() < 0.5 ? 'C' : 'D';
}

/** Always returns D */
function alwaysDefect(): Move {
  return 'D';
}

/**
 * Cooperate in round 1.
 * Then mirror opponent's previous move.
 */
function titForTat(history: RoundResult[]): Move {
  if (history.length === 0) return 'C';
  return history[history.length - 1].playerMove; // mirror what the human played
}

/**
 * Same as Tit for Tat but forgives after one retaliation.
 * Defect once after betrayal, return to C if opponent cooperates next.
 */
function forgivingTitForTat(history: RoundResult[]): Move {
  if (history.length === 0) return 'C';
  const lastRound = history[history.length - 1];
  // If opponent cooperated last round, cooperate
  if (lastRound.playerMove === 'C') return 'C';
  // If opponent defected and we already retaliated, forgive
  if (history.length >= 2) {
    const prevRound = history[history.length - 2];
    if (prevRound.playerMove === 'D' && lastRound.opponentMove === 'D') {
      return 'C'; // forgive
    }
  }
  return 'D'; // retaliate
}

/**
 * Cooperate until betrayed once. Defect forever after.
 */
function grudger(history: RoundResult[]): Move {
  const wasBetrayed = history.some((r) => r.playerMove === 'D');
  return wasBetrayed ? 'D' : 'C';
}

/**
 * Defect first. Then mirror opponent's previous move.
 */
function suspiciousTitForTat(history: RoundResult[]): Move {
  if (history.length === 0) return 'D';
  return history[history.length - 1].playerMove;
}

/**
 * Pavlov / Win-Stay Lose-Shift:
 * If previous round was successful (scored >= 3), repeat move.
 * If unsuccessful (scored < 3), switch move.
 */
function pavlov(history: RoundResult[]): Move {
  if (history.length === 0) return 'C';
  const lastRound = history[history.length - 1];
  const myLastMove = lastRound.opponentMove; // computer's last move
  const myLastScore = lastRound.opponentScore;
  if (myLastScore >= 3) return myLastMove; // win-stay
  return myLastMove === 'C' ? 'D' : 'C'; // lose-shift
}

/** Get display name for a strategy */
export function getStrategyDisplayName(strategy: StrategyType): string {
  const names: Record<StrategyType, string> = {
    random: 'Random',
    always_defect: 'Always Defect',
    tit_for_tat: 'Tit for Tat',
    forgiving_tit_for_tat: 'Forgiving Tit for Tat',
    grudger: 'Grudger',
    suspicious_tit_for_tat: 'Suspicious Tit for Tat',
    pavlov: 'Pavlov (Win-Stay Lose-Shift)',
  };
  return names[strategy];
}

/** Get bot alias for a strategy */
export function getStrategyBotAlias(strategy: StrategyType): string {
  const aliases: Record<StrategyType, string> = {
    random: 'RANDOM_BOT',
    always_defect: 'DEFECT_BOT',
    tit_for_tat: 'TIT_FOR_TAT_BOT',
    forgiving_tit_for_tat: 'FORGIVING_TFT_BOT',
    grudger: 'GRUDGER_BOT',
    suspicious_tit_for_tat: 'SUSPICIOUS_TFT_BOT',
    pavlov: 'PAVLOV_BOT',
  };
  return aliases[strategy];
}
