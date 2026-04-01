'use client';

import { useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { Move } from '@/lib/types';
import PlayerCard from './PlayerCard';
import ScorePanel from './ScorePanel';
import MoveAnimation from './MoveAnimation';

export default function GameBoard() {
  const {
    mode,
    currentRound,
    totalRounds,
    player1Alias,
    player2Alias,
    player1Score,
    player2Score,
    player1Move,
    player2Move,
    isRevealing,
    rounds,
    submitMove,
    revealMoves,
    nextRound,
  } = useGameStore();

  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Derived state - no setState needed
  const pvpTurn = useMemo(() => {
    if (mode !== 'pvp') return 'p1_choosing' as const;
    if (!player1Move) return 'p1_choosing' as const;
    if (!player2Move) return 'p2_choosing' as const;
    return 'ready' as const;
  }, [mode, player1Move, player2Move]);

  const bothMovesReady = !!player1Move && !!player2Move && !isRevealing;

  // Auto-reveal after both moves are in
  useEffect(() => {
    if (bothMovesReady) {
      revealTimerRef.current = setTimeout(() => {
        revealMoves();
      }, 800);
      return () => {
        if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
      };
    }
  }, [bothMovesReady, revealMoves]);

  const handleP1Choose = useCallback(
    (move: Move) => {
      submitMove(1, move);
    },
    [submitMove]
  );

  const handleP2Choose = useCallback(
    (move: Move) => {
      submitMove(2, move);
    },
    [submitMove]
  );

  const handleNextRound = useCallback(() => {
    nextRound();
  }, [nextRound]);

  // Get round score for current round
  const lastRound = rounds.length > 0 ? rounds[rounds.length - 1] : null;
  const isCurrentRoundRevealed = lastRound?.round === currentRound && isRevealing;

  return (
    <div className="relative z-10 flex flex-col items-center min-h-screen px-4 py-6 md:py-8">
      {/* Score Panel */}
      <ScorePanel
        currentRound={currentRound}
        totalRounds={totalRounds}
        player1Alias={player1Alias}
        player2Alias={player2Alias}
        player1Score={player1Score}
        player2Score={player2Score}
      />

      {/* Turn Indicator */}
      {!isRevealing && !bothMovesReady && (
        <motion.div
          className="mt-4 text-center"
          key={`${pvpTurn}-${currentRound}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {mode === 'pvc' && !player1Move && (
            <span className="text-cyan-400 font-semibold text-sm">
              🎯 {player1Alias} — choose your move!
            </span>
          )}
          {mode === 'pvp' && pvpTurn === 'p1_choosing' && (
            <span className="text-cyan-400 font-semibold text-sm">
              🎯 {player1Alias}&apos;s turn — choose your move!
            </span>
          )}
          {mode === 'pvp' && pvpTurn === 'p2_choosing' && (
            <span className="text-purple-400 font-semibold text-sm">
              🎭 {player2Alias}&apos;s turn — choose your move!
            </span>
          )}
        </motion.div>
      )}

      {/* Suspense indicator */}
      <AnimatePresence>
        {bothMovesReady && (
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-2xl"
              animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 0.6 }}
            >
              ⏳
            </motion.div>
            <p className="text-gray-400 text-sm mt-2">Revealing moves...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decision Arena */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 w-full max-w-4xl mt-6 md:mt-10">
        {/* Player 1 */}
        <PlayerCard
          alias={player1Alias}
          score={player1Score}
          move={player1Move}
          isRevealed={isCurrentRoundRevealed}
          isActive={
            mode === 'pvc'
              ? !player1Move && !isRevealing
              : pvpTurn === 'p1_choosing'
          }
          side="left"
          onChoose={handleP1Choose}
          showButtons={
            mode === 'pvc'
              ? !player1Move && !isRevealing
              : pvpTurn === 'p1_choosing'
          }
          roundScore={isCurrentRoundRevealed ? lastRound?.playerScore : undefined}
        />

        {/* VS / Animation */}
        <div className="flex flex-col items-center">
          {isCurrentRoundRevealed ? (
            <MoveAnimation
              player1Move={player1Move}
              player2Move={player2Move}
              isRevealing={isRevealing}
            />
          ) : (
            <motion.div
              className="text-3xl md:text-4xl font-black text-gray-600"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              VS
            </motion.div>
          )}
        </div>

        {/* Player 2 */}
        <PlayerCard
          alias={player2Alias}
          score={player2Score}
          move={player2Move}
          isRevealed={isCurrentRoundRevealed}
          isActive={mode === 'pvp' && pvpTurn === 'p2_choosing'}
          side="right"
          onChoose={handleP2Choose}
          showButtons={mode === 'pvp' && pvpTurn === 'p2_choosing'}
          roundScore={isCurrentRoundRevealed ? lastRound?.opponentScore : undefined}
        />
      </div>

      {/* Next Round / End Game button */}
      <AnimatePresence>
        {isRevealing && (
          <motion.div
            className="mt-6 md:mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <motion.button
              onClick={handleNextRound}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600
                text-white font-bold text-sm
                shadow-[0_0_20px_rgba(34,211,238,0.15)]
                hover:from-cyan-400 hover:to-purple-500 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {currentRound >= totalRounds ? '🏆 View Results' : '→ Next Round'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mini round history */}
      {rounds.length > 0 && (
        <motion.div
          className="mt-6 w-full max-w-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex gap-1 justify-center flex-wrap">
            {rounds.slice(-8).map((r) => (
              <motion.div
                key={r.round}
                className="flex items-center gap-0.5 px-2 py-1 rounded-lg bg-white/5 text-xs"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <span className="text-gray-500 mr-1">{r.round}.</span>
                <span className={r.playerMove === 'C' ? 'text-emerald-400' : 'text-red-400'}>
                  {r.playerMove === 'C' ? '🤝' : '⚔️'}
                </span>
                <span className="text-gray-600">:</span>
                <span className={r.opponentMove === 'C' ? 'text-emerald-400' : 'text-red-400'}>
                  {r.opponentMove === 'C' ? '🤝' : '⚔️'}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
