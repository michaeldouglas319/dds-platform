'use client';

import { useState } from 'react';
import type { ArcStyle, DebugSettings } from './PoimandresScene';

const ARC_STYLES: ArcStyle[] = ['solid', 'gradient', 'pulse', 'noise'];

type Props = {
  settings: DebugSettings;
  onChange: (settings: DebugSettings) => void;
  onReset: () => void;
  eventCount: number;
};

/**
 * Floating debug panel — live controls for the globe's visual parameters.
 * Every slider updates PoimandresScene in real time via the parent's state.
 */
export default function DebugPanel({
  settings,
  onChange,
  onReset,
  eventCount,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);

  const update = <K extends keyof DebugSettings>(
    key: K,
    value: DebugSettings[K],
  ) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 20,
        background: 'rgba(12, 12, 14, 0.88)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '10px',
        color: '#e6e6e6',
        fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
        fontSize: '11px',
        padding: collapsed ? '0.5rem 0.75rem' : '0.85rem 1rem',
        minWidth: collapsed ? 'auto' : '260px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          marginBottom: collapsed ? 0 : '0.75rem',
        }}
      >
        <strong style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Globe Debug
        </strong>
        <span style={{ opacity: 0.5 }}>{eventCount} pts</span>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#e6e6e6',
            borderRadius: '4px',
            padding: '2px 6px',
            cursor: 'pointer',
            font: 'inherit',
          }}
        >
          {collapsed ? '▸' : '▾'}
        </button>
      </div>

      {!collapsed && (
        <>
          <Section label="Points">
            <Slider
              label="base size"
              min={0.02}
              max={0.3}
              step={0.01}
              value={settings.pointBaseSize}
              onChange={(v) => update('pointBaseSize', v)}
            />
            <Slider
              label="weight scale"
              min={0}
              max={0.4}
              step={0.01}
              value={settings.pointWeightScale}
              onChange={(v) => update('pointWeightScale', v)}
            />
            <Color
              label="color"
              value={settings.pointColor}
              onChange={(v) => update('pointColor', v)}
            />
          </Section>

          <Section label="Halos">
            <Toggle
              label="show halos"
              value={settings.showHalos}
              onChange={(v) => update('showHalos', v)}
            />
            <Slider
              label="opacity"
              min={0}
              max={1}
              step={0.05}
              value={settings.haloOpacity}
              onChange={(v) => update('haloOpacity', v)}
            />
            <Color
              label="color"
              value={settings.haloColor}
              onChange={(v) => update('haloColor', v)}
            />
          </Section>

          <Section label="Arcs">
            <Toggle
              label="show arcs"
              value={settings.showArcs}
              onChange={(v) => update('showArcs', v)}
            />
            <label
              style={{
                display: 'grid',
                gridTemplateColumns: '80px 1fr',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span style={{ opacity: 0.7 }}>style</span>
              <select
                value={settings.arcStyle}
                onChange={(e) =>
                  update('arcStyle', e.target.value as ArcStyle)
                }
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  color: '#e6e6e6',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 4,
                  padding: '2px 4px',
                  font: 'inherit',
                }}
              >
                {ARC_STYLES.map((s) => (
                  <option key={s} value={s} style={{ color: '#0a0a0a' }}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <Slider
              label="k neighbors"
              min={0}
              max={16}
              step={1}
              value={settings.arcK}
              onChange={(v) => update('arcK', v)}
            />
            <Slider
              label="lift"
              min={0}
              max={1.5}
              step={0.01}
              value={settings.arcLift}
              onChange={(v) => update('arcLift', v)}
            />
            <Slider
              label="opacity"
              min={0}
              max={1}
              step={0.05}
              value={settings.arcOpacity}
              onChange={(v) => update('arcOpacity', v)}
            />
            <Color
              label="color"
              value={settings.arcColor}
              onChange={(v) => update('arcColor', v)}
            />
          </Section>

          <Section label="Globe">
            <Slider
              label="rotation speed"
              min={0}
              max={3}
              step={0.05}
              value={settings.globeRotationSpeed}
              onChange={(v) => update('globeRotationSpeed', v)}
            />
          </Section>

          <button
            type="button"
            onClick={onReset}
            style={{
              marginTop: '0.5rem',
              width: '100%',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#e6e6e6',
              padding: '0.45rem',
              borderRadius: '6px',
              cursor: 'pointer',
              font: 'inherit',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            reset
          </button>
        </>
      )}
    </div>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <div
        style={{
          opacity: 0.45,
          fontSize: '10px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: '0.35rem',
        }}
      >
        {label}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {children}
      </div>
    </div>
  );
}

function Slider({
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label
      style={{
        display: 'grid',
        gridTemplateColumns: '80px 1fr 44px',
        alignItems: 'center',
        gap: '0.5rem',
      }}
    >
      <span style={{ opacity: 0.7 }}>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: '100%' }}
      />
      <span
        style={{
          opacity: 0.6,
          fontVariantNumeric: 'tabular-nums',
          textAlign: 'right',
        }}
      >
        {value.toFixed(step < 0.01 ? 3 : 2)}
      </span>
    </label>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        cursor: 'pointer',
      }}
    >
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span style={{ opacity: 0.7 }}>{label}</span>
    </label>
  );
}

function Color({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label
      style={{
        display: 'grid',
        gridTemplateColumns: '80px 1fr',
        alignItems: 'center',
        gap: '0.5rem',
      }}
    >
      <span style={{ opacity: 0.7 }}>{label}</span>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          height: '22px',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '4px',
          background: 'transparent',
          cursor: 'pointer',
        }}
      />
    </label>
  );
}
