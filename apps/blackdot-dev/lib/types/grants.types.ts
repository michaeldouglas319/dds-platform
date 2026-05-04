/**
 * Government Grants & Funding Opportunities
 *
 * Tracks SBIR/STTR programs, agency grants, and other funding opportunities
 * for each business vertical.
 */

import { SourceCitation } from './sources.types';

export type GrantProgram = 'SBIR' | 'STTR' | 'DARPA' | 'NSF' | 'DOE' | 'DoD' | 'NASA' | 'USDA' | 'DHS' | 'Other';
export type GrantPhase = 'Phase I' | 'Phase II' | 'Phase III' | 'Other';
export type GrantStatus = 'active' | 'expired' | 'pending-reauth' | 'closed' | 'upcoming';

/**
 * Grant Award - Single award tier in a grant program
 */
export interface GrantAward {
  phase: GrantPhase;
  minAmount: number; // in thousands
  maxAmount: number;
  description: string; // e.g., "Proof of concept and feasibility validation"
  typicalTimeline: string; // e.g., "6-12 months"
  successRate?: string; // e.g., "15-20%"
}

/**
 * Grant Opportunity - A specific grant program
 */
export interface GrantOpportunity {
  id: string;
  program: GrantProgram;
  agency: string; // e.g., "DoD", "Army", "Navy", "NSF"
  focus: string; // e.g., "Autonomous Systems", "Advanced Manufacturing"
  shortDescription: string;

  // Eligibility
  eligibility: {
    requirements: string[]; // e.g., ["U.S. company", "Small business (<500 employees)", "For-profit"]
    exclusions?: string[]; // e.g., ["Universities", "Non-profits"]
    foreignOwnershipLimit?: string; // e.g., "No more than 25%"
  };

  // Awards available
  awards: GrantAward[];

  // Timeline
  nextDeadline?: string; // ISO date of next deadline
  deadlines: Array<{
    phase: GrantPhase;
    date: string; // ISO date
    description?: string;
  }>;

  // Status
  status: GrantStatus;
  statusNotes?: string; // e.g., "Expired Sept 2025, pending reauth for 2026"

  // Application requirements
  applicationRequirements: string[];

  // Funding constraints
  fundingConstraints: {
    canFundSalaries: boolean;
    canFundEquipment: boolean;
    canFundRD: boolean;
    canFundMarketing: boolean;
    salaryLimits?: string; // e.g., "Executive salaries capped"
  };

  // ROI information
  typicalTimeToFunding: string; // e.g., "90 days from award"
  reportingRequirements?: string[];

  // Additional info
  minimumCompanyAge?: string; // e.g., "Less than 5 years old"
  previousAwardLimit?: string; // e.g., "Max 3 previous Phase I awards"
  coFundingRequired?: boolean;
  coFundingPercentage?: string; // e.g., "50% cost share required"

  // Contact and resources
  url: string;
  contactInfo?: {
    email?: string;
    phone?: string;
    name?: string;
  };

  // Sources
  sources: SourceCitation[];
}

/**
 * Vertical Grant Mapping
 * Maps a business vertical to eligible grant programs with scoring
 */
export interface VerticalGrantMapping {
  verticalId: string;
  verticalName: string;
  opportunities: Array<{
    opportunity: GrantOpportunity;
    relevanceScore: number; // 0-100 (how well does this grant fit?)
    estimatedFundingPerPhase: {
      phaseI: { min: number; max: number };
      phaseII: { min: number; max: number };
    };
    likelyTopics?: string[]; // e.g., ["Autonomous Systems", "AI/ML"]
    notes?: string;
  }>;

  // Summary
  totalPotentialFunding: {
    min: number; // in thousands
    max: number;
  };
  recommendedSequence: GrantOpportunity[];
  timeline: string; // e.g., "18-24 months from first application"
}

/**
 * Grant Application Checklist
 */
export interface GrantApplicationChecklist {
  grantId: string;
  grantName: string;
  phase: GrantPhase;
  deadline: string;
  checklist: Array<{
    id: string;
    item: string;
    required: boolean;
    description?: string;
    estimatedEffort: 'low' | 'medium' | 'high';
  }>;
  estimatedApplicationTime: string; // e.g., "80-120 hours"
  tips?: string[];
}

/**
 * Grant Award Forecast - Estimate potential funding
 */
export interface GrantFundingForecast {
  verticalId: string;
  year: number;
  scenario: 'conservative' | 'realistic' | 'optimistic';

  // Phase I forecasts
  phaseI: {
    applicationsPlanned: number;
    successRate: string; // e.g., "15-20%"
    expectedAwards: number;
    fundingRange: {
      min: number;
      max: number;
    };
  };

  // Phase II forecasts
  phaseII: {
    applicationsPlanned: number;
    successRate: string;
    expectedAwards: number;
    fundingRange: {
      min: number;
      max: number;
    };
  };

  // Total forecast
  totalExpectedFunding: {
    min: number;
    max: number;
  };

  // ROI analysis
  assumedRevenue: number; // Expected company revenue in same year
  grantToRevenueRatio: string; // e.g., "20% of year 1 revenue from grants"
}

/**
 * SBIR-Specific Configuration
 * SBIR is the most common program, special tracking for it
 */
export interface SBIRConfiguration {
  agencyId: string; // e.g., 'dod', 'army', 'navy', 'nasa', 'nsf'
  agencyName: string;

  // Topic areas
  topics: Array<{
    topicCode: string; // e.g., "N232-001"
    title: string;
    description: string;
    emphasis?: string;
    relevance?: 'highly-relevant' | 'relevant' | 'somewhat-relevant';
  }>;

  // Phase structure
  phases: {
    phaseI: GrantAward;
    phaseII: GrantAward;
    phaseIII?: GrantAward; // Non-SBIR commercialization funds
  };

  // Timeline for this year
  currentCycle: {
    releasedDate: string;
    deadlineDate: string;
    announcedWinnersDate?: string;
    fundedByDate?: string;
  };

  // Program status
  status: 'active' | 'expired' | 'pending-reauth';
  reauthorizationStatus?: string; // e.g., "Expired Sept 2025, awaiting Congressional reauth"

  // Resource links
  resourceLinks: {
    sbir_gov_topic_page?: string;
    agency_sbir_site?: string;
    past_awards_database?: string;
  };

  sources: SourceCitation[];
}

/**
 * Grant Strategy
 */
export interface GrantStrategy {
  verticalId: string;
  targetYear: number;

  // Goals
  goals: {
    primaryObjective: string; // e.g., "Achieve $1M in SBIR funding"
    secondaryObjectives: string[];
  };

  // Strategy
  approach: string;
  prioritizedGrants: GrantOpportunity[];
  alternateGrants?: GrantOpportunity[];

  // Resource allocation
  teamRequired: {
    grantWriter: string; // e.g., "0.5 FTE"
    technicalLead: string; // e.g., "0.2 FTE"
    cfo?: string; // e.g., "0.1 FTE"
  };

  // Timeline
  timeline: Array<{
    date: string; // ISO date
    milestone: string;
    grantId?: string;
  }>;

  // Budget impact
  budgetForGrantWriting: number; // in thousands
  estimatedROI: string; // e.g., "5:1 - Each $1 spent on applications yields $5 in funding"

  // Risk factors
  risks: string[];
  mitigations: string[];
}
