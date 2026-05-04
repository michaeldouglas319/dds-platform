/**
 * Common Data & Volatile Content
 * 
 * Centralized location for frequently updated data:
 * - Market statistics (updated with latest reports)
 * - Regulatory timelines
 * - Common phrases/content used across multiple sections
 * 
 * Updated: December 2025
 * 
 * Market Sources (Verified as of early 2026):
 * - Grand View Research: $73.06B (2024) → $163.60B (2030) at 14.3% CAGR
 *   Source: https://www.grandviewresearch.com/industry-analysis/drone-market-report
 * - SkyQuest: $123B by 2032
 * - Fortune BI: $65B commercial by 2032 (or ~$14B in 2024 → ~$65B by 2032 at 20.8% CAGR)
 * 
 * Regulatory (Verified as of early 2026):
 * - FAA Part 108 BVLOS: NPRM Aug 2025, comments closed Oct 2025, final rule expected Spring 2026 (Q1/Q2)
 *   Implementation: 6-12 months post-finalization (late 2026–early 2027)
 *   Sources: FAA official NPRM, industry analyses (DLA Piper, Pillsbury Law, Elsight)
 * - FCC Covered List Expansion (Dec 22-23, 2025): New foreign-made drones barred from FCC authorization
 */

/**
 * Market Statistics
 * Updated with latest 2025 projections
 */
export const marketStats = {
  global: {
    total2032: '$163.2B',
    total2030: '$163.60B', // Grand View Research, 2025 report (verified)
    total2024: '$73.06B', // Grand View Research, 2025 report (verified)
    cagr: '14.3%', // Grand View Research (2025-2030, verified)
    // Note: 15.2% CAGR cited elsewhere is close; using 14.3% for precision
    segments: {
      defense: '42%',
      commercial: '$65B by 2032', // Fortune BI estimate (commercial-only scope)
      // Alternative: ~$30B in 2024 → ~$55B by 2030 at 10.6% CAGR (Grand View, commercial-only)
      agriculture: 'Leading segment',
      logistics: 'Emerging BVLOS market',
    },
  },
  sovereignty: {
    // Note: Blue UAS has grown substantially (16+ platforms in 2025 vs. ~10 in 2020)
    // but no exact 300% figure found; using "substantial growth" language
    blueUASGrowth: 'Substantial growth (16+ platforms in 2025)',
    // Note: No direct evidence of -20%/yr decline; DJI still holds ~70-80%+ US market share
    djiUSMarketShare: '~70-80%+ (2025 estimates)', // Despite regulatory pressures
    usGovBanImpact: '$5B TAM',
    bvlosEfficiency: '+300%',
  },
  data: {
    annualDataGeneration: '500 exabytes by 2030',
  },
} as const;

/**
 * Regulatory Timeline
 */
export const regulatoryTimeline = {
  faaPart108: {
    nprm: 'August 2025', // Verified
    commentsClosed: 'October 2025',
    submissions: '~3,000',
    finalRuleExpected: 'Spring 2026 (Q1/Q2)', // Verified - per Executive Order deadline ~February 2026
    implementation: '6-12 months post-finalization (late 2026–early 2027)', // Verified
    status: 'Industry split on details (right-of-way, waiver transitions)',
    sources: 'FAA official NPRM, industry analyses (DLA Piper, Pillsbury Law, Elsight)',
  },
  fcc: {
    coveredListExpansion: 'December 22-23, 2025',
    impact: 'All new foreign-made drones barred from FCC authorization/import/sale',
    affected: 'DJI, Autel (~70-90% market share)',
    existingStock: 'Remains legal/usable',
    shortages: 'Acute (e.g., batteries ~99% China-sourced)',
  },
} as const;

/**
 * Common Content Phrases
 * Reusable content snippets to maintain consistency
 */
export const commonContent = {
  sovereignty: {
    stack: 'Sovereign Stack',
    supplyChain: 'Sovereign, AI-certified supply chain foundation',
    domestic: 'Domestic, production-grade UAV technology',
    highReliability: 'High-Reliability, sovereign supply chain foundation',
  },
  certification: {
    do178c: 'DO-178C',
    do178cLevelAB: 'DO-178C Level A/B',
    part107: 'Part 107',
    part108: 'Part 108',
    part89: 'Part 89 (Remote ID)',
    as9100: 'AS9100',
  },
  platforms: {
    nasaCFS: 'NASA cFS',
    nasaCoreFlightSystem: 'NASA\'s Core Flight System (cFS)',
    px4: 'PX4',
    ardupilot: 'ArduPilot',
    pixhawk: 'Pixhawk',
  },
  ai: {
    synthesis: 'AI-driven synthesis',
    correctByConstruction: 'Correct-by-Construction',
    requirementToTest: 'Requirements-to-Test',
    buildAgents: 'AI build agents',
  },
  validation: {
    extensiveTesting: 'Foundation in extensive continuous testing',
    continuousTesting: 'Extensive continuous testing',
  },
} as const;

/**
 * Knowledge Gaps Template
 * Common knowledge gaps that may appear across sections
 */
export const commonKnowledgeGaps = {
  aiCertification: 'Legal implications of AI-synthesized certification evidence under current FAA DO-178C guidelines.',
  exportControls: 'Multi-jurisdictional AI export controls and sovereignty mandates.',
  batteryDensity: 'Specific battery energy density milestones required for 4-hour endurance on Mid-Tier platforms.',
  thermalManagement: 'Thermal management strategies for extended flight operations.',
  lidarProcessing: 'LiDAR-to-Mesh real-time processing overhead on GaN-based flight stages.',
} as const;


