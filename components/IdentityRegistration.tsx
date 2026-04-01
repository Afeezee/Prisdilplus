'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useIdentityStore } from '@/stores/identityStore';

const ALIAS_REGEX = /^[a-zA-Z0-9_]+$/;
const MIN_LENGTH = 3;
const MAX_LENGTH = 20;

export default function IdentityRegistration() {
  const { createIdentity } = useIdentityStore();
  const [alias, setAlias] = useState('');
  const [error, setError] = useState('');

  const validate = (value: string): string => {
    if (value.length < MIN_LENGTH) {
      return `Minimum ${MIN_LENGTH} characters required`;
    }
    if (value.length > MAX_LENGTH) {
      return `Maximum ${MAX_LENGTH} characters allowed`;
    }
    if (!ALIAS_REGEX.test(value)) {
      return 'Only letters, numbers, and underscores allowed';
    }
    return '';
  };

  const handleChange = (value: string) => {
    // Strip spaces in real-time
    const cleaned = value.replace(/\s/g, '');
    if (cleaned.length <= MAX_LENGTH) {
      setAlias(cleaned);
    }
    if (error) setError('');
  };

  const handleConfirm = () => {
    const validationError = validate(alias);
    if (validationError) {
      setError(validationError);
      return;
    }
    createIdentity(alias);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleConfirm();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      />

      {/* Modal */}
      <motion.div
        className="relative w-full max-w-md bg-[#0d0d1a]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_0_60px_rgba(34,211,238,0.08)]"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring', damping: 20 }}
      >
        {/* Decorative glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Icon */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="text-5xl mb-4"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            🎭
          </motion.div>
          <h1 className="text-2xl md:text-3xl font-black text-white mb-2">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Prisdil+
            </span>
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            Choose your identity — this will represent you on the leaderboard forever
          </p>
        </motion.div>

        {/* Input */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label className="text-xs text-cyan-400 uppercase tracking-wider font-semibold mb-2 block">
            Your Alias
          </label>

          <div className="relative">
            <input
              type="text"
              value={alias}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. StrategicFox"
              maxLength={MAX_LENGTH}
              className={`w-full bg-white/5 border rounded-xl px-4 py-3.5 text-white text-base font-medium
                focus:outline-none transition-all duration-200 placeholder-gray-600
                ${error ? 'border-red-500/50 focus:border-red-500/80' : 'border-white/10 focus:border-cyan-500/50'}`}
              autoFocus
            />

            {/* Character counter */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <span
                className={`text-xs font-mono ${
                  alias.length >= MIN_LENGTH
                    ? 'text-cyan-500/60'
                    : 'text-gray-600'
                }`}
              >
                {alias.length}/{MAX_LENGTH}
              </span>
            </div>
          </div>

          {/* Validation hints */}
          <div className="mt-2 flex flex-col gap-1">
            {error ? (
              <motion.p
                className="text-red-400 text-xs"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
              >
                ✗ {error}
              </motion.p>
            ) : alias.length > 0 ? (
              <div className="flex flex-col gap-0.5">
                <span
                  className={`text-xs ${
                    alias.length >= MIN_LENGTH ? 'text-emerald-400' : 'text-gray-500'
                  }`}
                >
                  {alias.length >= MIN_LENGTH ? '✓' : '○'} At least {MIN_LENGTH} characters
                </span>
                <span
                  className={`text-xs ${
                    ALIAS_REGEX.test(alias) ? 'text-emerald-400' : 'text-gray-500'
                  }`}
                >
                  {ALIAS_REGEX.test(alias) ? '✓' : '○'} Letters, numbers, underscores only
                </span>
              </div>
            ) : (
              <span className="text-gray-600 text-xs">
                Letters, numbers, and underscores. No spaces.
              </span>
            )}
          </div>
        </motion.div>

        {/* Confirm Button */}
        <motion.button
          onClick={handleConfirm}
          disabled={alias.length < MIN_LENGTH}
          className={`w-full py-4 rounded-xl font-bold text-base tracking-wide transition-all duration-300
            ${
              alias.length >= MIN_LENGTH && ALIAS_REGEX.test(alias)
                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-[0_0_30px_rgba(34,211,238,0.2)] hover:from-cyan-400 hover:to-purple-500 cursor-pointer'
                : 'bg-white/5 text-gray-600 cursor-not-allowed'
            }`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={alias.length >= MIN_LENGTH ? { scale: 1.02 } : {}}
          whileTap={alias.length >= MIN_LENGTH ? { scale: 0.98 } : {}}
        >
          ✨ Confirm Identity
        </motion.button>

        {/* Footer note */}
        <motion.p
          className="text-center text-gray-600 text-xs mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          You can change this later in your profile settings
        </motion.p>
      </motion.div>
    </div>
  );
}
