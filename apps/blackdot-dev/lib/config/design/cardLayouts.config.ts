/**
 * Card Layout Configuration System
 *
 * Defines layout presets and position calculation functions for
 * dynamically positioning cards in 3D space. Supports 5 layout patterns
 * with automatic scaling based on card count.
 *
 * @category configuration
 */

import {
  getCircularPositions,
  getGridPositions,
  getStackPositions,
  getPathPositions,
  helixPath
} from '@/lib/loaders/arrangements'

export type CardLayoutType = 'arc' | 'circular' | 'grid' | 'sides' | 'helix'

export interface CardLayoutConfig {
  type: CardLayoutType
  baseRadius: number
  radiusScale: number // Scale factor per additional card
  height: number // Y offset for cards
  angleRange?: number // For arc layouts (degrees)
  columns?: number // For grid layouts
  rows?: number // For grid layouts
}

/**
 * Arc arrangement positions
 * Creates a 140° semicircle above the model
 * Cards arranged in a gentle arc pattern
 */
function getArcPositions(
  count: number,
  radius: number
): [number, number, number][] {
  const angleRange = (140 * Math.PI) / 180 // 140 degrees in radians
  const startAngle = -angleRange / 2 // Start at -70°

  return Array.from({ length: count }).map((_, i) => {
    const angle = startAngle + (i / (count - 1)) * angleRange
    return [
      Math.cos(angle) * radius,
      1, // Slight upward offset
      Math.sin(angle) * radius
    ]
  })
}

/**
 * Sides arrangement positions
 * Splits cards left and right of the model
 */
function getSidesPositions(
  count: number,
  spacing: number
): [number, number, number][] {
  const positions: [number, number, number][] = []
  const leftCount = Math.ceil(count / 2)
  const rightCount = count - leftCount

  // Left side (negative X)
  for (let i = 0; i < leftCount; i++) {
    const yOffset = (i - (leftCount - 1) / 2) * spacing
    positions.push([-8, yOffset + 1, 0])
  }

  // Right side (positive X)
  for (let i = 0; i < rightCount; i++) {
    const yOffset = (i - (rightCount - 1) / 2) * spacing
    positions.push([8, yOffset + 1, 0])
  }

  return positions
}

/**
 * Calculate auto-scaling radius based on card count
 * Prevents overlap while using space efficiently
 */
function calculateAutoScaledRadius(count: number, baseRadius: number): number {
  // Formula: Start with base radius, increase by 1.5 for each card over 3
  if (count <= 3) return baseRadius
  return baseRadius + (count - 3) * 1.5
}

/**
 * Calculate positions for given layout type and card count
 * Automatically scales radius/spacing based on card count
 */
export function calculateCardPositions(
  cardCount: number,
  layoutConfig: CardLayoutConfig
): [number, number, number][] {
  // Auto-scale radius based on card count
  const scaledRadius = calculateAutoScaledRadius(cardCount, layoutConfig.baseRadius)

  switch (layoutConfig.type) {
    case 'arc':
      return getArcPositions(cardCount, scaledRadius).map(([x, y, z]) => [
        x,
        y + layoutConfig.height,
        z
      ])

    case 'circular':
      return getCircularPositions(cardCount, scaledRadius).map(([x, y, z]) => [
        x,
        y + layoutConfig.height,
        z
      ])

    case 'grid': {
      // Determine grid dimensions based on card count
      const columns = layoutConfig.columns || Math.ceil(Math.sqrt(cardCount))
      const rows = layoutConfig.rows || Math.ceil(cardCount / columns)
      const spacing = Math.max(3, 12 / Math.sqrt(cardCount)) // Auto-scale spacing

      return getGridPositions(columns, rows, spacing, true).map(([x, y, z]) => [
        x,
        layoutConfig.height,
        y // Grid uses Y for row offset, we repurpose as Z for visual arrangement
      ])
    }

    case 'sides':
      return getSidesPositions(cardCount, 3).map(([x, y, z]) => [x, y, z])

    case 'helix': {
      const helixRadius = Math.max(4, scaledRadius * 0.8)
      const helixHeight = Math.min(8, cardCount * 0.8)
      const turns = Math.ceil(cardCount / 6) // One turn per 6 cards

      return getPathPositions(cardCount, helixPath(helixRadius, helixHeight, turns)).map(
        ([x, y, z]) => [x, y + layoutConfig.height, z]
      )
    }

    default:
      return []
  }
}

/**
 * Layout presets for common patterns
 */
export const CARD_LAYOUT_PRESETS: Record<CardLayoutType, CardLayoutConfig> = {
  arc: {
    type: 'arc',
    baseRadius: 8,
    radiusScale: 1.5,
    height: 6,
    angleRange: 140
  },
  circular: {
    type: 'circular',
    baseRadius: 8,
    radiusScale: 1.5,
    height: 5
  },
  grid: {
    type: 'grid',
    baseRadius: 6,
    radiusScale: 1,
    height: 5,
    columns: 2,
    rows: 3
  },
  sides: {
    type: 'sides',
    baseRadius: 8,
    radiusScale: 1,
    height: 1
  },
  helix: {
    type: 'helix',
    baseRadius: 6,
    radiusScale: 1.2,
    height: 0
  }
}

/**
 * Get layout preset by name or return custom config
 */
export function getLayoutConfig(
  layoutName: CardLayoutType | CardLayoutConfig
): CardLayoutConfig {
  if (typeof layoutName === 'string') {
    return CARD_LAYOUT_PRESETS[layoutName] || CARD_LAYOUT_PRESETS.arc
  }
  return layoutName
}
