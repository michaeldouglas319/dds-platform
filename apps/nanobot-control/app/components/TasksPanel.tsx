'use client';

import { useState, useEffect } from 'react';
import TaskForm from './TaskForm';
import TaskList from './TaskList';

interface Product {
  id: string;
  domain: string;
  app_name: string;
  name: string;
}

interface Task {
  id: string;
  product_id: string;
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

export default function TasksPanel({ onRefresh }: { onRefresh: () => void }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([fetchTasks(), fetchProducts()]);
  }, []);

  const fetchTasks = async () => {
    setError('');
    try {
      const res = await fetch('/api/tasks');
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  const handleTaskSaved = () => {
    fetchTasks();
    setShowForm(false);
    onRefresh();
  };

  const filteredTasks = statusFilter === 'all'
    ? tasks
    : tasks.filter(t => t.status === statusFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Enhancement Tasks ({filteredTasks.length})</h2>
          <p className="text-slate-400 text-sm">Atomic improvements pending execution</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="primary"
        >
          {showForm ? '✕ Cancel' : '+ New Task'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <TaskForm
          products={products}
          onSaved={handleTaskSaved}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-900/20 border border-red-800 rounded text-red-300">
          {error}
        </div>
      )}

      {/* Status Filter */}
      {!loading && (
        <div className="flex gap-2">
          {['all', 'pending', 'in_progress', 'completed', 'failed'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`text-sm px-3 py-1 rounded transition-colors ${
                statusFilter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {status === 'all' ? 'All' : status.replace('_', ' ')}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="p-8 text-center text-slate-400">
          Loading tasks...
        </div>
      )}

      {/* List */}
      {!loading && !showForm && (
        <TaskList
          tasks={filteredTasks}
          onRefresh={fetchTasks}
        />
      )}
    </div>
  );
}
