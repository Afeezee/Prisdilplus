'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useIdentityStore } from '@/stores/identityStore';
import { getStrategyBotAlias } from '@/lib/strategyEngine';

export default function AliasInput() {
  const {
    mode,
    strategy,
    setPlayer1Alias,
    setPlayer2Alias,
    startGame,
    setPhase,
  } = useGameStore();

  const { identity } = useIdentityStore();

  // Pre-fill player 1 from persistent identity
  const [p1Name, setP1Name] = useState(identity?.alias || '');
  const [p2Name, setP2Name] = useState('');
  const [error, setError] = useState('');

  const handleContinue = () => {
    if (!p1Name.trim()) {
      setError('Player 1 must enter an alias');
      return;
    }
    if (mode === 'pvp' && !p2Name.trim()) {
      setError('Player 2 must enter an alias');
      return;
    }
    if (mode === 'pvp' && p1Name.trim().toLowerCase() === p2Name.trim().toLowerCase()) {
      setError('Players must use different aliases');
      return;
    }

    setPlayer1Alias(p1Name.trim());
    if (mode === 'pvc') {
      setPlayer2Alias(getStrategyBotAlias(strategy));
    } else {
      setPlayer2Alias(p2Name.trim());
    }

    startGame();
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
      <motion.div
        className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 space-y-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-center">
          <motion.h2
            className="text-2xl font-bold text-white mb-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Enter Your Alias
          </motion.h2>
          <p className="text-gray-400 text-sm">
            {identity
              ? 'Your alias is pre-filled from your profile'
              : 'Choose a unique nickname for the leaderboard'}
          </p>
        </div>

        {/* Player 1 */}
        <div>
          <label className="text-xs text-cyan-400 uppercase tracking-wider font-semibold mb-2 block">
            {mode === 'pvp' ? 'Player 1' : 'Your Alias'}
          </label>
          <div className="relative">
            <input
              type="text"
              value={p1Name}
              onChange={(e) => {
                setP1Name(e.target.value);
                setError('');
              }}
              placeholder="e.g. StrategicFox"
              maxLength={20}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm
                focus:outline-none focus:border-cyan-500/50 transition-colors placeholder-gray-600"
              autoFocus={!identity}
            />
            {identity && p1Name === identity.alias && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-cyan-500/50">
                ✓ saved
              </span>
            )}
          </div>
        </div>

        {/* Player 2 (PvP only) */}
        {mode === 'pvp' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <label className="text-xs text-purple-400 uppercase tracking-wider font-semibold mb-2 block">
              Player 2
            </label>
            <input
              type="text"
              value={p2Name}
              onChange={(e) => {
                setP2Name(e.target.value);
                setError('');
              }}
              placeholder="e.g. TrustKing"
              maxLength={20}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm
                focus:outline-none focus:border-purple-500/50 transition-colors placeholder-gray-600"
              autoFocus={!!identity}
            />
          </motion.div>
        )}

        {/* AI info */}
        {mode === 'pvc' && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <span className="text-xl">🤖</span>
            <div>
              <div className="text-purple-400 text-sm font-semibold">
                AI Opponent
              </div>
              <div className="text-gray-500 text-xs">
                {getStrategyBotAlias(strategy)}
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <motion.p
            className="text-red-400 text-sm text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <motion.button
            onClick={() => setPhase('landing')}
            className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10
              text-gray-400 font-semibold text-sm hover:bg-white/10 transition-all"
            whileTap={{ scale: 0.98 }}
          >
            ← Back
          </motion.button>
          <motion.button
            onClick={handleContinue}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600
              text-white font-bold text-sm shadow-[0_0_20px_rgba(34,211,238,0.15)]
              hover:from-cyan-400 hover:to-purple-500 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Begin →
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
