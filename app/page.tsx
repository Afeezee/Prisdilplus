'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useIdentityStore } from '@/stores/identityStore';
import ParticleBackground from '@/components/ParticleBackground';
import LandingScreen from '@/components/LandingScreen';
import AliasInput from '@/components/AliasInput';
import GameBoard from '@/components/GameBoard';
import ResultsDashboard from '@/components/ResultsDashboard';
import LeaderboardScreen from '@/components/LeaderboardScreen';
import IdentityRegistration from '@/components/IdentityRegistration';
import ProfilePanel from '@/components/ProfilePanel';

export default function Home() {
  const { phase } = useGameStore();
  const { identity, loaded, loadIdentity } = useIdentityStore();
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Load identity on mount
  useEffect(() => {
    loadIdentity();
  }, [loadIdentity]);

  const handleShowLeaderboard = () => setShowLeaderboard(true);
  const handleHideLeaderboard = () => setShowLeaderboard(false);

  // Show nothing until identity check is complete
  if (!loaded) {
    return (
      <main className="relative min-h-screen flex items-center justify-center">
        <ParticleBackground />
        <motion.div
          className="text-gray-500 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Loading...
        </motion.div>
      </main>
    );
  }

  // Show registration if no identity
  const needsRegistration = !identity;

  return (
    <main className="relative min-h-screen overflow-hidden">
      <ParticleBackground />

      {/* Profile Panel (always available) */}
      <ProfilePanel />

      {/* Identity Registration Modal */}
      {needsRegistration && <IdentityRegistration />}

      {/* Main App (only when identity exists) */}
      {!needsRegistration && (
        <AnimatePresence mode="wait">
          {showLeaderboard ? (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <LeaderboardScreen onBack={handleHideLeaderboard} />
            </motion.div>
          ) : (
            <>
              {phase === 'landing' && (
                <motion.div
                  key="landing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <LandingScreen onShowLeaderboard={handleShowLeaderboard} />
                </motion.div>
              )}

              {phase === 'alias' && (
                <motion.div
                  key="alias"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <AliasInput />
                </motion.div>
              )}

              {phase === 'playing' && (
                <motion.div
                  key="playing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <GameBoard />
                </motion.div>
              )}

              {phase === 'results' && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.4 }}
                >
                  <ResultsDashboard onShowLeaderboard={handleShowLeaderboard} />
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      )}
    </main>
  );
}
