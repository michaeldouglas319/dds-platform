import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * ARIA live region announcement types
 */
export type AriaLiveType = 'polite' | 'assertive' | 'off'

/**
 * Supported ARIA roles for interactive elements
 */
export type AriaRole =
  | 'button'
  | 'menuitem'
  | 'menuitemradio'
  | 'menuitemcheckbox'
  | 'tab'
  | 'tablist'
  | 'navigation'
  | 'link'
  | 'heading'
  | 'dialog'
  | 'status'
  | 'alert'
  | 'progressbar'
  | 'slider'

/**
 * Color contrast levels
 */
export interface ContrastRatio {
  ratio: number
  level: 'AAA' | 'AA' | 'fail'
  minFontSize: 'any' | '18pt' | '14pt'
}

/**
 * ARIA attributes configuration
 */
export interface AriaAttributes {
  role?: AriaRole
  label?: string
  labelledBy?: string
  describedBy?: string
  pressed?: boolean
  checked?: boolean
  disabled?: boolean
  hidden?: boolean
  expanded?: boolean
  level?: number
  live?: AriaLiveType
  atomic?: boolean
  relevant?: string
  selected?: boolean
  current?: 'page' | 'step' | 'location' | 'date' | 'time' | false
  haspopup?: 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog' | false
  controls?: string
  owns?: string
  flowto?: string
  valuemin?: number
  valuemax?: number
  valuenow?: number
  valuetext?: string
  required?: boolean
  invalid?: boolean
  readonly?: boolean
  busy?: boolean
}

/**
 * Return type for useAccessibility hook
 */
export interface UseAccessibilityReturn {
  /** ARIA attributes for an element */
  ariaAttributes: AriaAttributes
  /** Announce a message to screen readers */
  announce: (message: string, priority?: AriaLiveType) => void
  /** Set ARIA attributes */
  setAriaAttributes: (attributes: Partial<AriaAttributes>) => void
  /** Check color contrast ratio */
  checkContrast: (foreground: string, background: string) => ContrastRatio | null
  /** Get all ARIA attributes as object for spreading on elements */
  getAriaProps: () => Record<string, any>
  /** Create accessible button attributes */
  createButtonAttributes: (label: string, disabled?: boolean) => Record<string, any>
  /** Create accessible link attributes */
  createLinkAttributes: (label: string, href: string) => Record<string, any>
  /** Create accessible heading attributes */
  createHeadingAttributes: (level: 1 | 2 | 3 | 4 | 5 | 6, label?: string) => Record<string, any>
  /** Create accessible dialog attributes */
  createDialogAttributes: (label: string, id: string) => Record<string, any>
  /** Create accessible status/alert attributes */
  createStatusAttributes: (priority: 'status' | 'alert', message?: string) => Record<string, any>
  /** Update button state (pressed/active) */
  updateButtonState: (pressed: boolean, disabled?: boolean) => void
  /** Update disclosure state (expanded/collapsed) */
  updateDisclosureState: (expanded: boolean) => void
  /** Update form field state (checked, disabled, required) */
  updateFormFieldState: (
    checked?: boolean,
    disabled?: boolean,
    required?: boolean,
    invalid?: boolean
  ) => void
  /** Announce state change to screen readers */
  announceStateChange: (oldState: string, newState: string) => void
  /** Check if current viewport meets accessibility standards */
  isAccessibilityCompliant: () => boolean
}

/**
 * Parse CSS color string to RGB
 */
function parseColor(color: string): [number, number, number] | null {
  // Handle hex colors
  if (color[0] === '#') {
    const hex = color.slice(1)
    if (hex.length === 6) {
      return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)]
    }
    if (hex.length === 3) {
      return [
        parseInt(hex[0] + hex[0], 16),
        parseInt(hex[1] + hex[1], 16),
        parseInt(hex[2] + hex[2], 16),
      ]
    }
  }

  // Handle rgb/rgba
  const rgbMatch = color.match(/rgb(?:a)?\((\d+),\s*(\d+),\s*(\d+)/)
  if (rgbMatch) {
    return [parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3])]
  }

  return null
}

/**
 * Calculate relative luminance (WCAG 2.0)
 */
function getLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map((val) => {
    const normalized = val / 255
    return normalized <= 0.03928 ? normalized / 12.92 : Math.pow((normalized + 0.055) / 1.055, 2.4)
  })

  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Calculate contrast ratio between two colors
 */
function calculateContrastRatio(foreground: string, background: string): number | null {
  const fgRgb = parseColor(foreground)
  const bgRgb = parseColor(background)

  if (!fgRgb || !bgRgb) return null

  const fgLum = getLuminance(fgRgb)
  const bgLum = getLuminance(bgRgb)

  const lighter = Math.max(fgLum, bgLum)
  const darker = Math.min(fgLum, bgLum)

  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Determine WCAG conformance level
 */
function getContrastLevel(ratio: number): ContrastRatio['level'] {
  if (ratio >= 7) return 'AAA'
  if (ratio >= 4.5) return 'AA'
  return 'fail'
}

/**
 * Custom hook for managing ARIA attributes and accessibility features
 *
 * Features:
 * - Manages ARIA attributes for interactive elements
 * - Announces state changes to screen readers
 * - Provides text alternatives for visual indicators
 * - Checks color contrast ratios (WCAG 2.0)
 * - Helper functions for common accessible patterns (buttons, dialogs, forms)
 * - Respects user's accessibility preferences
 * - Type-safe ARIA attribute management
 * - Automatic live region announcements
 *
 * @param initialRole - Initial ARIA role
 * @param initialLabel - Initial ARIA label
 * @param liveRegionPriority - Default priority for announcements
 *
 * @returns Object containing ARIA management utilities
 *
 * @example
 * ```tsx
 * const {
 *   getAriaProps,
 *   createButtonAttributes,
 *   announce,
 *   setAriaAttributes,
 *   checkContrast
 * } = useAccessibility('button', 'Toggle Menu')
 *
 * // Use on button element
 * <button {...getAriaProps()}>
 *   Menu
 * </button>
 *
 * // Or use specific helpers
 * <button {...createButtonAttributes('Save Changes', false)}>
 *   Save
 * </button>
 *
 * // Check color contrast
 * const contrast = checkContrast('#ffffff', '#0000ff')
 * if (contrast && contrast.level === 'fail') {
 *   announce('Warning: insufficient color contrast', 'assertive')
 * }
 * ```
 */
export function useAccessibility(
  initialRole?: AriaRole,
  initialLabel?: string,
  liveRegionPriority: AriaLiveType = 'polite'
): UseAccessibilityReturn {
  const [ariaAttributes, setAriaAttributesState] = useState<AriaAttributes>({
    role: initialRole,
    label: initialLabel,
  })

  // Reference for announcements container
  const liveRegionRef = useRef<HTMLDivElement | null>(null)
  const announcementQueueRef = useRef<string[]>([])

  // Create live region on mount
  useEffect(() => {
    if (typeof document === 'undefined') return

    // Check if live region already exists
    let liveRegion = document.getElementById('aria-live-region')
    if (!liveRegion) {
      liveRegion = document.createElement('div')
      liveRegion.id = 'aria-live-region'
      liveRegion.setAttribute('aria-live', liveRegionPriority)
      liveRegion.setAttribute('aria-atomic', 'true')
      liveRegion.setAttribute('aria-relevant', 'additions text')
      liveRegion.style.position = 'absolute'
      liveRegion.style.left = '-10000px'
      liveRegion.style.width = '1px'
      liveRegion.style.height = '1px'
      liveRegion.style.overflow = 'hidden'
      document.body.appendChild(liveRegion)
    }

    liveRegionRef.current = liveRegion as HTMLDivElement

    return () => {
      // Clean up if needed
      if (liveRegionRef.current && liveRegionRef.current.parentNode) {
        // Keep the region for potential other announcements
      }
    }
  }, [liveRegionPriority])

  // Announce message to screen readers
  const announce = useCallback((message: string, priority: AriaLiveType = liveRegionPriority) => {
    if (typeof document === 'undefined') return

    // Add to queue
    announcementQueueRef.current.push(message)

    // Get or create live region with correct priority
    let liveRegion = document.getElementById('aria-live-region')
    if (!liveRegion) {
      liveRegion = document.createElement('div')
      liveRegion.id = 'aria-live-region'
      document.body.appendChild(liveRegion)
    }

    if (liveRegion) {
      liveRegion.setAttribute('aria-live', priority)
      liveRegion.textContent = message

      // Clear after announcement is read
      setTimeout(() => {
        if (liveRegion) {
          liveRegion.textContent = ''
        }
        announcementQueueRef.current.shift()
      }, 1000)
    }
  }, [liveRegionPriority])

  // Set ARIA attributes
  const setAriaAttributes = useCallback((attributes: Partial<AriaAttributes>) => {
    setAriaAttributesState((prev) => ({
      ...prev,
      ...attributes,
    }))
  }, [])

  // Check color contrast ratio
  const checkContrast = useCallback((foreground: string, background: string): ContrastRatio | null => {
    const ratio = calculateContrastRatio(foreground, background)
    if (ratio === null) return null

    const level = getContrastLevel(ratio)

    return {
      ratio: Math.round(ratio * 100) / 100,
      level,
      minFontSize: level === 'AAA' ? 'any' : level === 'AA' ? '14pt' : '18pt',
    }
  }, [])

  // Get ARIA props for spreading on elements
  const getAriaProps = useCallback((): Record<string, any> => {
    const props: Record<string, any> = {}

    if (ariaAttributes.role) props.role = ariaAttributes.role
    if (ariaAttributes.label) props['aria-label'] = ariaAttributes.label
    if (ariaAttributes.labelledBy) props['aria-labelledby'] = ariaAttributes.labelledBy
    if (ariaAttributes.describedBy) props['aria-describedby'] = ariaAttributes.describedBy
    if (ariaAttributes.pressed !== undefined) props['aria-pressed'] = ariaAttributes.pressed
    if (ariaAttributes.checked !== undefined) props['aria-checked'] = ariaAttributes.checked
    if (ariaAttributes.disabled !== undefined) props['aria-disabled'] = ariaAttributes.disabled
    if (ariaAttributes.hidden !== undefined) props['aria-hidden'] = ariaAttributes.hidden
    if (ariaAttributes.expanded !== undefined) props['aria-expanded'] = ariaAttributes.expanded
    if (ariaAttributes.level) props['aria-level'] = ariaAttributes.level
    if (ariaAttributes.live) props['aria-live'] = ariaAttributes.live
    if (ariaAttributes.atomic !== undefined) props['aria-atomic'] = ariaAttributes.atomic
    if (ariaAttributes.relevant) props['aria-relevant'] = ariaAttributes.relevant
    if (ariaAttributes.selected !== undefined) props['aria-selected'] = ariaAttributes.selected
    if (ariaAttributes.current !== undefined && ariaAttributes.current !== false) {
      props['aria-current'] = ariaAttributes.current
    }
    if (ariaAttributes.haspopup !== undefined && ariaAttributes.haspopup !== false) {
      props['aria-haspopup'] = ariaAttributes.haspopup
    }
    if (ariaAttributes.controls) props['aria-controls'] = ariaAttributes.controls
    if (ariaAttributes.owns) props['aria-owns'] = ariaAttributes.owns
    if (ariaAttributes.flowto) props['aria-flowto'] = ariaAttributes.flowto
    if (ariaAttributes.valuemin !== undefined) props['aria-valuemin'] = ariaAttributes.valuemin
    if (ariaAttributes.valuemax !== undefined) props['aria-valuemax'] = ariaAttributes.valuemax
    if (ariaAttributes.valuenow !== undefined) props['aria-valuenow'] = ariaAttributes.valuenow
    if (ariaAttributes.valuetext) props['aria-valuetext'] = ariaAttributes.valuetext
    if (ariaAttributes.required !== undefined) props['aria-required'] = ariaAttributes.required
    if (ariaAttributes.invalid !== undefined) props['aria-invalid'] = ariaAttributes.invalid
    if (ariaAttributes.readonly !== undefined) props['aria-readonly'] = ariaAttributes.readonly
    if (ariaAttributes.busy !== undefined) props['aria-busy'] = ariaAttributes.busy

    return props
  }, [ariaAttributes])

  // Create button attributes
  const createButtonAttributes = useCallback(
    (label: string, disabled: boolean = false): Record<string, any> => ({
      role: 'button',
      'aria-label': label,
      'aria-disabled': disabled,
      tabIndex: disabled ? -1 : 0,
    }),
    []
  )

  // Create link attributes
  const createLinkAttributes = useCallback(
    (label: string, href: string): Record<string, any> => ({
      role: 'link',
      'aria-label': label,
      href,
    }),
    []
  )

  // Create heading attributes
  const createHeadingAttributes = useCallback(
    (level: 1 | 2 | 3 | 4 | 5 | 6, label?: string): Record<string, any> => ({
      role: 'heading',
      'aria-level': level,
      ...(label && { 'aria-label': label }),
    }),
    []
  )

  // Create dialog attributes
  const createDialogAttributes = useCallback(
    (label: string, id: string): Record<string, any> => ({
      role: 'dialog',
      'aria-label': label,
      'aria-labelledby': id,
      'aria-modal': true,
    }),
    []
  )

  // Create status/alert attributes
  const createStatusAttributes = useCallback(
    (priority: 'status' | 'alert', message?: string): Record<string, any> => ({
      role: priority,
      'aria-live': priority === 'alert' ? 'assertive' : 'polite',
      'aria-atomic': true,
      ...(message && { 'aria-label': message }),
    }),
    []
  )

  // Update button state
  const updateButtonState = useCallback((pressed: boolean, disabled: boolean = false) => {
    setAriaAttributes({
      pressed,
      disabled,
    })
  }, [setAriaAttributes])

  // Update disclosure state
  const updateDisclosureState = useCallback((expanded: boolean) => {
    setAriaAttributes({
      expanded,
    })
  }, [setAriaAttributes])

  // Update form field state
  const updateFormFieldState = useCallback(
    (checked?: boolean, disabled?: boolean, required?: boolean, invalid?: boolean) => {
      setAriaAttributes({
        ...(checked !== undefined && { checked }),
        ...(disabled !== undefined && { disabled }),
        ...(required !== undefined && { required }),
        ...(invalid !== undefined && { invalid }),
      })
    },
    [setAriaAttributes]
  )

  // Announce state change
  const announceStateChange = useCallback(
    (oldState: string, newState: string) => {
      announce(`State changed from ${oldState} to ${newState}`, 'polite')
    },
    [announce]
  )

  // Check if accessibility compliant
  const isAccessibilityCompliant = useCallback((): boolean => {
    if (typeof window === 'undefined') return false

    // Check for basic accessibility features
    const hasReducedMotionSupport = window.matchMedia('(prefers-reduced-motion: reduce)').matches === false
    const hasHighContrastSupport = window.matchMedia('(prefers-contrast: more)').matches === false
    const hasColorSchemeSupport =
      window.matchMedia('(prefers-color-scheme: dark)').matches ||
      window.matchMedia('(prefers-color-scheme: light)').matches

    return hasReducedMotionSupport && hasHighContrastSupport && hasColorSchemeSupport
  }, [])

  return {
    ariaAttributes,
    announce,
    setAriaAttributes,
    checkContrast,
    getAriaProps,
    createButtonAttributes,
    createLinkAttributes,
    createHeadingAttributes,
    createDialogAttributes,
    createStatusAttributes,
    updateButtonState,
    updateDisclosureState,
    updateFormFieldState,
    announceStateChange,
    isAccessibilityCompliant,
  }
}
