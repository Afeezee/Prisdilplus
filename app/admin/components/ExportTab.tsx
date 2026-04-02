'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  exportPlayerSummaryDataset,
  exportGameSessionsDataset,
  exportRoundByRoundDataset,
  exportBehaviouralMetricsMatrix,
  exportFullRawExport,
} from '@/lib/adminDataUtils';

export default function ExportTab() {
  const [exporting, setExporting] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleExport = async (exportFunction: () => Promise<number>, name: string) => {
    setExporting(name);
    try {
      const rowCount = await exportFunction();
      showToast(`Successfully exported ${rowCount} rows to ${name}`);
    } catch (error) {
      console.error('Export error:', error);
      showToast('Export failed. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  const exportOptions = [
    {
      name: 'Player Summary Dataset',
      description: 'One row per player with all metrics and profile data',
      filename: 'prisdilplus_players_[timestamp].csv',
      function: exportPlayerSummaryDataset,
      rowCount: 'players',
    },
    {
      name: 'Game Sessions Dataset',
      description: 'One row per completed game session',
      filename: 'prisdilplus_sessions_[timestamp].csv',
      function: exportGameSessionsDataset,
      rowCount: 'sessions',
    },
    {
      name: 'Round-by-Round Raw Dataset',
      description: 'One row per round per session with detailed move data',
      filename: 'prisdilplus_rounds_[timestamp].csv',
      function: exportRoundByRoundDataset,
      rowCount: 'rounds',
    },
    {
      name: 'Behavioural Metrics Matrix',
      description: 'ML-ready matrix with all 8 behavioural metrics per player',
      filename: 'prisdilplus_metrics_matrix_[timestamp].csv',
      function: exportBehaviouralMetricsMatrix,
      rowCount: 'players',
    },
    {
      name: 'Full Raw Export',
      description: 'Everything combined - sessions joined with player metrics',
      filename: 'prisdilplus_full_export_[timestamp].csv',
      function: exportFullRawExport,
      rowCount: 'sessions',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Data Export</h1>
        <p className="text-gray-400">Download datasets for research and machine learning analysis</p>
      </div>

      {/* Export Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {exportOptions.map((option, index) => (
          <motion.div
            key={option.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-white mb-2">{option.name}</h3>
              <p className="text-gray-400 text-sm mb-3">{option.description}</p>
              <p className="text-cyan-400 text-xs font-mono">{option.filename}</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-gray-500 text-sm">
                Contains: {option.rowCount} data
              </div>
              <button
                onClick={() => handleExport(option.function, option.name)}
                disabled={exporting === option.name}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed"
              >
                {exporting === option.name ? 'Exporting...' : 'Download CSV'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Toast Notification */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 bg-green-500/20 backdrop-blur-xl border border-green-500/30 rounded-lg p-4 text-green-400 max-w-sm"
        >
          {toast}
        </motion.div>
      )}
    </div>
  );
}