import React, { useMemo, CSSProperties } from 'react';

/**
 * Enum for controlling when content should be displayed
 */
export enum AuthGateMode {
  AUTHENTICATED = 'authenticated',
  UNAUTHENTICATED = 'unauthenticated',
  ANY = 'any',
}

/**
 * Animation type options for entrance/exit transitions
 */
export enum AnimationType {
  FADE = 'fade',
  SCALE = 'scale',
  FADE_SCALE = 'fade-scale',
  SLIDE_UP = 'slide-up',
}

/**
 * Authentication state interface
 */
export interface AuthState {
  isAuthenticated: boolean;
  userId?: string;
  userRole?: string;
  isLoading?: boolean;
}

/**
 * Props for the AuthGatedElements component
 */
export interface AuthGatedElementsProps {
  /** Content to render when gate conditions are met */
  children: React.ReactNode;

  /** Current authentication state */
  authState: AuthState;

  /** When to show the gated content */
  showWhen?: AuthGateMode | AuthGateMode[];

  /** Animation type for entrance/exit */
  animation?: AnimationType;

  /** Duration of animation in milliseconds */
  animationDuration?: number;

  /** Component to show when content is gated */
  fallback?: React.ReactNode | React.ComponentType<FallbackProps>;

  /** CSS class name for the wrapper */
  className?: string;

  /** Inline styles for the wrapper */
  style?: CSSProperties;

  /** ARIA label for accessibility */
  ariaLabel?: string;

  /** Loading state fallback content */
  loadingFallback?: React.ReactNode;

  /** Role-based access control - require specific role */
  requiredRole?: string;

  /** Callback when auth state changes */
  onAuthStateChange?: (authState: AuthState) => void;

  /** Test ID for testing */
  testId?: string;
}

/**
 * Props for fallback component
 */
export interface FallbackProps {
  authState: AuthState;
  showWhen: AuthGateMode | AuthGateMode[];
}

/**
 * Internal styles for animations
 */
const getAnimationStyles = (
  animation: AnimationType | undefined,
  isVisible: boolean,
  duration: number
): CSSProperties => {
  const baseStyle: CSSProperties = {
    transition: `all ${duration}ms ease-in-out`,
  };

  if (!animation) {
    return baseStyle;
  }

  switch (animation) {
    case AnimationType.FADE:
      return {
        ...baseStyle,
        opacity: isVisible ? 1 : 0,
        visibility: isVisible ? 'visible' : 'hidden',
      };

    case AnimationType.SCALE:
      return {
        ...baseStyle,
        transform: isVisible ? 'scale(1)' : 'scale(0.95)',
        opacity: isVisible ? 1 : 0,
        visibility: isVisible ? 'visible' : 'hidden',
      };

    case AnimationType.FADE_SCALE:
      return {
        ...baseStyle,
        transform: isVisible ? 'scale(1)' : 'scale(0.9)',
        opacity: isVisible ? 1 : 0,
        visibility: isVisible ? 'visible' : 'hidden',
      };

    case AnimationType.SLIDE_UP:
      return {
        ...baseStyle,
        transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
        opacity: isVisible ? 1 : 0,
        visibility: isVisible ? 'visible' : 'hidden',
      };

    default:
      return baseStyle;
  }
};

/**
 * Determines if content should be visible based on auth state and gate mode
 */
const isContentVisible = (
  authState: AuthState,
  showWhen: AuthGateMode | AuthGateMode[] | undefined,
  requiredRole?: string
): boolean => {
  // If loading, content is not visible (unless explicitly allowing)
  if (authState.isLoading) {
    return false;
  }

  const modes = Array.isArray(showWhen) ? showWhen : [showWhen ?? AuthGateMode.ANY];

  for (const mode of modes) {
    if (mode === AuthGateMode.ANY) {
      // ANY mode always shows (unless role check fails)
      if (requiredRole && authState.userRole !== requiredRole) {
        return false;
      }
      return true;
    }

    if (
      mode === AuthGateMode.AUTHENTICATED &&
      authState.isAuthenticated
    ) {
      // Check role if required
      if (requiredRole && authState.userRole !== requiredRole) {
        continue;
      }
      return true;
    }

    if (
      mode === AuthGateMode.UNAUTHENTICATED &&
      !authState.isAuthenticated
    ) {
      return true;
    }
  }

  return false;
};

/**
 * AuthGatedElements Component
 *
 * A flexible authentication gating component that conditionally renders content
 * based on authentication state with support for animations, fallbacks, and
 * role-based access control.
 *
 * @example
 * ```tsx
 * <AuthGatedElements
 *   authState={authState}
 *   showWhen={AuthGateMode.AUTHENTICATED}
 *   animation={AnimationType.FADE}
 *   fallback={<LoginPrompt />}
 * >
 *   <Dashboard />
 * </AuthGatedElements>
 * ```
 */
const AuthGatedElements = React.forwardRef<HTMLDivElement, AuthGatedElementsProps>(
  (
    {
      children,
      authState,
      showWhen = AuthGateMode.ANY,
      animation,
      animationDuration = 300,
      fallback,
      className,
      style,
      ariaLabel,
      loadingFallback,
      requiredRole,
      onAuthStateChange,
      testId,
    }: AuthGatedElementsProps,
    ref: React.ForwardedRef<HTMLDivElement>
  ) => {
    // Notify parent of auth state changes
    React.useEffect(() => {
      onAuthStateChange?.(authState);
    }, [authState, onAuthStateChange]);

    // Calculate visibility
    const isVisible = useMemo(
      () => isContentVisible(authState, showWhen, requiredRole),
      [authState, showWhen, requiredRole]
    );

    // Calculate animation styles
    const animationStyles = useMemo(
      () => getAnimationStyles(animation, isVisible, animationDuration),
      [animation, isVisible, animationDuration]
    );

    // Handle loading state
    if (authState.isLoading) {
      if (loadingFallback) {
        return <>{loadingFallback}</>;
      }
      // Don't render anything during loading if no loadingFallback provided
      return null;
    }

    // Handle gated content
    if (!isVisible) {
      if (fallback) {
        if (typeof fallback === 'function') {
          const FallbackComponent = fallback as React.ComponentType<FallbackProps>;
          return <FallbackComponent authState={authState} showWhen={showWhen} />;
        }
        return <>{fallback}</>;
      }
      // Don't render hidden content (lazy render)
      return null;
    }

    // Render gated content
    return (
      <div
        ref={ref}
        className={className}
        style={{
          ...style,
          ...animationStyles,
        }}
        aria-label={ariaLabel}
        aria-hidden={!isVisible}
        role="region"
        data-testid={testId}
      >
        {children}
      </div>
    );
  }
);

AuthGatedElements.displayName = 'AuthGatedElements';

export default React.memo(AuthGatedElements);
