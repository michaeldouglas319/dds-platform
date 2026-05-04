/**
 * SLIDE CATEGORIZATION SYSTEM
 * 6-dimensional hierarchical taxonomy for organizing, filtering, and displaying slides
 */

// Dimension 1: Primary Slide Categories
export enum SlideCategoryPrimary {
  HOOK = 'hook',
  POSITIONING = 'positioning',
  FOUNDATION = 'foundation',
  SOLUTION = 'solution',
  VALIDATION = 'validation',
  CTA = 'call-to-action'
}

// Dimension 2: Secondary Slide Categories (23 specific types)
export enum SlideCategorySecondary {
  // Hook variants
  HOOK_NARRATIVE = 'hook-narrative',
  HOOK_QUESTION = 'hook-question',
  HOOK_STATISTIC = 'hook-statistic',
  HOOK_VISION = 'hook-vision',

  // Positioning variants
  POSITIONING_MOAT = 'positioning-moat',
  POSITIONING_DIFFERENTIATION = 'positioning-differentiation',
  POSITIONING_ADVANTAGE = 'positioning-advantage',
  POSITIONING_NARRATIVE = 'positioning-narrative',

  // Foundation variants
  FOUNDATION_PROBLEM = 'foundation-problem',
  FOUNDATION_MARKET_OPPORTUNITY = 'foundation-market-opportunity',
  FOUNDATION_REGULATORY = 'foundation-regulatory',
  FOUNDATION_TIMELINE = 'foundation-timeline',

  // Solution variants
  SOLUTION_OVERVIEW = 'solution-overview',
  SOLUTION_PILLARS = 'solution-pillars',
  SOLUTION_PILLAR_DETAIL = 'solution-pillar-detail',
  SOLUTION_ARCHITECTURE = 'solution-architecture',
  SOLUTION_TECH_STACK = 'solution-tech-stack',
  SOLUTION_ROADMAP = 'solution-roadmap',
  SOLUTION_PRODUCT_PORTFOLIO = 'solution-product-portfolio',

  // Validation variants
  VALIDATION_TRACTION = 'validation-traction',
  VALIDATION_DERISKING = 'validation-derisking',
  VALIDATION_MARKET_PROOF = 'validation-market-proof',
  VALIDATION_EXPERT = 'validation-expert',
  VALIDATION_FINANCIALS = 'validation-financials',

  // CTA variants
  CTA_TEAM = 'cta-team',
  CTA_ASK = 'cta-ask',
  CTA_EXPERTISE = 'cta-expertise',
  CTA_TIMELINE = 'cta-timeline'
}

// Dimension 3: Content Type Categories
export enum ContentType {
  NARRATIVE = 'narrative',
  DATA_METRICS = 'data-metrics',
  STRATEGIC = 'strategic',
  TECHNICAL = 'technical',
  PEOPLE = 'people',
  REGULATORY = 'regulatory'
}

// Dimension 4: Section Content Categories
export enum SectionCategory {
  HERO = 'hero',
  SUPPORTING = 'supporting',
  BENEFIT = 'benefit',
  FEATURE = 'feature',
  PROOF = 'proof',
  CALLOUT = 'callout',
  DEEP_DIVE = 'deep-dive'
}

// Dimension 5: Display Modes
export enum DisplayMode {
  HEADLINE_ONLY = 'headline-only',      // 30 sec - title + subtitle
  SUMMARY = 'summary',                  // 2-3 min - headlines + key points
  FULL = 'full',                        // 5+ min - complete content
  INTERACTIVE = 'interactive',          // exploratory - drilldown capability
  CUSTOM = 'custom'                     // audience-specific filtering
}

// Dimension 6: Investor Targeting
export enum InvestorLevel {
  ANGEL = 'angel',
  VC = 'vc',
  STRATEGIC = 'strategic',
  ALL = 'all'
}

// Confidence/Evidence levels
export enum ConfidenceLevel {
  PROVEN = 'proven',
  PROJECTED = 'projected',
  MARKET_VALIDATED = 'market-validated',
  INTERNAL_TARGET = 'internal-target'
}

// Content importance for prioritization
export enum ContentImportance {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  OPTIONAL = 'optional'
}

// Paragraph type classification
export enum ParagraphType {
  NARRATIVE = 'narrative',
  DATA = 'data',
  EVIDENCE = 'evidence',
  TECHNICAL = 'technical',
  STRATEGIC = 'strategic'
}

/**
 * COMPOSITE TYPE: Slide Categorization
 * Combines all 6 dimensions for complete slide classification
 */
export interface SlideTaxonomy {
  primary: SlideCategoryPrimary;
  secondary: SlideCategorySecondary;
  contentTypes: ContentType[];
  displayMode: DisplayMode;
  investorLevel: InvestorLevel;
  importance: ContentImportance;
  duration?: number; // seconds for this slide
  order?: number; // position in deck
}

/**
 * COMPOSITE TYPE: Paragraph with tagging
 */
export interface TaggedParagraph {
  subtitle: string;
  description: string;
  type?: ParagraphType;
  category?: SectionCategory;
  confidence?: ConfidenceLevel;
  keywords?: string[];
  citationCount?: number; // for analytics
}

/**
 * COMPOSITE TYPE: Highlight with role clarity
 */
export interface TaggedHighlight {
  subtitle: string;
  description: string;
  category?: SectionCategory;
  role?: string; // "shows competitive advantage", "proves market demand"
}

/**
 * COMPOSITE TYPE: Stat with confidence
 */
export interface TaggedStat {
  label: string;
  value: string;
  type?: 'market-size' | 'projection' | 'target' | 'competitive-advantage' | 'regulatory';
  confidence?: ConfidenceLevel;
  source?: string; // citation URL or company reference
}

/**
 * MAPPING: All valid secondary categories per primary
 */
export const SECONDARY_BY_PRIMARY: Record<SlideCategoryPrimary, SlideCategorySecondary[]> = {
  [SlideCategoryPrimary.HOOK]: [
    SlideCategorySecondary.HOOK_NARRATIVE,
    SlideCategorySecondary.HOOK_QUESTION,
    SlideCategorySecondary.HOOK_STATISTIC,
    SlideCategorySecondary.HOOK_VISION
  ],
  [SlideCategoryPrimary.POSITIONING]: [
    SlideCategorySecondary.POSITIONING_MOAT,
    SlideCategorySecondary.POSITIONING_DIFFERENTIATION,
    SlideCategorySecondary.POSITIONING_ADVANTAGE,
    SlideCategorySecondary.POSITIONING_NARRATIVE
  ],
  [SlideCategoryPrimary.FOUNDATION]: [
    SlideCategorySecondary.FOUNDATION_PROBLEM,
    SlideCategorySecondary.FOUNDATION_MARKET_OPPORTUNITY,
    SlideCategorySecondary.FOUNDATION_REGULATORY,
    SlideCategorySecondary.FOUNDATION_TIMELINE
  ],
  [SlideCategoryPrimary.SOLUTION]: [
    SlideCategorySecondary.SOLUTION_OVERVIEW,
    SlideCategorySecondary.SOLUTION_PILLARS,
    SlideCategorySecondary.SOLUTION_PILLAR_DETAIL,
    SlideCategorySecondary.SOLUTION_ARCHITECTURE,
    SlideCategorySecondary.SOLUTION_TECH_STACK,
    SlideCategorySecondary.SOLUTION_ROADMAP,
    SlideCategorySecondary.SOLUTION_PRODUCT_PORTFOLIO
  ],
  [SlideCategoryPrimary.VALIDATION]: [
    SlideCategorySecondary.VALIDATION_TRACTION,
    SlideCategorySecondary.VALIDATION_DERISKING,
    SlideCategorySecondary.VALIDATION_MARKET_PROOF,
    SlideCategorySecondary.VALIDATION_EXPERT,
    SlideCategorySecondary.VALIDATION_FINANCIALS
  ],
  [SlideCategoryPrimary.CTA]: [
    SlideCategorySecondary.CTA_TEAM,
    SlideCategorySecondary.CTA_ASK,
    SlideCategorySecondary.CTA_EXPERTISE,
    SlideCategorySecondary.CTA_TIMELINE
  ]
};

/**
 * MAPPING: Recommended display mode by investor level
 */
export const DISPLAY_MODE_BY_INVESTOR: Record<InvestorLevel, DisplayMode> = {
  [InvestorLevel.ANGEL]: DisplayMode.SUMMARY,      // Quick overview
  [InvestorLevel.VC]: DisplayMode.FULL,            // Deep dive
  [InvestorLevel.STRATEGIC]: DisplayMode.INTERACTIVE, // Explore details
  [InvestorLevel.ALL]: DisplayMode.FULL            // Default to full
};

/**
 * MAPPING: Visible section categories by display mode
 */
export const VISIBLE_SECTIONS_BY_MODE: Record<DisplayMode, SectionCategory[]> = {
  [DisplayMode.HEADLINE_ONLY]: [SectionCategory.HERO, SectionCategory.CALLOUT],
  [DisplayMode.SUMMARY]: [SectionCategory.HERO, SectionCategory.SUPPORTING, SectionCategory.CALLOUT, SectionCategory.PROOF],
  [DisplayMode.FULL]: [SectionCategory.HERO, SectionCategory.SUPPORTING, SectionCategory.BENEFIT, SectionCategory.FEATURE, SectionCategory.PROOF, SectionCategory.CALLOUT],
  [DisplayMode.INTERACTIVE]: Object.values(SectionCategory), // All sections available
  [DisplayMode.CUSTOM]: [] // Configured per use case
};

/**
 * VALIDATION HELPER: Check if secondary category is valid for primary
 */
export function isValidSecondary(primary: SlideCategoryPrimary, secondary: SlideCategorySecondary): boolean {
  return SECONDARY_BY_PRIMARY[primary]?.includes(secondary) ?? false;
}

/**
 * VALIDATION HELPER: Check if content types are valid for primary category
 */
export function isValidContentTypes(primary: SlideCategoryPrimary, contentTypes: ContentType[]): boolean {
  // Define what content types make sense for each primary category
  const validMap: Record<SlideCategoryPrimary, ContentType[]> = {
    [SlideCategoryPrimary.HOOK]: [ContentType.NARRATIVE, ContentType.STRATEGIC],
    [SlideCategoryPrimary.POSITIONING]: [ContentType.STRATEGIC, ContentType.DATA_METRICS, ContentType.TECHNICAL],
    [SlideCategoryPrimary.FOUNDATION]: [ContentType.DATA_METRICS, ContentType.REGULATORY, ContentType.STRATEGIC],
    [SlideCategoryPrimary.SOLUTION]: [ContentType.TECHNICAL, ContentType.STRATEGIC, ContentType.DATA_METRICS],
    [SlideCategoryPrimary.VALIDATION]: [ContentType.DATA_METRICS, ContentType.PEOPLE, ContentType.TECHNICAL],
    [SlideCategoryPrimary.CTA]: [ContentType.PEOPLE, ContentType.STRATEGIC]
  };

  return contentTypes.every(ct => validMap[primary]?.includes(ct) ?? false);
}

/**
 * UTILITY: Get visible sections for a display mode
 */
export function getVisibleSections(displayMode: DisplayMode): SectionCategory[] {
  return VISIBLE_SECTIONS_BY_MODE[displayMode] ?? VISIBLE_SECTIONS_BY_MODE[DisplayMode.FULL];
}

/**
 * UTILITY: Recommended duration (in seconds) by display mode
 */
export function getRecommendedDuration(displayMode: DisplayMode): number {
  const durations: Record<DisplayMode, number> = {
    [DisplayMode.HEADLINE_ONLY]: 30,
    [DisplayMode.SUMMARY]: 180,
    [DisplayMode.FULL]: 300,
    [DisplayMode.INTERACTIVE]: 600,
    [DisplayMode.CUSTOM]: 0
  };
  return durations[displayMode] ?? 300;
}
