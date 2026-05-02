'use client';

interface Product {
  id: string;
  domain: string;
  app_name: string;
  name: string;
  description: string | null;
  has_rules: boolean;
  is_active: boolean;
  created_at: string;
}

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onRefresh: () => void;
}

export default function ProductList({ products, onEdit, onRefresh }: ProductListProps) {
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;

    try {
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error deleting product');
    }
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p>No products yet. Run `/api/discover-domains` to scan Vercel projects.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {products.map(product => (
        <div
          key={product.id}
          className="bg-slate-900 border border-slate-800 rounded-lg p-4 hover:border-slate-700 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">{product.name || product.domain}</h3>
                {product.has_rules && (
                  <span className="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded">
                    ✓ Rules
                  </span>
                )}
                {!product.is_active && (
                  <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded">
                    Inactive
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-sm mt-1">
                {product.app_name} ({product.domain})
              </p>
              {product.description && (
                <p className="text-slate-500 text-sm mt-2">{product.description}</p>
              )}
              <p className="text-slate-600 text-xs mt-2">
                Created {new Date(product.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => onEdit(product)}
                className="secondary text-sm px-3 py-1"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                className="danger text-sm px-3 py-1"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
