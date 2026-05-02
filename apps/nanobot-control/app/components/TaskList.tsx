'use client';

interface Task {
  id: string;
  domain: string;
  app_name: string;
  rule_name: string;
  task_type: string;
  title: string;
  description: string | null;
  status: string;
  priority: number;
  score_before: number | null;
  score_after: number | null;
  rule_score: number | null;
  started_at: string | null;
  completed_at: string | null;
  duration_seconds: number | null;
  created_at: string;
}

interface TaskListProps {
  tasks: Task[];
  onRefresh: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-900/30 text-yellow-400',
  in_progress: 'bg-blue-900/30 text-blue-400',
  completed: 'bg-green-900/30 text-green-400',
  failed: 'bg-red-900/30 text-red-400',
  skipped: 'bg-slate-800 text-slate-300',
};

const TASK_TYPE_ICONS: Record<string, string> = {
  performance: '⚡',
  ux: '🎨',
  accessibility: '♿',
  seo: '📈',
  code_quality: '🔍',
};

const PRIORITY_LABELS: Record<number, string> = {
  0: 'Low',
  1: 'Medium',
  2: 'High',
};

export default function TaskList({ tasks, onRefresh }: TaskListProps) {
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return;

    try {
      const res = await fetch(`/api/tasks?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error deleting task');
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p>No tasks in this filter. Create one to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {tasks.map(task => (
        <div
          key={task.id}
          className="bg-slate-900 border border-slate-800 rounded-lg p-4 hover:border-slate-700 transition-colors"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{TASK_TYPE_ICONS[task.task_type] || '✓'}</span>
                <h3 className="font-bold text-lg">{task.title}</h3>
                <span className={`px-2 py-1 text-xs rounded ${STATUS_COLORS[task.status] || 'bg-slate-800'}`}>
                  {task.status.replace('_', ' ')}
                </span>
                <span className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded">
                  {PRIORITY_LABELS[task.priority as keyof typeof PRIORITY_LABELS]} Priority
                </span>
              </div>
              <p className="text-slate-400 text-sm">
                <span className="font-medium">{task.rule_name}</span>
                {' · '}
                {task.app_name} ({task.domain})
              </p>
              {task.description && (
                <p className="text-slate-500 text-sm mt-2">{task.description}</p>
              )}
            </div>
            <button
              onClick={() => handleDelete(task.id)}
              className="danger text-sm px-3 py-1 ml-4"
            >
              Delete
            </button>
          </div>

          {/* Scoring Section */}
          <div className="grid grid-cols-3 gap-4 bg-slate-800/30 rounded p-3 text-sm">
            <div>
              <div className="text-slate-400">Rule Score</div>
              <div className="text-lg font-bold">
                {task.rule_score !== null ? task.rule_score.toFixed(1) : '—'} / 10
              </div>
            </div>
            <div>
              <div className="text-slate-400">Score Before → After</div>
              <div className="text-lg font-bold">
                {task.score_before !== null ? task.score_before.toFixed(1) : '—'}
                {' → '}
                {task.score_after !== null ? task.score_after.toFixed(1) : '—'}
              </div>
            </div>
            <div>
              <div className="text-slate-400">Duration</div>
              <div className="text-lg font-bold">
                {task.duration_seconds ? `${task.duration_seconds}s` : '—'}
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="flex gap-4 text-xs text-slate-500 mt-3">
            <div>
              Created {new Date(task.created_at).toLocaleDateString()}
            </div>
            {task.started_at && (
              <div>
                Started {new Date(task.started_at).toLocaleString()}
              </div>
            )}
            {task.completed_at && (
              <div>
                Completed {new Date(task.completed_at).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
