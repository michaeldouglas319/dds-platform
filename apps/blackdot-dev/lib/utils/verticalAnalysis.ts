/**
 * Vertical Analysis & Comparison Utilities
 *
 * Scoring, ranking, and comparison functions for business verticals
 * Enables weighted evaluation across multiple dimensions
 *
 * Key Dimensions:
 * - Grant Eligibility (5%) - SBIR/STTR funding available
 * - Founder Suitability (35%) - Can founder fill key roles?
 * - Market Size (25%) - TAM and growth potential
 * - Time to Revenue (25%) - Speed to first customer revenue
 * - Regulatory Complexity (10%) - Lower = better
 */

import { BusinessVerticalConfig } from '@/lib/types/businessVertical.types';
import { GrantOpportunity } from '@/lib/types/grants.types';
import { SourceCitation } from '@/lib/types/sources.types';

/**
 * Scoring weights (percentages)
 * Updated Jan 18, 2026 after SBIR/STTR reauth pause
 */
export const SCORING_WEIGHTS = {
  grantEligibility: 0.05, // Down from 30% (SBIR/STTR paused)
  founderSuitability: 0.35, // Up from 25%
  marketSize: 0.25,
  timeToRevenue: 0.25,
  regulatoryComplexity: 0.10
};

/**
 * Grant Opportunity Scoring
 * Evaluates how much non-dilutive funding is available
 * Scale: 0-10 (10 = excellent funding, 0 = none)
 */
export function scoreGrantEligibility(vertical: BusinessVerticalConfig): number {
  if (!vertical.grantOpportunities || vertical.grantOpportunities.length === 0) {
    return 0;
  }

  let totalScore = 0;
  let activeCount = 0;

  for (const grant of vertical.grantOpportunities) {
    let grantScore = 0;
    const grantData = grant as any;

    // Status: active (10), pending-reauth (2), expired/closed (0)
    if (grantData.status === 'active') {
      grantScore = 8;
      activeCount++;
    } else if (grantData.status === 'pending-reauth') {
      grantScore = 2; // Minimal credit for pending programs
    } else {
      grantScore = 0;
    }

    // Award amount: Phase II > Phase I
    // Phase II >$750K adds to score
    if (grantData.awards.some((a: any) => a.phase === 'Phase II' && a.maxAmount > 750)) {
      grantScore += 2;
    }

    totalScore += grantScore;
  }

  // Average across opportunities (max 10)
  const avgScore = vertical.grantOpportunities.length > 0 ? totalScore / vertical.grantOpportunities.length : 0;
  return Math.min(10, avgScore);
}

/**
 * Founder Suitability Scoring
 * Evaluates whether founder can fill key roles without government credentials
 * Scale: 0-10 (10 = founder can fill all key roles, 0 = all must-hire)
 */
export function scoreFounderSuitability(vertical: BusinessVerticalConfig): number {
  if (!vertical.expertiseUmbrellas || vertical.expertiseUmbrellas.length === 0) {
    return 5; // Neutral default
  }

  let founderFillableCount = 0;
  let coFounderIdealCount = 0;
  let mustHireCount = 0;
  let totalSkills = 0;

  // Analyze skills in each umbrella
  for (const umbrella of vertical.expertiseUmbrellas) {
    const umbrellaData = umbrella as any;
    for (const skill of umbrellaData.requiredSkills) {
      const skillData = skill as any;
      if (skillData.criticality === 'critical') {
        totalSkills++;

        if (skillData.founderSuitability === 'founder-fillable') {
          founderFillableCount++;
        } else if (skillData.founderSuitability === 'co-founder-ideal') {
          coFounderIdealCount += 0.5; // Half credit (must find co-founder)
        } else if (skillData.founderSuitability === 'must-hire') {
          // Deduct points for must-hires
          mustHireCount++;
        }
      }
    }
  }

  if (totalSkills === 0) {
    return 5; // Neutral
  }

  // Scoring formula:
  // - Founder-fillable critical skills = 1 point each
  // - Co-founder-ideal = 0.5 points each
  // - Must-hire critical skills = -0.5 points each
  const score = founderFillableCount + coFounderIdealCount - mustHireCount * 0.5;
  const normalizedScore = (score / totalSkills) * 10;

  return Math.max(0, Math.min(10, normalizedScore + 5)); // Center around 5
}

/**
 * Market Size Scoring
 * Evaluates TAM and growth potential
 * Scale: 0-10 (10 = large market with strong growth)
 */
export function scoreMarketSize(vertical: BusinessVerticalConfig): number {
  const market = vertical.marketOpportunity as any;
  if (!market || !market.tam) {
    return 5; // Neutral
  }

  let score = 5; // Base score

  // TAM size scoring (based on current TAM)
  const tamValue = market.tam.currentSize?.value || '';
  const tamNum = parseFloat(tamValue);

  if (tamNum >= 100) {
    score += 3; // $100B+ = excellent
  } else if (tamNum >= 50) {
    score += 2.5; // $50-100B
  } else if (tamNum >= 10) {
    score += 2; // $10-50B
  } else if (tamNum >= 1) {
    score += 1; // $1-10B
  } else if (tamNum > 0) {
    score += 0.5; // <$1B
  }

  // Growth rate scoring (CAGR)
  const growthRate = market.tam.growthRate || '';
  const growthNum = parseFloat(growthRate);

  if (growthNum >= 20) {
    score += 2.5; // 20%+ CAGR
  } else if (growthNum >= 15) {
    score += 2; // 15-20%
  } else if (growthNum >= 10) {
    score += 1.5; // 10-15%
  } else if (growthNum >= 5) {
    score += 1; // 5-10%
  } else {
    score += 0.5; // <5%
  }

  return Math.min(10, score);
}

/**
 * Time to Revenue Scoring
 * Evaluates how quickly the vertical can generate revenue
 * Scale: 0-10 (10 = 6 months or less, 0 = 36+ months)
 */
export function scoreTimeToRevenue(vertical: BusinessVerticalConfig): number {
  // Extract timeline from phases or property
  const timelineStr = vertical.unitEconomics?.timeToRevenue || '';
  const timelineNum = parseInt(timelineStr);

  // Parse months from string like "6-12 months" or "9-18 months"
  let months = 0;
  if (timelineStr.includes('6-9') || timelineStr.includes('6-12')) {
    months = 9; // Average
  } else if (timelineStr.includes('9-18')) {
    months = 13;
  } else if (timelineStr.includes('12-18')) {
    months = 15;
  } else if (timelineStr.includes('18-24')) {
    months = 21;
  } else if (timelineStr.includes('24')) {
    months = 24;
  } else if (timelineStr.includes('36')) {
    months = 36;
  } else {
    return 5; // Neutral default
  }

  // Scoring: faster = higher score
  if (months <= 6) {
    return 10; // Excellent
  } else if (months <= 9) {
    return 9;
  } else if (months <= 12) {
    return 8;
  } else if (months <= 15) {
    return 6;
  } else if (months <= 18) {
    return 4;
  } else if (months <= 24) {
    return 2;
  } else {
    return 1; // Poor
  }
}

/**
 * Regulatory Complexity Scoring
 * Lower complexity = higher score (inversion from other metrics)
 * Scale: 0-10 (10 = minimal regulation, 0 = very complex)
 */
export function scoreRegulatoryComplexity(vertical: BusinessVerticalConfig): number {
  if (!vertical.regulatoryFramework) {
    return 7; // Assume moderate if not specified
  }

  const framework = vertical.regulatoryFramework as any;
  const reqCount = framework.requirements?.length || 0;

  // Count high-complexity requirements
  let complexCount = 0;
  let cost = 0;

  if (framework.requirements) {
    for (const req of framework.requirements) {
      const reqData = req as any;
      if (reqData.complexityLevel === 'very-high') {
        complexCount += 2;
      } else if (reqData.complexityLevel === 'high') {
        complexCount += 1.5;
      } else if (reqData.complexityLevel === 'medium') {
        complexCount += 0.5;
      }
      cost += (reqData.complianceCost?.max || 0);
    }
  }

  // Scoring: lower complexity = higher score
  let score = 10 - Math.min(8, complexCount); // Max -8 points
  score -= Math.min(1, cost / 1000); // Cost factor (-0 to -1)

  return Math.max(0, Math.min(10, score));
}

/**
 * Composite Vertical Score
 * Weighted sum of all dimensions
 */
export interface VerticalScore {
  verticalId: string;
  verticalName: string;
  totalScore: number; // 0-10 scale
  breakdown: {
    grantEligibility: number;
    founderSuitability: number;
    marketSize: number;
    timeToRevenue: number;
    regulatoryComplexity: number;
  };
  weights: typeof SCORING_WEIGHTS;
  recommendation?: string;
}

export function scoreVertical(vertical: BusinessVerticalConfig): VerticalScore {
  const grantScore = scoreGrantEligibility(vertical);
  const founderScore = scoreFounderSuitability(vertical);
  const marketScore = scoreMarketSize(vertical);
  const revenueScore = scoreTimeToRevenue(vertical);
  const regulatoryScore = scoreRegulatoryComplexity(vertical);

  const totalScore =
    grantScore * SCORING_WEIGHTS.grantEligibility +
    founderScore * SCORING_WEIGHTS.founderSuitability +
    marketScore * SCORING_WEIGHTS.marketSize +
    revenueScore * SCORING_WEIGHTS.timeToRevenue +
    regulatoryScore * SCORING_WEIGHTS.regulatoryComplexity;

  // Generate recommendation
  let recommendation = '';
  if (totalScore >= 9) {
    recommendation = 'EXCELLENT - Highest priority for founder to pursue';
  } else if (totalScore >= 8) {
    recommendation = 'VERY GOOD - Strong opportunity, consider as primary focus';
  } else if (totalScore >= 7) {
    recommendation = 'GOOD - Viable opportunity, evaluate alongside other options';
  } else if (totalScore >= 6) {
    recommendation = 'MODERATE - Consider but review risks carefully';
  } else if (totalScore >= 5) {
    recommendation = 'FAIR - Requires significant planning and risk mitigation';
  } else {
    recommendation = 'CHALLENGING - Consider alternative verticals first';
  }

  return {
    verticalId: vertical.id,
    verticalName: vertical.name,
    totalScore: Math.round(totalScore * 100) / 100,
    breakdown: {
      grantEligibility: Math.round(grantScore * 100) / 100,
      founderSuitability: Math.round(founderScore * 100) / 100,
      marketSize: Math.round(marketScore * 100) / 100,
      timeToRevenue: Math.round(revenueScore * 100) / 100,
      regulatoryComplexity: Math.round(regulatoryScore * 100) / 100
    },
    weights: SCORING_WEIGHTS,
    recommendation
  };
}

/**
 * Compare multiple verticals
 */
export function compareVerticals(verticals: BusinessVerticalConfig[]): VerticalScore[] {
  return verticals
    .map((v) => scoreVertical(v))
    .sort((a, b) => b.totalScore - a.totalScore); // Highest score first
}

/**
 * Get hiring budget summary
 * Calculates must-hire costs by vertical
 */
export function getHiringBudgetSummary(vertical: BusinessVerticalConfig): {
  totalCost: { min: number; max: number };
  founderFillable: number;
  coFounderIdeal: number;
  mustHire: number;
  breakdown: Array<{
    skill: string;
    suitability: string;
    estimatedCost?: { min?: number; max?: number };
  }>;
} {
  let founderFillableCount = 0;
  let coFounderIdealCount = 0;
  let mustHireCount = 0;
  let totalMin = 0;
  let totalMax = 0;
  const breakdown = [];

  if (vertical.expertiseUmbrellas) {
    for (const umbrella of vertical.expertiseUmbrellas) {
      const umbrellaData = umbrella as any;
      for (const skill of umbrellaData.requiredSkills) {
        const skillData = skill as any;
        if (skillData.criticality !== 'critical') continue;

        if (skillData.founderSuitability === 'founder-fillable') {
          founderFillableCount++;
        } else if (skillData.founderSuitability === 'co-founder-ideal') {
          coFounderIdealCount++;
        } else if (skillData.founderSuitability === 'must-hire') {
          mustHireCount++;
          // Typical must-hire salary: $150-250K
          totalMin += 150;
          totalMax += 250;
        }

        breakdown.push({
          skill: skillData.name,
          suitability: skillData.founderSuitability
        });
      }
    }
  }

  return {
    totalCost: { min: totalMin, max: totalMax },
    founderFillable: founderFillableCount,
    coFounderIdeal: coFounderIdealCount,
    mustHire: mustHireCount,
    breakdown
  };
}

/**
 * Get source quality report
 */
export function getSourceQualityReport(
  vertical: BusinessVerticalConfig
): {
  totalSources: number;
  byType: Record<string, number>;
  byReliability: Record<string, number>;
  missingSources: string[];
} {
  const sources = Object.values(vertical.sources || {}).flat();
  const byType: Record<string, number> = {};
  const byReliability: Record<string, number> = {};
  const missingSources: string[] = [];

  for (const source of sources) {
    byType[source.type] = (byType[source.type] || 0) + 1;
    byReliability[source.reliability] = (byReliability[source.reliability] || 0) + 1;
  }

  // Check for sections that might be missing sources
  const marketOpp = vertical.marketOpportunity as any;
  if (!marketOpp?.tam?.sources || marketOpp.tam.sources.length === 0) {
    missingSources.push('Market TAM analysis');
  }
  const regFramework = vertical.regulatoryFramework as any;
  if (!regFramework?.requirements?.length) {
    missingSources.push('Regulatory requirements');
  }

  return {
    totalSources: sources.length,
    byType,
    byReliability,
    missingSources
  };
}

/**
 * Calculate grant funding potential
 */
export function getGrantFundingPotential(vertical: BusinessVerticalConfig): {
  totalPotential: { min: number; max: number };
  byPhase: {
    phaseI: { min: number; max: number };
    phaseII: { min: number; max: number };
  };
  activeGrants: number;
  pausedGrants: number;
} {
  let phaseIMin = 0,
    phaseIMax = 0;
  let phaseIIMin = 0,
    phaseIIMax = 0;
  let activeCount = 0,
    pausedCount = 0;

  for (const grant of vertical.grantOpportunities || []) {
    const grantData = grant as any;
    if (grantData.status === 'active') {
      activeCount++;
    } else if (grantData.status === 'pending-reauth') {
      pausedCount++;
    }

    for (const award of grantData.awards || []) {
      const awardData = award as any;
      if (awardData.phase === 'Phase I') {
        phaseIMin += awardData.minAmount;
        phaseIMax += awardData.maxAmount;
      } else if (awardData.phase === 'Phase II') {
        phaseIIMin += awardData.minAmount;
        phaseIIMax += awardData.maxAmount;
      }
    }
  }

  return {
    totalPotential: {
      min: phaseIMin + phaseIIMin,
      max: phaseIMax + phaseIIMax
    },
    byPhase: {
      phaseI: { min: phaseIMin, max: phaseIMax },
      phaseII: { min: phaseIIMin, max: phaseIIMax }
    },
    activeGrants: activeCount,
    pausedGrants: pausedCount
  };
}
