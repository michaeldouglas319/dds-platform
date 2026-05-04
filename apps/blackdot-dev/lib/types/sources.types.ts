/**
 * Source Citation System
 *
 * Comprehensive source tracking for all claims in business vertical configs.
 * CRITICAL: Every factual claim must have at least one source citation.
 *
 * This system ensures:
 * - Factual accuracy and verifiability
 * - Proper attribution to original sources
 * - Tracking of source quality and reliability
 * - Easy citation format for documentation and presentations
 * - Built-in quality checking for research completeness
 */

/**
 * Source Citation - Complete metadata for any source
 */
export type SourceType =
  | 'regulation' // Official government regulations (FAA, USCG, etc.)
  | 'government-site' // Official government websites/documentation
  | 'market-report' // Market research reports (Grand View Research, etc.)
  | 'news' // News articles, press releases
  | 'academic' // Academic papers, research
  | 'industry' // Industry analysis, trade publications
  | 'company-site' // Company websites
  | 'certification-body' // Certification issuers (BICSI, ASIS, etc.)
  | 'other';

export type SourceReliability = 'primary' | 'secondary' | 'tertiary';

export interface SourceCitation {
  id: string; // e.g., "source-1", "source-faa-part-108", "source-market-2026"
  title: string; // Title of source document
  url: string; // Full URL to source
  publisher: string; // e.g., "FAA", "USCG", "Grand View Research", "SBIR.gov"
  publishedDate?: string; // ISO date or "January 2026" or "2025-08-07"
  accessedDate: string; // ISO date when we accessed it
  type: SourceType;

  // Source quality assessment
  reliability: SourceReliability;
  // primary = official source (government regulations, company official site)
  // secondary = reputable third-party analysis (market research, industry analysis)
  // tertiary = aggregated/interpreted content (news, blogs, summaries)

  // Content reference
  excerpt?: string; // Relevant quote or excerpt from source
  pageNumber?: number; // If applicable
  searchText?: string; // Text we searched for to find this

  // Quality flags
  isArchived?: boolean; // True if we had to use archive.org
  isDeadLink?: boolean; // True if URL is no longer valid
  archivedUrl?: string; // Archive.org URL if needed
}

/**
 * Source Collection by Category
 * Organize all sources for a vertical by category
 */
export interface VerticalSources {
  regulatory: SourceCitation[]; // Regulatory requirements and compliance docs
  market: SourceCitation[]; // Market size, growth, competitive landscape
  licensing: SourceCitation[]; // Personnel requirements, certifications
  grants: SourceCitation[]; // SBIR/STTR programs, funding
  industry: SourceCitation[]; // Industry analysis, trends, benchmarks
  competitive: SourceCitation[]; // Competitor analysis, market positioning
  technical: SourceCitation[]; // Technical standards, specifications
  financial: SourceCitation[]; // Budget data, cost benchmarks
  other: SourceCitation[]; // Miscellaneous sources
}

/**
 * Research Quality Report - Verify source completeness
 */
export interface ResearchQualityReport {
  vertical: string;
  lastUpdated: string; // ISO date when sources were last verified
  totalSources: number;
  averageReliability: 'high' | 'medium' | 'low';
  reliabilityBreakdown: {
    primary: number;
    secondary: number;
    tertiary: number;
  };

  // Gaps and warnings
  incompleteSections: string[]; // Sections missing source citations
  deadLinks: SourceCitation[];
  outdatedSources: SourceCitation[]; // Sources older than 2 years

  // Quality score (0-100)
  completenessScore: number; // Percentage of claims with sources
  reliabilityScore: number; // Based on reliability distribution
  freshnessScore: number; // Based on publication dates

  // Recommendations
  recommendations: string[];
}

/**
 * Claim with Source - Associate claims with citations
 */
export interface SourcedClaim {
  claim: string; // The factual claim being made
  sources: SourceCitation[]; // References supporting this claim
  confidence: 'high' | 'medium' | 'low'; // Confidence level of claim
  notes?: string; // Additional context
}

/**
 * Market Data Point - With source
 */
export interface SourcedMarketData {
  metric: string; // e.g., "TAM", "CAGR", "Market Size 2026"
  value: string; // e.g., "$163 billion", "14% growth", "2.5M units"
  unit?: string; // e.g., "USD", "%", "units"
  geography: string; // e.g., "Global", "U.S.", "APAC"
  year?: number; // Year the data is for
  source: SourceCitation;
  confidence: 'high' | 'medium' | 'low';
  notes?: string;
}

/**
 * Budget Estimate - With justification
 */
export interface JustifiedBudgetEstimate {
  category: string; // e.g., "Regulatory Lead Salary"
  min: number;
  max: number;
  unit: 'thousands' | 'millions';
  basis: string; // e.g., "Market rate for FAA cert lead", "Industry benchmark"
  sources: SourceCitation[];
  assumptions: string[];
}

/**
 * Source Search Record - Track our research process
 */
export interface SourceSearchRecord {
  id: string;
  vertical: string;
  date: string; // ISO date when search performed
  searchQuery: string;
  searchTool: 'google' | 'bing' | 'manual' | 'sbir.gov' | 'other';
  resultCount: number;
  sourcesFound: number;
  citationsCreated: string[]; // Source citation IDs created from this search
  notes?: string;
}
