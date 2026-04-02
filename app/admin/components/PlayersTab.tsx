'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAllPlayers } from '@/lib/adminDataUtils';

export default function PlayersTab() {
  const [players, setPlayers] = useState<any[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'totalPoints', direction: 'desc' });
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = getAllPlayers();
    setPlayers(data);
    setFilteredPlayers(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    let filtered = players.filter(player =>
      player.alias.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

    setFilteredPlayers(filtered);
  }, [players, searchTerm, sortConfig]);

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
        <div className="text-white text-xl">Loading players data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Player Analysis</h1>
        <p className="text-gray-400">Detailed breakdown of all human players</p>
      </div>

      {/* Search */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by alias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
          <div className="text-gray-400 text-sm">
            {filteredPlayers.length} of {players.length} players
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/10">
              <tr>
                {[
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
              {filteredPlayers.map((player, index) => (
                <motion.tr
                  key={player.alias}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => setSelectedPlayer(player)}
                  className="hover:bg-white/5 cursor-pointer"
                >
                  <td className="px-4 py-4 text-sm text-white">{player.alias}</td>
                  <td className="px-4 py-4 text-sm text-gray-300">{player.gamesPlayed}</td>
                  <td className="px-4 py-4 text-sm text-gray-300">{player.totalPoints}</td>
                  <td className="px-4 py-4 text-sm text-gray-300">{player.totalWins}</td>
                  <td className="px-4 py-4 text-sm text-gray-300">{Math.round(player.winRate)}%</td>
                  <td className="px-4 py-4 text-sm text-gray-300">{Math.round(player.cooperationRate * 100)}%</td>
                  <td className="px-4 py-4 text-sm text-gray-300">{Math.round(player.defectionRate * 100)}%</td>
                  <td className="px-4 py-4 text-sm text-gray-300">{Math.round(player.retaliationScore * 100)}%</td>
                  <td className="px-4 py-4 text-sm text-gray-300">{Math.round(player.forgivenessScore * 100)}%</td>
                  <td className="px-4 py-4 text-sm text-gray-300">{Math.round(player.opportunismScore * 100)}%</td>
                  <td className="px-4 py-4 text-sm text-gray-300">{player.behaviouralProfile}</td>
                  <td className="px-4 py-4 text-sm text-gray-300">
                    {player.badges?.length > 0 ? player.badges.join(', ') : 'None'}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPlayers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">No players found</div>
          </div>
        )}
      </div>

      {/* Player Modal Placeholder */}
      {selectedPlayer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedPlayer(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">{selectedPlayer.alias}</h2>
              <p className="text-gray-400">Detailed player information will be shown here</p>
            </div>
            <button
              onClick={() => setSelectedPlayer(null)}
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