/**
 * General-Purpose Business Vertical Configuration Types
 *
 * Abstracted from FAA Part 108 config to support multiple business verticals:
 * - Autonomous Watercraft / Maritime Systems
 * - Surveillance Systems / Security Operations
 * - Advanced Manufacturing / Rapid CAD-to-Delivery
 * - AI/ML for Defense Applications
 * - Cybersecurity for Critical Infrastructure
 * - Plus any future verticals
 *
 * This schema captures:
 * - Regulatory requirements and compliance timelines
 * - Personnel licensing and credentialing needs
 * - Expertise umbrellas (hiring roadmap)
 * - Grant eligibility and funding opportunities
 * - Market analysis and competitive landscape
 * - Budget estimates and ROI analysis
 * - Source citations for all factual claims
 */

/**
 * Phase Definition - Configurable by vertical
 * Each vertical can have 3-8 phases depending on complexity
 */
export type BusinessPhaseId = string; // e.g., 'phase-1-foundation', 'phase-regulatory-approval'

export interface BusinessPhase {
  id: BusinessPhaseId;
  name: string;
  timeline: string; // e.g., "Q1 2026 (3 months)", "6-12 months"
  description: string;
  importance: number; // 1 = most important, higher numbers = less critical
  industryContext?: string; // e.g., "pre-rule", "certification", "operations", "commercialization"
}

/**
 * Skill Certification and Licensing Requirements
 */
export interface Certification {
  name: string;
  issuingBody: string; // e.g., "BICSI", "ASIS", "ASTM"
  renewalPeriod?: string; // e.g., "3 years"
  cost?: string; // e.g., "$2,500-5,000"
  url?: string;
  description?: string;
}

export interface License {
  name: string;
  jurisdiction: 'federal' | 'state' | 'local' | 'international';
  issuingAuthority: string; // e.g., "FAA", "USCG", "State Board"
  requirements: string[]; // e.g., ["Age 16+", "English proficiency", "Background check"]
  renewalPeriod?: string;
  cost?: string;
  timeline?: string; // e.g., "6-12 months"
  url?: string;
}

/**
 * Expertise Skill Definition - Enhanced with hiring context
 */
export type SkillCriticality = 'critical' | 'important' | 'support';
export type FounderSuitability = 'founder-fillable' | 'must-hire' | 'co-founder-ideal';

export interface ExpertiseSkill {
  id: string;
  name: string;
  yearsRequired: string; // e.g., "5-7 years", "10+ years"
  requiredPhases: BusinessPhaseId[];
  criticality: SkillCriticality;
  description: string;
  validationQuestions: string[]; // Interview questions to assess this skill
  redFlags?: string[]; // Warning signs of inadequate expertise

  // NEW: Founder suitability and hiring context
  founderSuitability: FounderSuitability;
  governmentCredentialRequired: boolean;
  requiredBackground: {
    type: 'government' | 'private-sector' | 'academic' | 'any';
    examples: string[]; // e.g., ["Former FAA inspector", "Navy engineer"]
  };
  substitutionPossible: boolean; // Can consultants/advisors substitute for FTE?
  substitutionStrategy?: string; // How to structure consultant relationship

  // Credentialing path for founder (if applicable)
  credentialingTimeline?: string; // e.g., "6 months for Part 107"
  credentialingCost?: string; // e.g., "$5,000-10,000"

  // Certifications and licenses required
  certifications?: Certification[];
  licenses?: License[];
}

/**
 * Expertise Umbrella - Hiring roadmap for one domain
 */
export interface SupportingHire {
  phase: BusinessPhaseId;
  title: string;
  purpose: string;
  fte?: string; // e.g., "1", "0.5-1", "2-3"
  description?: string;
}

export interface ExpertiseUmbrella {
  id: string;
  name: string;
  codeName?: string; // For pitch deck reference (e.g., "The Gatekeeper")
  covers: string; // High-level description of what this umbrella covers
  coreResponsibilities: string[];

  // Skills required
  requiredSkills: ExpertiseSkill[];

  // Hiring roadmap by phase
  supportingHires: SupportingHire[];

  // Budget in thousands of dollars
  budgetRange: {
    min: number;
    max: number;
    byPhase?: Record<BusinessPhaseId, { min: number; max: number }>;
  };

  // Strategic decisions within this umbrella
  keyStrategicDecisions: string[];
}

/**
 * Budget Estimation - All costs in thousands
 */
export interface BudgetRange {
  min: number;
  max: number;
  description?: string;
}

export interface CapitalRequirements {
  total: BudgetRange;
  byPhase: Record<BusinessPhaseId, BudgetRange>;
  byCategory?: {
    hiring: BudgetRange;
    infrastructure: BudgetRange;
    equipment: BudgetRange;
    certification: BudgetRange;
    other: BudgetRange;
  };
}

/**
 * Unit Economics
 */
export type CapitalIntensity = 'low' | 'medium' | 'high';

export interface UnitEconomics {
  grossMargin?: string; // e.g., "60-70%"
  capitalIntensity: CapitalIntensity;
  timeToRevenue: string; // e.g., "6-12 months", "18-24 months"
  description?: string;
}

/**
 * Revenue Models
 */
export interface RevenueModel {
  type: string; // e.g., "SaaS", "Hardware Sales", "Services", "Licensing"
  description: string;
  estimatedArpu?: string; // Average Revenue Per User
  scalability: 'linear' | 'sublinear' | 'superlinear';
}

/**
 * Main Business Vertical Configuration
 * Combines all aspects of a business vertical into one comprehensive config
 */
export interface BusinessVerticalConfig {
  id: string;
  name: string;
  description: string;
  lastUpdated: string;
  industry: string;

  // Regulatory and compliance
  regulatoryFramework?: unknown;

  // Business model and economics
  revenueModels?: RevenueModel[];
  unitEconomics?: UnitEconomics;

  // Market analysis
  marketOpportunity?: unknown;
  timeToRevenue?: {
    min: number;
    max: number;
  };
  marketAnalysis?: unknown;

  // Organizational structure and hiring
  phases: BusinessPhase[];
  expertiseUmbrellas: unknown[];

  // Financial planning
  capitalRequirements?: CapitalRequirements;
  grantOpportunities?: unknown[];

  // Strategic context
  keyRisks?: string[];
  competitiveAdvantages?: string[];
  exitStrategy?: string[];

  // Sources and citations
  sources?: unknown;

  // Additional flexible properties
  [key: string]: unknown;
}
