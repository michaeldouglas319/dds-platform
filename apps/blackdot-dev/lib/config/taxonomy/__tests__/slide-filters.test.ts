/**
 * Slide Filters - Comprehensive Test Suite
 * Tests all filter, sort, analysis, and deck generation functions
 */

import {
  // Filters
  filterByPrimary,
  filterBySecondary,
  filterByContentType,
  filterByInvestorLevel,
  filterByImportance,
  filterByDisplayMode,
  filterByVisualization,
  filterByNarrativeFunction,
  filterByMultiple,
  excludePrimary,
  // Sorts
  sortByOrder,
  sortByImportance,
  sortByDuration,
  sortByNarrativeFlow,
  // Deck Generators
  generateInvestorDeck,
  generateSummaryDeck,
  generateTechnicalDeck,
  generateDataDeck,
  generateNarrativeDeck,
  // Analysis
  analyzeDistributionByPrimary,
  analyzeDistributionByContentType,
  analyzeDistributionByImportance,
  analyzeDistributionByInvestor,
  calculateTotalDuration,
  calculateAverageSlideDuration,
  findContentGaps,
  // Validation
  validateDeckCompleteness,
  validateInvestorDeckCompleteness,
  // Recommendations
  getNextSlideRecommendation,
  getPreviousSlideRecommendation,
  findRelatedSlides,
  // UI Helpers
  getAllPrimaryCategories,
  getAllSecondaryCategories,
  getAllContentTypes,
  getAllInvestorLevels,
  getAllDisplayModes,
  // Variants
  generateDeckVariant,
  analyzeVariantPerformance,
  evaluateAllVariants,
  recommendBestVariants,
  DECK_VARIANTS,
  // Types
  SlideWithTaxonomy,
} from '../slide-filters';

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
} from '../slide-taxonomy';

// ============================================================================
// SAMPLE DATA
// ============================================================================

const sampleSlides: SlideWithTaxonomy[] = [
  {
    id: 'hook-1',
    title: 'The Problem',
    order: 1,
    duration: 30,
    taxonomy: {
      primary: SlideCategoryPrimary.HOOK,
      secondary: SlideCategorySecondary.HOOK_NARRATIVE,
      contentTypes: [ContentType.NARRATIVE],
      displayMode: DisplayMode.FULL,
      investorLevel: InvestorLevel.ALL,
      importance: ContentImportance.CRITICAL,
      narrativeFunction: NarrativeFunction.HOOK,
      visualizationPreference: VisualizationPreference.LIFESTYLE_IMAGERY,
    },
  },
  {
    id: 'positioning-1',
    title: 'Our Competitive Advantage',
    order: 2,
    duration: 120,
    taxonomy: {
      primary: SlideCategoryPrimary.POSITIONING,
      secondary: SlideCategorySecondary.POSITIONING_COMPETITIVE_MOAT,
      contentTypes: [ContentType.STRATEGIC, ContentType.DATA_METRICS],
      displayMode: DisplayMode.FULL,
      investorLevel: InvestorLevel.VC,
      importance: ContentImportance.CRITICAL,
      narrativeFunction: NarrativeFunction.CONTEXT_SETTING,
      visualizationPreference: VisualizationPreference.DATA_VISUALIZATION,
    },
  },
  {
    id: 'foundation-1',
    title: 'Market Opportunity',
    order: 3,
    duration: 180,
    taxonomy: {
      primary: SlideCategoryPrimary.FOUNDATION,
      secondary: SlideCategorySecondary.FOUNDATION_MARKET_OPPORTUNITY,
      contentTypes: [ContentType.DATA_METRICS],
      displayMode: DisplayMode.FULL,
      investorLevel: InvestorLevel.ALL,
      importance: ContentImportance.CRITICAL,
      narrativeFunction: NarrativeFunction.CONTEXT_SETTING,
      visualizationPreference: VisualizationPreference.DATA_VISUALIZATION,
    },
  },
  {
    id: 'solution-1',
    title: 'Technical Architecture',
    order: 4,
    duration: 240,
    taxonomy: {
      primary: SlideCategoryPrimary.SOLUTION,
      secondary: SlideCategorySecondary.SOLUTION_ARCHITECTURE,
      contentTypes: [ContentType.TECHNICAL],
      displayMode: DisplayMode.FULL,
      investorLevel: InvestorLevel.STRATEGIC,
      importance: ContentImportance.HIGH,
      narrativeFunction: NarrativeFunction.RESOLUTION,
      visualizationPreference: VisualizationPreference.TECHNICAL_VISUAL,
    },
  },
  {
    id: 'validation-1',
    title: 'Traction & Metrics',
    order: 5,
    duration: 180,
    taxonomy: {
      primary: SlideCategoryPrimary.VALIDATION,
      secondary: SlideCategorySecondary.VALIDATION_TRACTION,
      contentTypes: [ContentType.DATA_METRICS],
      displayMode: DisplayMode.SUMMARY,
      investorLevel: InvestorLevel.VC,
      importance: ContentImportance.CRITICAL,
      narrativeFunction: NarrativeFunction.PROOF_POINT,
      visualizationPreference: VisualizationPreference.DATA_VISUALIZATION,
    },
  },
  {
    id: 'cta-1',
    title: 'Team & Ask',
    order: 6,
    duration: 120,
    taxonomy: {
      primary: SlideCategoryPrimary.CTA,
      secondary: SlideCategorySecondary.CTA_ASK,
      contentTypes: [ContentType.PEOPLE, ContentType.STRATEGIC],
      displayMode: DisplayMode.FULL,
      investorLevel: InvestorLevel.ALL,
      importance: ContentImportance.CRITICAL,
      narrativeFunction: NarrativeFunction.CALL_TO_ACTION,
      visualizationPreference: VisualizationPreference.MINIMALIST,
    },
  },
  {
    id: 'validation-2',
    title: 'Customer Testimonials',
    order: 7,
    duration: 60,
    taxonomy: {
      primary: SlideCategoryPrimary.VALIDATION,
      secondary: SlideCategorySecondary.VALIDATION_MARKET_PROOF,
      contentTypes: [ContentType.PEOPLE],
      displayMode: DisplayMode.INTERACTIVE,
      investorLevel: InvestorLevel.ANGEL,
      importance: ContentImportance.MEDIUM,
      narrativeFunction: NarrativeFunction.PROOF_POINT,
      visualizationPreference: VisualizationPreference.LIFESTYLE_IMAGERY,
    },
  },
  {
    id: 'solution-2',
    title: 'Product Roadmap',
    order: 8,
    duration: 150,
    taxonomy: {
      primary: SlideCategoryPrimary.SOLUTION,
      secondary: SlideCategorySecondary.SOLUTION_ROADMAP,
      contentTypes: [ContentType.STRATEGIC],
      displayMode: DisplayMode.SUMMARY,
      investorLevel: InvestorLevel.ANGEL,
      importance: ContentImportance.OPTIONAL,
      narrativeFunction: NarrativeFunction.VISION_CASTING,
      visualizationPreference: VisualizationPreference.DATA_VISUALIZATION,
    },
  },
];

// ============================================================================
// TEST SUITE
// ============================================================================

describe('Slide Filters - Complete Test Suite', () => {
  // ====== BASIC FILTERS ======

  describe('Basic Filters', () => {
    test('filterByPrimary should return slides matching primary category', () => {
      const result = filterByPrimary(sampleSlides, SlideCategoryPrimary.SOLUTION);
      expect(result).toHaveLength(2);
      expect(result.map(s => s.id)).toEqual(['solution-1', 'solution-2']);
    });

    test('filterBySecondary should return slides matching secondary category', () => {
      const result = filterBySecondary(sampleSlides, SlideCategorySecondary.VALIDATION_TRACTION);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('validation-1');
    });

    test('filterByContentType should return slides with content type', () => {
      const result = filterByContentType(sampleSlides, ContentType.DATA_METRICS);
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(s => s.taxonomy?.contentTypes?.includes(ContentType.DATA_METRICS))).toBe(true);
    });

    test('filterByInvestorLevel should return slides matching investor level', () => {
      const result = filterByInvestorLevel(sampleSlides, InvestorLevel.VC);
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(s =>
        s.taxonomy?.investorLevel === InvestorLevel.VC ||
        s.taxonomy?.investorLevel === InvestorLevel.ALL
      )).toBe(true);
    });

    test('filterByImportance should return slides at importance level', () => {
      const result = filterByImportance(sampleSlides, ContentImportance.CRITICAL);
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(s => s.taxonomy?.importance === ContentImportance.CRITICAL)).toBe(true);
    });

    test('excludePrimary should return all except specified primary', () => {
      const result = excludePrimary(sampleSlides, SlideCategoryPrimary.SOLUTION);
      expect(result).toHaveLength(6);
      expect(result.every(s => s.taxonomy?.primary !== SlideCategoryPrimary.SOLUTION)).toBe(true);
    });
  });

  // ====== SORTING ======

  describe('Sorting Functions', () => {
    test('sortByOrder should return slides in presentation order', () => {
      const shuffled = [...sampleSlides].reverse();
      const result = sortByOrder(shuffled);
      expect(result[0].id).toBe('hook-1');
      expect(result[result.length - 1].id).toBe('solution-2');
    });

    test('sortByImportance should rank critical highest', () => {
      const result = sortByImportance(sampleSlides);
      const criticalIndices = result
        .map((s, i) => s.taxonomy?.importance === ContentImportance.CRITICAL ? i : -1)
        .filter(i => i !== -1);
      expect(criticalIndices[0]).toBeLessThan(
        result.findIndex(s => s.taxonomy?.importance === ContentImportance.OPTIONAL)
      );
    });

    test('sortByDuration should sort by duration descending', () => {
      const result = sortByDuration(sampleSlides);
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].duration ?? 300).toBeGreaterThanOrEqual(result[i + 1].duration ?? 300);
      }
    });

    test('sortByNarrativeFlow should follow narrative arc', () => {
      const result = sortByNarrativeFlow(sampleSlides);
      const hookIndex = result.findIndex(s => s.taxonomy?.narrativeFunction === NarrativeFunction.HOOK);
      const ctaIndex = result.findIndex(s => s.taxonomy?.narrativeFunction === NarrativeFunction.CALL_TO_ACTION);
      expect(hookIndex).toBeLessThan(ctaIndex);
    });
  });

  // ====== MULTI-DIMENSIONAL FILTERING ======

  describe('Multi-Dimensional Filters', () => {
    test('filterByMultiple should apply AND logic', () => {
      const result = filterByMultiple(sampleSlides, {
        primary: SlideCategoryPrimary.SOLUTION,
        contentTypes: [ContentType.STRATEGIC],
        investorLevel: InvestorLevel.ANGEL,
      });
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(s =>
        s.taxonomy?.primary === SlideCategoryPrimary.SOLUTION &&
        s.taxonomy?.contentTypes?.includes(ContentType.STRATEGIC) &&
        (s.taxonomy?.investorLevel === InvestorLevel.ANGEL || s.taxonomy?.investorLevel === InvestorLevel.ALL)
      )).toBe(true);
    });
  });

  // ====== DECK GENERATION ======

  describe('Deck Generation', () => {
    test('generateInvestorDeck should return investor-filtered slides sorted by importance', () => {
      const result = generateInvestorDeck(sampleSlides, InvestorLevel.VC);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].taxonomy?.importance).toBe(ContentImportance.CRITICAL);
    });

    test('generateSummaryDeck should return only critical slides', () => {
      const result = generateSummaryDeck(sampleSlides);
      expect(result.every(s => s.taxonomy?.importance === ContentImportance.CRITICAL)).toBe(true);
    });

    test('generateTechnicalDeck should return technical content slides', () => {
      const result = generateTechnicalDeck(sampleSlides);
      expect(result.every(s => s.taxonomy?.contentTypes?.includes(ContentType.TECHNICAL))).toBe(true);
    });

    test('generateDataDeck should return data/metrics slides', () => {
      const result = generateDataDeck(sampleSlides);
      expect(result.every(s => s.taxonomy?.contentTypes?.includes(ContentType.DATA_METRICS))).toBe(true);
    });

    test('generateNarrativeDeck should return narrative slides', () => {
      const result = generateNarrativeDeck(sampleSlides);
      expect(result.every(s => s.taxonomy?.contentTypes?.includes(ContentType.NARRATIVE))).toBe(true);
    });
  });

  // ====== ANALYSIS ======

  describe('Analysis Functions', () => {
    test('analyzeDistributionByPrimary should count slides per primary', () => {
      const result = analyzeDistributionByPrimary(sampleSlides);
      expect(result[SlideCategoryPrimary.SOLUTION]).toBe(2);
      expect(result[SlideCategoryPrimary.VALIDATION]).toBe(2);
      expect(result[SlideCategoryPrimary.HOOK]).toBe(1);
    });

    test('analyzeDistributionByContentType should count content types', () => {
      const result = analyzeDistributionByContentType(sampleSlides);
      expect(result[ContentType.DATA_METRICS]).toBeGreaterThan(0);
      expect(result[ContentType.TECHNICAL]).toBeGreaterThan(0);
    });

    test('analyzeDistributionByImportance should count by importance', () => {
      const result = analyzeDistributionByImportance(sampleSlides);
      expect(result[ContentImportance.CRITICAL]).toBe(5);
    });

    test('analyzeDistributionByInvestor should count by investor level', () => {
      const result = analyzeDistributionByInvestor(sampleSlides);
      expect(result[InvestorLevel.ALL]).toBeGreaterThan(0);
      expect(result[InvestorLevel.VC]).toBeGreaterThan(0);
    });

    test('calculateTotalDuration should sum all durations', () => {
      const result = calculateTotalDuration(sampleSlides);
      const expected = 30 + 120 + 180 + 240 + 180 + 120 + 60 + 150;
      expect(result).toBe(expected);
    });

    test('calculateAverageSlideDuration should compute average', () => {
      const result = calculateAverageSlideDuration(sampleSlides);
      const expected = calculateTotalDuration(sampleSlides) / sampleSlides.length;
      expect(result).toBe(expected);
    });

    test('findContentGaps should identify missing primary categories', () => {
      const filtered = sampleSlides.filter(s => s.taxonomy?.primary !== SlideCategoryPrimary.POSITIONING);
      const result = findContentGaps(filtered);
      expect(result).toContain(SlideCategoryPrimary.POSITIONING);
      expect(result).not.toContain(SlideCategoryPrimary.HOOK);
    });
  });

  // ====== VALIDATION ======

  describe('Validation Functions', () => {
    test('validateDeckCompleteness should report all categories present', () => {
      const result = validateDeckCompleteness(sampleSlides);
      expect(result.isComplete).toBe(true);
      expect(result.gaps).toHaveLength(0);
      expect(result.stats.totalSlides).toBe(8);
    });

    test('validateDeckCompleteness should report missing categories', () => {
      const filtered = sampleSlides.filter(s => s.taxonomy?.primary !== SlideCategoryPrimary.CTA);
      const result = validateDeckCompleteness(filtered);
      expect(result.isComplete).toBe(false);
      expect(result.gaps).toContain(SlideCategoryPrimary.CTA);
    });

    test('validateInvestorDeckCompleteness should check investor-specific critical slides', () => {
      const result = validateInvestorDeckCompleteness(sampleSlides, InvestorLevel.VC);
      expect(result.isComplete).toBe(true);
    });
  });

  // ====== RECOMMENDATIONS ======

  describe('Recommendation Functions', () => {
    test('getNextSlideRecommendation should return next ordered slide', () => {
      const current = sampleSlides.find(s => s.id === 'hook-1')!;
      const result = getNextSlideRecommendation(sampleSlides, current);
      expect(result?.id).toBe('positioning-1');
    });

    test('getPreviousSlideRecommendation should return previous ordered slide', () => {
      const current = sampleSlides.find(s => s.id === 'solution-1')!;
      const result = getPreviousSlideRecommendation(sampleSlides, current);
      expect(result?.id).toBe('foundation-1');
    });

    test('findRelatedSlides should return similar slides', () => {
      const current = sampleSlides.find(s => s.id === 'solution-1')!;
      const result = findRelatedSlides(sampleSlides, current, 3);
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(s => s.id !== 'solution-1')).toBe(true);
    });
  });

  // ====== UI HELPERS ======

  describe('UI Helper Functions', () => {
    test('getAllPrimaryCategories should return all distinct primaries', () => {
      const result = getAllPrimaryCategories(sampleSlides);
      expect(result).toContain(SlideCategoryPrimary.HOOK);
      expect(result).toContain(SlideCategoryPrimary.SOLUTION);
      expect(result).toContain(SlideCategoryPrimary.VALIDATION);
    });

    test('getAllSecondaryCategories should return all distinct secondaries', () => {
      const result = getAllSecondaryCategories(sampleSlides);
      expect(result).toContain(SlideCategorySecondary.HOOK_NARRATIVE);
      expect(result.length).toBeGreaterThan(0);
    });

    test('getAllContentTypes should return all distinct content types', () => {
      const result = getAllContentTypes(sampleSlides);
      expect(result).toContain(ContentType.NARRATIVE);
      expect(result).toContain(ContentType.TECHNICAL);
    });

    test('getAllInvestorLevels should return all distinct investor levels', () => {
      const result = getAllInvestorLevels(sampleSlides);
      expect(result).toContain(InvestorLevel.ALL);
      expect(result).toContain(InvestorLevel.VC);
    });

    test('getAllDisplayModes should return all distinct display modes', () => {
      const result = getAllDisplayModes(sampleSlides);
      expect(result).toContain(DisplayMode.FULL);
      expect(result).toContain(DisplayMode.SUMMARY);
    });
  });

  // ====== VARIANT SYSTEM ======

  describe('Deck Variant System', () => {
    test('DECK_VARIANTS should include all major presentation types', () => {
      expect(DECK_VARIANTS.ANGEL_PITCH).toBeDefined();
      expect(DECK_VARIANTS.VC_DEEP_DIVE).toBeDefined();
      expect(DECK_VARIANTS.TECHNICAL_REVIEW).toBeDefined();
      expect(DECK_VARIANTS.EXECUTIVE_SUMMARY).toBeDefined();
      expect(DECK_VARIANTS.BOARD_MEETING).toBeDefined();
    });

    test('generateDeckVariant should apply variant filters', () => {
      const result = generateDeckVariant(sampleSlides, DECK_VARIANTS.EXECUTIVE_SUMMARY);
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(s => s.taxonomy?.importance === ContentImportance.CRITICAL)).toBe(true);
    });

    test('analyzeVariantPerformance should score variant fit', () => {
      const variant = DECK_VARIANTS.ANGEL_PITCH;
      const variantSlides = generateDeckVariant(sampleSlides, variant);
      const result = analyzeVariantPerformance(sampleSlides, variant, variantSlides);

      expect(result.variant).toBe(variant.name);
      expect(result.slideCount).toBeGreaterThan(0);
      expect(result.confidenceScore).toBeGreaterThanOrEqual(0);
      expect(result.confidenceScore).toBeLessThanOrEqual(1);
    });

    test('evaluateAllVariants should score all variants', () => {
      const result = evaluateAllVariants(sampleSlides);
      expect(result.length).toBeGreaterThan(5);
      expect(result.every(r => r.confidenceScore >= 0 && r.confidenceScore <= 1)).toBe(true);
    });

    test('recommendBestVariants should return sorted recommendations', () => {
      const result = recommendBestVariants(sampleSlides, 3);
      expect(result.length).toBeLessThanOrEqual(3);
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].confidenceScore).toBeGreaterThanOrEqual(result[i + 1].confidenceScore);
      }
    });
  });

  // ====== BATCH OPERATIONS ======

  describe('Batch Operations', () => {
    test('evaluateAllVariants should work with sample slides', () => {
      const result = evaluateAllVariants(sampleSlides);
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(r => typeof r.variant === 'string')).toBe(true);
    });

    test('recommendBestVariants should return top N', () => {
      const result3 = recommendBestVariants(sampleSlides, 3);
      const result5 = recommendBestVariants(sampleSlides, 5);
      expect(result3.length).toBeLessThanOrEqual(3);
      expect(result5.length).toBeLessThanOrEqual(5);
    });
  });
});

// ============================================================================
// PERFORMANCE TESTS
// ============================================================================

describe('Performance Optimization', () => {
  const largeDataset = Array.from({ length: 100 }, (_, i) => ({
    id: `slide-${i}`,
    title: `Slide ${i}`,
    order: i,
    duration: Math.random() * 300,
    taxonomy: {
      primary: Object.values(SlideCategoryPrimary)[i % 6],
      contentTypes: [
        Object.values(ContentType)[i % 6],
        Object.values(ContentType)[(i + 1) % 6],
      ],
      investorLevel: Object.values(InvestorLevel)[i % 4],
      importance: Object.values(ContentImportance)[i % 4],
      narrativeFunction: Object.values(NarrativeFunction)[i % 6],
      displayMode: Object.values(DisplayMode)[i % 5],
      visualizationPreference: Object.values(VisualizationPreference)[i % 6],
    },
  }));

  test('filterByPrimary performance', () => {
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      filterByPrimary(largeDataset, SlideCategoryPrimary.SOLUTION);
    }
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(5000); // Should complete 1000 iterations in under 5 seconds
  });

  test('sortByOrder performance', () => {
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      sortByOrder(largeDataset);
    }
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(1000); // Should complete 100 iterations in under 1 second
  });

  test('analyzeDistributionByPrimary performance', () => {
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      analyzeDistributionByPrimary(largeDataset);
    }
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(1000);
  });

  test('validateDeckCompleteness performance', () => {
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      validateDeckCompleteness(largeDataset);
    }
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(2000);
  });
});
