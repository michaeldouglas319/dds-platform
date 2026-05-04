/**
 * MorphTransition Component
 *
 * High-level orchestrator for managing morph state transitions.
 * Provides user interaction triggers and automatic state cycling.
 */

'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import gsap from 'gsap'
import { MorphTransitionConfig, MorphControls, MorphAnimationConfig } from './types'

interface MorphTransitionProps extends MorphTransitionConfig {
  /** Child component with morphRef */
  children: (props: {
    morphRef: React.RefObject<MorphControls | null>
    currentState: number
    isTransitioning: boolean
    nextState: () => void
    previousState: () => void
    goToState: (index: number) => void
  }) => React.ReactNode
}

/**
 * MorphTransition Component
 *
 * Orchestrates morph state transitions with various trigger modes.
 *
 * @example
 * ```tsx
 * const states = [
 *   { name: 'base', influences: { 0: 0, 1: 0 } },
 *   { name: 'spherify', influences: { 0: 1, 1: 0 } },
 *   { name: 'twist', influences: { 0: 0, 1: 1 } }
 * ]
 *
 * <MorphTransition
 *   states={states}
 *   trigger="click"
 *   loop={true}
 *   animation={{ duration: 1.0, easing: 'power2.inOut' }}
 * >
 *   {({ morphRef, currentState, nextState }) => (
 *     <group onClick={nextState}>
 *       <MorphModel ref={morphRef} morphTargets={targets}>
 *         <mesh geometry={geometry}>
 *           <meshStandardMaterial />
 *         </mesh>
 *       </MorphModel>
 *     </group>
 *   )}
 * </MorphTransition>
 * ```
 */
export function MorphTransition({
  states,
  initialState = 0,
  trigger = 'manual',
  autoInterval = 3000,
  animation = { targetInfluence: 1.0 },
  loop = false,
  reverseOnSecondTrigger = false,
  children,
}: MorphTransitionProps) {
  const [currentStateIndex, setCurrentStateIndex] = useState(initialState)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const morphRef = useRef<MorphControls>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const autoIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastClickStateRef = useRef<number>(initialState)

  // Default animation config
  const animConfig: Required<MorphAnimationConfig> = {
    targetInfluence: 1,
    duration: animation.duration ?? 1.0,
    easing: animation.easing ?? 'power2.inOut',
    delay: animation.delay ?? 0,
    onComplete: animation.onComplete ?? (() => {}),
    onUpdate: animation.onUpdate ?? (() => {}),
  }

  /**
   * Transition to a specific state
   */
  const transitionToState = useCallback(
    async (targetIndex: number) => {
      if (!morphRef.current || targetIndex === currentStateIndex) return
      if (targetIndex < 0 || targetIndex >= states.length) return

      setIsTransitioning(true)

      // Kill existing timeline
      if (timelineRef.current) {
        timelineRef.current.kill()
      }

      const targetState = states[targetIndex]

      // Create timeline
      timelineRef.current = gsap.timeline({
        onComplete: () => {
          setIsTransitioning(false)
          setCurrentStateIndex(targetIndex)
          animConfig.onComplete()
        },
        onUpdate: () => {
          // Calculate progress
          const progress = timelineRef.current?.progress() ?? 0
          animConfig.onUpdate(progress)
        },
      })

      // Animate each influence
      const allInfluences = morphRef.current.getAllInfluences()
      const targetInfluences = { ...allInfluences }

      // Set target influences from state
      Object.entries(targetState.influences).forEach(([indexStr, value]) => {
        const index = parseInt(indexStr, 10)
        targetInfluences[index] = value
      })

      // Ensure all other influences go to 0 (unless specified)
      allInfluences.forEach((_, index) => {
        if (!(index in targetState.influences)) {
          targetInfluences[index] = 0
        }
      })

      // Animate all influences simultaneously
      allInfluences.forEach((currentValue, index) => {
        if (currentValue !== targetInfluences[index]) {
          timelineRef.current!.to(
            {},
            {
              duration: animConfig.duration,
              ease: animConfig.easing,
              delay: animConfig.delay,
              onUpdate: function () {
                const progress = this.progress()
                const newValue = currentValue + (targetInfluences[index] - currentValue) * progress
                morphRef.current?.setInfluence(index, newValue, false)
              },
            },
            0 // Start all animations at the same time
          )
        }
      })

      return new Promise<void>((resolve) => {
        if (timelineRef.current) {
          timelineRef.current.eventCallback('onComplete', () => {
            resolve()
          })
        } else {
          resolve()
        }
      })
    },
    [currentStateIndex, states, animConfig]
  )

  /**
   * Go to next state
   */
  const nextState = useCallback(() => {
    let nextIndex = currentStateIndex + 1

    if (nextIndex >= states.length) {
      if (loop) {
        nextIndex = 0
      } else {
        return // Don't advance beyond last state if not looping
      }
    }

    transitionToState(nextIndex)
  }, [currentStateIndex, states.length, loop, transitionToState])

  /**
   * Go to previous state
   */
  const previousState = useCallback(() => {
    let prevIndex = currentStateIndex - 1

    if (prevIndex < 0) {
      if (loop) {
        prevIndex = states.length - 1
      } else {
        return // Don't go before first state if not looping
      }
    }

    transitionToState(prevIndex)
  }, [currentStateIndex, states.length, loop, transitionToState])

  /**
   * Handle click trigger
   */
  const handleClick = useCallback(() => {
    if (trigger !== 'click') return

    if (reverseOnSecondTrigger) {
      // Toggle between states
      if (currentStateIndex === lastClickStateRef.current) {
        // Go to next state
        nextState()
        lastClickStateRef.current = (currentStateIndex + 1) % states.length
      } else {
        // Return to last clicked state
        transitionToState(lastClickStateRef.current)
      }
    } else {
      nextState()
    }
  }, [trigger, reverseOnSecondTrigger, currentStateIndex, nextState, transitionToState, states.length])

  /**
   * Handle hover trigger
   */
  const handlePointerEnter = useCallback(() => {
    if (trigger !== 'hover') return
    setIsHovered(true)

    if (reverseOnSecondTrigger && currentStateIndex > 0) {
      return // Don't advance if we should reverse instead
    }

    nextState()
  }, [trigger, reverseOnSecondTrigger, currentStateIndex, nextState])

  const handlePointerLeave = useCallback(() => {
    if (trigger !== 'hover') return
    setIsHovered(false)

    if (reverseOnSecondTrigger) {
      transitionToState(0)
    }
  }, [trigger, reverseOnSecondTrigger, transitionToState])

  /**
   * Handle auto trigger
   */
  useEffect(() => {
    if (trigger !== 'auto') return

    autoIntervalRef.current = setInterval(() => {
      nextState()
    }, autoInterval)

    return () => {
      if (autoIntervalRef.current) {
        clearInterval(autoIntervalRef.current)
      }
    }
  }, [trigger, autoInterval, nextState])

  /**
   * Cleanup
   */
  useEffect(() => {
    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill()
      }
      if (autoIntervalRef.current) {
        clearInterval(autoIntervalRef.current)
      }
    }
  }, [])

  // Render with event handlers based on trigger
  const childProps = {
    morphRef,
    currentState: currentStateIndex,
    isTransitioning,
    nextState,
    previousState,
    goToState: transitionToState,
  }

  if (trigger === 'click') {
    return <group onClick={handleClick}>{children(childProps)}</group>
  }

  if (trigger === 'hover') {
    return (
      <group onPointerEnter={handlePointerEnter} onPointerLeave={handlePointerLeave}>
        {children(childProps)}
      </group>
    )
  }

  // Manual or auto trigger - no event handlers
  return <group>{children(childProps)}</group>
}
