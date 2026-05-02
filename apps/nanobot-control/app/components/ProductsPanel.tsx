'use client';

import { useState, useEffect } from 'react';
import ProductForm from './ProductForm';
import ProductList from './ProductList';

interface Product {
  id: string;
  domain: string;
  app_name: string;
  name: string;
  description: string | null;
  has_rules: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function ProductsPanel({ onRefresh }: { onRefresh: () => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleProductSaved = () => {
    fetchProducts();
    setShowForm(false);
    setSelectedProduct(null);
    onRefresh();
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedProduct(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Products ({products.length})</h2>
          <p className="text-slate-400 text-sm">Discovered from Vercel projects</p>
        </div>
        <button
          onClick={() => {
            setSelectedProduct(null);
            setShowForm(!showForm);
          }}
          className="primary"
        >
          {showForm ? '✕ Cancel' : '+ New Product'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <ProductForm
          product={selectedProduct}
          onSaved={handleProductSaved}
          onCancel={handleCloseForm}
        />
      )}

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-900/20 border border-red-800 rounded text-red-300">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="p-8 text-center text-slate-400">
          Loading products...
        </div>
      )}

      {/* List */}
      {!loading && !showForm && (
        <ProductList
          products={products}
          onEdit={handleEdit}
          onRefresh={fetchProducts}
        />
      )}
    </div>
  );
}
