'use client';

import { Eye, EyeOff } from 'lucide-react';
import { PropertyPanel, PropertySection } from '@/components/editor';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PartDefinition } from '../../types';

interface PartVisibilityControlsProps {
  parts: PartDefinition[];
  visibility: Record<string, boolean>;
  onVisibilityChange: (partName: string, visible: boolean) => void;
  onToggleAll?: (visible: boolean) => void;
}

/**
 * PartVisibilityControls component for toggling part visibility
 *
 * Features:
 * - Individual part visibility toggles
 * - Show All / Hide All quick actions
 * - Visual feedback for visibility state
 */
export function PartVisibilityControls({
  parts,
  visibility,
  onVisibilityChange,
  onToggleAll,
}: PartVisibilityControlsProps) {
  const allVisible = parts.every((part) => visibility[part.name] !== false);
  const someVisible = parts.some((part) => visibility[part.name] !== false);

  return (
    <PropertyPanel title="Part Visibility">
      {onToggleAll && (
        <PropertySection title="Quick Actions">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleAll(true)}
              disabled={allVisible}
            >
              Show All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleAll(false)}
              disabled={!someVisible}
            >
              Hide All
            </Button>
          </div>
        </PropertySection>
      )}

      <PropertySection title="Individual Parts">
        <div className="space-y-2">
          {parts.map((part) => {
            const isVisible = visibility[part.name] ?? part.visible;

            return (
              <Button
                key={part.name}
                variant={isVisible ? 'default' : 'outline'}
                size="sm"
                onClick={() => onVisibilityChange(part.name, !isVisible)}
                className="w-full justify-start gap-2"
              >
                {isVisible ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4 opacity-50" />
                )}
                {part.label}
              </Button>
            );
          })}
        </div>
      </PropertySection>
    </PropertyPanel>
  );
}
