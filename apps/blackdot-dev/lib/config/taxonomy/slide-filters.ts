/**
 * Category-Aware Slide Filtering & Manipulation
 * ==============================================
 * Enables flexible querying and deck generation based on taxonomy
 *
 * Provides 20+ utility functions for:
 * - Filtering slides by any taxonomy dimension
 * - Sorting by order, importance, narrative flow
 * - Generating audience-specific presentations
 * - Analyzing deck composition and gaps
 * - Validating deck completeness
 * - Recommending next slides
 * - Creating pre-built deck variants
 */

import type { SlideTaxonomy, SlideTaxonomyMetadata } from './slide-taxonomy';
import {
  SlideCategoryPrimary,
  SlideCategorySecondary,
  ContentType,
  DisplayMode,
  InvestorLevel,
  ContentImportance,
  NarrativeFunction,
  VisualizationPreference,
  SectionCategory,
  DISPLAY_MODE_TO_SECTIONS,
  getVisibleSections,
  INVESTOR_PRIORITY_MATRIX,
  getImportanceForInvestor,
  PRIMARY_TO_SECONDARY_MAP,
  isValidSecondaryCategory,
  getCategoryMetadata,
  SLIDE_CATEGORY_METADATA
} from './slide-taxonomy';

/**
 * Extended slide interface for filtering utilities
 * Assumes each slide has taxonomy metadata
 */
export interface SlideWithTaxonomy {
  id: string;
  title: string;
  taxonomy: SlideTaxonomy & {
    order?: number;
    duration?: number;
  };
  order?: number;
  duration?: number;
  [key: string]: any; // Other slide properties
}

/**
 * ============================================================================
 * BASIC FILTERS
 * ============================================================================
 */

/**
 * FILTER: By primary category
 * Returns slides matching the specified primary category
 *
 * @example
 * const positioningSlides = filterByPrimary(slides, SlideCategoryPrimary.POSITIONING);
 */
export function filterByPrimary(
  slides: SlideWithTaxonomy[],
  primary: SlideCategoryPrimary
): SlideWithTaxonomy[] {
  return slides.filter(s => s.taxonomy?.primary === primary);
}

/**
 * FILTER: By secondary category
 * Returns slides matching the specified secondary category
 *
 * @example
 * const moatSlides = filterBySecondary(slides, SlideCategorySecondary.POSITIONING_COMPETITIVE_MOAT);
 */
export function filterBySecondary(
  slides: SlideWithTaxonomy[],
  secondary: SlideCategorySecondary
): SlideWithTaxonomy[] {
  return slides.filter(s => s.taxonomy?.secondary === secondary);
}

/**
 * FILTER: By content type
 * Returns slides that include the specified content type
 *
 * @example
 * const technicalSlides = filterByContentType(slides, ContentType.TECHNICAL);
 */
export function filterByContentType(
  slides: SlideWithTaxonomy[],
  contentType: ContentType
): SlideWithTaxonomy[] {
  return slides.filter(s => s.taxonomy?.contentTypes?.includes(contentType));
}

/**
 * FILTER: By investor level
 * Returns slides visible to the specified investor type
 * Includes slides marked as InvestorLevel.ALL
 *
 * @example
 * const vcSlides = filterByInvestorLevel(slides, InvestorLevel.VC);
 */
export function filterByInvestorLevel(
  slides: SlideWithTaxonomy[],
  investor: InvestorLevel
): SlideWithTaxonomy[] {
  return slides.filter(s =>
    s.taxonomy?.investorLevel === InvestorLevel.ALL ||
    s.taxonomy?.investorLevel === investor
  );
}

/**
 * FILTER: By importance level
 * Returns slides matching the specified importance threshold
 *
 * @example
 * const criticalSlides = filterByImportance(slides, ContentImportance.CRITICAL);
 */
export function filterByImportance(
  slides: SlideWithTaxonomy[],
  importance: ContentImportance
): SlideWithTaxonomy[] {
  return slides.filter(s => s.taxonomy?.importance === importance);
}

/**
 * FILTER: By display mode
 * Returns slides configured for the specified display mode
 *
 * @example
 * const summarySlides = filterByDisplayMode(slides, DisplayMode.SUMMARY);
 */
export function filterByDisplayMode(
  slides: SlideWithTaxonomy[],
  displayMode: DisplayMode
): SlideWithTaxonomy[] {
  return slides.filter(s => s.taxonomy?.displayMode === displayMode);
}

/**
 * FILTER: By visualization preference
 * Returns slides with the specified visualization type
 *
 * @example
 * const dataVizSlides = filterByVisualization(slides, VisualizationPreference.DATA_VISUALIZATION);
 */
export function filterByVisualization(
  slides: SlideWithTaxonomy[],
  visualization: VisualizationPreference
): SlideWithTaxonomy[] {
  return slides.filter(s => s.taxonomy?.visualizationPreference === visualization);
}

/**
 * FILTER: By narrative function
 * Returns slides with the specified narrative role
 *
 * @example
 * const hookSlides = filterByNarrativeFunction(slides, NarrativeFunction.HOOK);
 */
export function filterByNarrativeFunction(
  slides: SlideWithTaxonomy[],
  narrativeFunction: NarrativeFunction
): SlideWithTaxonomy[] {
  return slides.filter(s => s.taxonomy?.narrativeFunction === narrativeFunction);
}

/**
 * ============================================================================
 * MULTI-DIMENSIONAL FILTERS
 * ============================================================================
 */

/**
 * FILTER: Multi-dimensional with AND logic
 * Returns slides matching ALL specified criteria (if provided)
 * Undefined criteria are ignored (act as wildcards)
 *
 * @example
 * const matching = filterByMultiple(slides, {
 *   primary: SlideCategoryPrimary.SOLUTION,
 *   contentTypes: [ContentType.TECHNICAL],
 *   investorLevel: InvestorLevel.VC
 * });
 */
export function filterByMultiple(
  slides: SlideWithTaxonomy[],
  criteria: Partial<SlideTaxonomy>
): SlideWithTaxonomy[] {
  return slides.filter(s => {
    if (criteria.primary && s.taxonomy?.primary !== criteria.primary) return false;
    if (criteria.secondary && s.taxonomy?.secondary !== criteria.secondary) return false;
    if (criteria.investorLevel) {
      const isMatch =
        s.taxonomy?.investorLevel === InvestorLevel.ALL ||
        s.taxonomy?.investorLevel === criteria.investorLevel;
      if (!isMatch) return false;
    }
    if (criteria.importance && s.taxonomy?.importance !== criteria.importance) return false;
    if (criteria.displayMode && s.taxonomy?.displayMode !== criteria.displayMode) return false;
    if (criteria.narrativeFunction && s.taxonomy?.narrativeFunction !== criteria.narrativeFunction) return false;
    if (criteria.visualizationPreference && s.taxonomy?.visualizationPreference !== criteria.visualizationPreference) return false;
    if (criteria.contentTypes?.length) {
      const hasAny = criteria.contentTypes.some(ct => s.taxonomy?.contentTypes?.includes(ct));
      if (!hasAny) return false;
    }
    if (criteria.sectionCategories?.length) {
      const hasAllSections = criteria.sectionCategories.every(sc => s.taxonomy?.sectionCategories?.includes(sc));
      if (!hasAllSections) return false;
    }
    return true;
  });
}

/**
 * FILTER: Exclude slides by primary category
 * Returns all slides EXCEPT those in the specified primary category
 *
 * @example
 * const nonTechnical = excludePrimary(slides, SlideCategoryPrimary.SOLUTION);
 */
export function excludePrimary(
  slides: SlideWithTaxonomy[],
  primary: SlideCategoryPrimary
): SlideWithTaxonomy[] {
  return slides.filter(s => s.taxonomy?.primary !== primary);
}

/**
 * ============================================================================
 * SORTING FUNCTIONS
 * ============================================================================
 */

/**
 * SORT: By order field (sequential presentation order)
 * Returns sorted copy of slides
 * Default order is 999 if not specified
 *
 * @example
 * const ordered = sortByOrder(slides);
 */
export function sortByOrder(slides: SlideWithTaxonomy[]): SlideWithTaxonomy[] {
  return [...slides].sort((a, b) => (a.taxonomy?.order ?? a.order ?? 999) - (b.taxonomy?.order ?? b.order ?? 999));
}

/**
 * SORT: By importance level
 * Returns sorted copy with most important first
 * Priority: critical > high > medium > optional
 *
 * @example
 * const byImportance = sortByImportance(slides);
 */
export function sortByImportance(slides: SlideWithTaxonomy[]): SlideWithTaxonomy[] {
  const importanceMap: Record<ContentImportance, number> = {
    [ContentImportance.CRITICAL]: 4,
    [ContentImportance.HIGH]: 3,
    [ContentImportance.MEDIUM]: 2,
    [ContentImportance.OPTIONAL]: 1
  };

  return [...slides].sort((a, b) => {
    const aImp = importanceMap[a.taxonomy?.importance ?? ContentImportance.OPTIONAL] ?? 0;
    const bImp = importanceMap[b.taxonomy?.importance ?? ContentImportance.OPTIONAL] ?? 0;
    return bImp - aImp;
  });
}

/**
 * SORT: By duration
 * Returns sorted copy with longest duration first
 * Default duration is 300 seconds if not specified
 *
 * @example
 * const byDuration = sortByDuration(slides);
 */
export function sortByDuration(slides: SlideWithTaxonomy[]): SlideWithTaxonomy[] {
  return [...slides].sort((a, b) => (b.duration ?? 300) - (a.duration ?? 300));
}

/**
 * SORT: By narrative function
 * Returns slides ordered by narrative arc
 * Flow: hook → context → resolution → proof → vision → cta
 *
 * @example
 * const narrativeFlow = sortByNarrativeFlow(slides);
 */
export function sortByNarrativeFlow(slides: SlideWithTaxonomy[]): SlideWithTaxonomy[] {
  const narrativeOrder: Record<NarrativeFunction, number> = {
    [NarrativeFunction.HOOK]: 1,
    [NarrativeFunction.CONTEXT_SETTING]: 2,
    [NarrativeFunction.RESOLUTION]: 3,
    [NarrativeFunction.PROOF_POINT]: 4,
    [NarrativeFunction.VISION_CASTING]: 5,
    [NarrativeFunction.CALL_TO_ACTION]: 6
  };

  return [...slides].sort((a, b) => {
    const aOrder = narrativeOrder[a.taxonomy?.narrativeFunction ?? NarrativeFunction.HOOK] ?? 0;
    const bOrder = narrativeOrder[b.taxonomy?.narrativeFunction ?? NarrativeFunction.HOOK] ?? 0;
    return aOrder - bOrder;
  });
}

/**
 * ============================================================================
 * DECK GENERATION (Pre-built variants)
 * ============================================================================
 */

/**
 * DECK: Investor-specific deck
 * Returns slides relevant to specific investor type, sorted by importance
 * Combines filterByInvestorLevel + sortByImportance
 *
 * @example
 * const vcDeck = generateInvestorDeck(slides, InvestorLevel.VC);
 */
export function generateInvestorDeck(
  slides: SlideWithTaxonomy[],
  investor: InvestorLevel
): SlideWithTaxonomy[] {
  const filtered = filterByInvestorLevel(slides, investor);
  return sortByImportance(filtered);
}

/**
 * DECK: Quick summary deck
 * Returns only CRITICAL slides in presentation order
 * Ideal for elevator pitches or quick demos
 *
 * @example
 * const summary = generateSummaryDeck(slides); // ~5 minutes
 */
export function generateSummaryDeck(
  slides: SlideWithTaxonomy[]
): SlideWithTaxonomy[] {
  return filterByImportance(slides, ContentImportance.CRITICAL)
    .sort((a, b) => (a.taxonomy?.order ?? a.order ?? 999) - (b.taxonomy?.order ?? b.order ?? 999));
}

/**
 * DECK: Technical deep-dive
 * Returns slides with TECHNICAL content type, ordered by narrative flow
 * For technical evaluation, due diligence, or expert audiences
 *
 * @example
 * const techDeck = generateTechnicalDeck(slides); // ~20 minutes
 */
export function generateTechnicalDeck(
  slides: SlideWithTaxonomy[]
): SlideWithTaxonomy[] {
  return filterByContentType(slides, ContentType.TECHNICAL)
    .sort((a, b) => (a.taxonomy?.order ?? a.order ?? 999) - (b.taxonomy?.order ?? b.order ?? 999));
}

/**
 * DECK: Data-focused deck
 * Returns slides with DATA_METRICS content type
 * For financial reviews, board meetings, or metric-driven audiences
 *
 * @example
 * const dataDeck = generateDataDeck(slides);
 */
export function generateDataDeck(
  slides: SlideWithTaxonomy[]
): SlideWithTaxonomy[] {
  return filterByContentType(slides, ContentType.DATA_METRICS)
    .sort((a, b) => (a.taxonomy?.order ?? a.order ?? 999) - (b.taxonomy?.order ?? b.order ?? 999));
}

/**
 * DECK: Narrative-focused deck
 * Returns slides with NARRATIVE content type
 * For storytelling, emotional resonance, or consumer audiences
 *
 * @example
 * const storyDeck = generateNarrativeDeck(slides);
 */
export function generateNarrativeDeck(
  slides: SlideWithTaxonomy[]
): SlideWithTaxonomy[] {
  return filterByContentType(slides, ContentType.NARRATIVE)
    .sort((a, b) => (a.taxonomy?.order ?? a.order ?? 999) - (b.taxonomy?.order ?? b.order ?? 999));
}

/**
 * ============================================================================
 * ANALYSIS FUNCTIONS
 * ============================================================================
 */

/**
 * ANALYSIS: Distribution by primary category
 * Returns count of slides in each primary category
 *
 * @example
 * const dist = analyzeDistributionByPrimary(slides);
 * // { hook: 1, positioning: 2, foundation: 3, solution: 4, validation: 2, cta: 2 }
 */
export function analyzeDistributionByPrimary(
  slides: SlideWithTaxonomy[]
): Record<string, number> {
  const dist: Record<string, number> = {};
  slides.forEach(s => {
    const primary = s.taxonomy?.primary;
    if (primary) {
      dist[primary] = (dist[primary] ?? 0) + 1;
    }
  });
  return dist;
}

/**
 * ANALYSIS: Distribution by content type
 * Returns count of slides for each content type
 * Note: Slides can have multiple content types, so totals may exceed slide count
 *
 * @example
 * const contentDist = analyzeDistributionByContentType(slides);
 * // { narrative: 3, 'data-metrics': 5, technical: 4, ... }
 */
export function analyzeDistributionByContentType(
  slides: SlideWithTaxonomy[]
): Record<string, number> {
  const dist: Record<string, number> = {};
  slides.forEach(s => {
    s.taxonomy?.contentTypes?.forEach(ct => {
      dist[ct] = (dist[ct] ?? 0) + 1;
    });
  });
  return dist;
}

/**
 * ANALYSIS: Distribution by importance
 * Returns count of slides at each importance level
 *
 * @example
 * const importanceDist = analyzeDistributionByImportance(slides);
 */
export function analyzeDistributionByImportance(
  slides: SlideWithTaxonomy[]
): Record<string, number> {
  const dist: Record<string, number> = {};
  slides.forEach(s => {
    const importance = s.taxonomy?.importance ?? ContentImportance.OPTIONAL;
    dist[importance] = (dist[importance] ?? 0) + 1;
  });
  return dist;
}

/**
 * ANALYSIS: Distribution by investor level
 * Returns count of slides for each investor type
 *
 * @example
 * const investorDist = analyzeDistributionByInvestor(slides);
 */
export function analyzeDistributionByInvestor(
  slides: SlideWithTaxonomy[]
): Record<string, number> {
  const dist: Record<string, number> = {};
  slides.forEach(s => {
    const investor = s.taxonomy?.investorLevel ?? InvestorLevel.ALL;
    dist[investor] = (dist[investor] ?? 0) + 1;
  });
  return dist;
}

/**
 * ANALYSIS: Total duration
 * Sums duration of all slides
 * Default 300 seconds (5 min) per slide if not specified
 *
 * @example
 * const total = calculateTotalDuration(slides);
 * // 3600 (seconds) = 60 minutes
 */
export function calculateTotalDuration(
  slides: SlideWithTaxonomy[]
): number {
  return slides.reduce((total, s) => total + (s.duration ?? s.taxonomy?.order ?? 300), 0);
}

/**
 * ANALYSIS: Average slide length
 *
 * @example
 * const avgLength = calculateAverageSlideDuration(slides);
 */
export function calculateAverageSlideDuration(slides: SlideWithTaxonomy[]): number {
  if (slides.length === 0) return 0;
  return calculateTotalDuration(slides) / slides.length;
}

/**
 * ANALYSIS: Find content gaps
 * Returns primary categories not represented in the slides
 * Helps identify missing deck sections
 *
 * @example
 * const gaps = findContentGaps(slides);
 * // If missing SOLUTION and VALIDATION: ['solution', 'validation']
 */
export function findContentGaps(
  slides: SlideWithTaxonomy[],
  requiredCategories: SlideCategoryPrimary[] = Object.values(SlideCategoryPrimary)
): SlideCategoryPrimary[] {
  const represented = new Set(slides.map(s => s.taxonomy?.primary).filter(Boolean));
  return requiredCategories.filter(cat => !represented.has(cat));
}

/**
 * ============================================================================
 * VALIDATION FUNCTIONS
 * ============================================================================
 */

/**
 * VALIDATION: Check deck completeness
 * Comprehensive validation including:
 * - All critical categories present
 * - Importance distribution
 * - Content type distribution
 * - Total duration
 *
 * @example
 * const validation = validateDeckCompleteness(slides);
 * if (!validation.isComplete) console.log('Missing:', validation.gaps);
 */
export interface DeckValidationResult {
  isComplete: boolean;
  gaps: SlideCategoryPrimary[];
  stats: {
    totalSlides: number;
    distribution: Record<string, number>;
    contentDistribution: Record<string, number>;
    importanceDistribution: Record<string, number>;
    investorDistribution: Record<string, number>;
    totalDuration: number;
    averageSlideLength: number;
  };
}

export function validateDeckCompleteness(
  slides: SlideWithTaxonomy[]
): DeckValidationResult {
  const gaps = findContentGaps(slides);
  const distribution = analyzeDistributionByPrimary(slides);
  const contentDist = analyzeDistributionByContentType(slides);
  const importanceDist = analyzeDistributionByImportance(slides);
  const investorDist = analyzeDistributionByInvestor(slides);
  const duration = calculateTotalDuration(slides);

  return {
    isComplete: gaps.length === 0,
    gaps,
    stats: {
      totalSlides: slides.length,
      distribution,
      contentDistribution: contentDist,
      importanceDistribution: importanceDist,
      investorDistribution: investorDist,
      totalDuration: duration,
      averageSlideLength: calculateAverageSlideDuration(slides)
    }
  };
}

/**
 * VALIDATION: Check investor-specific deck completeness
 * Validates that all important slides for an investor type are present
 *
 * @example
 * const vcValidation = validateInvestorDeckCompleteness(slides, InvestorLevel.VC);
 */
export interface InvestorDeckValidationResult {
  isComplete: boolean;
  missingImportant: SlideCategoryPrimary[];
  stats: DeckValidationResult['stats'];
}

export function validateInvestorDeckCompleteness(
  slides: SlideWithTaxonomy[],
  investor: InvestorLevel
): InvestorDeckValidationResult {
  const filtered = filterByInvestorLevel(slides, investor);
  const validation = validateDeckCompleteness(filtered);

  // Find slides that should be CRITICAL for this investor but aren't present
  const allPrimaries = Object.values(SlideCategoryPrimary);
  const missingImportant = allPrimaries.filter(primary => {
    const importance = getImportanceForInvestor(primary, investor);
    const hasSlide = filtered.some(s => s.taxonomy?.primary === primary);
    return importance === ContentImportance.CRITICAL && !hasSlide;
  });

  return {
    isComplete: validation.isComplete && missingImportant.length === 0,
    missingImportant,
    stats: validation.stats
  };
}

/**
 * ============================================================================
 * RECOMMENDATION FUNCTIONS
 * ============================================================================
 */

/**
 * RECOMMENDATION: Get next slide suggestion
 * Based on current slide order, returns the next logical slide
 *
 * @example
 * const next = getNextSlideRecommendation(slides, currentSlide);
 * if (next) navigateToSlide(next.id);
 */
export function getNextSlideRecommendation(
  allSlides: SlideWithTaxonomy[],
  currentSlide: SlideWithTaxonomy
): SlideWithTaxonomy | null {
  const currentOrder = currentSlide.taxonomy?.order ?? currentSlide.order ?? 0;
  const candidates = allSlides.filter(s => {
    const slideOrder = s.taxonomy?.order ?? s.order ?? 999;
    return slideOrder > currentOrder;
  });

  return candidates.length > 0
    ? candidates.sort((a, b) => {
        const aOrder = a.taxonomy?.order ?? a.order ?? 999;
        const bOrder = b.taxonomy?.order ?? b.order ?? 999;
        return aOrder - bOrder;
      })[0]
    : null;
}

/**
 * RECOMMENDATION: Get previous slide suggestion
 * Returns the previous slide in presentation order
 *
 * @example
 * const prev = getPreviousSlideRecommendation(slides, currentSlide);
 */
export function getPreviousSlideRecommendation(
  allSlides: SlideWithTaxonomy[],
  currentSlide: SlideWithTaxonomy
): SlideWithTaxonomy | null {
  const currentOrder = currentSlide.taxonomy?.order ?? currentSlide.order ?? 0;
  const candidates = allSlides.filter(s => {
    const slideOrder = s.taxonomy?.order ?? s.order ?? 999;
    return slideOrder < currentOrder;
  });

  return candidates.length > 0
    ? candidates.sort((a, b) => {
        const aOrder = b.taxonomy?.order ?? b.order ?? 999;
        const bOrder = a.taxonomy?.order ?? a.order ?? 999;
        return aOrder - bOrder;
      })[0]
    : null;
}

/**
 * RECOMMENDATION: Find related slides
 * Returns slides with similar primary categories or content types
 *
 * @example
 * const related = findRelatedSlides(slides, currentSlide, 3);
 */
export function findRelatedSlides(
  allSlides: SlideWithTaxonomy[],
  currentSlide: SlideWithTaxonomy,
  limit: number = 3
): SlideWithTaxonomy[] {
  const relatedByPrimary = allSlides.filter(
    s => s.id !== currentSlide.id && s.taxonomy?.primary === currentSlide.taxonomy?.primary
  );

  if (relatedByPrimary.length >= limit) {
    return relatedByPrimary.slice(0, limit);
  }

  // If not enough from same primary, add slides with matching content types
  const relatedByContent = allSlides.filter(s => {
    if (s.id === currentSlide.id) return false;
    if (relatedByPrimary.includes(s)) return false;
    const currentContentTypes = currentSlide.taxonomy?.contentTypes || [];
    const slideContentTypes = s.taxonomy?.contentTypes || [];
    return currentContentTypes.some(ct => slideContentTypes.includes(ct));
  });

  return [...relatedByPrimary, ...relatedByContent].slice(0, limit);
}

/**
 * ============================================================================
 * UI HELPER FUNCTIONS
 * ============================================================================
 */

/**
 * UI HELPER: Get all distinct primary categories in slides
 * Useful for filter dropdowns, category badges, etc.
 *
 * @example
 * const categories = getAllPrimaryCategories(slides);
 */
export function getAllPrimaryCategories(slides: SlideWithTaxonomy[]): SlideCategoryPrimary[] {
  const set = new Set(slides.map(s => s.taxonomy?.primary).filter(Boolean));
  return Array.from(set) as SlideCategoryPrimary[];
}

/**
 * UI HELPER: Get all distinct secondary categories in slides
 *
 * @example
 * const secondaries = getAllSecondaryCategories(slides);
 */
export function getAllSecondaryCategories(slides: SlideWithTaxonomy[]): SlideCategorySecondary[] {
  const set = new Set(slides.map(s => s.taxonomy?.secondary).filter(Boolean));
  return Array.from(set) as SlideCategorySecondary[];
}

/**
 * UI HELPER: Get all distinct content types in slides
 *
 * @example
 * const contentTypes = getAllContentTypes(slides);
 */
export function getAllContentTypes(slides: SlideWithTaxonomy[]): ContentType[] {
  const types = new Set<ContentType>();
  slides.forEach(s => s.taxonomy?.contentTypes?.forEach(ct => types.add(ct)));
  return Array.from(types);
}

/**
 * UI HELPER: Get all distinct investor levels in slides
 *
 * @example
 * const investors = getAllInvestorLevels(slides);
 */
export function getAllInvestorLevels(slides: SlideWithTaxonomy[]): InvestorLevel[] {
  const levels = new Set<InvestorLevel>();
  slides.forEach(s => {
    if (s.taxonomy?.investorLevel) {
      levels.add(s.taxonomy.investorLevel);
    }
  });
  return Array.from(levels);
}

/**
 * UI HELPER: Get all distinct display modes in slides
 *
 * @example
 * const modes = getAllDisplayModes(slides);
 */
export function getAllDisplayModes(slides: SlideWithTaxonomy[]): DisplayMode[] {
  const modes = new Set<DisplayMode>();
  slides.forEach(s => {
    if (s.taxonomy?.displayMode) {
      modes.add(s.taxonomy.displayMode);
    }
  });
  return Array.from(modes);
}

/**
 * ============================================================================
 * DECK VARIANT SYSTEM
 * ============================================================================
 */

/**
 * Deck variant configuration
 * Defines a named presentation template with filters and target duration
 */
export interface DeckVariant {
  name: string;
  description?: string;
  filters: Partial<SlideTaxonomy>;
  targetDuration?: number; // seconds
  minSlides?: number;
  maxSlides?: number;
}

/**
 * VARIANT: Generate deck from variant template
 * Applies variant filters and returns matching slides
 *
 * @example
 * const angelPitch = generateDeckVariant(slides, DECK_VARIANTS.ANGEL_PITCH);
 */
export function generateDeckVariant(
  slides: SlideWithTaxonomy[],
  variant: DeckVariant
): SlideWithTaxonomy[] {
  return filterByMultiple(slides, variant.filters)
    .sort((a, b) => (a.taxonomy?.order ?? a.order ?? 999) - (b.taxonomy?.order ?? b.order ?? 999));
}

/**
 * VARIANT: Analyze variant performance
 * Returns metrics about how well a deck matches the variant target
 *
 * @example
 * const analysis = analyzeVariantPerformance(slides, DECK_VARIANTS.VC_DEEP_DIVE, vcSlides);
 */
export interface VariantPerformanceAnalysis {
  variant: string;
  slideCount: number;
  actualDuration: number;
  targetDuration: number;
  durationDiff: number;
  meetsTarget: boolean;
  confidenceScore: number; // 0-1, higher is better fit
}

export function analyzeVariantPerformance(
  allSlides: SlideWithTaxonomy[],
  variant: DeckVariant,
  selectedSlides: SlideWithTaxonomy[]
): VariantPerformanceAnalysis {
  const actualDuration = calculateTotalDuration(selectedSlides);
  const targetDuration = variant.targetDuration || 1200; // default 20 min
  const durationDiff = actualDuration - targetDuration;
  const meetsTarget = Math.abs(durationDiff) <= targetDuration * 0.1; // within 10%

  // Confidence score: 0-1, penalize for missed criteria and duration deviation
  let confidence = 1.0;

  // Penalize if slide count out of range
  if (variant.minSlides && selectedSlides.length < variant.minSlides) {
    confidence -= 0.2;
  }
  if (variant.maxSlides && selectedSlides.length > variant.maxSlides) {
    confidence -= 0.2;
  }

  // Penalize for duration deviation
  const durationDeviation = Math.abs(durationDiff) / targetDuration;
  confidence -= Math.min(durationDeviation * 0.5, 0.3);

  return {
    variant: variant.name,
    slideCount: selectedSlides.length,
    actualDuration,
    targetDuration,
    durationDiff,
    meetsTarget,
    confidenceScore: Math.max(0, Math.min(1, confidence))
  };
}

/**
 * ============================================================================
 * PRE-BUILT DECK VARIANTS
 * ============================================================================
 */

/**
 * Library of common presentation templates
 * Each variant includes filters and recommended duration
 */
export const DECK_VARIANTS: Record<string, DeckVariant> = {
  ANGEL_PITCH: {
    name: 'Angel Investor Pitch - 5 minutes',
    description: 'Quick pitch focused on founder, problem, vision, and ask. Light on technical details.',
    filters: {
      investorLevel: InvestorLevel.ANGEL,
      importance: ContentImportance.CRITICAL
    },
    targetDuration: 300, // 5 minutes
    minSlides: 5,
    maxSlides: 8
  },

  VC_DEEP_DIVE: {
    name: 'VC Deep Dive - 20 minutes',
    description: 'Complete narrative with market data, traction, financials, and team. Full details for institutional investors.',
    filters: {
      investorLevel: InvestorLevel.VC
    },
    targetDuration: 1200, // 20 minutes
    minSlides: 12,
    maxSlides: 16
  },

  STRATEGIC_PARTNER: {
    name: 'Strategic Partner Review - 15 minutes',
    description: 'Technical deep-dive focused on architecture, capabilities, and integration opportunities.',
    filters: {
      investorLevel: InvestorLevel.STRATEGIC,
      contentTypes: [ContentType.TECHNICAL, ContentType.STRATEGIC]
    },
    targetDuration: 900, // 15 minutes
    minSlides: 10,
    maxSlides: 14
  },

  TECHNICAL_REVIEW: {
    name: 'Technical Due Diligence - 30 minutes',
    description: 'Comprehensive technical review including architecture, tech stack, and implementation roadmap.',
    filters: {
      contentTypes: [ContentType.TECHNICAL]
    },
    targetDuration: 1800, // 30 minutes
    minSlides: 15,
    maxSlides: 20
  },

  EXECUTIVE_SUMMARY: {
    name: 'Executive Summary - 3 minutes',
    description: 'Ultra-concise overview: problem, solution, why now, ask. Critical slides only.',
    filters: {
      importance: ContentImportance.CRITICAL
    },
    targetDuration: 180, // 3 minutes
    minSlides: 3,
    maxSlides: 5
  },

  BOARD_MEETING: {
    name: 'Board Meeting - 25 minutes',
    description: 'Formal presentation for board approval. Emphasizes traction, metrics, and strategic positioning.',
    filters: {
      contentTypes: [ContentType.DATA_METRICS, ContentType.STRATEGIC]
    },
    targetDuration: 1500, // 25 minutes
    minSlides: 14,
    maxSlides: 18
  },

  INVESTOR_UPDATE: {
    name: 'Investor Update - 10 minutes',
    description: 'Progress report for existing investors. Focuses on achievements, metrics, and next milestones.',
    filters: {
      importance: { high: true, critical: true } as any, // High or Critical
      contentTypes: [ContentType.DATA_METRICS]
    },
    targetDuration: 600, // 10 minutes
    minSlides: 7,
    maxSlides: 10
  },

  CUSTOMER_PITCH: {
    name: 'Customer Pitch - 8 minutes',
    description: 'Narrative-focused pitch emphasizing problem/solution fit and customer benefits.',
    filters: {
      contentTypes: [ContentType.NARRATIVE]
    },
    targetDuration: 480, // 8 minutes
    minSlides: 6,
    maxSlides: 9
  },

  QUICK_DEMO: {
    name: 'Quick Demo - 2 minutes',
    description: 'Ultra-short elevator pitch. Hook slide only, focusing on immediate grab and ask.',
    filters: {
      primary: SlideCategoryPrimary.HOOK,
      importance: ContentImportance.CRITICAL
    },
    targetDuration: 120, // 2 minutes
    minSlides: 1,
    maxSlides: 3
  },

  FULL_NARRATIVE: {
    name: 'Full Narrative Deck - 45 minutes',
    description: 'Complete, unfiltered presentation with all details for deep exploration.',
    filters: {},
    targetDuration: 2700, // 45 minutes
    minSlides: 20,
    maxSlides: 999
  }
};

/**
 * ============================================================================
 * BATCH OPERATIONS
 * ============================================================================
 */

/**
 * BATCH: Get all variants and their performance scores
 * Useful for showing "recommended presentations" based on slides
 *
 * @example
 * const recommendations = evaluateAllVariants(slides);
 * // Shows which presentations would work best with current deck
 */
export function evaluateAllVariants(
  slides: SlideWithTaxonomy[]
): VariantPerformanceAnalysis[] {
  return Object.values(DECK_VARIANTS).map(variant => {
    const variantSlides = generateDeckVariant(slides, variant);
    return analyzeVariantPerformance(slides, variant, variantSlides);
  });
}

/**
 * BATCH: Recommend best variants for this deck
 * Returns variants with highest confidence scores
 *
 * @example
 * const bestVariants = recommendBestVariants(slides, 3);
 */
export function recommendBestVariants(
  slides: SlideWithTaxonomy[],
  limit: number = 5
): VariantPerformanceAnalysis[] {
  return evaluateAllVariants(slides)
    .sort((a, b) => b.confidenceScore - a.confidenceScore)
    .slice(0, limit);
}
