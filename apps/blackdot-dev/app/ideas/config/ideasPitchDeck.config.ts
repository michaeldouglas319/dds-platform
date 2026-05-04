/**
 * Ideas Page - Concise Pitch Deck Configuration
 * 12-Slide Investor-Ready Hero Deck
 * Based on: INVESTOR_PITCH_DECK_12-14_SLIDES.md
 * 
 * Date: January 11, 2026
 * Focus: Three-Pillar Strategy (FaaS → V1 Hardware → Vertical Ecosystem)
 */

import { UnifiedSection } from '@/lib/config/content';
import { allExpertiseUmbrellas, getFoundingPartnerSummary, certificationPhases, type ExpertiseUmbrella } from './faaExpertise.config';
import type { SlideTaxonomy } from '@/lib/config/taxonomy/slide-taxonomy';
import {
  SlideCategoryPrimary,
  SlideCategorySecondary,
  ContentType,
  DisplayMode,
  InvestorLevel,
  ContentImportance
} from '@/lib/config/taxonomy/slide-taxonomy';

const pexel = (id: number) => 
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260`;

/**
 * Helper function to format budget range for display
 */
function formatBudgetRange(umbrella: ExpertiseUmbrella): string {
  const min = umbrella.budgetRange.totalMin;
  const max = umbrella.budgetRange.totalMax;
  if (min >= 1000) {
    return `$${(min / 1000).toFixed(2)}M–$${(max / 1000).toFixed(2)}M`;
  }
  return `$${min}K–$${max}K`;
}

/**
 * Helper function to get phase availability summary
 */
function getPhaseSummary(umbrella: ExpertiseUmbrella): string {
  const phases = new Set<string>();
  umbrella.requiredSkills.forEach(skill => {
    skill.requiredPhases.forEach(phase => phases.add(phase));
  });
  
  if (phases.size >= 6) {
    return 'All 8 phases';
  } else if (phases.size >= 4) {
    return `${phases.size} phases`;
  } else {
    // Get phase numbers sorted by importance
    const phaseNumbers = Array.from(phases)
      .map(p => {
        const phase = certificationPhases[p as keyof typeof certificationPhases];
        return phase ? phase.importance : 0;
      })
      .filter(n => n > 0)
      .sort((a, b) => a - b);
    
    if (phaseNumbers.length === 0) {
      return 'Multiple phases';
    } else if (phaseNumbers.length === 1) {
      return `Phase ${phaseNumbers[0]}`;
    } else {
      return `Phases ${phaseNumbers.join(', ')}`;
    }
  }
}

export const ideasPitchDeckSections: UnifiedSection[] = [
  // Slide 1: Title / Cover
  {
    id: 'pitch-cover',
    page: 'ideas',
    title: 'AI-Orchestrated Sovereign Drone Manufacturing & Ecosystem',
    subtitle: 'Three-Pillar Strategy: Contracts → Hardware → Full Vertical Integration',
    investorLevel: 'all',
    importance: 'critical',
    imageUrl: pexel(3184436),
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    modelConfig: {
      path: '/assets/models/aircraft_presentation_cover_draco.glb',
      scale: 1.2,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      animation: { type: 'float', speed: 0.5, amplitude: 0.3 }
    },
    layout: { type: 'scroll-based' },
    drilldown: { enabled: false },
    content: {
      heading: 'Building the Future of Autonomous Flight',
      paragraphs: [
        {
          subtitle: 'Founder',
          description: 'Michael Douglas - Software Engineer, Tesla (Vision Systems)'
        },
        {
          subtitle: 'Vision',
          description: 'Three interconnected pillars create a sovereign, scalable drone ecosystem that captures early contracts, builds modular hardware, and dominates full missions/services.'
        }
      ],
      highlights: [
        { subtitle: 'Pillar 1', description: 'FaaS / Contract Entry (2025-2026)' },
        { subtitle: 'Pillar 2', description: 'V1 Modular Hardware Suite (2026-2027)' },
        { subtitle: 'Pillar 3', description: 'Full Vertical Ecosystem (2027+)' }
      ]
    },
    taxonomy: {
      primary: SlideCategoryPrimary.HOOK,
      secondary: SlideCategorySecondary.HOOK_NARRATIVE,
      contentTypes: [ContentType.NARRATIVE, ContentType.STRATEGIC],
      displayMode: DisplayMode.FULL,
      investorLevel: InvestorLevel.ALL,
      importance: ContentImportance.CRITICAL,
      duration: 60,
      order: 1
    }
  },

  // Slide 2: The Problem
  {
    id: 'pitch-problem',
    page: 'ideas',
    title: 'Production Bottlenecks Block $163B Drone Boom',
    subtitle: 'Supply Chain, Regulatory, and Skill Transfer Crises',
    investorLevel: 'all',
    importance: 'critical',
    imageUrl: pexel(3184436),
    position: [1.2, -2.5, 0],
    rotation: [0, 0, 0],
    modelConfig: {
      path: '/assets/models/assembly_line_gltf/scene.gltf',
      scale: 0.8,
      position: [0, -0.5, 0],
      rotation: [0, 0, 0],
      animation: { type: 'rotate', speed: 0.3 }
    },
    layout: { type: 'grid' },
    drilldown: { enabled: true, layout: 'detail' },
    content: {
      heading: 'The Scaling Paradox',
      paragraphs: [
        {
          subtitle: 'Supply Chain Vulnerability',
          description: 'Defense contractors need 1,000+ BVLOS-capable drones immediately, but face lead times that vary by complexity (weeks to months). Manufacturers cannot scale without $20-50M capital investments—creating mission delays and lost competitive advantage.',
          citations: [
            { text: 'Financial Models Lab, Anduril, DMR Technologies, EFESO (2025)', url: '#' }
          ]
        },
        {
          subtitle: 'Regulatory Gates',
          description: 'FAA Part 108 final rule expected March–April 2026. Certification complexity requires years of expertise. Blue UAS exclusion creates supply chain risks.',
          citations: [
            { text: 'FAA Part 108 NPRM (Aug 7, 2025); DLA Piper, Pillsbury Law (2025-2026)', url: '#' }
          ]
        },
        {
          subtitle: 'Skill Transfer Crisis',
          description: 'Flight control expertise concentrated in small teams. Manual assembly processes cannot scale. Productionization gap: open-source stacks need deep integration knowledge.'
        }
      ],
      highlights: [
        { subtitle: 'Capital Barrier', description: '$20-50M per facility prevents rapid expansion' },
        { subtitle: 'Regulatory Delay', description: 'FAA Part 108 final rule expected Q1 2026' },
        { subtitle: 'Expertise Bottleneck', description: 'Concentrated knowledge limits scaling' }
      ]
    },
    taxonomy: {
      primary: SlideCategoryPrimary.FOUNDATION,
      secondary: SlideCategorySecondary.FOUNDATION_PROBLEM,
      contentTypes: [ContentType.DATA_METRICS, ContentType.NARRATIVE, ContentType.REGULATORY],
      displayMode: DisplayMode.FULL,
      investorLevel: InvestorLevel.ALL,
      importance: ContentImportance.CRITICAL,
      duration: 90,
      order: 2
    }
  },

  // Slide 3: Why Now / Market Opportunity
  {
    id: 'pitch-market',
    page: 'ideas',
    title: 'Perfect Storm: Regulatory Catalyst + Defense Tailwinds',
    subtitle: '$73.06B (2024) → $163.60B (2030) at 14.3% CAGR',
    investorLevel: 'all',
    importance: 'critical',
    imageUrl: pexel(3184431),
    position: [1.2, -5, 0],
    rotation: [0, 0, 0],
    modelConfig: {
      path: '/assets/models/future-island/scene.gltf',
      scale: 1.0,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      animation: { type: 'float', speed: 0.4, amplitude: 0.2 }
    },
    layout: { type: 'timeline' },
    drilldown: { enabled: true, layout: 'detail' },
    content: {
      heading: 'Market Opportunity & Regulatory Convergence',
      paragraphs: [
        {
          subtitle: 'Market Size',
          description: 'Global drone market: $73.06B (2024) → $163.60B (2030) at 14.3% CAGR. North America: 39%+ market share (2024).',
          citations: [
            { text: 'Grand View Research Drone Market Report (2025 update)', url: 'https://www.grandviewresearch.com/industry-analysis/drone-market-report' }
          ]
        },
        {
          subtitle: 'Regulatory Catalyst',
          description: 'FAA Part 108 NPRM published August 7, 2025. Final rule expected March–April 2026 (Q1 2026 earliest). Implementation: Late 2026–early 2027. Enables scaled commercial BVLOS without waivers.',
          citations: [
            { text: 'FAA Part 108 NPRM (Aug 7, 2025); DLA Piper, Pillsbury Law, DroneXL (2025-2026)', url: '#' }
          ]
        },
        {
          subtitle: 'Defense Tailwinds',
          description: 'USMC CUAS: $642M contract to Anduril (March 2025). DIU Blue UAS: 23 platforms + 14 components selected (Feb 2025). DIU Replicator accelerating defense drone procurement.',
          citations: [
            { text: 'Anduril $642M USMC CUAS IDIQ contract (March 2025)', url: '#' },
            { text: 'DIU Blue UAS Refresh: 23 platforms + 14 components selected (Feb 2025)', url: 'https://www.diu.mil/blue-uas' }
          ]
        }
      ],
      highlights: [
        { subtitle: 'Market Growth', description: '$73.06B (2024) → $163.60B (2030) at 14.3% CAGR' },
        { subtitle: 'Regulatory Timing', description: 'FAA Part 108 final rule Q1 2026' },
        { subtitle: 'Defense Contracts', description: '$642M+ in recent awards' }
      ],
      stats: [
        { label: 'Market 2024', value: '$73.06B' },
        { label: 'Market 2030', value: '$163.60B' },
        { label: 'CAGR', value: '14.3%' }
      ]
    },
    taxonomy: {
      primary: SlideCategoryPrimary.FOUNDATION,
      secondary: SlideCategorySecondary.FOUNDATION_MARKET_OPPORTUNITY,
      contentTypes: [ContentType.DATA_METRICS, ContentType.REGULATORY, ContentType.STRATEGIC],
      displayMode: DisplayMode.FULL,
      investorLevel: InvestorLevel.ALL,
      importance: ContentImportance.CRITICAL,
      duration: 90,
      order: 3
    }
  },

  // Slide 4: Three Interconnected Pillars
  {
    id: 'pitch-pillars',
    page: 'ideas',
    title: 'Three Interconnected Pillars',
    subtitle: 'FaaS → V1 Hardware → Full Vertical Ecosystem',
    investorLevel: 'all',
    importance: 'high',
    imageUrl: pexel(3861968),
    position: [1.2, -7.5, 0],
    rotation: [0, 0, 0],
    modelConfig: {
      path: '/assets/models/dron_low_poly_3d_model_gltf/scene.gltf',
      scale: 1.5,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      animation: { type: 'rotate', speed: 0.5 }
    },
    layout: { type: 'grid' },
    drilldown: { enabled: true, layout: 'modal' },
    content: {
      heading: 'Pillars That Reinforce Each Other',
      paragraphs: [
        {
          subtitle: 'Pillar 1: FaaS / Contract Entry',
          description: 'Secure early defense/commercial contracts to fund R&D. Low CapEx, recurring revenue model. Entry points: SAM.gov, MFG.com, Thomasnet, AI-Build-as-a-Service. Timeline: 2025-2026 (Phase 1).'
        },
        {
          subtitle: 'Pillar 2: V1 Internal Modular Hardware Suite',
          description: 'Build once, sell components → platforms. Components: Flight controllers, wings, motors, sensors. DO-178C/Blue UAS compliance. Timeline: 2026-2027 (Phase 2).'
        },
        {
          subtitle: 'Pillar 3: Full Vertical Ecosystem',
          description: 'Manufacturing → drones → services. Infinite flight glider relays for comms. Complete mission solutions (surveillance, logistics, swarm). Timeline: 2027+ (Phase 3).'
        },
        {
          subtitle: 'Reinforcement Loop',
          description: 'FaaS funds → V1 builds → Vertical Ecosystem scales. Each pillar enables the next. Recurring revenue compounds across all three.'
        }
      ],
      highlights: [
        { subtitle: 'Pillar 1', description: 'FaaS contracts fund R&D (2025-2026)' },
        { subtitle: 'Pillar 2', description: 'V1 hardware enables platforms (2026-2027)' },
        { subtitle: 'Pillar 3', description: 'Vertical Ecosystem generates recurring revenue (2027+)' },
        { subtitle: 'Compound Advantage', description: 'Each pillar reinforces the others' }
      ]
    },
    taxonomy: {
      primary: SlideCategoryPrimary.SOLUTION,
      secondary: SlideCategorySecondary.SOLUTION_PILLARS,
      contentTypes: [ContentType.STRATEGIC, ContentType.NARRATIVE],
      displayMode: DisplayMode.FULL,
      investorLevel: InvestorLevel.ALL,
      importance: ContentImportance.HIGH,
      duration: 120,
      order: 4
    }
  },

  // Slide 5: How Pillars Reinforce
  {
    id: 'pitch-reinforcement',
    page: 'ideas',
    title: 'How the Pillars Reinforce Each Other',
    subtitle: 'Compound Advantage Through Strategic Interconnection',
    investorLevel: 'all',
    importance: 'high',
    imageUrl: pexel(3861968),
    position: [1.2, -10, 0],
    rotation: [0, 0, 0],
    modelConfig: {
      path: '/assets/models/neuron/neuron.gltf',
      scale: 1.2,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      animation: { type: 'pulse', speed: 0.6, amplitude: 0.15 }
    },
    layout: { type: 'timeline' },
    drilldown: { enabled: true, layout: 'detail' },
    content: {
      heading: 'Revenue Flow & Timeline Alignment',
      paragraphs: [
        {
          subtitle: 'Revenue Flow',
          description: 'FaaS (Pillar 1) → Cash flow for R&D. V1 Hardware (Pillar 2) → Internal efficiency + sellable IP. Vertical Ecosystem (Pillar 3) → Ecosystem lock-in, high margins (recurring relay services).'
        },
        {
          subtitle: 'Timeline Alignment',
          description: '2025-2026: FaaS contracts fund V1 development. 2026-2027: V1 production enables Vertical Ecosystem. 2027+: Vertical Ecosystem generates recurring revenue.'
        }
      ],
      highlights: [
        { subtitle: '2025-2026', description: 'FaaS funds V1 development' },
        { subtitle: '2026-2027', description: 'V1 enables Vertical Ecosystem' },
        { subtitle: '2027+', description: 'Vertical Ecosystem generates recurring revenue' }
      ]
    },
    taxonomy: {
      primary: SlideCategoryPrimary.SOLUTION,
      secondary: SlideCategorySecondary.SOLUTION_PILLARS,
      contentTypes: [ContentType.STRATEGIC, ContentType.DATA_METRICS],
      displayMode: DisplayMode.FULL,
      investorLevel: InvestorLevel.ALL,
      importance: ContentImportance.HIGH,
      duration: 90,
      order: 5
    }
  },

  // Slide 6: Pillar 1 – FaaS
  {
    id: 'pitch-pillar1',
    page: 'ideas',
    title: 'Pillar 1 – FaaS / Contract Entry',
    subtitle: 'Early Revenue Through Procurement Portals & AI-Build Services',
    investorLevel: 'all',
    importance: 'high',
    imageUrl: pexel(3184436),
    position: [1.2, -12.5, 0],
    rotation: [0, 0, 0],
    modelConfig: {
      path: '/assets/models/black_honey_robotic_arm_gltf/scene.gltf',
      scale: 1.0,
      position: [0, -0.3, 0],
      rotation: [0, 0, 0],
      animation: { type: 'rotate', speed: 0.4 }
    },
    layout: { type: 'grid' },
    drilldown: { enabled: true, layout: 'detail' },
    content: {
      heading: 'Secure Early Contracts to Fund R&D',
      paragraphs: [
        {
          subtitle: 'Strategy',
          description: 'Procurement Portals: SAM.gov, MFG.com, Thomasnet registration. AI-Build-as-a-Service: Sub-assemblies with 100% DO-178C compliance. Entry Point: Wire harnesses → carbon fiber structures → full assembly.'
        },
        {
          subtitle: 'Revenue Model',
          description: 'Low CapEx (no facility investment required). Recurring revenue from contracts. Per-assembly pricing × volume × contract term. Early revenue funds V1 hardware R&D.'
        },
        {
          subtitle: 'Compliance',
          description: 'DO-178C automated traceability. Blue UAS ready. FAA Part 108 pre-certified.'
        },
        {
          subtitle: 'Timeline',
          description: 'Q1-Q2 2025: Portal registration, first contracts. Q3-Q4 2025: Scale sub-assembly production. 2026: Bridge to Phase 1 funding.'
        }
      ],
      highlights: [
        { subtitle: 'Low CapEx', description: 'No facility investment required' },
        { subtitle: 'Recurring Revenue', description: 'Contract-based revenue model' },
        { subtitle: 'DO-178C Ready', description: '100% automated compliance' },
        { subtitle: 'Timeline', description: '2025-2026 (Phase 1)' }
      ]
    },
    taxonomy: {
      primary: SlideCategoryPrimary.SOLUTION,
      secondary: SlideCategorySecondary.SOLUTION_PILLAR_DETAIL,
      contentTypes: [ContentType.STRATEGIC, ContentType.REGULATORY, ContentType.DATA_METRICS],
      displayMode: DisplayMode.FULL,
      investorLevel: InvestorLevel.ALL,
      importance: ContentImportance.HIGH,
      duration: 120,
      order: 6
    }
  },

  // Slide 7: Pillar 2 – V1 Hardware
  {
    id: 'pitch-pillar2',
    page: 'ideas',
    title: 'Pillar 2 – V1 Modular Hardware Suite',
    subtitle: 'Build Once, Sell Components → Platforms',
    investorLevel: 'all',
    importance: 'high',
    imageUrl: pexel(3861968),
    position: [1.2, -15, 0],
    rotation: [0, 0, 0],
    modelConfig: {
      path: '/assets/models/drone_uav_wing_desert_camo_gltf/scene.gltf',
      scale: 1.3,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      animation: { type: 'float', speed: 0.5, amplitude: 0.25 }
    },
    layout: { type: 'gallery' },
    drilldown: { enabled: true, layout: 'detail' },
    content: {
      heading: 'Precision Components at Production Scale',
      paragraphs: [
        {
          subtitle: 'Component Portfolio',
          description: 'GaN Power Stages: Superior efficiency, power density, thermal performance. Flight Controllers: Productionized open-source (PX4, ArduPilot, NASA cFS) with automated DO-178C traceability. Sensors & Actuators: LiDAR, IMU, GPS, servos with automated calibration. Structural Components: Carbon fiber frames, propellers, landing gear.'
        },
        {
          subtitle: 'Compliance',
          description: 'DO-178C automated compliance. Blue UAS ready. FAA Part 108 pre-certified.'
        },
        {
          subtitle: 'Target Metrics',
          description: 'Inspection Speed: 1000+ components/second (target). Defect Rate: <1 PPM (target). Asset Utilization: 85-95% vs. 40-50% traditional (target).'
        },
        {
          subtitle: 'Revenue Model',
          description: 'Per-component pricing × volume. Projected: 60-70% gross margins. Also powers our own platforms (internal efficiency).'
        }
      ],
      highlights: [
        { subtitle: 'GaN Power', description: 'Superior efficiency and power density' },
        { subtitle: 'DO-178C', description: 'Automated compliance' },
        { subtitle: 'Target Metrics', description: '1000+ components/sec, <1 PPM defects' },
        { subtitle: 'Timeline', description: '2026-2027 (Phase 2)' }
      ],
      stats: [
        { label: 'Inspection Speed (Target)', value: '1000+ components/sec' },
        { label: 'Gross Margin (Projected)', value: '60-70%' },
        { label: 'Asset Utilization (Target)', value: '85-95%' }
      ]
    },
    taxonomy: {
      primary: SlideCategoryPrimary.SOLUTION,
      secondary: SlideCategorySecondary.SOLUTION_PILLAR_DETAIL,
      contentTypes: [ContentType.TECHNICAL, ContentType.DATA_METRICS, ContentType.REGULATORY],
      displayMode: DisplayMode.FULL,
      investorLevel: InvestorLevel.ALL,
      importance: ContentImportance.HIGH,
      duration: 120,
      order: 7
    }
  },

  // Slide 8: Pillar 3 – Vertical Ecosystem
  {
    id: 'pitch-pillar3',
    page: 'ideas',
    title: 'Pillar 3 – Full Vertical Ecosystem',
    subtitle: 'Manufacturing → Drones → Services (Complete Ownership)',
    investorLevel: 'all',
    importance: 'high',
    imageUrl: pexel(1108090),
    position: [1.2, -17.5, 0],
    rotation: [0, 0, 0],
    modelConfig: {
      path: '/assets/models/super_cam__-_rusian_reconnaissance_drone_draco.glb',
      scale: 1.4,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      animation: { type: 'rotate', speed: 0.6 }
    },
    layout: { type: 'timeline' },
    drilldown: { enabled: true, layout: 'detail' },
    content: {
      heading: 'End-to-End Mission Solutions',
      paragraphs: [
        {
          subtitle: 'Full Integration Flow',
          description: 'Manufacturing: AI-driven component production. Drones: Complete platform assembly. Services: Infinite flight glider relays, fleet orchestration, mission solutions.'
        },
        {
          subtitle: 'Key Services',
          description: 'Infinite Flight Glider Relays: Low-power, extended endurance, relay networking for BVLOS range extension. BVLOS Operations Automation: AI-driven flight planning and mission orchestration. Complete Mission Solutions: Surveillance networks, logistics networks, swarm operations.'
        },
        {
          subtitle: 'Ecosystem Lock-In',
          description: 'Recurring service revenue (relay networks). High customer stickiness. Interoperability: Works with any drone fleet. High margins: Services exceed manufacturing margins.'
        },
        {
          subtitle: 'Timeline',
          description: '2027 Q3-Q4: First complete mission solutions. 2028+: Scale to $200M-500M+ revenue.'
        }
      ],
      highlights: [
        { subtitle: 'Glider Relays', description: 'Infinite flight for BVLOS extension' },
        { subtitle: 'Mission Solutions', description: 'Surveillance, logistics, swarm' },
        { subtitle: 'Recurring Revenue', description: 'High-margin service revenue' },
        { subtitle: 'Timeline', description: '2027+ (Phase 3)' }
      ]
    },
    taxonomy: {
      primary: SlideCategoryPrimary.SOLUTION,
      secondary: SlideCategorySecondary.SOLUTION_PILLAR_DETAIL,
      contentTypes: [ContentType.STRATEGIC, ContentType.TECHNICAL, ContentType.DATA_METRICS],
      displayMode: DisplayMode.FULL,
      investorLevel: InvestorLevel.ALL,
      importance: ContentImportance.HIGH,
      duration: 120,
      order: 8
    }
  },

  // Slide 9: Products & Capabilities
  {
    id: 'pitch-products',
    page: 'ideas',
    title: 'Products & Capabilities',
    subtitle: 'Tiered Solutions from Entry to Enterprise Swarms',
    investorLevel: 'all',
    importance: 'high',
    imageUrl: pexel(3861968),
    position: [1.2, -20, 0],
    rotation: [0, 0, 0],
    modelConfig: {
      path: '/assets/models/uav/Meshy_AI_Make_a_engineering_ap_1230052632_generate_draco.glb',
      scale: 1.2,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      animation: { type: 'float', speed: 0.4, amplitude: 0.2 }
    },
    layout: { type: 'gallery' },
    drilldown: { enabled: true, layout: 'detail' },
    content: {
      heading: 'Complete Product Portfolio',
      paragraphs: [
        {
          subtitle: 'Entry Tier',
          description: 'Pixhawk-based systems. Target: 30-minute flight times. Basic autonomy. DO-178C compliant path.'
        },
        {
          subtitle: 'Mid Tier',
          description: 'PX4/ArduPilot hybrids. AI-enhanced navigation. Extended range. Target: 4+ hour flight times.'
        },
        {
          subtitle: 'Advanced Tier',
          description: 'NASA cFS-enhanced swarm systems. Complex BVLOS operations. Target: Indefinite daylight endurance (solar variants). Relay capabilities.'
        },
        {
          subtitle: 'Key Capabilities',
          description: 'Endurance Systems: 4+ hours (mid-tier), indefinite daylight (solar variants). Dormant Systems: <1W standby power, <30s activation (targets). Relay Capabilities: Infinite flight glider relays for BVLOS extension.'
        }
      ],
      highlights: [
        { subtitle: 'Entry Tier', description: 'Pixhawk-based, 30-min flight time' },
        { subtitle: 'Mid Tier', description: 'PX4/ArduPilot, 4+ hour flight time' },
        { subtitle: 'Advanced Tier', description: 'NASA cFS swarms, indefinite endurance' },
        { subtitle: 'Relay Capabilities', description: 'BVLOS range extension' }
      ]
    },
    taxonomy: {
      primary: SlideCategoryPrimary.SOLUTION,
      secondary: SlideCategorySecondary.SOLUTION_PRODUCT_PORTFOLIO,
      contentTypes: [ContentType.TECHNICAL, ContentType.STRATEGIC, ContentType.DATA_METRICS],
      displayMode: DisplayMode.FULL,
      investorLevel: InvestorLevel.ALL,
      importance: ContentImportance.HIGH,
      duration: 120,
      order: 9
    }
  },

  // Slide 10: Traction / Roadmap
  {
    id: 'pitch-roadmap',
    page: 'ideas',
    title: 'Traction / Roadmap',
    subtitle: 'Phased Execution Aligned with Regulatory Milestones',
    investorLevel: 'vc',
    importance: 'high',
    imageUrl: pexel(3184436),
    position: [1.2, -22.5, 0],
    rotation: [0, 0, 0],
    modelConfig: {
      path: '/assets/models/book/book.gltf',
      scale: 1.0,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      animation: { type: 'float', speed: 0.3, amplitude: 0.15 }
    },
    layout: { type: 'timeline' },
    drilldown: { enabled: true, layout: 'modal' },
    content: {
      heading: 'Strategic Execution Plan',
      paragraphs: [
        {
          subtitle: 'Phase 1: FaaS & Component Foundation (2025-2026)',
          description: 'Q1-Q2 2025: Portal registration, first FaaS contracts. Q3-Q4 2025: Scale sub-assembly production, validate quality orchestration. 2026: Component manufacturing foundation, $10-30M revenue (projected). Pillar Alignment: Pillar 1 (FaaS) active, funds Pillar 2 (V1) development.'
        },
        {
          subtitle: 'Phase 2: V1 Hardware & Platform Production (2026-2027)',
          description: 'Q3-Q4 2026: First V1 production line, Blue UAS compliance, first PaaS customer. Q1-Q2 2027: Scale platform production, expand PaaS model. 2027: $50-100M+ revenue (projected). Pillar Alignment: Pillar 2 (V1) active, enables Pillar 3 (Vertical Ecosystem). Regulatory: FAA Part 108 final rule (Q1 2026), implementation begins (late 2026).'
        },
        {
          subtitle: 'Phase 3: Full Vertical Ecosystem (2027+)',
          description: 'Q3-Q4 2027: First complete mission solutions, BVLOS operations automation. 2028+: Scale mission solutions, logistics networks, swarm operations. 2028+: $200M-500M+ revenue (projected). Pillar Alignment: Pillar 3 (Vertical Ecosystem) active, generates recurring revenue.'
        }
      ],
      highlights: [
        { subtitle: 'Phase 1', description: 'FaaS contracts, $10-30M revenue (2025-2026)' },
        { subtitle: 'Phase 2', description: 'V1 production, $50-100M+ revenue (2026-2027)' },
        { subtitle: 'Phase 3', description: 'Vertical Ecosystem, $200M-500M+ revenue (2027+)' },
        { subtitle: 'Regulatory', description: 'FAA Part 108 final rule Q1 2026' }
      ],
      stats: [
        { label: 'Phase 1 Revenue (Projected)', value: '$10-30M (2025-2026)' },
        { label: 'Phase 2 Revenue (Projected)', value: '$50-100M+ (2026-2027)' },
        { label: 'Phase 3 Revenue (Projected)', value: '$200M-500M+ (2027+)' }
      ]
    },
    taxonomy: {
      primary: SlideCategoryPrimary.VALIDATION,
      secondary: SlideCategorySecondary.VALIDATION_TRACTION,
      contentTypes: [ContentType.STRATEGIC, ContentType.DATA_METRICS],
      displayMode: DisplayMode.FULL,
      investorLevel: InvestorLevel.VC,
      importance: ContentImportance.CRITICAL,
      duration: 120,
      order: 10
    }
  },

  // Slide 11: Financials & Projections
  {
    id: 'pitch-financials',
    page: 'ideas',
    title: 'Financials & Projections',
    subtitle: 'Revenue Ramps Through Three Phases',
    investorLevel: 'vc',
    importance: 'high',
    imageUrl: pexel(3184431),
    position: [1.2, -25, 0],
    rotation: [0, 0, 0],
    modelConfig: {
      path: '/assets/models/building_draco.glb',
      scale: 1.1,
      position: [0, -0.5, 0],
      rotation: [0, 0, 0],
      animation: { type: 'none' }
    },
    layout: { type: 'grid' },
    drilldown: { enabled: true, layout: 'detail' },
    content: {
      heading: 'Revenue Projections by Phase & Pillar',
      paragraphs: [
        {
          subtitle: 'Phase 1 (2025-2026): $10-30M',
          description: 'Pillar 1 (FaaS): Early contracts, sub-assemblies. Pillar 2 (V1): Component sales begin. Gross Margins: 60-70% (projected).'
        },
        {
          subtitle: 'Phase 2 (2026-2027): $50-100M+',
          description: 'Pillar 2 (V1): Full component production, platform sales. Pillar 3 (Vertical Ecosystem): Early service deployments. Gross Margins: 60-70% (projected).'
        },
        {
          subtitle: 'Phase 3 (2027+): $200M-500M+',
          description: 'Pillar 3 (Vertical Ecosystem): Mission solutions, recurring services. All Pillars: Compound revenue growth. Gross Margins: Services exceed manufacturing margins.'
        },
        {
          subtitle: 'Capital Requirements',
          description: 'Per Facility: $20-50M (industry estimate). Timeline: 12-18 months (variable, modular designs faster).'
        }
      ],
      highlights: [
        { subtitle: 'Phase 1', description: '$10-30M (2025-2026)' },
        { subtitle: 'Phase 2', description: '$50-100M+ (2026-2027)' },
        { subtitle: 'Phase 3', description: '$200M-500M+ (2027+)' },
        { subtitle: 'Gross Margins', description: '60-70% projected' }
      ],
      stats: [
        { label: 'Phase 1 Revenue', value: '$10-30M' },
        { label: 'Phase 2 Revenue', value: '$50-100M+' },
        { label: 'Phase 3 Revenue', value: '$200M-500M+' },
        { label: 'Gross Margins', value: '60-70%' }
      ]
    },
    taxonomy: {
      primary: SlideCategoryPrimary.VALIDATION,
      secondary: SlideCategorySecondary.VALIDATION_FINANCIALS,
      contentTypes: [ContentType.DATA_METRICS, ContentType.STRATEGIC],
      displayMode: DisplayMode.FULL,
      investorLevel: InvestorLevel.VC,
      importance: ContentImportance.CRITICAL,
      duration: 120,
      order: 11
    }
  },

  // Slide 12: Team / The Ask
  {
    id: 'pitch-team-ask',
    page: 'ideas',
    title: 'Team / The Ask',
    subtitle: 'Building the Sovereign Drone Ecosystem',
    investorLevel: 'all',
    importance: 'high',
    imageUrl: pexel(1108090),
    position: [1.2, -27.5, 0],
    rotation: [0, 0, 0],
    modelConfig: {
      path: '/assets/models/neuron/neuron.gltf',
      scale: 1.0,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      animation: { type: 'pulse', speed: 0.5, amplitude: 0.2 }
    },
    layout: { type: 'grid' },
    drilldown: { enabled: false },
    content: {
      heading: 'Founder & Funding Ask',
      paragraphs: [
        {
          subtitle: 'Team',
          description: 'Michael Douglas, Founder - Software Engineer, Tesla (Vision Systems). Expertise: ML & Computer Vision Automation, International Industrial Sourcing. Vision: Founder of the Sovereign Stack.'
        },
        {
          subtitle: 'Key Hires Needed',
          description: 'Manufacturing/AI engineers, Regulatory experts.'
        },
        {
          subtitle: 'The Ask',
          description: 'Funding Amount: $5-10M seed/bridge (suggested). Use of Funds: Pillar 1 (FaaS) contract entry, portal registration. Pillar 2 (V1 Hardware) component R&D, production line setup. Pillar 3 (Vertical Ecosystem) service development, mission solutions. R&D, compliance, team scaling.'
        },
        {
          subtitle: 'Timeline',
          description: 'Funding: Q1-Q2 2026. Ideal Investor Profile: Defense-focused VCs, strategic aerospace partners.'
        }
      ],
      highlights: [
        { subtitle: 'Founder', description: 'Michael Douglas - Tesla Vision Systems' },
        { subtitle: 'Funding Ask', description: '$5-10M seed/bridge' },
        { subtitle: 'Timeline', description: 'Q1-Q2 2026' },
        { subtitle: 'Investor Profile', description: 'Defense-focused VCs, aerospace partners' }
      ]
    },
    taxonomy: {
      primary: SlideCategoryPrimary.CTA,
      secondary: SlideCategorySecondary.CTA_TEAM,
      contentTypes: [ContentType.PEOPLE, ContentType.STRATEGIC, ContentType.DATA_METRICS],
      displayMode: DisplayMode.FULL,
      investorLevel: InvestorLevel.ALL,
      importance: ContentImportance.CRITICAL,
      duration: 120,
      order: 12
    }
  },

  // Slide 13: Founding Partner Expertise Umbrellas
  (() => {
    // Get the 4 core umbrellas (excluding optional business umbrella)
    const coreUmbrellas = allExpertiseUmbrellas.filter(u => u.id !== 'umbrella-5-business');
    const summary = getFoundingPartnerSummary();
    
    const umbrellaHighlights = coreUmbrellas.map(umbrella => {
      const budget = formatBudgetRange(umbrella);
      const phases = getPhaseSummary(umbrella);
      const topResponsibilities = umbrella.coreResponsibilities.slice(0, 2).join(', ');
      return {
        subtitle: `${umbrella.name} (${umbrella.codeName})`,
        description: `${budget} | ${topResponsibilities} | ${phases}`
      };
    });

    const umbrellaStats = [
      { label: 'Core Expertise Umbrellas', value: summary.totalExpertiseUmbrellas.toString() },
      { label: 'Total Budget Range', value: `$${summary.totalBudget.minMillions}M–$${summary.totalBudget.maxMillions}M` },
      { label: 'Timeline', value: summary.timeline }
    ];

    return {
      id: 'umbrella',
      page: 'ideas',
      title: 'Founding Partner Expertise Umbrellas',
      subtitle: '4-5 Core Expertise Areas for FAA Part 108 Certification',
      investorLevel: 'all',
      importance: 'high',
      imageUrl: pexel(3184436),
      position: [1.2, -30, 0],
      rotation: [0, 0, 0],
      modelConfig: {
        path: '/assets/models/2_plane_draco.glb',
        scale: 1.3,
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        animation: { type: 'float', speed: 0.4, amplitude: 0.3 }
      },
      layout: { type: 'grid' },
      drilldown: { enabled: true, layout: 'detail' },
      content: {
        heading: 'Expertise Requirements for Part 108 Certification',
        paragraphs: [
          {
            subtitle: 'Overview',
            description: 'FAA Part 108 certification requires deep expertise across 4-5 core areas. Each expertise umbrella represents a founding partner role with specific skills, budget requirements, and phase-based hiring needs. Total budget: $3.15M–$3.95M across 18–24 months.'
          },
          {
            subtitle: 'Approach',
            description: 'Rather than traditional hiring tiers, we structure expertise as "umbrellas" where each founding partner covers a domain. This ensures critical knowledge is embedded from day one and scales through supporting staff hires as we progress through certification phases.'
          }
        ],
        highlights: umbrellaHighlights,
        stats: umbrellaStats
      },
      taxonomy: {
        primary: SlideCategoryPrimary.VALIDATION,
        secondary: SlideCategorySecondary.VALIDATION_EXPERT_VALIDATION,
        contentTypes: [ContentType.PEOPLE, ContentType.STRATEGIC, ContentType.DATA_METRICS],
        displayMode: DisplayMode.FULL,
        investorLevel: InvestorLevel.ALL,
        importance: ContentImportance.HIGH,
        duration: 120,
        order: 13
      }
    };
  })()
];

/**
 * Export the sections for use in ideas page components
 */
export const ideasSections = ideasPitchDeckSections;

