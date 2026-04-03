'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useIdentityStore } from '@/stores/identityStore';
import { useRoomStore } from '@/stores/roomStore';
import { GameMode, StrategyType } from '@/lib/types';
import { getStrategyDisplayName } from '@/lib/strategyEngine';

const STRATEGIES: StrategyType[] = [
  'random',
  'always_defect',
  'tit_for_tat',
  'forgiving_tit_for_tat',
  'grudger',
  'suspicious_tit_for_tat',
  'pavlov',
];

const ROUND_OPTIONS = [5, 10, 20];

interface LandingScreenProps {
  onShowLeaderboard: () => void;
  onEnterLobby: () => void;
}

export default function LandingScreen({ onShowLeaderboard, onEnterLobby }: LandingScreenProps) {
  const {
    mode,
    totalRounds,
    strategy,
    setMode,
    setTotalRounds,
    setStrategy,
    setPhase,
  } = useGameStore();

  const { identity, setShowProfilePanel } = useIdentityStore();
  const { createRoom, joinRoom, loading: roomLoading, error: roomError } = useRoomStore();

  const [customRounds, setCustomRounds] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  // PvP sub-mode: 'choose' | 'create' | 'join'
  const [pvpMode, setPvpMode] = useState<'choose' | 'create' | 'join'>('choose');
  const [roomPlayers, setRoomPlayers] = useState(2);
  const [joinCode, setJoinCode] = useState('');

  const handleStart = () => {
    if (mode === 'pvp') return; // PvP handled via room buttons
    if (showCustom && customRounds) {
      const num = parseInt(customRounds);
      if (num > 0 && num <= 100) setTotalRounds(num);
    }
    setPhase('alias');
  };

  const handleCreateRoom = async () => {
    if (!identity) return;
    const rounds = showCustom && customRounds ? Math.min(100, Math.max(1, parseInt(customRounds) || 10)) : totalRounds;
    await createRoom(identity.deviceId, identity.alias, roomPlayers, rounds);
    onEnterLobby();
  };

  const handleJoinRoom = async () => {
    if (!identity || !joinCode.trim()) return;
    await joinRoom(joinCode.trim().toUpperCase(), identity.deviceId, identity.alias);
    onEnterLobby();
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
      {/* Profile Button (top-right) */}
      {identity && (
        <motion.button
          onClick={() => setShowProfilePanel(true)}
          className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-xl
            bg-white/5 border border-white/10 backdrop-blur-sm
            text-gray-400 text-sm hover:bg-white/10 transition-all"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          whileTap={{ scale: 0.97 }}
        >
          <span className="text-base">🎭</span>
          <span className="font-semibold hidden sm:inline">{identity.alias}</span>
        </motion.button>
      )}

      {/* Logo / Title */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <motion.h1
          className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            Prisdil
          </span>
          <motion.span
            className="text-cyan-400"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            +
          </motion.span>
        </motion.h1>

        <motion.p
          className="text-gray-400 text-sm md:text-base mt-3 max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Discover how you cooperate, compete, retaliate, and forgive
        </motion.p>

        {/* Welcome back message */}
        {identity && (
          <motion.p
            className="text-cyan-400/60 text-xs mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Welcome back, <span className="font-semibold">{identity.alias}</span>
          </motion.p>
        )}
      </motion.div>

      {/* Settings Card */}
      <motion.div
        className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 space-y-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        {/* Mode Selector */}
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3 block">
            Game Mode
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(['pvp', 'pvc'] as GameMode[]).map((m) => (
              <motion.button
                key={m}
                onClick={() => { setMode(m); setPvpMode('choose'); }}
                className={`py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 border ${
                  mode === m
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {m === 'pvp' ? '👥 Multiplayer' : '🤖 Player vs AI'}
              </motion.button>
            ))}
          </div>
        </div>

        {/* PvP Room Options */}
        <AnimatePresence>
          {mode === 'pvp' && (
            <motion.div
              key="pvp-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 overflow-hidden"
            >
              {pvpMode === 'choose' && (
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    onClick={() => setPvpMode('create')}
                    className="py-3 px-4 rounded-xl font-semibold text-sm bg-white/5 border border-white/10
                      text-gray-300 hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-400 transition-all"
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  >
                    🎲 Create Room
                  </motion.button>
                  <motion.button
                    onClick={() => setPvpMode('join')}
                    className="py-3 px-4 rounded-xl font-semibold text-sm bg-white/5 border border-white/10
                      text-gray-300 hover:bg-purple-500/10 hover:border-purple-500/30 hover:text-purple-400 transition-all"
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  >
                    🔑 Join Room
                  </motion.button>
                </div>
              )}

              {pvpMode === 'create' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2 block">Players (2–8)</label>
                    <div className="flex gap-2 flex-wrap">
                      {[2,3,4,5,6,7,8].map(n => (
                        <motion.button
                          key={n}
                          onClick={() => setRoomPlayers(n)}
                          className={`py-2 px-4 rounded-xl text-sm font-semibold border transition-all ${
                            roomPlayers === n
                              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                              : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                          }`}
                          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        >{n}</motion.button>
                      ))}
                    </div>
                  </div>
                  {roomError && <p className="text-red-400 text-xs">{roomError}</p>}
                  <div className="flex gap-2">
                    <button onClick={() => setPvpMode('choose')} className="flex-1 py-2.5 rounded-xl text-sm text-gray-500 bg-white/5 hover:bg-white/10 transition-all">← Back</button>
                    <motion.button
                      onClick={handleCreateRoom}
                      disabled={roomLoading}
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:opacity-90 transition-all disabled:opacity-50"
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    >
                      {roomLoading ? '⏳...' : '🎲 Create'}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {pvpMode === 'join' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2 block">Enter Room Code</label>
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="XKTR"
                      value={joinCode}
                      onChange={e => setJoinCode(e.target.value.toUpperCase())}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xl
                        font-mono tracking-widest text-center uppercase focus:outline-none focus:border-cyan-500/50
                        transition-colors placeholder-gray-700"
                    />
                  </div>
                  {roomError && <p className="text-red-400 text-xs">{roomError}</p>}
                  <div className="flex gap-2">
                    <button onClick={() => setPvpMode('choose')} className="flex-1 py-2.5 rounded-xl text-sm text-gray-500 bg-white/5 hover:bg-white/10 transition-all">← Back</button>
                    <motion.button
                      onClick={handleJoinRoom}
                      disabled={roomLoading || joinCode.length < 4}
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:opacity-90 transition-all disabled:opacity-50"
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    >
                      {roomLoading ? '⏳...' : '🔑 Join'}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Strategy Selector (PvC only) */}
        {mode === 'pvc' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3 block">
              AI Strategy
            </label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value as StrategyType)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm
                focus:outline-none focus:border-cyan-500/50 transition-colors appearance-none cursor-pointer"
            >
              {STRATEGIES.map((s) => (
                <option key={s} value={s} className="bg-gray-900">
                  {getStrategyDisplayName(s)}
                </option>
              ))}
            </select>
          </motion.div>
        )}

        {/* Rounds Selector */}
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3 block">
            Number of Rounds
          </label>
          <div className="flex gap-2 flex-wrap">
            {ROUND_OPTIONS.map((r) => (
              <motion.button
                key={r}
                onClick={() => {
                  setTotalRounds(r);
                  setShowCustom(false);
                }}
                className={`py-2 px-5 rounded-xl font-semibold text-sm transition-all duration-200 border ${
                  totalRounds === r && !showCustom
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {r}
              </motion.button>
            ))}
            <motion.button
              onClick={() => setShowCustom(true)}
              className={`py-2 px-5 rounded-xl font-semibold text-sm transition-all duration-200 border ${
                showCustom
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Custom
            </motion.button>
          </div>

          {showCustom && (
            <motion.input
              type="number"
              min="1"
              max="100"
              placeholder="Enter rounds (1-100)"
              value={customRounds}
              onChange={(e) => setCustomRounds(e.target.value)}
              className="mt-3 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm
                focus:outline-none focus:border-cyan-500/50 transition-colors placeholder-gray-600"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            />
          )}
        </div>

        {/* Start Button — only for PvC */}
        {mode === 'pvc' && (
          <motion.button
            onClick={handleStart}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600
              text-white font-bold text-lg tracking-wide
              hover:from-cyan-400 hover:to-purple-500
              shadow-[0_0_30px_rgba(34,211,238,0.2)]
              transition-all duration-300"
            whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(34,211,238,0.3)' }}
            whileTap={{ scale: 0.98 }}
          >
            🎮 Start Game
          </motion.button>
        )}

        {/* Leaderboard Button */}
        <motion.button
          onClick={onShowLeaderboard}
          className="w-full py-3 rounded-xl bg-white/5 border border-white/10
            text-gray-400 font-semibold text-sm hover:bg-white/10 transition-all duration-200"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          🏆 View Leaderboard
        </motion.button>
      </motion.div>

      {/* Footer */}
      <motion.p
        className="text-gray-600 text-xs mt-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        A game-theory based behavioural strategy experience
      </motion.p>
    </div>
  );
}
