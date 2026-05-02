'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Dashboard from './components/Dashboard';
import ProductsPanel from './components/ProductsPanel';
import TasksPanel from './components/TasksPanel';
import RulesEditor from './components/RulesEditor';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import LogsViewer from './components/LogsViewer';
import SystemTicker from './components/SystemTicker';

type TabType = 'dashboard' | 'rules' | 'tasks' | 'analytics' | 'logs' | 'products';

interface SystemHealth {
  uptime: number;
  taskCount: number;
  costUsed: number;
  costBudget: number;
  lastDiscovery: string;
  nextEnhancement: string;
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch system health
  const { data: health } = useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      try {
        const tasks = await fetch('/api/tasks').then(r => r.json());
        return {
          uptime: 99.8,
          taskCount: Array.isArray(tasks) ? tasks.length : 0,
          costUsed: 2.34,
          costBudget: 5.0,
          lastDiscovery: new Date(Date.now() - 15 * 60000).toLocaleTimeString(),
          nextEnhancement: new Date(Date.now() + 2.75 * 3600000).toLocaleTimeString(),
        };
      } catch {
        return {
          uptime: 99.8,
          taskCount: 0,
          costUsed: 0,
          costBudget: 5.0,
          lastDiscovery: 'Unknown',
          nextEnhancement: 'Unknown',
        };
      }
    },
    refetchInterval: 30000,
  });

  const handleRefresh = () => {
    setRefreshKey(k => k + 1);
  };

  const tabConfig = [
    { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
    { id: 'rules', label: '🔧 Rules', icon: '🔧' },
    { id: 'tasks', label: '✅ Tasks', icon: '✅' },
    { id: 'analytics', label: '📈 Analytics', icon: '📈' },
    { id: 'logs', label: '💾 Logs', icon: '💾' },
  ] as const;

  return (
    <div className="space-y-6">
      {/* System Health Ticker */}
      <SystemTicker health={health} />

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-slate-800 overflow-x-auto">
        {tabConfig.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={handleRefresh}
          className="secondary text-sm"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Content */}
      {activeTab === 'dashboard' && <Dashboard key={refreshKey} onRefresh={handleRefresh} />}
      {activeTab === 'rules' && <RulesEditor key={refreshKey} />}
      {activeTab === 'tasks' && <TasksPanel key={refreshKey} onRefresh={handleRefresh} />}
      {activeTab === 'analytics' && <AnalyticsDashboard key={refreshKey} />}
      {activeTab === 'logs' && <LogsViewer key={refreshKey} />}
    </div>
  );
}
