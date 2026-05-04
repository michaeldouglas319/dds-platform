/**
 * Type definitions for landing page auth state
 *
 * Single source of truth for all state-related types
 */

import React from 'react';
import { AccessLevel, type AccessLevelType } from '@/lib/types/auth.types';

export type LandingAuthState = 'loading' | 'unauthenticated' | 'authenticating' | 'authenticated';

export interface LandingAuthStateContext {
  // Current state
  state: LandingAuthState;
  isAuthenticated: boolean;
  accessLevel: AccessLevelType;

  // Transition info
  isTransitioning: boolean;
  transitionProgress: number;

  // Resolved flags
  isResolved: boolean;
  isLoading: boolean;

  // Access level checks
  isMemberOrHigher: boolean;
  isPremiumOrHigher: boolean;
  isAdmin: boolean;
}

export interface LandingAuthConfig {
  transitionDuration: number;
  overlayFadeInDuration: number;
  overlayFadeOutDuration: number;
  navFadeInDuration: number;
  navFadeInDelay: number;
  staggerDelay: number;
}

export const DEFAULT_AUTH_CONFIG: LandingAuthConfig = {
  transitionDuration: 500,
  overlayFadeInDuration: 400,
  overlayFadeOutDuration: 300,
  navFadeInDuration: 500,
  navFadeInDelay: 100,
  staggerDelay: 50,
};

/**
 * Custom hook for managing landing page authentication state
 *
 * @param initialState - The initial authentication state
 * @returns Object containing auth state and methods
 */
export function useLandingState(initialState: LandingAuthState = 'unauthenticated') {
  const [authState, setAuthState] = React.useState<LandingAuthState>(initialState);
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [transitionProgress, setTransitionProgress] = React.useState(0);

  const signIn = React.useCallback(async (email: string, password: string) => {
    try {
      setIsTransitioning(true);
      setAuthState('authenticating');
      // Simulate auth delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      setAuthState('authenticated');
      setIsTransitioning(false);
    } catch (error) {
      console.error('Sign in error:', error);
      setAuthState('unauthenticated');
      setIsTransitioning(false);
      throw error;
    }
  }, []);

  const signOut = React.useCallback(async () => {
    try {
      setIsTransitioning(true);
      setAuthState('unauthenticated');
      // Simulate sign out delay
      await new Promise((resolve) => setTimeout(resolve, 300));
      setIsTransitioning(false);
    } catch (error) {
      console.error('Sign out error:', error);
      setIsTransitioning(false);
      throw error;
    }
  }, []);

  return {
    authState,
    setAuthState,
    isTransitioning,
    setIsTransitioning,
    transitionProgress,
    setTransitionProgress,
    signIn,
    signOut,
  };
}