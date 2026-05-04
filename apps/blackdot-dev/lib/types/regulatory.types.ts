/**
 * Regulatory Framework Types
 *
 * Tracks regulatory requirements, compliance timelines, and authority involvement
 * for each business vertical.
 */

import { SourceCitation } from './sources.types';

export type RegulatoryStatus = 'proposed' | 'final' | 'enforced' | 'evolving' | 'draft';
export type RegulatoryAuthority =
  | 'FAA'
  | 'USCG'
  | 'DHS'
  | 'DoD'
  | 'EPA'
  | 'NIST'
  | 'FCC'
  | 'OSHA'
  | 'State Board'
  | 'International'
  | 'Other';

/**
 * Regulatory Requirement - Single regulation or rule affecting the business
 */
export interface RegulatoryRequirement {
  id: string;
  authority: RegulatoryAuthority;
  regulation: string; // e.g., "FAA Part 108", "USCG Autonomous Vessel Rule", "State Security Guard License"
  description: string;
  status: RegulatoryStatus;

  // Timeline information
  proposedDate?: string; // ISO date when first proposed
  finalDate?: string; // ISO date when finalized
  effectiveDate?: string; // ISO date when becomes effective
  timeline?: string; // e.g., "18-24 months", "Currently enforced"

  // Key requirements
  requirements: string[]; // Specific compliance requirements

  // Cost and complexity
  complianceCost: {
    min: number; // in thousands
    max: number;
  };
  complexityLevel: 'low' | 'medium' | 'high' | 'very-high';

  // Critical milestones
  criticalMilestones: string[];

  // Impact on operations
  operationalImpact: string[]; // How this rule affects operations

  // Risk assessment
  riskIfNoncompliant?: string;

  // Source documentation
  sources: SourceCitation[];
}

/**
 * Regulatory Framework - All regulations affecting a vertical
 */
export interface RegulatoryFramework {
  vertical: string; // e.g., "autonomous-watercraft", "surveillance-systems"
  requirements: RegulatoryRequirement[];

  // Overall assessment
  totalComplianceCost: {
    min: number; // in thousands
    max: number;
  };
  overallTimeline: string; // e.g., "24-36 months"
  criticalPath: string[]; // Sequence of critical milestones

  // Summary
  description: string;
  keyChallenges: string[];
  opportunities?: string[];
}

/**
 * Certification Path - Step-by-step path to compliance
 */
export interface CertificationStep {
  id: string;
  name: string;
  description: string;
  authority: RegulatoryAuthority;
  prerequisites: string[]; // IDs of steps that must complete first
  timeline: string;
  cost: {
    min: number;
    max: number;
  };
  resources: {
    personnel: string; // e.g., "1 regulatory lead, 2 engineers"
    equipment?: string;
    external?: string; // e.g., "Consulting firm"
  };
  deliverables: string[]; // What you must produce
  successCriteria: string[]; // How you know you succeeded
}

/**
 * Compliance Risk Assessment
 */
export interface ComplianceRisk {
  id: string;
  name: string;
  description: string;
  likelihood: 'low' | 'medium' | 'high' | 'critical';
  impact: 'low' | 'medium' | 'high' | 'critical';
  mitigationStrategy: string;
  responsibility: string; // Who handles this risk
}

/**
 * Regulatory Monitoring - Track changes and updates
 */
export interface RegulatoryUpdate {
  id: string;
  date: string; // ISO date
  authority: RegulatoryAuthority;
  regulation: string;
  changeType: 'proposed' | 'finalized' | 'clarified' | 'amended' | 'deprecated';
  summary: string;
  impact: string; // How this affects compliance
  sources: SourceCitation[];
}

/**
 * Personnel Licensing Requirements
 */
export interface PersonnelLicense {
  id: string;
  role: string; // e.g., "Remote Pilot", "Captain", "Security Guard"
  license: string;
  jurisdiction: 'federal' | 'state' | 'local' | 'international';
  authority: string;

  // Requirements
  minimumAge?: number;
  educationRequired?: string;
  experienceRequired?: string;
  backgroundCheck?: string;

  // Timeline and cost
  timeline: string;
  cost: {
    min: number;
    max: number;
  };

  // Founder-specific context
  founderCanObtain: boolean; // Can the founder get this license themselves?
  foundingTimeline?: string; // How long would it take founder to get licensed?
  founderCost?: string;

  // Substitution options
  consultantSubstitution: boolean; // Can consultant/advisor substitute?
  consultantModel?: string; // e.g., "Advisor on cap table + equity"

  // Renewal
  renewalPeriod: string;
  renewalCost: {
    min: number;
    max: number;
  };

  sources: SourceCitation[];
}
