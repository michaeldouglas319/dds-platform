'use client';

import { useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { BubbleButtonLayout } from '@/components/bubble/BubbleButtonLayout';
import { useFeaturedRoutes } from '@/lib/hooks/useFeaturedRoutes';
import { useAuth } from '@/lib/contexts/AuthContext';
import { AccessLevel, AccessLevelWeight } from '@/lib/types/auth.types';
import { useClerk } from '@clerk/nextjs';

export interface NavigationDockProps {
  /** Position in 3D space */
  position?: [number, number, number];

  /** Scale of the buttons */
  scale?: number;

  /** Layout variant: horizontal or vertical */
  layout?: 'horizontal' | 'vertical';

  /** Spacing between buttons */
  spacing?: number;

  /** Current breakpoint for responsive behavior */
  breakpoint?: 'mobile' | 'tablet' | 'desktop';
}

/**
 * NavigationDock - 3D navigation using BubbleButtonLayout
 *
 * Features:
 * - Renders featured routes as interactive 3D buttons
 * - Auth-aware (shows login for non-members)
 * - Responsive layout (horizontal for desktop, vertical for mobile)
 * - Smooth navigation on click
 *
 * @example
 * ```tsx
 * <NavigationDock
 *   position={[0, -5, 0]}
 *   layout="horizontal"
 *   breakpoint="desktop"
 * />
 * ```
 */
export const NavigationDock = ({
  position = [0, -5, 0],
  scale = 1.0,
  layout = 'horizontal',
  spacing = 1.5,
  breakpoint = 'desktop',
}: NavigationDockProps) => {
  const router = useRouter();
  const { featuredRoutes, loading } = useFeaturedRoutes();
  const { accessLevel } = useAuth();
  const hasAccess = AccessLevelWeight[accessLevel] >= AccessLevelWeight[AccessLevel.MEMBER];
  const { openSignIn } = useClerk();

  // Get responsive button count based on breakpoint
  const getButtonCount = (): number => {
    switch (breakpoint) {
      case 'mobile':
        return 3;
      case 'tablet':
        return 4;
      case 'desktop':
      default:
        return Math.min(6, featuredRoutes.length);
    }
  };

  // Get responsive scale based on breakpoint
  const getButtonScale = (): number => {
    switch (breakpoint) {
      case 'mobile':
        return 0.35; // Larger for touch
      case 'tablet':
        return 0.28;
      case 'desktop':
      default:
        return 0.22;
    }
  };

  const buttonCount = getButtonCount();
  const buttonScale = getButtonScale();

  // Build button layout positions
  const getButtonPositions = useCallback((): [number, number, number][] => {
    const positions: [number, number, number][] = [];
    const count = Math.min(buttonCount, featuredRoutes.length);

    if (layout === 'vertical') {
      // Vertical stack on right side
      const startY = (count - 1) * spacing * 0.5;
      for (let i = 0; i < count; i++) {
        positions.push([2.5, startY - i * spacing, 0]);
      }
    } else {
      // Horizontal dock at bottom
      const startX = (count - 1) * spacing * -0.5;
      for (let i = 0; i < count; i++) {
        positions.push([startX + i * spacing, 0, 0]);
      }
    }

    return positions;
  }, [buttonCount, spacing, layout, featuredRoutes.length]);

  const buttonPositions = useMemo(
    () => getButtonPositions(),
    [getButtonPositions]
  );

  if (loading) return null;

  // Hide navigation dock when not authenticated - the 3D SignIn form handles that
  if (!hasAccess) {
    return null;
  }

  // Render featured routes as buttons
  const visibleRoutes = featuredRoutes.slice(0, buttonCount);

  return (
    <group position={position} scale={scale}>
      {visibleRoutes.map((route, index) => (
        <group key={route.id} position={buttonPositions[index]}>
          <BubbleButtonLayout
            position={[0, 0, 0]}
            scale={buttonScale}
            title={{
              content: route.label,
              fontSize: 0.6,
              color: '#ffffff',
            }}
            hoverColor="#06B6D4"
            color="white"
            onClick={() => router.push(route.path)}
            clickable={true}
          />
        </group>
      ))}
    </group>
  );
};

export default NavigationDock;
