import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSpring, animated, config } from '@react-spring/web';

/**
 * Props for the ClickToSignInOverlay component
 */
interface ClickToSignInOverlayProps {
  /**
   * Whether the overlay is visible
   */
  isVisible: boolean;

  /**
   * Whether authentication is currently in progress
   */
  isLoading?: boolean;

  /**
   * Callback triggered when user attempts to sign in
   */
  onSignIn: () => void | Promise<void>;

  /**
   * Optional callback when overlay is closed
   */
  onClose?: () => void;

  /**
   * Custom overlay opacity (0-1)
   * @default 0.7
   */
  overlayOpacity?: number;

  /**
   * Custom text to display
   * @default "Click anywhere to sign in"
   */
  signInText?: string;

  /**
   * Enable keyboard shortcuts
   * @default true
   */
  enableKeyboardShortcuts?: boolean;

  /**
   * Animation variant: 'pulse' or 'scale'
   * @default 'pulse'
   */
  animationVariant?: 'pulse' | 'scale';

  /**
   * z-index for overlay
   * @default 9999
   */
  zIndex?: number;
}

/**
 * ClickToSignInOverlay Component
 *
 * A fullscreen overlay component that appears on unauthenticated landing pages
 * with animated "Click to sign in" text. Features:
 * - Smooth fade in/out transitions
 * - Pulsing or scaling text animation
 * - Semi-transparent dark background
 * - Keyboard support (Enter to sign in, Esc to close)
 * - Mobile responsive
 * - Loading state
 * - Accessibility features
 */
export const ClickToSignInOverlay: React.FC<ClickToSignInOverlayProps> = ({
  isVisible,
  isLoading = false,
  onSignIn,
  onClose,
  overlayOpacity = 0.7,
  signInText = 'Click anywhere to sign in',
  enableKeyboardShortcuts = true,
  animationVariant = 'pulse',
  zIndex = 9999,
}) => {
  const [isHandlingClick, setIsHandlingClick] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fade in/out animation for the entire overlay
  const fadeAnimation = useSpring({
    opacity: isVisible ? 1 : 0,
    pointerEvents: isVisible ? 'auto' : 'none',
    config: config.gentle,
  });

  // Text animation based on variant
  const textAnimation = useSpring({
    from: { opacity: 0.7, scale: 0.95 },
    to: async (next) => {
      while (isVisible && !isLoading) {
        if (animationVariant === 'pulse') {
          await next({ opacity: 1, scale: 1.05 });
          await next({ opacity: 0.7, scale: 0.95 });
        } else {
          // 'scale' variant
          await next({ scale: 1.08, opacity: 1 });
          await next({ scale: 0.95, opacity: 0.7 });
        }
      }
    },
    config: config.molasses,
    reset: !isVisible,
  });

  // Loading state animation - subtle rotation
  const loadingAnimation = useSpring({
    from: { rotate: 0 },
    to: isLoading ? { rotate: 360 } : { rotate: 0 },
    loop: isLoading,
    config: { duration: 1500 },
  });

  // Handle click on overlay
  const handleClick = useCallback(async () => {
    if (isHandlingClick || isLoading) return;

    setIsHandlingClick(true);

    try {
      await onSignIn();
    } catch (error) {
      console.error('Sign in failed:', error);
    } finally {
      setIsHandlingClick(false);
    }
  }, [isLoading, isHandlingClick, onSignIn]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!enableKeyboardShortcuts || !isVisible) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Enter to sign in
      if (event.key === 'Enter' && !isLoading && !isHandlingClick) {
        event.preventDefault();
        handleClick();
      }

      // Escape to close
      if (event.key === 'Escape' && onClose) {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible, isLoading, isHandlingClick, handleClick, onClose, enableKeyboardShortcuts]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Early return if not visible - still renders but with no pointer events
  if (!isVisible) {
    return (
      <div
        ref={containerRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex,
          opacity: 0,
          pointerEvents: 'none',
        }}
        role="presentation"
        aria-hidden="true"
      />
    );
  }

  const loadingSpinner = isLoading && (
    <animated.div
      style={{
        transform: loadingAnimation.rotate.to((r) => `rotate(${r}deg)`),
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: '-30px',
        marginLeft: '-30px',
        width: '60px',
        height: '60px',
        border: '3px solid rgba(255, 255, 255, 0.2)',
        borderTop: '3px solid rgba(255, 255, 255, 0.8)',
        borderRadius: '50%',
      }}
      role="status"
      aria-live="polite"
    />
  );

  const loadingText = isLoading && (
    <div
      style={{
        position: 'absolute',
        top: 'calc(50% + 60px)',
        left: '50%',
        transform: 'translateX(-50%)',
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 'clamp(0.875rem, 4vw, 1rem)',
        fontWeight: 500,
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
      }}
    >
      Signing in...
    </div>
  );

  return (
    <animated.div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex,
        backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fadeAnimation.opacity as any,
        pointerEvents: fadeAnimation.pointerEvents as any,
        cursor: isLoading ? 'wait' : 'pointer',
      }}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          handleClick();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label="Sign in overlay"
      aria-pressed={false}
    >
      {/* Animated text */}
      {!isLoading ? (
        <animated.div
          style={{
            ...textAnimation,
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: 'clamp(1.5rem, 8vw, 3rem)',
            fontWeight: 600,
            textAlign: 'center',
            letterSpacing: '-0.02em',
            padding: '20px',
            maxWidth: '90vw',
            userSelect: 'none',
            pointerEvents: 'none',
            transform: textAnimation.scale.to((s) => `scale(${s})`),
          }}
        >
          {signInText}
        </animated.div>
      ) : null}

      {/* Loading spinner */}
      {loadingSpinner}

      {/* Loading text */}
      {loadingText}

      {/* Accessibility: Hint for keyboard users */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: '0.75rem',
          textAlign: 'center',
          pointerEvents: 'none',
          fontFamily: 'monospace',
        }}
      >
        Press <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '3px' }}>Enter</kbd> to sign in or <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '3px' }}>Esc</kbd> to close
      </div>
    </animated.div>
  );
};

/**
 * Hook for managing sign-in overlay state
 * Useful for coordinating auth transitions and overlay visibility
 */
export const useSignInOverlay = (onSignInCallback?: () => Promise<void>) => {
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const handleSignIn = useCallback(async () => {
    setIsAuthLoading(true);
    try {
      if (onSignInCallback) {
        await onSignInCallback();
      }
      setIsOverlayVisible(false);
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsAuthLoading(false);
    }
  }, [onSignInCallback]);

  const toggleOverlay = useCallback((visible?: boolean) => {
    setIsOverlayVisible((prev) => (visible !== undefined ? visible : !prev));
  }, []);

  return {
    isOverlayVisible,
    isAuthLoading,
    setIsOverlayVisible,
    handleSignIn,
    toggleOverlay,
  };
};

export default ClickToSignInOverlay;
