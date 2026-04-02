'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line,
} from 'recharts';
import {
  getMoveFrequencies,
  getRoundPositionAnalysis,
  getFirstMoveAnalysis,
  getRetaliationLatency,
} from '@/lib/adminDataUtils';

const OUTCOME_COLORS = { CC: '#10b981', CD: '#f59e0b', DC: '#ef4444', DD: '#6b7280' };
const PIE_COLORS = ['#10b981', '#ef4444'];
const BAR_COLORS = ['#22d3ee', '#a855f7', '#f59e0b', '#ef4444'];

export default function RoundAnalysisTab() {
  const [moveFreq, setMoveFreq] = useState([]);
  const [roundPosition, setRoundPosition] = useState([]);
  const [firstMove, setFirstMove] = useState([]);
  const [retLatency, setRetLatency] = useState([]);

  useEffect(() => {
    setMoveFreq(getMoveFrequencies());
    setRoundPosition(getRoundPositionAnalysis());
    setFirstMove(getFirstMoveAnalysis());
    setRetLatency(getRetaliationLatency());
  }, []);

  const hasData = moveFreq.some((m) => m.count > 0);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Round Analysis</h1>
        <p className="text-gray-400">Aggregate analysis across all rounds from all sessions</p>
      </div>

      {!hasData ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📊</div>
          <div className="text-gray-400 text-lg">No round data yet</div>
          <p className="text-gray-500 text-sm mt-1">Play some games to see analysis here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. Move Frequency */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-2">Move Outcome Frequencies</h3>
            <p className="text-gray-500 text-xs mb-4">CC/CD/DC/DD outcome distribution across all rounds</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={moveFreq}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 11 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  formatter={(value, name) => {
                    if (name === 'count') return [value, 'Count'];
                    return [`${value}%`, 'Percentage'];
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {moveFreq.map((entry, idx) => (
                    <Cell key={idx} fill={OUTCOME_COLORS[entry.name] || '#6b7280'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-3">
              {moveFreq.map((m) => (
                <div key={m.name} className="text-center">
                  <div className="text-white font-bold text-sm">{m.count}</div>
                  <div className="text-gray-500 text-[10px]">{m.name} ({m.percentage}%)</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* 2. Round Position Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-2">Cooperation by Round Position</h3>
            <p className="text-gray-500 text-xs mb-4">Average cooperation rate at each round number across all sessions</p>
            {roundPosition.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={roundPosition}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="round" stroke="#6b7280" tick={{ fontSize: 10 }} label={{ value: 'Round', position: 'insideBottom', offset: -2, fill: '#6b7280', fontSize: 10 }} />
                  <YAxis domain={[0, 1]} stroke="#6b7280" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    formatter={(value) => [`${Math.round(value * 100)}%`, 'Coop Rate']}
                  />
                  <Line type="monotone" dataKey="cooperationRate" stroke="#22d3ee" strokeWidth={2} dot={{ fill: '#22d3ee', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-gray-500">No data</div>
            )}
          </motion.div>

          {/* 3. First Move Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-2">First Move Analysis</h3>
            <p className="text-gray-500 text-xs mb-4">What do players choose on round 1?</p>
            {firstMove.some((f) => f.value > 0) ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={firstMove}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {firstMove.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} formatter={(value) => <span style={{ color: '#9ca3af' }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[240px] flex items-center justify-center text-gray-500">No data</div>
            )}
            <div className="flex justify-center gap-6 mt-2">
              {firstMove.map((f) => (
                <div key={f.name} className="text-center">
                  <div className={`text-lg font-bold ${f.name === 'Cooperate' ? 'text-emerald-400' : 'text-red-400'}`}>{f.value}</div>
                  <div className="text-gray-500 text-xs">{f.name}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* 4. Retaliation Latency */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-2">Retaliation Latency</h3>
            <p className="text-gray-500 text-xs mb-4">After being defected against, how quickly do players retaliate?</p>
            {retLatency.some((r) => r.value > 0) ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={retLatency}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Frequency">
                    {retLatency.map((_, idx) => (
                      <Cell key={idx} fill={BAR_COLORS[idx % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[240px] flex items-center justify-center text-gray-500">No data</div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
