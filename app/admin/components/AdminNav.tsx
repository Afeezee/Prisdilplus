'use client';

import { motion } from 'framer-motion';

type TabType = 'overview' | 'players' | 'sessions' | 'round-analysis' | 'behavioural-insights' | 'export';

interface AdminNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onLogout: () => void;
}

const tabs: { id: TabType; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'players', label: 'Players' },
  { id: 'sessions', label: 'Sessions' },
  { id: 'round-analysis', label: 'Round Analysis' },
  { id: 'behavioural-insights', label: 'Behavioural Insights' },
  { id: 'export', label: 'Export Data' },
];

export default function AdminNav({ activeTab, onTabChange, onLogout }: AdminNavProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/5 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">📊</div>
              <h1 className="text-xl font-bold text-white">Prisdil+ Research Dashboard</h1>
            </div>

            <div className="hidden md:flex space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={onLogout}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded-lg text-sm font-medium transition-all duration-200 border border-red-500/30"
          >
            Log Out
          </button>
        </div>

        {/* Mobile tabs */}
        <div className="md:hidden pb-4">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}