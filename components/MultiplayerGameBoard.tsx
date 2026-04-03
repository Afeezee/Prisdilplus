'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRoomStore, RevealedSubmission } from '@/stores/roomStore';

interface MultiplayerGameBoardProps {
  onGameEnd: () => void;
}

const MOVE_EMOJI: Record<string, string> = { C: '🤝', D: '🗡️' };
const MOVE_LABEL: Record<string, string> = { C: 'Cooperate', D: 'Defect' };

export default function MultiplayerGameBoard({ onGameEnd }: MultiplayerGameBoardProps) {
  const {
    players,
    myPlayerId,
    currentRound,
    totalRounds,
    mySubmittedThisRound,
    submittedCount,
    revealedSubmissions,
    roomStatus,
    submitMove,
    startPolling,
    stopPolling,
  } = useRoomStore();

  const [showReveal, setShowReveal] = useState(false);
  const [lastRevealRound, setLastRevealRound] = useState(0);
  const [selectedMove, setSelectedMove] = useState<'C' | 'D' | null>(null);

  useEffect(() => {
    startPolling();
    return () => stopPolling();
  }, [startPolling, stopPolling]);

  // Show reveal animation when new round results arrive
  useEffect(() => {
    if (revealedSubmissions.length > 0) {
      const round = revealedSubmissions[0].round;
      if (round !== lastRevealRound) {
        setLastRevealRound(round);
        setShowReveal(true);
        setSelectedMove(null);
      }
    }
  }, [revealedSubmissions, lastRevealRound]);

  useEffect(() => {
    if (roomStatus === 'finished') {
      stopPolling();
      // Give time for last reveal animation
      setTimeout(onGameEnd, 3000);
    }
  }, [roomStatus, onGameEnd, stopPolling]);

  const handleSubmit = (move: 'C' | 'D') => {
    setSelectedMove(move);
    submitMove(move);
  };

  const mySubmission = revealedSubmissions.find(s => s.playerId === myPlayerId);
  const waitingFor = players.length - submittedCount;

  const getPlayerAlias = (playerId: string) => players.find(p => p.id === playerId)?.alias ?? 'Unknown';

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
      <div className="w-full max-w-lg space-y-5">

        {/* Round Header */}
        <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Round</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-5xl font-black text-white">{Math.min(currentRound, totalRounds)}</span>
            <span className="text-gray-600 text-2xl font-light">/</span>
            <span className="text-2xl font-bold text-gray-500">{totalRounds}</span>
          </div>
          {/* Progress bar */}
          <div className="mt-3 w-48 h-1 bg-white/10 rounded-full mx-auto overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
              animate={{ width: `${(Math.min(currentRound, totalRounds) / totalRounds) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Scoreboard */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Standings</p>
          <div className="space-y-2">
            {[...players].sort((a, b) => b.totalScore - a.totalScore).map((p, idx) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-500 w-5">{idx + 1}</span>
                <span className="text-base">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🎯'}</span>
                <span className={`flex-1 text-sm font-semibold ${p.id === myPlayerId ? 'text-cyan-400' : 'text-white'}`}>
                  {p.alias} {p.id === myPlayerId && <span className="text-xs text-cyan-400/60">(You)</span>}
                </span>
                <span className="text-sm font-bold text-white tabular-nums">{p.totalScore} pts</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reveal Panel */}
        <AnimatePresence mode="wait">
          {showReveal && revealedSubmissions.length > 0 && (
            <motion.div
              key={`reveal-${lastRevealRound}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-5"
            >
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
                Round {lastRevealRound} — Reveal
              </p>
              <div className="space-y-2">
                {revealedSubmissions.map((sub: RevealedSubmission) => {
                  const alias = getPlayerAlias(sub.playerId);
                  const isMe = sub.playerId === myPlayerId;
                  return (
                    <motion.div
                      key={sub.playerId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex items-center gap-3 py-2 px-3 rounded-xl ${isMe ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-white/5'}`}
                    >
                      <span className="text-xl">{MOVE_EMOJI[sub.move]}</span>
                      <span className={`flex-1 text-sm font-semibold ${isMe ? 'text-cyan-400' : 'text-white'}`}>
                        {alias}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                        sub.move === 'C' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {MOVE_LABEL[sub.move]}
                      </span>
                      <span className="text-sm font-bold text-white tabular-nums w-14 text-right">
                        +{sub.score} pts
                      </span>
                    </motion.div>
                  );
                })}
              </div>
              {roomStatus !== 'finished' && (
                <motion.button
                  onClick={() => setShowReveal(false)}
                  className="mt-4 w-full py-2 rounded-xl text-sm text-gray-400 bg-white/5 hover:bg-white/10 transition-all"
                  whileTap={{ scale: 0.97 }}
                >
                  Continue →
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Move Buttons */}
        {!showReveal && roomStatus === 'playing' && (
          <AnimatePresence mode="wait">
            {!mySubmittedThisRound ? (
              <motion.div
                key="move-buttons"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-3"
              >
                <p className="text-center text-gray-400 text-sm">Choose your move — others can&apos;t see it yet</p>
                <div className="grid grid-cols-2 gap-4">
                  <motion.button
                    onClick={() => handleSubmit('C')}
                    className="py-8 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20
                      transition-all flex flex-col items-center gap-2 group"
                    whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(34,211,238,0.2)' }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <span className="text-4xl">🤝</span>
                    <span className="text-cyan-400 font-bold text-sm">Cooperate</span>
                    <span className="text-gray-600 text-xs">Trust the group</span>
                  </motion.button>
                  <motion.button
                    onClick={() => handleSubmit('D')}
                    className="py-8 rounded-2xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/20
                      transition-all flex flex-col items-center gap-2 group"
                    whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(239,68,68,0.2)' }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <span className="text-4xl">🗡️</span>
                    <span className="text-red-400 font-bold text-sm">Defect</span>
                    <span className="text-gray-600 text-xs">Betray the group</span>
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="waiting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-10"
              >
                <motion.div
                  className="text-5xl mb-4"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  {selectedMove ? MOVE_EMOJI[selectedMove] : '⏳'}
                </motion.div>
                <p className="text-white font-semibold">
                  You chose: <span className={selectedMove === 'C' ? 'text-cyan-400' : 'text-red-400'}>
                    {selectedMove ? MOVE_LABEL[selectedMove] : '...'}
                  </span>
                </p>
                <motion.p
                  className="text-gray-500 text-sm mt-2"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  Waiting for {waitingFor} more player{waitingFor !== 1 ? 's' : ''}...
                </motion.p>
                {/* Submitted dots */}
                <div className="flex justify-center gap-2 mt-4">
                  {players.map((_, i) => (
                    <motion.div
                      key={i}
                      className={`w-2 h-2 rounded-full ${i < submittedCount ? 'bg-cyan-400' : 'bg-white/10'}`}
                      animate={i < submittedCount ? {} : { opacity: [0.3, 1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.3 }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {roomStatus === 'finished' && (
          <motion.div
            className="text-center py-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-2xl font-black text-white">Game Over!</p>
            <p className="text-gray-400 text-sm mt-2">Loading final results...</p>
          </motion.div>
        )}

      </div>
    </div>
  );
}
