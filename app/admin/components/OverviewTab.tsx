'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getOverviewMetrics } from '@/lib/adminDataUtils';

export default function OverviewTab() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = getOverviewMetrics();
    setMetrics(data);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white text-xl">Loading overview data...</div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg">No data available yet</div>
      </div>
    );
  }

  const metricCards = [
    {
      label: 'Total Unique Players',
      value: metrics.totalPlayers,
      icon: '👥',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Total Games Played',
      value: metrics.totalGames,
      icon: '🎮',
      color: 'from-purple-500 to-pink-500',
    },
    {
      label: 'Total Rounds Played',
      value: metrics.totalRounds,
      icon: '🔄',
      color: 'from-green-500 to-emerald-500',
    },
    {
      label: 'Avg Cooperation Rate',
      value: `${Math.round(metrics.avgCooperationRate * 100)}%`,
      icon: '🤝',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      label: 'Avg Defection Rate',
      value: `${Math.round(metrics.avgDefectionRate * 100)}%`,
      icon: '⚔️',
      color: 'from-red-500 to-rose-500',
    },
    {
      label: 'Most Common Profile',
      value: metrics.mostCommonProfile || 'None',
      icon: '🧠',
      color: 'from-indigo-500 to-purple-500',
    },
    {
      label: 'Most Played Mode',
      value: metrics.mostPlayedMode || 'None',
      icon: '🎯',
      color: 'from-teal-500 to-cyan-500',
    },
    {
      label: 'Most Used AI Strategy',
      value: metrics.mostUsedStrategy || 'None',
      icon: '🤖',
      color: 'from-gray-500 to-slate-500',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Research Overview</h1>
        <p className="text-gray-400">Key metrics and insights from Prisdil+ gameplay data</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-gradient-to-br ${card.color} p-6 rounded-2xl text-white`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">{card.icon}</div>
            </div>
            <div className="text-2xl font-bold mb-1">{card.value}</div>
            <div className="text-white/80 text-sm">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Behavioural Profile Distribution</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            Chart will be implemented with Recharts
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Cooperation vs Defection Over Time</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            Chart will be implemented with Recharts
          </div>
        </motion.div>
      </div>
    </div>
  );
}