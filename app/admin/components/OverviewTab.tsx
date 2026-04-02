'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { getOverviewMetrics, getProfileDistribution, getCooperationOverTime } from '@/lib/adminDataUtils';

const PROFILE_COLORS = [
  '#22d3ee', '#a855f7', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#ec4899',
];

export default function OverviewTab() {
  const [metrics, setMetrics] = useState<any>(null);
  const [profileData, setProfileData] = useState<any[]>([]);
  const [coopData, setCoopData] = useState<any[]>([]);

  useEffect(() => {
    setMetrics(getOverviewMetrics());
    setProfileData(getProfileDistribution());
    setCoopData(getCooperationOverTime());
  }, []);

  if (!metrics) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400 text-lg">Loading overview data...</div>
      </div>
    );
  }

  const metricCards = [
    { label: 'Total Unique Players', value: metrics.totalPlayers, icon: '👥', color: 'from-blue-500 to-cyan-500' },
    { label: 'Total Games Played', value: metrics.totalGames, icon: '🎮', color: 'from-purple-500 to-pink-500' },
    { label: 'Total Rounds Played', value: metrics.totalRounds, icon: '🔄', color: 'from-green-500 to-emerald-500' },
    { label: 'Avg Cooperation Rate', value: `${Math.round(metrics.avgCooperationRate * 100)}%`, icon: '🤝', color: 'from-yellow-500 to-orange-500' },
    { label: 'Avg Defection Rate', value: `${Math.round(metrics.avgDefectionRate * 100)}%`, icon: '⚔️', color: 'from-red-500 to-rose-500' },
    { label: 'Most Common Profile', value: metrics.mostCommonProfile, icon: '🧠', color: 'from-indigo-500 to-purple-500' },
    { label: 'Most Played Mode', value: metrics.mostPlayedMode, icon: '🎯', color: 'from-teal-500 to-cyan-500' },
    { label: 'Most Used AI Strategy', value: metrics.mostUsedStrategy, icon: '🤖', color: 'from-gray-500 to-slate-500' },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Research Overview</h1>
        <p className="text-gray-400">Key metrics and insights from Prisdil+ gameplay data</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{card.icon}</span>
              <div className={`h-2 w-2 rounded-full bg-gradient-to-r ${card.color}`} />
            </div>
            <div className="text-xl font-bold text-white mb-1 truncate">{card.value}</div>
            <div className="text-gray-400 text-xs">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Behavioural Profile Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Behavioural Profile Distribution</h3>
          {profileData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={profileData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                  stroke="none"
                >
                  {profileData.map((_, idx) => (
                    <Cell key={idx} fill={PROFILE_COLORS[idx % PROFILE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }}
                  formatter={(value) => <span style={{ color: '#9ca3af' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-gray-500">No data yet</div>
          )}
        </motion.div>

        {/* Cooperation vs Defection Over Time */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Cooperation Rate Over Time</h3>
          {coopData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={coopData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 1]} stroke="#6b7280" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                />
                <Line
                  type="monotone"
                  dataKey="cooperationRate"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  dot={{ fill: '#22d3ee', r: 4 }}
                  name="Cooperation Rate"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-gray-500">No data yet</div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
