/**
 * Scene Tweaks Editor
 *
 * Controls for scene lighting, background, particles, and post-processing.
 * Works alongside LoaderConfigEditor and V3ConfigEditor.
 */

'use client';

import { useState, useCallback } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface SceneTweaksEditorProps {
  // Lighting controls
  backgroundColor: string;
  onBackgroundColorChange: (color: string) => void;
  ambientIntensity: number;
  onAmbientIntensityChange: (intensity: number) => void;
  directionalIntensity: number;
  onDirectionalIntensityChange: (intensity: number) => void;

  // Particle controls
  particleCount: number;
  onParticleCountChange: (count: number) => void;
  particleColorMode: 'rainbow' | 'gradient' | 'solid' | 'thermal';
  onParticleColorModeChange: (mode: 'rainbow' | 'gradient' | 'solid' | 'thermal') => void;

  // Post-processing controls
  bloomIntensity: number;
  onBloomIntensityChange: (intensity: number) => void;
  saturation: number;
  onSaturationChange: (saturation: number) => void;
  brightness: number;
  onBrightnessChange: (brightness: number) => void;
}

export function SceneTweaksEditor({
  backgroundColor,
  onBackgroundColorChange,
  ambientIntensity,
  onAmbientIntensityChange,
  directionalIntensity,
  onDirectionalIntensityChange,
  particleCount,
  onParticleCountChange,
  particleColorMode,
  onParticleColorModeChange,
  bloomIntensity,
  onBloomIntensityChange,
  saturation,
  onSaturationChange,
  brightness,
  onBrightnessChange,
}: SceneTweaksEditorProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    lighting: true,
    particles: false,
    postProcessing: false,
  });

  const toggleSection = useCallback((section: 'lighting' | 'particles' | 'postProcessing') => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  return (
    <div className="fixed bottom-4 left-4 z-50 w-80 max-h-[calc(100vh-2rem)] overflow-y-auto">
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
            <h2 className="text-white font-semibold">Scene Tweaks</h2>
          </div>
        </button>
      </div>

      {isExpanded && (
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 border-t-0 rounded-b-lg p-4 space-y-4">
          {/* Lighting Panel */}
          <ConfigSection
            title="Lighting"
            isExpanded={expandedSections.lighting}
            onToggle={() => toggleSection('lighting')}
          >
            <div className="space-y-3">
              {/* Background Color */}
              <div className="space-y-2">
                <label className="text-[10px] font-medium text-slate-400 uppercase">
                  Background Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => onBackgroundColorChange(e.target.value)}
                    className="w-12 h-8 rounded border border-slate-700 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => onBackgroundColorChange(e.target.value)}
                    className="flex-1 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-slate-200 text-[10px]"
                  />
                </div>
              </div>

              {/* Ambient Intensity */}
              <SliderControl
                label="Ambient Intensity"
                value={ambientIntensity}
                min={0}
                max={1}
                step={0.05}
                onChange={onAmbientIntensityChange}
              />

              {/* Directional Intensity */}
              <SliderControl
                label="Directional Intensity"
                value={directionalIntensity}
                min={0}
                max={2}
                step={0.1}
                onChange={onDirectionalIntensityChange}
              />
            </div>
          </ConfigSection>

          {/* Particle Visual Panel */}
          <ConfigSection
            title="Particle Visual"
            isExpanded={expandedSections.particles}
            onToggle={() => toggleSection('particles')}
          >
            <div className="space-y-3">
              {/* Particle Count */}
              <SliderControl
                label="Particle Count"
                value={particleCount}
                min={6}
                max={500}
                step={1}
                onChange={onParticleCountChange}
              />

              {/* Color Mode */}
              <div className="space-y-2">
                <label className="text-[10px] font-medium text-slate-400 uppercase">
                  Color Mode
                </label>
                <select
                  value={particleColorMode}
                  onChange={(e) =>
                    onParticleColorModeChange(
                      e.target.value as 'rainbow' | 'gradient' | 'solid' | 'thermal'
                    )
                  }
                  className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-slate-200 text-[10px] hover:border-slate-600 transition-colors"
                >
                  <option value="rainbow">Rainbow</option>
                  <option value="gradient">Gradient</option>
                  <option value="solid">Solid</option>
                  <option value="thermal">Thermal</option>
                </select>
              </div>
            </div>
          </ConfigSection>

          {/* Post-Processing Panel */}
          <ConfigSection
            title="Post-Processing"
            isExpanded={expandedSections.postProcessing}
            onToggle={() => toggleSection('postProcessing')}
          >
            <div className="space-y-3">
              {/* Bloom Intensity */}
              <SliderControl
                label="Bloom Intensity"
                value={bloomIntensity}
                min={0}
                max={3}
                step={0.1}
                onChange={onBloomIntensityChange}
              />

              {/* Saturation */}
              <SliderControl
                label="Saturation"
                value={saturation}
                min={0}
                max={2}
                step={0.05}
                onChange={onSaturationChange}
              />

              {/* Brightness */}
              <SliderControl
                label="Brightness"
                value={brightness}
                min={0}
                max={2}
                step={0.05}
                onChange={onBrightnessChange}
              />
            </div>
          </ConfigSection>
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
