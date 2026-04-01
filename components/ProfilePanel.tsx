'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIdentityStore } from '@/stores/identityStore';

const ALIAS_REGEX = /^[a-zA-Z0-9_]+$/;
const MIN_LENGTH = 3;
const MAX_LENGTH = 20;

export default function ProfilePanel() {
  const { identity, showProfilePanel, setShowProfilePanel, changeAlias } =
    useIdentityStore();

  const [isEditing, setIsEditing] = useState(false);
  const [newAlias, setNewAlias] = useState('');
  const [error, setError] = useState('');

  if (!identity) return null;

  const memberSince = new Date(identity.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleStartEdit = () => {
    setNewAlias(identity.alias);
    setIsEditing(true);
    setError('');
  };

  const handleConfirmChange = () => {
    const trimmed = newAlias.trim();
    if (trimmed.length < MIN_LENGTH) {
      setError(`Minimum ${MIN_LENGTH} characters`);
      return;
    }
    if (trimmed.length > MAX_LENGTH) {
      setError(`Maximum ${MAX_LENGTH} characters`);
      return;
    }
    if (!ALIAS_REGEX.test(trimmed)) {
      setError('Only letters, numbers, underscores');
      return;
    }
    changeAlias(trimmed);
    setIsEditing(false);
    setError('');
  };

  return (
    <AnimatePresence>
      {showProfilePanel && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowProfilePanel(false);
              setIsEditing(false);
            }}
          />

          {/* Panel */}
          <motion.div
            className="fixed top-4 right-4 z-[95] w-80 max-w-[calc(100vw-2rem)] bg-[#0d0d1a]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-[0_0_40px_rgba(0,0,0,0.5)]"
            initial={{ opacity: 0, x: 30, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 30, scale: 0.95 }}
            transition={{ duration: 0.25 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-sm uppercase tracking-wider">
                My Identity
              </h3>
              <button
                onClick={() => {
                  setShowProfilePanel(false);
                  setIsEditing(false);
                }}
                className="text-gray-500 hover:text-gray-300 transition-colors text-lg"
              >
                ✕
              </button>
            </div>

            {/* Avatar & Alias */}
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center text-xl">
                🎭
              </div>
              <div>
                <div className="text-white font-bold text-lg">{identity.alias}</div>
                <div className="text-gray-500 text-xs">
                  Member since {memberSince}
                </div>
              </div>
            </div>

            {/* Device ID */}
            <div className="mb-5 p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="text-gray-500 text-xs mb-1">Device ID</div>
              <div className="text-gray-400 text-xs font-mono truncate">
                {identity.deviceId}
              </div>
            </div>

            {/* Change Alias Section */}
            {!isEditing ? (
              <motion.button
                onClick={handleStartEdit}
                className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10
                  text-gray-400 font-semibold text-sm hover:bg-white/10 transition-all"
                whileTap={{ scale: 0.98 }}
              >
                ✏️ Change Alias
              </motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-3"
              >
                {/* Warning */}
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <p className="text-amber-400/80 text-xs leading-relaxed">
                    ⚠️ Changing your alias will not affect your existing leaderboard
                    history — your stats remain linked to your account.
                  </p>
                </div>

                {/* Input */}
                <div className="relative">
                  <input
                    type="text"
                    value={newAlias}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/\s/g, '');
                      if (cleaned.length <= MAX_LENGTH) {
                        setNewAlias(cleaned);
                      }
                      if (error) setError('');
                    }}
                    className={`w-full bg-white/5 border rounded-xl px-4 py-2.5 text-white text-sm
                      focus:outline-none transition-all placeholder-gray-600
                      ${error ? 'border-red-500/50' : 'border-white/10 focus:border-cyan-500/50'}`}
                    autoFocus
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-600 font-mono">
                    {newAlias.length}/{MAX_LENGTH}
                  </span>
                </div>

                {error && (
                  <p className="text-red-400 text-xs">✗ {error}</p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setError('');
                    }}
                    className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10
                      text-gray-400 text-sm hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmChange}
                    className="flex-1 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40
                      text-cyan-400 font-semibold text-sm hover:bg-cyan-500/30 transition-all"
                  >
                    Confirm
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
