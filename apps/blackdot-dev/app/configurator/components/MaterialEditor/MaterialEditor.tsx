'use client';

import { RotateCcw } from 'lucide-react';
import { PropertyPanel, PropertySection } from '@/components/editor';
import { PropertyInput } from '@/components/editor';
import { Button } from '@/components/ui/button';
import type { MaterialConfig } from '../../types';

interface MaterialEditorProps {
  partName: string;
  partLabel: string;
  material: MaterialConfig;
  onMaterialChange: (partName: string, material: MaterialConfig) => void;
  onReset?: (partName: string) => void;
}

/**
 * MaterialEditor component for customizing part materials
 *
 * Allows editing:
 * - Base color (via color picker)
 * - Metalness (0-1 range slider)
 * - Roughness (0-1 range slider)
 * - Reset to defaults
 */
export function MaterialEditor({
  partName,
  partLabel,
  material,
  onMaterialChange,
  onReset,
}: MaterialEditorProps) {
  const handleChange = (property: keyof MaterialConfig, value: string | number) => {
    onMaterialChange(partName, {
      ...material,
      [property]: value,
    });
  };

  return (
    <PropertyPanel title={partLabel}>
      <PropertySection title="Color">
        <PropertyInput
          label="Base Color"
          type="color"
          value={material.defaultColor}
          onChange={(value) => handleChange('defaultColor', value as string)}
        />
      </PropertySection>

      <PropertySection title="Material Properties">
        <PropertyInput
          label="Metalness"
          type="range"
          value={material.metalness}
          min={0}
          max={1}
          step={0.01}
          onChange={(value) => handleChange('metalness', value as number)}
        />

        <PropertyInput
          label="Roughness"
          type="range"
          value={material.roughness}
          min={0}
          max={1}
          step={0.01}
          onChange={(value) => handleChange('roughness', value as number)}
        />
      </PropertySection>

      {onReset && (
        <PropertySection title="Actions">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onReset(partName)}
            className="w-full justify-start gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Default
          </Button>
        </PropertySection>
      )}
    </PropertyPanel>
  );
}
