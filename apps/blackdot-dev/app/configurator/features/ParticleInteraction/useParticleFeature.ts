'use client';

import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'particle-feature-state';

export interface ParticleFeatureState {
  enabled: boolean;
  particleCount: number;
  handBounceRatio: number;
  handForce: number;
  gravity: number;
}

export interface UseParticleFeatureReturn extends ParticleFeatureState {
  toggle: () => void;
  setParticleCount: (count: number) => void;
  setHandBounceRatio: (ratio: number) => void;
  setHandForce: (force: number) => void;
  setGravity: (gravity: number) => void;
  reset: () => void;
}

const defaultState: ParticleFeatureState = {
  enabled: false,
  particleCount: 32768, // 181×181 FBO
  handBounceRatio: 0.1,
  handForce: 0.015,
  gravity: 20, // Strong gravity for cascade effect
};

/**
 * Hook for managing particle interaction feature state
 * Persists to localStorage for user preferences
 */
export function useParticleFeature(): UseParticleFeatureReturn {
  const [state, setState] = useState<ParticleFeatureState>(defaultState);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setState({
          enabled: parsed.enabled ?? defaultState.enabled,
          particleCount: parsed.particleCount ?? defaultState.particleCount,
          handBounceRatio: parsed.handBounceRatio ?? defaultState.handBounceRatio,
          handForce: parsed.handForce ?? defaultState.handForce,
          gravity: parsed.gravity ?? defaultState.gravity,
        });
      }
    } catch (error) {
      console.warn('Failed to load particle feature state from localStorage:', error);
    }

    setIsInitialized(true);
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (!isInitialized || typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save particle feature state to localStorage:', error);
    }
  }, [state, isInitialized]);

  const toggle = useCallback(() => {
    setState((prev) => ({
      ...prev,
      enabled: !prev.enabled,
    }));
  }, []);

  const setParticleCount = useCallback((count: number) => {
    setState((prev) => ({
      ...prev,
      particleCount: count,
    }));
  }, []);

  const setHandBounceRatio = useCallback((ratio: number) => {
    setState((prev) => ({
      ...prev,
      handBounceRatio: ratio,
    }));
  }, []);

  const setHandForce = useCallback((force: number) => {
    setState((prev) => ({
      ...prev,
      handForce: force,
    }));
  }, []);

  const setGravity = useCallback((gravity: number) => {
    setState((prev) => ({
      ...prev,
      gravity: gravity,
    }));
  }, []);

  const reset = useCallback(() => {
    setState(defaultState);
  }, []);

  return {
    enabled: state.enabled,
    particleCount: state.particleCount,
    handBounceRatio: state.handBounceRatio,
    handForce: state.handForce,
    gravity: state.gravity,
    toggle,
    setParticleCount,
    setHandBounceRatio,
    setHandForce,
    setGravity,
    reset,
  };
}
