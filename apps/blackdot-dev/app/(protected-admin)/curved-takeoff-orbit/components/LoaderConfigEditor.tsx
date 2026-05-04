/**
 * Loader Configuration Editor
 *
 * Schema-driven UI for configuring the central loader element.
 * Mirrors the V3 configuration editor design.
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { ChevronDown, ChevronRight, Download, Upload } from 'lucide-react';
import type { LoaderConfig } from '../config/loader.schema';
import { DEFAULT_LOADER_CONFIG, LOADER_PRESETS } from '../config/loader.schema';

interface LoaderConfigEditorProps {
  config: LoaderConfig;
  onConfigChange: (config: LoaderConfig) => void;
}

export function LoaderConfigEditor({ config, onConfigChange }: LoaderConfigEditorProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    loader: true,
    transform: true,
    material: false,
  });

  const toggleSection = useCallback((section: 'loader' | 'transform' | 'material') => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  // Export config as JSON
  const handleExport = useCallback(() => {
    const json = JSON.stringify(config, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `loader-config-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [config]);

  // Import config from JSON
  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string);
          onConfigChange({ ...DEFAULT_LOADER_CONFIG, ...imported });
        } catch (error) {
          console.error('Failed to import config:', error);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [onConfigChange]);

  // Apply preset
  const applyPreset = useCallback(
    (preset: LoaderConfig) => {
      onConfigChange(preset);
    },
    [onConfigChange]
  );

  return (
    <div className="fixed top-4 left-4 z-50 w-96 max-h-[calc(100vh-2rem)] overflow-y-auto">
      {/* Header */}
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-t-lg p-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            )}
            <h2 className="text-white font-semibold">Loader Configuration</h2>
          </div>
        </button>
      </div>

      {isExpanded && (
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 border-t-0 rounded-b-lg p-4 space-y-4">
          {/* Presets */}
          <div className="space-y-2">
            <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Presets
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(LOADER_PRESETS).map(([name, preset]) => (
                <button
                  key={name}
                  onClick={() => applyPreset(preset)}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] rounded border border-slate-700 transition-colors capitalize"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Import/Export */}
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex-1 flex items-center justify-center gap-2 px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] rounded border border-slate-700 transition-colors"
            >
              <Download className="w-3 h-3" />
              Export
            </button>
            <button
              onClick={handleImport}
              className="flex-1 flex items-center justify-center gap-2 px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] rounded border border-slate-700 transition-colors"
            >
              <Upload className="w-3 h-3" />
              Import
            </button>
          </div>

          {/* Loader Selection */}
          <ConfigSection
            title="Loader Selection"
            isExpanded={expandedSections.loader}
            onToggle={() => toggleSection('loader')}
          >
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-[10px] font-medium text-slate-400 uppercase">Type</label>
                <select
                  value={config.loaderType}
                  onChange={(e) =>
                    onConfigChange({
                      ...config,
                      loaderType: e.target.value as any,
                    })
                  }
                  className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-slate-200 text-[11px] hover:border-slate-600 transition-colors"
                >
                  {[
                    'Item1',
                    'Item2',
                    'Item3',
                    'Item4',
                    'Item5',
                    'Item6',
                    'Item7',
                    'Item8',
                    'Item9',
                    'Item10',
                    'Item11',
                    'Item12',
                  ].map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.lightResponsive}
                  onChange={(e) =>
                    onConfigChange({
                      ...config,
                      lightResponsive: e.target.checked,
                    })
                  }
                  className="w-3 h-3 rounded border-slate-600 accent-blue-500"
                />
                <span>Light Responsive</span>
              </label>
            </div>
          </ConfigSection>

          {/* Transform */}
          <ConfigSection
            title="Transform"
            isExpanded={expandedSections.transform}
            onToggle={() => toggleSection('transform')}
          >
            <div className="space-y-3">
              <SliderControl
                label="Scale"
                value={config.scale}
                min={0.1}
                max={3.0}
                step={0.1}
                onChange={(scale) => onConfigChange({ ...config, scale })}
              />

              <SliderControl
                label="Position Y (Height)"
                value={config.positionY}
                min={-50}
                max={50}
                step={1}
                onChange={(positionY) => onConfigChange({ ...config, positionY })}
              />

              <label className="flex items-center gap-2 text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.visible}
                  onChange={(e) =>
                    onConfigChange({
                      ...config,
                      visible: e.target.checked,
                    })
                  }
                  className="w-3 h-3 rounded border-slate-600 accent-blue-500"
                />
                <span>Visible</span>
              </label>
            </div>
          </ConfigSection>

          {/* Material Settings */}
          {config.lightResponsive && config.materialSettings && (
            <ConfigSection
              title="Material Settings"
              isExpanded={expandedSections.material}
              onToggle={() => toggleSection('material')}
            >
              <div className="space-y-3">
                <SliderControl
                  label="Metalness"
                  value={config.materialSettings.metalness}
                  min={0}
                  max={1}
                  step={0.05}
                  onChange={(metalness) =>
                    onConfigChange({
                      ...config,
                      materialSettings: {
                        ...config.materialSettings!,
                        metalness,
                      },
                    })
                  }
                />

                <SliderControl
                  label="Roughness"
                  value={config.materialSettings.roughness}
                  min={0}
                  max={1}
                  step={0.05}
                  onChange={(roughness) =>
                    onConfigChange({
                      ...config,
                      materialSettings: {
                        ...config.materialSettings!,
                        roughness,
                      },
                    })
                  }
                />

                <SliderControl
                  label="Emissive Intensity"
                  value={config.materialSettings.emissiveIntensity}
                  min={0}
                  max={2}
                  step={0.1}
                  onChange={(emissiveIntensity) =>
                    onConfigChange({
                      ...config,
                      materialSettings: {
                        ...config.materialSettings!,
                        emissiveIntensity,
                      },
                    })
                  }
                />
              </div>
            </ConfigSection>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// COMPONENTS
// ============================================================================

interface ConfigSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function ConfigSection({ title, isExpanded, onToggle, children }: ConfigSectionProps) {
  return (
    <div className="space-y-2">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-2 py-1.5 bg-slate-800/50 hover:bg-slate-800/70 rounded border border-slate-700 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="w-3 h-3 text-slate-400" />
          ) : (
            <ChevronRight className="w-3 h-3 text-slate-400" />
          )}
          <h3 className="text-white text-[11px] font-semibold">{title}</h3>
        </div>
      </button>

      {isExpanded && (
        <div className="pl-3 pr-2 space-y-2 border-l border-slate-700">
          {children}
        </div>
      )}
    </div>
  );
}

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

function SliderControl({ label, value, min, max, step, onChange }: SliderControlProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-medium text-slate-400 uppercase">
          {label}
        </label>
        <span className="text-[10px] text-slate-500">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
      />
    </div>
  );
}
