'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export type PhysicsMode = 'custom' | 'rapier';

interface PhysicsModeContextType {
  mode: PhysicsMode;
  debugPhysics: boolean;
  setMode: (mode: PhysicsMode) => void;
  toggleDebug: () => void;
  setDebug: (enabled: boolean) => void;
}

/**
 * Physics Mode Context
 *
 * Manages switching between custom velocity-based physics and React Three Rapier.
 * Allows parallel development and testing of both systems.
 */
const PhysicsModeContext = createContext<PhysicsModeContextType | undefined>(
  undefined
);

export function PhysicsModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<PhysicsMode>('custom');
  const [debugPhysics, setDebugPhysics] = useState(false);

  return (
    <PhysicsModeContext.Provider
      value={{
        mode,
        debugPhysics,
        setMode,
        toggleDebug: () => setDebugPhysics((prev) => !prev),
        setDebug: setDebugPhysics,
      }}
    >
      {children}
    </PhysicsModeContext.Provider>
  );
}

export function usePhysicsMode(): PhysicsModeContextType {
  const context = useContext(PhysicsModeContext);
  if (!context) {
    throw new Error(
      'usePhysicsMode must be used within PhysicsModeProvider'
    );
  }
  return context;
}

/**
 * Helper hook to check if using Rapier physics
 */
export function useIsRapierMode(): boolean {
  return usePhysicsMode().mode === 'rapier';
}

/**
 * Helper hook to check if physics debug is enabled
 */
export function usePhysicsDebug(): boolean {
  return usePhysicsMode().debugPhysics;
}
