'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface AdminLoginProps {
  onLogin: () => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'prisdilplus_admin_2025';

    if (password === correctPassword) {
      onLogin();
    } else {
      setError('Incorrect password');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Radial gradient overlays matching main app */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 20% 50%, rgba(34, 211, 238, 0.05) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, rgba(168, 85, 247, 0.05) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 80%, rgba(59, 130, 246, 0.03) 0%, transparent 50%)
          `
        }}
      />
      {/* Animated glow orbs */}
      <motion.div
        className="absolute w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ top: '20%', left: '10%' }}
      />
      <motion.div
        className="absolute w-60 h-60 bg-purple-500/5 rounded-full blur-3xl"
        animate={{ x: [0, -20, 0], y: [0, 30, 0], scale: [1.1, 1, 1.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        style={{ bottom: '20%', right: '10%' }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring', damping: 20 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <motion.div
              className="text-6xl mb-4"
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🔐
            </motion.div>
            <h1 className="text-2xl font-bold text-white mb-2">Admin Access</h1>
            <p className="text-gray-400 text-sm">Enter password to access the research dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                autoFocus
              />
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-sm mt-2"
                >
                  {error}
                </motion.p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              Enter Dashboard
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}