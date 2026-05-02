'use client';

import { useState, useEffect } from 'react';
import ProductsPanel from './components/ProductsPanel';
import TasksPanel from './components/TasksPanel';

type TabType = 'products' | 'tasks';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('products');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(k => k + 1);
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'products'
              ? 'border-b-2 border-blue-500 text-blue-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          📦 Products
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'tasks'
              ? 'border-b-2 border-blue-500 text-blue-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          ✅ Enhancement Tasks
        </button>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={handleRefresh}
          className="secondary text-sm"
        >
          🔄 Refresh Data
        </button>
      </div>

      {/* Content */}
      {activeTab === 'products' && <ProductsPanel key={refreshKey} onRefresh={handleRefresh} />}
      {activeTab === 'tasks' && <TasksPanel key={refreshKey} onRefresh={handleRefresh} />}
    </div>
  );
}
