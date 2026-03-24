'use client';

import { SectionRenderer } from '@dds/renderer';
import type { UniversalSection } from '@dds/renderer';

/* ─── Sample section data for each renderer type ─────────────────── */

function makeSection(
  id: string,
  layout: string,
  variant: string | undefined,
  overrides: Partial<UniversalSection> = {},
): UniversalSection {
  return {
    id: `${id}-${variant ?? 'default'}`,
    type: 'section',
    display: { layout, ...(variant ? { variant } : {}) },
    ...overrides,
  } as UniversalSection;
}

/* ── Header ──────────────────────────────────────────────────────── */

const headerBase: Partial<UniversalSection> = {
  subject: {
    title: 'The Future of Design Systems',
    subtitle: 'Building composable, config-driven interfaces at scale',
    color: 'rgba(99, 102, 241, 0.4)',
  },
  content: {
    body: 'A universal renderer architecture that adapts to any content shape, theme, or layout requirement.',
  },
};

/* ── Stats Grid ──────────────────────────────────────────────────── */

const statsBase: Partial<UniversalSection> = {
  subject: {
    title: 'Platform Metrics',
  },
  content: {
    stats: [
      { label: 'Renderers', value: '17' },
      { label: 'Variants', value: '9' },
      { label: 'Sections Rendered', value: '1,240' },
      { label: 'Uptime', value: '99.97%' },
    ],
  },
};

/* ── Feature Matrix ──────────────────────────────────────────────── */

const featureBase: Partial<UniversalSection> = {
  subject: {
    title: 'Core Capabilities',
  },
  content: {
    highlights: [
      { subtitle: 'Config-Driven', description: 'Define pages entirely in JSON. No custom code needed per section.' },
      { subtitle: 'Theme-Aware', description: 'Full light/dark mode support with themed images and adaptive colors.' },
      { subtitle: 'Variant System', description: 'Multiple visual treatments per layout, selected via display.variant.' },
      { subtitle: 'Access Control', description: 'Role-based visibility and feature-flagged sections built in.' },
    ],
  },
};

/* ── Timeline ────────────────────────────────────────────────────── */

const timelineBase: Partial<UniversalSection> = {
  subject: {
    title: 'Development Timeline',
  },
  children: [
    {
      id: 'tl-1',
      type: 'event',
      subject: { title: 'Architecture Design' },
      content: { body: 'Defined universal section schema and renderer registry pattern.' },
      meta: { date: '2025-Q3' },
    },
    {
      id: 'tl-2',
      type: 'event',
      subject: { title: 'Core Renderers' },
      content: { body: 'Built 12 base renderers covering common content layouts.' },
      meta: { date: '2025-Q4' },
    },
    {
      id: 'tl-3',
      type: 'event',
      subject: { title: 'Variant System' },
      content: { body: 'Introduced variant registry for visual alternatives per layout.' },
      meta: { date: '2026-Q1' },
    },
  ] as UniversalSection[],
};

/* ── Centered Text ───────────────────────────────────────────────── */

const centeredTextBase: Partial<UniversalSection> = {
  subject: {
    title: 'Design is not just what it looks like.',
    subtitle: 'Steve Jobs',
  },
  content: {
    body: 'Design is how it works. Every detail matters. Every interaction counts. The renderer system embodies this philosophy by making content structure and visual presentation orthogonal concerns.',
  },
};

/* ─── Variant definitions ────────────────────────────────────────── */

interface VariantGroup {
  layout: string;
  label: string;
  variants: (string | null)[]; // null = default
  base: Partial<UniversalSection>;
}

const groups: VariantGroup[] = [
  {
    layout: 'header',
    label: 'Header',
    variants: [null, 'hero', 'gradient', 'split-hero'],
    base: headerBase,
  },
  {
    layout: 'stats-grid',
    label: 'Stats Grid',
    variants: [null, 'large-number', 'animated-counter'],
    base: statsBase,
  },
  {
    layout: 'feature-matrix',
    label: 'Feature Matrix',
    variants: [null, 'cards'],
    base: featureBase,
  },
  {
    layout: 'timeline',
    label: 'Timeline',
    variants: [null, 'horizontal'],
    base: timelineBase,
  },
  {
    layout: 'centered-text',
    label: 'Centered Text',
    variants: [null, 'quote', 'highlight'],
    base: centeredTextBase,
  },
];

/* ─── Page Component ─────────────────────────────────────────────── */

export default function VariantsPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        color: 'rgba(255, 255, 255, 0.9)',
        paddingTop: '5rem',
        paddingBottom: '4rem',
      }}
    >
      {/* Page header */}
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 2rem' }}>
        <h1
          style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 700,
            marginBottom: '0.5rem',
          }}
        >
          Renderer Variants
        </h1>
        <p
          style={{
            fontSize: '1rem',
            color: 'rgba(255, 255, 255, 0.5)',
            marginBottom: '3rem',
            maxWidth: '600px',
            lineHeight: 1.6,
          }}
        >
          Side-by-side comparison of every renderer layout and its registered
          variants. Each cell renders a real SectionRenderer with{' '}
          <code
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              padding: '0.15em 0.4em',
              borderRadius: '4px',
              fontSize: '0.9em',
            }}
          >
            display.variant
          </code>{' '}
          set.
        </p>
      </div>

      {/* Variant groups */}
      {groups.map((group) => (
        <div key={group.layout} style={{ marginBottom: '4rem' }}>
          {/* Group heading */}
          <div
            style={{
              maxWidth: '80rem',
              margin: '0 auto',
              padding: '0 2rem 1rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              marginBottom: '1.5rem',
            }}
          >
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <code
                style={{
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: 'rgb(165, 168, 255)',
                  padding: '0.2em 0.6em',
                  borderRadius: '6px',
                  fontSize: '0.85em',
                  fontWeight: 500,
                }}
              >
                {group.layout}
              </code>
              <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontWeight: 400 }}>
                {group.variants.length} variant{group.variants.length !== 1 ? 's' : ''}
              </span>
            </h2>
          </div>

          {/* Variant grid */}
          <div
            style={{
              maxWidth: '80rem',
              margin: '0 auto',
              padding: '0 2rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 36rem), 1fr))',
              gap: '1.5rem',
            }}
          >
            {group.variants.map((variant) => {
              const variantLabel = variant ?? 'default';
              const section = makeSection(
                group.layout,
                group.layout,
                variant ?? undefined,
                group.base,
              );

              return (
                <div
                  key={variantLabel}
                  style={{
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: 'rgba(255, 255, 255, 0.02)',
                  }}
                >
                  {/* Variant label bar */}
                  <div
                    style={{
                      padding: '0.6rem 1rem',
                      background: 'rgba(255, 255, 255, 0.04)',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        fontFamily: 'monospace',
                        color: variant
                          ? 'rgb(165, 168, 255)'
                          : 'rgba(255, 255, 255, 0.6)',
                      }}
                    >
                      {variantLabel}
                    </span>
                    {!variant && (
                      <span
                        style={{
                          fontSize: '0.65rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          color: 'rgba(255, 255, 255, 0.3)',
                          fontWeight: 500,
                        }}
                      >
                        base
                      </span>
                    )}
                    {variant && (
                      <code
                        style={{
                          fontSize: '0.65rem',
                          color: 'rgba(255, 255, 255, 0.25)',
                          fontFamily: 'monospace',
                        }}
                      >
                        display.variant: &quot;{variant}&quot;
                      </code>
                    )}
                  </div>

                  {/* Rendered section */}
                  <div
                    style={{
                      minHeight: '200px',
                      position: 'relative',
                    }}
                  >
                    <SectionRenderer section={section} wrapper={false} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
