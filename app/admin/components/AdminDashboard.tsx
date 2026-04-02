'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import AdminNav from './AdminNav';
import OverviewTab from './OverviewTab';
import PlayersTab from './PlayersTab';
import SessionsTab from './SessionsTab';
import RoundAnalysisTab from './RoundAnalysisTab';
import BehaviouralInsightsTab from './BehaviouralInsightsTab';
import ExportTab from './ExportTab';

interface AdminDashboardProps {
  onLogout: () => void;
}

type TabType = 'overview' | 'players' | 'sessions' | 'round-analysis' | 'behavioural-insights' | 'export';

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'players':
        return <PlayersTab />;
      case 'sessions':
        return <SessionsTab />;
      case 'round-analysis':
        return <RoundAnalysisTab />;
      case 'behavioural-insights':
        return <BehaviouralInsightsTab />;
      case 'export':
        return <ExportTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AdminNav activeTab={activeTab} onTabChange={setActiveTab} onLogout={onLogout} />

      <main className="pt-20 px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderTab()}
          </motion.div>
        </div>
      </main>
    </div>
  );
}