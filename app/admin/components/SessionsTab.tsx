'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAllSessions } from '@/lib/adminDataUtils';

export default function SessionsTab() {
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [filters, setFilters] = useState({
    mode: 'all',
    aiStrategy: 'all',
    dateRange: 'all',
  });
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = getAllSessions();
    setSessions(data);
    setFilteredSessions(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    let filtered = sessions;

    // Filter by mode
    if (filters.mode !== 'all') {
      filtered = filtered.filter(s => s.gameMode === filters.mode);
    }

    // Filter by AI strategy
    if (filters.aiStrategy !== 'all') {
      filtered = filtered.filter(s => s.aiStrategy === filters.aiStrategy);
    }

    // Sort
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setFilteredSessions(filtered);
  }, [sessions, filters, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white text-xl">Loading sessions data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Game Sessions</h1>
        <p className="text-gray-400">Complete history of all gameplay sessions</p>
      </div>

      {/* Filters */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Game Mode</label>
            <select
              value={filters.mode}
              onChange={(e) => setFilters(prev => ({ ...prev, mode: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <option value="all">All Modes</option>
              <option value="PvP">PvP</option>
              <option value="PvAI">PvAI</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">AI Strategy</label>
            <select
              value={filters.aiStrategy}
              onChange={(e) => setFilters(prev => ({ ...prev, aiStrategy: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <option value="all">All Strategies</option>
              <option value="random">Random</option>
              <option value="tit_for_tat">Tit for Tat</option>
              <option value="always_defect">Always Defect</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
        <div className="mt-4 text-gray-400 text-sm">
          {filteredSessions.length} of {sessions.length} sessions
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/10">
              <tr>
                {[
                  { key: 'sessionId', label: 'Session ID' },
                  { key: 'timestamp', label: 'Date' },
                  { key: 'gameMode', label: 'Mode' },
                  { key: 'playerAlias', label: 'Player' },
                  { key: 'opponentAlias', label: 'Opponent' },
                  { key: 'totalRounds', label: 'Rounds' },
                  { key: 'playerTotalScore', label: 'Player Score' },
                  { key: 'opponentTotalScore', label: 'Opponent Score' },
                  { key: 'winner', label: 'Winner' },
                  { key: 'playerBehaviouralProfile', label: 'Profile' },
                ].map(({ key, label }) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key)}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                  >
                    <div className="flex items-center space-x-1">
                      <span>{label}</span>
                      <span>{getSortIcon(key)}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredSessions.map((session, index) => (
                <motion.tr
                  key={session.sessionId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => setSelectedSession(session)}
                  className="hover:bg-white/5 cursor-pointer"
                >
                  <td className="px-4 py-4 text-sm text-white font-mono">{session.sessionId.slice(0, 8)}...</td>
                  <td className="px-4 py-4 text-sm text-gray-300">
                    {new Date(session.timestamp).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-300">{session.gameMode}</td>
                  <td className="px-4 py-4 text-sm text-gray-300">{session.playerAlias}</td>
                  <td className="px-4 py-4 text-sm text-gray-300">{session.opponentAlias}</td>
                  <td className="px-4 py-4 text-sm text-gray-300">{session.totalRounds}</td>
                  <td className="px-4 py-4 text-sm text-gray-300">{session.playerTotalScore}</td>
                  <td className="px-4 py-4 text-sm text-gray-300">{session.opponentTotalScore}</td>
                  <td className="px-4 py-4 text-sm text-gray-300">{session.winner}</td>
                  <td className="px-4 py-4 text-sm text-gray-300">{session.playerBehaviouralProfile}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSessions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">No sessions found</div>
          </div>
        )}
      </div>

      {/* Session Modal Placeholder */}
      {selectedSession && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedSession(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Session {selectedSession.sessionId.slice(0, 8)}...</h2>
              <p className="text-gray-400">Detailed session information will be shown here</p>
            </div>
            <button
              onClick={() => setSelectedSession(null)}
              className="w-full px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}