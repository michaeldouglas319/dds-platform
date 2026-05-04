/**
 * UNIFIED VERTICAL CONFIGURATION TYPES
 *
 * Universal schema for ANY business vertical (aerospace, manufacturing, medical, etc.)
 * Built from analysis of 3 existing expertise configs:
 * - Composites Manufacturing
 * - FAA Part 108 BVLOS Operations
 * - Rapid Manufacturing
 *
 * Design: Single TypeScript interface that scales to 15-20+ verticals
 * with zero schema changes needed
 *
 * Usage:
 * import { UniversalVerticalConfig } from '@/lib/types/unified-vertical.types'
 * const composites: UniversalVerticalConfig = { ... }
 */

// ============================================================================
// ENUMS & BASIC TYPES
// ============================================================================

export type VerticalDomain =
  | 'aerospace'
  | 'manufacturing'
  | 'cybersecurity'
  | 'surveillance'
  | 'medical-devices'
  | 'financial-services'
  | 'energy'
  | 'transportation'
  | 'chemical-sciences'
  | 'defense-contracting'
  | 'environmental-compliance'
  | 'other';

export type SkillCriticality = 'critical' | 'important' | 'support';
export type FounderSuitability = 'founder-fillable' | 'must-hire' | 'co-founder-ideal';
export type CapitalIntensity = 'low' | 'medium' | 'high';
export type KnowledgeEntryType =
  | 'skill'
  | 'umbrella'
  | 'phase'
  | 'market-opportunity'
  | 'regulatory-requirement'
  | 'job-role'
  | 'certification-path'
  | 'success-pattern'
  | 'risk-factor'
  | 'competitive-advantage'
  | 'implementation-guide'
  | 'case-study';

// ============================================================================
// PHASE DEFINITIONS
// ============================================================================

/**
 * Business phase (can be 3, 8, or N phases depending on vertical)
 * Examples:
 * - Composites: 3 phases (acquisition, optimization, scale)
 * - FAA: 8 phases (foundation → submission)
 * - Manufacturing: 3 phases (partnerships → MVP → scale)
 */
export interface PhaseDefinition {
  id: string;
  name: string;
  timeline: string; // e.g., "Q1 2026 (3 months)", "Months 1-6"
  description: string;
  importance: number; // 1 = critical path
  industryContext?: string; // e.g., "pre-rule", "certification", "operations"
  sequentialOrder?: number;
}

// ============================================================================
// EXPERTISE SKILL
// ============================================================================

export interface Certification {
  name: string;
  issuingBody: string; // e.g., "ISO", "FAA", "ASQ"
  renewalPeriod?: string; // e.g., "3 years"
  cost?: string; // e.g., "$5-15K"
  description?: string;
}

export interface License {
  name: string;
  jurisdiction: 'federal' | 'state' | 'local' | 'international';
  issuingAuthority: string;
  requirements: string[];
  renewalPeriod?: string;
  cost?: string;
  timeline?: string; // How long to get
}

export interface ExpertiseSkill {
  // Identity
  id: string;
  name: string;

  // Requirements
  yearsRequired: string; // e.g., "5-8 years"
  requiredPhases: string[];
  criticality: SkillCriticality;
  description: string; // 1-2 sentences

  // Assessment
  validationQuestions: string[]; // 3-5 interview questions
  redFlags?: string[];

  // Hiring context (for founder roadmap)
  founderSuitability: FounderSuitability;
  governmentCredentialRequired: boolean;
  requiredBackground: {
    type: 'government' | 'private-sector' | 'academic' | 'any';
    examples: string[];
  };

  // Substitution options
  substitutionPossible: boolean;
  substitutionStrategy?: string;

  // Credentialing path
  credentialingTimeline?: string;
  credentialingCost?: string;

  // Formal requirements
  certifications?: Certification[];
  licenses?: License[];

  // Knowledge base linkage
  knowledgeBaseSection?: string;
  learningResources?: string[];
}

// ============================================================================
// EXPERTISE UMBRELLA
// ============================================================================

export interface SupportingHire {
  phase: string;
  title: string;
  purpose: string;
  fte?: string; // "1", "0.5-1", "2-3"
  description?: string;
}

export interface ExpertiseUmbrella {
  id: string;
  name: string;
  codeName?: string; // For pitch decks: "The Gatekeeper", "The Builder"
  covers: string; // What this umbrella covers
  coreResponsibilities: string[];

  // Skills required
  requiredSkills: ExpertiseSkill[];

  // Hiring roadmap
  supportingHires: SupportingHire[];

  // Budget (in thousands USD)
  budgetRange: {
    min: number;
    max: number;
    byPhase?: Record<string, { min: number; max: number }>;
  };

  // Strategic decisions
  keyStrategicDecisions: string[];
}

// ============================================================================
// MARKET OPPORTUNITY
// ============================================================================

export interface MarketSize {
  year: number;
  value: string; // e.g., "$137 billion"
  unit: string;
  currency?: 'USD' | 'EUR' | 'GBP';
  geography?: string;
}

export interface MarketSegment {
  name: string;
  description: string;
  size: string;
  growthRate: string;
  characteristics: string[];
  targetability: 'easy' | 'moderate' | 'difficult';
  attractiveness: number; // 1-10
}

export interface MarketBarrier {
  type: 'regulatory' | 'financial' | 'technical' | 'competitive';
  barrier: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  workaround?: string;
}

export interface CompetitiveLandscape {
  directCompetitors: string[];
  indirectCompetitors: string[];
  emergingCompetitors: string[];
  fragmentationLevel: 'highly-fragmented' | 'moderately-consolidated' | 'concentrated';
  marketConcentration: string; // e.g., "Top 5 control 20%"
}

export interface MarketOpportunity {
  tam: {
    currentSize: MarketSize;
    forecastedSize: {
      year: number;
      value: string;
      unit: string;
    };
    growthRate: string;
  };

  sam: {
    percentOfTAM: string;
    value: string;
    description: string;
    segments: Array<{ name: string; size: string }>;
  };

  som: {
    conservativeCase: {
      year: number;
      percentage: string;
      absoluteValue: string;
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
  };

  segments: MarketSegment[];
  competitiveLandscape: CompetitiveLandscape;

  drivers: {
    regulatory: string[];
    technological: string[];
    economic: string[];
  };

  barriers: {
    regulatory: MarketBarrier[];
    financial: MarketBarrier[];
    technical: MarketBarrier[];
    competitive: MarketBarrier[];
  };

  trends: string[];
  primaryCustomerNeeds: string[];
  paymentWillingness: string;
  procurementTimeline: string;
  pricingSensitivity: string;
}

// ============================================================================
// REGULATORY FRAMEWORK
// ============================================================================

export interface RegulatoryRequirement {
  id: string;
  authority: 'FAA' | 'FDA' | 'EPA' | 'OSHA' | 'FCC' | 'Other';
  regulation: string;
  description: string;
  status: 'enforced' | 'pending' | 'optional' | 'recommended';
  requirements: string[];
  complianceCost: { min: number; max: number }; // Thousands
  complexityLevel: 'low' | 'medium' | 'high' | 'very-high';
  criticalMilestones: string[];
  operationalImpact: string[];
}

export interface RegulatoryFramework {
  vertical: string;
  requirements: RegulatoryRequirement[];
  totalComplianceCost: { min: number; max: number };
  overallTimeline: string;
  criticalPath: string[];
  description: string;
  keyChallenges: string[];
  opportunities: string[];
}

// ============================================================================
// FINANCIAL
// ============================================================================

export interface BudgetRange {
  min: number;
  max: number;
}

export interface CapitalRequirements {
  total: BudgetRange;
  byPhase: Record<string, BudgetRange>;
  byCategory?: {
    hiring: BudgetRange;
    infrastructure: BudgetRange;
    equipment: BudgetRange;
    certification: BudgetRange;
    other?: BudgetRange;
  };
}

export interface UnitEconomics {
  grossMargin?: string;
  capitalIntensity: CapitalIntensity;
  timeToRevenue: string;
  description?: string;
}

export interface RevenueModel {
  type: string;
  description: string;
  estimatedArpu?: string;
  scalability: 'linear' | 'sublinear' | 'superlinear';
}

// ============================================================================
// KNOWLEDGE BASE
// ============================================================================

export interface KnowledgeBaseContent {
  fundamentals: string[];
  certifications: string[];
  jobRoles: string[];
  industryTrends: string[];
  successCriteria: string[];
}

export interface SourceCitation {
  id?: string;
  title: string;
  url?: string;
  publisher?: string;
  publishedDate?: string;
  type?: 'market-report' | 'regulation' | 'industry' | 'company-site' | 'government-site' | 'other';
  reliability?: 'primary' | 'secondary';
  excerpt?: string;
}

export interface Sources {
  regulatory?: SourceCitation[];
  market?: SourceCitation[];
  grants?: SourceCitation[];
  industry?: SourceCitation[];
  competitive?: SourceCitation[];
  technical?: SourceCitation[];
  financial?: SourceCitation[];
  other?: SourceCitation[];
}

// ============================================================================
// MAIN UNIFIED CONFIG
// ============================================================================

/**
 * UNIVERSAL VERTICAL CONFIG
 * Use this for ANY vertical: aerospace, manufacturing, medical, surveillance, etc.
 *
 * All fields below are optional to allow flexibility, but
 * id, name, domain, phases, expertiseUmbrellas, marketOpportunity
 * are strongly recommended for full functionality
 */
export interface UniversalVerticalConfig {
  // IDENTITY (required)
  id: string; // e.g., 'composites', 'faa-part-108'
  name: string;
  description: string;
  domain: VerticalDomain;
  lastUpdated: string; // ISO date

  // STRUCTURE (required)
  phases: PhaseDefinition[];
  expertiseUmbrellas: ExpertiseUmbrella[];

  // MARKET & REGULATORY (required for knowledge base)
  marketOpportunity?: MarketOpportunity;
  regulatoryFramework?: RegulatoryFramework;

  // FINANCIAL (required)
  capitalRequirements?: CapitalRequirements;
  revenueModels?: RevenueModel[];
  unitEconomics?: UnitEconomics;

  // STRATEGIC CONTEXT
  keyRisks?: string[];
  competitiveAdvantages?: string[];
  exitStrategy?: string[];

  // FUNDING OPPORTUNITIES
  grantOpportunities?: Record<string, any>[]; // Keep flexible

  // KNOWLEDGE BASE LINKAGE
  knowledgeBaseContent?: KnowledgeBaseContent;

  // SOURCES & CITATIONS
  sources?: Sources;

  // FLEXIBLE: Allow vertical-specific fields
  [key: string]: any;
}

// ============================================================================
// KNOWLEDGE BASE ENTRY (for extraction & storage)
// ============================================================================

export interface KnowledgeEntry {
  id: string;
  type: KnowledgeEntryType;
  vertical: string;

  content: {
    title: string;
    summary: string;
    details: string;
    keyPoints: string[];
    learningResources?: string[];
  };

  metadata: {
    criticality?: SkillCriticality;
    phases?: string[];
    domain?: VerticalDomain;
    relatedSkills?: string[];
    requiredCertifications?: string[];
    estimatedLearningTime?: string;
  };

  lineage: {
    sourceConfig: string;
    sourceField: string;
    extractedAt: string;
    validatedAt?: string;
    validatedBy?: 'agent-validation' | 'human-review';
  };

  usage: {
    embeddings: number;
    videosGenerated: number;
    chatbotQueries: number;
    lastUsed?: string;
  };
}

// ============================================================================
// A2A VALIDATION RESULTS
// ============================================================================

export interface ValidationCriterionResult {
  score: number; // 0-100
  feedback: string;
}

export interface ValidationResult {
  entryId: string;
  score: number; // 0-100 weighted
  status: 'approved' | 'needs-revision' | 'human-review';
  criteria: {
    completeness: ValidationCriterionResult;
    accuracy: ValidationCriterionResult;
    clarity: ValidationCriterionResult;
    consistency: ValidationCriterionResult;
    relevance: ValidationCriterionResult;
  };
  overallFeedback: string;
  suggestedRevisions?: string[];
  validatedAt: string;
  validatedByAgent: string;
}

// ============================================================================
// YOUTUBE SCRIPT
// ============================================================================

export interface YouTubeScript {
  title: string;
  description: string;
  script: string; // With timestamps
  keyPoints: string[];
  callToAction: string;
  thumbnail?: {
    headline: string;
    color: string;
  };
  tags: string[];
  generatedAt: string;
  status: 'draft' | 'ready-for-review' | 'published';
}

// ============================================================================
// VERTICAL LAUNCH PLAN
// ============================================================================

export interface VerticalLaunchPlan {
  configPath: string;
  expectedEntries: number;
  targetYouTubeScripts: number;
  estimatedDuration: string;
  targetLaunchDate?: string;
}

export interface VerticalLaunchResult {
  vertical: string;
  entriesPublished: number;
  scriptsGenerated: number;
  launchDate: string;
  metrics: {
    averageValidationScore: number;
    approvalRate: number;
    averageEmbeddingTime: number;
  };
}

// ============================================================================
// COMPETITIVE COMPARISON
// ============================================================================

export interface CompetitiveComparison {
  vertical: string;
  competitorName: string;
  yoursScore: number; // 0-100
  competitorScore?: number;
  gap: 'ahead' | 'equal' | 'behind' | 'different';
  advantages: string[];
  disadvantages: string[];
  nextSteps: string[];
}

// ============================================================================
// MONITORING & METRICS
// ============================================================================

export interface KnowledgeBaseMetrics {
  totalEntries: number;
  entriesByType: Record<KnowledgeEntryType, number>;
  verticalCoverage: Record<string, {
    entries: number;
    umbrellas: number;
    skills: number;
  }>;

  // Quality
  validationScore: number;
  approvalRate: number;
  humanReviewRate: number;

  // Engagement
  youtubeScriptsGenerated: number;
  chatbotQueries: number;
  chatbotAvgResponseTime: number;
  vectorSearchLatency: number;

  // Business
  activeUsers: number;
  youtubeAdRevenue: number;
  subscriptionRevenue: number;
  totalMonthlyRevenue: number;

  // Efficiency
  extractionTimePerVertical: number;
  validationTimePerVertical: number;
  scriptGenerationTimePerEntry: number;
}
