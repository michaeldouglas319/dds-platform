'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Product {
  id: string;
  domain: string;
  app_name: string;
  name: string;
  rules_json: Record<string, any>;
}

interface DashboardProps {
  onRefresh: () => void;
}

export default function Dashboard({ onRefresh }: DashboardProps) {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  // Fetch products
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch('/api/products');
      if (!res.ok) return [];
      return res.json();
    },
  });

  // Mock heatmap data (in production, calculate from product rules + scores)
  const heatmapData = (products as Product[]).map(p => ({
    domain: p.domain,
    name: p.name || p.domain,
    performance: Math.floor(Math.random() * 40) + 60,
    ux: Math.floor(Math.random() * 40) + 60,
    accessibility: Math.floor(Math.random() * 40) + 60,
    seo: Math.floor(Math.random() * 40) + 60,
    quality: Math.floor(Math.random() * 40) + 60,
  }));

  // Cost trend data (mock)
  const costData = [
    { date: 'May 1', spend: 0.24, forecast: 0.24 },
    { date: 'May 2', spend: 0.34, forecast: 0.34 },
    { date: 'May 3', spend: 0.45, forecast: 0.45 },
    { date: 'May 4', spend: 0.56, forecast: 0.56 },
    { date: 'May 5', spend: 0.78, forecast: 0.78 },
    { date: 'May 6', spend: 0.92, forecast: 0.92 },
    { date: 'May 7', spend: 1.12, forecast: 1.12 },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-900/50 text-green-400 border-green-700';
    if (score >= 70) return 'bg-yellow-900/50 text-yellow-400 border-yellow-700';
    if (score >= 60) return 'bg-orange-900/50 text-orange-400 border-orange-700';
    return 'bg-red-900/50 text-red-400 border-red-700';
  };

  return (
    <div className="space-y-6">
      {/* Compliance Heatmap */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Product Compliance Heatmap</h2>
        <div className="overflow-x-auto">
          <div className="space-y-2 min-w-max">
            {/* Header row */}
            <div className="flex gap-2">
              <div className="w-32 font-semibold text-slate-400">Product</div>
              <div className="flex gap-2">
                {['Performance', 'UX', 'Accessibility', 'SEO', 'Quality'].map(rule => (
                  <div key={rule} className="w-24 text-center text-xs font-semibold text-slate-400">
                    {rule.split(' ')[0]}
                  </div>
                ))}
              </div>
            </div>

            {/* Heatmap rows */}
            {heatmapData.map(product => (
              <div
                key={product.domain}
                className="flex gap-2 items-center cursor-pointer hover:bg-slate-800/50 p-2 rounded"
                onClick={() => setSelectedProduct(product.domain)}
              >
                <div className="w-32 font-medium text-slate-100">{product.name}</div>
                <div className="flex gap-2">
                  {[product.performance, product.ux, product.accessibility, product.seo, product.quality].map((score, idx) => (
                    <div
                      key={idx}
                      className={`w-24 py-2 px-2 rounded text-center font-semibold border ${getScoreColor(score)}`}
                    >
                      {score}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        {selectedProduct && (
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-800 rounded text-blue-300 text-sm">
            Selected: <strong>{selectedProduct}</strong> — Click to drill down (coming soon)
          </div>
        )}
      </div>

      {/* Cost Tracker */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Cost Forecast (This Month)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={costData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
              labelStyle={{ color: '#f1f5f9' }}
            />
            <Legend />
            <Bar dataKey="spend" fill="#3b82f6" name="Daily Spend ($)" />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="bg-slate-800/50 rounded p-3">
            <div className="text-slate-400 text-sm">This Month</div>
            <div className="text-2xl font-bold text-blue-400">$1.87</div>
          </div>
          <div className="bg-slate-800/50 rounded p-3">
            <div className="text-slate-400 text-sm">Projected Month-End</div>
            <div className="text-2xl font-bold text-green-400">$2.41</div>
          </div>
          <div className="bg-slate-800/50 rounded p-3">
            <div className="text-slate-400 text-sm">Budget Remaining</div>
            <div className="text-2xl font-bold text-green-400">$2.59</div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Summary</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-slate-400">Total Products</p>
            <p className="text-3xl font-bold text-slate-50">{heatmapData.length}</p>
          </div>
          <div>
            <p className="text-slate-400">Average Compliance Score</p>
            <p className="text-3xl font-bold text-green-400">
              {Math.round(
                heatmapData.reduce((acc, p) => acc + (p.performance + p.ux + p.accessibility + p.seo + p.quality) / 5, 0) /
                  heatmapData.length
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
