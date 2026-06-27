'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRoomStore } from '@/stores/roomStore';
import { computeMetrics, classifyProfile } from '@/lib/behaviourEngine';
import { Move, BehaviourMetrics, BehaviourProfile } from '@/lib/types';
import RadarChart from './RadarChart';

interface MultiplayerResultsProps {
  onPlayAgain: () => void;
}

const RANK_EMOJI = ['🥇', '🥈', '🥉', '🎯', '🎯', '🎯', '🎯', '🎯'];

interface ResultPlayer {
  id: string;
  alias: string;
  deviceId: string;
  isHost: boolean;
  totalScore: number;
  moves: string[];
  scores: number[];
}

interface PlayerInsight extends ResultPlayer {
  metrics: BehaviourMetrics;
  profile: BehaviourProfile;
}

// In an N-player game, treat the "opponent" each round as the group: a
// betrayal is registered if ANY other player defected that round. This reduces
// to the opponent's exact move in a 2-player game.
function buildGroupOpponentMoves(players: ResultPlayer[], targetIdx: number, numRounds: number): Move[] {
  const opp: Move[] = [];
  for (let r = 0; r < numRounds; r++) {
    let anyDefect = false;
    players.forEach((p, idx) => {
      if (idx !== targetIdx && p.moves[r] === 'D') anyDefect = true;
    });
    opp.push(anyDefect ? 'D' : 'C');
  }
  return opp;
}

export default function MultiplayerResults({ onPlayAgain }: MultiplayerResultsProps) {
  const { players, myPlayerId, totalRounds, roomCode, roomId, reset } = useRoomStore();

  const [insights, setInsights] = useState<PlayerInsight[] | null>(null);

  // Fetch full move history once and compute behavioural insights per player.
  useEffect(() => {
    if (!roomId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/room/results?roomId=${roomId}`);
        if (!res.ok) return;
        const data = await res.json();
        const resultPlayers: ResultPlayer[] = data.players ?? [];
        const numRounds: number = data.totalRounds ?? totalRounds;

        const computed: PlayerInsight[] = resultPlayers.map((p, idx) => {
          const moves = p.moves as Move[];
          const opponentMoves = buildGroupOpponentMoves(resultPlayers, idx, numRounds);
          const metrics = computeMetrics(moves, opponentMoves, [], 'player');
          const profile = classifyProfile(metrics);
          return { ...p, metrics, profile };
        });

        if (!cancelled) setInsights(computed);
      } catch {
        // Insights are best-effort; standings still render without them.
      }
    })();
    return () => { cancelled = true; };
  }, [roomId, totalRounds]);

  const sorted = [...players].sort((a, b) => b.totalScore - a.totalScore);
  const winner = sorted[0];
  const me = players.find(p => p.id === myPlayerId);
  const myRank = sorted.findIndex(p => p.id === myPlayerId) + 1;
  const iWon = me?.id === winner?.id;

  const myInsight = insights?.find(p => p.id === myPlayerId) ?? null;

  const radarData = myInsight ? [
    { label: 'Trust', value: myInsight.metrics.cooperationRate },
    { label: 'Retaliation', value: myInsight.metrics.retaliationScore },
    { label: 'Forgiveness', value: myInsight.metrics.forgivenessScore },
    { label: 'Strategy', value: myInsight.metrics.consistencyScore },
    { label: 'Compete', value: myInsight.metrics.defectionRate },
    { label: 'Niceness', value: myInsight.metrics.nicenessScore },
  ] : [];

  const handlePlayAgain = () => {
    reset();
    onPlayAgain();
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
      <div className="w-full max-w-md space-y-6">

        {/* Trophy / Result Header */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="text-7xl mb-3"
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            {iWon ? '🏆' : myRank === 2 ? '🥈' : '🎮'}
          </motion.div>
          <h2 className="text-4xl font-black text-white">
            {iWon ? 'You Won!' : `${winner?.alias} Wins!`}
          </h2>
          {!iWon && (
            <p className="text-gray-400 text-sm mt-1">You finished #{myRank}</p>
          )}
          <p className="text-gray-500 text-xs mt-2">Room Code: <span className="text-gray-400 font-mono font-bold">{roomCode}</span> · {totalRounds} rounds</p>
        </motion.div>

        {/* Final Leaderboard */}
        <motion.div
          className="bg-white/5 border border-white/10 rounded-2xl p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">Final Standings</p>
          <div className="space-y-3">
            {sorted.map((p, idx) => {
              const isMe = p.id === myPlayerId;
              const isWinner = idx === 0;
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className={`flex items-center gap-3 py-3 px-4 rounded-xl ${
                    isWinner
                      ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20'
                      : isMe
                      ? 'bg-cyan-500/10 border border-cyan-500/20'
                      : 'bg-white/5'
                  }`}
                >
                  <span className="text-xl">{RANK_EMOJI[idx]}</span>
                  <div className="flex-1">
                    <p className={`font-bold text-sm ${isMe ? 'text-cyan-400' : isWinner ? 'text-yellow-400' : 'text-white'}`}>
                      {p.alias} {isMe && <span className="text-xs opacity-60">(You)</span>}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-black tabular-nums">{p.totalScore}</p>
                    <p className="text-gray-500 text-xs">pts</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Stat: my total + rank */}
        {me && (
          <motion.div
            className="grid grid-cols-2 gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <p className="text-2xl font-black text-white">{me.totalScore}</p>
              <p className="text-xs text-gray-500 mt-1">Total Points</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <p className="text-2xl font-black text-cyan-400">#{myRank}</p>
              <p className="text-xs text-gray-500 mt-1">Final Rank</p>
            </div>
          </motion.div>
        )}

        {/* Behavioural Insights — my profile (like single player) */}
        {myInsight && (
          <motion.div
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-4 text-center">Your Behavioural Insights</p>
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">{myInsight.profile.emoji}</div>
              <h2 className="text-white font-bold text-xl">{myInsight.profile.title}</h2>
            </div>
            <p className="text-gray-400 text-sm text-center leading-relaxed">
              {myInsight.profile.description}
            </p>

            {/* Metric bars */}
            <div className="mt-6 space-y-3">
              <MetricBar label="Cooperation" value={myInsight.metrics.cooperationRate} color="emerald" />
              <MetricBar label="Retaliation" value={myInsight.metrics.retaliationScore} color="red" />
              <MetricBar label="Forgiveness" value={myInsight.metrics.forgivenessScore} color="blue" />
              <MetricBar label="Niceness" value={myInsight.metrics.nicenessScore} color="amber" />
              <MetricBar label="Consistency" value={myInsight.metrics.consistencyScore} color="purple" />
              <MetricBar label="Opportunism" value={myInsight.metrics.strategicOpportunismScore} color="orange" />
            </div>

            {/* Radar */}
            <div className="mt-6 flex flex-col items-center">
              <RadarChart data={radarData} size={260} color="#22d3ee" />
            </div>
          </motion.div>
        )}

        {/* Behavioural Insights — everyone else's profile */}
        {insights && insights.length > 1 && (
          <motion.div
            className="bg-white/5 border border-white/10 rounded-2xl p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">Player Profiles</p>
            <div className="space-y-2">
              {insights.map((p) => {
                const isMe = p.id === myPlayerId;
                return (
                  <div
                    key={p.id}
                    className={`flex items-center gap-3 py-2 px-3 rounded-xl ${isMe ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-white/5'}`}
                  >
                    <span className="text-2xl">{p.profile.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${isMe ? 'text-cyan-400' : 'text-white'}`}>
                        {p.alias} {isMe && <span className="text-xs opacity-60">(You)</span>}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{p.profile.title}</p>
                    </div>
                    <span className="text-xs text-gray-500 tabular-nums">
                      {Math.round(p.metrics.cooperationRate * 100)}% coop
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <button
            onClick={handlePlayAgain}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600
              text-white font-bold text-lg hover:from-cyan-400 hover:to-purple-500
              shadow-[0_0_30px_rgba(34,211,238,0.2)] transition-all duration-300"
          >
            🎮 Play Again
          </button>
        </motion.div>
      </div>
    </div>
  );
}

// Helper component for metric bars (mirrors single-player results)
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
