'use client';

import { useState, useEffect, type CSSProperties, type ReactNode } from 'react';
import { CUNEIFORM, getCuneiformForDomain, type CuneiformEntry } from './cuneiform';

// ── Types ────────────────────────────────────────────────

export type IconVariant = 'cuneiform' | 'badge' | 'both';
export type TransitionPreset = 'fade' | 'flip' | 'morph' | 'slide-up' | 'scale' | 'none';

export interface TransitionConfig {
  /** Preset animation style */
  preset?: TransitionPreset;
  /** Delay before transition starts (ms) */
  delay?: number;
  /** Transition duration (ms) */
  duration?: number;
  /** CSS easing function */
  easing?: string;
  /** Auto-transition from cuneiform → badge after load */
  autoTransition?: boolean;
}

export interface CuneiformIconProps {
  /** TLD key ("shop", "dev", "ai") or full domain ("blackdot.partners") */
  id: string;
  /** Which view to show. Default: 'both' (auto-transitions) */
  variant?: IconVariant;
  /** Size in px. Default: 48 */
  size?: number;
  /** Badge border-radius in px. Default: 12 (rounded-lg) */
  borderRadius?: number;
  /** Transition config */
  transition?: TransitionConfig;
  /** Override the badge icon content (ReactNode or emoji fallback) */
  badgeIcon?: ReactNode;
  /** Badge background color. Default: currentColor at 10% */
  badgeBg?: string;
  /** Badge border color */
  badgeBorder?: string;
  /** Show tooltip on hover. Default: true */
  tooltip?: boolean;
  /** Additional className */
  className?: string;
  /** Additional inline styles */
  style?: CSSProperties;
  /** Click handler */
  onClick?: () => void;
}

// ── Fallback badge icons (simple SVG paths per vertical) ─

const BADGE_ICONS: Record<string, ReactNode> = {
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

// ── Transition CSS generators ────────────────────────────

function getTransitionStyles(
  preset: TransitionPreset,
  phase: 'cuneiform' | 'badge',
  duration: number,
  easing: string,
): { front: CSSProperties; back: CSSProperties } {
  const t = `${duration}ms ${easing}`;

  const show: CSSProperties = { opacity: 1, transform: 'none', transition: `all ${t}` };
  const hide: CSSProperties = { opacity: 0, position: 'absolute', pointerEvents: 'none', transition: `all ${t}` };

  switch (preset) {
    case 'flip':
      return {
        front: phase === 'cuneiform'
          ? { ...show, transform: 'rotateY(0deg)' }
          : { ...hide, transform: 'rotateY(90deg)' },
        back: phase === 'badge'
          ? { ...show, transform: 'rotateY(0deg)' }
          : { ...hide, transform: 'rotateY(-90deg)' },
      };
    case 'slide-up':
      return {
        front: phase === 'cuneiform'
          ? show
          : { ...hide, transform: 'translateY(8px)' },
        back: phase === 'badge'
          ? show
          : { ...hide, transform: 'translateY(-8px)' },
      };
    case 'scale':
      return {
        front: phase === 'cuneiform'
          ? show
          : { ...hide, transform: 'scale(0.6)' },
        back: phase === 'badge'
          ? show
          : { ...hide, transform: 'scale(1.4)' },
      };
    case 'morph':
      return {
        front: phase === 'cuneiform'
          ? { ...show, filter: 'blur(0px)' }
          : { ...hide, filter: 'blur(6px)' },
        back: phase === 'badge'
          ? { ...show, filter: 'blur(0px)' }
          : { ...hide, filter: 'blur(6px)' },
      };
    case 'none':
      return {
        front: phase === 'cuneiform' ? show : { ...hide },
        back: phase === 'badge' ? show : { ...hide },
      };
    case 'fade':
    default:
      return {
        front: phase === 'cuneiform' ? show : hide,
        back: phase === 'badge' ? show : hide,
      };
  }
}

// ── Tooltip ──────────────────────────────────────────────

function Tooltip({ entry, visible }: { entry: CuneiformEntry; visible: boolean }) {
  return (
    <div
      role="tooltip"
      style={{
        position: 'absolute',
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginBottom: 8,
        padding: '6px 10px',
        borderRadius: 6,
        background: 'rgba(0,0,0,0.85)',
        color: '#fff',
        fontSize: 11,
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        opacity: visible ? 1 : 0,
        transition: 'opacity 150ms ease',
        zIndex: 50,
      }}
    >
      <span style={{ fontSize: 14, marginRight: 4 }}>{entry.glyph}</span>
      <strong>{entry.name}</strong> — {entry.meaning}
      <br />
      <span style={{ opacity: 0.6, fontSize: 10 }}>{entry.codepoint} · Sumerian</span>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────

export function CuneiformIcon({
  id,
  variant = 'both',
  size = 48,
  borderRadius = 12,
  transition: transitionConfig,
  badgeIcon,
  badgeBg,
  badgeBorder,
  tooltip = true,
  className,
  style,
  onClick,
}: CuneiformIconProps) {
  const {
    preset = 'morph',
    delay = 1200,
    duration = 500,
    easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
    autoTransition = true,
  } = transitionConfig ?? {};

  // Resolve entry: try direct key, then domain lookup
  const entry = CUNEIFORM[id] ?? getCuneiformForDomain(id);

  const [phase, setPhase] = useState<'cuneiform' | 'badge'>(
    variant === 'badge' ? 'badge' : 'cuneiform'
  );
  const [hovered, setHovered] = useState(false);

  // Auto-transition: cuneiform → badge after delay
  useEffect(() => {
    if (variant !== 'both' || !autoTransition) return;
    const timer = setTimeout(() => setPhase('badge'), delay);
    return () => clearTimeout(timer);
  }, [variant, autoTransition, delay]);

  if (!entry) {
    return <div style={{ width: size, height: size }} />;
  }

  const tld = entry.vertical;
  const badgeSvg = badgeIcon ?? BADGE_ICONS[tld];
  const showBoth = variant === 'both';
  const currentPreset = showBoth ? preset : 'none';
  const styles = getTransitionStyles(currentPreset, phase, duration, easing);

  const containerStyle: CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: size,
    height: size,
    cursor: onClick ? 'pointer' : 'default',
    perspective: preset === 'flip' ? size * 3 : undefined,
    ...style,
  };

  const glyphStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: size,
    height: size,
    fontSize: size * 0.6,
    lineHeight: 1,
    color: 'currentColor',
    ...styles.front,
  };

  const badgeStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: size,
    height: size,
    borderRadius,
    background: badgeBg ?? 'color-mix(in srgb, currentColor 10%, transparent)',
    border: `1.5px solid ${badgeBorder ?? 'color-mix(in srgb, currentColor 20%, transparent)'}`,
    color: 'currentColor',
    ...styles.back,
  };

  return (
    <div
      className={className}
      style={containerStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      aria-label={`${entry.name} — ${entry.meaning}`}
      title={tooltip && !hovered ? `${entry.name} — ${entry.meaning}` : undefined}
    >
      {tooltip && <Tooltip entry={entry} visible={hovered} />}

      {/* Cuneiform glyph layer */}
      {(variant === 'cuneiform' || variant === 'both') && (
        <div style={glyphStyle} aria-hidden={phase !== 'cuneiform'}>
          {entry.glyph}
        </div>
      )}

      {/* Badge icon layer */}
      {(variant === 'badge' || variant === 'both') && (
        <div style={badgeStyle} aria-hidden={phase !== 'badge'}>
          <svg
            width={size * 0.5}
            height={size * 0.5}
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
      )}
    </div>
  );
}

/** Grid of all icons — useful for showcases and the partners page */
export function CuneiformIconGrid({
  size = 48,
  gap = 16,
  transition,
  filter,
  onIconClick,
  className,
  style,
}: {
  size?: number;
  gap?: number;
  transition?: TransitionConfig;
  filter?: (entry: CuneiformEntry) => boolean;
  onIconClick?: (entry: CuneiformEntry) => void;
  className?: string;
  style?: CSSProperties;
}) {
  const entries = Object.entries(CUNEIFORM).filter(
    ([, e]) => !filter || filter(e)
  );

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
      {entries.map(([key, entry]) => (
        <div key={key} style={{ textAlign: 'center' }}>
          <CuneiformIcon
            id={key}
            size={size}
            transition={transition}
            onClick={onIconClick ? () => onIconClick(entry) : undefined}
          />
          <div style={{ fontSize: 10, opacity: 0.5, marginTop: 4 }}>
            .{entry.vertical}
          </div>
        </div>
      ))}
    </div>
  );
}
