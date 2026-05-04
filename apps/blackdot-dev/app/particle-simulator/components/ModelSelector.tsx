'use client';

import React from 'react';
import { DRONE_MODELS } from './DroneLoader';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelPath: string) => void;
  modelType?: 'drone' | 'plane' | 'custom';
  className?: string;
}

/**
 * ModelSelector - UI component for selecting 3D models
 * 
 * Follows MeshSDF Infrastructure gold standard:
 * - Lists available models from DRONE_MODELS constant
 * - Provides model selection dropdown
 * - Supports different model types (drone, plane, custom)
 */
export function ModelSelector({
  selectedModel,
  onModelChange,
  modelType = 'drone',
  className = '',
}: ModelSelectorProps) {
  const availableModels = modelType === 'drone' ? DRONE_MODELS : [];

  if (availableModels.length === 0) {
    return (
      <div className={`text-sm text-muted-foreground ${className}`}>
        No models available for this type
      </div>
    );
  }

  return (
    <div className={className}>
      <label className="text-sm font-medium block mb-2 text-card-foreground">
        {modelType === 'drone' ? 'Drone Model' : 'Model'}
      </label>
      <select
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value)}
        className="w-full bg-input border border-border rounded px-3 py-2 text-foreground text-sm"
      >
        {availableModels.map((model) => (
          <option key={model.path} value={model.path}>
            {model.name}
          </option>
        ))}
      </select>
      {availableModels.find((m) => m.path === selectedModel)?.description && (
        <p className="text-xs text-muted-foreground mt-1">
          {availableModels.find((m) => m.path === selectedModel)?.description}
        </p>
      )}
    </div>
  );
}


