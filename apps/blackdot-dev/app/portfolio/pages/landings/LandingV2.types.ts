import { ReactNode } from 'react';
import { AuthState, LandingStateConfig } from '../../hooks/useLandingState';

/**
 * Props for the main LandingV2 component
 */
export interface LandingV2Props {
  /** Optional custom title for the hero section */
  title?: string;

  /** Optional custom subtitle for the hero section */
  subtitle?: string;

  /** Callback when user successfully signs in */
  onSignInSuccess?: () => void;

  /** Callback when user signs out */
  onSignOutSuccess?: () => void;

  /** Custom authentication handler - if provided, overrides default */
  onCustomSignIn?: (email: string, password: string) => Promise<void>;

  /** Initial auth state */
  initialAuthState?: AuthState;

  /** Landing state configuration */
  landingConfig?: Partial<LandingStateConfig>;

  /** Whether to show the hero section text */
  showHeroText?: boolean;

  /** Whether to show the navigation dock when authenticated */
  showNavigationDock?: boolean;

  /** Custom navigation items */
  navigationItems?: any[];

  /** Enable performance monitoring overlay (dev only) */
  enablePerfMonitor?: boolean;

  /** Custom children to render (for extending the component) */
  children?: ReactNode;
}

/**
 * 3D Scene configuration
 */
export interface Scene3DConfig {
  /** Number of particles in the background */
  particleCount: number;

  /** Enable particle system animation */
  enableParticles: boolean;

  /** Number of orbital elements */
  orbitalElementCount: number;

  /** Central sphere glow intensity */
  glowIntensity: number;

  /** Camera FOV (field of view) */
  cameraFOV: number;

  /** Camera initial position */
  cameraPosition: [number, number, number];

  /** Enable orbit controls */
  enableOrbitControls: boolean;

  /** Auto-rotate the scene */
  autoRotate: boolean;
}

/**
 * Orbital element configuration
 */
export interface OrbitalElementConfig {
  /** Radius of the orbit */
  orbitRadius: number;

  /** Speed of rotation */
  speed: number;

  /** Color of the element */
  color: string;

  /** Size of the element */
  size: number;

  /** Axis of rotation */
  rotationAxis: [number, number, number];

  /** Animation delay in milliseconds */
  delay: number;
}

/**
 * Hero section configuration
 */
export interface HeroSectionConfig {
  /** Main heading text */
  heading: string;

  /** Subheading text */
  subheading: string;

  /** Primary button text */
  primaryButtonText: string;

  /** Secondary button text */
  secondaryButtonText: string;

  /** Primary button link */
  primaryButtonHref?: string;

  /** Secondary button link */
  secondaryButtonHref?: string;
}

/**
 * Auth overlay configuration
 */
export interface AuthOverlayConfig {
  /** Text to display on the overlay */
  signInText: string;

  /** Overlay opacity (0-1) */
  overlayOpacity: number;

  /** Animation variant */
  animationVariant: 'pulse' | 'scale';

  /** Enable keyboard shortcuts */
  enableKeyboardShortcuts: boolean;
}

/**
 * Animation configuration
 */
export interface AnimationConfig {
  /** Duration of fade animations in milliseconds */
  fadeDuration: number;

  /** Duration of text animations in milliseconds */
  textAnimationDuration: number;

  /** Duration of orbital animations in milliseconds */
  orbitalDuration: number;

  /** Spring config preset */
  springPreset: 'slow' | 'molasses' | 'default' | 'wobbly' | 'stiff' | 'gentle';
}

/**
 * Performance configuration
 */
export interface PerformanceConfig {
  /** Target FPS */
  targetFPS: number;

  /** Enable adaptive performance scaling */
  adaptivePerformance: boolean;

  /** Minimum performance multiplier */
  performanceMin: number;

  /** Maximum performance multiplier */
  performanceMax: number;

  /** Device pixel ratio */
  dpr: number | [number, number];

  /** Enable frustum culling */
  enableFrustumCulling: boolean;

  /** LOD (Level of Detail) distance */
  lodDistance: number;
}

/**
 * Complete Landing V2 configuration
 */
export interface LandingV2Config {
  scene: Scene3DConfig;
  hero: HeroSectionConfig;
  overlay: AuthOverlayConfig;
  animation: AnimationConfig;
  performance: PerformanceConfig;
}

/**
 * Default configuration presets
 */
export const DEFAULT_LANDING_V2_CONFIG: LandingV2Config = {
  scene: {
    particleCount: 40,
    enableParticles: true,
    orbitalElementCount: 5,
    glowIntensity: 1.5,
    cameraFOV: 75,
    cameraPosition: [0, 0, 15],
    enableOrbitControls: true,
    autoRotate: false,
  },
  hero: {
    heading: 'React Three Fiber Portfolio',
    subheading:
      'Explore cutting-edge 3D graphics with React Three Fiber, orbital mechanics, and real-time animation.',
    primaryButtonText: 'Explore',
    secondaryButtonText: 'Components',
    primaryButtonHref: '#about',
    secondaryButtonHref: '#components',
  },
  overlay: {
    signInText: 'Click anywhere to sign in',
    overlayOpacity: 0.3,
    animationVariant: 'pulse',
    enableKeyboardShortcuts: true,
  },
  animation: {
    fadeDuration: 600,
    textAnimationDuration: 800,
    orbitalDuration: 4000,
    springPreset: 'slow',
  },
  performance: {
    targetFPS: 60,
    adaptivePerformance: true,
    performanceMin: 0.5,
    performanceMax: 1,
    dpr: [1, 2],
    enableFrustumCulling: true,
    lodDistance: 50,
  },
};
