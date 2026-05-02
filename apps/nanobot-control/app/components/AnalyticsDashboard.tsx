'use client';

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AnalyticsDashboard() {
  // Mock trend data
  const trendData = [
    { date: 'Apr 1', shop: 82, wiki: 85, dev: 78, art: 72 },
    { date: 'Apr 5', shop: 83, wiki: 86, dev: 79, art: 74 },
    { date: 'Apr 10', shop: 84, wiki: 88, dev: 81, art: 76 },
    { date: 'Apr 15', shop: 85, wiki: 89, dev: 82, art: 80 },
    { date: 'Apr 20', shop: 86, wiki: 90, dev: 83, art: 83 },
    { date: 'Apr 25', shop: 87, wiki: 92, dev: 83, art: 85 },
    { date: 'May 2', shop: 87, wiki: 92, dev: 83, art: 85 },
  ];

  const performanceData = [
    { product: 'Shop', performance: 87, ux: 78, accessibility: 91, seo: 88, quality: 92 },
    { product: 'Wiki', performance: 92, ux: 85, accessibility: 94, seo: 95, quality: 88 },
    { product: 'Dev', performance: 83, ux: 81, accessibility: 90, seo: 82, quality: 85 },
    { product: 'Art', performance: 85, ux: 72, accessibility: 88, seo: 74, quality: 78 },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Scorecards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="text-slate-400 text-sm">Avg Improvement</div>
          <div className="text-3xl font-bold text-green-400">+7.3 pts</div>
          <div className="text-xs text-slate-500 mt-1">per task</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="text-slate-400 text-sm">Success Rate</div>
          <div className="text-3xl font-bold text-green-400">96.4%</div>
          <div className="text-xs text-slate-500 mt-1">all-time</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="text-slate-400 text-sm">Avg Duration</div>
          <div className="text-3xl font-bold text-blue-400">4m 32s</div>
          <div className="text-xs text-slate-500 mt-1">per task</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="text-slate-400 text-sm">ROI</div>
          <div className="text-3xl font-bold text-purple-400">2.1 pts/min</div>
          <div className="text-xs text-slate-500 mt-1">spent</div>
        </div>
      </div>

      {/* Score Progression Trend */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Score Progression (30 Days)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" domain={[70, 95]} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
              labelStyle={{ color: '#f1f5f9' }}
            />
            <Legend />
            <Line type="monotone" dataKey="shop" stroke="#3b82f6" name="Shop" strokeWidth={2} />
            <Line type="monotone" dataKey="wiki" stroke="#10b981" name="Wiki" strokeWidth={2} />
            <Line type="monotone" dataKey="dev" stroke="#f59e0b" name="Dev" strokeWidth={2} />
            <Line type="monotone" dataKey="art" stroke="#8b5cf6" name="Art" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Performance by Rule Type */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Performance by Rule Type</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="product" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
              labelStyle={{ color: '#f1f5f9' }}
            />
            <Legend />
            <Bar dataKey="performance" fill="#3b82f6" name="Performance" />
            <Bar dataKey="ux" fill="#8b5cf6" name="UX" />
            <Bar dataKey="accessibility" fill="#10b981" name="Accessibility" />
            <Bar dataKey="seo" fill="#f59e0b" name="SEO" />
            <Bar dataKey="quality" fill="#ef4444" name="Quality" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4">Best Improving</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded">
              <div>
                <div className="font-semibold text-slate-50">Art</div>
                <div className="text-sm text-slate-400">+18% in 14d</div>
              </div>
              <div className="text-lg font-bold text-green-400">↗</div>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded">
              <div>
                <div className="font-semibold text-slate-50">Dev</div>
                <div className="text-sm text-slate-400">+6% in 14d</div>
              </div>
              <div className="text-lg font-bold text-green-400">↗</div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4">Fastest Tasks</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded">
              <div>
                <div className="font-semibold text-slate-50">Add favicons</div>
                <div className="text-sm text-slate-400">45 seconds</div>
              </div>
              <div className="text-lg font-bold text-blue-400">⚡</div>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded">
              <div>
                <div className="font-semibold text-slate-50">Update meta tags</div>
                <div className="text-sm text-slate-400">1m 20s</div>
              </div>
              <div className="text-lg font-bold text-blue-400">⚡</div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4">Most Impactful</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded">
              <div>
                <div className="font-semibold text-slate-50">Perf optimization</div>
                <div className="text-sm text-slate-400">+42 pts total</div>
              </div>
              <div className="text-lg font-bold text-purple-400">📈</div>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded">
              <div>
                <div className="font-semibold text-slate-50">Accessibility pass</div>
                <div className="text-sm text-slate-400">+38 pts total</div>
              </div>
              <div className="text-lg font-bold text-purple-400">📈</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
