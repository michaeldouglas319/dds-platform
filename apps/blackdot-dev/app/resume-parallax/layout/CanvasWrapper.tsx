'use client'

import { StandardCanvas } from '@/components/three'
import { ReactNode } from 'react'

interface CanvasWrapperProps {
  children: ReactNode
  [key: string]: any
}

/**
 * CanvasWrapper - Simple Canvas wrapper for debugging
 */
export function CanvasWrapper({ children, ...props }: CanvasWrapperProps) {
  return (
    <StandardCanvas
      {...props}
      route="resume-parallax"
      componentName="CanvasWrapper"
    >
      {children}
    </StandardCanvas>
  )
}
