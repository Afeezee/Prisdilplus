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
    <div className="min-h-screen bg-[#0a0a0f] relative">
      {/* Radial gradient overlays matching main app */}
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(ellipse at 20% 50%, rgba(34, 211, 238, 0.04) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, rgba(168, 85, 247, 0.04) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 80%, rgba(59, 130, 246, 0.03) 0%, transparent 50%)
          `
        }}
      />
      <AdminNav activeTab={activeTab} onTabChange={setActiveTab} onLogout={onLogout} />

      <main className="relative z-10 pt-20 px-4 pb-8">
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