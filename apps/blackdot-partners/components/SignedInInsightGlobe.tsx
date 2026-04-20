'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  CATEGORY_COLORS,
  defaultDebugSettings,
  useGlobeCarousel,
  type GlobePoint,
} from '@dds/globe'

const InteractiveGlobeScene = dynamic(
  () => import('@dds/globe').then((m) => m.InteractiveGlobeScene),
  { ssr: false },
)

type Props = {
  events: GlobePoint[]
}

// Top-N slice for a focused insight view — full graph runs as the backdrop.
const INSIGHT_LIMIT = 60
const AUTO_ADVANCE_MS = 5500

export default function SignedInInsightGlobe({ events }: Props) {
  const insightEvents = useMemo<GlobePoint[]>(
    () =>
      events
        .slice()
        .sort((a, b) => b.weight - a.weight)
        .slice(0, INSIGHT_LIMIT)
        .map((e, i) => ({ ...e, id: e.url ?? `${e.lat}:${e.lon}:${i}` })),
    [events],
  )

  const [hoverPaused, setHoverPaused] = useState(false)
  const { focusedIndex, setFocusedIndex, next, prev, isPaused, setPaused } =
    useGlobeCarousel({
      length: insightEvents.length,
      autoAdvanceMs: AUTO_ADVANCE_MS,
      paused: false,
    })

  const effectivePaused = isPaused || hoverPaused

  // Re-pipe pause to the hook when hover state changes
  useEffect(() => {
    // no-op: hook drives its own interval; effectivePaused is read for UI only
  }, [effectivePaused])

  // Keyboard navigation (arrow keys / space)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        next()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prev()
      } else if (e.key === ' ') {
        e.preventDefault()
        setPaused(!isPaused)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev, isPaused, setPaused])

  const focused = focusedIndex !== null ? insightEvents[focusedIndex] : null

  const onSelect = useCallback(
    (i: number) => {
      setFocusedIndex(i)
      setPaused(true)
    },
    [setFocusedIndex, setPaused],
  )

  if (insightEvents.length === 0) {
    return (
      <div
        style={{
          minHeight: 480,
          display: 'grid',
          placeItems: 'center',
          color: 'rgba(0,0,0,0.5)',
          fontSize: 14,
        }}
      >
        Loading signal feed…
      </div>
    )
  }

  return (
    <section
      id="insight"
      style={{
        position: 'relative',
        margin: '5rem auto 4rem',
        maxWidth: '1100px',
        padding: '0 1.5rem',
      }}
    >
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            opacity: 0.45,
            marginBottom: 6,
          }}
        >
          Partner Signal
        </div>
        <h2
          style={{
            fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
            fontWeight: 600,
            margin: 0,
            letterSpacing: '-0.01em',
          }}
        >
          Global Situation Brief
        </h2>
        <p style={{ marginTop: 10, fontSize: 14, opacity: 0.6, maxWidth: 620, marginInline: 'auto' }}>
          Top {insightEvents.length} signals across our live feeds. Hover to pause, click a point
          to lock, or use ← / → to step through.
        </p>
      </header>

      <div
        onPointerEnter={() => setHoverPaused(true)}
        onPointerLeave={() => setHoverPaused(false)}
        style={{
          position: 'relative',
          aspectRatio: '16 / 10',
          width: '100%',
          borderRadius: 20,
          overflow: 'hidden',
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(240,240,240,0.85) 100%)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.12), 0 2px 0 rgba(255,255,255,0.8) inset',
          border: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <InteractiveGlobeScene
          events={insightEvents}
          focusedIndex={focusedIndex}
          onPointSelect={onSelect}
          useCategoryColors={false}
          debug={{
            ...defaultDebugSettings,
            globeRotationSpeed: effectivePaused ? 0 : 0.35,
          }}
          background={null}
          radius={3}
          cameraPosition={[0, 0, 11]}
          cameraFov={34}
        />

        {/* HUD — prev / next / counter */}
        <div
          style={{
            position: 'absolute',
            bottom: 18,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '8px 14px',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.75)',
            backdropFilter: 'blur(14px) saturate(160%)',
            WebkitBackdropFilter: 'blur(14px) saturate(160%)',
            border: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 4px 18px rgba(0,0,0,0.08)',
            fontSize: 12,
            zIndex: 10,
          }}
        >
          <CircleButton label="Previous" onClick={prev}>
            ←
          </CircleButton>
          <button
            onClick={() => setPaused(!isPaused)}
            style={{
              border: 0,
              background: 'transparent',
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: 'rgba(0,0,0,0.7)',
              cursor: 'pointer',
              padding: '4px 6px',
            }}
          >
            {isPaused ? '▶ Resume' : '❚❚ Pause'}
          </button>
          <span style={{ opacity: 0.55, fontVariantNumeric: 'tabular-nums' }}>
            {focusedIndex !== null ? focusedIndex + 1 : '–'} / {insightEvents.length}
          </span>
          <CircleButton label="Next" onClick={next}>
            →
          </CircleButton>
        </div>

      </div>

      {/* Detail card below globe — mirrors focused point */}
      <div style={{ marginTop: 24 }}>
        {focused ? (
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderRadius: 16,
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(14px) saturate(160%)',
              WebkitBackdropFilter: 'blur(14px) saturate(160%)',
              border: '1px solid rgba(0,0,0,0.06)',
              boxShadow: '0 8px 28px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: 11,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#fff',
                  background: focused.tag
                    ? CATEGORY_COLORS[focused.tag] ?? '#222'
                    : '#222',
                  padding: '3px 8px',
                  borderRadius: 6,
                  fontWeight: 600,
                }}
              >
                {focused.tag ?? 'signal'}
              </span>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
                {focused.name ?? 'Unnamed event'}
              </h3>
            </div>
            <div style={{ display: 'flex', gap: 24, marginTop: 12, fontSize: 13, opacity: 0.75 }}>
              <span>
                <strong style={{ fontWeight: 600 }}>{focused.weight.toLocaleString()}</strong>{' '}
                weight
              </span>
              <span>
                {focused.lat.toFixed(2)}°, {focused.lon.toFixed(2)}°
              </span>
              {focused.date && <span>{focused.date}</span>}
              {focused.tag && (
                <a
                  href={`https://ageofabundance.wiki/e/${encodeURIComponent(focused.tag)}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#0a66ff', textDecoration: 'none', fontWeight: 500 }}
                >
                  read on wiki ↗
                </a>
              )}
              {focused.url && (
                <a
                  href={focused.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#0a66ff', textDecoration: 'none' }}
                >
                  source ↗
                </a>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

function CircleButton({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode
  onClick: () => void
  label: string
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      style={{
        width: 30,
        height: 30,
        borderRadius: 999,
        border: '1px solid rgba(0,0,0,0.12)',
        background: '#fff',
        cursor: 'pointer',
        fontSize: 14,
        lineHeight: 1,
        display: 'grid',
        placeItems: 'center',
      }}
    >
      {children}
    </button>
  )
}