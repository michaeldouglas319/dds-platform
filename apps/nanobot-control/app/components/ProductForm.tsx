'use client';

import { useState } from 'react';

interface Product {
  id: string;
  domain: string;
  app_name: string;
  name: string;
  description: string | null;
  has_rules: boolean;
}

interface ProductFormProps {
  product: Product | null;
  onSaved: () => void;
  onCancel: () => void;
}

export default function ProductForm({ product, onSaved, onCancel }: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    domain: product?.domain || '',
    app_name: product?.app_name || '',
    name: product?.name || '',
    description: product?.description || '',
    has_rules: product?.has_rules || false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const method = product ? 'PUT' : 'POST';
      const url = product ? `/api/products?id=${product.id}` : '/api/products';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to save product');
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-bold">{product ? 'Edit Product' : 'New Product'}</h3>

      {error && (
        <div className="p-3 bg-red-900/20 border border-red-800 rounded text-red-300 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Domain</label>
            <input
              type="text"
              name="domain"
              value={formData.domain}
              onChange={handleChange}
              placeholder="e.g., shop, wiki"
              disabled={!!product}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">App Name</label>
            <input
              type="text"
              name="app_name"
              value={formData.app_name}
              onChange={handleChange}
              placeholder="e.g., ageofabundance-shop"
              disabled={!!product}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Product Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Display name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Product description"
            rows={3}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="has_rules"
            name="has_rules"
            checked={formData.has_rules}
            onChange={handleChange}
            className="w-4 h-4"
          />
          <label htmlFor="has_rules" className="text-sm">
            Rules loaded
          </label>
        </div>

        <div className="flex gap-2 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="primary flex-1"
          >
            {loading ? 'Saving...' : 'Save Product'}
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
