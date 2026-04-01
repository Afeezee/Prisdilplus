// ============================================================
// Prisdil+ Behavioural Inference Engine
// ============================================================

import { Move, RoundResult, BehaviourMetrics, BehaviourProfile } from './types';

/**
 * Compute behavioural metrics for a player based on round history.
 * @param moves - The player's moves array
 * @param opponentMoves - Opponent's moves array
 * @param rounds - Full round results
 * @param playerKey - 'player' or 'opponent' to determine which score fields to use
 */
export function computeMetrics(
  moves: Move[],
  opponentMoves: Move[],
  rounds: RoundResult[],
  playerKey: 'player' | 'opponent'
): BehaviourMetrics {
  const totalRounds = moves.length;
  if (totalRounds === 0) {
    return {
      cooperationRate: 0,
      defectionRate: 0,
      nicenessScore: 0,
      retaliationScore: 0,
      forgivenessScore: 0,
      pushOverIndex: 0,
      strategicOpportunismScore: 0,
      consistencyScore: 0,
    };
  }

  // 1. Cooperation Rate
  const totalCooperate = moves.filter((m) => m === 'C').length;
  const cooperationRate = totalCooperate / totalRounds;

  // 2. Defection Rate
  const defectionRate = 1 - cooperationRate;

  // 3. Niceness Score (based on first 3 rounds)
  const firstThree = moves.slice(0, Math.min(3, totalRounds));
  const earlyCoops = firstThree.filter((m) => m === 'C').length;
  const nicenessScore = earlyCoops / firstThree.length;

  // 4. Retaliation Score
  let betrayalsFaced = 0;
  let retaliations = 0;
  for (let i = 0; i < totalRounds - 1; i++) {
    if (opponentMoves[i] === 'D') {
      betrayalsFaced++;
      if (moves[i + 1] === 'D') {
        retaliations++;
      }
    }
  }
  const retaliationScore = betrayalsFaced > 0 ? retaliations / betrayalsFaced : 0;

  // 5. Forgiveness Score
  let retaliationSequences = 0;
  let forgiveEvents = 0;
  for (let i = 0; i < totalRounds - 2; i++) {
    if (opponentMoves[i] === 'D' && moves[i + 1] === 'D') {
      retaliationSequences++;
      if (moves[i + 2] === 'C') {
        forgiveEvents++;
      }
    }
  }
  const forgivenessScore =
    retaliationSequences > 0 ? forgiveEvents / retaliationSequences : 0;

  // 6. Push-over Index
  let cooperateAfterOpponentDefect = 0;
  const totalOpponentDefections = opponentMoves.filter((m) => m === 'D').length;
  for (let i = 0; i < totalRounds - 1; i++) {
    if (opponentMoves[i] === 'D' && moves[i + 1] === 'C') {
      cooperateAfterOpponentDefect++;
    }
  }
  const pushOverIndex =
    totalOpponentDefections > 0
      ? cooperateAfterOpponentDefect / totalOpponentDefections
      : 0;

  // 7. Strategic Opportunism Score
  const totalDefectMoves = moves.filter((m) => m === 'D').length;
  let defectAfterOpponentCoop = 0;
  for (let i = 1; i < totalRounds; i++) {
    if (opponentMoves[i - 1] === 'C' && moves[i] === 'D') {
      defectAfterOpponentCoop++;
    }
  }
  const strategicOpportunismScore =
    totalDefectMoves > 0 ? defectAfterOpponentCoop / totalDefectMoves : 0;

  // 8. Consistency Score (longest streak / total rounds)
  let longestStreak = 1;
  let currentStreak = 1;
  for (let i = 1; i < totalRounds; i++) {
    if (moves[i] === moves[i - 1]) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }
  const consistencyScore = longestStreak / totalRounds;

  return {
    cooperationRate: round2(cooperationRate),
    defectionRate: round2(defectionRate),
    nicenessScore: round2(nicenessScore),
    retaliationScore: round2(retaliationScore),
    forgivenessScore: round2(forgivenessScore),
    pushOverIndex: round2(pushOverIndex),
    strategicOpportunismScore: round2(strategicOpportunismScore),
    consistencyScore: round2(consistencyScore),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Classify a behavioural profile based on computed metrics.
 */
export function classifyProfile(metrics: BehaviourMetrics): BehaviourProfile {
  const {
    cooperationRate,
    defectionRate,
    retaliationScore,
    forgivenessScore,
    pushOverIndex,
    strategicOpportunismScore,
  } = metrics;

  // Strategic Diplomat
  if (cooperationRate > 0.6 && retaliationScore > 0.5 && forgivenessScore > 0.5) {
    return {
      title: 'Strategic Diplomat',
      description:
        'You cooperate readily but protect yourself from repeated exploitation. You retaliate when necessary but quickly restore trust.',
      emoji: '🤝',
    };
  }

  // Highly Trusting
  if (cooperationRate > 0.75 && pushOverIndex > 0.6 && retaliationScore < 0.3) {
    return {
      title: 'Highly Trusting',
      description:
        'You are strongly collaborative and highly trusting, though sometimes overly accommodating. Your openness inspires cooperation but may leave you vulnerable.',
      emoji: '💛',
    };
  }

  // Competitive Strategist
  if (defectionRate > 0.6 && strategicOpportunismScore > 0.5) {
    return {
      title: 'Competitive Strategist',
      description:
        'You exploit opportunities with precision and compete aggressively. Your strategy prioritises personal gain over mutual benefit.',
      emoji: '⚔️',
    };
  }

  // Defensive Player
  if (defectionRate > 0.6 && retaliationScore > 0.7) {
    return {
      title: 'Defensive Player',
      description:
        'You guard yourself fiercely against betrayal. Once trust is broken, you respond with strength and rarely let your guard down.',
      emoji: '🛡️',
    };
  }

  // Relentless Competitor
  if (defectionRate > 0.8) {
    return {
      title: 'Relentless Competitor',
      description:
        'You play to win at all costs. Competition drives your every decision, and cooperation is rarely in your playbook.',
      emoji: '🔥',
    };
  }

  // Peaceful Cooperator
  if (cooperationRate > 0.8) {
    return {
      title: 'Peaceful Cooperator',
      description:
        'You believe in the power of cooperation. Your decisions reflect a strong preference for mutual benefit and trust building.',
      emoji: '☮️',
    };
  }

  // Adaptive Strategist (default balanced)
  return {
    title: 'Adaptive Strategist',
    description:
      'You read the situation and adapt. Your balanced approach combines cooperation, retaliation, and forgiveness in measured proportions.',
    emoji: '🧠',
  };
}

/**
 * Compute detailed stats for updating player profiles.
 */
export function computeDetailedStats(
  moves: Move[],
  opponentMoves: Move[]
) {
  const totalCooperateMoves = moves.filter((m) => m === 'C').length;
  const totalDefectMoves = moves.filter((m) => m === 'D').length;

  let retaliations = 0;
  let betrayalsFaced = 0;
  let forgiveEvents = 0;
  let retaliationSequences = 0;
  let defectAfterOpponentCoop = 0;
  let cooperateAfterOpponentDefect = 0;
  const totalOpponentDefections = opponentMoves.filter((m) => m === 'D').length;

  for (let i = 0; i < moves.length - 1; i++) {
    if (opponentMoves[i] === 'D') {
      betrayalsFaced++;
      if (moves[i + 1] === 'D') retaliations++;
      if (moves[i + 1] === 'C') cooperateAfterOpponentDefect++;
    }
  }

  for (let i = 0; i < moves.length - 2; i++) {
    if (opponentMoves[i] === 'D' && moves[i + 1] === 'D') {
      retaliationSequences++;
      if (moves[i + 2] === 'C') forgiveEvents++;
    }
  }

  for (let i = 1; i < moves.length; i++) {
    if (opponentMoves[i - 1] === 'C' && moves[i] === 'D') {
      defectAfterOpponentCoop++;
    }
  }

  // Longest streak
  let longestStreak = 1;
  let currentStreak = 1;
  for (let i = 1; i < moves.length; i++) {
    if (moves[i] === moves[i - 1]) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return {
    totalCooperateMoves,
    totalDefectMoves,
    totalMoves: moves.length,
    retaliations,
    betrayalsFaced,
    forgiveEvents,
    retaliationSequences,
    defectAfterOpponentCoop,
    totalDefections: totalDefectMoves,
    cooperateAfterOpponentDefect,
    totalOpponentDefections,
    longestStreak,
  };
}
