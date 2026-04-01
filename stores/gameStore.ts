'use client';
// ============================================================
// Prisdil+ Game Store (Zustand)
// ============================================================

import { create } from 'zustand';
import {
  Move,
  GameMode,
  StrategyType,
  RoundResult,
  GamePhase,
  BehaviourMetrics,
  BehaviourProfile,
} from '@/lib/types';
import { scoreRound } from '@/lib/scoringEngine';
import { getStrategyMove } from '@/lib/strategyEngine';
import { computeMetrics, classifyProfile } from '@/lib/behaviourEngine';

interface GameState {
  // Settings
  phase: GamePhase;
  mode: GameMode;
  totalRounds: number;
  strategy: StrategyType;
  player1Alias: string;
  player2Alias: string;

  // Game State
  currentRound: number;
  rounds: RoundResult[];
  player1Score: number;
  player2Score: number;
  player1Move: Move | null;
  player2Move: Move | null;
  isRevealing: boolean;
  waitingForPlayer: 1 | 2;

  // Results
  player1Metrics: BehaviourMetrics | null;
  player2Metrics: BehaviourMetrics | null;
  player1Profile: BehaviourProfile | null;
  player2Profile: BehaviourProfile | null;
  winner: 'player1' | 'player2' | 'tie' | null;

  // Actions
  setPhase: (phase: GamePhase) => void;
  setMode: (mode: GameMode) => void;
  setTotalRounds: (rounds: number) => void;
  setStrategy: (strategy: StrategyType) => void;
  setPlayer1Alias: (alias: string) => void;
  setPlayer2Alias: (alias: string) => void;
  startGame: () => void;
  submitMove: (player: 1 | 2, move: Move) => void;
  revealMoves: () => void;
  nextRound: () => void;
  computeResults: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  // Default settings
  phase: 'landing',
  mode: 'pvc',
  totalRounds: 10,
  strategy: 'tit_for_tat',
  player1Alias: '',
  player2Alias: '',

  // Game state
  currentRound: 1,
  rounds: [],
  player1Score: 0,
  player2Score: 0,
  player1Move: null,
  player2Move: null,
  isRevealing: false,
  waitingForPlayer: 1,

  // Results
  player1Metrics: null,
  player2Metrics: null,
  player1Profile: null,
  player2Profile: null,
  winner: null,

  setPhase: (phase) => set({ phase }),
  setMode: (mode) => set({ mode }),
  setTotalRounds: (totalRounds) => set({ totalRounds }),
  setStrategy: (strategy) => set({ strategy }),
  setPlayer1Alias: (alias) => set({ player1Alias: alias }),
  setPlayer2Alias: (alias) => set({ player2Alias: alias }),

  startGame: () => {
    set({
      phase: 'playing',
      currentRound: 1,
      rounds: [],
      player1Score: 0,
      player2Score: 0,
      player1Move: null,
      player2Move: null,
      isRevealing: false,
      waitingForPlayer: 1,
      player1Metrics: null,
      player2Metrics: null,
      player1Profile: null,
      player2Profile: null,
      winner: null,
    });
  },

  submitMove: (player, move) => {
    const state = get();

    if (player === 1) {
      set({ player1Move: move });

      // If PvC, auto-compute computer move
      if (state.mode === 'pvc') {
        const computerMove = getStrategyMove(
          state.strategy,
          state.rounds,
          state.currentRound
        );
        set({ player2Move: computerMove });
      } else {
        // PvP: wait for player 2
        set({ waitingForPlayer: 2 });
      }
    } else {
      set({ player2Move: move });
    }
  },

  revealMoves: () => {
    const state = get();
    if (!state.player1Move || !state.player2Move) return;

    const { player1Score: p1s, player2Score: p2s } = scoreRound(
      state.player1Move,
      state.player2Move
    );

    const newCumulativeP1 = state.player1Score + p1s;
    const newCumulativeP2 = state.player2Score + p2s;

    const roundResult: RoundResult = {
      round: state.currentRound,
      playerMove: state.player1Move,
      opponentMove: state.player2Move,
      playerScore: p1s,
      opponentScore: p2s,
      cumulativePlayerScore: newCumulativeP1,
      cumulativeOpponentScore: newCumulativeP2,
    };

    set({
      isRevealing: true,
      rounds: [...state.rounds, roundResult],
      player1Score: newCumulativeP1,
      player2Score: newCumulativeP2,
    });
  },

  nextRound: () => {
    const state = get();
    if (state.currentRound >= state.totalRounds) {
      // Game over — compute results
      get().computeResults();
      return;
    }

    set({
      currentRound: state.currentRound + 1,
      player1Move: null,
      player2Move: null,
      isRevealing: false,
      waitingForPlayer: 1,
    });
  },

  computeResults: () => {
    const state = get();
    const p1Moves = state.rounds.map((r) => r.playerMove);
    const p2Moves = state.rounds.map((r) => r.opponentMove);

    const p1Metrics = computeMetrics(p1Moves, p2Moves, state.rounds, 'player');
    const p2Metrics = computeMetrics(p2Moves, p1Moves, state.rounds, 'opponent');

    const p1Profile = classifyProfile(p1Metrics);
    const p2Profile = classifyProfile(p2Metrics);

    let winner: 'player1' | 'player2' | 'tie';
    if (state.player1Score > state.player2Score) winner = 'player1';
    else if (state.player2Score > state.player1Score) winner = 'player2';
    else winner = 'tie';

    set({
      phase: 'results',
      player1Metrics: p1Metrics,
      player2Metrics: p2Metrics,
      player1Profile: p1Profile,
      player2Profile: p2Profile,
      winner,
      isRevealing: false,
    });
  },

  resetGame: () => {
    set({
      phase: 'landing',
      currentRound: 1,
      rounds: [],
      player1Score: 0,
      player2Score: 0,
      player1Move: null,
      player2Move: null,
      isRevealing: false,
      waitingForPlayer: 1,
      player1Metrics: null,
      player2Metrics: null,
      player1Profile: null,
      player2Profile: null,
      winner: null,
      player1Alias: '',
      player2Alias: '',
    });
  },
}));
