'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useIdentityStore } from '@/stores/identityStore';

const ALIAS_REGEX = /^[a-zA-Z0-9_]+$/;
const MIN_LENGTH = 3;
const MAX_LENGTH = 20;

// Floating particle component
function FloatingParticle({ delay, x, y, size }: { delay: number; x: string; y: string; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full bg-cyan-400/20"
      style={{ left: x, top: y, width: size, height: size }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 0.6, 0],
        scale: [0, 1, 0.5],
        y: [0, -60, -120],
      }}
      transition={{
        duration: 4,
        delay,
        repeat: Infinity,
        ease: 'easeOut',
      }}
    />
  );
}

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

  const isValid = alias.length >= MIN_LENGTH && ALIAS_REGEX.test(alias);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop with animated gradient */}
      <motion.div
        className="absolute inset-0 bg-[#0a0a0f]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      />

      {/* Radial ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 30% 40%, rgba(34, 211, 238, 0.06) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 60%, rgba(168, 85, 247, 0.06) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 90%, rgba(59, 130, 246, 0.04) 0%, transparent 50%)
          `,
        }}
      />

      {/* Animated glow orbs */}
      <motion.div
        className="absolute w-80 h-80 bg-cyan-500/8 rounded-full blur-[100px]"
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -30, 20, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        style={{ top: '15%', left: '5%' }}
      />
      <motion.div
        className="absolute w-64 h-64 bg-purple-500/8 rounded-full blur-[80px]"
        animate={{
          x: [0, -30, 20, 0],
          y: [0, 20, -40, 0],
          scale: [1.1, 0.9, 1.1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        style={{ bottom: '10%', right: '5%' }}
      />
      <motion.div
        className="absolute w-48 h-48 bg-blue-500/5 rounded-full blur-[60px]"
        animate={{
          x: [0, 25, -15, 0],
          y: [0, -15, 30, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        style={{ top: '60%', left: '40%' }}
      />

      {/* Floating particles */}
      <FloatingParticle delay={0} x="15%" y="70%" size={4} />
      <FloatingParticle delay={0.8} x="25%" y="80%" size={3} />
      <FloatingParticle delay={1.5} x="60%" y="75%" size={5} />
      <FloatingParticle delay={2.2} x="75%" y="65%" size={3} />
      <FloatingParticle delay={3} x="40%" y="85%" size={4} />
      <FloatingParticle delay={1.2} x="85%" y="70%" size={3} />
      <FloatingParticle delay={2.8} x="50%" y="90%" size={4} />
      <FloatingParticle delay={0.5} x="10%" y="50%" size={3} />

      {/* Modal */}
      <motion.div
        className="relative w-full max-w-md bg-[#0d0d1a]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-[0_0_80px_rgba(34,211,238,0.06)]"
        initial={{ opacity: 0, scale: 0.85, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, type: 'spring', damping: 18, stiffness: 100 }}
      >
        {/* Top glow accent */}
        <motion.div
          className="absolute -top-px left-1/2 -translate-x-1/2 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: '60%', opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        />

        {/* Decorative glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Icon & Title */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <motion.div
            className="text-6xl mb-5 inline-block"
            animate={{
              scale: [1, 1.08, 1],
              rotate: [0, -3, 3, 0],
            }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          >
            🎭
          </motion.div>

          <motion.h1
            className="text-3xl md:text-4xl font-black text-white mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Welcome to{' '}
            <motion.span
              className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ['0%', '100%', '0%'],
              }}
              style={{ backgroundSize: '200% 200%' }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
            >
              Prisdil+
            </motion.span>
          </motion.h1>

          <motion.p
            className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Choose your identity — this will represent you on the leaderboard forever
          </motion.p>
        </motion.div>

        {/* Input */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <label className="text-xs text-cyan-400/80 uppercase tracking-widest font-semibold mb-2 block">
            Your Alias
          </label>

          <div className="relative group">
            {/* Input glow on focus */}
            <motion.div
              className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-cyan-500/0 via-cyan-500/0 to-purple-500/0 pointer-events-none"
              animate={isValid ? {
                background: ['linear-gradient(90deg, rgba(34,211,238,0.2), rgba(168,85,247,0.2))', 'linear-gradient(90deg, rgba(168,85,247,0.2), rgba(34,211,238,0.2))'],
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <input
              type="text"
              value={alias}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. StrategicFox"
              maxLength={MAX_LENGTH}
              className={`relative w-full bg-white/5 border rounded-xl px-4 py-4 text-white text-base font-medium
                focus:outline-none transition-all duration-300 placeholder-gray-600
                ${error
                  ? 'border-red-500/50 focus:border-red-500/60 focus:shadow-[0_0_20px_rgba(239,68,68,0.1)]'
                  : isValid
                    ? 'border-cyan-500/30 focus:border-cyan-500/50 focus:shadow-[0_0_30px_rgba(34,211,238,0.1)]'
                    : 'border-white/10 focus:border-white/20'
                }`}
              autoFocus
            />

            {/* Character counter */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <motion.span
                className={`text-xs font-mono transition-colors duration-200 ${
                  isValid ? 'text-cyan-500/80' : 'text-gray-600'
                }`}
                animate={isValid ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {alias.length}/{MAX_LENGTH}
              </motion.span>
            </div>
          </div>

          {/* Validation hints */}
          <div className="mt-3 flex flex-col gap-1">
            {error ? (
              <motion.p
                className="text-red-400 text-xs flex items-center gap-1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <span>✗</span> {error}
              </motion.p>
            ) : alias.length > 0 ? (
              <div className="flex flex-col gap-1">
                <motion.span
                  className={`text-xs flex items-center gap-1.5 transition-colors duration-200 ${
                    alias.length >= MIN_LENGTH ? 'text-emerald-400' : 'text-gray-500'
                  }`}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 }}
                >
                  <motion.span
                    animate={alias.length >= MIN_LENGTH ? { scale: [0, 1.2, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {alias.length >= MIN_LENGTH ? '✓' : '○'}
                  </motion.span>
                  At least {MIN_LENGTH} characters
                </motion.span>
                <motion.span
                  className={`text-xs flex items-center gap-1.5 transition-colors duration-200 ${
                    ALIAS_REGEX.test(alias) ? 'text-emerald-400' : 'text-gray-500'
                  }`}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <motion.span
                    animate={ALIAS_REGEX.test(alias) ? { scale: [0, 1.2, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {ALIAS_REGEX.test(alias) ? '✓' : '○'}
                  </motion.span>
                  Letters, numbers, underscores only
                </motion.span>
              </div>
            ) : (
              <motion.span
                className="text-gray-600 text-xs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Letters, numbers, and underscores. No spaces.
              </motion.span>
            )}
          </div>
        </motion.div>

        {/* Confirm Button */}
        <motion.button
          onClick={handleConfirm}
          disabled={!isValid}
          className={`relative w-full py-4 rounded-xl font-bold text-base tracking-wide transition-all duration-300 overflow-hidden
            ${isValid
              ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-[0_0_30px_rgba(34,211,238,0.15)] hover:shadow-[0_0_40px_rgba(34,211,238,0.25)] cursor-pointer'
              : 'bg-white/5 text-gray-600 cursor-not-allowed'
            }`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          whileHover={isValid ? { scale: 1.02, y: -1 } : {}}
          whileTap={isValid ? { scale: 0.98 } : {}}
        >
          {/* Shimmer effect on valid */}
          {isValid && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            />
          )}
          <span className="relative z-10">✨ Confirm Identity</span>
        </motion.button>

        {/* Footer note */}
        <motion.p
          className="text-center text-gray-600 text-xs mt-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          You can change this later in your profile settings
        </motion.p>

        {/* Bottom glow accent */}
        <motion.div
          className="absolute -bottom-px left-1/2 -translate-x-1/2 h-[1px] bg-gradient-to-r from-transparent via-purple-400/30 to-transparent"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: '40%', opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        />
      </motion.div>
    </div>
  );
}
