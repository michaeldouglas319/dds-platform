/**
 * Unified Section Configuration Types
 * Gold Standard: All section data structures for the entire portfolio
 *
 * Based on best practices:
 * - Config-driven UI architecture
 * - Type-safe configuration
 * - Composition over inheritance
 * - Single source of truth
 */

import type { ComponentType } from 'react';

/**
 * Supported page types in the portfolio
 */
export type PageType =
  | 'landing'
  | 'overview'
  | 'resume'
  | 'projects'
  | 'about'
  | 'personal'
  | 'business'
  | 'ideas'
  | 'uav'
  | 'showcase';

/**
 * Layout types for rendering sections
 */
export type LayoutType =
  | 'scroll-based'    // Fixed 3D scene with scrolling overlays
  | 'portal-cards'    // 3D floating cards (overview style)
  | 'grid'            // Traditional grid layout
  | 'landing'         // Full-screen immersive
  | 'carousel'        // Horizontal carousel
  | 'timeline'        // Vertical timeline
  | 'gallery'         // Image gallery
  | 'custom';         // Custom layout component

/**
 * Layout Configuration - Defines how a section is rendered
 */
export interface SectionLayout {
  type: LayoutType;
  variant?: string;           // e.g., 'compact', 'expanded', 'minimal'
  component?: string;         // Override default component path
  columns?: number;           // For grid layouts
  gap?: number;               // Spacing between items
}

/**
 * Rendering Configuration - Maps components for content, scene, and portal views
 */
export interface SectionRendering {
  // Explicit component paths
  contentComponent?: string;  // Path to custom content component
  sceneComponent?: string;    // Path to 3D scene component
  portalComponent?: string;   // Path to overview card component

  // Component registry IDs
  contentId?: string;         // References component registry
  sceneId?: string;
  portalId?: string;
}

/**
 * Drilldown Configuration - Enables nested sections and detail pages
 */
export interface SectionDrilldown {
  enabled: boolean;
  path?: string;              // Auto-generated if not provided: /{page}/{id}
  layout?: 'detail' | 'fullscreen' | 'modal' | 'sidebar';
  sections?: Section[];       // Sub-sections for drilldown
}

/**
 * Section Content - Rich content structure
 */
export interface SectionContent {
  heading: string;
  subheading?: string;
  paragraphs?: string[];
  highlights?: string[];
  stats?: { label: string; value: string; change?: string }[];
  features?: string[];
  skills?: string[];
  technologies?: string[];
  knowledgeGaps?: string[];   // Areas requiring further research
  metadata?: Record<string, unknown>;
}

/**
 * 3D Scene Configuration
 */
export interface Scene3DConfig {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  color?: string;
  imageUrl?: string;
  modelUrl?: string;

  // Lighting
  lighting?: {
    ambient?: { intensity: number };
    directional?: { intensity: number; position: [number, number, number] };
    point?: { intensity: number; position: [number, number, number]; color?: string };
  };

  // Environment
  environment?: string | false;
  fog?: { enabled: boolean; near?: number; far?: number };
  floor?: { enabled: boolean; color?: { dark: string; light: string } };
}

/**
 * Main Section Interface - The gold standard
 */
export interface Section {
  // Core identifiers
  id: string;
  page: PageType;

  // Display
  title: string;
  subtitle?: string;
  description?: string;
  icon?: string;
  imageUrl?: string;
  badge?: string;
  color?: string;             // Section theme color

  // Content
  content: SectionContent;

  // 3D Scene
  scene?: Scene3DConfig;

  // Layout & Rendering (optional - falls back to page defaults)
  layout?: SectionLayout;
  rendering?: SectionRendering;

  // Navigation
  path?: string;              // Custom path override
  drilldown?: SectionDrilldown;
  parentId?: string;          // For hierarchical navigation
  children?: Section[];       // Infinite nesting support
  order?: number;             // Display order

  // Metadata
  tags?: string[];
  category?: string;
  featured?: boolean;
  published?: boolean;
  createdAt?: string;
  updatedAt?: string;
  citations?: Array<{ text: string; url: string }>;  // Source citations
}

/**
 * Page Configuration - Defines default settings for a page
 */
export interface PageConfig {
  id: PageType;
  title: string;
  description?: string;
  defaultLayout: LayoutType;
  sections: Section[];

  // 3D Scene defaults
  sceneDefaults?: Scene3DConfig;

  // SEO
  meta?: {
    title: string;
    description: string;
    keywords?: string[];
    ogImage?: string;
  };
}

/**
 * Component Registry Entry
 */
export interface ComponentRegistryEntry {
  id: string;
  factory: () => Promise<{ default: ComponentType<unknown> }>;
  description?: string;
  preload?: boolean;
}

/**
 * Performance Configuration
 */
export interface PerformanceConfig {
  targetFPS: number;
  adaptiveQuality: boolean;
  levels: {
    high: { pixelRatio: number; particleCount: number; shadowMap: number };
    medium: { pixelRatio: number; particleCount: number; shadowMap: number };
    low: { pixelRatio: number; particleCount: number; shadowMap: number };
  };
}
