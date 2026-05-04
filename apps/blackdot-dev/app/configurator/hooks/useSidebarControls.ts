'use client';

import { useCallback, useMemo } from 'react';
import type { MaterialConfig } from '../types';
import { useConfiguratorState } from '../state/useConfiguratorState';

/**
 * Hook for managing all sidebar control interactions
 *
 * Provides a clean, composable API for sidebar functionality:
 * - Product selection
 * - Material customization
 * - Part visibility
 * - Scene settings
 * - Reset/undo operations
 *
 * @example
 * ```tsx
 * const sidebar = useSidebarControls();
 *
 * // Select a product
 * sidebar.product.select('building');
 *
 * // Update material
 * sidebar.material.update('building', 'walls', { defaultColor: '#FF0000' });
 *
 * // Toggle part visibility
 * sidebar.visibility.toggle('building', 'windows');
 *
 * // Change scene settings
 * sidebar.scene.setLightingTheme('sunset');
 * ```
 */
export function useSidebarControls() {
  const state = useConfiguratorState();

  // Product controls
  const product = useMemo(
    () => ({
      selected: state.selectedProductId,
      select: state.setSelectedProduct,
    }),
    [state.selectedProductId, state.setSelectedProduct]
  );

  // Material controls
  const material = useMemo(
    () => ({
      update: (productId: string, partName: string, material: MaterialConfig) => {
        state.updateMaterial(productId, partName, material);
      },
      get: (productId: string, partName: string) => {
        return state.materials[productId]?.[partName];
      },
    }),
    [state.updateMaterial, state.materials]
  );

  // Visibility controls
  const visibility = useMemo(
    () => ({
      toggle: (productId: string, partName: string) => {
        const current = state.visibility[productId]?.[partName] ?? true;
        state.updateVisibility(productId, partName, !current);
      },
      set: (productId: string, partName: string, visible: boolean) => {
        state.updateVisibility(productId, partName, visible);
      },
      toggleAll: (productId: string, visible: boolean) => {
        // TODO: Implement toggle all for a product
        console.log('TODO: toggleAll not yet implemented');
      },
      get: (productId: string, partName: string) => {
        return state.visibility[productId]?.[partName];
      },
    }),
    [state.updateVisibility, state.visibility]
  );

  // Scene settings
  const scene = useMemo(
    () => ({
      lighting: {
        theme: state.lightingTheme,
        setTheme: state.setLightingTheme,
        intensity: state.lightingIntensity,
        setIntensity: state.setLightingIntensity,
      },
      environment: {
        type: state.environment,
        setType: state.setEnvironment,
        intensity: state.environmentIntensity,
        setIntensity: state.setEnvironmentIntensity,
      },
      display: {
        showGrid: state.showGrid,
        toggleGrid: state.toggleGrid,
        showStats: state.showStats,
        toggleStats: state.toggleStats,
      },
    }),
    [
      state.lightingTheme,
      state.setLightingTheme,
      state.lightingIntensity,
      state.setLightingIntensity,
      state.environment,
      state.setEnvironment,
      state.environmentIntensity,
      state.setEnvironmentIntensity,
      state.showGrid,
      state.toggleGrid,
      state.showStats,
      state.toggleStats,
    ]
  );

  // Reset/Configuration
  const config = useMemo(
    () => ({
      reset: state.reset,
      resetProduct: state.resetProductConfig,
      panelSize: state.panelSize,
      setPanelSize: state.setPanelSize,
    }),
    [state.reset, state.resetProductConfig, state.panelSize, state.setPanelSize]
  );

  return {
    product,
    material,
    visibility,
    scene,
    config,
  };
}

export type UseSidebarControls = ReturnType<typeof useSidebarControls>;
