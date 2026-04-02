'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  RadarChart as RechartsRadar, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer, Tooltip,
} from 'recharts';
import { getPlayerSessions } from '@/lib/adminDataUtils';

interface PlayerModalProps {
  player: any;
  onClose: () => void;
}

export default function PlayerModal({ player, onClose }: PlayerModalProps) {
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    if (player) {
      setSessions(getPlayerSessions(player.alias));
    }
  }, [player]);

  if (!player) return null;

  const radarData = [
    { metric: 'Cooperation', value: player.cooperationRate || 0 },
    { metric: 'Retaliation', value: player.retaliationScore || 0 },
    { metric: 'Forgiveness', value: player.forgivenessScore || 0 },
    { metric: 'Consistency', value: player.consistencyScore || 0 },
    { metric: 'Opportunism', value: player.opportunismScore || 0 },
    { metric: 'Niceness', value: player.nicenessScore || 0 },
    { metric: 'Push-over', value: player.pushOverIndex || 0 },
    { metric: 'Defection', value: player.defectionRate || 0 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#12121f]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-3xl w-full max-h-[85vh] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">{player.alias}</h2>
            <p className="text-cyan-400 text-sm">{player.behaviouralProfile}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Games', value: player.gamesPlayed },
            { label: 'Points', value: player.totalPoints },
            { label: 'Win Rate', value: `${Math.round(player.winRate)}%` },
            { label: 'Wins/Losses', value: `${player.totalWins}/${player.totalLosses}` },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/5 rounded-xl p-3 text-center">
              <div className="text-white font-bold text-lg">{stat.value}</div>
              <div className="text-gray-400 text-xs">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Radar Chart */}
        <div className="bg-white/5 rounded-xl p-4 mb-6">
          <h3 className="text-white font-semibold text-sm mb-3">Behavioural Radar</h3>
          <ResponsiveContainer width="100%" height={260}>
            <RechartsRadar cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#9ca3af', fontSize: 10 }} />
              <PolarRadiusAxis domain={[0, 1]} tick={false} axisLine={false} />
              <Radar
                dataKey="value"
                stroke="#22d3ee"
                fill="#22d3ee"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                formatter={(value: number) => [Math.round(value * 100) + '%', 'Score']}
              />
            </RechartsRadar>
          </ResponsiveContainer>
        </div>

        {/* Detailed Metrics */}
        <div className="bg-white/5 rounded-xl p-4 mb-6">
          <h3 className="text-white font-semibold text-sm mb-3">Detailed Metrics</h3>
          <div className="grid grid-cols-2 gap-2">
            {radarData.map((d) => (
              <div key={d.metric} className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-lg">
                <span className="text-gray-400 text-xs">{d.metric}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 rounded-full"
                      style={{ width: `${Math.round(d.value * 100)}%` }}
                    />
                  </div>
                  <span className="text-white text-xs font-mono w-8 text-right">{Math.round(d.value * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Badges */}
        <div className="bg-white/5 rounded-xl p-4 mb-6">
          <h3 className="text-white font-semibold text-sm mb-3">Badges</h3>
          {player.badges && player.badges.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {player.badges.map((badge: string) => (
                <span key={badge} className="px-3 py-1 bg-white/10 border border-white/10 rounded-full text-xs text-white">
                  {badge}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No badges earned yet</p>
          )}
        </div>

        {/* Game History */}
        <div className="bg-white/5 rounded-xl p-4 mb-6">
          <h3 className="text-white font-semibold text-sm mb-3">Game History ({sessions.length} sessions)</h3>
          {sessions.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
              {sessions.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-lg text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400">{new Date(s.timestamp).toLocaleDateString()}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${s.gameMode === 'PvAI' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                      {s.gameMode}
                    </span>
                    <span className="text-gray-300">vs {s.opponentAlias}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-300">{s.playerTotalScore}-{s.opponentTotalScore}</span>
                    <span className={`font-medium ${s.winner === player.alias ? 'text-emerald-400' : s.winner === 'tie' ? 'text-yellow-400' : 'text-red-400'}`}>
                      {s.winner === player.alias ? 'W' : s.winner === 'tie' ? 'D' : 'L'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No session data available</p>
          )}
        </div>

        {/* Timestamps */}
        <div className="flex justify-between text-xs text-gray-500">
          <span>Member since: {player.createdAt ? new Date(player.createdAt).toLocaleDateString() : 'Unknown'}</span>
          <span>Device: {player.deviceId ? player.deviceId.slice(0, 8) + '...' : 'Unknown'}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
