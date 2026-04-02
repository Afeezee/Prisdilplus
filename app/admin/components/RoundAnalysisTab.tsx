'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function RoundAnalysisTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Placeholder for round analysis data
    setData({});
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white text-xl">Loading round analysis...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Round Analysis</h1>
        <p className="text-gray-400">Aggregate analysis across all rounds from all sessions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Move frequency heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Move Frequency Heatmap</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            CC/CD/DC/DD outcome frequencies chart will be here
          </div>
        </motion.div>

        {/* Round position analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Round Position Analysis</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            Cooperation rate by round position chart will be here
          </div>
        </motion.div>

        {/* First move analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4">First Move Analysis</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            Cooperate vs defect on round 1 pie chart will be here
          </div>
        </motion.div>

        {/* Retaliation latency */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Retaliation Latency</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            Rounds until retaliation bar chart will be here
          </div>
        </motion.div>
      </div>
    </div>
  );
}