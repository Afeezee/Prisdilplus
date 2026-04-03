'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useIdentityStore } from '@/stores/identityStore';
import { useRoomStore } from '@/stores/roomStore';
import ParticleBackground from '@/components/ParticleBackground';
import LandingScreen from '@/components/LandingScreen';
import AliasInput from '@/components/AliasInput';
import GameBoard from '@/components/GameBoard';
import ResultsDashboard from '@/components/ResultsDashboard';
import LeaderboardScreen from '@/components/LeaderboardScreen';
import IdentityRegistration from '@/components/IdentityRegistration';
import ProfilePanel from '@/components/ProfilePanel';
import RoomLobby from '@/components/RoomLobby';
import MultiplayerGameBoard from '@/components/MultiplayerGameBoard';
import MultiplayerResults from '@/components/MultiplayerResults';

type AppScreen =
  | 'landing'
  | 'alias'
  | 'playing'
  | 'results'
  | 'room-lobby'
  | 'room-playing'
  | 'room-results'
  | 'leaderboard';

export default function Home() {
  const { phase, setPhase } = useGameStore();
  const { identity, loaded, loadIdentity } = useIdentityStore();
  const { roomStatus, setMyDeviceId, startPolling, poll, reset: resetRoom } = useRoomStore();
  const [screen, setScreen] = useState<AppScreen>('landing');

  useEffect(() => {
    loadIdentity();
  }, [loadIdentity]);

  useEffect(() => {
    if (identity?.deviceId) {
      setMyDeviceId(identity.deviceId);
    }
  }, [identity, setMyDeviceId]);

  // Sync single-player phase → screen
  useEffect(() => {
    if (['landing', 'alias', 'playing', 'results'].includes(screen)) {
      if (phase === 'landing') setScreen('landing');
      else if (phase === 'alias') setScreen('alias');
      else if (phase === 'playing') setScreen('playing');
      else if (phase === 'results') setScreen('results');
    }
  }, [phase, screen]);

  // Multiplayer: when room becomes 'playing', advance screen
  useEffect(() => {
    if (screen === 'room-lobby' && roomStatus === 'playing') {
      setScreen('room-playing');
    }
  }, [roomStatus, screen]);

  // Poll when in lobby
  useEffect(() => {
    if (screen === 'room-lobby') {
      startPolling();
      poll();
    }
  }, [screen, startPolling, poll]);

  const goToLanding = () => { setPhase('landing'); setScreen('landing'); };
  const handleEnterLobby = () => setScreen('room-lobby');
  const handleRoomGameEnd = () => setScreen('room-results');
  const handleBackFromLobby = () => { resetRoom(); goToLanding(); };
  const handleShowLeaderboard = () => setScreen('leaderboard');
  const handleHideLeaderboard = () => setScreen('landing');

  if (!loaded) {
    return (
      <main className="relative min-h-screen flex items-center justify-center">
        <ParticleBackground />
        <motion.div className="text-gray-500 text-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          Loading...
        </motion.div>
      </main>
    );
  }

  const needsRegistration = !identity;

  return (
    <main className="relative min-h-screen overflow-hidden">
      <ParticleBackground />
      <ProfilePanel />

      {needsRegistration && <IdentityRegistration />}

      {!needsRegistration && (
        <AnimatePresence mode="wait">

          {screen === 'landing' && (
            <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <LandingScreen onShowLeaderboard={handleShowLeaderboard} onEnterLobby={handleEnterLobby} />
            </motion.div>
          )}

          {screen === 'alias' && (
            <motion.div key="alias" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}>
              <AliasInput />
            </motion.div>
          )}

          {screen === 'playing' && (
            <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <GameBoard />
            </motion.div>
          )}

          {screen === 'results' && (
            <motion.div key="results" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.4 }}>
              <ResultsDashboard onShowLeaderboard={handleShowLeaderboard} />
            </motion.div>
          )}

          {screen === 'room-lobby' && (
            <motion.div key="room-lobby" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
              <RoomLobby onBack={handleBackFromLobby} />
            </motion.div>
          )}

          {screen === 'room-playing' && (
            <motion.div key="room-playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <MultiplayerGameBoard onGameEnd={handleRoomGameEnd} />
            </motion.div>
          )}

          {screen === 'room-results' && (
            <motion.div key="room-results" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.4 }}>
              <MultiplayerResults onPlayAgain={goToLanding} />
            </motion.div>
          )}

          {screen === 'leaderboard' && (
            <motion.div key="leaderboard" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
              <LeaderboardScreen onBack={handleHideLeaderboard} />
            </motion.div>
          )}

        </AnimatePresence>
      )}
    </main>
  );
}
