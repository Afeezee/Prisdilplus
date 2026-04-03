'use client';

import { motion } from 'framer-motion';
import { useRoomStore } from '@/stores/roomStore';

interface MultiplayerResultsProps {
  onPlayAgain: () => void;
}

const RANK_EMOJI = ['🥇', '🥈', '🥉', '🎯', '🎯', '🎯', '🎯', '🎯'];

export default function MultiplayerResults({ onPlayAgain }: MultiplayerResultsProps) {
  const { players, myPlayerId, totalRounds, roomCode, reset } = useRoomStore();

  const sorted = [...players].sort((a, b) => b.totalScore - a.totalScore);
  const winner = sorted[0];
  const me = players.find(p => p.id === myPlayerId);
  const myRank = sorted.findIndex(p => p.id === myPlayerId) + 1;
  const iWon = me?.id === winner?.id;

  const handlePlayAgain = () => {
    reset();
    onPlayAgain();
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
      <div className="w-full max-w-md space-y-6">

        {/* Trophy / Result Header */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="text-7xl mb-3"
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            {iWon ? '🏆' : myRank === 2 ? '🥈' : '🎮'}
          </motion.div>
          <h2 className="text-4xl font-black text-white">
            {iWon ? 'You Won!' : `${winner?.alias} Wins!`}
          </h2>
          {!iWon && (
            <p className="text-gray-400 text-sm mt-1">You finished #{myRank}</p>
          )}
          <p className="text-gray-500 text-xs mt-2">Room Code: <span className="text-gray-400 font-mono font-bold">{roomCode}</span> · {totalRounds} rounds</p>
        </motion.div>

        {/* Final Leaderboard */}
        <motion.div
          className="bg-white/5 border border-white/10 rounded-2xl p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">Final Standings</p>
          <div className="space-y-3">
            {sorted.map((p, idx) => {
              const isMe = p.id === myPlayerId;
              const isWinner = idx === 0;
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className={`flex items-center gap-3 py-3 px-4 rounded-xl ${
                    isWinner
                      ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20'
                      : isMe
                      ? 'bg-cyan-500/10 border border-cyan-500/20'
                      : 'bg-white/5'
                  }`}
                >
                  <span className="text-xl">{RANK_EMOJI[idx]}</span>
                  <div className="flex-1">
                    <p className={`font-bold text-sm ${isMe ? 'text-cyan-400' : isWinner ? 'text-yellow-400' : 'text-white'}`}>
                      {p.alias} {isMe && <span className="text-xs opacity-60">(You)</span>}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-black tabular-nums">{p.totalScore}</p>
                    <p className="text-gray-500 text-xs">pts</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Stat: my avg score per round */}
        {me && (
          <motion.div
            className="grid grid-cols-2 gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <p className="text-2xl font-black text-white">{me.totalScore}</p>
              <p className="text-xs text-gray-500 mt-1">Total Points</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <p className="text-2xl font-black text-cyan-400">#{myRank}</p>
              <p className="text-xs text-gray-500 mt-1">Final Rank</p>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={handlePlayAgain}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600
              text-white font-bold text-lg hover:from-cyan-400 hover:to-purple-500
              shadow-[0_0_30px_rgba(34,211,238,0.2)] transition-all duration-300"
          >
            🎮 Play Again
          </button>
        </motion.div>
      </div>
    </div>
  );
}
