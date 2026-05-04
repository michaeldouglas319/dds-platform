'use client';

import {
  PropertyPanel,
  PropertySection,
  PropertyInput,
} from '@/components/editor';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface ParticleControlsProps {
  enabled: boolean;
  toggle: () => void;
  particleCount: number;
  setParticleCount: (count: number) => void;
  handBounceRatio: number;
  setHandBounceRatio: (ratio: number) => void;
  handForce: number;
  setHandForce: (force: number) => void;
  gravity: number;
  setGravity: (gravity: number) => void;
  reset: () => void;
}

export function ParticleControls({
  enabled,
  toggle,
  particleCount,
  setParticleCount,
  handBounceRatio,
  setHandBounceRatio,
  handForce,
  setHandForce,
  gravity,
  setGravity,
  reset,
}: ParticleControlsProps) {
  const particleOptions = [
    { label: '16K', value: 16384 },
    { label: '32K', value: 32768 },
    { label: '65K', value: 65536 },
    { label: '128K', value: 131072 },
  ];

  return (
    <PropertyPanel title="Particle Interaction (Phase 3)" onApply={() => {}}>
      {/* Enable/Disable */}
      <PropertySection title="Feature Status">
        <Button
          variant={enabled ? 'default' : 'outline'}
          size="sm"
          onClick={toggle}
          className="w-full justify-start gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Particles: {enabled ? 'ENABLED' : 'DISABLED'}
        </Button>
      </PropertySection>

      {/* Settings (only show when enabled) */}
      {enabled && (
        <>
          {/* Particle Count */}
          <PropertySection title="Particle Count">
            <div className="grid grid-cols-2 gap-2">
              {particleOptions.map((opt) => (
                <Button
                  key={opt.value}
                  variant={particleCount === opt.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setParticleCount(opt.value)}
                  className="text-xs"
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </PropertySection>

          {/* Physics Parameters */}
          <PropertySection title="Physics">
            <div className="space-y-4">
              <PropertyInput
                label="Bounce Ratio"
                type="range"
                value={handBounceRatio}
                min={0}
                max={1}
                step={0.01}
                onChange={(value) => setHandBounceRatio(typeof value === 'number' ? value : parseFloat(value))}
              />
              <PropertyInput
                label="Hand Force"
                type="range"
                value={handForce}
                min={0}
                max={0.1}
                step={0.001}
                onChange={(value) => setHandForce(typeof value === 'number' ? value : parseFloat(value))}
              />
              <PropertyInput
                label="Gravity (cascade strength)"
                type="range"
                value={gravity}
                min={0}
                max={50}
                step={0.5}
                onChange={(value) => setGravity(typeof value === 'number' ? value : parseFloat(value))}
              />
            </div>
          </PropertySection>

          {/* Reset */}
          <PropertySection title="Actions">
            <Button
              variant="outline"
              size="sm"
              onClick={reset}
              className="w-full justify-start gap-2 text-xs"
            >
              Reset to Defaults
            </Button>
          </PropertySection>

          {/* Info */}
          <PropertySection title="How It Works">
            <div className="text-xs text-slate-400 space-y-2">
              <p>🖱️ <strong>Move Mouse:</strong> Control hand position</p>
              <p>🖱️ <strong>Click & Hold:</strong> Grip hand</p>
              <p>GPU-accelerated SDF collision physics</p>
              <p>Particles respawn when lifespan expires</p>
            </div>
          </PropertySection>
        </>
      )}
    </PropertyPanel>
  );
}
