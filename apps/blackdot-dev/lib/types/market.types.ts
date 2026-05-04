/**
 * Market Analysis Types
 *
 * Standardized market analysis structure for all business verticals
 * Includes TAM/SAM/SOM analysis, competitive landscape, trends, and forecasts
 */

import { SourceCitation, SourcedMarketData } from './sources.types';

/**
 * Market Size & Forecast
 */
export interface MarketSizeData {
  year: number;
  value: string; // e.g., "$163 billion"
  unit: 'billions' | 'millions' | 'thousands';
  currency: string; // e.g., "USD"
  geography: string; // e.g., "Global", "U.S."
  sources: SourceCitation[];
}

/**
 * Total Addressable Market
 */
export interface TotalAddressableMarket {
  currentSize: MarketSizeData;
  forecastedSize?: {
    year: number;
    value: string;
    unit: 'billions' | 'millions';
  };
  growthRate: string; // e.g., "14-15% CAGR"
  geography: string; // Global, U.S., Regional
  description?: string;
  sources: SourceCitation[];
}

/**
 * Serviceable Addressable Market - Segment we can serve
 */
export interface ServiceableAddressableMarket {
  percentOfTAM: string; // e.g., "5-10%"
  value: string; // e.g., "$8-15 billion"
  description: string;
  segments: Array<{
    name: string;
    size?: string;
    growth?: string;
  }>;
  sources: SourceCitation[];
}

/**
 * Serviceable Obtainable Market - What we can realistically capture
 */
export interface ServiceableObtainableMarket {
  conservativeCase: {
    year: number;
    percentage: string; // e.g., "0.5% of SAM"
    absoluteValue: string; // e.g., "$40-75M annual revenue"
  };
  realisticCase: {
    year: number;
    percentage: string;
    absoluteValue: string;
  };
  optimisticCase: {
    year: number;
    percentage: string;
    absoluteValue: string;
  };
  sources: SourceCitation[];
}

/**
 * Market Segment
 */
export interface MarketSegment {
  name: string;
  description: string;
  size?: string;
  growthRate?: string;
  characteristics: string[];
  targetability: 'easy' | 'moderate' | 'difficult';
  attractiveness: number; // 1-10 scale
  sources?: SourceCitation[];
}

/**
 * Competitor - Real or potential
 */
export interface Competitor {
  id: string;
  name: string;
  type: 'direct' | 'indirect' | 'emerging';
  description: string;
  estimatedMarketShare?: string;
  strengths: string[];
  weaknesses: string[];
  productOffering: string;
  pricing?: string;
  fundingRaised?: string;
  notableFeatures?: string[];
  sources?: SourceCitation[];
}

/**
 * Competitive Landscape
 */
export interface CompetitiveLandscape {
  directCompetitors: Competitor[];
  indirectCompetitors: Competitor[];
  emergingCompetitors?: Competitor[];
  fragmentationLevel: 'highly-fragmented' | 'moderately-fragmented' | 'consolidated';
  competitorCount?: string; // e.g., "20-30 major players"
  marketConcentration?: string; // e.g., "Top 5 control 60% of market"
  sources: SourceCitation[];
}

/**
 * Market Driver
 */
export interface MarketDriver {
  category: 'regulatory' | 'technological' | 'economic' | 'social' | 'environmental';
  driver: string;
  impact: 'high' | 'medium' | 'low';
  timeline: string; // e.g., "2026-2028"
  description?: string;
}

/**
 * Market Barrier
 */
export interface MarketBarrier {
  type: 'regulatory' | 'financial' | 'technical' | 'competitive' | 'market-education';
  barrier: string;
  severity: 'high' | 'medium' | 'low';
  description?: string;
  workaround?: string;
  timeToOvercome?: string;
}

/**
 * Market Opportunity
 */
export interface MarketOpportunity {
  // TAM/SAM/SOM
  tam: TotalAddressableMarket;
  sam: ServiceableAddressableMarket;
  som: ServiceableObtainableMarket;

  // Segmentation
  segments: MarketSegment[];

  // Competition
  competitiveLandscape: CompetitiveLandscape;

  // Market dynamics
  drivers: {
    regulatory: MarketDriver[];
    technological: MarketDriver[];
    economic: MarketDriver[];
    other?: MarketDriver[];
    sources: SourceCitation[];
  };

  barriers: {
    regulatory: MarketBarrier[];
    financial: MarketBarrier[];
    technical: MarketBarrier[];
    competitive: MarketBarrier[];
    sources: SourceCitation[];
  };

  // Trends
  trends: string[];
  trendsSource: SourceCitation[];

  // Customer needs
  primaryCustomerNeeds: string[];
  paymentWillingness: string; // e.g., "High - critical pain point"
  procurementTimeline?: string; // e.g., "3-6 months for government", "2-4 weeks for commercial"

  // Pricing insights
  pricingSensitivity: string; // e.g., "Low - mission-critical", "High - commoditized"
  typicalPricingModels: string[]; // e.g., ["Per-unit", "Subscription", "Service fees"]

  // Risk factors
  marketRisks: string[];

  // Opportunities (specific to our vertical)
  specificOpportunities: string[];
}

/**
 * Revenue Model
 */
export interface RevenueModelDetail {
  type: string; // e.g., "Hardware Sales", "Recurring Services", "Licensing"
  description: string;
  unitEconomics?: {
    arpu: string; // Average Revenue Per User
    grossMargin: string;
    customerAcquisitionCost?: string;
    lifetimeValue?: string;
  };
  scalability: 'linear' | 'sublinear' | 'superlinear';
  marketApplicability: string; // How much of market uses this model
  examples?: string[];
  sources?: SourceCitation[];
}

/**
 * Customer Profile
 */
export interface CustomerProfile {
  segment: string;
  description: string;
  typicalCompany?: string; // e.g., "Mid-market logistics company"
  decisionMaker: string; // Who buys
  needsExpression: string; // How they express the need
  buyingCycle: string; // e.g., "3-6 months"
  budgetCycle?: string;
  painPoints: string[];
  successMetrics: string[];
  estimatedAnnualBudget?: string;
  sources?: SourceCitation[];
}

/**
 * Market Entry Strategy
 */
export interface MarketEntryStrategy {
  targetSegment: MarketSegment;
  rationale: string;
  customerAcquisitionApproach: string;
  partnershipOpportunities?: string[];
  geographicFocus?: string;
  timeline: string;
  successFactors: string[];
  risks: string[];
}

/**
 * Market Forecast
 */
export interface MarketForecast {
  vertical: string;
  currentYear: number;

  // Year-by-year forecast
  forecast: Array<{
    year: number;
    tamValue: string;
    tamGrowth: string; // e.g., "+14%"
    samValue?: string;
    somValue?: string;
    keyAssumptions?: string[];
  }>;

  // Confidence
  confidenceLevel: 'high' | 'medium' | 'low';
  methodologyNotes: string;
  keyUncertainties: string[];
  sources: SourceCitation[];
}

/**
 * Competitive Advantage
 */
export interface CompetitiveAdvantage {
  type: 'technology' | 'regulatory' | 'capital' | 'talent' | 'partnerships' | 'first-mover';
  advantage: string;
  defensibility: 'high' | 'medium' | 'low';
  durationEstimate: string; // e.g., "3-5 years"
  description?: string;
  how_to_build: string[];
}

/**
 * Market Summary - High-level overview
 */
export interface MarketSummary {
  vertical: string;
  description: string;

  // Quick metrics
  tam: string; // e.g., "$163B by 2032"
  growth: string; // e.g., "14-15% CAGR"
  timeline: string; // Investment horizon
  maturity: 'emerging' | 'growing' | 'mature';

  // Key characteristics
  keyCharacteristics: string[];
  mainCustomers: string[];
  driversOfDemand: string[];

  // Opportunities
  opportunitiesForNewEntrants: string[];
  barriersToEntry: string[];

  // Risks
  risks: string[];

  // Outlook
  outlook: string; // 2-3 sentence summary

  sources: SourceCitation[];
}
