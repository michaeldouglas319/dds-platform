/**
 * Data Grid Component
 *
 * Responsive table for displaying structured data with sorting and filtering support.
 * Designed for dashboard use with clean styling.
 *
 * @category dashboard
 * @layer 2
 * @example
 * ```tsx
 * <DataGrid
 *   columns={[
 *     { key: 'name', label: 'Name', width: '30%' },
 *     { key: 'value', label: 'Value', width: '70%' }
 *   ]}
 *   data={[
 *     { name: 'Vertices', value: '1,234' },
 *     { name: 'Triangles', value: '2,456' }
 *   ]}
 * />
 * ```
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DataGridColumn {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataGridProps {
  columns: DataGridColumn[];
  data: Record<string, any>[];
  variant?: 'default' | 'striped' | 'bordered';
  className?: string;
}

export function DataGrid({
  columns,
  data,
  variant = 'default',
  className
}: DataGridProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              {columns.map(col => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={cn(
                    'px-4 py-2 font-medium text-left',
                    col.align === 'center' && 'text-center',
                    col.align === 'right' && 'text-right'
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">
                  No data available
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={idx}
                  className={cn(
                    'border-b transition-colors hover:bg-muted/50',
                    variant === 'striped' && idx % 2 === 0 && 'bg-muted/30',
                    variant === 'bordered' && 'border-x'
                  )}
                >
                  {columns.map(col => (
                    <td
                      key={`${idx}-${col.key}`}
                      style={{ width: col.width }}
                      className={cn(
                        'px-4 py-2 text-xs',
                        col.align === 'center' && 'text-center',
                        col.align === 'right' && 'text-right'
                      )}
                    >
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
