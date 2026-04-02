'use client';
// ============================================================
// Prisdil+ Leaderboard Store (Zustand + localStorage)
// ============================================================

import { create } from 'zustand';
import { PlayerProfile } from '@/lib/types';

const STORAGE_KEY = 'prisdilplus_human_leaderboard';
const LEGACY_STORAGE_KEY = 'prisdilplusHumanLeaderboard';

interface LeaderboardState {
  players: Record<string, PlayerProfile>;
  loaded: boolean;

  loadFromStorage: () => void;
  saveToStorage: () => void;

  getOrCreatePlayer: (alias: string) => PlayerProfile;
  updatePlayerAfterGame: (
    alias: string,
    update: {
      points: number;
      won: boolean;
      lost: boolean;
      draw: boolean;
      totalCooperateMoves: number;
      totalDefectMoves: number;
      totalMoves: number;
      retaliations: number;
      betrayalsFaced: number;
      forgiveEvents: number;
      retaliationSequences: number;
      defectAfterOpponentCoop: number;
      totalDefections: number;
      cooperateAfterOpponentDefect: number;
      totalOpponentDefections: number;
      longestStreak: number;
      roundsPlayed: number;
    }
  ) => void;

  getLeaderboard: (
    sortBy: string
  ) => (PlayerProfile & { rank: number; winRate: number; strategicScore: number; cooperationRate: number; retaliationScore: number; forgivenessScore: number; opportunismScore: number })[];

  awardBadges: (alias: string) => void;
}

/** Case-insensitive lookup: returns the existing key in players record, or null */
function findAliasKey(
  players: Record<string, PlayerProfile>,
  alias: string
): string | null {
  const lower = alias.toLowerCase();
  for (const key of Object.keys(players)) {
    if (key.toLowerCase() === lower) return key;
  }
  return null;
}

function createEmptyProfile(alias: string): PlayerProfile {
  return {
    alias,
    totalPoints: 0,
    totalWins: 0,
    totalLosses: 0,
    totalDraws: 0,
    gamesPlayed: 0,
    totalCooperateMoves: 0,
    totalDefectMoves: 0,
    totalMoves: 0,
    totalRetaliations: 0,
    totalBetrayalsFaced: 0,
    totalForgivenessEvents: 0,
    totalRetaliationSequences: 0,
    totalDefectionsAfterOpponentCoop: 0,
    totalDefections: 0,
    totalCooperationsAfterOpponentDefect: 0,
    totalOpponentDefections: 0,
    longestStreak: 0,
    longestWinStreak: 0,
    currentWinStreak: 0,
    totalRoundsPlayed: 0,
    badges: [],
  };
}

export const useLeaderboardStore = create<LeaderboardState>((set, get) => ({
  players: {},
  loaded: false,

  loadFromStorage: () => {
    if (typeof window === 'undefined') return;
    try {
      let raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        raw = localStorage.getItem(LEGACY_STORAGE_KEY);
      }
      if (raw) {
        const parsed = JSON.parse(raw);
        set({ players: parsed, loaded: true });
        if (raw && localStorage.getItem(STORAGE_KEY) !== raw) {
          localStorage.setItem(STORAGE_KEY, raw);
        }
      } else {
        set({ loaded: true });
      }
    } catch {
      set({ loaded: true });
    }
  },

  saveToStorage: () => {
    if (typeof window === 'undefined') return;
    try {
      const state = get();
      const payload = JSON.stringify(state.players);
      localStorage.setItem(STORAGE_KEY, payload);
      localStorage.setItem(LEGACY_STORAGE_KEY, payload);
    } catch {
      // ignore
    }
  },

  getOrCreatePlayer: (alias) => {
    const state = get();
    // Case-insensitive lookup
    const key = findAliasKey(state.players, alias);
    if (key) return state.players[key];
    const newProfile = createEmptyProfile(alias);
    set({ players: { ...state.players, [alias]: newProfile } });
    return newProfile;
  },

  updatePlayerAfterGame: (alias, update) => {
    const state = get();
    // Case-insensitive lookup to prevent duplicates
    const existingKey = findAliasKey(state.players, alias);
    const resolvedKey = existingKey || alias;
    const existing = state.players[resolvedKey] || createEmptyProfile(alias);

    const newWinStreak = update.won
      ? existing.currentWinStreak + 1
      : 0;

    const updatedProfile: PlayerProfile = {
      ...existing,
      totalPoints: existing.totalPoints + update.points,
      totalWins: existing.totalWins + (update.won ? 1 : 0),
      totalLosses: existing.totalLosses + (update.lost ? 1 : 0),
      totalDraws: existing.totalDraws + (update.draw ? 1 : 0),
      gamesPlayed: existing.gamesPlayed + 1,
      totalCooperateMoves: existing.totalCooperateMoves + update.totalCooperateMoves,
      totalDefectMoves: existing.totalDefectMoves + update.totalDefectMoves,
      totalMoves: existing.totalMoves + update.totalMoves,
      totalRetaliations: existing.totalRetaliations + update.retaliations,
      totalBetrayalsFaced: existing.totalBetrayalsFaced + update.betrayalsFaced,
      totalForgivenessEvents: existing.totalForgivenessEvents + update.forgiveEvents,
      totalRetaliationSequences: existing.totalRetaliationSequences + update.retaliationSequences,
      totalDefectionsAfterOpponentCoop: existing.totalDefectionsAfterOpponentCoop + update.defectAfterOpponentCoop,
      totalDefections: existing.totalDefections + update.totalDefections,
      totalCooperationsAfterOpponentDefect: existing.totalCooperationsAfterOpponentDefect + update.cooperateAfterOpponentDefect,
      totalOpponentDefections: existing.totalOpponentDefections + update.totalOpponentDefections,
      longestStreak: Math.max(existing.longestStreak, update.longestStreak),
      longestWinStreak: Math.max(existing.longestWinStreak, newWinStreak),
      currentWinStreak: newWinStreak,
      totalRoundsPlayed: existing.totalRoundsPlayed + update.roundsPlayed,
    };

    const newPlayers = { ...state.players, [resolvedKey]: updatedProfile };
    set({ players: newPlayers });

    // Award badges after update
    setTimeout(() => {
      get().awardBadges(resolvedKey);
      get().saveToStorage();
    }, 0);
  },

  awardBadges: (alias) => {
    const state = get();
    const p = state.players[alias];
    if (!p) return;

    const badges: string[] = [];

    // Cooperation Master
    if (p.totalMoves > 0 && p.totalCooperateMoves / p.totalMoves > 0.7) {
      badges.push('🤝 Cooperation Master');
    }

    // Fast Retaliator
    if (p.totalBetrayalsFaced > 0 && p.totalRetaliations / p.totalBetrayalsFaced > 0.7) {
      badges.push('⚡ Fast Retaliator');
    }

    // Most Forgiving
    if (p.totalRetaliationSequences > 0 && p.totalForgivenessEvents / p.totalRetaliationSequences > 0.5) {
      badges.push('🕊️ Most Forgiving');
    }

    // Strategic Genius
    const retScore = p.totalBetrayalsFaced > 0 ? p.totalRetaliations / p.totalBetrayalsFaced : 0;
    const forgScore = p.totalRetaliationSequences > 0 ? p.totalForgivenessEvents / p.totalRetaliationSequences : 0;
    const consScore = p.totalRoundsPlayed > 0 ? p.longestStreak / p.totalRoundsPlayed : 0;
    const stratScore = (retScore + forgScore + consScore) / 3;
    if (stratScore > 0.5) {
      badges.push('🧠 Strategic Genius');
    }

    // Opportunist
    if (p.totalDefections > 0 && p.totalDefectionsAfterOpponentCoop / p.totalDefections > 0.5) {
      badges.push('🦊 Opportunist');
    }

    // Top Scorer
    if (p.totalPoints >= 100) {
      badges.push('🏆 Top Scorer');
    }

    // Longest Streak
    if (p.longestWinStreak >= 5) {
      badges.push('🔥 Longest Streak');
    }

    // Defensive Titan
    if (p.totalMoves > 0 && p.totalDefectMoves / p.totalMoves > 0.6 && retScore > 0.7) {
      badges.push('🛡️ Defensive Titan');
    }

    const updatedProfile = { ...p, badges };
    set({ players: { ...state.players, [alias]: updatedProfile } });
  },

  getLeaderboard: (sortBy) => {
    const state = get();
    const entries = Object.values(state.players).map((p) => {
      const winRate = p.gamesPlayed > 0 ? (p.totalWins / p.gamesPlayed) * 100 : 0;
      const cooperationRate = p.totalMoves > 0 ? p.totalCooperateMoves / p.totalMoves : 0;
      const retaliationScore = p.totalBetrayalsFaced > 0 ? p.totalRetaliations / p.totalBetrayalsFaced : 0;
      const forgivenessScore = p.totalRetaliationSequences > 0 ? p.totalForgivenessEvents / p.totalRetaliationSequences : 0;
      const consistencyScore = p.totalRoundsPlayed > 0 ? p.longestStreak / p.totalRoundsPlayed : 0;
      const strategicScore = (retaliationScore + forgivenessScore + consistencyScore) / 3;
      const opportunismScore = p.totalDefections > 0 ? p.totalDefectionsAfterOpponentCoop / p.totalDefections : 0;

      return {
        ...p,
        rank: 0,
        winRate: Math.round(winRate),
        cooperationRate: Math.round(cooperationRate * 100) / 100,
        retaliationScore: Math.round(retaliationScore * 100) / 100,
        forgivenessScore: Math.round(forgivenessScore * 100) / 100,
        consistencyScore: Math.round(consistencyScore * 100) / 100,
        strategicScore: Math.round(strategicScore * 100) / 100,
        opportunismScore: Math.round(opportunismScore * 100) / 100,
      };
    });

    // Sort
    switch (sortBy) {
      case 'points':
        entries.sort((a, b) => b.totalPoints - a.totalPoints);
        break;
      case 'wins':
        entries.sort((a, b) => b.totalWins - a.totalWins);
        break;
      case 'streak':
        entries.sort((a, b) => b.longestWinStreak - a.longestWinStreak);
        break;
      case 'cooperation':
        entries.sort((a, b) => b.cooperationRate - a.cooperationRate);
        break;
      case 'strategic':
        entries.sort((a, b) => b.strategicScore - a.strategicScore);
        break;
      case 'forgiveness':
        entries.sort((a, b) => b.forgivenessScore - a.forgivenessScore);
        break;
      case 'retaliation':
        entries.sort((a, b) => b.retaliationScore - a.retaliationScore);
        break;
      case 'opportunism':
        entries.sort((a, b) => b.opportunismScore - a.opportunismScore);
        break;
      default:
        entries.sort((a, b) => b.totalPoints - a.totalPoints);
    }

    return entries.map((e, i) => ({ ...e, rank: i + 1 }));
  },
}));
