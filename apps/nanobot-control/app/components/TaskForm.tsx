'use client';

import { useState } from 'react';

interface Product {
  id: string;
  domain: string;
  app_name: string;
  name: string;
}

interface TaskFormProps {
  products: Product[];
  onSaved: () => void;
  onCancel: () => void;
}

const TASK_TYPES = [
  'performance',
  'ux',
  'accessibility',
  'seo',
  'code_quality',
];

export default function TaskForm({ products, onSaved, onCancel }: TaskFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    product_id: '',
    rule_name: '',
    task_type: 'performance',
    title: '',
    description: '',
    priority: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'priority' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Find product to get domain and app_name
      const product = products.find(p => p.id === formData.product_id);
      if (!product) throw new Error('Product not selected');

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          domain: product.domain,
          app_name: product.app_name,
        }),
      });

      if (!res.ok) throw new Error('Failed to create task');
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-bold">New Enhancement Task</h3>

      {error && (
        <div className="p-3 bg-red-900/20 border border-red-800 rounded text-red-300 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Product</label>
          <select
            name="product_id"
            value={formData.product_id}
            onChange={handleChange}
            required
          >
            <option value="">Select a product...</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>
                {p.name || p.domain} ({p.app_name})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Rule Name</label>
            <input
              type="text"
              name="rule_name"
              value={formData.rule_name}
              onChange={handleChange}
              placeholder="e.g., Performance"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Task Type</label>
            <select
              name="task_type"
              value={formData.task_type}
              onChange={handleChange}
            >
              {TASK_TYPES.map(type => (
                <option key={type} value={type}>
                  {type.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="What needs to be improved?"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Why is this important?"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Priority</label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
          >
            <option value={0}>Low (0)</option>
            <option value={1}>Medium (1)</option>
            <option value={2}>High (2)</option>
          </select>
        </div>

        <div className="flex gap-2 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="primary flex-1"
          >
            {loading ? 'Creating...' : 'Create Task'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
