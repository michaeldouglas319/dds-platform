'use client';

/**
 * Showcase Component Table
 *
 * Displays a searchable, sortable table of components.
 */

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ComponentMetadata } from '@/lib/registry/types';
import { ChevronRight } from 'lucide-react';

interface ShowcaseTableProps {
  components: ComponentMetadata[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ShowcaseTable({ components, selectedId, onSelect }: ShowcaseTableProps) {
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Category</th>
              <th className="px-4 py-3 text-left font-medium">Layer</th>
              <th className="px-4 py-3 text-left font-medium">3D Type</th>
              <th className="px-4 py-3 text-left font-medium">Exports</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {components.map(component => (
              <tr
                key={component.id}
                className={`border-b transition-colors ${
                  selectedId === component.id ? 'bg-primary/5' : 'hover:bg-muted/50'
                }`}
              >
                <td className="px-4 py-3">
                  <div className="font-medium">{component.name}</div>
                  <div className="text-xs text-muted-foreground">{component.id}</div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="secondary" className="capitalize">
                    {component.category}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {component.layer ? (
                    <Badge variant="outline">L{component.layer}</Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {component.subcategory ? (
                    <Badge variant="outline" className="text-xs capitalize">
                      {component.subcategory}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-muted-foreground">{component.exports.length}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelect(component.id)}
                    className="gap-1"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
