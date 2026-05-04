/**
 * Ideas Page - Extended Pitch Deck Configuration
 * Phase 2 Expansion: +4 New Slides
 *
 * Date: January 28, 2026
 * Added Slides: Competitive Moat, Derisking, Market Validation, Tech Stack
 * Total Export: 16 slides
 */

import { UnifiedSection } from '@/lib/config/content';
import { ideasPitchDeckSections } from './ideasPitchDeck.config';
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
 * Slide 14: Competitive Moat
 * Why competitors can't replicate this
 */
const pitchCompetitiveMoat: UnifiedSection = {
  id: 'pitch-competitive-moat',
  page: 'ideas',
  title: 'Competitive Moat: Why This Scales First',
  subtitle: 'Talent Asymmetry, Manufacturing Excellence, Regulatory Advantage',
  imageUrl: pexel(3184436),
  position: [1.2, -32.5, 0],
  rotation: [0, 0, 0],
  modelConfig: {
    path: '/assets/models/fortress_draco.glb',
    scale: 1.1,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    animation: { type: 'rotate', speed: 0.4 }
  },
  layout: { type: 'grid' },
  drilldown: { enabled: true, layout: 'detail' },
  content: {
    heading: 'Three Unfair Advantages',
    paragraphs: [
      {
        subtitle: 'Talent Asymmetry',
        description: 'Founder has rare combination: Tesla Vision Systems background (ML, computer vision, production scaling) + international industrial sourcing expertise. Most drone founders = hobbyists or traditional defense. This team = software-first manufacturing. Competitors cannot hire this profile overnight.'
      },
      {
        subtitle: 'Manufacturing Excellence',
        description: 'AI-driven quality orchestration + productionized open-source stacks (PX4, ArduPilot, NASA cFS) create a 10-20x scaling advantage. Inspection at 1000+ components/sec vs. manual 50-100/sec. Defect rates <1 PPM vs. industry 5-20 PPM. Capital requirement: $20-50M per facility. This creates an entry barrier for competitors.'
      },
      {
        subtitle: 'Regulatory Advantage',
        description: 'Early DO-178C compliance + FAA Part 108 pre-certification positions us for the March–April 2026 final rule. First-mover advantage in BVLOS certification. Competitors will lag 12-24 months.'
      },
      {
        subtitle: 'Ecosystem Lock-In',
        description: 'Infinite flight glider relays + recurring services create switching costs. Once customers depend on our relay networks for BVLOS operations, switching is prohibitively expensive. High customer lifetime value.'
      }
    ],
    highlights: [
      { subtitle: 'Talent Asymmetry', description: 'Software-first manufacturing rare profile' },
      { subtitle: 'Manufacturing Excellence', description: '1000+ components/sec, <1 PPM defects' },
      { subtitle: 'Regulatory Advantage', description: 'FAA Part 108 pre-certification first-mover' },
      { subtitle: 'Ecosystem Lock-In', description: 'Switching costs from recurring services' }
    ]
  },
  taxonomy: {
    primary: SlideCategoryPrimary.POSITIONING,
    secondary: SlideCategorySecondary.POSITIONING_COMPETITIVE_MOAT,
    contentTypes: [ContentType.STRATEGIC, ContentType.NARRATIVE],
    displayMode: DisplayMode.FULL,
    investorLevel: InvestorLevel.ALL,
    importance: ContentImportance.HIGH,
    duration: 120,
    order: 14
  }
};

/**
 * Slide 15: Derisking
 * What de-risks this bet
 */
const pitchDerisking: UnifiedSection = {
  id: 'pitch-derisking',
  page: 'ideas',
  title: 'Derisking: How We Derisk Fast',
  subtitle: 'Phased Validation, Contract-First Revenue, Regulatory Pre-Work',
  imageUrl: pexel(3184431),
  position: [1.2, -35, 0],
  rotation: [0, 0, 0],
  modelConfig: {
    path: '/assets/models/shield_draco.glb',
    scale: 1.0,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    animation: { type: 'pulse', speed: 0.5, amplitude: 0.15 }
  },
  layout: { type: 'timeline' },
  drilldown: { enabled: true, layout: 'detail' },
  content: {
    heading: 'Derisk Through Phased Validation',
    paragraphs: [
      {
        subtitle: 'Market Risk → Contract-First Revenue',
        description: 'Do not build without contracts. FaaS entry (Pillar 1) generates revenue BEFORE V1 hardware spending. Portal registration (SAM.gov, MFG.com) validates demand. First contracts within 6 months. Revenue de-risks the entire operation.'
      },
      {
        subtitle: 'Manufacturing Risk → AI-Driven Quality Orchestration',
        description: 'Productionized open-source (PX4, ArduPilot, NASA cFS) reduces R&D risk. DO-178C automated traceability eliminates manual compliance bottlenecks. Pilot production line in Phase 1 (2025) validates manufacturing before scaling.'
      },
      {
        subtitle: 'Regulatory Risk → Early FAA Coordination',
        description: 'Founding partner expertise umbrellas cover FAA coordination from day one. Part 108 pre-certification work begins Q1 2025. By March–April 2026 final rule, we are already certified. Competitors scramble; we scale.'
      },
      {
        subtitle: 'Technology Risk → Componentized Architecture',
        description: 'No monolithic platform. Each component (GaN power stages, flight controllers, sensors) is independently validated. Failures are isolated. Componentization enables fast iteration.'
      }
    ],
    highlights: [
      { subtitle: 'Market Risk', description: 'Contracts fund development, not venture capital' },
      { subtitle: 'Manufacturing Risk', description: 'Pilot production validates before scaling' },
      { subtitle: 'Regulatory Risk', description: 'FAA coordination from day one' },
      { subtitle: 'Technology Risk', description: 'Componentized = fast iteration' }
    ],
    stats: [
      { label: 'FaaS Revenue Timeline', value: '6 months' },
      { label: 'Part 108 Pre-Certification', value: 'Q1 2025 start' },
      { label: 'Pilot Production', value: 'Phase 1 (2025-2026)' }
    ]
  },
  taxonomy: {
    primary: SlideCategoryPrimary.VALIDATION,
    secondary: SlideCategorySecondary.VALIDATION_DERISKING,
    contentTypes: [ContentType.STRATEGIC, ContentType.DATA_METRICS],
    displayMode: DisplayMode.FULL,
    investorLevel: InvestorLevel.ALL,
    importance: ContentImportance.HIGH,
    duration: 120,
    order: 15
  }
};

/**
 * Slide 16: Market Validation
 * Customer Discovery & Pipeline
 */
const pitchValidation: UnifiedSection = {
  id: 'pitch-validation',
  page: 'ideas',
  title: 'Market Validation: Customer Discovery & Pipeline',
  subtitle: 'Proving Demand Without LOIs',
  imageUrl: pexel(3861968),
  position: [1.2, -37.5, 0],
  rotation: [0, 0, 0],
  modelConfig: {
    path: '/assets/models/handshake_draco.glb',
    scale: 1.0,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    animation: { type: 'float', speed: 0.4, amplitude: 0.2 }
  },
  layout: { type: 'grid' },
  content: {
    heading: 'Validation Through Active Customer Discovery',
    paragraphs: [
      {
        subtitle: 'Target Customer Profile',
        description: 'Primary: Defense contractors (Anduril, Skydio, RTX, L3Harris tier integrators). Secondary: Commercial operators (utilities, construction, agriculture). Tertiary: Government agencies (EPA, USGS, local law enforcement). All segments urgently need productionized drones + BVLOS compliance.'
      },
      {
        subtitle: 'Validation Roadmap',
        description: 'Phase 1 (Q1-Q2 2025): Portal registration + initial outreach. Pipeline Target: 10-20 qualified RFQs. Phase 2 (Q3-Q4 2025): Pilot partnerships + first contracts. Pipeline Target: 3-5 active pilot agreements. Phase 3 (2026): Scale to full production. Pipeline Target: $10-30M in signed contracts.'
      }
    ],
    highlights: [
      { subtitle: 'Pipeline Target', description: '$10-30M in Phase 1 contracts' },
      { subtitle: 'Pilot Partnerships', description: '3-5 active pilot agreements by Q4 2025' },
      { subtitle: 'RFP Response Rate', description: '10-20 qualified RFQs by Q2 2025' }
    ]
  },
  validation: {
    proofPoints: [
      'Defense Demand: USMC CUAS ($642M), DIU Blue UAS (23 platforms), DIU Replicator all driving procurement. Customers actively seeking qualified manufacturers.',
      'Regulatory Tailwind: FAA Part 108 final rule (Q1 2026) forces all operators to upgrade. Window of opportunity: 12-18 months for certified suppliers.',
      'Supply Chain Gaps: Current manufacturers have 12-24 week lead times. We target 4-8 week delivery. This speed advantage converts to contracts.',
      'Margin Profile: Customers willing to pay 15-25% premium for regulatory compliance + speed. Gross margins 60-70% sustainable.'
    ]
  },
  drilldown: { enabled: true, layout: 'detail' },
  taxonomy: {
    primary: SlideCategoryPrimary.VALIDATION,
    secondary: SlideCategorySecondary.VALIDATION_MARKET_PROOF,
    contentTypes: [ContentType.DATA_METRICS, ContentType.STRATEGIC],
    displayMode: DisplayMode.FULL,
    investorLevel: InvestorLevel.ALL,
    importance: ContentImportance.HIGH,
    duration: 120,
    order: 16
  }
};

/**
 * Slide 17: Tech Stack
 * Productionized Open-Source + Proprietary Manufacturing
 */
const pitchTechStack: UnifiedSection = {
  id: 'pitch-tech-stack',
  page: 'ideas',
  title: 'Tech Stack: Productionized Open-Source + Proprietary Manufacturing',
  subtitle: 'Proven Architectures, Not R&D Bets',
  imageUrl: pexel(3184436),
  position: [1.2, -40, 0],
  rotation: [0, 0, 0],
  modelConfig: {
    path: '/assets/models/circuit_board_draco.glb',
    scale: 1.1,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    animation: { type: 'rotate', speed: 0.3 }
  },
  layout: { type: 'gallery' },
  content: {
    heading: 'Three-Layer Architecture',
    paragraphs: [
      {
        subtitle: 'Why This Approach',
        description: 'Productionized open-source = proven, community-tested, no R&D risk. Proprietary manufacturing = where we create moat + defensibility. This combination enables fast time-to-market with sustainable competitive advantage.'
      }
    ],
    highlights: [
      { subtitle: 'Autonomy Stack', description: 'PX4, ArduPilot, NASA cFS with DO-178C compliance' },
      { subtitle: 'Manufacturing AI', description: 'Vision-based quality orchestration at 1000+ components/sec' },
      { subtitle: 'Service Layer', description: 'Infinite flight relays, BVLOS automation, fleet orchestration' }
    ]
  },
  drilldown: {
    enabled: true,
    layout: 'modal',
    subcategories: [
      {
        id: 'autonomy-stack',
        title: 'Autonomy Stack',
        icon: 'autopilot',
        content: {
          summary: 'Flight control software with production-grade reliability and regulatory compliance',
          details: [
            'PX4 Autopilot: Primary flight controller. 10+ years production history. DO-178C certification path established. Used by 1000+ commercial operators worldwide.',
            'ArduPilot Suite: Secondary option for mid-tier platforms. Extended endurance tuning. BVLOS-specific enhancements. Community of 50K+ developers ensures rapid bug fixes.',
            'NASA cFS Framework: Advanced autonomy for swarm operations. Modular component architecture. Enables complex mission solutions (surveillance, logistics, coordinated swarms). Already used in military UAVs.',
            'DO-178C Integration: Automated traceability from requirements → code → verification. Eliminates manual compliance bottleneck. Reduces certification time 6-12 months.'
          ]
        }
      },
      {
        id: 'manufacturing-ai',
        title: 'Manufacturing AI',
        icon: 'robot',
        content: {
          summary: 'Proprietary vision-based quality orchestration for production-scale inspection',
          details: [
            'Vision-Based Inspection: Real-time component defect detection using computer vision. Replaces manual QA. Speed: 1000+ components/second vs. manual 50-100/second. Accuracy: <1 PPM defect rate.',
            'Automated Traceability: Every component tracked through production chain. Serial numbers, test results, regulatory compliance stamps embedded in digital twin. Enables rapid recall if needed.',
            'Predictive Maintenance: ML models predict production line failures before they occur. Minimizes downtime. Maximizes asset utilization (target: 85-95% vs. industry 40-50%).',
            'GaN Power Stage Integration: Proprietary testing suite for GaN semiconductor manufacturing. Superior efficiency, power density, thermal performance vs. traditional MOSFET stages.'
          ]
        }
      },
      {
        id: 'service-layer',
        title: 'Service Layer',
        icon: 'cloud',
        content: {
          summary: 'Recurring revenue services that create ecosystem lock-in',
          details: [
            'Infinite Flight Glider Relays: Low-power, solar-rechargeable relay drones extend BVLOS range indefinitely. Create decentralized relay networks. Unique to our ecosystem. High switching costs (recurring monthly fees).',
            'BVLOS Operations Automation: AI-driven flight planning + mission orchestration. Customers upload mission parameters. System manages all regulatory compliance, flight optimization, safety margins. Reduces operator workload 80%+.',
            'Fleet Orchestration Platform: Manage 10s–1000s of drones from single command center. Swarm operations, coordinated surveillance, distributed logistics. API-first architecture enables third-party integrations.',
            'Recurring Service Contracts: Monthly/annual subscriptions for relay networks, automation services, fleet orchestration. Gross margins: 80-90% (vs. 60-70% manufacturing). High customer lifetime value.'
          ]
        }
      }
    ]
  },
  taxonomy: {
    primary: SlideCategoryPrimary.SOLUTION,
    secondary: SlideCategorySecondary.SOLUTION_TECH_STACK,
    contentTypes: [ContentType.TECHNICAL, ContentType.STRATEGIC],
    displayMode: DisplayMode.FULL,
    investorLevel: InvestorLevel.ALL,
    importance: ContentImportance.HIGH,
    duration: 120,
    order: 17
  }
};

/**
 * Extended pitch deck: Base 12 slides + 4 Phase 2 slides = 16 total
 */
export const ideasPitchDeckExtended = [
  ...ideasPitchDeckSections,
  pitchCompetitiveMoat,
  pitchDerisking,
  pitchValidation,
  pitchTechStack
];

/**
 * Export named exports for individual access
 */
export {
  pitchCompetitiveMoat,
  pitchDerisking,
  pitchValidation,
  pitchTechStack
};
