/**
 * Property Panel Component
 *
 * Container for editing object properties with organized sections.
 * Supports collapsible groups and various input types.
 *
 * @category editor
 * @layer 2
 * @example
 * ```tsx
 * <PropertyPanel title="Model Properties">
 *   <PropertySection title="Transform">
 *     <PropertyInput label="Position X" type="number" />
 *   </PropertySection>
 * </PropertyPanel>
 * ```
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PropertySectionProps {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function PropertySection({ title, description, defaultOpen = true, children }: PropertySectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="text-left">
          <div className="font-medium text-sm">{title}</div>
          {description && <div className="text-xs text-muted-foreground">{description}</div>}
        </div>
        <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="px-4 py-3 bg-muted/30 space-y-3 border-t">
          {children}
        </div>
      )}
    </div>
  );
}

interface PropertyPanelProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  onReset?: () => void;
  onApply?: () => void;
  className?: string;
}

export function PropertyPanel({
  title,
  description,
  children,
  onReset,
  onApply,
  className
}: PropertyPanelProps) {
  return (
    <Card className={cn('h-full flex flex-col', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto">
        <div className="divide-y">
          {children}
        </div>
      </CardContent>

      {(onReset || onApply) && (
        <div className="border-t p-4 flex gap-2">
          {onReset && (
            <Button variant="outline" size="sm" onClick={onReset} className="flex-1">
              Reset
            </Button>
          )}
          {onApply && (
            <Button size="sm" onClick={onApply} className="flex-1">
              Apply
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
