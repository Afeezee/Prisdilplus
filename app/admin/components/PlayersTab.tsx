'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { getAllPlayers } from '@/lib/adminDataUtils';
import PlayerModal from './PlayerModal';

export default function PlayersTab() {
  const [players, setPlayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'totalPoints', direction: 'desc' });
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  useEffect(() => {
    setPlayers(getAllPlayers());
  }, []);

  const filteredPlayers = useMemo(() => {
    let filtered = players.filter((player) =>
      player.alias.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (typeof aValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [players, searchTerm, sortConfig]);

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
    { key: 'alias', label: 'Alias' },
    { key: 'gamesPlayed', label: 'Games' },
    { key: 'totalPoints', label: 'Points' },
    { key: 'totalWins', label: 'Wins' },
    { key: 'winRate', label: 'Win Rate' },
    { key: 'cooperationRate', label: 'Coop Rate' },
    { key: 'defectionRate', label: 'Defect Rate' },
    { key: 'retaliationScore', label: 'Retaliation' },
    { key: 'forgivenessScore', label: 'Forgiveness' },
    { key: 'opportunismScore', label: 'Opportunism' },
    { key: 'behaviouralProfile', label: 'Profile' },
    { key: 'badges', label: 'Badges' },
    { key: 'createdAt', label: 'Member Since' },
  ];

  const formatCell = (player, key) => {
    switch (key) {
      case 'winRate': return `${Math.round(player.winRate)}%`;
      case 'cooperationRate': return `${Math.round(player.cooperationRate * 100)}%`;
      case 'defectionRate': return `${Math.round(player.defectionRate * 100)}%`;
      case 'retaliationScore': return `${Math.round(player.retaliationScore * 100)}%`;
      case 'forgivenessScore': return `${Math.round(player.forgivenessScore * 100)}%`;
      case 'opportunismScore': return `${Math.round(player.opportunismScore * 100)}%`;
      case 'badges': return player.badges?.length > 0 ? `${player.badges.length} 🏅` : '—';
      case 'createdAt': return player.createdAt ? new Date(player.createdAt).toLocaleDateString() : '—';
      default: return player[key] ?? '—';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Player Analysis</h1>
        <p className="text-gray-400">Detailed breakdown of all human players</p>
      </div>

      {/* Search */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
            <input
              type="text"
              placeholder="Search by alias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm"
            />
          </div>
          <span className="text-gray-400 text-sm whitespace-nowrap">
            {filteredPlayers.length} of {players.length} players
          </span>
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
              {filteredPlayers.map((player, index) => (
                <motion.tr
                  key={player.alias}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(index * 0.02, 0.5) }}
                  onClick={() => setSelectedPlayer(player)}
                  className="hover:bg-white/5 cursor-pointer transition-colors"
                >
                  {columns.map(({ key }) => (
                    <td key={key} className="px-3 py-3 text-xs text-gray-300 whitespace-nowrap">
                      {key === 'alias' ? (
                        <span className="text-white font-medium">{player.alias}</span>
                      ) : key === 'behaviouralProfile' ? (
                        <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded text-[10px]">
                          {player.behaviouralProfile}
                        </span>
                      ) : (
                        formatCell(player, key)
                      )}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPlayers.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">👥</div>
            <div className="text-gray-400">No players found</div>
            <p className="text-gray-500 text-sm mt-1">
              {players.length === 0 ? 'No data yet — play some games first!' : 'Try a different search term'}
            </p>
          </div>
        )}
      </div>

      {/* Player Modal */}
      {selectedPlayer && (
        <PlayerModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      )}
    </div>
  );
}
