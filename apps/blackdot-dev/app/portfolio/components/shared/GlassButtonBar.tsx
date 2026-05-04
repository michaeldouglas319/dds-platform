'use client';

import React from 'react';

export interface GlassButtonConfig {
  /** Button label */
  label: string;
  /** Click handler */
  onClick: () => void;
  /** Optional icon (e.g. 3D Google logo for Authenticate) */
  icon?: React.ReactNode;
  /** Optional aria-label (defaults to label) */
  ariaLabel?: string;
  /** Optional disabled state */
  disabled?: boolean;
}

export interface GlassButtonBarProps {
  /** Array of button configs (label + onClick) */
  buttons: GlassButtonConfig[];
  /** Bottom offset (e.g. '5rem' for pb-20). Default: '5rem' */
  bottom?: string;
  /** Optional z-index. Default: 150 */
  zIndex?: number;
  /** Optional className for the container */
  className?: string;
}

const glassButtonStyle: React.CSSProperties = {
  position: 'relative',
  flex: '1 1 0',
  minWidth: '120px',
  padding: '10px 24px',
  fontSize: '0.9375rem',
  fontWeight: 500,
  color: 'rgba(255, 255, 255, 0.95)',
  background: 'rgba(255, 255, 255, 0.08)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  borderRadius: '12px',
  cursor: 'pointer',
  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
  transition: 'transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease',
  pointerEvents: 'auto',
  whiteSpace: 'nowrap',
};

const NEON_GLOW = '0 0 24px rgba(192, 219, 255, 0.4), 0 0 48px rgba(192, 219, 255, 0.15)';

/** More glassy look for Authenticate: more transparent, stronger blur, softer border */
const AUTH_GLASS_STYLE: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.04)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
};

const hoverEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
  const t = e.currentTarget;
  const isAuth = t.getAttribute('data-authenticate') === 'true';
  t.style.transform = 'scale(1.02)';
  t.style.background = isAuth ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.12)';
  t.style.boxShadow = isAuth
    ? `0 8px 32px rgba(0, 0, 0, 0.2), ${NEON_GLOW}, inset 0 1px 0 rgba(255, 255, 255, 0.18)`
    : '0 8px 32px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15)';
};

const hoverLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
  const t = e.currentTarget;
  const isAuth = t.getAttribute('data-authenticate') === 'true';
  t.style.transform = 'scale(1)';
  t.style.background = isAuth ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.08)';
  t.style.boxShadow = isAuth
    ? `0 4px 24px rgba(0, 0, 0, 0.15), ${NEON_GLOW}, inset 0 1px 0 rgba(255, 255, 255, 0.12)`
    : '0 4px 24px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
};

/**
 * Reusable glass-styled button bar overlay.
 * Accepts an array of { label, onClick } and renders each as a glass button.
 */
export function GlassButtonBar({
  buttons,
  bottom = '5rem',
  zIndex = 150,
  className,
}: GlassButtonBarProps): React.ReactElement {
  if (buttons.length === 0) return <></>;

  return (
    <div
      className={className}
      style={{
        position: 'fixed',
        bottom,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex,
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'stretch',
        maxWidth: 'min(90vw, 900px)',
        pointerEvents: 'auto',
      }}
    >
      <style>{`
        @keyframes glassButtonBloom {
          0%, 100% { box-shadow: 0 4px 24px rgba(0,0,0,0.2), 0 0 20px rgba(192,219,255,0.3), 0 0 40px rgba(192,219,255,0.1), inset 0 1px 0 rgba(255,255,255,0.1); }
          50% { box-shadow: 0 4px 24px rgba(0,0,0,0.2), 0 0 28px rgba(192,219,255,0.5), 0 0 56px rgba(192,219,255,0.2), inset 0 1px 0 rgba(255,255,255,0.1); }
        }
      `}</style>
      {buttons.map((btn, i) => {
        const isAuthenticate = btn.label === 'Authenticate';
        return (
          <button
            key={i}
            type="button"
            onClick={btn.onClick}
            disabled={btn.disabled}
            aria-label={btn.ariaLabel ?? btn.label}
            data-authenticate={isAuthenticate ? 'true' : undefined}
            style={{
              ...glassButtonStyle,
              ...(isAuthenticate && !btn.disabled
                ? {
                    ...AUTH_GLASS_STYLE,
                    boxShadow: `0 4px 24px rgba(0,0,0,0.15), ${NEON_GLOW}, inset 0 1px 0 rgba(255,255,255,0.12)`,
                    animation: 'glassButtonBloom 2.5s ease-in-out infinite',
                  }
                : {}),
              ...(btn.disabled
                ? { opacity: 0.5, cursor: 'not-allowed' }
                : {}),
              ...(btn.icon ? { display: 'inline-flex', alignItems: 'center', justifyContent: 'center' } : {}),
            }}
            onMouseEnter={btn.disabled ? undefined : hoverEnter}
            onMouseLeave={btn.disabled ? undefined : hoverLeave}
          >
            {btn.icon ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                {btn.icon}
                {btn.label}
              </span>
            ) : (
              btn.label
            )}
          </button>
        );
      })}
    </div>
  );
}

export default GlassButtonBar;
