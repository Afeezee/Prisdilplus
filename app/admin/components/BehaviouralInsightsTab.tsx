'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function BehaviouralInsightsTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Placeholder for behavioural insights data
    setData({});
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white text-xl">Loading behavioural insights...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Behavioural Insights</h1>
        <p className="text-gray-400">Aggregated behavioural research metrics across all human players</p>
      </div>

      <div className="space-y-8">
        {/* Metrics distribution charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Metrics Distribution</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              'Cooperation Rate',
              'Defection Rate',
              'Retaliation Score',
              'Forgiveness Score',
              'Opportunism Score',
              'Consistency Score',
              'Niceness Score',
              'Push-over Index',
            ].map((metric, index) => (
              <div key={metric} className="text-center">
                <h4 className="text-sm font-medium text-gray-400 mb-2">{metric}</h4>
                <div className="h-32 flex items-center justify-center text-gray-500">
                  Histogram chart
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Correlation matrix */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Correlation Matrix</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            Behavioural metrics correlation matrix will be here
          </div>
        </motion.div>

        {/* Profile breakdown table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Profile Breakdown</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            Behavioural profile breakdown table will be here
          </div>
        </motion.div>

        {/* AI strategy impact analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4">AI Strategy Impact Analysis</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            Cooperation rate by AI strategy grouped bar chart will be here
          </div>
        </motion.div>
      </div>
    </div>
  );
}