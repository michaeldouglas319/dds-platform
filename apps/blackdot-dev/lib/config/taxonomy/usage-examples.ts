/**
 * Pitch Deck Taxonomy - Usage Examples
 * ====================================
 * Practical examples of how to use the taxonomy system in real code
 *
 * Location: /lib/config/taxonomy/usage-examples.ts
 * Status: Reference implementation
 */

import {
  SlideCategoryPrimary,
  SlideCategorySecondary,
  ContentType,
  DisplayMode,
  InvestorLevel,
  ContentImportance,
  SectionCategory,
  type SlideTaxonomy
} from './slide-taxonomy';

import {
  getRecommendedContentTypes,
  getVisibleSections,
  getImportanceForInvestor,
  getPrimaryDisplayName,
  getTypicalDuration,
  generateInvestorDeck
} from './index';

// ============================================================================
// EXAMPLE 1: Map Current Slide to Taxonomy
// ============================================================================

/**
 * Current slide from ideasPitchDeckSections:
 * {
 *   id: 'pitch-cover',
 *   title: 'AI-Orchestrated Sovereign Drone Manufacturing & Ecosystem',
 *   ...
 * }
 *
 * How to classify it:
 */
export const EXAMPLE_SLIDE_1_TAXONOMY: SlideTaxonomy = {
  primary: SlideCategoryPrimary.HOOK,
  secondary: SlideCategorySecondary.HOOK_NARRATIVE,
  contentTypes: [ContentType.NARRATIVE, ContentType.STRATEGIC],
  sectionCategories: [SectionCategory.HERO, SectionCategory.CALLOUT],
  displayMode: DisplayMode.HEADLINE_ONLY,
  investorLevel: InvestorLevel.ALL,
  importance: ContentImportance.CRITICAL,
  narrativeFunction: 'hook' as any // NarrativeFunction.HOOK
};

// ============================================================================
// EXAMPLE 2: Recommend Content Types for a Slide
// ============================================================================

export function example2_getRecommendedContentForSlide() {
  const primary = SlideCategoryPrimary.VALIDATION;

  // Get what content types are typically used for VALIDATION slides
  const recommended = getRecommendedContentTypes(primary);

  console.log('For VALIDATION slides, recommended content types:', recommended);
  // Output: [ContentType.DATA_METRICS, ContentType.PEOPLE, ContentType.REGULATORY]

  return recommended;
}

// ============================================================================
// EXAMPLE 3: Filter Sections by Display Mode
// ============================================================================

export function example3_filterByDisplayMode() {
  const mode = DisplayMode.SUMMARY;

  // What sections should be visible in SUMMARY mode?
  const visibleSections = getVisibleSections(mode);

  console.log('Visible sections in SUMMARY mode:', visibleSections);
  // Output: [SectionCategory.HERO, SectionCategory.SUPPORTING, SectionCategory.CALLOUT, SectionCategory.PROOF]

  // Use this to render only these sections in the UI
  return visibleSections;
}

// ============================================================================
// EXAMPLE 4: Get Investor-Specific Importance
// ============================================================================

export function example4_getImportanceForInvestor() {
  const primary = SlideCategoryPrimary.SOLUTION;
  const investor = InvestorLevel.STRATEGIC;

  const importance = getImportanceForInvestor(primary, investor);

  console.log(`SOLUTION slides are ${importance} for ${investor} investors`);
  // Output: "SOLUTION slides are critical for strategic investors"

  return importance;
}

// ============================================================================
// EXAMPLE 5: Build VC-Optimized Deck
// ============================================================================

interface SlideWithTaxonomy {
  id: string;
  title: string;
  taxonomy: SlideTaxonomy;
}

export function example5_buildVCDeck(allSlides: SlideWithTaxonomy[]): SlideWithTaxonomy[] {
  // Get VCs' preferred ordering
  const vcDeck = generateInvestorDeck(allSlides, InvestorLevel.VC);

  console.log('VC deck has', vcDeck.length, 'slides');
  console.log('Slide order:', vcDeck.map(s => `${s.id} (${s.taxonomy.primary})`).join(' → '));

  return vcDeck;
}

// ============================================================================
// EXAMPLE 6: Filter Data-Heavy Slides
// ============================================================================

export function example6_findDataSlides(slides: SlideWithTaxonomy[]): SlideWithTaxonomy[] {
  const dataSlides = slides.filter(slide => {
    const hasDataContent = slide.taxonomy.contentTypes?.includes(ContentType.DATA_METRICS);
    return hasDataContent;
  });

  console.log('Data-heavy slides:', dataSlides.map(s => s.id).join(', '));
  // Example output: "Data-heavy slides: pitch-market, pitch-roadmap, pitch-financials"

  return dataSlides;
}

// ============================================================================
// EXAMPLE 7: Suggest Next Slide
// ============================================================================

export function example7_suggestNextSlide(
  currentSlide: SlideWithTaxonomy,
  allSlides: SlideWithTaxonomy[]
): SlideWithTaxonomy | null {
  const order: SlideCategoryPrimary[] = [
    SlideCategoryPrimary.HOOK,
    SlideCategoryPrimary.POSITIONING,
    SlideCategoryPrimary.FOUNDATION,
    SlideCategoryPrimary.SOLUTION,
    SlideCategoryPrimary.VALIDATION,
    SlideCategoryPrimary.CTA
  ];

  const currentOrder = order.indexOf(currentSlide.taxonomy.primary);
  const nextOrder = currentOrder + 1;

  if (nextOrder >= order.length) return null;

  const nextSlide = allSlides.find(
    s => s.taxonomy.primary === order[nextOrder]
  );

  console.log(`Current: ${currentSlide.taxonomy.primary}, Next: ${nextSlide?.taxonomy.primary}`);
  return nextSlide || null;
}

// ============================================================================
// EXAMPLE 8: Generate Speaker Notes Based on Taxonomy
// ============================================================================

export function example8_generateSpeakerNotes(slide: SlideWithTaxonomy): string {
  const meta = require('./slide-taxonomy').SLIDE_CATEGORY_METADATA[slide.taxonomy.primary];
  const duration = getTypicalDuration(slide.taxonomy.primary);
  const display = getPrimaryDisplayName(slide.taxonomy.primary);

  return `
Slide: ${slide.title}
Type: ${display}
Duration: ${duration} seconds
Content Types: ${slide.taxonomy.contentTypes?.join(', ') || 'None'}

Key Points to Cover:
- Main hook: [HERO section - 1-2 lines]
- Supporting evidence: [SUPPORTING section - 3-5 lines]
${duration > 180 ? '- Deep dive: [DEEP_DIVE section - optional]' : ''}

Investor Notes:
- Angel importance: ${getImportanceForInvestor(slide.taxonomy.primary, InvestorLevel.ANGEL)}
- VC importance: ${getImportanceForInvestor(slide.taxonomy.primary, InvestorLevel.VC)}
- Strategic importance: ${getImportanceForInvestor(slide.taxonomy.primary, InvestorLevel.STRATEGIC)}
`;
}

// ============================================================================
// EXAMPLE 9: Validate Slide Taxonomy
// ============================================================================

import { isValidSecondaryCategory } from './slide-taxonomy';

export function example9_validateSlide(slide: SlideWithTaxonomy): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate secondary matches primary
  if (slide.taxonomy.secondary) {
    if (!isValidSecondaryCategory(slide.taxonomy.primary, slide.taxonomy.secondary)) {
      errors.push(
        `Secondary "${slide.taxonomy.secondary}" does not match primary "${slide.taxonomy.primary}"`
      );
    }
  }

  // Validate display mode is reasonable for content types
  const visibleSections = getVisibleSections(slide.taxonomy.displayMode ?? DisplayMode.FULL);
  if (visibleSections.length === 0) {
    errors.push(`Display mode "${slide.taxonomy.displayMode}" shows no sections`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// ============================================================================
// EXAMPLE 10: React Component - Display Slide with Progressive Disclosure
// ============================================================================

/**
 * This would go in a React component file
 */
export function example10_ReactComponent_Code() {
  return `
'use client';

import { SectionCategory, DisplayMode, getVisibleSections } from '@/lib/config/taxonomy';
import type { SlideTaxonomy } from '@/lib/config/taxonomy';

interface DisplayableSectionProps {
  title: string;
  category: SectionCategory;
  content: string;
  isVisible: boolean;
}

function DisplayableSection({ title, category, content, isVisible }: DisplayableSectionProps) {
  if (!isVisible) return null;

  if (category === SectionCategory.DEEP_DIVE) {
    return (
      <details className="mt-4">
        <summary className="cursor-pointer font-semibold">Advanced Details</summary>
        <div className="mt-2 pl-4">{content}</div>
      </details>
    );
  }

  return <div className="mt-2">{content}</div>;
}

interface PitchSlideProps {
  title: string;
  taxonomy: SlideTaxonomy;
  sections: Array<{ category: SectionCategory; title: string; content: string }>;
}

export function PitchSlide({ title, taxonomy, sections }: PitchSlideProps) {
  const visibleCategories = getVisibleSections(taxonomy.displayMode ?? DisplayMode.FULL);

  return (
    <div className="pitch-slide">
      <h1>{title}</h1>

      {sections.map(section => (
        <DisplayableSection
          key={section.category}
          category={section.category}
          title={section.title}
          content={section.content}
          isVisible={visibleCategories.includes(section.category)}
        />
      ))}
    </div>
  );
}
`;
}

// ============================================================================
// EXAMPLE 11: Generate Deck Variants
// ============================================================================

export function example11_generateDeckVariants(slides: SlideWithTaxonomy[]) {
  const variants = {
    fullDeck: slides,
    vcDeck: generateInvestorDeck(slides, InvestorLevel.VC),
    angelDeck: generateInvestorDeck(slides, InvestorLevel.ANGEL),
    strategicDeck: generateInvestorDeck(slides, InvestorLevel.STRATEGIC),

    headlineOnly: slides.map(s => ({
      ...s,
      displayMode: DisplayMode.HEADLINE_ONLY
    })),

    summaryDeck: slides.map(s => ({
      ...s,
      displayMode: DisplayMode.SUMMARY
    }))
  };

  console.log(`Generated deck variants:`);
  console.log(`  Full: ${variants.fullDeck.length} slides`);
  console.log(`  VC: ${variants.vcDeck.length} slides`);
  console.log(`  Angel: ${variants.angelDeck.length} slides`);
  console.log(`  Strategic: ${variants.strategicDeck.length} slides`);
  console.log(`  Headline-only: ${variants.headlineOnly.length} slides (all, just filtered display)`);
  console.log(`  Summary: ${variants.summaryDeck.length} slides (all, moderate detail)`);

  return variants;
}

// ============================================================================
// EXAMPLE 12: Build Filtering UI
// ============================================================================

export function example12_buildFilterUI_Code() {
  return `
'use client';

import { useState } from 'react';
import {
  SlideCategoryPrimary,
  ContentType,
  DisplayMode,
  InvestorLevel
} from '@/lib/config/taxonomy';
import {
  getAllEnumValues,
  getRecommendedContentTypes
} from '@/lib/config/taxonomy';

export function SlideFilterUI({ slides, onFilter }) {
  const [primary, setPrimary] = useState<SlideCategoryPrimary | null>(null);
  const [contentType, setContentType] = useState<ContentType | null>(null);
  const [displayMode, setDisplayMode] = useState<DisplayMode>(DisplayMode.FULL);
  const [investor, setInvestor] = useState<InvestorLevel>(InvestorLevel.ALL);

  const handleFilter = () => {
    let filtered = slides;

    if (primary) {
      filtered = filtered.filter(s => s.taxonomy?.primary === primary);
    }

    if (contentType) {
      filtered = filtered.filter(s =>
        s.taxonomy?.contentTypes?.includes(contentType)
      );
    }

    onFilter(filtered);
  };

  const recommendedContentTypes = primary
    ? getRecommendedContentTypes(primary)
    : [];

  return (
    <div className="filter-ui space-y-4">
      <select
        value={primary || ''}
        onChange={e => setPrimary(e.target.value as SlideCategoryPrimary)}
      >
        <option value="">All Primary Categories</option>
        {getAllEnumValues('primary').map(p => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      <select
        value={contentType || ''}
        onChange={e => setContentType(e.target.value as ContentType)}
      >
        <option value="">All Content Types</option>
        {(recommendedContentTypes.length > 0 ? recommendedContentTypes : getAllEnumValues('contentType')).map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select
        value={displayMode}
        onChange={e => setDisplayMode(e.target.value as DisplayMode)}
      >
        {getAllEnumValues('displayMode').map(d => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      <select
        value={investor}
        onChange={e => setInvestor(e.target.value as InvestorLevel)}
      >
        {getAllEnumValues('investor').map(i => (
          <option key={i} value={i}>{i}</option>
        ))}
      </select>

      <button onClick={handleFilter}>Apply Filters</button>
    </div>
  );
}
`;
}

// ============================================================================
// EXAMPLE 13: Analytics / Metrics
// ============================================================================

export function example13_analyzeSlideDistribution(slides: SlideWithTaxonomy[]) {
  const analysis = {
    byPrimary: {} as Record<SlideCategoryPrimary, number>,
    byContentType: {} as Record<ContentType, number>,
    byImportance: {} as Record<ContentImportance, number>,
    averageDuration: 0,
    totalDuration: 0
  };

  slides.forEach(slide => {
    // Count by primary
    const primary = slide.taxonomy.primary;
    analysis.byPrimary[primary] = (analysis.byPrimary[primary] || 0) + 1;

    // Count by content type
    slide.taxonomy.contentTypes?.forEach(ct => {
      analysis.byContentType[ct] = (analysis.byContentType[ct] || 0) + 1;
    });

    // Count by importance
    const importance = slide.taxonomy.importance ?? ContentImportance.MEDIUM;
    analysis.byImportance[importance] = (analysis.byImportance[importance] || 0) + 1;

    // Duration
    const duration = getTypicalDuration(primary);
    analysis.totalDuration += duration;
  });

  analysis.averageDuration = Math.round(analysis.totalDuration / slides.length);

  console.log('Slide Distribution Analysis:');
  console.log('By Primary Category:', analysis.byPrimary);
  console.log('By Content Type:', analysis.byContentType);
  console.log('By Importance:', analysis.byImportance);
  console.log(`Total Duration: ${analysis.totalDuration} seconds (~${Math.round(analysis.totalDuration / 60)} minutes)`);
  console.log(`Average per Slide: ${analysis.averageDuration} seconds`);

  return analysis;
}

// ============================================================================
// EXPORTS FOR TESTING
// ============================================================================

export const EXAMPLES = {
  example1: EXAMPLE_SLIDE_1_TAXONOMY,
  example2: example2_getRecommendedContentForSlide,
  example3: example3_filterByDisplayMode,
  example4: example4_getImportanceForInvestor,
  example5: example5_buildVCDeck,
  example6: example6_findDataSlides,
  example7: example7_suggestNextSlide,
  example8: example8_generateSpeakerNotes,
  example9: example9_validateSlide,
  example11: example11_generateDeckVariants,
  example13: example13_analyzeSlideDistribution
};
