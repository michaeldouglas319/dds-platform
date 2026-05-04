/**
 * Type definitions for configurator state management
 */

import type { MaterialConfig } from '../types';

export type ViewportQuality = 'low' | 'medium' | 'high' | 'auto';
export type EnvironmentType = 'studio' | 'sunset' | 'warehouse' | 'custom' | 'none';
export type LightingTheme = 'studio' | 'sunset' | 'warehouse' | 'minimal';

export interface ConfiguratorUIState {
  // Viewport settings
  viewportQuality: ViewportQuality;
  showGrid: boolean;
  showStats: boolean;
  panelSize: number; // Viewport width percentage (0-100)

  // Environment
  environment: EnvironmentType;
  lightingTheme: LightingTheme;
  lightingIntensity: number;
  environmentIntensity: number;

  // Product configuration
  selectedProductId?: string;
  materials: Record<string, Record<string, MaterialConfig>>;
  visibility: Record<string, Record<string, boolean>>;

  // UI state
  isLoading: boolean;
  error?: Error | null;
}

export interface ConfiguratorActions {
  setViewportQuality: (quality: ViewportQuality) => void;
  toggleGrid: () => void;
  toggleStats: () => void;
  setPanelSize: (size: number) => void;
  setEnvironment: (env: EnvironmentType) => void;
  setLightingTheme: (theme: LightingTheme) => void;
  setLightingIntensity: (intensity: number) => void;
  setEnvironmentIntensity: (intensity: number) => void;

  // Product selection and configuration
  setSelectedProduct: (productId?: string) => void;
  updateMaterial: (productId: string, partName: string, material: MaterialConfig) => void;
  updateVisibility: (productId: string, partName: string, visible: boolean) => void;
  resetProductConfig: (productId: string) => void;

  // General configuration
  updateConfiguration: (key: string, value: unknown) => void;
  resetConfiguration: () => void;

  // UI state
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  reset: () => void;
}

export type ConfiguratorState = ConfiguratorUIState;

export interface UseConfiguratorStateReturn
  extends ConfiguratorUIState,
    ConfiguratorActions {}
