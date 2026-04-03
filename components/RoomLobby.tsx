'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRoomStore } from '@/stores/roomStore';

interface RoomLobbyProps {
  onBack: () => void;
}

export default function RoomLobby({ onBack }: RoomLobbyProps) {
  const {
    roomCode,
    players,
    maxPlayers,
    roomStatus,
    myDeviceId,
    hostDeviceId,
    startRoom,
    startPolling,
    stopPolling,
    loading,
    error,
  } = useRoomStore();

  const copied = useRef(false);

  useEffect(() => {
    startPolling();
    return () => stopPolling();
  }, [startPolling, stopPolling]);

  const isHost = myDeviceId === hostDeviceId;
  const canStart = players.length >= 2;

  const handleCopy = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode).then(() => {
      copied.current = true;
      setTimeout(() => { copied.current = false; }, 2000);
    });
  };

  // Once the host has started, the game phase is managed by page.tsx through polling
  useEffect(() => {
    if (roomStatus === 'playing') stopPolling();
  }, [roomStatus, stopPolling]);

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
      <motion.div
        className="w-full max-w-md space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-black text-white mb-1">Game Lobby</h2>
          <p className="text-gray-400 text-sm">Share the code with your friends</p>
        </div>

        {/* Room Code */}
        <motion.button
          onClick={handleCopy}
          className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-center
            hover:bg-white/10 transition-all cursor-pointer group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Room Code</p>
          <p className="text-6xl font-black tracking-widest bg-gradient-to-r from-cyan-400 to-purple-500
            bg-clip-text text-transparent">
            {roomCode}
          </p>
          <p className="text-xs text-gray-500 mt-3 group-hover:text-cyan-400 transition-colors">
            Tap to copy
          </p>
        </motion.button>

        {/* Players List */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Players</h3>
            <span className="text-xs text-gray-500">{players.length} / {maxPlayers}</span>
          </div>

          {/* Joined players */}
          <div className="space-y-2">
            {players.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 py-2 px-3 rounded-xl bg-white/5"
              >
                <span className="text-lg">
                  {p.deviceId === hostDeviceId ? '👑' : '🎮'}
                </span>
                <span className="text-white font-semibold text-sm flex-1">{p.alias}</span>
                {p.deviceId === myDeviceId && (
                  <span className="text-xs text-cyan-400 font-semibold">You</span>
                )}
                {p.deviceId === hostDeviceId && (
                  <span className="text-xs text-yellow-400/70 font-semibold">Host</span>
                )}
              </motion.div>
            ))}

            {/* Empty slots */}
            {Array.from({ length: maxPlayers - players.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex items-center gap-3 py-2 px-3 rounded-xl border border-white/5 border-dashed"
              >
                <span className="text-lg opacity-30">⏳</span>
                <span className="text-gray-600 text-sm italic">Waiting for player...</span>
                <motion.span
                  className="ml-auto w-2 h-2 rounded-full bg-cyan-500/40"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.5 }}
                />
              </div>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}

        {/* Start Button (host only) */}
        <AnimatePresence>
          {isHost && (
            <motion.button
              onClick={startRoom}
              disabled={!canStart || loading}
              className={`w-full py-4 rounded-xl font-bold text-lg tracking-wide transition-all duration-300 ${
                canStart
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-[0_0_30px_rgba(34,211,238,0.2)] hover:shadow-[0_0_40px_rgba(34,211,238,0.35)]'
                  : 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/10'
              }`}
              whileHover={canStart ? { scale: 1.02 } : {}}
              whileTap={canStart ? { scale: 0.98 } : {}}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {loading ? '⏳ Starting...' : canStart ? '🚀 Start Game' : `⏳ Need ${2 - players.length} more player${2 - players.length !== 1 ? 's' : ''}`}
            </motion.button>
          )}
          {!isHost && (
            <motion.div
              className="text-center text-gray-500 text-sm"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              Waiting for host to start the game...
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={onBack}
          className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400
            font-semibold text-sm hover:bg-white/10 transition-all"
        >
          ← Leave Room
        </button>
      </motion.div>
    </div>
  );
}
