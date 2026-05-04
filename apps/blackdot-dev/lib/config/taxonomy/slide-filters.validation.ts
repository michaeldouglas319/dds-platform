/**
 * Slide Filters - Direct Validation Script
 * Tests all filter, sort, analysis, and deck generation functions with sample data
 * Can be run directly with `ts-node slide-filters.validation.ts`
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
} from './slide-filters';

import {
  SlideCategoryPrimary,
  SlideCategorySecondary,
  ContentType,
  DisplayMode,
  InvestorLevel,
  ContentImportance,
  NarrativeFunction,
  VisualizationPreference,
} from './slide-taxonomy';

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
// VALIDATION RUNNER
// ============================================================================

export function runValidation(): void {
  console.log('\n====================================================');
  console.log('SLIDE FILTERS - COMPREHENSIVE VALIDATION');
  console.log('====================================================\n');

  let passCount = 0;
  let failCount = 0;

  const test = (name: string, condition: boolean, details?: string) => {
    if (condition) {
      console.log(`✓ ${name}`);
      passCount++;
    } else {
      console.log(`✗ ${name}${details ? ': ' + details : ''}`);
      failCount++;
    }
  };

  // ====== BASIC FILTERS ======
  console.log('\n--- BASIC FILTERS ---');

  const solutionSlides = filterByPrimary(sampleSlides, SlideCategoryPrimary.SOLUTION);
  test('filterByPrimary', solutionSlides.length === 2, `Expected 2, got ${solutionSlides.length}`);

  const moatSlides = filterBySecondary(sampleSlides, SlideCategorySecondary.POSITIONING_COMPETITIVE_MOAT);
  test('filterBySecondary', moatSlides.length === 1);

  const technicalSlides = filterByContentType(sampleSlides, ContentType.TECHNICAL);
  test('filterByContentType', technicalSlides.length > 0);

  const vcSlides = filterByInvestorLevel(sampleSlides, InvestorLevel.VC);
  test('filterByInvestorLevel', vcSlides.length > 0);

  const criticalSlides = filterByImportance(sampleSlides, ContentImportance.CRITICAL);
  test('filterByImportance', criticalSlides.length === 5, `Expected 5 critical, got ${criticalSlides.length}`);

  const fullModeSlides = filterByDisplayMode(sampleSlides, DisplayMode.FULL);
  test('filterByDisplayMode', fullModeSlides.length > 0);

  const dataVizSlides = filterByVisualization(sampleSlides, VisualizationPreference.DATA_VISUALIZATION);
  test('filterByVisualization', dataVizSlides.length > 0);

  const hookNarratives = filterByNarrativeFunction(sampleSlides, NarrativeFunction.HOOK);
  test('filterByNarrativeFunction', hookNarratives.length > 0);

  // ====== MULTI-DIMENSIONAL FILTERING ======
  console.log('\n--- MULTI-DIMENSIONAL FILTERS ---');

  const multiFilter = filterByMultiple(sampleSlides, {
    primary: SlideCategoryPrimary.SOLUTION,
    contentTypes: [ContentType.STRATEGIC],
  });
  test('filterByMultiple', multiFilter.length > 0);

  const excluded = excludePrimary(sampleSlides, SlideCategoryPrimary.SOLUTION);
  test('excludePrimary', excluded.length === 6, `Expected 6, got ${excluded.length}`);

  // ====== SORTING ======
  console.log('\n--- SORTING FUNCTIONS ---');

  const ordered = sortByOrder(sampleSlides);
  test('sortByOrder', ordered[0].id === 'hook-1' && ordered[ordered.length - 1].id === 'solution-2');

  const byImportance = sortByImportance(sampleSlides);
  test('sortByImportance', byImportance[0].taxonomy?.importance === ContentImportance.CRITICAL);

  const byDuration = sortByDuration(sampleSlides);
  test('sortByDuration', byDuration[0].duration! >= byDuration[1].duration!);

  const narrativeFlow = sortByNarrativeFlow(sampleSlides);
  const hookIdx = narrativeFlow.findIndex(s => s.taxonomy?.narrativeFunction === NarrativeFunction.HOOK);
  const ctaIdx = narrativeFlow.findIndex(s => s.taxonomy?.narrativeFunction === NarrativeFunction.CALL_TO_ACTION);
  test('sortByNarrativeFlow', hookIdx < ctaIdx);

  // ====== DECK GENERATION ======
  console.log('\n--- DECK GENERATION ---');

  const investorDeck = generateInvestorDeck(sampleSlides, InvestorLevel.VC);
  test('generateInvestorDeck', investorDeck.length > 0);

  const summaryDeck = generateSummaryDeck(sampleSlides);
  test('generateSummaryDeck', summaryDeck.every(s => s.taxonomy?.importance === ContentImportance.CRITICAL));

  const technicalDeck = generateTechnicalDeck(sampleSlides);
  test('generateTechnicalDeck', technicalDeck.every(s => s.taxonomy?.contentTypes?.includes(ContentType.TECHNICAL)));

  const dataDeck = generateDataDeck(sampleSlides);
  test('generateDataDeck', dataDeck.every(s => s.taxonomy?.contentTypes?.includes(ContentType.DATA_METRICS)));

  const narrativeDeck = generateNarrativeDeck(sampleSlides);
  test('generateNarrativeDeck', narrativeDeck.every(s => s.taxonomy?.contentTypes?.includes(ContentType.NARRATIVE)));

  // ====== ANALYSIS ======
  console.log('\n--- ANALYSIS FUNCTIONS ---');

  const distPrimary = analyzeDistributionByPrimary(sampleSlides);
  test('analyzeDistributionByPrimary', distPrimary[SlideCategoryPrimary.SOLUTION] === 2);

  const distContent = analyzeDistributionByContentType(sampleSlides);
  test('analyzeDistributionByContentType', distContent[ContentType.DATA_METRICS] !== undefined);

  const distImportance = analyzeDistributionByImportance(sampleSlides);
  test('analyzeDistributionByImportance', distImportance[ContentImportance.CRITICAL] === 5);

  const distInvestor = analyzeDistributionByInvestor(sampleSlides);
  test('analyzeDistributionByInvestor', distInvestor[InvestorLevel.ALL] !== undefined);

  const totalDuration = calculateTotalDuration(sampleSlides);
  const expectedDuration = 30 + 120 + 180 + 240 + 180 + 120 + 60 + 150;
  test('calculateTotalDuration', totalDuration === expectedDuration, `Expected ${expectedDuration}, got ${totalDuration}`);

  const avgDuration = calculateAverageSlideDuration(sampleSlides);
  test('calculateAverageSlideDuration', avgDuration === expectedDuration / sampleSlides.length);

  const gaps = findContentGaps(sampleSlides);
  test('findContentGaps', gaps.length === 0, `Found gaps: ${gaps.join(', ')}`);

  // ====== VALIDATION ======
  console.log('\n--- VALIDATION FUNCTIONS ---');

  const validation = validateDeckCompleteness(sampleSlides);
  test('validateDeckCompleteness (complete)', validation.isComplete && validation.gaps.length === 0);
  test('validateDeckCompleteness (stats)', validation.stats.totalSlides === 8);

  const incompleteSlides = sampleSlides.filter(s => s.taxonomy?.primary !== SlideCategoryPrimary.CTA);
  const incompleteValidation = validateDeckCompleteness(incompleteSlides);
  test('validateDeckCompleteness (incomplete)', !incompleteValidation.isComplete && incompleteValidation.gaps.length > 0);

  const investorValidation = validateInvestorDeckCompleteness(sampleSlides, InvestorLevel.VC);
  test('validateInvestorDeckCompleteness', investorValidation.isComplete === true);

  // ====== RECOMMENDATIONS ======
  console.log('\n--- RECOMMENDATION FUNCTIONS ---');

  const current = sampleSlides.find(s => s.id === 'hook-1')!;
  const nextSlide = getNextSlideRecommendation(sampleSlides, current);
  test('getNextSlideRecommendation', nextSlide?.id === 'positioning-1');

  const current2 = sampleSlides.find(s => s.id === 'solution-1')!;
  const prevSlide = getPreviousSlideRecommendation(sampleSlides, current2);
  test('getPreviousSlideRecommendation', prevSlide?.id === 'foundation-1');

  const relatedSlides = findRelatedSlides(sampleSlides, current, 3);
  test('findRelatedSlides', relatedSlides.length > 0 && relatedSlides.every(s => s.id !== 'hook-1'));

  // ====== UI HELPERS ======
  console.log('\n--- UI HELPER FUNCTIONS ---');

  const primaries = getAllPrimaryCategories(sampleSlides);
  test('getAllPrimaryCategories', primaries.includes(SlideCategoryPrimary.SOLUTION));

  const secondaries = getAllSecondaryCategories(sampleSlides);
  test('getAllSecondaryCategories', secondaries.length > 0);

  const contentTypes = getAllContentTypes(sampleSlides);
  test('getAllContentTypes', contentTypes.includes(ContentType.NARRATIVE));

  const investorLevels = getAllInvestorLevels(sampleSlides);
  test('getAllInvestorLevels', investorLevels.includes(InvestorLevel.ALL));

  const displayModes = getAllDisplayModes(sampleSlides);
  test('getAllDisplayModes', displayModes.includes(DisplayMode.FULL));

  // ====== VARIANT SYSTEM ======
  console.log('\n--- DECK VARIANT SYSTEM ---');

  test('DECK_VARIANTS.ANGEL_PITCH exists', DECK_VARIANTS.ANGEL_PITCH !== undefined);
  test('DECK_VARIANTS.VC_DEEP_DIVE exists', DECK_VARIANTS.VC_DEEP_DIVE !== undefined);
  test('DECK_VARIANTS.TECHNICAL_REVIEW exists', DECK_VARIANTS.TECHNICAL_REVIEW !== undefined);
  test('DECK_VARIANTS.EXECUTIVE_SUMMARY exists', DECK_VARIANTS.EXECUTIVE_SUMMARY !== undefined);

  const angelVariant = generateDeckVariant(sampleSlides, DECK_VARIANTS.ANGEL_PITCH);
  test('generateDeckVariant (ANGEL_PITCH)', angelVariant.length > 0);

  const execVariant = generateDeckVariant(sampleSlides, DECK_VARIANTS.EXECUTIVE_SUMMARY);
  test('generateDeckVariant (EXECUTIVE_SUMMARY)', execVariant.every(s => s.taxonomy?.importance === ContentImportance.CRITICAL));

  const variantPerf = analyzeVariantPerformance(sampleSlides, DECK_VARIANTS.ANGEL_PITCH, angelVariant);
  test('analyzeVariantPerformance', variantPerf.confidenceScore >= 0 && variantPerf.confidenceScore <= 1);

  const allVariants = evaluateAllVariants(sampleSlides);
  test('evaluateAllVariants', allVariants.length > 5, `Expected >5 variants, got ${allVariants.length}`);

  const bestVariants = recommendBestVariants(sampleSlides, 3);
  test('recommendBestVariants', bestVariants.length <= 3 && bestVariants.length > 0);

  // Verify descending order
  let variantOrderCorrect = true;
  for (let i = 0; i < bestVariants.length - 1; i++) {
    if (bestVariants[i].confidenceScore < bestVariants[i + 1].confidenceScore) {
      variantOrderCorrect = false;
      break;
    }
  }
  test('recommendBestVariants (ordered correctly)', variantOrderCorrect);

  // ====== SUMMARY ======
  console.log('\n====================================================');
  console.log('RESULTS');
  console.log('====================================================');
  console.log(`Passed: ${passCount}`);
  console.log(`Failed: ${failCount}`);
  console.log(`Total:  ${passCount + failCount}`);
  console.log(`Success Rate: ${((passCount / (passCount + failCount)) * 100).toFixed(1)}%`);
  console.log('====================================================\n');

  // Return exit code based on results
  return failCount === 0 ? undefined : process.exit(1);
}

// Run validation if this is the main module
if (require.main === module) {
  runValidation();
}

export default runValidation;
