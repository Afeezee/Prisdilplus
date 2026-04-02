'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, Legend,
} from 'recharts';
import {
  getMetricsDistribution,
  getCorrelationMatrix,
  getProfileBreakdown,
  getAIStrategyImpact,
  METRIC_KEYS,
  METRIC_LABELS,
} from '@/lib/adminDataUtils';

const HIST_COLORS = ['#22d3ee', '#a855f7', '#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#ec4899', '#6366f1'];

function getCorrelationColor(val: number): string {
  if (val > 0.6) return '#166534';
  if (val > 0.3) return '#22c55e';
  if (val > 0.1) return '#86efac';
  if (val > -0.1) return '#6b7280';
  if (val > -0.3) return '#fca5a5';
  if (val > -0.6) return '#ef4444';
  return '#991b1b';
}

export default function BehaviouralInsightsTab() {
  const [distributions, setDistributions] = useState<any>({});
  const [correlation, setCorrelation] = useState<any>({ keys: [], matrix: [] });
  const [profileBreakdown, setProfileBreakdown] = useState<any[]>([]);
  const [aiImpact, setAIImpact] = useState<any[]>([]);

  useEffect(() => {
    setDistributions(getMetricsDistribution());
    setCorrelation(getCorrelationMatrix());
    setProfileBreakdown(getProfileBreakdown());
    setAIImpact(getAIStrategyImpact());
  }, []);

  const hasData = profileBreakdown.length > 0;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Behavioural Insights</h1>
        <p className="text-gray-400">Aggregated behavioural research metrics across all human players</p>
      </div>

      {!hasData ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🧠</div>
          <div className="text-gray-400 text-lg">No player data yet</div>
          <p className="text-gray-500 text-sm mt-1">Play some games to generate behavioural insights</p>
        </div>
      ) : (
        <>
          {/* 1. Metrics Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-2">Metrics Distribution</h3>
            <p className="text-gray-500 text-xs mb-4">Value distribution of each behavioural metric across all players</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {METRIC_KEYS.map((key: string, idx: number) => (
                <div key={key} className="bg-white/5 rounded-xl p-3">
                  <h4 className="text-xs font-semibold text-gray-300 mb-2 truncate">{METRIC_LABELS[key]}</h4>
                  {distributions[key] && distributions[key].length > 0 ? (
                    <ResponsiveContainer width="100%" height={100}>
                      <BarChart data={distributions[key]}>
                        <XAxis dataKey="bin" tick={{ fontSize: 8, fill: '#6b7280' }} interval={0} />
                        <YAxis hide />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '11px' }}
                          formatter={(value: number) => [value, 'Players']}
                        />
                        <Bar dataKey="count" radius={[2, 2, 0, 0]} fill={HIST_COLORS[idx % HIST_COLORS.length]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[100px] flex items-center justify-center text-gray-600 text-xs">No data</div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* 2. Correlation Matrix */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-2">Correlation Matrix</h3>
            <p className="text-gray-500 text-xs mb-4">Pairwise Pearson correlation between behavioural metrics</p>
            {correlation.matrix.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="p-1 text-[8px] text-gray-500"></th>
                      {METRIC_KEYS.map((k: string) => (
                        <th key={k} className="p-1 text-[8px] text-gray-400 font-medium" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', maxWidth: '30px' }}>
                          {METRIC_LABELS[k]?.slice(0, 6)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {correlation.matrix.map((row: number[], i: number) => (
                      <tr key={i}>
                        <td className="p-1 text-[8px] text-gray-400 font-medium whitespace-nowrap pr-2">
                          {METRIC_LABELS[METRIC_KEYS[i]]?.slice(0, 10)}
                        </td>
                        {row.map((val: number, j: number) => (
                          <td
                            key={j}
                            className="p-1 text-center"
                            style={{ backgroundColor: getCorrelationColor(val), minWidth: '28px' }}
                          >
                            <span className="text-[9px] text-white font-mono">{val.toFixed(1)}</span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex items-center justify-center gap-4 mt-4 text-[10px]">
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded" style={{ backgroundColor: '#166534' }} /> Strong +</div>
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded" style={{ backgroundColor: '#6b7280' }} /> Neutral</div>
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded" style={{ backgroundColor: '#991b1b' }} /> Strong −</div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500 text-sm">Need at least 2 players for correlation analysis</div>
            )}
          </motion.div>

          {/* 3. Profile Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-2">Profile Breakdown</h3>
            <p className="text-gray-500 text-xs mb-4">Average metrics by behavioural profile classification</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-3 py-2 text-left text-gray-400 font-semibold">Profile</th>
                    <th className="px-3 py-2 text-center text-gray-400 font-semibold">Count</th>
                    {METRIC_KEYS.slice(0, 6).map((k: string) => (
                      <th key={k} className="px-2 py-2 text-center text-gray-400 font-semibold whitespace-nowrap">
                        {METRIC_LABELS[k]?.replace(' Score', '').replace(' Rate', '').replace(' Index', '').slice(0, 8)}
                      </th>
                    ))}
                    <th className="px-3 py-2 text-left text-gray-400 font-semibold">Top Badges</th>
                  </tr>
                </thead>
                <tbody>
                  {profileBreakdown.map((p: any) => (
                    <tr key={p.profile} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-3 py-2 text-cyan-400 font-medium">{p.profile}</td>
                      <td className="px-3 py-2 text-center text-white font-bold">{p.count}</td>
                      {METRIC_KEYS.slice(0, 6).map((k: string) => (
                        <td key={k} className="px-2 py-2 text-center text-gray-300">
                          {Math.round((p.avgMetrics[k] || 0) * 100)}%
                        </td>
                      ))}
                      <td className="px-3 py-2 text-gray-400 text-[10px]">
                        {p.topBadges.length > 0 ? p.topBadges.join(', ') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* 4. AI Strategy Impact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-2">AI Strategy Impact Analysis</h3>
            <p className="text-gray-500 text-xs mb-4">Average human cooperation rate when facing each AI strategy (PvAI only)</p>
            {aiImpact.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={aiImpact}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="strategy" stroke="#6b7280" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" height={50} />
                  <YAxis domain={[0, 1]} stroke="#6b7280" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    formatter={(value: number, name: string) => [`${Math.round(value * 100)}%`, name]}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="avgCooperationRate" name="Avg Cooperation" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="avgDefectionRate" name="Avg Defection" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="py-12 text-center text-gray-500">No PvAI sessions yet</div>
            )}
            {aiImpact.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-3 justify-center">
                {aiImpact.map((a: any) => (
                  <div key={a.strategy} className="text-center bg-white/5 rounded-lg px-3 py-2">
                    <div className="text-[10px] text-gray-400 font-mono">{a.strategy}</div>
                    <div className="text-white text-xs font-bold">{Math.round(a.avgCooperationRate * 100)}% coop</div>
                    <div className="text-gray-500 text-[10px]">n={a.sampleSize}</div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}
