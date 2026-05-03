'use client';

import { useState, useEffect } from 'react';
import { GradientMeshScene } from '@dds/renderer';
import { Button } from '@dds/ui';

const THEMES = [
  { name: 'minimal', label: 'Minimal' },
  { name: 'vibrant', label: 'Vibrant' },
  { name: 'neon', label: 'Neon' },
  { name: 'arctic', label: 'Arctic' },
  { name: 'sunset', label: 'Sunset' },
  { name: 'forest', label: 'Forest' },
  { name: 'midnight', label: 'Midnight' },
  { name: 'mist', label: 'Mist' },
  { name: 'monochrome', label: 'Monochrome' },
];

export default function DemoPage() {
  const [currentTheme, setCurrentTheme] = useState('minimal');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Set initial theme
    document.documentElement.setAttribute('data-theme-variant', currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>GradientMeshScene Demo</h1>
      <p>Test Three.js scene with token bridge integration</p>

      {/* Theme Switcher */}
      <section
        style={{
          marginTop: '2rem',
          padding: '1rem',
          border: '1px solid #ccc',
          borderRadius: '8px',
        }}
      >
        <h2>Theme Variants</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: '0.5rem',
          }}
        >
          {THEMES.map((theme) => (
            <Button
              key={theme.name}
              variant={currentTheme === theme.name ? 'default' : 'outline'}
              onClick={() => setCurrentTheme(theme.name)}
              data-testid={`theme-button-${theme.name}`}
            >
              {theme.label}
            </Button>
          ))}
        </div>
        <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>
          Current theme: <strong data-testid="current-theme">{currentTheme}</strong>
        </p>
      </section>

      {/* Reduced Motion Info */}
      <section
        style={{
          marginTop: '2rem',
          padding: '1rem',
          border: '1px solid #ccc',
          borderRadius: '8px',
          backgroundColor: prefersReducedMotion ? '#fff3cd' : '#e7f3ff',
        }}
      >
        <h2>Accessibility</h2>
        <p>
          <strong data-testid="reduced-motion-status">
            {prefersReducedMotion ? '⏸️ Reduced Motion Active' : '▶️ Animation Enabled'}
          </strong>
        </p>
        <p style={{ fontSize: '0.875rem', color: '#666' }}>
          {prefersReducedMotion
            ? 'Animation is paused per your system preferences'
            : 'Animation is running. Scene respects prefers-reduced-motion'}
        </p>
      </section>

      {/* Scene Container */}
      <section
        style={{
          marginTop: '2rem',
          padding: '1rem',
          border: '1px solid #ccc',
          borderRadius: '8px',
        }}
      >
        <h2>Gradient Mesh Scene</h2>
        <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1rem' }}>
          Canvas height: 400px. Try switching themes to see colors update in real-time.
        </p>
        <div
          data-testid="scene-container"
          style={{
            border: '2px solid #ddd',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: '#f5f5f5',
          }}
        >
          <GradientMeshScene height={400} speed={1} data-testid="gradient-mesh-scene" />
        </div>
      </section>

      {/* Responsive Test Section */}
      <section
        style={{
          marginTop: '2rem',
          padding: '1rem',
          border: '1px solid #ccc',
          borderRadius: '8px',
        }}
      >
        <h2>Responsive Resize Test</h2>
        <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1rem' }}>
          Resize your browser window to test canvas responsiveness.
        </p>
        <div
          data-testid="responsive-scene-container"
          style={{
            border: '2px solid #ddd',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: '#f5f5f5',
            height: '300px',
          }}
        >
          <GradientMeshScene height="100%" speed={0.8} />
        </div>
      </section>
    </main>
  );
}
