'use client';

interface SystemHealth {
  uptime: number;
  taskCount: number;
  costUsed: number;
  costBudget: number;
  lastDiscovery: string;
  nextEnhancement: string;
}

interface SystemTickerProps {
  health?: SystemHealth;
}

export default function SystemTicker({ health }: SystemTickerProps) {
  if (!health) return null;

  const costPercent = Math.round((health.costUsed / health.costBudget) * 100);
  const costColor = costPercent > 80 ? 'text-red-400' : costPercent > 50 ? 'text-yellow-400' : 'text-green-400';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
      <div className="grid grid-cols-6 gap-4 text-sm">
        <div>
          <div className="text-slate-400">Health</div>
          <div className="text-lg font-bold text-green-400">{health.uptime}%</div>
        </div>
        <div>
          <div className="text-slate-400">Budget</div>
          <div className={`text-lg font-bold ${costColor}`}>
            ${health.costUsed.toFixed(2)} / ${health.costBudget.toFixed(2)} ({costPercent}%)
          </div>
        </div>
        <div>
          <div className="text-slate-400">Active Tasks</div>
          <div className="text-lg font-bold text-blue-400">{health.taskCount}</div>
        </div>
        <div>
          <div className="text-slate-400">Last Discovery</div>
          <div className="text-lg font-bold text-slate-50">{health.lastDiscovery}</div>
        </div>
        <div>
          <div className="text-slate-400">Next Enhancement</div>
          <div className="text-lg font-bold text-slate-50">{health.nextEnhancement}</div>
        </div>
        <div>
          <div className="text-slate-400">System Status</div>
          <div className="text-lg font-bold text-green-400">✓ Online</div>
        </div>
      </div>
    </div>
  );
}
