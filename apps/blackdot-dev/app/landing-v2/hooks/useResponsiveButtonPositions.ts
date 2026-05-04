'use client'

import { useThree } from '@react-three/fiber'
import { useMemo } from 'react'

export interface ResponsivePositionConfig {
  bottomY?: number
  spacing?: number
  zDepth?: number
}

/**
 * Hook to calculate responsive button positions based on viewport size
 * Adjusts spacing, vertical position, and width distribution for mobile/tablet/desktop
 *
 * @param buttonCount - Number of buttons to position
 * @param baseConfig - Configuration for base positions and spacing
 * @returns Array of [x, y, z] position tuples
 */
export function useResponsiveButtonPositions(
  buttonCount: number,
  baseConfig: ResponsivePositionConfig = {}
) {
  const viewport = useThree((state) => state.viewport)
  const size = useThree((state) => state.size)

  const positions = useMemo(() => {
    // Breakpoints based on pixel width
    const isMobile = size.width < 768
    const isTablet = size.width >= 768 && size.width < 1024
    const isDesktop = size.width >= 1024

    // Responsive spacing (Three.js units)
    // Mobile: more compact, tablet: medium, desktop: original
    const baseSpacing = baseConfig.spacing ?? 0.7
    const spacing = isMobile ? baseSpacing * 0.57 : isTablet ? baseSpacing * 0.79 : baseSpacing

    // Responsive Y position (vertical)
    // Mobile: lower for easier thumb reach on small screens
    // Tablet: medium
    // Desktop: original position
    const baseBottomY = baseConfig.bottomY ?? -1.2
    const bottomY = isMobile
      ? baseBottomY + 0.4
      : isTablet
        ? baseBottomY + 0.2
        : baseBottomY

    // Z depth (stays same across breakpoints)
    const zDepth = baseConfig.zDepth ?? 0

    // Use viewport width (Three.js units) for positioning
    // viewport.width represents the Three.js world width visible on screen
    const availableWidth = viewport.width * 0.85 // Use 85% of viewport width
    const totalWidth = (buttonCount - 1) * spacing

    const positions: [number, number, number][] = []

    if (totalWidth <= availableWidth) {
      // Method 1: Fixed spacing, center the group
      // When buttons can fit with their natural spacing, center them
      const startX = -totalWidth / 2
      for (let i = 0; i < buttonCount; i++) {
        positions.push([startX + i * spacing, bottomY, zDepth])
      }
    } else {
      // Method 2: Distribute evenly across available width
      // When buttons don't fit with natural spacing, spread them out
      const stepX = availableWidth / Math.max(1, buttonCount - 1)
      const startX = -availableWidth / 2
      for (let i = 0; i < buttonCount; i++) {
        positions.push([startX + i * stepX, bottomY, zDepth])
      }
    }

    return positions
  }, [viewport.width, viewport.height, size.width, buttonCount, baseConfig.spacing, baseConfig.bottomY, baseConfig.zDepth])

  return positions
}
