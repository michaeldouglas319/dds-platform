'use client';

import { Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ProductDefinition } from '../../types';

interface ProductSelectorProps {
  products: ProductDefinition[];
  selectedProductId?: string;
  onProductSelect: (productId: string) => void;
  layout?: 'grid' | 'buttons';
}

/**
 * ProductSelector component for selecting products in the configurator
 *
 * Supports two layouts:
 * - buttons: Grid of button selectors (compact, ideal for control panels)
 * - grid: Card-based grid with product details (detailed, ideal for libraries)
 */
export function ProductSelector({
  products,
  selectedProductId,
  onProductSelect,
  layout = 'buttons',
}: ProductSelectorProps) {
  if (layout === 'buttons') {
    return (
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Select Product</p>
        <div className="grid grid-cols-2 gap-2">
          {products.map((product) => (
            <Button
              key={product.id}
              variant={selectedProductId === product.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => onProductSelect(product.id)}
              className="h-auto flex flex-col items-start p-3 gap-1"
            >
              <span className="font-semibold text-left">{product.name}</span>
              {product.category && (
                <Badge variant="secondary" className="text-[10px]">
                  {product.category}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  // Grid layout with cards
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold">Product Library</p>
      <div className="grid grid-cols-1 gap-3">
        {products.map((product) => (
          <Card
            key={product.id}
            className={cn(
              'cursor-pointer transition-all hover:shadow-lg p-4',
              selectedProductId === product.id && 'ring-2 ring-primary'
            )}
            onClick={() => onProductSelect(product.id)}
          >
            <div className="flex items-start gap-3">
              {/* Product thumbnail placeholder */}
              <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center shrink-0">
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm">{product.name}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {product.description}
                </p>
                {product.category && (
                  <Badge variant="secondary" className="mt-2 text-[10px]">
                    {product.category}
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
