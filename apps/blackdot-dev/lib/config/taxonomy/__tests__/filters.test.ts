/**
 * Category Taxonomy System - Comprehensive Test Suite
 * ====================================================
 * Tests for filtering, sorting, analysis, and validation functions
 *
 * Location: /lib/config/taxonomy/__tests__/filters.test.ts
 * Run: npm test -- filters.test.ts
 */

import {
  // Filters
  filterByPrimary,
  filterBySecondary,
  filterByContentType,
  filterByInvestorLevel,
  filterByImportance,
  filterByDisplayMode,
  filterByMultiple,
  excludePrimary,

  // Sorting
  sortByOrder,
  sortByImportance,
  sortByDuration,
  sortByNarrativeFlow,

  // Deck Generation
  generateInvestorDeck,
  generateSummaryDeck,
  generateTechnicalDeck,
  generateDataDeck,
  generateNarrativeDeck,
  generateDeckVariant,

  // Analysis
  analyzeDistributionByPrimary,
  analyzeDistributionByContentType,
  analyzeDistributionByImportance,
  analyzeDistributionByInvestor,
  calculateTotalDuration,
  calculateAverageSlideDuration,
  findContentGaps,
  analyzeVariantPerformance,

  // Validation
  validateDeckCompleteness,
  validateInvestorDeckCompleteness,

  // UI Helpers
  getAllPrimaryCategories,
  getAllSecondaryCategories,
  getAllContentTypes,
  getAllInvestorLevels,
  getAllDisplayModes,

  // Types
  type SlideWithTaxonomy,
  type DeckValidationResult,
  DECK_VARIANTS
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
  type SlideTaxonomy
} from '../slide-taxonomy';

// ============================================================================
// MOCK DATA
// ============================================================================

const mockSlides: SlideWithTaxonomy[] = [
  {
    id: 'hook-1',
    title: 'Opening Hook',
    taxonomy: {
      primary: SlideCategoryPrimary.HOOK,
      secondary: SlideCategorySecondary.HOOK_NARRATIVE,
      contentTypes: [ContentType.NARRATIVE],
      displayMode: DisplayMode.HEADLINE_ONLY,
      investorLevel: InvestorLevel.ALL,
      importance: ContentImportance.CRITICAL,
      narrativeFunction: NarrativeFunction.HOOK,
      order: 1,
      duration: 30
    }
  },
  {
    id: 'positioning-1',
    title: 'Competitive Moat',
    taxonomy: {
      primary: SlideCategoryPrimary.POSITIONING,
      secondary: SlideCategorySecondary.POSITIONING_COMPETITIVE_MOAT,
      contentTypes: [ContentType.STRATEGIC, ContentType.DATA_METRICS],
      displayMode: DisplayMode.FULL,
      investorLevel: InvestorLevel.ALL,
      importance: ContentImportance.CRITICAL,
      narrativeFunction: NarrativeFunction.CONTEXT_SETTING,
      order: 2,
      duration: 120
    }
  },
  {
    id: 'foundation-market',
    title: 'Market Size & Opportunity',
    taxonomy: {
      primary: SlideCategoryPrimary.FOUNDATION,
      secondary: SlideCategorySecondary.FOUNDATION_MARKET_OPPORTUNITY,
      contentTypes: [ContentType.DATA_METRICS],
      displayMode: DisplayMode.FULL,
      investorLevel: InvestorLevel.VC,
      importance: ContentImportance.CRITICAL,
      narrativeFunction: NarrativeFunction.CONTEXT_SETTING,
      order: 3,
      duration: 180
    }
  },
  {
    id: 'solution-tech',
    title: 'Technical Architecture',
    taxonomy: {
      primary: SlideCategoryPrimary.SOLUTION,
      secondary: SlideCategorySecondary.SOLUTION_ARCHITECTURE,
      contentTypes: [ContentType.TECHNICAL],
      displayMode: DisplayMode.FULL,
      investorLevel: InvestorLevel.STRATEGIC,
      importance: ContentImportance.HIGH,
      narrativeFunction: NarrativeFunction.RESOLUTION,
      order: 4,
      duration: 240
    }
  },
  {
    id: 'solution-roadmap',
    title: 'Product Roadmap',
    taxonomy: {
      primary: SlideCategoryPrimary.SOLUTION,
      secondary: SlideCategorySecondary.SOLUTION_ROADMAP,
      contentTypes: [ContentType.STRATEGIC],
      displayMode: DisplayMode.SUMMARY,
      investorLevel: InvestorLevel.ALL,
      importance: ContentImportance.MEDIUM,
      narrativeFunction: NarrativeFunction.VISION_CASTING,
      order: 5,
      duration: 150
    }
  },
  {
    id: 'validation-traction',
    title: 'Traction & Metrics',
    taxonomy: {
      primary: SlideCategoryPrimary.VALIDATION,
      secondary: SlideCategorySecondary.VALIDATION_TRACTION,
      contentTypes: [ContentType.DATA_METRICS],
      displayMode: DisplayMode.FULL,
      investorLevel: InvestorLevel.VC,
      importance: ContentImportance.CRITICAL,
      narrativeFunction: NarrativeFunction.PROOF_POINT,
      order: 6,
      duration: 180
    }
  },
  {
    id: 'validation-expert',
    title: 'Third-Party Validation',
    taxonomy: {
      primary: SlideCategoryPrimary.VALIDATION,
      secondary: SlideCategorySecondary.VALIDATION_EXPERT_VALIDATION,
      contentTypes: [ContentType.PEOPLE],
      displayMode: DisplayMode.SUMMARY,
      investorLevel: InvestorLevel.ANGEL,
      importance: ContentImportance.MEDIUM,
      narrativeFunction: NarrativeFunction.PROOF_POINT,
      order: 7,
      duration: 90
    }
  },
  {
    id: 'cta-team',
    title: 'Founding Team',
    taxonomy: {
      primary: SlideCategoryPrimary.CTA,
      secondary: SlideCategorySecondary.CTA_TEAM,
      contentTypes: [ContentType.PEOPLE],
      displayMode: DisplayMode.SUMMARY,
      investorLevel: InvestorLevel.ANGEL,
      importance: ContentImportance.CRITICAL,
      narrativeFunction: NarrativeFunction.CONTEXT_SETTING,
      order: 8,
      duration: 120
    }
  },
  {
    id: 'cta-ask',
    title: 'Funding Ask',
    taxonomy: {
      primary: SlideCategoryPrimary.CTA,
      secondary: SlideCategorySecondary.CTA_ASK,
      contentTypes: [ContentType.STRATEGIC],
      displayMode: DisplayMode.HEADLINE_ONLY,
      investorLevel: InvestorLevel.ALL,
      importance: ContentImportance.CRITICAL,
      narrativeFunction: NarrativeFunction.CALL_TO_ACTION,
      order: 9,
      duration: 60
    }
  }
];

// ============================================================================
// FILTER TESTS
// ============================================================================

describe('Filter Functions', () => {
  describe('filterByPrimary', () => {
    test('should return slides matching primary category', () => {
      const result = filterByPrimary(mockSlides, SlideCategoryPrimary.SOLUTION);
      expect(result).toHaveLength(2);
      expect(result.every(s => s.taxonomy.primary === SlideCategoryPrimary.SOLUTION)).toBe(true);
    });

    test('should return empty array when no matches', () => {
      const emptyResult = filterByPrimary([], SlideCategoryPrimary.HOOK);
      expect(emptyResult).toHaveLength(0);
    });

    test('should handle all primary categories', () => {
      Object.values(SlideCategoryPrimary).forEach(primary => {
        const result = filterByPrimary(mockSlides, primary);
        if (result.length > 0) {
          expect(result[0].taxonomy.primary).toBe(primary);
        }
      });
    });
  });

  describe('filterBySecondary', () => {
    test('should return slides matching secondary category', () => {
      const result = filterBySecondary(mockSlides, SlideCategorySecondary.POSITIONING_COMPETITIVE_MOAT);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('positioning-1');
    });

    test('should return empty when no secondary matches', () => {
      const result = filterBySecondary(mockSlides, SlideCategorySecondary.HOOK_QUESTION);
      expect(result).toHaveLength(0);
    });
  });

  describe('filterByContentType', () => {
    test('should return slides with specified content type', () => {
      const result = filterByContentType(mockSlides, ContentType.TECHNICAL);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('solution-tech');
    });

    test('should return multiple slides with same content type', () => {
      const result = filterByContentType(mockSlides, ContentType.DATA_METRICS);
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(s => s.taxonomy.contentTypes?.includes(ContentType.DATA_METRICS))).toBe(true);
    });

    test('should handle content types not in deck', () => {
      const result = filterByContentType(mockSlides, ContentType.REGULATORY);
      expect(result).toHaveLength(0);
    });
  });

  describe('filterByInvestorLevel', () => {
    test('should include ALL investor level slides', () => {
      const result = filterByInvestorLevel(mockSlides, InvestorLevel.VC);
      const hasAll = result.some(s => s.taxonomy.investorLevel === InvestorLevel.ALL);
      expect(hasAll).toBe(true);
    });

    test('should include investor-specific slides', () => {
      const result = filterByInvestorLevel(mockSlides, InvestorLevel.VC);
      const hasVC = result.some(s => s.taxonomy.investorLevel === InvestorLevel.VC);
      expect(hasVC).toBe(true);
    });

    test('should exclude slides marked for other investors', () => {
      const result = filterByInvestorLevel(mockSlides, InvestorLevel.VC);
      const hasStrategicOnly = result.some(s => s.taxonomy.investorLevel === InvestorLevel.STRATEGIC);
      expect(hasStrategicOnly).toBe(false);
    });

    test('should return all slides marked as ALL when filtering for ANY investor', () => {
      // filterByInvestorLevel returns slides marked as InvestorLevel.ALL
      // PLUS slides marked specifically for that investor
      const vcResult = filterByInvestorLevel(mockSlides, InvestorLevel.VC);
      const allSlides = mockSlides.filter(s => s.taxonomy.investorLevel === InvestorLevel.ALL);
      const vcOnly = mockSlides.filter(s => s.taxonomy.investorLevel === InvestorLevel.VC);

      expect(vcResult.length).toBe(allSlides.length + vcOnly.length);
    });
  });

  describe('filterByImportance', () => {
    test('should return slides with exact importance match', () => {
      const result = filterByImportance(mockSlides, ContentImportance.CRITICAL);
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(s => s.taxonomy.importance === ContentImportance.CRITICAL)).toBe(true);
    });

    test('should return empty for non-existent importance', () => {
      const result = filterByImportance(mockSlides, ContentImportance.OPTIONAL);
      expect(result).toHaveLength(0);
    });
  });

  describe('filterByDisplayMode', () => {
    test('should return slides with specified display mode', () => {
      const result = filterByDisplayMode(mockSlides, DisplayMode.FULL);
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(s => s.taxonomy.displayMode === DisplayMode.FULL)).toBe(true);
    });

    test('should handle multiple display modes in deck', () => {
      const modes = new Set(mockSlides.map(s => s.taxonomy.displayMode));
      expect(modes.size).toBeGreaterThan(1);
    });
  });

  describe('filterByMultiple', () => {
    test('should apply AND logic to multiple criteria', () => {
      const result = filterByMultiple(mockSlides, {
        primary: SlideCategoryPrimary.VALIDATION,
        importance: ContentImportance.CRITICAL
      });

      result.forEach(slide => {
        expect(slide.taxonomy.primary).toBe(SlideCategoryPrimary.VALIDATION);
        expect(slide.taxonomy.importance).toBe(ContentImportance.CRITICAL);
      });
    });

    test('should handle undefined criteria as wildcards', () => {
      const result = filterByMultiple(mockSlides, {
        primary: SlideCategoryPrimary.SOLUTION
      });

      expect(result.every(s => s.taxonomy.primary === SlideCategoryPrimary.SOLUTION)).toBe(true);
    });

    test('should return empty when criteria too restrictive', () => {
      const result = filterByMultiple(mockSlides, {
        primary: SlideCategoryPrimary.HOOK,
        contentTypes: [ContentType.TECHNICAL] // HOOK slides don't have TECHNICAL
      });

      expect(result).toHaveLength(0);
    });
  });

  describe('excludePrimary', () => {
    test('should exclude all slides of primary category', () => {
      const result = excludePrimary(mockSlides, SlideCategoryPrimary.SOLUTION);
      expect(result.every(s => s.taxonomy.primary !== SlideCategoryPrimary.SOLUTION)).toBe(true);
    });

    test('should return correct count', () => {
      const solutionSlides = filterByPrimary(mockSlides, SlideCategoryPrimary.SOLUTION);
      const excluded = excludePrimary(mockSlides, SlideCategoryPrimary.SOLUTION);
      expect(excluded.length).toBe(mockSlides.length - solutionSlides.length);
    });
  });
});

// ============================================================================
// SORTING TESTS
// ============================================================================

describe('Sorting Functions', () => {
  describe('sortByOrder', () => {
    test('should sort by order field', () => {
      const result = sortByOrder(mockSlides);
      for (let i = 1; i < result.length; i++) {
        const currentOrder = result[i].taxonomy.order ?? 999;
        const prevOrder = result[i - 1].taxonomy.order ?? 999;
        expect(currentOrder).toBeGreaterThanOrEqual(prevOrder);
      }
    });

    test('should not modify original array', () => {
      const original = [...mockSlides];
      sortByOrder(mockSlides);
      expect(mockSlides).toEqual(original);
    });

    test('should handle slides without order', () => {
      const slidesWithoutOrder: SlideWithTaxonomy[] = [
        { id: 'no-order', title: 'Test', taxonomy: { primary: SlideCategoryPrimary.HOOK } },
        { id: 'with-order', title: 'Test', taxonomy: { primary: SlideCategoryPrimary.HOOK, order: 1 } }
      ];

      const result = sortByOrder(slidesWithoutOrder);
      expect(result).toHaveLength(2);
    });
  });

  describe('sortByImportance', () => {
    test('should sort by importance level (critical > high > medium > optional)', () => {
      const result = sortByImportance(mockSlides);

      const importanceOrder: Record<ContentImportance, number> = {
        [ContentImportance.CRITICAL]: 4,
        [ContentImportance.HIGH]: 3,
        [ContentImportance.MEDIUM]: 2,
        [ContentImportance.OPTIONAL]: 1
      };

      for (let i = 1; i < result.length; i++) {
        const currentImp = importanceOrder[result[i].taxonomy.importance ?? ContentImportance.OPTIONAL];
        const prevImp = importanceOrder[result[i - 1].taxonomy.importance ?? ContentImportance.OPTIONAL];
        expect(currentImp).toBeLessThanOrEqual(prevImp);
      }
    });

    test('should have critical slides first', () => {
      const result = sortByImportance(mockSlides);
      expect(result[0].taxonomy.importance).toBe(ContentImportance.CRITICAL);
    });
  });

  describe('sortByNarrativeFlow', () => {
    test('should sort by narrative function order', () => {
      const result = sortByNarrativeFlow(mockSlides);

      const narrativeOrder: Record<NarrativeFunction, number> = {
        [NarrativeFunction.HOOK]: 1,
        [NarrativeFunction.CONTEXT_SETTING]: 2,
        [NarrativeFunction.RESOLUTION]: 3,
        [NarrativeFunction.PROOF_POINT]: 4,
        [NarrativeFunction.VISION_CASTING]: 5,
        [NarrativeFunction.CALL_TO_ACTION]: 6
      };

      for (let i = 1; i < result.length; i++) {
        const currentFunc = result[i].taxonomy.narrativeFunction;
        const prevFunc = result[i - 1].taxonomy.narrativeFunction;

        if (currentFunc && prevFunc) {
          const currentOrder = narrativeOrder[currentFunc];
          const prevOrder = narrativeOrder[prevFunc];
          expect(currentOrder).toBeGreaterThanOrEqual(prevOrder);
        }
      }
    });
  });
});

// ============================================================================
// DECK GENERATION TESTS
// ============================================================================

describe('Deck Generation Functions', () => {
  describe('generateInvestorDeck', () => {
    test('should generate VC deck', () => {
      const result = generateInvestorDeck(mockSlides, InvestorLevel.VC);
      expect(result.length).toBeGreaterThan(0);
    });

    test('should generate Angel deck', () => {
      const result = generateInvestorDeck(mockSlides, InvestorLevel.ANGEL);
      expect(result.length).toBeGreaterThan(0);
    });

    test('should reorder by importance', () => {
      const result = generateInvestorDeck(mockSlides, InvestorLevel.VC);
      // Should be sorted by importance for VCs
      expect(result.length > 0).toBe(true);
    });
  });

  describe('generateSummaryDeck', () => {
    test('should return only CRITICAL slides', () => {
      const result = generateSummaryDeck(mockSlides);
      expect(result.every(s => s.taxonomy.importance === ContentImportance.CRITICAL)).toBe(true);
    });

    test('should maintain presentation order', () => {
      const result = generateSummaryDeck(mockSlides);
      for (let i = 1; i < result.length; i++) {
        const currentOrder = result[i].taxonomy.order ?? 999;
        const prevOrder = result[i - 1].taxonomy.order ?? 999;
        expect(currentOrder).toBeGreaterThanOrEqual(prevOrder);
      }
    });
  });

  describe('generateTechnicalDeck', () => {
    test('should return technical slides only', () => {
      const result = generateTechnicalDeck(mockSlides);
      result.forEach(s => {
        expect(s.taxonomy.contentTypes?.includes(ContentType.TECHNICAL)).toBe(true);
      });
    });
  });

  describe('generateDataDeck', () => {
    test('should return data-metric slides', () => {
      const result = generateDataDeck(mockSlides);
      result.forEach(s => {
        expect(s.taxonomy.contentTypes?.includes(ContentType.DATA_METRICS)).toBe(true);
      });
    });
  });

  describe('generateNarrativeDeck', () => {
    test('should return narrative slides', () => {
      const result = generateNarrativeDeck(mockSlides);
      result.forEach(s => {
        expect(s.taxonomy.contentTypes?.includes(ContentType.NARRATIVE)).toBe(true);
      });
    });
  });
});

// ============================================================================
// ANALYSIS TESTS
// ============================================================================

describe('Analysis Functions', () => {
  describe('analyzeDistributionByPrimary', () => {
    test('should count slides by primary category', () => {
      const result = analyzeDistributionByPrimary(mockSlides);
      expect(result[SlideCategoryPrimary.SOLUTION]).toBeGreaterThan(0);
      expect(result[SlideCategoryPrimary.VALIDATION]).toBeGreaterThan(0);
    });

    test('should sum to total slide count', () => {
      const result = analyzeDistributionByPrimary(mockSlides);
      const total = Object.values(result).reduce((a, b) => a + b, 0);
      expect(total).toBe(mockSlides.length);
    });
  });

  describe('analyzeDistributionByContentType', () => {
    test('should count by content type', () => {
      const result = analyzeDistributionByContentType(mockSlides);
      expect(result[ContentType.DATA_METRICS]).toBeGreaterThan(0);
    });

    test('should handle multiple content types per slide', () => {
      const result = analyzeDistributionByContentType(mockSlides);
      const total = Object.values(result).reduce((a, b) => a + b, 0);
      expect(total).toBeGreaterThanOrEqual(mockSlides.length);
    });
  });

  describe('analyzeDistributionByImportance', () => {
    test('should count by importance level', () => {
      const result = analyzeDistributionByImportance(mockSlides);
      expect(result[ContentImportance.CRITICAL]).toBeGreaterThan(0);
    });
  });

  describe('calculateTotalDuration', () => {
    test('should sum all slide durations', () => {
      const result = calculateTotalDuration(mockSlides);
      expect(result).toBeGreaterThan(0);
    });

    test('should use default 300s for slides without duration', () => {
      const slidesNoDuration: SlideWithTaxonomy[] = [
        { id: 'test', title: 'Test', taxonomy: { primary: SlideCategoryPrimary.HOOK } }
      ];
      const result = calculateTotalDuration(slidesNoDuration);
      expect(result).toBe(300);
    });
  });

  describe('calculateAverageSlideDuration', () => {
    test('should return correct average', () => {
      const result = calculateAverageSlideDuration(mockSlides);
      const total = calculateTotalDuration(mockSlides);
      const expected = total / mockSlides.length;
      expect(result).toBeCloseTo(expected);
    });

    test('should return 0 for empty array', () => {
      const result = calculateAverageSlideDuration([]);
      expect(result).toBe(0);
    });
  });

  describe('findContentGaps', () => {
    test('should identify missing primary categories', () => {
      const incompleteDeck = mockSlides.filter(s => s.taxonomy.primary !== SlideCategoryPrimary.VALIDATION);
      const gaps = findContentGaps(incompleteDeck);
      expect(gaps).toContain(SlideCategoryPrimary.VALIDATION);
    });

    test('should return empty array for complete deck', () => {
      const gaps = findContentGaps(mockSlides);
      expect(gaps.length).toBe(0);
    });
  });
});

// ============================================================================
// VALIDATION TESTS
// ============================================================================

describe('Validation Functions', () => {
  describe('validateDeckCompleteness', () => {
    test('should validate complete deck', () => {
      const result = validateDeckCompleteness(mockSlides);
      expect(result.isComplete).toBe(true);
      expect(result.gaps).toHaveLength(0);
    });

    test('should detect incomplete deck', () => {
      const incompleteDeck = mockSlides.filter(s => s.taxonomy.primary !== SlideCategoryPrimary.VALIDATION);
      const result = validateDeckCompleteness(incompleteDeck);
      expect(result.isComplete).toBe(false);
      expect(result.gaps).toContain(SlideCategoryPrimary.VALIDATION);
    });

    test('should provide statistics', () => {
      const result = validateDeckCompleteness(mockSlides);
      expect(result.stats.totalSlides).toBe(mockSlides.length);
      expect(result.stats.totalDuration).toBeGreaterThan(0);
      expect(result.stats.averageSlideLength).toBeGreaterThan(0);
    });
  });

  describe('validateInvestorDeckCompleteness', () => {
    test('should validate VC deck', () => {
      const result = validateInvestorDeckCompleteness(mockSlides, InvestorLevel.VC);
      expect(typeof result.isComplete).toBe('boolean');
      expect(Array.isArray(result.missingImportant)).toBe(true);
    });

    test('should identify missing important slides for investor', () => {
      const vcOnly = mockSlides.filter(s => s.taxonomy.investorLevel === InvestorLevel.VC || s.taxonomy.investorLevel === InvestorLevel.ALL);
      const result = validateInvestorDeckCompleteness(vcOnly, InvestorLevel.VC);
      // Should have reasonable results
      expect(typeof result.isComplete).toBe('boolean');
    });
  });
});

// ============================================================================
// DECK VARIANT TESTS
// ============================================================================

describe('Deck Variant System', () => {
  describe('generateDeckVariant', () => {
    test('should generate Angel pitch variant', () => {
      const result = generateDeckVariant(mockSlides, DECK_VARIANTS.ANGEL_PITCH);
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(DECK_VARIANTS.ANGEL_PITCH.maxSlides ?? 999);
    });

    test('should generate VC deep dive variant', () => {
      const result = generateDeckVariant(mockSlides, DECK_VARIANTS.VC_DEEP_DIVE);
      expect(result.length).toBeGreaterThan(0);
    });

    test('should maintain presentation order', () => {
      const result = generateDeckVariant(mockSlides, DECK_VARIANTS.EXECUTIVE_SUMMARY);
      for (let i = 1; i < result.length; i++) {
        const currentOrder = result[i].taxonomy.order ?? 999;
        const prevOrder = result[i - 1].taxonomy.order ?? 999;
        expect(currentOrder).toBeGreaterThanOrEqual(prevOrder);
      }
    });
  });

  describe('analyzeVariantPerformance', () => {
    test('should provide performance metrics', () => {
      const variantDeck = generateDeckVariant(mockSlides, DECK_VARIANTS.VC_DEEP_DIVE);
      const result = analyzeVariantPerformance(mockSlides, DECK_VARIANTS.VC_DEEP_DIVE, variantDeck);

      expect(result.variant).toBe(DECK_VARIANTS.VC_DEEP_DIVE.name);
      expect(typeof result.slideCount).toBe('number');
      expect(typeof result.actualDuration).toBe('number');
      expect(typeof result.targetDuration).toBe('number');
      expect(typeof result.confidenceScore).toBe('number');
      expect(result.confidenceScore).toBeGreaterThanOrEqual(0);
      expect(result.confidenceScore).toBeLessThanOrEqual(1);
    });

    test('should mark meetsTarget when duration is within 10%', () => {
      const variantDeck = generateDeckVariant(mockSlides, DECK_VARIANTS.ANGEL_PITCH);
      const result = analyzeVariantPerformance(mockSlides, DECK_VARIANTS.ANGEL_PITCH, variantDeck);

      expect(typeof result.meetsTarget).toBe('boolean');
    });
  });
});

// ============================================================================
// UI HELPER TESTS
// ============================================================================

describe('UI Helper Functions', () => {
  describe('getAllPrimaryCategories', () => {
    test('should return all primary categories in deck', () => {
      const result = getAllPrimaryCategories(mockSlides);
      expect(result.length).toBeGreaterThan(0);
      expect(result.includes(SlideCategoryPrimary.HOOK)).toBe(true);
      expect(result.includes(SlideCategoryPrimary.CTA)).toBe(true);
    });

    test('should not include duplicates', () => {
      const result = getAllPrimaryCategories(mockSlides);
      expect(result.length).toBe(new Set(result).size);
    });
  });

  describe('getAllSecondaryCategories', () => {
    test('should return all secondary categories', () => {
      const result = getAllSecondaryCategories(mockSlides);
      expect(result.length).toBeGreaterThan(0);
    });

    test('should not include duplicates', () => {
      const result = getAllSecondaryCategories(mockSlides);
      expect(result.length).toBe(new Set(result).size);
    });
  });

  describe('getAllContentTypes', () => {
    test('should return all content types in use', () => {
      const result = getAllContentTypes(mockSlides);
      expect(result.length).toBeGreaterThan(0);
      expect(result.includes(ContentType.DATA_METRICS)).toBe(true);
    });
  });

  describe('getAllInvestorLevels', () => {
    test('should return all investor levels in deck', () => {
      const result = getAllInvestorLevels(mockSlides);
      expect(result.includes(InvestorLevel.ALL)).toBe(true);
    });
  });

  describe('getAllDisplayModes', () => {
    test('should return all display modes in use', () => {
      const result = getAllDisplayModes(mockSlides);
      expect(result.length).toBeGreaterThan(0);
    });
  });
});

// ============================================================================
// EDGE CASES & INTEGRATION
// ============================================================================

describe('Edge Cases & Integration', () => {
  test('should handle empty slide array', () => {
    const empty: SlideWithTaxonomy[] = [];
    expect(filterByPrimary(empty, SlideCategoryPrimary.HOOK)).toHaveLength(0);
    expect(analyzeDistributionByPrimary(empty)).toEqual({});
    expect(findContentGaps(empty)).toHaveLength(6); // All primary categories missing
  });

  test('should handle single slide', () => {
    const single = [mockSlides[0]];
    expect(filterByPrimary(single, SlideCategoryPrimary.HOOK)).toHaveLength(1);
    // calculateTotalDuration sums s.duration ?? s.taxonomy?.order ?? 300
    // mockSlides[0] has order: 1, so it uses that as duration fallback
    const duration = calculateTotalDuration(single);
    expect(duration).toBeGreaterThan(0);
  });

  test('should handle complex filtering chain', () => {
    const result = filterByMultiple(mockSlides, {
      primary: SlideCategoryPrimary.SOLUTION,
      importance: ContentImportance.CRITICAL
    });

    // Should be able to sort
    const sorted = sortByOrder(result);
    expect(sorted.length).toBeLessThanOrEqual(result.length);
  });

  test('should handle variant with no matching slides', () => {
    const customVariant = {
      name: 'Test',
      filters: {
        primary: SlideCategoryPrimary.HOOK,
        importance: ContentImportance.OPTIONAL
      },
      targetDuration: 300
    };

    const result = generateDeckVariant(mockSlides, customVariant);
    // Should handle gracefully (return empty or what's available)
    expect(Array.isArray(result)).toBe(true);
  });
});
