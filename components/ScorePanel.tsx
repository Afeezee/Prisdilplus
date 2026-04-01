'use client';

import { motion } from 'framer-motion';

interface ScorePanelProps {
  currentRound: number;
  totalRounds: number;
  player1Alias: string;
  player2Alias: string;
  player1Score: number;
  player2Score: number;
}

export default function ScorePanel({
  currentRound,
  totalRounds,
  player1Alias,
  player2Alias,
  player1Score,
  player2Score,
}: ScorePanelProps) {
  const progress = ((currentRound - 1) / totalRounds) * 100;

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Round indicator */}
      <div className="text-center mb-4">
        <motion.div
          className="text-sm text-gray-400 uppercase tracking-widest mb-1"
          key={currentRound}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Round {currentRound} of {totalRounds}
        </motion.div>
      </div>

      {/* Score display */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="text-center flex-1">
          <div className="text-xs text-cyan-400 font-medium uppercase tracking-wider mb-1 truncate">
            {player1Alias}
          </div>
          <motion.div
            className="text-2xl md:text-3xl font-black text-white"
            key={player1Score}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {player1Score}
          </motion.div>
        </div>

        <div className="text-gray-500 font-bold text-lg">VS</div>

        <div className="text-center flex-1">
          <div className="text-xs text-purple-400 font-medium uppercase tracking-wider mb-1 truncate">
            {player2Alias}
          </div>
          <motion.div
            className="text-2xl md:text-3xl font-black text-white"
            key={player2Score}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {player2Score}
          </motion.div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
}
