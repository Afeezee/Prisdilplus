'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLeaderboardStore } from '@/stores/leaderboardStore';

const CATEGORIES = [
  { key: 'points', label: '🏆 Global Points', emoji: '🏆' },
  { key: 'wins', label: '🥇 Most Wins', emoji: '🥇' },
  { key: 'streak', label: '🔥 Win Streak', emoji: '🔥' },
  { key: 'cooperation', label: '🤝 Most Cooperative', emoji: '🤝' },
  { key: 'strategic', label: '🧠 Most Strategic', emoji: '🧠' },
  { key: 'forgiveness', label: '🕊️ Most Forgiving', emoji: '🕊️' },
  { key: 'retaliation', label: '⚡ Most Retaliatory', emoji: '⚡' },
  { key: 'opportunism', label: '🦊 Most Opportunistic', emoji: '🦊' },
];

interface LeaderboardScreenProps {
  onBack: () => void;
}

export default function LeaderboardScreen({ onBack }: LeaderboardScreenProps) {
  const { loadFromStorage, getLeaderboard, loaded } = useLeaderboardStore();
  const [activeCategory, setActiveCategory] = useState('points');

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const entries = getLeaderboard(activeCategory);

  const getValueDisplay = (entry: (typeof entries)[0]) => {
    switch (activeCategory) {
      case 'points':
        return `${entry.totalPoints} pts`;
      case 'wins':
        return `${entry.totalWins} wins`;
      case 'streak':
        return `${entry.longestWinStreak} streak`;
      case 'cooperation':
        return `${Math.round(entry.cooperationRate * 100)}%`;
      case 'strategic':
        return `${Math.round(entry.strategicScore * 100)}%`;
      case 'forgiveness':
        return `${Math.round(entry.forgivenessScore * 100)}%`;
      case 'retaliation':
        return `${Math.round(entry.retaliationScore * 100)}%`;
      case 'opportunism':
        return `${Math.round(entry.opportunismScore * 100)}%`;
      default:
        return `${entry.totalPoints}`;
    }
  };

  const podiumColors = ['from-yellow-500 to-amber-600', 'from-gray-300 to-gray-400', 'from-orange-600 to-amber-700'];
  const podiumEmojis = ['🥇', '🥈', '🥉'];

  return (
    <div className="relative z-10 min-h-screen px-4 py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.button
            onClick={onBack}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10
              text-gray-400 font-semibold text-sm hover:bg-white/10 transition-all"
            whileTap={{ scale: 0.95 }}
          >
            ← Back
          </motion.button>

          <h1 className="text-2xl md:text-3xl font-black text-white">
            🏆 Leaderboard
          </h1>

          <div className="w-20" /> {/* spacer */}
        </motion.div>

        {/* Human Only Badge */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">
            👤 Human Players Only — AI bots are excluded
          </span>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          className="relative mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Scroll fade indicators */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#0a0a0f] to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#0a0a0f] to-transparent z-10" />
          
          <div
            className="flex gap-2 overflow-x-auto pb-3 px-2"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border whitespace-nowrap ${
                  activeCategory === cat.key
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        {!loaded ? (
          <div className="text-center text-gray-500 py-20">Loading...</div>
        ) : entries.length === 0 ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-5xl mb-4">🎮</div>
            <h3 className="text-white font-bold text-lg mb-2">No Players Yet</h3>
            <p className="text-gray-500 text-sm">
              Play some games to see rankings here!
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Podium (top 3) */}
              {entries.length >= 3 && (
                <div className="flex items-end justify-center gap-3 mb-8">
                  {/* 2nd place */}
                  <motion.div
                    className="flex flex-col items-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="text-2xl mb-2">{podiumEmojis[1]}</div>
                    <div className="text-white font-bold text-sm truncate max-w-[80px]">
                      {entries[1].alias}
                    </div>
                    <div className="text-gray-400 text-xs">{getValueDisplay(entries[1])}</div>
                    <div className={`mt-2 w-20 h-16 rounded-t-xl bg-gradient-to-b ${podiumColors[1]} opacity-60`} />
                  </motion.div>

                  {/* 1st place */}
                  <motion.div
                    className="flex flex-col items-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <motion.div
                      className="text-3xl mb-2"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      {podiumEmojis[0]}
                    </motion.div>
                    <div className="text-white font-bold text-base truncate max-w-[100px]">
                      {entries[0].alias}
                    </div>
                    <div className="text-gray-400 text-xs">{getValueDisplay(entries[0])}</div>
                    <div className={`mt-2 w-24 h-24 rounded-t-xl bg-gradient-to-b ${podiumColors[0]} opacity-70`} />
                  </motion.div>

                  {/* 3rd place */}
                  <motion.div
                    className="flex flex-col items-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="text-2xl mb-2">{podiumEmojis[2]}</div>
                    <div className="text-white font-bold text-sm truncate max-w-[80px]">
                      {entries[2].alias}
                    </div>
                    <div className="text-gray-400 text-xs">{getValueDisplay(entries[2])}</div>
                    <div className={`mt-2 w-20 h-12 rounded-t-xl bg-gradient-to-b ${podiumColors[2]} opacity-50`} />
                  </motion.div>
                </div>
              )}

              {/* Full Table */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs text-gray-500 uppercase tracking-wider font-semibold border-b border-white/5">
                  <div className="col-span-1">#</div>
                  <div className="col-span-4">Player</div>
                  <div className="col-span-2 text-right">Value</div>
                  <div className="col-span-2 text-right hidden sm:block">Games</div>
                  <div className="col-span-3 text-right hidden md:block">Badges</div>
                </div>

                {/* Rows */}
                {entries.map((entry, i) => (
                  <motion.div
                    key={entry.alias}
                    className={`grid grid-cols-12 gap-2 px-4 py-3 items-center border-b border-white/5 last:border-0
                      ${i < 3 ? 'bg-white/[0.02]' : ''}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.2 }}
                  >
                    {/* Rank */}
                    <div className="col-span-1">
                      {i < 3 ? (
                        <span className="text-lg">{podiumEmojis[i]}</span>
                      ) : (
                        <span className="text-gray-500 font-bold text-sm">{entry.rank}</span>
                      )}
                    </div>

                    {/* Alias */}
                    <div className="col-span-4">
                      <div className="text-white font-semibold text-sm truncate">
                        {entry.alias}
                      </div>
                      <div className="text-gray-600 text-xs">
                        {entry.winRate}% win rate
                      </div>
                    </div>

                    {/* Value */}
                    <div className="col-span-2 text-right">
                      <span className="text-cyan-400 font-bold text-sm">
                        {getValueDisplay(entry)}
                      </span>
                    </div>

                    {/* Games */}
                    <div className="col-span-2 text-right hidden sm:block">
                      <span className="text-gray-500 text-xs">
                        {entry.gamesPlayed} games
                      </span>
                    </div>

                    {/* Badges */}
                    <div className="col-span-3 text-right hidden md:flex justify-end gap-1 flex-wrap">
                      {entry.badges.slice(0, 3).map((badge) => (
                        <span
                          key={badge}
                          className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-gray-400"
                          title={badge}
                        >
                          {badge.split(' ')[0]}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
