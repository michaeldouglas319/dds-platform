/**
 * PITCH DECK SLIDE TAXONOMY
 * ===========================
 * Hierarchical Category System for Scalable Slide Classification & Filtering
 *
 * Hierarchies:
 * 1. Primary Slide Categories (HERO, POSITIONING, FOUNDATION, SOLUTION, VALIDATION, CTA)
 * 2. Secondary Slide Categories (specific slide types within primaries)
 * 3. Content Type Categories (how content is structured: narrative, data, technical, etc)
 * 4. Section Content Categories (granular sections within a slide)
 * 5. Display Modes (headline-only, summary, full, interactive, custom)
 * 6. Investor Targeting (angel, vc, strategic, all)
 *
 * This taxonomy enables:
 * - Audience-specific filtering (show VCs the financials, angels the problem/solution)
 * - Display mode selection (quick overview vs. detailed deep-dive)
 * - Content type matching (narrative slides for emotional resonance, data for proof)
 * - Extensibility (easy to add new categories without breaking existing code)
 *
 * Design Principles:
 * - Each enum is additive (new values don't break existing configurations)
 * - Secondary categories only apply to their parent primary category
 * - Multiple dimensions can be combined for fine-grained control
 * - Default values support backward compatibility with existing slides
 */

/**
 * PRIMARY SLIDE CATEGORIES
 * ========================
 * Top-level organizational structure of a pitch deck
 * Maps to the narrative arc and investor psychology
 */
export enum SlideCategoryPrimary {
  /** Attention-grabbing opening slides that establish emotional connection */
  HOOK = 'hook',

  /** Why your solution matters - competitive advantage and differentiation */
  POSITIONING = 'positioning',

  /** Problem statement and market context - the "why now" */
  FOUNDATION = 'foundation',

  /** Solution architecture, technical capabilities, and implementation */
  SOLUTION = 'solution',

  /** Traction, de-risking, and proof of concept */
  VALIDATION = 'validation',

  /** Call-to-action: team, funding ask, next steps */
  CTA = 'cta'
}

/**
 * SECONDARY SLIDE CATEGORIES
 * ===========================
 * Specific slide types within each primary category
 * Enables fine-grained content matching and display logic
 *
 * Pattern: Values use kebab-case for consistency
 * Grouped by parent primary category for clarity
 */
export enum SlideCategorySecondary {
  // HOOK primary category (attention & narrative)
  HOOK_NARRATIVE = 'hook-narrative',          // Story-driven opening
  HOOK_QUESTION = 'hook-question',            // Question that frames the problem
  HOOK_STATISTIC = 'hook-statistic',          // Shocking market data
  HOOK_VISION = 'hook-vision',                // Future state aspiration

  // POSITIONING primary category (competitive advantage)
  POSITIONING_COMPETITIVE_MOAT = 'positioning-competitive-moat',        // Why hard to copy
  POSITIONING_DIFFERENTIATION = 'positioning-differentiation',          // How we're different
  POSITIONING_ADVANTAGE = 'positioning-advantage',                      // Specific advantages
  POSITIONING_NARRATIVE = 'positioning-narrative',                      // Story of differentiation

  // FOUNDATION primary category (problem & market)
  FOUNDATION_PROBLEM = 'foundation-problem',                            // Problem statement
  FOUNDATION_MARKET_OPPORTUNITY = 'foundation-market-opportunity',      // Market size & growth
  FOUNDATION_REGULATORY = 'foundation-regulatory',                      // Regulatory drivers
  FOUNDATION_TIMELINE = 'foundation-timeline',                          // Window of opportunity

  // SOLUTION primary category (technical & capability)
  SOLUTION_OVERVIEW = 'solution-overview',                              // High-level approach
  SOLUTION_ARCHITECTURE = 'solution-architecture',                      // Technical design
  SOLUTION_PILLARS = 'solution-pillars',                                // Core components/phases
  SOLUTION_PILLAR_DETAIL = 'solution-pillar-detail',                    // Deep-dive on pillar
  SOLUTION_TECH_STACK = 'solution-tech-stack',                          // Technologies used
  SOLUTION_ROADMAP = 'solution-roadmap',                                // Implementation timeline
  SOLUTION_PRODUCT_PORTFOLIO = 'solution-product-portfolio',            // Product lineup

  // VALIDATION primary category (proof & traction)
  VALIDATION_TRACTION = 'validation-traction',                          // Revenue, users, metrics
  VALIDATION_DERISKING = 'validation-derisking',                        // Risk mitigation
  VALIDATION_MARKET_PROOF = 'validation-market-proof',                  // Customer proof points
  VALIDATION_EXPERT_VALIDATION = 'validation-expert-validation',        // Third-party validation
  VALIDATION_FINANCIALS = 'validation-financials',                      // Revenue projections

  // CTA primary category (closing)
  CTA_TEAM = 'cta-team',                      // Founder & team intro
  CTA_ASK = 'cta-ask',                        // Funding ask (amount, use of funds)
  CTA_EXPERTISE = 'cta-expertise',            // Expertise requirements
  CTA_TIMELINE = 'cta-timeline',              // Funding timeline & milestones
  CTA_INVESTOR_PROFILE = 'cta-investor-profile'  // Ideal investor description
}

/**
 * CONTENT TYPE CATEGORIES
 * =======================
 * How content is structured and what psychological levers it pulls
 * Orthogonal to slide category - a slide can be multiple types
 */
export enum ContentType {
  /** Story-driven, emotional, narrative-focused (builds connection) */
  NARRATIVE = 'narrative',

  /** Numbers, charts, quantitative proof (builds credibility) */
  DATA_METRICS = 'data-metrics',

  /** Why/how/differentiation (builds understanding) */
  STRATEGIC = 'strategic',

  /** Architecture, implementation, tech stack (builds confidence) */
  TECHNICAL = 'technical',

  /** Team bios, expertise, credentials (builds trust) */
  PEOPLE = 'people',

  /** Regulatory context, compliance, certifications (builds legitimacy) */
  REGULATORY = 'regulatory'
}

/**
 * SECTION CONTENT CATEGORIES
 * ==========================
 * Granular categorization of content sections WITHIN a single slide
 * Enables partial rendering and progressive disclosure
 *
 * Use case: Show only "Hero" + "Supporting" in headline-only mode,
 * but include "Deep-Dive" in full mode
 */
export enum SectionCategory {
  /** Main hook or thesis of the slide (always visible) */
  HERO = 'hero',

  /** Supporting evidence, elaboration, examples (usually visible) */
  SUPPORTING = 'supporting',

  /** Optional technical detail, deep-dive content (advanced/full mode only) */
  DEEP_DIVE = 'deep-dive',

  /** Key takeaway, memorable line, quotable insight (always visible) */
  CALLOUT = 'callout',

  /** Data point, metric, evidence, validation (proof mode) */
  PROOF = 'proof',

  /** Risk acknowledgment, limitation, contingency (transparency mode) */
  CAVEAT = 'caveat'
}

/**
 * DISPLAY MODES
 * ==============
 * How a slide is rendered to the audience
 * Determines content visibility and interactivity level
 */
export enum DisplayMode {
  /** Title + subtitle only (for quick 30-second scan) */
  HEADLINE_ONLY = 'headline-only',

  /** Headline + key points (executive summary, 2-3 minutes) */
  SUMMARY = 'summary',

  /** Complete content (full presentation, 5+ minutes per slide) */
  FULL = 'full',

  /** Expandable sections, drilldown paths (exploration mode) */
  INTERACTIVE = 'interactive',

  /** Filtered by audience profile (angel/vc/strategic) */
  CUSTOM = 'custom'
}

/**
 * INVESTOR TARGETING
 * ==================
 * Audience-specific content filtering
 * Existing in current system, formalized here
 */
export enum InvestorLevel {
  /** Angel investors: focus on founder, problem, vision */
  ANGEL = 'angel',

  /** Venture capitalists: focus on market, traction, financials */
  VC = 'vc',

  /** Strategic partners: focus on tech, integration, moat */
  STRATEGIC = 'strategic',

  /** All audiences (universal content) */
  ALL = 'all'
}

/**
 * CONTENT IMPORTANCE
 * ==================
 * Severity/priority of slide for specific investor types
 * Enables smart filtering and reordering
 */
export enum ContentImportance {
  /** Must-see: deck breaks without this slide */
  CRITICAL = 'critical',

  /** Should see: expected in professional pitch */
  HIGH = 'high',

  /** Nice-to-have: adds context but not essential */
  MEDIUM = 'medium',

  /** Optional: include only if time permits */
  OPTIONAL = 'optional'
}

/**
 * NARRATIVE FUNCTION
 * ===================
 * What role does this slide play in the overall narrative?
 * Helps with flow analysis and slide ordering
 */
export enum NarrativeFunction {
  /** Grabs attention, establishes stakes */
  HOOK = 'hook',

  /** Establishes context, builds empathy */
  CONTEXT_SETTING = 'context-setting',

  /** Presents the solution */
  RESOLUTION = 'resolution',

  /** Provides evidence the solution works */
  PROOF_POINT = 'proof-point',

  /** Projections and future vision */
  VISION_CASTING = 'vision-casting',

  /** Final ask and next steps */
  CALL_TO_ACTION = 'call-to-action'
}

/**
 * VISUALIZATION PREFERENCE
 * ========================
 * What type of visual treatment does this slide prefer?
 * Guides design system selection and 3D model usage
 */
export enum VisualizationPreference {
  /** Text-heavy, minimal graphics (narrative slides) */
  TEXT_FOCUSED = 'text-focused',

  /** Charts, graphs, data visualization */
  DATA_VISUALIZATION = 'data-visualization',

  /** 3D models, architectural diagrams, technical visuals */
  TECHNICAL_VISUAL = 'technical-visual',

  /** Photos, lifestyle, brand imagery */
  LIFESTYLE_IMAGERY = 'lifestyle-imagery',

  /** Mixed media, interactive elements */
  INTERACTIVE_MEDIA = 'interactive-media',

  /** Minimalist, typography-focused */
  MINIMALIST = 'minimalist'
}

// ============================================================================
// COMPOSITE TYPES & HELPERS
// ============================================================================

/**
 * Complete Slide Taxonomy Configuration
 * Used to fully classify a slide across all dimensions
 *
 * @example
 * const slideConfig: SlideTaxonomy = {
 *   primary: SlideCategoryPrimary.POSITIONING,
 *   secondary: SlideCategorySecondary.POSITIONING_COMPETITIVE_MOAT,
 *   contentTypes: [ContentType.NARRATIVE, ContentType.DATA_METRICS],
 *   sectionCategories: [SectionCategory.HERO, SectionCategory.SUPPORTING],
 *   displayMode: DisplayMode.FULL,
 *   investorLevel: InvestorLevel.VC,
 *   importance: ContentImportance.CRITICAL,
 *   narrativeFunction: NarrativeFunction.PROOF_POINT,
 *   visualizationPreference: VisualizationPreference.DATA_VISUALIZATION
 * };
 */
export interface SlideTaxonomy {
  /** Primary slide category (required) */
  primary: SlideCategoryPrimary;

  /** Secondary slide category (should match primary) */
  secondary?: SlideCategorySecondary;

  /** Multiple content type tags */
  contentTypes?: ContentType[];

  /** Sections within this slide */
  sectionCategories?: SectionCategory[];

  /** How this slide should be displayed */
  displayMode?: DisplayMode;

  /** Audience filtering */
  investorLevel?: InvestorLevel;

  /** Importance for this investor type */
  importance?: ContentImportance;

  /** Role in overall narrative */
  narrativeFunction?: NarrativeFunction;

  /** Visual treatment preference */
  visualizationPreference?: VisualizationPreference;
}

/**
 * Slide Taxonomy Metadata
 * Provides defaults and validation rules
 */
export interface SlideTaxonomyMetadata {
  primary: SlideCategoryPrimary;
  primary_display: string;
  primary_description: string;

  secondary?: SlideCategorySecondary;
  secondary_display?: string;

  typical_content_types: ContentType[];
  typical_visualization: VisualizationPreference;
  typical_importance_by_investor: Record<InvestorLevel, ContentImportance>;

  duration_seconds: number;  // Typical presentation time
  order_in_deck: number;     // Recommended position
}

// ============================================================================
// MAPPING TABLE: PRIMARY → SECONDARY CATEGORIES
// ============================================================================

/**
 * Validates that a secondary category belongs to the given primary category
 * Prevents invalid category combinations (e.g., HOOK_NARRATIVE under SOLUTION)
 */
export const PRIMARY_TO_SECONDARY_MAP: Record<SlideCategoryPrimary, SlideCategorySecondary[]> = {
  [SlideCategoryPrimary.HOOK]: [
    SlideCategorySecondary.HOOK_NARRATIVE,
    SlideCategorySecondary.HOOK_QUESTION,
    SlideCategorySecondary.HOOK_STATISTIC,
    SlideCategorySecondary.HOOK_VISION
  ],

  [SlideCategoryPrimary.POSITIONING]: [
    SlideCategorySecondary.POSITIONING_COMPETITIVE_MOAT,
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
    SlideCategorySecondary.SOLUTION_ARCHITECTURE,
    SlideCategorySecondary.SOLUTION_PILLARS,
    SlideCategorySecondary.SOLUTION_PILLAR_DETAIL,
    SlideCategorySecondary.SOLUTION_TECH_STACK,
    SlideCategorySecondary.SOLUTION_ROADMAP,
    SlideCategorySecondary.SOLUTION_PRODUCT_PORTFOLIO
  ],

  [SlideCategoryPrimary.VALIDATION]: [
    SlideCategorySecondary.VALIDATION_TRACTION,
    SlideCategorySecondary.VALIDATION_DERISKING,
    SlideCategorySecondary.VALIDATION_MARKET_PROOF,
    SlideCategorySecondary.VALIDATION_EXPERT_VALIDATION,
    SlideCategorySecondary.VALIDATION_FINANCIALS
  ],

  [SlideCategoryPrimary.CTA]: [
    SlideCategorySecondary.CTA_TEAM,
    SlideCategorySecondary.CTA_ASK,
    SlideCategorySecondary.CTA_EXPERTISE,
    SlideCategorySecondary.CTA_TIMELINE,
    SlideCategorySecondary.CTA_INVESTOR_PROFILE
  ]
};

/**
 * Helper function: Validate secondary category belongs to primary
 */
export function isValidSecondaryCategory(
  primary: SlideCategoryPrimary,
  secondary: SlideCategorySecondary
): boolean {
  const allowedSecondaries = PRIMARY_TO_SECONDARY_MAP[primary] || [];
  return allowedSecondaries.includes(secondary);
}

// ============================================================================
// MAPPING TABLE: CONTENT TYPE RECOMMENDATIONS
// ============================================================================

/**
 * Recommended content types for each primary slide category
 * Guides content creation and slide design
 */
export const PRIMARY_TO_CONTENT_TYPES: Record<SlideCategoryPrimary, ContentType[]> = {
  [SlideCategoryPrimary.HOOK]: [
    ContentType.NARRATIVE,
    ContentType.DATA_METRICS  // Statistics to grab attention
  ],

  [SlideCategoryPrimary.POSITIONING]: [
    ContentType.NARRATIVE,
    ContentType.STRATEGIC
  ],

  [SlideCategoryPrimary.FOUNDATION]: [
    ContentType.DATA_METRICS,
    ContentType.REGULATORY,
    ContentType.STRATEGIC
  ],

  [SlideCategoryPrimary.SOLUTION]: [
    ContentType.TECHNICAL,
    ContentType.STRATEGIC,
    ContentType.DATA_METRICS  // Performance metrics
  ],

  [SlideCategoryPrimary.VALIDATION]: [
    ContentType.DATA_METRICS,
    ContentType.PEOPLE,      // Customer testimonials
    ContentType.REGULATORY   // Compliance achievements
  ],

  [SlideCategoryPrimary.CTA]: [
    ContentType.PEOPLE,
    ContentType.STRATEGIC,
    ContentType.DATA_METRICS  // Financial projections
  ]
};

/**
 * Helper function: Get recommended content types for a primary category
 */
export function getRecommendedContentTypes(primary: SlideCategoryPrimary): ContentType[] {
  return PRIMARY_TO_CONTENT_TYPES[primary] || [];
}

// ============================================================================
// MAPPING TABLE: DISPLAY MODE FILTERING
// ============================================================================

/**
 * Determines which section categories are visible in each display mode
 * Used for progressive disclosure: headline-only shows less, full shows everything
 */
export const DISPLAY_MODE_TO_SECTIONS: Record<DisplayMode, SectionCategory[]> = {
  [DisplayMode.HEADLINE_ONLY]: [
    SectionCategory.HERO,
    SectionCategory.CALLOUT
  ],

  [DisplayMode.SUMMARY]: [
    SectionCategory.HERO,
    SectionCategory.SUPPORTING,
    SectionCategory.CALLOUT,
    SectionCategory.PROOF
  ],

  [DisplayMode.FULL]: [
    SectionCategory.HERO,
    SectionCategory.SUPPORTING,
    SectionCategory.DEEP_DIVE,
    SectionCategory.CALLOUT,
    SectionCategory.PROOF
  ],

  [DisplayMode.INTERACTIVE]: [
    SectionCategory.HERO,
    SectionCategory.SUPPORTING,
    SectionCategory.DEEP_DIVE,
    SectionCategory.CALLOUT,
    SectionCategory.PROOF
    // Special: user can expand/collapse sections
  ],

  [DisplayMode.CUSTOM]: [
    // Determined by investor-specific filtering logic
    SectionCategory.HERO,
    SectionCategory.CALLOUT,
    SectionCategory.PROOF
  ]
};

/**
 * Helper function: Get visible section categories for a display mode
 */
export function getVisibleSections(displayMode: DisplayMode): SectionCategory[] {
  return DISPLAY_MODE_TO_SECTIONS[displayMode] || [];
}

// ============================================================================
// MAPPING TABLE: INVESTOR FILTERING
// ============================================================================

/**
 * Determines which slide categories are important for each investor type
 * Enables audience-specific deck reordering and filtering
 */
export const INVESTOR_PRIORITY_MATRIX: Record<
  InvestorLevel,
  Record<SlideCategoryPrimary, ContentImportance>
> = {
  [InvestorLevel.ANGEL]: {
    [SlideCategoryPrimary.HOOK]: ContentImportance.CRITICAL,
    [SlideCategoryPrimary.POSITIONING]: ContentImportance.HIGH,
    [SlideCategoryPrimary.FOUNDATION]: ContentImportance.CRITICAL,
    [SlideCategoryPrimary.SOLUTION]: ContentImportance.MEDIUM,
    [SlideCategoryPrimary.VALIDATION]: ContentImportance.MEDIUM,
    [SlideCategoryPrimary.CTA]: ContentImportance.CRITICAL
  },

  [InvestorLevel.VC]: {
    [SlideCategoryPrimary.HOOK]: ContentImportance.HIGH,
    [SlideCategoryPrimary.POSITIONING]: ContentImportance.CRITICAL,
    [SlideCategoryPrimary.FOUNDATION]: ContentImportance.CRITICAL,
    [SlideCategoryPrimary.SOLUTION]: ContentImportance.HIGH,
    [SlideCategoryPrimary.VALIDATION]: ContentImportance.CRITICAL,
    [SlideCategoryPrimary.CTA]: ContentImportance.CRITICAL
  },

  [InvestorLevel.STRATEGIC]: {
    [SlideCategoryPrimary.HOOK]: ContentImportance.MEDIUM,
    [SlideCategoryPrimary.POSITIONING]: ContentImportance.CRITICAL,
    [SlideCategoryPrimary.FOUNDATION]: ContentImportance.HIGH,
    [SlideCategoryPrimary.SOLUTION]: ContentImportance.CRITICAL,
    [SlideCategoryPrimary.VALIDATION]: ContentImportance.HIGH,
    [SlideCategoryPrimary.CTA]: ContentImportance.MEDIUM
  },

  [InvestorLevel.ALL]: {
    [SlideCategoryPrimary.HOOK]: ContentImportance.HIGH,
    [SlideCategoryPrimary.POSITIONING]: ContentImportance.HIGH,
    [SlideCategoryPrimary.FOUNDATION]: ContentImportance.HIGH,
    [SlideCategoryPrimary.SOLUTION]: ContentImportance.HIGH,
    [SlideCategoryPrimary.VALIDATION]: ContentImportance.HIGH,
    [SlideCategoryPrimary.CTA]: ContentImportance.HIGH
  }
};

/**
 * Helper function: Determine importance of a slide for an investor type
 */
export function getImportanceForInvestor(
  primary: SlideCategoryPrimary,
  investorLevel: InvestorLevel
): ContentImportance {
  return INVESTOR_PRIORITY_MATRIX[investorLevel]?.[primary] || ContentImportance.MEDIUM;
}

// ============================================================================
// COMPREHENSIVE METADATA LIBRARY
// ============================================================================

/**
 * Complete metadata for every primary slide category
 * Used for guidance, validation, and smart filtering
 */
export const SLIDE_CATEGORY_METADATA: Record<SlideCategoryPrimary, SlideTaxonomyMetadata> = {
  [SlideCategoryPrimary.HOOK]: {
    primary: SlideCategoryPrimary.HOOK,
    primary_display: 'Hook / Opening',
    primary_description: 'Attention-grabbing, emotional, narrative-driven opening slides',

    typical_content_types: [ContentType.NARRATIVE, ContentType.DATA_METRICS],
    typical_visualization: VisualizationPreference.LIFESTYLE_IMAGERY,

    typical_importance_by_investor: {
      [InvestorLevel.ANGEL]: ContentImportance.CRITICAL,
      [InvestorLevel.VC]: ContentImportance.HIGH,
      [InvestorLevel.STRATEGIC]: ContentImportance.MEDIUM,
      [InvestorLevel.ALL]: ContentImportance.HIGH
    },

    duration_seconds: 30,
    order_in_deck: 1
  },

  [SlideCategoryPrimary.POSITIONING]: {
    primary: SlideCategoryPrimary.POSITIONING,
    primary_display: 'Positioning / Competitive Advantage',
    primary_description: 'Why your solution matters - competitive advantage and differentiators',

    typical_content_types: [ContentType.NARRATIVE, ContentType.STRATEGIC, ContentType.DATA_METRICS],
    typical_visualization: VisualizationPreference.DATA_VISUALIZATION,

    typical_importance_by_investor: {
      [InvestorLevel.ANGEL]: ContentImportance.HIGH,
      [InvestorLevel.VC]: ContentImportance.CRITICAL,
      [InvestorLevel.STRATEGIC]: ContentImportance.CRITICAL,
      [InvestorLevel.ALL]: ContentImportance.HIGH
    },

    duration_seconds: 120,
    order_in_deck: 2
  },

  [SlideCategoryPrimary.FOUNDATION]: {
    primary: SlideCategoryPrimary.FOUNDATION,
    primary_display: 'Foundation / Problem & Market',
    primary_description: 'Problem statement, market opportunity, and regulatory context',

    typical_content_types: [ContentType.DATA_METRICS, ContentType.REGULATORY, ContentType.STRATEGIC],
    typical_visualization: VisualizationPreference.DATA_VISUALIZATION,

    typical_importance_by_investor: {
      [InvestorLevel.ANGEL]: ContentImportance.CRITICAL,
      [InvestorLevel.VC]: ContentImportance.CRITICAL,
      [InvestorLevel.STRATEGIC]: ContentImportance.HIGH,
      [InvestorLevel.ALL]: ContentImportance.HIGH
    },

    duration_seconds: 180,
    order_in_deck: 3
  },

  [SlideCategoryPrimary.SOLUTION]: {
    primary: SlideCategoryPrimary.SOLUTION,
    primary_display: 'Solution / Technical & Capability',
    primary_description: 'Solution architecture, technical capabilities, pillars, and roadmap',

    typical_content_types: [ContentType.TECHNICAL, ContentType.STRATEGIC, ContentType.DATA_METRICS],
    typical_visualization: VisualizationPreference.TECHNICAL_VISUAL,

    typical_importance_by_investor: {
      [InvestorLevel.ANGEL]: ContentImportance.MEDIUM,
      [InvestorLevel.VC]: ContentImportance.HIGH,
      [InvestorLevel.STRATEGIC]: ContentImportance.CRITICAL,
      [InvestorLevel.ALL]: ContentImportance.HIGH
    },

    duration_seconds: 240,
    order_in_deck: 4
  },

  [SlideCategoryPrimary.VALIDATION]: {
    primary: SlideCategoryPrimary.VALIDATION,
    primary_display: 'Validation / Traction & Proof',
    primary_description: 'Traction, de-risking, customer proof, and financial projections',

    typical_content_types: [ContentType.DATA_METRICS, ContentType.PEOPLE, ContentType.REGULATORY],
    typical_visualization: VisualizationPreference.DATA_VISUALIZATION,

    typical_importance_by_investor: {
      [InvestorLevel.ANGEL]: ContentImportance.MEDIUM,
      [InvestorLevel.VC]: ContentImportance.CRITICAL,
      [InvestorLevel.STRATEGIC]: ContentImportance.HIGH,
      [InvestorLevel.ALL]: ContentImportance.HIGH
    },

    duration_seconds: 180,
    order_in_deck: 5
  },

  [SlideCategoryPrimary.CTA]: {
    primary: SlideCategoryPrimary.CTA,
    primary_display: 'Call-to-Action / Closing',
    primary_description: 'Team, funding ask, expertise requirements, and next steps',

    typical_content_types: [ContentType.PEOPLE, ContentType.STRATEGIC, ContentType.DATA_METRICS],
    typical_visualization: VisualizationPreference.MINIMALIST,

    typical_importance_by_investor: {
      [InvestorLevel.ANGEL]: ContentImportance.CRITICAL,
      [InvestorLevel.VC]: ContentImportance.CRITICAL,
      [InvestorLevel.STRATEGIC]: ContentImportance.MEDIUM,
      [InvestorLevel.ALL]: ContentImportance.HIGH
    },

    duration_seconds: 120,
    order_in_deck: 6
  }
};

/**
 * Helper function: Get metadata for a primary category
 */
export function getCategoryMetadata(primary: SlideCategoryPrimary): SlideTaxonomyMetadata {
  return SLIDE_CATEGORY_METADATA[primary] || SLIDE_CATEGORY_METADATA[SlideCategoryPrimary.HOOK];
}
