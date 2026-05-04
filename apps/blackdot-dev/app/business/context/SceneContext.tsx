"use client";

import { createContext, useContext, ReactNode } from 'react';
import { useThree } from '@react-three/fiber';

/**
 * Scene rendering modes
 * - 'overview': Displayed in overview card (minimal UI)
 * - 'detail': Full detail page view (full UI, annotations, text)
 */
export type SceneMode = 'overview' | 'detail';

export interface SceneContextValue {
  /** Current rendering mode */
  mode: SceneMode;
  /** Whether to show annotations (labels, info boxes, etc.) */
  showAnnotations: boolean;
  /** Whether to show text overlays */
  showText: boolean;
}

const defaultContextValue: SceneContextValue = {
  mode: 'detail',
  showAnnotations: true,
  showText: true,
};

const SceneContext = createContext<SceneContextValue>(defaultContextValue);

export interface SceneProviderProps {
  children: ReactNode;
  /** Scene rendering mode */
  mode?: SceneMode;
  /** Override annotation visibility */
  showAnnotations?: boolean;
  /** Override text visibility */
  showText?: boolean;
}

/**
 * SceneContext Provider - Lightweight wrapper for conditional rendering
 * Uses native R3F patterns - leverages existing portal detection via useThree
 */
export function SceneProvider({
  children,
  mode = 'detail',
  showAnnotations,
  showText,
}: SceneProviderProps) {
  // Determine defaults based on mode
  const defaultShowAnnotations = mode === 'detail';
  const defaultShowText = mode !== 'overview';
  
  const value: SceneContextValue = {
    mode,
    showAnnotations: showAnnotations ?? defaultShowAnnotations,
    showText: showText ?? defaultShowText,
  };

  return (
    <SceneContext.Provider value={value}>
      {children}
    </SceneContext.Provider>
  );
}

/**
 * Hook to access scene context
 * Uses native R3F useThree for portal detection (already used in scenes)
 */
export function useSceneContext(): SceneContextValue {
  const context = useContext(SceneContext);
  if (context === undefined) {
    // Return default if used outside provider (backward compatibility)
    return defaultContextValue;
  }
  return context;
}

/**
 * Hook to detect portal context using native R3F pattern
 * This is the same pattern already used in BusinessScene.tsx, etc.
 * Note: This hook should only be called inside a Canvas element.
 */
export function useIsPortal(): boolean {
  let previousRoot: unknown = null;
  try {
    const threeState = useThree();
    previousRoot = threeState.previousRoot;
  } catch {
    // If useThree fails (outside Canvas), not in portal
    // This is expected when hook is called outside Canvas
  }
  return !!previousRoot;
}




