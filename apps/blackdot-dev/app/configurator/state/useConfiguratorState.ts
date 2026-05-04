'use client';

import { useReducer, useCallback, useEffect } from 'react';
import type {
  ConfiguratorState,
  ConfiguratorActions,
  UseConfiguratorStateReturn,
  ViewportQuality,
  EnvironmentType,
  LightingTheme,
} from './types';
import type { MaterialConfig } from '../types';

const STORAGE_KEY = 'configurator-state';

const defaultState: ConfiguratorState = {
  // Viewport
  viewportQuality: 'auto',
  showGrid: false,
  showStats: false,
  panelSize: 70,

  // Environment
  environment: 'studio',
  lightingTheme: 'studio',
  lightingIntensity: 1,
  environmentIntensity: 1.5,

  // Product configuration
  selectedProductId: undefined,
  materials: {},
  visibility: {},

  // UI
  isLoading: false,
  error: null,
};

/**
 * Initialize state from localStorage if available
 * Falls back to defaultState if localStorage is unavailable or corrupted
 * Only runs on client-side first render due to lazy initializer pattern
 */
function initializeStateFromStorage(): ConfiguratorState {
  // Server-side safety check
  if (typeof window === 'undefined') {
    return defaultState;
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ No saved state found, using defaults');
      }
      return defaultState;
    }

    const parsed = JSON.parse(saved);
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Loaded state from localStorage:', {
        hasSelectedProduct: !!parsed.selectedProductId,
        materialsCount: Object.keys(parsed.materials ?? {}).length,
        visibilityCount: Object.keys(parsed.visibility ?? {}).length,
      });
    }

    // Merge with defaults to ensure all required fields exist
    return {
      viewportQuality: parsed.viewportQuality ?? defaultState.viewportQuality,
      showGrid: parsed.showGrid ?? defaultState.showGrid,
      showStats: parsed.showStats ?? defaultState.showStats,
      panelSize: parsed.panelSize ?? defaultState.panelSize,
      environment: parsed.environment ?? defaultState.environment,
      lightingTheme: parsed.lightingTheme ?? defaultState.lightingTheme,
      lightingIntensity: parsed.lightingIntensity ?? defaultState.lightingIntensity,
      environmentIntensity: parsed.environmentIntensity ?? defaultState.environmentIntensity,
      selectedProductId: parsed.selectedProductId,
      materials: parsed.materials ?? {},
      visibility: parsed.visibility ?? {},
      isLoading: false,
      error: null,
    };
  } catch (e) {
    console.error('❌ Failed to load configurator state from storage:', {
      error: e instanceof Error ? e.message : String(e),
    });
    return defaultState;
  }
}

type Action =
  | { type: 'SET_VIEWPORT_QUALITY'; payload: ViewportQuality }
  | { type: 'TOGGLE_GRID' }
  | { type: 'TOGGLE_STATS' }
  | { type: 'SET_PANEL_SIZE'; payload: number }
  | { type: 'SET_ENVIRONMENT'; payload: EnvironmentType }
  | { type: 'SET_LIGHTING_THEME'; payload: LightingTheme }
  | { type: 'SET_LIGHTING_INTENSITY'; payload: number }
  | { type: 'SET_ENVIRONMENT_INTENSITY'; payload: number }
  | { type: 'SET_SELECTED_PRODUCT'; payload?: string }
  | { type: 'UPDATE_MATERIAL'; payload: { productId: string; partName: string; material: MaterialConfig } }
  | { type: 'UPDATE_VISIBILITY'; payload: { productId: string; partName: string; visible: boolean } }
  | { type: 'RESET_PRODUCT_CONFIG'; payload: string }
  | { type: 'UPDATE_CONFIGURATION'; payload: { key: string; value: unknown } }
  | { type: 'RESET_CONFIGURATION' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: Error | null }
  | { type: 'RESET' };

function reducer(state: ConfiguratorState, action: Action): ConfiguratorState {
  switch (action.type) {
    case 'SET_VIEWPORT_QUALITY':
      return { ...state, viewportQuality: action.payload };
    case 'TOGGLE_GRID':
      return { ...state, showGrid: !state.showGrid };
    case 'TOGGLE_STATS':
      return { ...state, showStats: !state.showStats };
    case 'SET_PANEL_SIZE':
      return { ...state, panelSize: action.payload };
    case 'SET_ENVIRONMENT':
      return { ...state, environment: action.payload };
    case 'SET_LIGHTING_THEME':
      return { ...state, lightingTheme: action.payload };
    case 'SET_LIGHTING_INTENSITY':
      return { ...state, lightingIntensity: action.payload };
    case 'SET_ENVIRONMENT_INTENSITY':
      return { ...state, environmentIntensity: action.payload };
    case 'SET_SELECTED_PRODUCT':
      return { ...state, selectedProductId: action.payload };
    case 'UPDATE_MATERIAL':
      return {
        ...state,
        materials: {
          ...state.materials,
          [action.payload.productId]: {
            ...(state.materials[action.payload.productId] || {}),
            [action.payload.partName]: action.payload.material,
          },
        },
      };
    case 'UPDATE_VISIBILITY':
      return {
        ...state,
        visibility: {
          ...state.visibility,
          [action.payload.productId]: {
            ...(state.visibility[action.payload.productId] || {}),
            [action.payload.partName]: action.payload.visible,
          },
        },
      };
    case 'RESET_PRODUCT_CONFIG':
      return {
        ...state,
        materials: {
          ...state.materials,
          [action.payload]: {},
        },
        visibility: {
          ...state.visibility,
          [action.payload]: {},
        },
      };
    case 'UPDATE_CONFIGURATION':
      // Note: configuration property doesn't exist in ConfiguratorState
      // Updating materials instead to store configuration changes
      return {
        ...state,
        materials: {
          ...(state.materials as any),
          [action.payload.key]: action.payload.value,
        },
      } as any;
    case 'RESET_CONFIGURATION':
      // Note: configuration property doesn't exist in ConfiguratorState
      return { ...state, materials: {} } as any;
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'RESET':
      return defaultState;
    default:
      return state;
  }
}

/**
 * Hook for managing configurator state
 * Combines UI state, configuration, and performance settings
 * Persists state to localStorage using lazy initialization
 *
 * @returns Configurator state and actions
 */
export function useConfiguratorState(): UseConfiguratorStateReturn {
  // Use lazy initializer to load from localStorage on first render (client-side only)
  const [state, dispatch] = useReducer(reducer, undefined, initializeStateFromStorage);

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const serialized = JSON.stringify(state);
      localStorage.setItem(STORAGE_KEY, serialized);

      // Debug: Verify storage succeeded
      if (process.env.NODE_ENV === 'development') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
          console.warn('⚠️  State may not have been saved to localStorage');
        }
      }
    } catch (e) {
      console.error('❌ Failed to save configurator state:', {
        error: e instanceof Error ? e.message : String(e),
        stateKeys: Object.keys(state),
      });
    }
  }, [state]);

  // Action creators using useCallback for stability
  const setViewportQuality = useCallback((quality: ViewportQuality) => {
    dispatch({ type: 'SET_VIEWPORT_QUALITY', payload: quality });
  }, []);

  const toggleGrid = useCallback(() => {
    dispatch({ type: 'TOGGLE_GRID' });
  }, []);

  const toggleStats = useCallback(() => {
    dispatch({ type: 'TOGGLE_STATS' });
  }, []);

  const setPanelSize = useCallback((size: number) => {
    dispatch({ type: 'SET_PANEL_SIZE', payload: size });
  }, []);

  const setEnvironment = useCallback((env: EnvironmentType) => {
    dispatch({ type: 'SET_ENVIRONMENT', payload: env });
  }, []);

  const setLightingTheme = useCallback((theme: LightingTheme) => {
    dispatch({ type: 'SET_LIGHTING_THEME', payload: theme });
  }, []);

  const setLightingIntensity = useCallback((intensity: number) => {
    dispatch({ type: 'SET_LIGHTING_INTENSITY', payload: intensity });
  }, []);

  const setEnvironmentIntensity = useCallback((intensity: number) => {
    dispatch({ type: 'SET_ENVIRONMENT_INTENSITY', payload: intensity });
  }, []);

  const setSelectedProduct = useCallback((productId?: string) => {
    dispatch({ type: 'SET_SELECTED_PRODUCT', payload: productId });
  }, []);

  const updateMaterial = useCallback(
    (productId: string, partName: string, material: MaterialConfig) => {
      dispatch({ type: 'UPDATE_MATERIAL', payload: { productId, partName, material } });
    },
    []
  );

  const updateVisibility = useCallback((productId: string, partName: string, visible: boolean) => {
    dispatch({ type: 'UPDATE_VISIBILITY', payload: { productId, partName, visible } });
  }, []);

  const resetProductConfig = useCallback((productId: string) => {
    dispatch({ type: 'RESET_PRODUCT_CONFIG', payload: productId });
  }, []);

  const updateConfiguration = useCallback((key: string, value: unknown) => {
    dispatch({ type: 'UPDATE_CONFIGURATION', payload: { key, value } });
  }, []);

  const resetConfiguration = useCallback(() => {
    dispatch({ type: 'RESET_CONFIGURATION' });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error: Error | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return {
    // State
    ...state,
    // Actions
    setViewportQuality,
    toggleGrid,
    toggleStats,
    setPanelSize,
    setEnvironment,
    setLightingTheme,
    setLightingIntensity,
    setEnvironmentIntensity,
    setSelectedProduct,
    updateMaterial,
    updateVisibility,
    resetProductConfig,
    updateConfiguration,
    resetConfiguration,
    setLoading,
    setError,
    reset,
  };
}
