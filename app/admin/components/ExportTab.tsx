'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  exportPlayerSummaryDataset,
  exportGameSessionsDataset,
  exportRoundByRoundDataset,
  exportBehaviouralMetricsMatrix,
  exportFullRawExport,
  getExportCounts,
} from '@/lib/adminDataUtils';

export default function ExportTab() {
  const [exporting, setExporting] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [counts, setCounts] = useState({ players: 0, sessions: 0, rounds: 0 });

  useEffect(() => {
    setCounts(getExportCounts());
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 4000);
  };

  const handleExport = (exportFn: () => number, name: string) => {
    setExporting(name);
    try {
      const rowCount = exportFn();
      showToast(`✅ Successfully exported ${rowCount} rows — ${name}`);
    } catch (error) {
      console.error('Export error:', error);
      showToast('❌ Export failed. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  const exportOptions = [
    {
      name: 'Player Summary Dataset',
      description: 'One row per player with all metrics, profile data, and badges',
      filename: 'prisdilplus_players_[timestamp].csv',
      fn: exportPlayerSummaryDataset,
      rowCount: counts.players,
      icon: '👥',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      name: 'Game Sessions Dataset',
      description: 'One row per completed game session with metrics',
      filename: 'prisdilplus_sessions_[timestamp].csv',
      fn: exportGameSessionsDataset,
      rowCount: counts.sessions,
      icon: '🎮',
      color: 'from-purple-500 to-pink-500',
    },
    {
      name: 'Round-by-Round Raw Dataset',
      description: 'One row per round per session — full move-level data',
      filename: 'prisdilplus_rounds_[timestamp].csv',
      fn: exportRoundByRoundDataset,
      rowCount: counts.rounds,
      icon: '🔄',
      color: 'from-green-500 to-emerald-500',
    },
    {
      name: 'Behavioural Metrics Matrix',
      description: 'ML-ready matrix: all 8 behavioural metrics per player for clustering & classification',
      filename: 'prisdilplus_metrics_matrix_[timestamp].csv',
      fn: exportBehaviouralMetricsMatrix,
      rowCount: counts.players,
      icon: '🧠',
      color: 'from-indigo-500 to-purple-500',
    },
    {
      name: 'Full Raw Export',
      description: 'Everything combined — sessions joined with player metrics in a single flat file',
      filename: 'prisdilplus_full_export_[timestamp].csv',
      fn: exportFullRawExport,
      rowCount: counts.sessions,
      icon: '📦',
      color: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Data Export</h1>
        <p className="text-gray-400">Download datasets for academic research and machine learning analysis</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{counts.players}</div>
          <div className="text-gray-400 text-xs">Total Players</div>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{counts.sessions}</div>
          <div className="text-gray-400 text-xs">Total Sessions</div>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{counts.rounds}</div>
          <div className="text-gray-400 text-xs">Total Rounds</div>
        </div>
      </div>

      {/* Export Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {exportOptions.map((option, index) => (
          <motion.div
            key={option.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center text-xl`}>
                  {option.icon}
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">{option.name}</h3>
                  <p className="text-gray-500 text-[10px] font-mono mt-0.5">{option.filename}</p>
                </div>
              </div>
            </div>

            <p className="text-gray-400 text-xs mb-4 flex-1">{option.description}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 font-bold text-sm">{option.rowCount}</span>
                <span className="text-gray-500 text-xs">rows available</span>
              </div>

              <motion.button
                onClick={() => handleExport(option.fn, option.name)}
                disabled={exporting === option.name || option.rowCount === 0}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200
                  ${option.rowCount === 0
                    ? 'bg-gray-600/20 text-gray-500 cursor-not-allowed'
                    : exporting === option.name
                      ? 'bg-gray-600/20 text-gray-400 cursor-wait'
                      : 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white hover:shadow-lg hover:shadow-cyan-500/20'
                  }`}
                whileHover={option.rowCount > 0 && exporting !== option.name ? { scale: 1.02 } : {}}
                whileTap={option.rowCount > 0 && exporting !== option.name ? { scale: 0.98 } : {}}
              >
                {exporting === option.name ? '⏳ Exporting...' : option.rowCount === 0 ? 'No Data' : '📥 Download CSV'}
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Info */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-lg">ℹ️</span>
          <div className="text-xs text-gray-400 space-y-1">
            <p>All exports use proper CSV formatting with column headers on the first row.</p>
            <p>String fields with commas are replaced with semicolons for clean parsing.</p>
            <p>Files are downloaded directly to your device — no data leaves the browser.</p>
          </div>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 bg-[#12121f]/95 backdrop-blur-xl border border-white/10 rounded-xl px-5 py-3 text-sm text-white shadow-2xl z-50 max-w-sm"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
