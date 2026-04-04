'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { getAllSessions } from '@/lib/adminDataUtils';
import SessionModal from './SessionModal';

export default function SessionsTab() {
  const [sessions, setSessions] = useState([]);
  const [filters, setFilters] = useState({ mode: 'all', aiStrategy: 'all', dateRange: 'all' });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    setSessions(getAllSessions());
  }, []);

  // Get unique AI strategies for filter
  const aiStrategies = useMemo(() => {
    const set = new Set<string>();
    sessions.forEach((s: any) => { if (s.aiStrategy) set.add(s.aiStrategy); });
    return Array.from(set);
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    let filtered = [...sessions];

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((s) =>
        (s.playerAlias || '').toLowerCase().includes(term) ||
        (s.opponentAlias || '').toLowerCase().includes(term) ||
        (s.sessionId || '').toLowerCase().includes(term)
      );
    }

    // Mode filter
    if (filters.mode !== 'all') {
      filtered = filtered.filter((s) => s.gameMode === filters.mode);
    }

    // AI Strategy filter
    if (filters.aiStrategy !== 'all') {
      filtered = filtered.filter((s) => s.aiStrategy === filters.aiStrategy);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      if (filters.dateRange === 'today') cutoff.setHours(0, 0, 0, 0);
      else if (filters.dateRange === 'week') cutoff.setDate(now.getDate() - 7);
      else if (filters.dateRange === 'month') cutoff.setMonth(now.getMonth() - 1);
      filtered = filtered.filter((s) => new Date(s.timestamp) >= cutoff);
    }

    // Sort
    filtered.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (typeof aVal === 'string') {
        return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortConfig.direction === 'asc' ? (aVal || 0) - (bVal || 0) : (bVal || 0) - (aVal || 0);
    });

    return filtered;
  }, [sessions, searchTerm, filters, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const columns = [
    { key: 'sessionId', label: 'Session ID' },
    { key: 'timestamp', label: 'Date' },
    { key: 'gameMode', label: 'Mode' },
    { key: 'playerAlias', label: 'Player' },
    { key: 'opponentAlias', label: 'Opponent' },
    { key: 'totalRounds', label: 'Rounds' },
    { key: 'playerTotalScore', label: 'P.Score' },
    { key: 'opponentTotalScore', label: 'O.Score' },
    { key: 'winner', label: 'Winner' },
    { key: 'playerBehaviouralProfile', label: 'Profile' },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Game Sessions</h1>
        <p className="text-gray-400">Complete history of all gameplay sessions</p>
      </div>

      {/* Filters */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Search</label>
            <input
              type="text"
              placeholder="Player, opponent, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Game Mode</label>
            <select
              value={filters.mode}
              onChange={(e) => setFilters((p) => ({ ...p, mode: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm"
            >
              <option value="all">All Modes</option>
              <option value="PvP">PvP</option>
              <option value="PvAI">PvAI</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">AI Strategy</label>
            <select
              value={filters.aiStrategy}
              onChange={(e) => setFilters((p) => ({ ...p, aiStrategy: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm"
            >
              <option value="all">All Strategies</option>
              {aiStrategies.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters((p) => ({ ...p, dateRange: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Past 7 Days</option>
              <option value="month">Past 30 Days</option>
            </select>
          </div>
        </div>
        <div className="mt-3 text-gray-400 text-xs">
          Showing {filteredSessions.length} of {sessions.length} sessions
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                {columns.map(({ key, label }) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key)}
                    className="px-3 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-cyan-400 transition-colors whitespace-nowrap"
                  >
                    <span className="flex items-center gap-1">
                      {label} <span className="text-[9px]">{getSortIcon(key)}</span>
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredSessions.map((session, index) => (
                <motion.tr
                  key={session.sessionId || index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(index * 0.02, 0.5) }}
                  onClick={() => setSelectedSession(session)}
                  className="hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <td className="px-3 py-3 text-xs text-cyan-400 font-mono">{(session.sessionId || '').slice(0, 8)}…</td>
                  <td className="px-3 py-3 text-xs text-gray-300">{new Date(session.timestamp).toLocaleDateString()}</td>
                  <td className="px-3 py-3 text-xs">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${session.gameMode === 'PvAI' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                      {session.gameMode}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs text-white">{session.playerAlias}</td>
                  <td className="px-3 py-3 text-xs text-gray-300">{session.opponentAlias}</td>
                  <td className="px-3 py-3 text-xs text-gray-300">{session.totalRounds}</td>
                  <td className="px-3 py-3 text-xs text-gray-300">{session.playerTotalScore}</td>
                  <td className="px-3 py-3 text-xs text-gray-300">{session.opponentTotalScore}</td>
                  <td className="px-3 py-3 text-xs text-gray-300">{session.winner}</td>
                  <td className="px-3 py-3 text-xs">
                    <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded text-[10px]">
                      {session.playerBehaviouralProfile || '—'}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSessions.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🎮</div>
            <div className="text-gray-400">No sessions found</div>
            <p className="text-gray-500 text-sm mt-1">
              {sessions.length === 0 ? 'No data yet — play some games first!' : 'Try adjusting your filters'}
            </p>
          </div>
        )}
      </div>

      {/* Session Modal */}
      {selectedSession && (
        <SessionModal session={selectedSession} onClose={() => setSelectedSession(null)} />
      )}
    </div>
  );
}
