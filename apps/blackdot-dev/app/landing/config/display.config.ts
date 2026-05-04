/**
 * Landing Display Configuration
 *
 * Controls visual elements and debug toggles for the landing scene
 */

export type LoaderType =
  | 'Item1' | 'Item2' | 'Item3' | 'Item4'
  | 'Item5' | 'Item6' | 'Item7' | 'Item8'
  | 'Item9' | 'Item10' | 'Item11' | 'Item12';

export interface LandingDisplayConfig {
  /** Center loader element to display */
  centerLoader: LoaderType ;

  /** Whether center loader responds to PointLights */
  loaderLightResponsive: boolean;

  /** Scale of center loader (0-1) */
  loaderScale: number;

  /** Position of center loader (x, y, z) */
  loaderPosition: [number, number, number];

  /** Rotation of center loader (x, y, z) */
  loaderRotation: [number, number, number];

  /** Item10 customization parameters */
  item10OuterRadius?: number;
  item10InnerRadius?: number;
  item10Depth?: number;
  item10Segments?: number;

  /** Profile image controls */
  profileImageScale?: number;
  profileImagePosition?: [number, number, number];
  profileImageMetalness?: number;
  profileImageRoughness?: number;
  profileImageGlow?: number;
}

export const DEFAULT_LANDING_DISPLAY_CONFIG: LandingDisplayConfig = {
  centerLoader: 'Item5',
  loaderLightResponsive: true,
  loaderScale: 1.7,
  loaderPosition: [0, 1.9, 0],
  loaderRotation: [0, 0, 0],
  // Item10 defaults
  item10OuterRadius: 1.0,
  item10InnerRadius: 0.2,
  item10Depth: 0.3,
  item10Segments: 4,
  // Profile image defaults
  profileImageScale: 1.5,
  profileImagePosition: [0, 0, 0.1],
  profileImageMetalness: 0.4,
  profileImageRoughness: 0.3,
  profileImageGlow: 0.2,
};

export const LOADER_LIST: LoaderType[] = [
  'Item1', 'Item2', 'Item3', 'Item4',
  'Item5', 'Item6', 'Item7', 'Item8',
  'Item9', 'Item10', 'Item11', 'Item12',
];
