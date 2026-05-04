/**
 * Visualization Configuration for Umbrella Pages
 * Color schemes, chart configurations, animation settings, and layout constants
 */

export const umbrellaColors = {
  regulatory: '#3B82F6', // Blue
  hardware: '#10B981', // Green
  systemsSafety: '#F59E0B', // Amber
  operations: '#EF4444', // Red
  business: '#8B5CF6', // Purple
  background: 'hsl(var(--background))',
  muted: 'hsl(var(--muted))',
  primary: 'hsl(var(--primary))'
};

export const phaseColors = [
  '#3B82F6', // Phase 1 - Blue
  '#10B981', // Phase 2 - Green
  '#F59E0B', // Phase 3 - Amber
  '#EF4444', // Phase 4 - Red
  '#8B5CF6', // Phase 5 - Purple
  '#EC4899', // Phase 6 - Pink
  '#06B6D4', // Phase 7 - Cyan
  '#84CC16'  // Phase 8 - Lime
];

export const chartConfig = {
  colors: {
    primary: 'hsl(var(--primary))',
    secondary: 'hsl(var(--secondary))',
    muted: 'hsl(var(--muted))',
    accent: 'hsl(var(--accent))'
  },
  defaultHeight: 400,
  margin: { top: 20, right: 30, bottom: 20, left: 30 }
};

export const animationConfig = {
  duration: {
    fast: 0.2,
    normal: 0.3,
    slow: 0.5
  },
  easing: {
    easeInOut: [0.4, 0, 0.2, 1],
    easeOut: [0, 0, 0.2, 1],
    easeIn: [0.4, 0, 1, 1]
  }
};

export const layoutConstants = {
  sectionSpacing: {
    mobile: 'py-8',
    tablet: 'py-12',
    desktop: 'py-16'
  },
  containerMaxWidth: {
    mobile: 'max-w-full',
    tablet: 'max-w-4xl',
    desktop: 'max-w-7xl'
  },
  gridGap: {
    mobile: 'gap-4',
    tablet: 'gap-6',
    desktop: 'gap-8'
  }
};

export const criticalityColors = {
  critical: '#EF4444', // Red
  important: '#F59E0B', // Amber
  support: '#6B7280' // Gray
};

