// ============================================================
// Prisdil+ Type Definitions
// ============================================================

export type Move = 'C' | 'D';

export type GameMode = 'pvp' | 'pvc';

export type StrategyType =
  | 'random'
  | 'always_defect'
  | 'tit_for_tat'
  | 'forgiving_tit_for_tat'
  | 'grudger'
  | 'suspicious_tit_for_tat'
  | 'pavlov';

export interface RoundResult {
  round: number;
  playerMove: Move;
  opponentMove: Move;
  playerScore: number;
  opponentScore: number;
  cumulativePlayerScore: number;
  cumulativeOpponentScore: number;
}

export interface GameSettings {
  mode: GameMode;
  totalRounds: number;
  strategy: StrategyType;
  player1Alias: string;
  player2Alias: string;
}

export interface BehaviourMetrics {
  cooperationRate: number;
  defectionRate: number;
  nicenessScore: number;
  retaliationScore: number;
  forgivenessScore: number;
  pushOverIndex: number;
  strategicOpportunismScore: number;
  consistencyScore: number;
}

export interface BehaviourProfile {
  title: string;
  description: string;
  emoji: string;
}

export interface PlayerProfile {
  alias: string;
  totalPoints: number;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  gamesPlayed: number;
  totalCooperateMoves: number;
  totalDefectMoves: number;
  totalMoves: number;
  totalRetaliations: number;
  totalBetrayalsFaced: number;
  totalForgivenessEvents: number;
  totalRetaliationSequences: number;
  totalDefectionsAfterOpponentCoop: number;
  totalDefections: number;
  totalCooperationsAfterOpponentDefect: number;
  totalOpponentDefections: number;
  longestStreak: number;
  longestWinStreak: number;
  currentWinStreak: number;
  totalRoundsPlayed: number;
  badges: string[];
}

export interface GameSession {
  id: string;
  timestamp: number;
  settings: GameSettings;
  rounds: RoundResult[];
  player1Metrics: BehaviourMetrics;
  player2Metrics: BehaviourMetrics;
  player1Profile: BehaviourProfile;
  player2Profile: BehaviourProfile;
  winner: 'player1' | 'player2' | 'tie';
  finalScorePlayer1: number;
  finalScorePlayer2: number;
}

export type GamePhase = 'landing' | 'alias' | 'playing' | 'reveal' | 'results';

export interface LeaderboardEntry {
  alias: string;
  totalPoints: number;
  totalWins: number;
  gamesPlayed: number;
  winRate: number;
  cooperationRate: number;
  retaliationScore: number;
  forgivenessScore: number;
  consistencyScore: number;
  strategicScore: number;
  opportunismScore: number;
  longestWinStreak: number;
  badges: string[];
}
