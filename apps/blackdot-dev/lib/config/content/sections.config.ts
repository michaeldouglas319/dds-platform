/**
 * Unified Sections Configuration
 * All sections from all pages organized by business function
 * Each section has a 'page' field to identify which page it belongs to
 * 
 * Structure:
 * - sections.manufacturing.config.ts: Productionization, problem/solution, tech, milestones
 * - sections.contract.config.ts: Contracting strategy, procurement, certifications
 * - sections.drones.config.ts: Products, market, competition, hero sections
 * - sections.testing.config.ts: Simulation, verification, digital twin
 * - sections.common.data.ts: Shared market stats, regulatory data, common content
 * 
 * ID Naming Conventions (for future additions):
 * - Current IDs are simple (e.g., 'hero', 'products') and may be duplicated across pages
 * - For new sections, consider prefixing with domain: 'drones-hero', 'manufacturing-problem'
 * - This helps avoid conflicts and makes global lookups easier
 * - Validation will warn about cross-page ID conflicts
 * 
 * Validation:
 * - Run validateSections() to check for duplicate IDs and missing parent references
 * - Auto-validates in development mode
 */

/**
 * Layout Configuration - Defines how a section is rendered
 */
export interface SectionLayout {
  type: 'scroll-based' | 'grid' | 'carousel' | 'timeline' | 'gallery' | 'custom';
  variant?: string; // e.g., 'compact', 'expanded', 'minimal'
  component?: string; // Override default component path
}

/**
 * Rendering Configuration - Maps components for content, scene, and portal views
 */
export interface SectionRendering {
  contentComponent?: string; // Path to custom content component
  sceneComponent?: string; // Path to 3D scene component
  portalComponent?: string; // Path to overview card component
  // OR use component registry IDs:
  contentId?: string; // References component registry
  sceneId?: string;
  portalId?: string;
}

/**
 * Slide Subcategory - Detailed breakdown within a section
 * Used for investor-focused content with evidence and callouts
 */
export interface SlideSubcategory {
  id: string;
  title: string;
  icon?: string;
  investorLevel?: 'angel' | 'vc' | 'strategic' | 'all';
  content: {
    summary: string;
    details: string[];
    evidence?: string[];
    callout?: { type: 'risk' | 'opportunity' | 'advantage'; text: string };
  };
  drilldownPath?: string;
}

/**
 * Drilldown Configuration - Enables nested sections and detail pages
 */
export interface SectionDrilldown {
  enabled: boolean;
  path?: string; // Auto-generated if not provided: /{page}/{id}
  layout?: 'detail' | 'fullscreen' | 'modal' | 'sidebar';
  sections?: UnifiedSection[]; // Sub-sections for drilldown
  subcategories?: SlideSubcategory[]; // Subcategories for detailed breakdowns
}

/**
 * Model Configuration - Defines 3D model behavior for a section
 */
export interface ModelConfig {
  path?: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  animation?: {
    type: 'rotate' | 'float' | 'pulse' | 'none';
    speed?: number;
    amplitude?: number;
  };
  models?: Array<{
    path: string;
    scale?: number;
    position?: [number, number, number];
    rotation?: [number, number, number];
    animation?: { type: 'rotate' | 'float' | 'pulse'; speed: number; amplitude: number };
    key: string;
  }>;
  sceneMode?: 'single' | 'multiple' | 'canvas';
  canvasScene?: {
    componentPath: string;
    props?: Record<string, unknown>;
  };
  timeline?: {
    keyframes: Array<{
      target: string;
      property: 'position' | 'rotation' | 'scale';
      value: number[];
      duration: number;
      ease?: string;
    }>;
    autoPlay?: boolean;
  };
  interactions?: {
    onClick?: string;
    onHover?: string;
    draggable?: boolean;
  };
  fallback?: {
    trigger?: 'webgl-unsupported' | 'model-load-fail' | 'low-memory';
    type?: '2d-image' | 'simple-geometry';
    imageUrl?: string;
    color?: string;
  };
  preload?: boolean;
}

export interface UnifiedSection {
  id: string;
  page: 'uav' | 'business' | 'resume' | 'personal' | 'ideas'; // Page identifier
  title: string;
  subtitle?: string;
  color?: string;
  imageUrl?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  content: {
    heading: string;
    paragraphs?: (string | { subtitle: string; description: string; citations?: Array<{ text: string; url: string }> })[];
    highlights?: (string | { subtitle: string; description: string })[];
    stats?: { label: string; value: string }[];
    features?: string[];
    knowledgeGaps?: string[]; // Areas requiring further research
  };

  // NEW: Scalable configuration fields (all optional for backward compatibility)
  layout?: SectionLayout;
  rendering?: SectionRendering;
  drilldown?: SectionDrilldown;
  children?: UnifiedSection[]; // Infinite nesting support
  parentId?: string; // For drilldown navigation

  // 3D Model Configuration - for pages with 3D visualization
  modelConfig?: ModelConfig; // Model for 3D section visualization

  // Investor-focused extensions (Phase 1)
  investorLevel?: 'angel' | 'vc' | 'strategic' | 'all';
  importance?: 'critical' | 'high' | 'medium' | 'optional';
  competitive?: {
    differentiators?: string[];
    risks?: { risk: string; mitigation: string }[];
  };
  validation?: {
    customerQuotes?: string[];
    dataPoints?: { metric: string; value: string; source?: string }[];
    proofPoints?: string[];
  };

  // Slide Taxonomy - Hierarchical categorization for filtering and routing
  taxonomy?: {
    primary: string;
    secondary?: string;
    contentTypes?: string[];
    displayMode?: string;
    investorLevel?: string;
    importance?: string;
    duration?: number;
    order?: number;
  };
}

// Import sections from business function modules
import { manufacturingSections } from './sections.manufacturing.config';
import { contractSections } from './sections.contract.config';
import { dronesSections } from './sections.drones.config';
import { testingSections } from './sections.testing.config';

// Import ideas sections
import { ideasPitchDeckSections } from './ideas-pitch-deck.config';

/**
 * All sections from all pages
 * Combined from business function modules: manufacturing, contract, drones, testing
 * Filter by page property to get sections for a specific page
 */
export const allSections: UnifiedSection[] = [
  // Combine all sections from business function modules
  ...manufacturingSections,
  ...contractSections,
  ...dronesSections,
  ...testingSections,
];

/**
 * Helper function to recursively duplicate a section for ideas page
 */
function duplicateForIdeas(section: UnifiedSection): UnifiedSection {
  return {
    ...section,
    page: 'ideas' as const,
    children: section.children ? section.children.map(duplicateForIdeas) : undefined
  };
}

/**
 * Helper functions to filter sections by page
 */
export function getSectionsByPage(page: UnifiedSection['page']): UnifiedSection[] {
  // For 'ideas' page, use the new concise pitch deck config
  if (page === 'ideas') {
    return ideasPitchDeckSections || [];
  }
  
  const flattened: UnifiedSection[] = [];
  
  function process(sections: UnifiedSection[]) {
    for (const section of sections) {
      if (section.page === page) {
        flattened.push(section);
      }
      if (section.children) {
        process(section.children);
      }
    }
  }
  
  process(allSections);
  return flattened;
}

export function getSectionById(page: UnifiedSection['page'], id: string): UnifiedSection | undefined {
  const sections = getSectionsByPage(page);
  return sections.find(section => section.id === id);
}

/**
 * Validation Results Interface
 */
export interface SectionValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates the sections configuration for common issues:
 * - Duplicate IDs (within same page)
 * - Missing parent references (parentId points to non-existent section)
 * - Orphaned sections (has parentId but parent doesn't exist)
 * 
 * @returns Validation result with errors and warnings
 */
export function validateSections(): SectionValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Build a map of all sections by page and id
  const sectionMap = new Map<string, Map<string, UnifiedSection>>();
  const allSectionsFlat: UnifiedSection[] = [];
  
  function flatten(sections: UnifiedSection[]) {
    for (const section of sections) {
      allSectionsFlat.push(section);
      if (!sectionMap.has(section.page)) {
        sectionMap.set(section.page, new Map());
      }
      const pageMap = sectionMap.get(section.page)!;
      
      // Check for duplicate IDs within the same page
      if (pageMap.has(section.id)) {
        errors.push(
          `Duplicate ID "${section.id}" found on page "${section.page}". ` +
          `First occurrence: "${pageMap.get(section.id)!.title}", ` +
          `Second occurrence: "${section.title}"`
        );
      } else {
        pageMap.set(section.id, section);
      }
      
      if (section.children) {
        flatten(section.children);
      }
    }
  }
  
  flatten(allSections);
  
  // Check for missing parent references
  for (const section of allSectionsFlat) {
    if (section.parentId) {
      const pageMap = sectionMap.get(section.page);
      if (!pageMap || !pageMap.has(section.parentId)) {
        errors.push(
          `Section "${section.id}" (${section.page}) references missing parent "${section.parentId}"`
        );
      }
    }
  }
  
  // Check for potential ID conflicts across pages (warnings only)
  const globalIdMap = new Map<string, { page: string; title: string }[]>();
  for (const section of allSectionsFlat) {
    if (!globalIdMap.has(section.id)) {
      globalIdMap.set(section.id, []);
    }
    globalIdMap.get(section.id)!.push({ page: section.page, title: section.title });
  }
  
  for (const [id, occurrences] of globalIdMap.entries()) {
    if (occurrences.length > 1) {
      const pages = occurrences.map(o => o.page).join(', ');
      warnings.push(
        `ID "${id}" is used across multiple pages (${pages}). ` +
        `Consider prefixing with domain (e.g., "drones-${id}", "manufacturing-${id}") for clarity.`
      );
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Runs validation and logs results to console.
 * Call this during development to catch configuration issues early.
 * 
 * @param throwOnError - If true, throws an error when validation fails
 */
export function validateAndLog(throwOnError = false): void {
  const result = validateSections();
  
  if (result.warnings.length > 0) {
    console.warn('Section Configuration Warnings:', result.warnings);
  }
  
  if (result.errors.length > 0) {
    console.error('Section Configuration Errors:', result.errors);
    if (throwOnError) {
      throw new Error(`Section configuration validation failed: ${result.errors.join('; ')}`);
    }
  } else if (result.warnings.length === 0) {
    // console.log('✓ Section configuration validation passed');
  }
}

// Auto-validate in development (non-production builds)
// Uses Vite's import.meta.env.DEV for browser-safe environment detection
// This runs at module load time, so we check for browser environment first
if (typeof window !== 'undefined') {
  try {
    // @ts-expect-error - import.meta is available in Vite
    const isDev = import.meta?.env?.DEV;
    if (isDev) {
      validateAndLog();
    }
  } catch {
    // Silently fail if import.meta is not available (e.g., in non-Vite builds)
    // Validation can still be called manually via validateAndLog()
  }
}

