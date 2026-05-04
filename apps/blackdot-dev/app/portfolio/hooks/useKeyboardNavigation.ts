import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Configuration options for keyboard navigation
 */
export interface KeyboardNavigationConfig {
  /** Enable/disable keyboard navigation (default: true) */
  enabled?: boolean
  /** Enable debug panel toggle with Alt+D (default: true) */
  enableDebugToggle?: boolean
  /** Enable landing variant cycling with Alt+V (default: true) */
  enableVariantCycling?: boolean
  /** Respect user's prefers-reduced-motion preference (default: true) */
  respectReducedMotion?: boolean
  /** Custom key handlers for additional functionality */
  customHandlers?: Record<string, (event: KeyboardEvent) => void>
}

/**
 * Focus history entry
 */
export interface FocusHistoryEntry {
  element: HTMLElement | null
  timestamp: number
}

/**
 * Keyboard state information
 */
export interface KeyboardState {
  isEscapePressed: boolean
  isEnterPressed: boolean
  isSpacePressed: boolean
  isTabPressed: boolean
  isAltDown: boolean
  isCtrlDown: boolean
  isShiftDown: boolean
  isArrowKeyPressed: 'up' | 'down' | 'left' | 'right' | null
}

/**
 * Return type for useKeyboardNavigation hook
 */
export interface UseKeyboardNavigationReturn {
  /** Current keyboard state */
  keyboardState: KeyboardState
  /** Focus history for UX improvements */
  focusHistory: FocusHistoryEntry[]
  /** Currently focused element */
  focusedElement: HTMLElement | null
  /** Register a keyboard event handler */
  registerHandler: (key: string, handler: (event: KeyboardEvent) => void) => () => void
  /** Set focus to an element and record in history */
  setFocus: (element: HTMLElement | null) => void
  /** Restore focus to previous element in history */
  restorePreviousFocus: () => void
  /** Clear focus history */
  clearFocusHistory: () => void
  /** Check if reduced motion is preferred */
  prefersReducedMotion: boolean
}

/**
 * Custom hook for managing keyboard navigation and accessibility
 *
 * Features:
 * - Tracks global keyboard state (Escape, Enter, Space, Tab, Arrow keys, modifiers)
 * - Provides handlers for common shortcuts:
 *   - Escape: Close overlays and reset state
 *   - Enter/Space: Activate focused buttons
 *   - Tab: Navigate between interactive elements
 *   - ArrowKeys: Navigate through lists/docks
 *   - Alt+D: Toggle debug panel (customizable)
 *   - Alt+V: Cycle through landing variants (customizable)
 * - Maintains focus history for better UX
 * - Respects prefers-reduced-motion user preference
 * - Works seamlessly with NavigationDock and other interactive components
 *
 * @param config - Configuration options
 * @param onEscapePress - Callback when Escape is pressed
 * @param onEnterPress - Callback when Enter is pressed
 * @param onSpacePress - Callback when Space is pressed
 * @param onDebugToggle - Callback for Alt+D to toggle debug panel
 * @param onVariantCycle - Callback for Alt+V to cycle variants
 *
 * @returns Object containing keyboard state, handlers, and focus management utilities
 *
 * @example
 * ```tsx
 * const {
 *   keyboardState,
 *   setFocus,
 *   restorePreviousFocus,
 *   prefersReducedMotion,
 *   registerHandler
 * } = useKeyboardNavigation(
 *   { enabled: true },
 *   () => setShowOverlay(false), // Escape
 *   () => handleActivate(), // Enter
 *   () => handleActivate(), // Space
 *   () => setDebugPanelVisible(!debugVisible), // Alt+D
 *   () => cycleVariant() // Alt+V
 * )
 *
 * useEffect(() => {
 *   registerHandler('s', (e) => {
 *     if (e.ctrlKey || e.metaKey) {
 *       e.preventDefault()
 *       handleSave()
 *     }
 *   })
 * }, [registerHandler])
 * ```
 */
export function useKeyboardNavigation(
  config: KeyboardNavigationConfig = {},
  onEscapePress?: () => void,
  onEnterPress?: () => void,
  onSpacePress?: () => void,
  onDebugToggle?: () => void,
  onVariantCycle?: () => void
): UseKeyboardNavigationReturn {
  const {
    enabled = true,
    enableDebugToggle = true,
    enableVariantCycling = true,
    respectReducedMotion = true,
    customHandlers = {},
  } = config

  // Keyboard state
  const [keyboardState, setKeyboardState] = useState<KeyboardState>({
    isEscapePressed: false,
    isEnterPressed: false,
    isSpacePressed: false,
    isTabPressed: false,
    isAltDown: false,
    isCtrlDown: false,
    isShiftDown: false,
    isArrowKeyPressed: null,
  })

  // Focus history management
  const [focusHistory, setFocusHistory] = useState<FocusHistoryEntry[]>([])
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(null)

  // Custom handlers registry
  const handlersRef = useRef<Record<string, (event: KeyboardEvent) => void>>({
    ...customHandlers,
  })

  // Check for prefers-reduced-motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  // Monitor prefers-reduced-motion changes
  useEffect(() => {
    if (!respectReducedMotion || typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    // Use addEventListener for better compatibility
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }

    // Fallback for older browsers
    mediaQuery.addListener(handleChange)
    return () => mediaQuery.removeListener(handleChange)
  }, [respectReducedMotion])

  // Handle keyboard down
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return

      const key = event.key.toLowerCase()
      const isAlt = event.altKey
      const isCtrl = event.ctrlKey || event.metaKey
      const isShift = event.shiftKey

      // Update keyboard state
      setKeyboardState((prev) => ({
        ...prev,
        isEscapePressed: key === 'escape',
        isEnterPressed: key === 'enter',
        isSpacePressed: key === ' ',
        isTabPressed: key === 'tab',
        isAltDown: isAlt,
        isCtrlDown: isCtrl,
        isShiftDown: isShift,
        isArrowKeyPressed:
          key === 'arrowup'
            ? 'up'
            : key === 'arrowdown'
              ? 'down'
              : key === 'arrowleft'
                ? 'left'
                : key === 'arrowright'
                  ? 'right'
                  : prev.isArrowKeyPressed,
      }))

      // Handle Escape key
      if (key === 'escape') {
        event.preventDefault()
        onEscapePress?.()
      }

      // Handle Enter key
      if (key === 'enter' && document.activeElement instanceof HTMLElement) {
        const activeElement = document.activeElement
        if (
          activeElement.tagName === 'BUTTON' ||
          activeElement.getAttribute('role') === 'button' ||
          activeElement.getAttribute('role') === 'menuitem'
        ) {
          event.preventDefault()
          onEnterPress?.()
        }
      }

      // Handle Space key
      if (key === ' ' && document.activeElement instanceof HTMLElement) {
        const activeElement = document.activeElement
        if (
          activeElement.tagName === 'BUTTON' ||
          activeElement.getAttribute('role') === 'button' ||
          activeElement.getAttribute('role') === 'menuitem'
        ) {
          event.preventDefault()
          onSpacePress?.()
        }
      }

      // Handle Alt+D for debug toggle
      if (enableDebugToggle && isAlt && key === 'd') {
        event.preventDefault()
        onDebugToggle?.()
      }

      // Handle Alt+V for variant cycling
      if (enableVariantCycling && isAlt && key === 'v') {
        event.preventDefault()
        onVariantCycle?.()
      }

      // Call custom handlers
      if (handlersRef.current[key]) {
        handlersRef.current[key](event)
      }
    },
    [enabled, enableDebugToggle, enableVariantCycling, onEscapePress, onEnterPress, onSpacePress, onDebugToggle, onVariantCycle]
  )

  // Handle keyboard up
  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (!enabled) return

    const key = event.key.toLowerCase()

    setKeyboardState((prev) => ({
      ...prev,
      isEscapePressed: false,
      isEnterPressed: key === 'enter' ? false : prev.isEnterPressed,
      isSpacePressed: key === ' ' ? false : prev.isSpacePressed,
      isTabPressed: key === 'tab' ? false : prev.isTabPressed,
      isAltDown: !event.altKey,
      isCtrlDown: !event.ctrlKey && !event.metaKey,
      isShiftDown: !event.shiftKey,
      isArrowKeyPressed:
        key === 'arrowup' || key === 'arrowdown' || key === 'arrowleft' || key === 'arrowright'
          ? null
          : prev.isArrowKeyPressed,
    }))
  }, [enabled])

  // Handle focus changes to track focused element
  const handleFocusChange = useCallback((event: FocusEvent) => {
    if (event.target instanceof HTMLElement) {
      setFocusedElement(event.target)
      // Record in history
      setFocusHistory((prev) => [
        ...prev.slice(-9), // Keep last 10 items
        {
          element: event.target as HTMLElement,
          timestamp: Date.now(),
        },
      ])
    }
  }, [])

  // Register keyboard event listeners
  useEffect(() => {
    if (!enabled) return

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
    document.addEventListener('focusin', handleFocusChange)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
      document.removeEventListener('focusin', handleFocusChange)
    }
  }, [enabled, handleKeyDown, handleKeyUp, handleFocusChange])

  // Register a custom keyboard handler
  const registerHandler = useCallback(
    (key: string, handler: (event: KeyboardEvent) => void) => {
      handlersRef.current[key.toLowerCase()] = handler

      // Return unregister function
      return () => {
        delete handlersRef.current[key.toLowerCase()]
      }
    },
    []
  )

  // Set focus and record in history
  const setFocus = useCallback((element: HTMLElement | null) => {
    setFocusedElement(element)
    if (element) {
      element.focus()
      setFocusHistory((prev) => [
        ...prev.slice(-9),
        {
          element,
          timestamp: Date.now(),
        },
      ])
    }
  }, [])

  // Restore previous focus
  const restorePreviousFocus = useCallback(() => {
    if (focusHistory.length <= 1) {
      // If only current element, go back to body
      ;(document.activeElement as HTMLElement)?.blur?.()
      return
    }

    // Get the previous element (skip current)
    const previousEntry = focusHistory[focusHistory.length - 2]
    if (previousEntry?.element) {
      previousEntry.element.focus()
      setFocusedElement(previousEntry.element)
      // Update history to remove current element
      setFocusHistory((prev) => prev.slice(0, -1))
    }
  }, [focusHistory])

  // Clear focus history
  const clearFocusHistory = useCallback(() => {
    setFocusHistory([])
    setFocusedElement(null)
  }, [])

  return {
    keyboardState,
    focusHistory,
    focusedElement,
    registerHandler,
    setFocus,
    restorePreviousFocus,
    clearFocusHistory,
    prefersReducedMotion,
  }
}
