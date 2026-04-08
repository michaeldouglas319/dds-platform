'use client';

import { useState, useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import type { CuneiformEntry } from './cuneiform';

// ── Types ────────────────────────────────────────────────

export interface AppChipProps {
  /** The cuneiform entry to display */
  entry: CuneiformEntry;
  /** Size in px. Default: 56 */
  size?: number;
  /** Badge border-radius. Default: 14 */
  borderRadius?: number;
  /** Delay before 3D flip starts (ms). Default: 1400 */
  flipDelay?: number;
  /** Flip animation duration (ms). Default: 800 */
  flipDuration?: number;
  /** CSS easing. Default: cubic-bezier(0.4, 0, 0.2, 1) */
  easing?: string;
  /** Override badge back-face icon */
  badgeIcon?: ReactNode;
  /** Badge background */
  badgeBg?: string;
  /** Badge border color */
  badgeBorder?: string;
  /** Show tooltip on hover. Default: true */
  tooltip?: boolean;
  /** Start already flipped (badge side). Default: false */
  flipped?: boolean;
  /** Disable auto-flip. Default: false */
  disableAutoFlip?: boolean;
  /** Callback when flip completes */
  onFlip?: (showing: 'cuneiform' | 'badge') => void;
  /** Click to toggle flip manually */
  clickToFlip?: boolean;
  className?: string;
  style?: CSSProperties;
}

// ── Fallback badge SVGs per vertical ─────────────────────

const BADGE_PATHS: Record<string, ReactNode> = {
  shop: <path d="M6 2L3 7v11a2 2 0 002 2h14a2 2 0 002-2V7l-3-5H6zM3 7h18M16 11a4 4 0 01-8 0" />,
  store: <path d="M3 9l1-4h16l1 4M5 9v9a2 2 0 002 2h10a2 2 0 002-2V9M9 21V13h6v8" />,
  actor: <><circle cx="12" cy="8" r="4" /><path d="M6 20v-2a4 4 0 014-4h4a4 4 0 014 4v2" /></>,
  art: <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.5-.7 1.5-1.5 0-.4-.1-.7-.4-1-.2-.3-.4-.6-.4-1 0-.8.7-1.5 1.5-1.5H16c3.3 0 6-2.7 6-6 0-5.5-4.5-10-10-10z" />,
  studio: <><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></>,
  dev: <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />,
  tech: <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />,
  ai: <path d="M12 2a7 7 0 017 7v1a7 7 0 01-14 0V9a7 7 0 017-7zM8 15s1.5 2 4 2 4-2 4-2" />,
  wiki: <path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5V5a2 2 0 012-2h14v14H6.5A2.5 2.5 0 004 19.5z" />,
  info: <><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h0" /></>,
  net: <><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2z" /></>,
  org: <path d="M17 21v-2a4 4 0 00-3-3.87M9 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M12 7a4 4 0 11-8 0 4 4 0 018 0z" />,
  site: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></>,
  online: <><circle cx="12" cy="12" r="2" /><path d="M16.24 7.76a6 6 0 010 8.49M7.76 16.24a6 6 0 010-8.49M19.07 4.93a10 10 0 010 14.14M4.93 19.07a10 10 0 010-14.14" /></>,
  cloud: <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" />,
  space: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
  agency: <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" />,
  partners: <path d="M11 17a4 4 0 01-4-4V5h2v8a2 2 0 104 0V5h2v8a4 4 0 01-4 4zM7 21h10" />,
  asia: <><circle cx="12" cy="12" r="10" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2zM2 12h20" /></>,
  capital: <path d="M12 1v22M5 8h14M7 4h10M5 12h14M7 16h10M9 20h6" />,
  xyz: <path d="M12 2l9 5v10l-9 5-9-5V7l9-5z" />,
  abundance: <path d="M12 2v20M12 6c-3 0-6 3-6 8M12 6c3 0 6 3 6 8M12 10c-2 0-4 2-4 5M12 10c2 0 4 2 4 5" />,
  blackdot: <circle cx="12" cy="12" r="6" />,
  michaeldouglas: <path d="M5 3l3.5 9L5 21M12 3v18M19 3l-3.5 9L19 21" />,
};

// ── Tooltip ──────────────────────────────────────────────

function ChipTooltip({ entry, visible }: { entry: CuneiformEntry; visible: boolean }) {
  return (
    <div
      role="tooltip"
      style={{
        position: 'absolute',
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginBottom: 10,
        padding: '8px 12px',
        borderRadius: 8,
        background: 'rgba(0,0,0,0.9)',
        backdropFilter: 'blur(8px)',
        color: '#fff',
        fontSize: 11,
        lineHeight: 1.5,
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        opacity: visible ? 1 : 0,
        transition: 'opacity 150ms ease',
        zIndex: 50,
      }}
    >
      <div>
        <span style={{ fontSize: 16, marginRight: 6 }}>{entry.glyph}</span>
        <strong>{entry.name}</strong>
        <span style={{ opacity: 0.5 }}> · {entry.codepoint}</span>
      </div>
      <div style={{ opacity: 0.7 }}>{entry.meaning}</div>
      <div style={{ opacity: 0.4, fontSize: 10, marginTop: 2 }}>Sumerian cuneiform · .{entry.vertical}</div>
    </div>
  );
}

// ── AppChip ──────────────────────────────────────────────

export function AppChip({
  entry,
  size = 56,
  borderRadius = 14,
  flipDelay = 1400,
  flipDuration = 800,
  easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
  badgeIcon,
  badgeBg,
  badgeBorder,
  tooltip = true,
  flipped: controlledFlipped,
  disableAutoFlip = false,
  onFlip,
  clickToFlip = true,
  className,
  style,
}: AppChipProps) {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const [hovered, setHovered] = useState(false);
  const onFlipRef = useRef(onFlip);
  onFlipRef.current = onFlip;

  const isFlipped = controlledFlipped ?? internalFlipped;

  // Auto-flip after delay
  useEffect(() => {
    if (disableAutoFlip || controlledFlipped !== undefined) return;
    const timer = setTimeout(() => {
      setInternalFlipped(true);
      onFlipRef.current?.('badge');
    }, flipDelay);
    return () => clearTimeout(timer);
  }, [disableAutoFlip, controlledFlipped, flipDelay]);

  const handleClick = () => {
    if (!clickToFlip) return;
    const next = !isFlipped;
    if (controlledFlipped === undefined) {
      setInternalFlipped(next);
    }
    onFlip?.(next ? 'badge' : 'cuneiform');
  };

  const badgeSvg = badgeIcon ?? BADGE_PATHS[entry.vertical];
  const dur = `${flipDuration}ms`;

  // 3D card container
  const containerStyle: CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    width: size,
    height: size,
    perspective: size * 4,
    cursor: clickToFlip ? 'pointer' : 'default',
    ...style,
  };

  // Inner card that rotates
  const innerStyle: CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    transformStyle: 'preserve-3d',
    transition: `transform ${dur} ${easing}`,
    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
  };

  // Shared face styles
  const faceBase: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    borderRadius,
  };

  // Front: cuneiform glyph
  const frontStyle: CSSProperties = {
    ...faceBase,
    background: badgeBg ?? 'color-mix(in srgb, currentColor 8%, transparent)',
    border: `1.5px solid ${badgeBorder ?? 'color-mix(in srgb, currentColor 15%, transparent)'}`,
    fontSize: size * 0.55,
    lineHeight: 1,
    color: 'currentColor',
  };

  // Back: badge icon (rotated 180 to counter parent)
  const backStyle: CSSProperties = {
    ...faceBase,
    background: badgeBg ?? 'color-mix(in srgb, currentColor 12%, transparent)',
    border: `1.5px solid ${badgeBorder ?? 'color-mix(in srgb, currentColor 25%, transparent)'}`,
    transform: 'rotateY(180deg)',
    color: 'currentColor',
  };

  return (
    <div
      className={className}
      style={containerStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
      aria-label={`${entry.name} — ${entry.meaning}`}
    >
      {tooltip && <ChipTooltip entry={entry} visible={hovered} />}

      <div style={innerStyle}>
        {/* Front — Cuneiform */}
        <div style={frontStyle}>
          {entry.glyph}
        </div>

        {/* Back — Badge Icon */}
        <div style={backStyle}>
          <svg
            width={size * 0.45}
            height={size * 0.45}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {badgeSvg}
          </svg>
        </div>
      </div>
    </div>
  );
}

/** Grid of AppChips with staggered flip animation */
export function AppChipGrid({
  entries,
  size = 56,
  gap = 20,
  flipDelay = 800,
  flipStagger = 120,
  flipDuration = 800,
  showLabels = true,
  onChipClick,
  className,
  style,
}: {
  entries: CuneiformEntry[];
  size?: number;
  gap?: number;
  flipDelay?: number;
  /** Stagger between each chip's flip (ms). Default: 120 */
  flipStagger?: number;
  flipDuration?: number;
  showLabels?: boolean;
  onChipClick?: (entry: CuneiformEntry) => void;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(${size + gap}px, 1fr))`,
        gap,
        justifyItems: 'center',
        ...style,
      }}
    >
      {entries.map((entry, i) => (
        <div key={entry.vertical} style={{ textAlign: 'center' }}>
          <AppChip
            entry={entry}
            size={size}
            flipDelay={flipDelay + i * flipStagger}
            flipDuration={flipDuration}
            clickToFlip={!!onChipClick}
            onFlip={onChipClick ? () => onChipClick(entry) : undefined}
          />
          {showLabels && (
            <div style={{ fontSize: 10, opacity: 0.45, marginTop: 6, letterSpacing: '0.05em' }}>
              .{entry.vertical}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
