/**
 * Category Taxonomy System - 5 Complete Working Examples
 * ========================================================
 * Practical implementations showing real-world usage patterns
 *
 * Location: /lib/config/taxonomy/examples.ts
 * Status: Production-ready examples
 */

import {
  SlideCategoryPrimary,
  SlideCategorySecondary,
  ContentType,
  DisplayMode,
  InvestorLevel,
  ContentImportance,
  SectionCategory,
  NarrativeFunction,
  VisualizationPreference,
  type SlideTaxonomy
} from './slide-taxonomy';

import {
  filterByInvestorLevel,
  filterByContentType,
  filterByImportance,
  filterByMultiple,
  generateInvestorDeck,
  analyzeDistributionByPrimary,
  analyzeDistributionByContentType,
  analyzeDistributionByImportance,
  calculateTotalDuration,
  validateDeckCompleteness,
  findContentGaps,
  sortByImportance,
  sortByOrder,
  generateDeckVariant,
  DECK_VARIANTS,
  type SlideWithTaxonomy
} from './slide-filters';

// ============================================================================
// EXAMPLE 1: Filter by Investor Level (Angel, VC, Strategic)
// ============================================================================

/**
 * Realistic scenario: You have 14 slides total, but different investors
 * should see different subsets tailored to their interests.
 */
export function example1_filterByInvestorLevel() {
  // Mock slide data - in reality this comes from your database
  const mockSlides: SlideWithTaxonomy[] = [
    {
      id: 'pitch-cover',
      title: 'AI-Orchestrated Sovereign Drone Manufacturing',
      taxonomy: {
        primary: SlideCategoryPrimary.HOOK,
        secondary: SlideCategorySecondary.HOOK_VISION,
        contentTypes: [ContentType.NARRATIVE, ContentType.STRATEGIC],
        displayMode: DisplayMode.HEADLINE_ONLY,
        investorLevel: InvestorLevel.ALL,
        importance: ContentImportance.CRITICAL,
        narrativeFunction: NarrativeFunction.HOOK,
        visualizationPreference: VisualizationPreference.LIFESTYLE_IMAGERY
      }
    },
    {
      id: 'positioning-moat',
      title: 'Why Our Approach Is Defensible',
      taxonomy: {
        primary: SlideCategoryPrimary.POSITIONING,
        secondary: SlideCategorySecondary.POSITIONING_COMPETITIVE_MOAT,
        contentTypes: [ContentType.STRATEGIC, ContentType.TECHNICAL],
        displayMode: DisplayMode.FULL,
        investorLevel: InvestorLevel.ALL,
        importance: ContentImportance.CRITICAL,
        narrativeFunction: NarrativeFunction.CONTEXT_SETTING,
        visualizationPreference: VisualizationPreference.TECHNICAL_VISUAL
      }
    },
    {
      id: 'market-size',
      title: 'Market Opportunity: $50B TAM',
      taxonomy: {
        primary: SlideCategoryPrimary.FOUNDATION,
        secondary: SlideCategorySecondary.FOUNDATION_MARKET_OPPORTUNITY,
        contentTypes: [ContentType.DATA_METRICS, ContentType.STRATEGIC],
        displayMode: DisplayMode.FULL,
        investorLevel: InvestorLevel.VC,  // VCs care most about this
        importance: ContentImportance.CRITICAL,
        narrativeFunction: NarrativeFunction.CONTEXT_SETTING,
        visualizationPreference: VisualizationPreference.DATA_VISUALIZATION
      }
    },
    {
      id: 'tech-architecture',
      title: 'Autonomous Control System Architecture',
      taxonomy: {
        primary: SlideCategoryPrimary.SOLUTION,
        secondary: SlideCategorySecondary.SOLUTION_ARCHITECTURE,
        contentTypes: [ContentType.TECHNICAL],
        displayMode: DisplayMode.FULL,
        investorLevel: InvestorLevel.STRATEGIC,  // Strategic partners care most
        importance: ContentImportance.HIGH,
        narrativeFunction: NarrativeFunction.RESOLUTION,
        visualizationPreference: VisualizationPreference.TECHNICAL_VISUAL
      }
    },
    {
      id: 'traction-metrics',
      title: 'Traction: 500 Pre-orders, $2M Revenue',
      taxonomy: {
        primary: SlideCategoryPrimary.VALIDATION,
        secondary: SlideCategorySecondary.VALIDATION_TRACTION,
        contentTypes: [ContentType.DATA_METRICS],
        displayMode: DisplayMode.FULL,
        investorLevel: InvestorLevel.VC,  // VCs need proof
        importance: ContentImportance.CRITICAL,
        narrativeFunction: NarrativeFunction.PROOF_POINT,
        visualizationPreference: VisualizationPreference.DATA_VISUALIZATION
      }
    },
    {
      id: 'team',
      title: 'Founding Team',
      taxonomy: {
        primary: SlideCategoryPrimary.CTA,
        secondary: SlideCategorySecondary.CTA_TEAM,
        contentTypes: [ContentType.PEOPLE],
        displayMode: DisplayMode.SUMMARY,
        investorLevel: InvestorLevel.ANGEL,  // Angels invest in founders
        importance: ContentImportance.CRITICAL,
        narrativeFunction: NarrativeFunction.CONTEXT_SETTING,
        visualizationPreference: VisualizationPreference.LIFESTYLE_IMAGERY
      }
    }
  ];

  console.log('\n=== EXAMPLE 1: Filter by Investor Level ===\n');

  // Angel investors: See founder-focused, vision-oriented content
  const angelSlides = filterByInvestorLevel(mockSlides, InvestorLevel.ANGEL);
  console.log('ANGEL DECK:');
  console.log(`  Total slides: ${angelSlides.length}`);
  console.log('  Includes:');
  angelSlides.forEach(s => {
    console.log(`    - ${s.title} (${s.taxonomy.primary})`);
  });

  // VC investors: See market, traction, and competitive data
  const vcSlides = filterByInvestorLevel(mockSlides, InvestorLevel.VC);
  console.log('\nVC DECK:');
  console.log(`  Total slides: ${vcSlides.length}`);
  console.log('  Includes:');
  vcSlides.forEach(s => {
    console.log(`    - ${s.title} (${s.taxonomy.primary})`);
  });

  // Strategic partners: See technical deep-dives
  const strategicSlides = filterByInvestorLevel(mockSlides, InvestorLevel.STRATEGIC);
  console.log('\nSTRATEGIC DECK:');
  console.log(`  Total slides: ${strategicSlides.length}`);
  console.log('  Includes:');
  strategicSlides.forEach(s => {
    console.log(`    - ${s.title} (${s.taxonomy.primary})`);
  });

  return { angelSlides, vcSlides, strategicSlides };
}

// ============================================================================
// EXAMPLE 2: Generate Investor-Specific Deck
// ============================================================================

/**
 * More sophisticated: Not just filter, but also reorder by importance
 * and apply display mode modifications.
 */
export function example2_generateInvestorSpecificDeck() {
  const mockSlides: SlideWithTaxonomy[] = [
    {
      id: 'slide-1',
      title: 'Founder Story',
      taxonomy: {
        primary: SlideCategoryPrimary.HOOK,
        contentTypes: [ContentType.NARRATIVE],
        displayMode: DisplayMode.FULL,
        investorLevel: InvestorLevel.ANGEL,
        importance: ContentImportance.CRITICAL
      }
    },
    {
      id: 'slide-2',
      title: 'Market Size',
      taxonomy: {
        primary: SlideCategoryPrimary.FOUNDATION,
        contentTypes: [ContentType.DATA_METRICS],
        displayMode: DisplayMode.FULL,
        investorLevel: InvestorLevel.VC,
        importance: ContentImportance.CRITICAL
      }
    },
    {
      id: 'slide-3',
      title: 'Revenue Projections',
      taxonomy: {
        primary: SlideCategoryPrimary.VALIDATION,
        contentTypes: [ContentType.DATA_METRICS],
        displayMode: DisplayMode.FULL,
        investorLevel: InvestorLevel.VC,
        importance: ContentImportance.HIGH
      }
    },
    {
      id: 'slide-4',
      title: 'Ask & Use of Funds',
      taxonomy: {
        primary: SlideCategoryPrimary.CTA,
        contentTypes: [ContentType.STRATEGIC],
        displayMode: DisplayMode.SUMMARY,
        investorLevel: InvestorLevel.ALL,
        importance: ContentImportance.CRITICAL
      }
    }
  ];

  console.log('\n=== EXAMPLE 2: Generate Investor-Specific Deck ===\n');

  // Generate a VC-optimized presentation
  // This filters for VC relevance AND reorders by importance
  const vcDeck = generateInvestorDeck(mockSlides, InvestorLevel.VC);

  console.log('VC-OPTIMIZED DECK (reordered by importance):');
  vcDeck.forEach((slide, idx) => {
    console.log(`  ${idx + 1}. ${slide.title}`);
    console.log(`     Category: ${slide.taxonomy.primary}`);
    console.log(`     Importance: ${slide.taxonomy.importance}`);
    console.log(`     Content: ${slide.taxonomy.contentTypes?.join(', ')}`);
  });

  console.log(`\nTotal: ${vcDeck.length} slides`);

  // Generate an Angel-optimized presentation
  const angelDeck = generateInvestorDeck(mockSlides, InvestorLevel.ANGEL);

  console.log('\nANGEL-OPTIMIZED DECK (reordered by importance):');
  angelDeck.forEach((slide, idx) => {
    console.log(`  ${idx + 1}. ${slide.title}`);
    console.log(`     Category: ${slide.taxonomy.primary}`);
    console.log(`     Importance: ${slide.taxonomy.importance}`);
  });

  return { vcDeck, angelDeck };
}

// ============================================================================
// EXAMPLE 3: Progressive Disclosure by Display Mode
// ============================================================================

/**
 * Shows how to scale the same slide from 30 seconds to 5+ minutes
 * depending on the display mode.
 */
export function example3_progressiveDisclosureByDisplayMode() {
  console.log('\n=== EXAMPLE 3: Progressive Disclosure by Display Mode ===\n');

  // Same slide, different display modes
  const solutionSlide: SlideWithTaxonomy = {
    id: 'solution-architecture',
    title: 'Multi-Agent Orchestration Engine',
    taxonomy: {
      primary: SlideCategoryPrimary.SOLUTION,
      secondary: SlideCategorySecondary.SOLUTION_ARCHITECTURE,
      contentTypes: [ContentType.TECHNICAL, ContentType.STRATEGIC],
      displayMode: DisplayMode.FULL,
      investorLevel: InvestorLevel.ALL,
      importance: ContentImportance.HIGH,
      narrativeFunction: NarrativeFunction.RESOLUTION,
      visualizationPreference: VisualizationPreference.TECHNICAL_VISUAL
    }
  };

  // Show what would be visible in each mode
  const displayModes: DisplayMode[] = [
    DisplayMode.HEADLINE_ONLY,
    DisplayMode.SUMMARY,
    DisplayMode.FULL
  ];

  displayModes.forEach(mode => {
    // In real implementation, you'd import getVisibleSections
    // For now, just show the concept
    const content: Record<DisplayMode, string> = {
      [DisplayMode.HEADLINE_ONLY]: 'Title: Multi-Agent Orchestration Engine\nDuration: ~30 seconds',
      [DisplayMode.SUMMARY]: 'Title: Multi-Agent Orchestration Engine\nKey Points:\n- Distributed agent system\n- Real-time coordination\nDuration: ~2-3 minutes',
      [DisplayMode.FULL]: 'Title: Multi-Agent Orchestration Engine\nFull Details:\n- Architecture overview\n- Agent coordination protocol\n- Failure handling\n- Performance benchmarks\n- Future roadmap\nDuration: ~5+ minutes',
      [DisplayMode.INTERACTIVE]: 'Title: Multi-Agent Orchestration Engine\nWith expandable sections for exploration\nDuration: varies',
      [DisplayMode.CUSTOM]: 'Title: Multi-Agent Orchestration Engine\nFiltered for audience\nDuration: varies'
    };

    console.log(`\nDISPLAY MODE: ${mode}`);
    console.log(content[mode]);
  });

  return solutionSlide;
}

// ============================================================================
// EXAMPLE 4: Analyze Slide Distribution
// ============================================================================

/**
 * Practical use case: You want to understand your deck composition
 * before presenting. Are you over-weighted in one area? Missing categories?
 */
export function example4_analyzeSlideDistribution() {
  const mockSlides: SlideWithTaxonomy[] = [
    // Hook slides
    {
      id: 'h1',
      title: 'The Problem',
      taxonomy: {
        primary: SlideCategoryPrimary.HOOK,
        contentTypes: [ContentType.NARRATIVE],
        importance: ContentImportance.CRITICAL
      }
    },

    // Positioning slides
    {
      id: 'p1',
      title: 'Our Approach',
      taxonomy: {
        primary: SlideCategoryPrimary.POSITIONING,
        contentTypes: [ContentType.STRATEGIC],
        importance: ContentImportance.CRITICAL
      }
    },
    {
      id: 'p2',
      title: 'Competitive Advantages',
      taxonomy: {
        primary: SlideCategoryPrimary.POSITIONING,
        contentTypes: [ContentType.DATA_METRICS, ContentType.STRATEGIC],
        importance: ContentImportance.HIGH
      }
    },

    // Foundation slides
    {
      id: 'f1',
      title: 'Market Size',
      taxonomy: {
        primary: SlideCategoryPrimary.FOUNDATION,
        contentTypes: [ContentType.DATA_METRICS],
        importance: ContentImportance.CRITICAL
      }
    },
    {
      id: 'f2',
      title: 'Why Now?',
      taxonomy: {
        primary: SlideCategoryPrimary.FOUNDATION,
        contentTypes: [ContentType.STRATEGIC],
        importance: ContentImportance.HIGH
      }
    },

    // Solution slides
    {
      id: 's1',
      title: 'Technical Architecture',
      taxonomy: {
        primary: SlideCategoryPrimary.SOLUTION,
        contentTypes: [ContentType.TECHNICAL],
        importance: ContentImportance.HIGH
      }
    },
    {
      id: 's2',
      title: 'Product Roadmap',
      taxonomy: {
        primary: SlideCategoryPrimary.SOLUTION,
        contentTypes: [ContentType.STRATEGIC],
        importance: ContentImportance.MEDIUM
      }
    },

    // Validation slides
    {
      id: 'v1',
      title: 'Traction',
      taxonomy: {
        primary: SlideCategoryPrimary.VALIDATION,
        contentTypes: [ContentType.DATA_METRICS],
        importance: ContentImportance.CRITICAL
      }
    },

    // CTA slides
    {
      id: 'c1',
      title: 'Team',
      taxonomy: {
        primary: SlideCategoryPrimary.CTA,
        contentTypes: [ContentType.PEOPLE],
        importance: ContentImportance.HIGH
      }
    }
  ];

  console.log('\n=== EXAMPLE 4: Analyze Slide Distribution ===\n');

  // Distribution by primary category
  const byPrimary = analyzeDistributionByPrimary(mockSlides);
  console.log('DISTRIBUTION BY PRIMARY CATEGORY:');
  Object.entries(byPrimary).forEach(([cat, count]) => {
    const percentage = ((count / mockSlides.length) * 100).toFixed(0);
    console.log(`  ${cat}: ${count} slides (${percentage}%)`);
  });

  // Distribution by content type
  const byContent = analyzeDistributionByContentType(mockSlides);
  console.log('\nDISTRIBUTION BY CONTENT TYPE:');
  Object.entries(byContent).forEach(([type, count]) => {
    const percentage = ((count / mockSlides.length) * 100).toFixed(0);
    console.log(`  ${type}: ${count} (${percentage}%)`);
  });

  // Distribution by importance
  const byImportance = analyzeDistributionByImportance(mockSlides);
  console.log('\nDISTRIBUTION BY IMPORTANCE:');
  Object.entries(byImportance).forEach(([imp, count]) => {
    console.log(`  ${imp}: ${count} slides`);
  });

  // Total duration
  const duration = calculateTotalDuration(mockSlides);
  const minutes = Math.round(duration / 60);
  console.log(`\nTOTAL PRESENTATION TIME: ${minutes} minutes (${duration} seconds)`);

  // Gap analysis
  const gaps = findContentGaps(mockSlides);
  if (gaps.length > 0) {
    console.log('\nMISSING CATEGORIES:');
    gaps.forEach(g => console.log(`  - ${g}`));
  } else {
    console.log('\nNo gaps - all primary categories represented');
  }

  return { byPrimary, byContent, byImportance, duration };
}

// ============================================================================
// EXAMPLE 5: Create Custom Deck Variant
// ============================================================================

/**
 * Advanced: Create a tailored presentation for a specific context
 * (e.g., "Show only critical items for a 20-minute VC meeting")
 */
export function example5_createCustomDeckVariant() {
  const mockSlides: SlideWithTaxonomy[] = [
    {
      id: 's1',
      title: 'Opening',
      taxonomy: {
        primary: SlideCategoryPrimary.HOOK,
        importance: ContentImportance.CRITICAL,
        investorLevel: InvestorLevel.ALL
      }
    },
    {
      id: 's2',
      title: 'Problem & Market',
      taxonomy: {
        primary: SlideCategoryPrimary.FOUNDATION,
        importance: ContentImportance.CRITICAL,
        investorLevel: InvestorLevel.VC,
        contentTypes: [ContentType.DATA_METRICS]
      }
    },
    {
      id: 's3',
      title: 'Solution Overview',
      taxonomy: {
        primary: SlideCategoryPrimary.SOLUTION,
        importance: ContentImportance.HIGH,
        investorLevel: InvestorLevel.ALL,
        contentTypes: [ContentType.TECHNICAL]
      }
    },
    {
      id: 's4',
      title: 'Tech Deep-Dive',
      taxonomy: {
        primary: SlideCategoryPrimary.SOLUTION,
        importance: ContentImportance.MEDIUM,
        investorLevel: InvestorLevel.STRATEGIC,
        contentTypes: [ContentType.TECHNICAL]
      }
    },
    {
      id: 's5',
      title: 'Traction & Metrics',
      taxonomy: {
        primary: SlideCategoryPrimary.VALIDATION,
        importance: ContentImportance.CRITICAL,
        investorLevel: InvestorLevel.VC,
        contentTypes: [ContentType.DATA_METRICS]
      }
    },
    {
      id: 's6',
      title: 'Funding Ask',
      taxonomy: {
        primary: SlideCategoryPrimary.CTA,
        importance: ContentImportance.CRITICAL,
        investorLevel: InvestorLevel.ALL,
        contentTypes: [ContentType.STRATEGIC]
      }
    }
  ];

  console.log('\n=== EXAMPLE 5: Create Custom Deck Variant ===\n');

  // Approach 1: Use a pre-built variant
  console.log('APPROACH 1: Use Pre-built Variant');
  const vcVariant = DECK_VARIANTS.VC_DEEP_DIVE;
  console.log(`Variant: ${vcVariant.name}`);
  console.log(`Description: ${vcVariant.description}`);
  console.log(`Target duration: ${vcVariant.targetDuration || 0}s (${(vcVariant.targetDuration || 0) / 60} min)`);
  console.log(`Slide range: ${vcVariant.minSlides}-${vcVariant.maxSlides} slides`);

  const vcDeck = generateDeckVariant(mockSlides, vcVariant);
  console.log(`Generated deck: ${vcDeck.length} slides`);
  vcDeck.forEach(s => {
    console.log(`  - ${s.title}`);
  });

  // Approach 2: Create a custom variant on the fly
  console.log('\n\nAPPROACH 2: Create Custom Variant');
  const customVariant = {
    name: 'Executive Brief - 15 minutes',
    description: 'Quick overview for busy executives: problem, solution, traction, ask',
    filters: {
      importance: ContentImportance.CRITICAL
    },
    targetDuration: 900, // 15 minutes
    minSlides: 4,
    maxSlides: 6
  };

  const customDeck = generateDeckVariant(mockSlides, customVariant);
  console.log(`Variant: ${customVariant.name}`);
  console.log(`Generated deck: ${customDeck.length} slides`);
  customDeck.forEach((s, idx) => {
    console.log(`  ${idx + 1}. ${s.title} (${s.taxonomy.importance})`);
  });

  // Approach 3: Multi-criteria filtering
  console.log('\n\nAPPROACH 3: Multi-Criteria Filtering');
  const multiCriteriaDeck = filterByMultiple(mockSlides, {
    investorLevel: InvestorLevel.VC,
    importance: ContentImportance.CRITICAL,
    contentTypes: [ContentType.DATA_METRICS, ContentType.STRATEGIC]
  });
  console.log(`Filtered for VCs, CRITICAL importance, data/strategic content:`);
  console.log(`${multiCriteriaDeck.length} slides`);
  multiCriteriaDeck.forEach(s => {
    console.log(`  - ${s.title}`);
  });

  return { vcDeck, customDeck, multiCriteriaDeck };
}

// ============================================================================
// EXPORT FOR TESTING & REFERENCE
// ============================================================================

export const EXAMPLES = {
  example1: example1_filterByInvestorLevel,
  example2: example2_generateInvestorSpecificDeck,
  example3: example3_progressiveDisclosureByDisplayMode,
  example4: example4_analyzeSlideDistribution,
  example5: example5_createCustomDeckVariant
};

/**
 * Run all examples:
 * import { EXAMPLES } from '@/lib/config/taxonomy/examples';
 * Object.values(EXAMPLES).forEach(fn => fn());
 */
