'use client';

import { motion } from 'framer-motion';

export default function PlayerModal({ player, onClose }: { player: any; onClose: any }) {
  if (!player) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">{player.alias}</h2>
          <p className="text-gray-400">Detailed player information</p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-cyan-400 text-sm font-medium">Games Played</div>
              <div className="text-white text-xl font-bold">{player.gamesPlayed}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-cyan-400 text-sm font-medium">Total Points</div>
              <div className="text-white text-xl font-bold">{player.totalPoints}</div>
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-cyan-400 text-sm font-medium mb-2">Behavioural Profile</div>
            <div className="text-white text-lg">{player.behaviouralProfile}</div>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-cyan-400 text-sm font-medium mb-2">Badges</div>
            <div className="text-white">
              {player.badges?.length > 0 ? player.badges.join(', ') : 'No badges yet'}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}