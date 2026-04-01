'use client';

import { motion } from 'framer-motion';
import { RoundResult } from '@/lib/types';

interface RoundTimelineProps {
  rounds: RoundResult[];
  player1Alias: string;
  player2Alias: string;
}

export default function RoundTimeline({
  rounds,
  player1Alias,
  player2Alias,
}: RoundTimelineProps) {
  if (rounds.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h3 className="text-white font-bold text-lg mb-4 text-center">
        Round History
      </h3>

      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {rounds.map((round, i) => {
          const p1Won = round.playerScore > round.opponentScore;
          const p2Won = round.opponentScore > round.playerScore;
          const tie = round.playerScore === round.opponentScore;

          return (
            <motion.div
              key={round.round}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              {/* Round number */}
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-gray-400 flex-shrink-0">
                {round.round}
              </div>

              {/* Player 1 move */}
              <div
                className={`flex-1 text-center py-1 px-2 rounded-lg text-sm font-semibold ${
                  round.playerMove === 'C'
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'bg-red-500/15 text-red-400'
                }`}
              >
                <span className="hidden sm:inline">{player1Alias}: </span>
                {round.playerMove === 'C' ? '🤝' : '⚔️'}
                <span className="ml-1 text-xs opacity-70">+{round.playerScore}</span>
              </div>

              {/* VS */}
              <div className="text-gray-600 text-xs font-bold">vs</div>

              {/* Player 2 move */}
              <div
                className={`flex-1 text-center py-1 px-2 rounded-lg text-sm font-semibold ${
                  round.opponentMove === 'C'
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'bg-red-500/15 text-red-400'
                }`}
              >
                <span className="hidden sm:inline">{player2Alias}: </span>
                {round.opponentMove === 'C' ? '🤝' : '⚔️'}
                <span className="ml-1 text-xs opacity-70">+{round.opponentScore}</span>
              </div>

              {/* Result indicator */}
              <div className="w-6 flex-shrink-0 text-center">
                {p1Won && <span className="text-cyan-400">◀</span>}
                {p2Won && <span className="text-purple-400">▶</span>}
                {tie && <span className="text-gray-500">=</span>}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
