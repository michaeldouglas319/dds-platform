/**
 * Type definitions for landing page auth state
 *
 * Single source of truth for all state-related types
 */

import { AccessLevel, type AccessLevelType } from '@/lib/types/auth.types';

export type LandingAuthState = 'loading' | 'unauthenticated' | 'authenticated';

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