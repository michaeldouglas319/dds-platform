/**
 * Slide Taxonomy Module - Public API
 * ===================================
 * Export all taxonomy types, enums, and helper functions
 * for use throughout the application
 */

// ============================================================================
// ENUMS & TYPES
// ============================================================================

export {
  // Primary categories
  SlideCategoryPrimary,

  // Secondary categories
  SlideCategorySecondary,

  // Content types
  ContentType,

  // Section categories
  SectionCategory,

  // Display modes
  DisplayMode,

  // Investor targeting
  InvestorLevel,

  // Importance levels
  ContentImportance,

  // Narrative function
  NarrativeFunction,

  // Visualization preference
  VisualizationPreference,

  // Composite types
  type SlideTaxonomy,
  type SlideTaxonomyMetadata
} from './slide-taxonomy';

// ============================================================================
// MAPPING TABLES & VALIDATION
// ============================================================================

export {
  // Mappings
  PRIMARY_TO_SECONDARY_MAP,
  PRIMARY_TO_CONTENT_TYPES,
  DISPLAY_MODE_TO_SECTIONS,
  INVESTOR_PRIORITY_MATRIX,
  SLIDE_CATEGORY_METADATA,

  // Validators
  isValidSecondaryCategory,

  // Helpers
  getRecommendedContentTypes,
  getVisibleSections,
  getImportanceForInvestor,
  getCategoryMetadata
} from './slide-taxonomy';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

import {
  SlideCategoryPrimary,
  SlideCategorySecondary,
  InvestorLevel,
  ContentImportance,
  DisplayMode,
  SectionCategory,
  ContentType,
  type SlideTaxonomy,
  PRIMARY_TO_SECONDARY_MAP,
  INVESTOR_PRIORITY_MATRIX,
  SLIDE_CATEGORY_METADATA,
  isValidSecondaryCategory
} from './slide-taxonomy';

/**
 * Get display name for a primary category
 * @example getPrimaryDisplayName(SlideCategoryPrimary.HOOK) → "Hook / Opening"
 */
export function getPrimaryDisplayName(primary: SlideCategoryPrimary): string {
  return SLIDE_CATEGORY_METADATA[primary]?.primary_display ?? 'Unknown';
}

/**
 * Get description for a primary category
 */
export function getPrimaryDescription(primary: SlideCategoryPrimary): string {
  return SLIDE_CATEGORY_METADATA[primary]?.primary_description ?? '';
}

/**
 * Get typical duration (in seconds) for a slide category
 */
export function getTypicalDuration(primary: SlideCategoryPrimary): number {
  return SLIDE_CATEGORY_METADATA[primary]?.duration_seconds ?? 60;
}

/**
 * Get recommended order position in deck
 */
export function getRecommendedOrder(primary: SlideCategoryPrimary): number {
  return SLIDE_CATEGORY_METADATA[primary]?.order_in_deck ?? 99;
}

/**
 * Get all secondary categories for a primary
 */
export function getSecondaryCategories(primary: SlideCategoryPrimary): SlideCategorySecondary[] {
  return PRIMARY_TO_SECONDARY_MAP[primary] || [];
}

/**
 * Find all slides of a given primary category
 */
export function filterByPrimary<T extends { taxonomy?: { primary: SlideCategoryPrimary } }>(
  slides: T[],
  primary: SlideCategoryPrimary
): T[] {
  return slides.filter(slide => slide.taxonomy?.primary === primary);
}

/**
 * Find all slides of a given secondary category
 */
export function filterBySecondary<T extends { taxonomy?: { secondary: SlideCategorySecondary } }>(
  slides: T[],
  secondary: SlideCategorySecondary
): T[] {
  return slides.filter(slide => slide.taxonomy?.secondary === secondary);
}

/**
 * Reorder slides by recommended deck position
 */
export function orderByDeckPosition<T extends { taxonomy?: { primary: SlideCategoryPrimary } }>(
  slides: T[]
): T[] {
  return [...slides].sort((a, b) => {
    const aOrder = getRecommendedOrder(a.taxonomy?.primary ?? SlideCategoryPrimary.HOOK);
    const bOrder = getRecommendedOrder(b.taxonomy?.primary ?? SlideCategoryPrimary.HOOK);
    return aOrder - bOrder;
  });
}

/**
 * Filter slides by investor level (keeping only important ones)
 */
export function filterByInvestor<T extends { taxonomy?: { primary: SlideCategoryPrimary } }>(
  slides: T[],
  investor: InvestorLevel
): T[] {
  return slides.filter(slide => {
    if (!slide.taxonomy?.primary) return true;
    const importance = INVESTOR_PRIORITY_MATRIX[investor]?.[slide.taxonomy.primary];
    return importance !== ContentImportance.OPTIONAL;
  });
}

/**
 * Get investor-specific importance ranking
 * Returns slides ordered by importance for that investor type
 */
export function rankByImportance<T extends { taxonomy?: { primary: SlideCategoryPrimary } }>(
  slides: T[],
  investor: InvestorLevel
): T[] {
  return [...slides].sort((a, b) => {
    const importanceOrder = [
      ContentImportance.CRITICAL,
      ContentImportance.HIGH,
      ContentImportance.MEDIUM,
      ContentImportance.OPTIONAL
    ];

    const aImportance = INVESTOR_PRIORITY_MATRIX[investor]?.[a.taxonomy?.primary ?? SlideCategoryPrimary.HOOK];
    const bImportance = INVESTOR_PRIORITY_MATRIX[investor]?.[b.taxonomy?.primary ?? SlideCategoryPrimary.HOOK];

    return (
      importanceOrder.indexOf(aImportance ?? ContentImportance.MEDIUM) -
      importanceOrder.indexOf(bImportance ?? ContentImportance.MEDIUM)
    );
  });
}

/**
 * Generate investor-specific deck (filtered + reordered)
 * @param slides All slides
 * @param investor Target investor type
 * @param mode Optional display mode
 * @returns Slides filtered for investor, ranked by importance
 */
export function generateInvestorDeck<T extends { taxonomy?: { primary: SlideCategoryPrimary } }>(
  slides: T[],
  investor: InvestorLevel,
  mode?: DisplayMode
): T[] {
  let filtered = filterByInvestor(slides, investor);
  let ranked = rankByImportance(filtered, investor);

  // TODO: Filter by display mode if needed
  // ranked = ranked.map(slide => filterContentByMode(slide, mode));

  return ranked;
}

/**
 * Validate a complete taxonomy configuration
 */
export function validateTaxonomyConfig(primary: SlideCategoryPrimary, secondary?: SlideCategorySecondary): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check primary
  if (!Object.values(SlideCategoryPrimary).includes(primary)) {
    errors.push(`Invalid primary category: ${primary}`);
  }

  // Check secondary matches primary
  if (secondary) {
    if (!isValidSecondaryCategory(primary, secondary)) {
      errors.push(
        `Secondary category "${secondary}" does not belong to primary "${primary}"`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get all possible enums for a dimension (useful for UI dropdowns)
 */
export function getAllEnumValues(dimension: 'primary' | 'secondary' | 'investor' | 'displayMode'): string[] {
  switch (dimension) {
    case 'primary':
      return Object.values(SlideCategoryPrimary);
    case 'secondary':
      return Object.values(SlideCategorySecondary);
    case 'investor':
      return Object.values(InvestorLevel);
    case 'displayMode':
      return Object.values(DisplayMode);
    default:
      return [];
  }
}

// ============================================================================
// SLIDE-WITH-TAXONOMY TYPE & FILTER FUNCTIONS
// ============================================================================

/**
 * Slide with complete taxonomy information
 * Used by CategoryAwareSlideRenderer component
 */
export interface SlideWithTaxonomy {
  id: string;
  title: string;
  subtitle?: string;
  taxonomy?: SlideTaxonomy;
  content?: {
    paragraphs?: Array<{ subtitle: string; description: string }>;
    highlights?: Array<{ subtitle: string; description: string }>;
    stats?: Array<{ label: string; value: string }>;
  };
}

/**
 * Filter slides by investor level
 * Keeps only slides that are not marked OPTIONAL for that investor
 */
export function filterByInvestorLevel<T extends SlideWithTaxonomy>(
  slides: T[],
  level: InvestorLevel
): T[] {
  if (level === InvestorLevel.ALL) return slides;

  return slides.filter(slide => {
    if (!slide.taxonomy?.primary) return true;
    const importance = INVESTOR_PRIORITY_MATRIX[level]?.[slide.taxonomy.primary];
    return importance !== ContentImportance.OPTIONAL;
  });
}

/**
 * Filter slides by content importance level
 */
export function filterByImportance<T extends SlideWithTaxonomy>(
  slides: T[],
  importance: ContentImportance
): T[] {
  return slides.filter(slide => {
    return slide.taxonomy?.importance === importance;
  });
}

/**
 * Filter slides by content type
 * A slide is included if it has the specified content type in its contentTypes array
 */
export function filterByContentType<T extends SlideWithTaxonomy>(
  slides: T[],
  contentType: ContentType
): T[] {
  return slides.filter(slide => {
    return slide.taxonomy?.contentTypes?.includes(contentType) ?? false;
  });
}
