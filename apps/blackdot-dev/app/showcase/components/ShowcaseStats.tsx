'use client';

/**
 * Showcase Statistics Display
 *
 * Shows summary statistics about the component registry.
 */

import React from 'react';
import { Card } from '@/components/ui/card';
import type { ComponentRegistry } from '@/lib/registry/types';

interface ShowcaseStatsProps {
  stats: ComponentRegistry['stats'];
}

export function ShowcaseStats({ stats }: ShowcaseStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
      {/* Category Stats */}
      {Object.entries(stats.countByCategory).map(([category, count]) => (
        count > 0 && (
          <Card key={category} className="p-3">
            <div className="text-xs font-medium text-muted-foreground capitalize">{category}</div>
            <div className="text-xl font-bold mt-1">{count}</div>
          </Card>
        )
      ))}

      {/* Layer Stats */}
      {Object.entries(stats.countByLayer).map(([layer, count]) => (
        count > 0 && layer !== 'none' && (
          <Card key={`layer-${layer}`} className="p-3">
            <div className="text-xs font-medium text-muted-foreground">Layer {layer}</div>
            <div className="text-xl font-bold mt-1">{count}</div>
          </Card>
        )
      ))}

      {/* 3D Subcategories */}
      {Object.entries(stats.countBySubcategory).map(([subcat, count]) => (
        count > 0 && (
          <Card key={`subcat-${subcat}`} className="p-3">
            <div className="text-xs font-medium text-muted-foreground capitalize">{subcat}</div>
            <div className="text-xl font-bold mt-1">{count}</div>
          </Card>
        )
      ))}
    </div>
  );
}
