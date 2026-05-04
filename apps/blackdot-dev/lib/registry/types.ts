/**
 * Component Registry Type Definitions
 *
 * Defines metadata structures for automatic component discovery and cataloging.
 * Supports all component categories from UI to 3D graphics.
 */

/**
 * 3D Scene-specific subcategories for granular Three.js/R3F component organization
 */
export type ThreeDSubcategory =
  | 'lighting'      // Lighting setups (directional, ambient, point lights)
  | 'camera'        // Camera positioning and controls
  | 'materials'     // Custom materials and shaders
  | 'animations'    // Animation systems and controllers
  | 'physics'       // Physics simulations (fluid, particles, etc.)
  | 'interactions'  // User interactions (annotations, clicks, controls)
  | 'effects'       // Post-processing and visual effects
  | 'optimization'; // Performance and memory management

/**
 * Main component categories following the three-tier architecture
 */
export type ComponentCategory =
  | 'ui'             // Layer 1: Base UI components (shadcn/Radix)
  | 'composite'      // Layer 2: Business-specific combinations
  | 'dashboard'      // Layer 2: Dashboard components for data display
  | 'editor'         // Layer 2: Editor and property editing components
  | '3d-dashboard'   // Layer 2: 3D dashboard and visualization components
  | 'layout'         // Layer 3: Full-page layouts
  | 'scene'          // Three.js/R3F scenes
  | 'model'          // 3D models
  | 'hook'           // Custom React hooks
  | 'utility';       // Utility functions and helpers

/**
 * Architectural tier for component organization
 */
export type ArchitectureLayer = 1 | 2 | 3;

/**
 * Component export information
 */
export interface ComponentExport {
  /** Name of the exported symbol */
  name: string;
  /** Whether this export is a React component */
  isComponent: boolean;
  /** Whether this export is a React hook */
  isHook: boolean;
  /** Export type (named, default, etc.) */
  type: 'named' | 'default' | 'namespace';
  /** TypeScript type/interface if applicable */
  typeDefinition?: string;
}

/**
 * Component dependency information
 */
export interface ComponentDependency {
  /** Name of the dependency */
  name: string;
  /** Whether this is an internal dependency (relative import) */
  isInternal: boolean;
  /** Path to the internal dependency (if internal) */
  internalPath?: string;
}

/**
 * Component prop definition extracted from TypeScript
 */
export interface ComponentProp {
  /** Prop name */
  name: string;
  /** Prop type as string */
  type: string;
  /** Is required prop */
  required: boolean;
  /** Default value if applicable */
  defaultValue?: string;
  /** JSDoc description */
  description?: string;
}

/**
 * Component usage example
 */
export interface ComponentExample {
  /** Example title/description */
  title: string;
  /** Example code */
  code: string;
  /** Language for syntax highlighting */
  language: 'typescript' | 'jsx' | 'tsx';
}

/**
 * Main component metadata structure
 */
export interface ComponentMetadata {
  // Identity
  /** Unique component identifier (filename without extension) */
  id: string;
  /** Display name for the component */
  name: string;
  /** File path relative to project root */
  path: string;

  // Classification
  /** Primary category */
  category: ComponentCategory;
  /** Architectural layer (1=UI, 2=Composite, 3=Layout) */
  layer?: ArchitectureLayer;
  /** 3D-specific subcategory for scene/model/effect components */
  subcategory?: ThreeDSubcategory;

  // Documentation
  /** Brief description from JSDoc @description or first comment */
  description?: string;
  /** Detailed documentation from JSDoc */
  documentation?: string;
  /** Search tags for discoverability */
  tags?: string[];

  // Implementation
  /** All exports from this component */
  exports: ComponentExport[];
  /** Component props if this is a React component */
  props?: ComponentProp[];
  /** All dependencies (internal and external) */
  dependencies?: ComponentDependency[];

  // Metadata
  /** Whether component is deprecated */
  deprecated?: boolean;
  /** Deprecation message if applicable */
  deprecationMessage?: string;
  /** External documentation link (e.g., Storybook, docs URL) */
  docLink?: string;
  /** Usage examples */
  examples?: ComponentExample[];
  /** Suggested related components */
  relatedComponents?: string[];

  // Performance (for 3D components)
  /** Estimated bundle size impact in KB */
  bundleSize?: number;
  /** Performance considerations for rendering */
  performanceNotes?: string;
  /** Required WebGL features */
  webglFeatures?: string[];

  // Timestamps
  /** File creation timestamp */
  createdAt?: string;
  /** Last modification timestamp */
  modifiedAt?: string;
}

/**
 * Complete component registry
 */
export interface ComponentRegistry {
  /** Version of the registry format */
  version: string;
  /** Timestamp when registry was generated */
  generatedAt: string;
  /** Total components cataloged */
  totalComponents: number;
  /** Components grouped by category */
  byCategory: Record<ComponentCategory, ComponentMetadata[]>;
  /** Components indexed by ID */
  byId: Record<string, ComponentMetadata>;
  /** Statistics about components */
  stats: {
    /** Total count by category */
    countByCategory: Record<ComponentCategory, number>;
    /** Total count by layer */
    countByLayer: Record<ArchitectureLayer | 'none', number>;
    /** Total count by 3D subcategory */
    countBySubcategory: Record<ThreeDSubcategory, number>;
    /** Average bundle size */
    averageBundleSize?: number;
    /** Most common dependencies */
    commonDependencies: Array<{ name: string; count: number }>;
  };
}

/**
 * JSDoc metadata extracted from comments
 */
export interface JSDocMetadata {
  /** Main description */
  description: string;
  /** All tags found in JSDoc */
  tags: Record<string, string | string[]>;
  /** @example tags */
  examples: string[];
  /** @category value */
  category?: ComponentCategory;
  /** @layer value */
  layer?: ArchitectureLayer;
  /** @subcategory value for 3D components */
  subcategory?: ThreeDSubcategory;
  /** @deprecated flag */
  deprecated?: boolean;
  /** @see links */
  seeLinks: string[];
  /** @param tags for function parameters */
  params: Array<{ name: string; type?: string; description: string }>;
  /** @returns documentation */
  returns?: { type?: string; description: string };
}

/**
 * Source file metadata for registry generation
 */
export interface SourceFileMetadata {
  /** File path relative to project root */
  path: string;
  /** File name */
  fileName: string;
  /** Directory name */
  dirName: string;
  /** Inferred category from directory structure */
  inferredCategory: ComponentCategory;
  /** JSDoc metadata extracted from file */
  jsdoc?: JSDocMetadata;
  /** TypeScript source code (for parsing) */
  source: string;
}

/**
 * Registry generation options
 */
export interface RegistryGenerationOptions {
  /** Root directory to scan */
  rootDir: string;
  /** Output path for registry JSON */
  outputPath: string;
  /** Directories to include */
  include: string[];
  /** Directories to exclude */
  exclude: string[];
  /** Whether to include performance analysis */
  analyzePerformance: boolean;
  /** Whether to generate TypeScript definitions */
  generateTypes: boolean;
  /** Watch mode for development */
  watch: boolean;
  /** Verbose logging */
  verbose: boolean;
}
