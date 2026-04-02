'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useLeaderboardStore } from '@/stores/leaderboardStore';
import { useIdentityStore } from '@/stores/identityStore';
import { computeDetailedStats } from '@/lib/behaviourEngine';
import RadarChart from './RadarChart';
import RoundTimeline from './RoundTimeline';
import Confetti from './Confetti';

interface ResultsDashboardProps {
  onShowLeaderboard: () => void;
}

export default function ResultsDashboard({ onShowLeaderboard }: ResultsDashboardProps) {
  const {
    player1Alias,
    player2Alias,
    player1Score,
    player2Score,
    player1Metrics,
    player2Metrics,
    player1Profile,
    player2Profile,
    winner,
    rounds,
    mode,
    strategy,
    totalRounds: configuredRounds,
    resetGame,
  } = useGameStore();

  const { updatePlayerAfterGame, loadFromStorage } = useLeaderboardStore();
  const { identity } = useIdentityStore();
  const [showConfetti, setShowConfetti] = useState(false);
  const [saved, setSaved] = useState(false);

  // Use persistent identity alias for player 1 (always human)
  const resolvedP1Alias = identity?.alias || player1Alias;

  // Load leaderboard data and save results
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (saved || !rounds.length) return;
    setSaved(true);

    // Trigger confetti
    if (winner !== 'tie') {
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(t);
    }
  }, [saved, rounds.length, winner]);

  // Save human player stats
  useEffect(() => {
    if (!saved || !rounds.length) return;

    const p1Moves = rounds.map((r) => r.playerMove);
    const p2Moves = rounds.map((r) => r.opponentMove);

    const p1Stats = computeDetailedStats(p1Moves, p2Moves);
    const p2Stats = computeDetailedStats(p2Moves, p1Moves);

    // Always update player 1 (always human) — use persistent identity alias
    updatePlayerAfterGame(resolvedP1Alias, {
      points: player1Score,
      won: winner === 'player1',
      lost: winner === 'player2',
      draw: winner === 'tie',
      ...p1Stats,
      roundsPlayed: rounds.length,
    });

    // Only update player 2 if PvP (human)
    if (mode === 'pvp') {
      updatePlayerAfterGame(player2Alias, {
        points: player2Score,
        won: winner === 'player2',
        lost: winner === 'player1',
        draw: winner === 'tie',
        ...p2Stats,
        roundsPlayed: rounds.length,
      });
    }

    // Save game session data for admin dashboard
    saveGameSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saved]);

  // Save game session to localStorage
  const saveGameSession = () => {
    if (typeof window === 'undefined') return;

    try {
      const sessionData = {
        sessionId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        gameMode: mode === 'pvp' ? 'PvP' : 'PvAI',
        playerAlias: resolvedP1Alias,
        opponentAlias: player2Alias,
        opponentType: mode === 'pvp' ? 'human' : 'ai',
        aiStrategy: mode === 'pvc' ? strategy : null,
        totalRounds: rounds.length,
        playerTotalScore: player1Score,
        opponentTotalScore: player2Score,
        winner: winner === 'player1' ? resolvedP1Alias : winner === 'player2' ? player2Alias : 'tie',
        playerBehaviouralProfile: player1Profile.title,
        playerMetrics: player1Metrics,
        roundHistory: rounds,
      };

      const existingSessions = localStorage.getItem('prisdilplus_game_sessions');
      const sessions = existingSessions ? JSON.parse(existingSessions) : [];
      sessions.push(sessionData);
      localStorage.setItem('prisdilplus_game_sessions', JSON.stringify(sessions));
    } catch (error) {
      console.warn('Prisdil+: Could not save game session data', error);
    }
  };

  if (!player1Metrics || !player2Metrics || !player1Profile || !player2Profile) {
    return null;
  }

  const winnerAlias =
    winner === 'player1' ? player1Alias : winner === 'player2' ? player2Alias : null;
  const winnerProfile = winner === 'player1' ? player1Profile : player2Profile;

  const radarData = [
    { label: 'Trust', value: player1Metrics.cooperationRate },
    { label: 'Retaliation', value: player1Metrics.retaliationScore },
    { label: 'Forgiveness', value: player1Metrics.forgivenessScore },
    { label: 'Strategy', value: player1Metrics.consistencyScore },
    { label: 'Compete', value: player1Metrics.defectionRate },
    { label: 'Niceness', value: player1Metrics.nicenessScore },
  ];

  return (
    <div className="relative z-10 min-h-screen px-4 py-8 md:py-12">
      <Confetti active={showConfetti} />

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Winner Section */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: 'spring' }}
        >
          {winner !== 'tie' ? (
            <>
              <motion.div
                className="text-6xl md:text-7xl mb-4"
                animate={{ rotate: [0, -10, 10, -5, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 1, delay: 0.3 }}
              >
                🏆
              </motion.div>
              <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
                {winnerAlias} Wins!
              </h1>
              <p className="text-gray-400 text-lg">
                {player1Score} — {player2Score}
              </p>
            </>
          ) : (
            <>
              <motion.div
                className="text-6xl md:text-7xl mb-4"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                🤝
              </motion.div>
              <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
                It&apos;s a Tie!
              </h1>
              <p className="text-gray-400 text-lg">
                {player1Score} — {player2Score}
              </p>
            </>
          )}
        </motion.div>

        {/* Behavioural Profile Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Player 1 Profile */}
          <motion.div
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="text-center mb-4">
              <div className="text-3xl mb-2">{player1Profile.emoji}</div>
              <h3 className="text-cyan-400 text-xs uppercase tracking-wider font-semibold mb-1">
                {player1Alias}
              </h3>
              <h2 className="text-white font-bold text-xl">
                {player1Profile.title}
              </h2>
            </div>
            <p className="text-gray-400 text-sm text-center leading-relaxed">
              {player1Profile.description}
            </p>

            {/* Metrics bars */}
            <div className="mt-6 space-y-3">
              <MetricBar label="Cooperation" value={player1Metrics.cooperationRate} color="emerald" />
              <MetricBar label="Retaliation" value={player1Metrics.retaliationScore} color="red" />
              <MetricBar label="Forgiveness" value={player1Metrics.forgivenessScore} color="blue" />
              <MetricBar label="Niceness" value={player1Metrics.nicenessScore} color="amber" />
              <MetricBar label="Consistency" value={player1Metrics.consistencyScore} color="purple" />
              <MetricBar label="Opportunism" value={player1Metrics.strategicOpportunismScore} color="orange" />
            </div>
          </motion.div>

          {/* Player 2 Profile */}
          <motion.div
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <div className="text-center mb-4">
              <div className="text-3xl mb-2">{player2Profile.emoji}</div>
              <h3 className="text-purple-400 text-xs uppercase tracking-wider font-semibold mb-1">
                {player2Alias}
              </h3>
              <h2 className="text-white font-bold text-xl">
                {player2Profile.title}
              </h2>
            </div>
            <p className="text-gray-400 text-sm text-center leading-relaxed">
              {player2Profile.description}
            </p>

            {/* Metrics bars */}
            <div className="mt-6 space-y-3">
              <MetricBar label="Cooperation" value={player2Metrics.cooperationRate} color="emerald" />
              <MetricBar label="Retaliation" value={player2Metrics.retaliationScore} color="red" />
              <MetricBar label="Forgiveness" value={player2Metrics.forgivenessScore} color="blue" />
              <MetricBar label="Niceness" value={player2Metrics.nicenessScore} color="amber" />
              <MetricBar label="Consistency" value={player2Metrics.consistencyScore} color="purple" />
              <MetricBar label="Opportunism" value={player2Metrics.strategicOpportunismScore} color="orange" />
            </div>
          </motion.div>
        </div>

        {/* Radar Chart */}
        <motion.div
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col items-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <h3 className="text-white font-bold text-lg mb-4">
            {player1Alias}&apos;s Behavioural Radar
          </h3>
          <RadarChart data={radarData} size={280} color="#22d3ee" />
        </motion.div>

        {/* Round Replay */}
        <motion.div
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <RoundTimeline
            rounds={rounds}
            player1Alias={player1Alias}
            player2Alias={player2Alias}
          />
        </motion.div>

        {/* Actions */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <motion.button
            onClick={resetGame}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600
              text-white font-bold shadow-[0_0_20px_rgba(34,211,238,0.15)]
              hover:from-cyan-400 hover:to-purple-500 transition-all"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            🎮 Play Again
          </motion.button>

          <motion.button
            onClick={onShowLeaderboard}
            className="px-8 py-3 rounded-xl bg-white/5 border border-white/10
              text-gray-400 font-semibold hover:bg-white/10 transition-all"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            🏆 Leaderboard
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

// Helper component for metric bars
function MetricBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    cyan: 'bg-cyan-500',
  };

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-gray-500">{Math.round(value * 100)}%</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${colorMap[color] || 'bg-cyan-500'}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.round(value * 100)}%` }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
