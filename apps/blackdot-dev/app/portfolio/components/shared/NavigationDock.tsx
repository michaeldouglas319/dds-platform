'use client';

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
  CSSProperties,
} from 'react';

/**
 * Navigation item interface
 */
export interface NavigationItem {
  /** Unique identifier for the item */
  id: string;

  /** Display label */
  label: string;

  /** Optional icon (emoji or text) */
  icon?: string;

  /** Callback when item is clicked */
  onClick: () => void;

  /** Optional aria-label for accessibility */
  ariaLabel?: string;

  /** Test ID for testing */
  testId?: string;
}

/**
 * Props for NavigationDock component
 */
export interface NavigationDockProps {
  /** Array of navigation items */
  items: NavigationItem[];

  /** Currently active item ID */
  activeItemId?: string;

  /** Position of the dock */
  position?: 'bottom' | 'top' | 'left' | 'right';

  /** Whether to show icons */
  showIcons?: boolean;

  /** Whether to show labels */
  showLabels?: boolean;

  /** Animation duration in milliseconds */
  animationDuration?: number;

  /** Whether the dock is visible */
  isVisible?: boolean;

  /** Callback when active item changes */
  onActiveItemChange?: (itemId: string) => void;

  /** Custom CSS class */
  className?: string;

  /** Custom inline styles */
  style?: CSSProperties;

  /** ARIA label for the navigation */
  ariaLabel?: string;

  /** Test ID for testing */
  testId?: string;

  /** Enable dark mode styling */
  darkMode?: boolean;

  /** Responsive behavior on small screens */
  responsiveDirection?: 'vertical' | 'horizontal';

  /** Keyboard navigation enabled */
  enableKeyboardNav?: boolean;
}

/**
 * Default navigation items for authenticated users
 */
export const defaultNavigationItems = (callbacks: {
  onHome: () => void;
  onComponents: () => void;
  onPlayground: () => void;
  onAbout: () => void;
  onProfile: () => void;
  onSignOut: () => void;
}): NavigationItem[] => [
  {
    id: 'home',
    label: 'Home',
    icon: '🏠',
    onClick: callbacks.onHome,
    ariaLabel: 'Navigate to home',
    testId: 'nav-item-home',
  },
  {
    id: 'components',
    label: 'Components',
    icon: '🎨',
    onClick: callbacks.onComponents,
    ariaLabel: 'View components',
    testId: 'nav-item-components',
  },
  {
    id: 'playground',
    label: 'Playground',
    icon: '🎮',
    onClick: callbacks.onPlayground,
    ariaLabel: 'Open playground',
    testId: 'nav-item-playground',
  },
  {
    id: 'about',
    label: 'About',
    icon: 'ℹ️',
    onClick: callbacks.onAbout,
    ariaLabel: 'About page',
    testId: 'nav-item-about',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: '👤',
    onClick: callbacks.onProfile,
    ariaLabel: 'View profile',
    testId: 'nav-item-profile',
  },
  {
    id: 'sign-out',
    label: 'Sign Out',
    icon: '🚪',
    onClick: callbacks.onSignOut,
    ariaLabel: 'Sign out',
    testId: 'nav-item-sign-out',
  },
];

/**
 * Get animation styles based on position and visibility
 */
const getAnimationStyles = (
  position: 'bottom' | 'top' | 'left' | 'right',
  isVisible: boolean,
  duration: number
): CSSProperties => {
  const baseStyle: CSSProperties = {
    transition: `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
  };

  switch (position) {
    case 'bottom':
      return {
        ...baseStyle,
        transform: isVisible ? 'translateY(0)' : 'translateY(120%)',
        opacity: isVisible ? 1 : 0,
        visibility: isVisible ? 'visible' : 'hidden',
      };

    case 'top':
      return {
        ...baseStyle,
        transform: isVisible ? 'translateY(0)' : 'translateY(-120%)',
        opacity: isVisible ? 1 : 0,
        visibility: isVisible ? 'visible' : 'hidden',
      };

    case 'left':
      return {
        ...baseStyle,
        transform: isVisible ? 'translateX(0)' : 'translateX(-120%)',
        opacity: isVisible ? 1 : 0,
        visibility: isVisible ? 'visible' : 'hidden',
      };

    case 'right':
      return {
        ...baseStyle,
        transform: isVisible ? 'translateX(0)' : 'translateX(120%)',
        opacity: isVisible ? 1 : 0,
        visibility: isVisible ? 'visible' : 'hidden',
      };

    default:
      return baseStyle;
  }
};

/**
 * Get positioning styles based on dock position
 */
const getPositioningStyles = (
  position: 'bottom' | 'top' | 'left' | 'right'
): CSSProperties => {
  const baseStyle: CSSProperties = {
    position: 'fixed',
    zIndex: 1000,
    padding: '12px',
  };

  switch (position) {
    case 'bottom':
      return {
        ...baseStyle,
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: 'calc(100% - 40px)',
        width: 'auto',
      };

    case 'top':
      return {
        ...baseStyle,
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: 'calc(100% - 40px)',
        width: 'auto',
      };

    case 'left':
      return {
        ...baseStyle,
        left: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        height: 'auto',
        maxHeight: 'calc(100% - 40px)',
      };

    case 'right':
      return {
        ...baseStyle,
        right: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        height: 'auto',
        maxHeight: 'calc(100% - 40px)',
      };

    default:
      return baseStyle;
  }
};

/**
 * Get container styles for different layouts
 */
const getContainerStyles = (
  position: 'bottom' | 'top' | 'left' | 'right',
  darkMode: boolean
): CSSProperties => {
  const isHorizontal = position === 'bottom' || position === 'top';

  return {
    display: 'flex',
    flexDirection: isHorizontal ? 'row' : 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 16px',
    borderRadius: '12px',
    backgroundColor: darkMode ? 'rgba(20, 20, 20, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
    boxShadow: darkMode
      ? '0 8px 32px rgba(0, 0, 0, 0.3)'
      : '0 8px 32px rgba(0, 0, 0, 0.1)',
  };
};

/**
 * Get item styles for different states
 */
const getItemStyles = (
  isActive: boolean,
  darkMode: boolean,
  isHovered: boolean
): CSSProperties => {
  return {
    padding: '8px 12px',
    borderRadius: '8px',
    backgroundColor: isActive
      ? darkMode
        ? 'rgba(100, 200, 255, 0.3)'
        : 'rgba(59, 130, 246, 0.1)'
      : isHovered
        ? darkMode
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(0, 0, 0, 0.05)'
        : 'transparent',
    border: `1px solid ${
      isActive
        ? darkMode
          ? 'rgba(100, 200, 255, 0.5)'
          : 'rgba(59, 130, 246, 0.3)'
        : 'transparent'
    }`,
    color: isActive
      ? darkMode
        ? '#64c8ff'
        : '#3b82f6'
      : darkMode
        ? '#e5e7eb'
        : '#1f2937',
    cursor: 'pointer',
    transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
    fontWeight: isActive ? 600 : 500,
    whiteSpace: 'nowrap',
    userSelect: 'none',
  };
};

/**
 * NavigationDock Component
 *
 * A horizontal/vertical navigation bar with smooth animations, keyboard navigation,
 * and responsive design. Perfect for authenticated user navigation in modern web apps.
 *
 * Features:
 * - Smooth entrance animation (configurable position)
 * - Active state highlighting
 * - Icon + label support
 * - Mobile responsive (switches between horizontal and vertical)
 * - Full keyboard navigation (Tab, arrow keys)
 * - Accessibility features (ARIA roles, labels)
 * - Dark/light mode support
 * - TypeScript strict mode ready
 *
 * @example
 * ```tsx
 * const [activeItem, setActiveItem] = useState('home');
 *
 * <NavigationDock
 *   items={defaultNavigationItems({
 *     onHome: () => navigate('/'),
 *     onComponents: () => navigate('/components'),
 *     // ... other callbacks
 *   })}
 *   activeItemId={activeItem}
 *   onActiveItemChange={setActiveItem}
 *   position="bottom"
 *   isVisible={isAuthenticated}
 *   darkMode={true}
 * />
 * ```
 */
const NavigationDock = React.forwardRef<HTMLDivElement, NavigationDockProps>(
  (
    {
      items,
      activeItemId,
      position = 'bottom',
      showIcons = true,
      showLabels = true,
      animationDuration = 300,
      isVisible = true,
      onActiveItemChange,
      className,
      style,
      ariaLabel = 'Main navigation',
      testId = 'navigation-dock',
      darkMode = true,
      responsiveDirection = 'horizontal',
      enableKeyboardNav = true,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);
    const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState<boolean>(false);

    // Detect mobile screen size
    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
      };

      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Determine current layout direction
    const layoutDirection = useMemo(() => {
      if (isMobile && responsiveDirection === 'vertical') {
        return 'vertical';
      }
      return (position === 'left' || position === 'right') ? 'vertical' : 'horizontal';
    }, [isMobile, position, responsiveDirection]);

    // Handle keyboard navigation
    const handleKeyDown = useCallback(
      (e: KeyboardEvent) => {
        if (!enableKeyboardNav || !containerRef.current?.contains(document.activeElement as Node)) {
          return;
        }

        const currentIndex = itemsRef.current.findIndex(
          (btn) => btn === document.activeElement
        );

        let nextIndex = currentIndex;

        switch (e.key) {
          case 'ArrowRight':
          case 'ArrowDown':
            e.preventDefault();
            nextIndex = (currentIndex + 1) % items.length;
            break;

          case 'ArrowLeft':
          case 'ArrowUp':
            e.preventDefault();
            nextIndex = (currentIndex - 1 + items.length) % items.length;
            break;

          case 'Home':
            e.preventDefault();
            nextIndex = 0;
            break;

          case 'End':
            e.preventDefault();
            nextIndex = items.length - 1;
            break;

          default:
            return;
        }

        itemsRef.current[nextIndex]?.focus();
      },
      [items.length, enableKeyboardNav]
    );

    // Handle keyboard navigation for JSX onKeyDown
    const handleKeyDownReact = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        handleKeyDown(e.nativeEvent);
      },
      [handleKeyDown]
    );

    // Register keyboard event listener
    useEffect(() => {
      if (!enableKeyboardNav) return;

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown, enableKeyboardNav]);

    // Handle item click
    const handleItemClick = useCallback(
      (item: NavigationItem) => {
        onActiveItemChange?.(item.id);
        item.onClick();
      },
      [onActiveItemChange]
    );

    // Get animation styles
    const animationStyles = useMemo(
      () => getAnimationStyles(position, isVisible, animationDuration),
      [position, isVisible, animationDuration]
    );

    // Get positioning styles
    const positioningStyles = useMemo(() => getPositioningStyles(position), [position]);

    // Get container styles
    const containerStyles = useMemo(
      () => getContainerStyles(position, darkMode),
      [position, darkMode]
    );

    const isHorizontal = layoutDirection === 'horizontal';

    return (
      <div
        ref={ref}
        role="navigation"
        aria-label={ariaLabel}
        data-testid={testId}
        style={{
          ...positioningStyles,
          ...animationStyles,
          ...style,
        }}
        className={className}
      >
        <div
          ref={containerRef}
          style={containerStyles}
          onKeyDown={handleKeyDownReact}
          role="menubar"
          aria-orientation={isHorizontal ? 'horizontal' : 'vertical'}
        >
          {items.map((item, index) => {
            const isActive = activeItemId === item.id;
            const isHovered = hoveredItemId === item.id;

            return (
              <button
                key={item.id}
                ref={(el) => {
                  itemsRef.current[index] = el;
                }}
                onClick={() => handleItemClick(item)}
                onMouseEnter={() => setHoveredItemId(item.id)}
                onMouseLeave={() => setHoveredItemId(null)}
                onFocus={() => setHoveredItemId(item.id)}
                onBlur={() => setHoveredItemId(null)}
                aria-label={item.ariaLabel || item.label}
                aria-pressed={isActive}
                data-testid={item.testId}
                style={getItemStyles(isActive, darkMode, isHovered)}
                role="menuitem"
              >
                {showIcons && item.icon && <span>{item.icon}</span>}
                {showLabels && <span>{item.label}</span>}
              </button>
            );
          })}
        </div>
      </div>
    );
  }
);

NavigationDock.displayName = 'NavigationDock';

export default NavigationDock;
