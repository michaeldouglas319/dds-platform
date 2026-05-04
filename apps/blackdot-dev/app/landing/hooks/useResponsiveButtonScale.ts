'use client'

import { useThree } from '@react-three/fiber'
import { useMemo } from 'react'

/**
 * Hook to calculate responsive button scale based on viewport size
 * Scales down buttons on mobile devices to prevent overflow and maintain visual balance
 *
 * @param baseScale - Base scale value (default: 1)
 * @returns Responsive scale factor
 */
export function useResponsiveButtonScale(baseScale: number = 1): number {
  const size = useThree((state) => state.size)

  const scale = useMemo(() => {
    // Mobile: 70% of base scale
    if (size.width < 768) return baseScale * 0.7
    // Tablet: 85% of base scale
    if (size.width < 1024) return baseScale * 0.85
    // Desktop: full base scale
    return baseScale
  }, [size.width, baseScale])

  return scale
}
