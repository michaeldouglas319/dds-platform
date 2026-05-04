'use client'

import { useRef, useEffect } from 'react'

/**
 * Keyboard input state interface
 */
export interface KeyboardControls {
  forward: boolean
  backward: boolean
  left: boolean
  right: boolean
  jump: boolean
}

/**
 * Hook for tracking WASD + Space keyboard input
 *
 * Uses useRef instead of useState to avoid re-renders on every keypress.
 * This is important for physics simulations where we need fast, responsive input.
 *
 * @returns Reference to current keyboard state
 */
export function useKeyboardControls() {
  const keysRef = useRef<KeyboardControls>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()

      switch (key) {
        case 'w':
          keysRef.current.forward = true
          e.preventDefault()
          break
        case 's':
          keysRef.current.backward = true
          e.preventDefault()
          break
        case 'a':
          keysRef.current.left = true
          e.preventDefault()
          break
        case 'd':
          keysRef.current.right = true
          e.preventDefault()
          break
        case ' ':
          keysRef.current.jump = true
          e.preventDefault()
          break
        default:
          break
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()

      switch (key) {
        case 'w':
          keysRef.current.forward = false
          break
        case 's':
          keysRef.current.backward = false
          break
        case 'a':
          keysRef.current.left = false
          break
        case 'd':
          keysRef.current.right = false
          break
        case ' ':
          keysRef.current.jump = false
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  return keysRef
}
