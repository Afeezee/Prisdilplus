'use client';

import { motion } from 'framer-motion';
import { Move } from '@/lib/types';

interface PlayerCardProps {
  alias: string;
  score: number;
  move: Move | null;
  isRevealed: boolean;
  isActive: boolean;
  side: 'left' | 'right';
  onChoose?: (move: Move) => void;
  showButtons: boolean;
  roundScore?: number;
}

export default function PlayerCard({
  alias,
  score,
  move,
  isRevealed,
  isActive,
  side,
  onChoose,
  showButtons,
  roundScore,
}: PlayerCardProps) {
  const borderColor = isActive
    ? 'border-cyan-400/60'
    : 'border-white/10';

  const glowColor = isActive
    ? 'shadow-[0_0_30px_rgba(34,211,238,0.15)]'
    : '';

  return (
    <motion.div
      className={`relative flex flex-col items-center gap-4 p-6 rounded-2xl
        bg-white/5 backdrop-blur-xl border ${borderColor} ${glowColor}
        transition-all duration-300 w-full max-w-[280px]`}
      initial={{ opacity: 0, x: side === 'left' ? -50 : 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Avatar */}
      <motion.div
        className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl
          ${side === 'left' ? 'bg-cyan-500/20 border-cyan-400/30' : 'bg-purple-500/20 border-purple-400/30'}
          border-2`}
        animate={isActive ? { scale: [1, 1.05, 1] } : {}}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        {side === 'left' ? '🎯' : '🎭'}
      </motion.div>

      {/* Name */}
      <h3 className="text-white font-bold text-lg tracking-wide truncate max-w-full">
        {alias}
      </h3>

      {/* Score */}
      <div className="relative">
        <motion.div
          className="text-3xl font-black text-white"
          key={score}
          initial={{ scale: 1.3, color: '#4ECDC4' }}
          animate={{ scale: 1, color: '#ffffff' }}
          transition={{ duration: 0.4 }}
        >
          {score}
        </motion.div>

        {/* Floating score indicator */}
        {roundScore !== undefined && roundScore > 0 && isRevealed && (
          <motion.div
            className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm font-bold"
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -30 }}
            transition={{ duration: 1.5, delay: 0.3 }}
            style={{
              color: roundScore >= 3 ? '#4ECDC4' : roundScore > 0 ? '#FFEAA7' : '#FF6B6B',
            }}
          >
            +{roundScore}
          </motion.div>
        )}
      </div>

      {/* Move display (when revealed) */}
      {isRevealed && move && (
        <motion.div
          className={`mt-2 px-4 py-2 rounded-xl text-lg font-bold ${
            move === 'C'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}
          initial={{ rotateY: 180, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {move === 'C' ? '🤝 Cooperate' : '⚔️ Defect'}
        </motion.div>
      )}

      {/* Hidden indicator */}
      {!isRevealed && move && (
        <motion.div
          className="mt-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          ✓ Locked In
        </motion.div>
      )}

      {/* Decision buttons */}
      {showButtons && isActive && !move && (
        <motion.div
          className="flex gap-3 mt-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.button
            onClick={() => onChoose?.('C')}
            className="px-5 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40
              text-emerald-400 font-bold hover:bg-emerald-500/30 hover:scale-105
              active:scale-95 transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🤝 Cooperate
          </motion.button>
          <motion.button
            onClick={() => onChoose?.('D')}
            className="px-5 py-3 rounded-xl bg-red-500/20 border border-red-500/40
              text-red-400 font-bold hover:bg-red-500/30 hover:scale-105
              active:scale-95 transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ⚔️ Defect
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}
