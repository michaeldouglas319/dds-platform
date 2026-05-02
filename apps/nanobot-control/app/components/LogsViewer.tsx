'use client';

import { useState, useEffect, useRef } from 'react';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

const MOCK_LOGS: LogEntry[] = [
  { timestamp: '16:42:15', level: 'info', message: 'START: discover-domains (cron)' },
  { timestamp: '16:42:18', level: 'success', message: '✓ Found 14 projects' },
  { timestamp: '16:42:21', level: 'success', message: '✓ Upserted product_registry' },
  { timestamp: '22:15:02', level: 'info', message: 'START: run-enhancement' },
  { timestamp: '22:15:05', level: 'success', message: '✓ Selected task: Optimize images (shop)' },
  { timestamp: '22:15:15', level: 'info', message: 'BUILD: vercel build --prod (ageofabundance-shop)' },
  { timestamp: '22:16:42', level: 'success', message: '✓ Build succeeded (87s)' },
  { timestamp: '22:16:44', level: 'info', message: 'DEPLOY: vercel deploy --prebuilt' },
  { timestamp: '22:16:58', level: 'success', message: '✓ Deployed v1.2.34' },
  { timestamp: '22:16:59', level: 'success', message: '✓ Task completed, score: 78 → 86' },
];

export default function LogsViewer() {
  const [logs, setLogs] = useState<LogEntry[]>(MOCK_LOGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | LogEntry['level']>('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return 'text-red-400';
      case 'warn':
        return 'text-yellow-400';
      case 'success':
        return 'text-green-400';
      case 'info':
      default:
        return 'text-slate-300';
    }
  };

  const getLevelBg = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return 'bg-red-900/20';
      case 'warn':
        return 'bg-yellow-900/20';
      case 'success':
        return 'bg-green-900/20';
      case 'info':
      default:
        return 'bg-slate-800/50';
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter Bar (Sticky) */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 sticky top-0 z-10">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm text-slate-400 mb-2">Search Logs</label>
            <input
              type="text"
              placeholder="Filter by keyword..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-slate-50"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Level</label>
            <select
              value={levelFilter}
              onChange={e => setLevelFilter(e.target.value as any)}
              className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-slate-50"
            >
              <option value="all">All</option>
              <option value="info">Info</option>
              <option value="warn">Warning</option>
              <option value="error">Error</option>
              <option value="success">Success</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoScroll"
              checked={autoScroll}
              onChange={e => setAutoScroll(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="autoScroll" className="text-sm text-slate-400 cursor-pointer">
              Auto-scroll
            </label>
          </div>
          <button className="secondary text-sm">
            📥 Download Logs
          </button>
        </div>
        <div className="text-xs text-slate-500 mt-2">
          Showing {filteredLogs.length} of {logs.length} log entries
        </div>
      </div>

      {/* Log Viewer */}
      <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
        <div className="font-mono text-sm max-h-96 overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="p-4 text-center text-slate-400">
              No logs match your filters
            </div>
          ) : (
            filteredLogs.map((log, idx) => (
              <div
                key={idx}
                className={`px-4 py-2 border-b border-slate-800 last:border-b-0 hover:bg-slate-900/50 transition-colors ${getLevelBg(log.level)}`}
              >
                <div className="flex gap-3 items-start">
                  <div className="text-slate-500 flex-shrink-0 w-12">[{log.timestamp}]</div>
                  <div className={`flex-shrink-0 w-8 ${getLevelColor(log.level)}`}>
                    {log.level === 'error' && '✗'}
                    {log.level === 'warn' && '⚠'}
                    {log.level === 'success' && '✓'}
                    {log.level === 'info' && 'ℹ'}
                  </div>
                  <div className={`flex-1 ${getLevelColor(log.level)} break-words`}>{log.message}</div>
                </div>
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      </div>

      {/* Log Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="text-slate-400 text-sm">Total Entries</div>
          <div className="text-2xl font-bold text-slate-50">{logs.length}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="text-slate-400 text-sm">Errors</div>
          <div className="text-2xl font-bold text-red-400">{logs.filter(l => l.level === 'error').length}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="text-slate-400 text-sm">Warnings</div>
          <div className="text-2xl font-bold text-yellow-400">{logs.filter(l => l.level === 'warn').length}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="text-slate-400 text-sm">Success Rate</div>
          <div className="text-2xl font-bold text-green-400">
            {Math.round((logs.filter(l => l.level === 'success').length / logs.length) * 100)}%
          </div>
        </div>
      </div>
    </div>
  );
}
