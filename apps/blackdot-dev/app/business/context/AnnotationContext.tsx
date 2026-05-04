"use client";

/**
 * Annotation Navigation Ref
 * Shared ref for navigation function that works across Canvas boundary
 * React contexts don't work across Canvas, so we use a shared ref instead
 */

import { useRef, useCallback } from 'react';

// Global ref to store navigation function
const navigationRef = { current: null as ((id: string) => void) | null };

export function registerNavigation(navigateFn: (id: string) => void) {
  navigationRef.current = navigateFn;
}

export function navigateToAnnotation(id: string) {
  if (navigationRef.current) {
    navigationRef.current(id);
  } else {
    console.warn('Navigation function not registered yet');
  }
}

/**
 * Hook to get navigation function
 * Use this outside the Canvas
 */
export function useAnnotationNavigation() {
  const navigateTo = useCallback((id: string) => {
    navigateToAnnotation(id);
  }, []);

  return { navigateTo };
}

