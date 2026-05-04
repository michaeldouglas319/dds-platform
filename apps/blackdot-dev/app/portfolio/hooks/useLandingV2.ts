import { useCallback, useEffect, useRef, useState } from 'react';
import {
  LandingV2Config,
  DEFAULT_LANDING_V2_CONFIG,
  OrbitalElementConfig,
} from '../pages/landings/LandingV2.types';

/**
 * Hook for managing LandingV2 state and configuration
 */
export interface UseLandingV2Options {
  config?: Partial<LandingV2Config>;
  onSignInSuccess?: () => void;
  onSignOutSuccess?: () => void;
}

export interface UseLandingV2State {
  config: LandingV2Config;
  setConfig: (config: Partial<LandingV2Config>) => void;
  isAnimating: boolean;
  setIsAnimating: (value: boolean) => void;
  updateSceneConfig: (config: Partial<LandingV2Config['scene']>) => void;
  updateHeroConfig: (config: Partial<LandingV2Config['hero']>) => void;
  updateAnimationConfig: (config: Partial<LandingV2Config['animation']>) => void;
  updatePerformanceConfig: (config: Partial<LandingV2Config['performance']>) => void;
  getOrbitalElements: () => OrbitalElementConfig[];
  resetConfig: () => void;
}

/**
 * Generate orbital element configurations
 */
function generateOrbitalElements(count: number): OrbitalElementConfig[] {
  const colors = ['#ff6b9d', '#00ff88', '#ffd700', '#ff3366', '#00ddff'];
  const speeds = [1.5, 1.0, 0.7, 1.2, 0.85];
  const radii = [4, 6, 8, 5, 7];
  const sizes = [0.4, 0.5, 0.35, 0.38, 0.45];

  return Array.from({ length: Math.min(count, colors.length) }, (_, i) => ({
    orbitRadius: radii[i],
    speed: speeds[i],
    color: colors[i],
    size: sizes[i],
    rotationAxis: [0, 1, 0],
    delay: i * 500,
  }));
}

/**
 * Custom hook for managing LandingV2 component state
 *
 * @example
 * ```tsx
 * const landing = useLandingV2({
 *   config: { scene: { particleCount: 50 } },
 *   onSignInSuccess: () => navigate('/dashboard'),
 * });
 *
 * return <LandingV2 />;
 * ```
 */
export function useLandingV2(options: UseLandingV2Options = {}): UseLandingV2State {
  const { config: customConfig, onSignInSuccess, onSignOutSuccess } = options;

  const [config, setConfigState] = useState<LandingV2Config>(() => ({
    ...DEFAULT_LANDING_V2_CONFIG,
    ...customConfig,
    scene: {
      ...DEFAULT_LANDING_V2_CONFIG.scene,
      ...(customConfig?.scene || {}),
    },
    hero: {
      ...DEFAULT_LANDING_V2_CONFIG.hero,
      ...(customConfig?.hero || {}),
    },
    overlay: {
      ...DEFAULT_LANDING_V2_CONFIG.overlay,
      ...(customConfig?.overlay || {}),
    },
    animation: {
      ...DEFAULT_LANDING_V2_CONFIG.animation,
      ...(customConfig?.animation || {}),
    },
    performance: {
      ...DEFAULT_LANDING_V2_CONFIG.performance,
      ...(customConfig?.performance || {}),
    },
  }));

  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const setConfig = useCallback((newConfig: Partial<LandingV2Config>) => {
    setConfigState((prev) => ({
      ...prev,
      ...newConfig,
      scene: { ...prev.scene, ...(newConfig.scene || {}) },
      hero: { ...prev.hero, ...(newConfig.hero || {}) },
      overlay: { ...prev.overlay, ...(newConfig.overlay || {}) },
      animation: { ...prev.animation, ...(newConfig.animation || {}) },
      performance: { ...prev.performance, ...(newConfig.performance || {}) },
    }));
  }, []);

  const updateSceneConfig = useCallback((sceneConfig: Partial<LandingV2Config['scene']>) => {
    setConfigState((prev) => ({
      ...prev,
      scene: { ...prev.scene, ...sceneConfig },
    }));
  }, []);

  const updateHeroConfig = useCallback((heroConfig: Partial<LandingV2Config['hero']>) => {
    setConfigState((prev) => ({
      ...prev,
      hero: { ...prev.hero, ...heroConfig },
    }));
  }, []);

  const updateAnimationConfig = useCallback(
    (animationConfig: Partial<LandingV2Config['animation']>) => {
      setConfigState((prev) => ({
        ...prev,
        animation: { ...prev.animation, ...animationConfig },
      }));
    },
    []
  );

  const updatePerformanceConfig = useCallback(
    (performanceConfig: Partial<LandingV2Config['performance']>) => {
      setConfigState((prev) => ({
        ...prev,
        performance: { ...prev.performance, ...performanceConfig },
      }));
    },
    []
  );

  const getOrbitalElements = useCallback(
    (): OrbitalElementConfig[] => generateOrbitalElements(config.scene.orbitalElementCount),
    [config.scene.orbitalElementCount]
  );

  const resetConfig = useCallback(() => {
    setConfigState(DEFAULT_LANDING_V2_CONFIG);
  }, []);

  return {
    config,
    setConfig,
    isAnimating,
    setIsAnimating,
    updateSceneConfig,
    updateHeroConfig,
    updateAnimationConfig,
    updatePerformanceConfig,
    getOrbitalElements,
    resetConfig,
  };
}
