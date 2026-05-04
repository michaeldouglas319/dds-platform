'use client'

/**
 * InteractiveScene - Scene with UI controls
 * 
 * Scene component with integrated shadcn UI controls for 3D interactions.
 * 
 * @category three
 * @layer 2
 */

import React, { useState } from 'react'
import { BaseScene } from './BaseScene'
import { ThreeUIPanel } from '../ThreeUI'
import type { BaseSceneProps } from './BaseScene'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export interface InteractiveSceneProps extends BaseSceneProps {
  /**
   * Show UI controls panel
   */
  showControls?: boolean

  /**
   * Control panel position
   */
  controlsPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

  /**
   * Custom controls content
   */
  controlsContent?: React.ReactNode

  /**
   * Scene content
   */
  children?: React.ReactNode
}

/**
 * InteractiveScene Component
 * 
 * @example
 * ```tsx
 * <InteractiveScene showControls>
 *   <mesh>
 *     <boxGeometry />
 *     <meshStandardMaterial />
 *   </mesh>
 * </InteractiveScene>
 * ```
 */
export function InteractiveScene({
  showControls = true,
  controlsPosition = 'top-right',
  controlsContent,
  children,
  ...baseSceneProps
}: InteractiveSceneProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <>
      <BaseScene {...baseSceneProps}>
        {children}
      </BaseScene>

      {showControls && (
        <ThreeUIPanel position={controlsPosition}>
          <Card className="w-64">
            <CardHeader>
              <CardTitle>Scene Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {controlsContent || (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-full"
                  >
                    {isPlaying ? 'Pause' : 'Play'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </ThreeUIPanel>
      )}
    </>
  )
}
