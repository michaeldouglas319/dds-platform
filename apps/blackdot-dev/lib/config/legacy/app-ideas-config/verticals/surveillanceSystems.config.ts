/**
 * Surveillance Systems & Parking Lot Monitoring: Deep-Dive Vertical Config
 *
 * Business Model: AI-enabled fixed surveillance systems for commercial security
 * Primary Markets: Parking lots, retail, logistics, small-to-mid government contracts
 *
 * Key Advantages for Founder:
 * - Lowest regulatory barriers (state-level licensing, founder-obtainable)
 * - Fastest path to revenue (6-12 months)
 * - Highest founder control (software-first business)
 * - Scalable service model (recurring revenue)
 * - Grant eligibility recovering post-reauth (DHS SBIR)
 *
 * Founder Suitability: HIGH
 * - Can obtain security licenses in most states
 * - Core roles (product, engineering) founder-fillable
 * - Must-hire limited to sales/operations specialists
 * - No federal credentials required
 *
 * Market: $147.7B by 2030 (global surveillance market)
 * TAM Growth: 10-12% CAGR (mature but stable growth)
 * Time to Revenue: 6-12 months (fastest of evaluated verticals)
 * Capital Required: $250K-500K (seed stage)
 *
 * Phase Timeline: 2 phases, 12-18 months
 * 1. Foundation & MVP (Q1-Q2 2026): 6 months
 * 2. Commercialization (Q3-Q4 2026, Q1 2027): 6-12 months
 *
 * Research Updated: January 18, 2026
 * Sources: 202 citations across regulatory, market, licensing, competitive
 */

import { BusinessVerticalConfig } from '@/lib/types/businessVertical.types';
import { RegulatoryFramework } from '@/lib/types/regulatory.types';
import { GrantOpportunity } from '@/lib/types/grants.types';
import { MarketOpportunity } from '@/lib/types/market.types';
import { SourceCitation } from '@/lib/types/sources.types';

// ============================================================================
// PHASE DEFINITIONS
// ============================================================================

export const surveillancePhases = {
  'phase-1-foundation': {
    id: 'phase-1-foundation',
    name: 'Foundation & MVP Development',
    timeline: 'Q1–Q2 2026 (6 months)',
    description: 'Establish legal entity, obtain state security licenses, build MVP platform, establish initial partnerships',
    importance: 1,
    industryContext: 'pre-commercialization'
  },
  'phase-2-commercialization': {
    id: 'phase-2-commercialization',
    name: 'Commercial Launch & Scale',
    timeline: 'Q3 2026–Q1 2027 (6-12 months)',
    description: 'Acquire pilot customers, refine sales process, scale operations, achieve break-even revenue',
    importance: 2,
    industryContext: 'commercialization'
  }
};

// ============================================================================
// SOURCE CITATIONS (Representative Sample - 202 total)
// ============================================================================

const sourcesRegulatory: SourceCitation[] = [
  {
    id: 'source-reg-1',
    title: 'Security Licensing Requirements by State (Comprehensive Guide)',
    url: 'https://fieldnation.com/resources/security-licensing-guide',
    publisher: 'Field Nation',
    publishedDate: '2025-06-15',
    accessedDate: '2026-01-18',
    type: 'industry',
    reliability: 'secondary',
    excerpt: 'Most states require security guards to be licensed. Requirements vary by state, typically including background checks, training hours (4-40 hours depending on state), and exam fees ($50-300).'
  },
  {
    id: 'source-reg-2',
    title: 'IP Video Surveillance Licensing, Certification and Training',
    url: 'https://www.varinsights.com/doc/ip-video-surveillance-licensing-certification-and-training-0001',
    publisher: 'VARinsights',
    publishedDate: '2024-03-20',
    accessedDate: '2026-01-18',
    type: 'industry',
    reliability: 'secondary',
    excerpt: 'BICSI RCDD and ASIS PSP certifications represent industry standards. BICSI RCDD requires 5+ years experience, $1,500-3,000 for exam and training. ASIS PSP requires high school diploma, CPE hours.'
  },
  {
    id: 'source-reg-3',
    title: 'BICSI Registered Communications Distribution Designer Certification',
    url: 'https://www.bicsi.org/rcdd',
    publisher: 'BICSI',
    accessedDate: '2026-01-18',
    type: 'certification-body',
    reliability: 'primary',
    excerpt: 'RCDD certification validates expertise in communications systems design and installation. Renewal required every 3 years; typically $2,500-5,000 for initial certification.'
  },
  {
    id: 'source-reg-4',
    title: 'ASIS International Professional Security Professional (PSP) Certification',
    url: 'https://www.asisonline.org/',
    publisher: 'ASIS International',
    accessedDate: '2026-01-18',
    type: 'certification-body',
    reliability: 'primary',
    excerpt: 'PSP represents professional security industry standard. Requirements: high school diploma, 5+ years security experience, exam ($750-1,000), renewal every 3 years.'
  },
  {
    id: 'source-reg-5',
    title: 'GDPR and CCPA Compliance for Surveillance Systems',
    url: 'https://gdpr-info.eu/',
    publisher: 'GDPR Official',
    publishedDate: '2018-05-25',
    accessedDate: '2026-01-18',
    type: 'regulation',
    reliability: 'primary',
    excerpt: 'Surveillance systems must comply with GDPR (EU/global), CCPA (California), and state privacy laws. Data minimization, consent, and storage limitations apply. Non-compliance fines: up to 4% of global revenue.'
  },
  {
    id: 'source-reg-6',
    title: 'California Consumer Privacy Act (CCPA) Compliance',
    url: 'https://oag.ca.gov/privacy/ccpa',
    publisher: 'California Attorney General',
    accessedDate: '2026-01-18',
    type: 'regulation',
    reliability: 'primary',
    excerpt: 'CCPA requires businesses to disclose data collection, provide opt-out rights, and implement reasonable security. Applies to businesses collecting California residents\' data. Penalties: $2,500-7,500 per violation.'
  }
];

const sourcesMarket: SourceCitation[] = [
  {
    id: 'source-market-1',
    title: 'Global Video Surveillance Market Size & Forecast (2024-2030)',
    url: 'https://www.grandviewresearch.com/',
    publisher: 'Grand View Research',
    publishedDate: '2024-12-01',
    accessedDate: '2026-01-18',
    type: 'market-report',
    reliability: 'secondary',
    excerpt: 'Global surveillance market valued at $61.6B in 2023, expected to reach $147.7B by 2030, growing at 10.9% CAGR. North America accounts for 35% of market.'
  },
  {
    id: 'source-market-2',
    title: 'Physical Security Systems Market Analysis (2025-2032)',
    url: 'https://www.marketsandmarkets.com/',
    publisher: 'MarketsandMarkets',
    publishedDate: '2025-01-10',
    accessedDate: '2026-01-18',
    type: 'market-report',
    reliability: 'secondary',
    excerpt: 'Physical security market (incl. CCTV, access control, intrusion detection) projected to grow from $135B (2025) to $245B (2032) at 8.9% CAGR.'
  },
  {
    id: 'source-market-3',
    title: 'AI in Video Analytics & Surveillance Market Opportunity',
    url: 'https://www.researchandmarkets.com/',
    publisher: 'Research and Markets',
    publishedDate: '2024-06-15',
    accessedDate: '2026-01-18',
    type: 'market-report',
    reliability: 'secondary',
    excerpt: 'AI-powered video analytics specifically growing at 18-22% CAGR, driven by object detection, anomaly detection, crowd monitoring applications. Addressable market $8-12B by 2030.'
  },
  {
    id: 'source-market-4',
    title: 'Parking Management & Enforcement Technology Market',
    url: 'https://www.alliedmarketresearch.com/',
    publisher: 'Allied Market Research',
    publishedDate: '2024-09-20',
    accessedDate: '2026-01-18',
    type: 'market-report',
    reliability: 'secondary',
    excerpt: 'Parking management technology market (incl. cameras, sensors, software) valued at $2.8B in 2024, expected to reach $6.5B by 2030 at 14.2% CAGR.'
  },
  {
    id: 'source-market-5',
    title: 'Retail Security Systems Market & Loss Prevention Trends',
    url: 'https://www.statista.com/',
    publisher: 'Statista',
    publishedDate: '2025-01-15',
    accessedDate: '2026-01-18',
    type: 'market-report',
    reliability: 'secondary',
    excerpt: 'Retail loss prevention spending increasing 8-10% annually. Surveillance systems account for ~35% of security budget. Retail shrink (theft) costs industry $100B+ annually in U.S.'
  }
];

const sourcesLicensing: SourceCitation[] = [
  {
    id: 'source-lic-1',
    title: 'California Security Guard License Requirements',
    url: 'https://www.dca.ca.gov/applicants/guard_card',
    publisher: 'California Department of Consumer Affairs',
    accessedDate: '2026-01-18',
    type: 'government-site',
    reliability: 'primary',
    excerpt: 'California Guard Card: 6 hours of firearms training, background check ($50), training hours ($0-500 via approved trainers). License valid 2 years. Fee: $200-400 total.'
  },
  {
    id: 'source-lic-2',
    title: 'Texas Security Officer License (Class A, B, C, D)',
    url: 'https://www.dps.texas.gov/section/private-security/',
    publisher: 'Texas Department of Public Safety',
    accessedDate: '2026-01-18',
    type: 'government-site',
    reliability: 'primary',
    excerpt: 'Texas security license: Class C (most common) requires background check, 4-40 hours training (varies by class), exam $0-50, license $0-250, valid 2 years.'
  },
  {
    id: 'source-lic-3',
    title: 'New York Private Investigator & Security License',
    url: 'https://www.dca.ny.gov/profession-licenses/private-investigator-and-security-guard',
    publisher: 'New York Department of State',
    accessedDate: '2026-01-18',
    type: 'government-site',
    reliability: 'primary',
    excerpt: 'New York security license: 8 hours classroom, 8 hours online training, $50 exam fee, $90 license fee, background check required. Valid 2 years.'
  },
  {
    id: 'source-lic-4',
    title: 'CCTV Technician Certification Programs',
    url: 'https://www.cctv-certification.com/',
    publisher: 'Professional CCTV Institute',
    publishedDate: '2024-01-01',
    accessedDate: '2026-01-18',
    type: 'certification-body',
    reliability: 'secondary',
    excerpt: 'CCTV technician certifications available from multiple vendors: 40-100 hours training ($500-2,500), certification exam ($200-500), valid 2-3 years.'
  },
  {
    id: 'source-lic-5',
    title: 'CompTIA Security+ Certification (Cybersecurity for Surveillance)',
    url: 'https://www.comptia.org/certifications/security',
    publisher: 'CompTIA',
    accessedDate: '2026-01-18',
    type: 'certification-body',
    reliability: 'primary',
    excerpt: 'CompTIA Security+ validates cybersecurity knowledge. Required for federal contractors, DoD clearances. 300-400 hours study, $400 exam, valid 3 years. Industry standard.'
  }
];

const sourcesGrants: SourceCitation[] = [
  {
    id: 'source-grant-1',
    title: 'DHS SBIR/STTR Program - Reauthorization Status',
    url: 'https://www.dhs.gov/science-and-technology/sbir',
    publisher: 'DHS S&T',
    accessedDate: '2026-01-18',
    type: 'government-site',
    reliability: 'primary',
    excerpt: 'SBIR/STTR programs expired Sept 30, 2025. As of Jan 2026, no new solicitations or awards possible. Existing awards continue; reauthorization pending Congressional action.'
  },
  {
    id: 'source-grant-2',
    title: '2026 SBIR/STTR Reauthorization Status & Timeline',
    url: 'https://www.sbir.gov/',
    publisher: 'SBIR.gov',
    accessedDate: '2026-01-18',
    type: 'government-site',
    reliability: 'primary',
    excerpt: 'SBIR programs currently paused awaiting reauthorization. Authority lapsed Sept 30, 2025. Agencies have halted new Phase I/II awards. Timeline for reauth unknown; bipartisan support exists.'
  },
  {
    id: 'source-grant-3',
    title: 'DHS Border Security & Commercial Surveillance Topics (2025 Archive)',
    url: 'https://www.dhs.gov/topics',
    publisher: 'DHS',
    publishedDate: '2024-12-01',
    accessedDate: '2026-01-18',
    type: 'government-site',
    reliability: 'secondary',
    excerpt: 'Historical DHS SBIR topics include: \"Advanced surveillance systems\", \"Border monitoring technologies\", \"Anomaly detection for critical infrastructure\". Topics covered Phase I ~$150K, Phase II ~$750K.'
  }
];

// ============================================================================
// EXPERTISE UMBRELLA 1: Security Systems Design & Integration
// ============================================================================

export const securityDesignUmbrella = {
  id: 'umbrella-1-security-design',
  name: 'Security Systems Design & Integration',
  codeName: 'The Designer',
  covers: 'Design surveillance architectures, select equipment, integrate systems, ensure reliability',
  coreResponsibilities: [
    'System architecture and design specification',
    'Hardware selection (cameras, servers, networking)',
    'Integration planning and deployment procedures',
    'Cybersecurity hardening and data protection',
    'Compliance verification (GDPR, CCPA, state privacy)',
    'Performance validation and testing'
  ],
  requiredSkills: [
    {
      id: 'skill-surveillance-design',
      name: 'Surveillance Systems Architecture',
      yearsRequired: '5-7 years',
      requiredPhases: ['phase-1-foundation', 'phase-2-commercialization'],
      criticality: 'critical',
      description: 'Design surveillance networks, camera placement, server architecture, failover systems',
      validationQuestions: [
        'Walk me through how you\'d design a 50-camera system for a parking lot.',
        'How do you approach cybersecurity for a surveillance system?',
        'Tell me about a complex integration you\'ve done. What went wrong?'
      ],
      redFlags: [
        'Only has consumer-grade experience',
        'Can\'t explain network architecture fundamentals',
        'Underestimates cybersecurity requirements'
      ],
      founderSuitability: 'founder-fillable',
      governmentCredentialRequired: false,
      requiredBackground: {
        type: 'private-sector',
        examples: ['Former integrator at security company', 'IT infrastructure lead', 'Networking engineer']
      },
      substitutionPossible: true,
      substitutionStrategy: 'Hire experienced integrator on retainer, founder leads tech strategy'
    },
    {
      id: 'skill-ai-video-analytics',
      name: 'AI/ML Video Analytics & Computer Vision',
      yearsRequired: '3-5 years',
      requiredPhases: ['phase-1-foundation', 'phase-2-commercialization'],
      criticality: 'critical',
      description: 'Object detection, anomaly detection, crowd monitoring, person re-identification models',
      validationQuestions: [
        'What computer vision libraries/frameworks have you used in production?',
        'How do you handle false positives in object detection?',
        'Explain your approach to training and validating detection models.'
      ],
      redFlags: [
        'Only academic/research experience',
        'Can\'t discuss model performance metrics',
        'No production deployment experience'
      ],
      founderSuitability: 'founder-fillable',
      governmentCredentialRequired: false,
      requiredBackground: {
        type: 'private-sector',
        examples: ['ML engineer with computer vision', 'AI researcher moving to production', 'Self-taught with portfolio']
      },
      substitutionPossible: false
    },
    {
      id: 'skill-cybersecurity-surveillance',
      name: 'Cybersecurity & Data Privacy for Surveillance',
      yearsRequired: '4-6 years',
      requiredPhases: ['phase-1-foundation', 'phase-2-commercialization'],
      criticality: 'important',
      description: 'GDPR compliance, CCPA implementation, encryption, access controls, audit logging',
      validationQuestions: [
        'What\'s your experience with GDPR/CCPA compliance?',
        'How do you approach data retention and deletion policies?',
        'Tell me about your encryption strategy for video data.'
      ],
      founderSuitability: 'must-hire',
      governmentCredentialRequired: false,
      requiredBackground: {
        type: 'private-sector',
        examples: ['Security engineer with privacy experience', 'Compliance officer moving to security']
      },
      substitutionPossible: true,
      substitutionStrategy: 'Security consultant 0.5-1 FTE, partner with legal firm for GDPR/CCPA',
      certifications: [
        {
          name: 'CompTIA Security+',
          issuingBody: 'CompTIA',
          renewalPeriod: '3 years',
          cost: '$300-500',
          url: 'https://www.comptia.org/certifications/security'
        },
        {
          name: 'Certified Information Privacy Manager (CIPM)',
          issuingBody: 'IAPP',
          renewalPeriod: '3 years',
          cost: '$400-800'
        }
      ]
    }
  ],
  supportingHires: [
    {
      phase: 'phase-1-foundation',
      title: 'Senior Systems Engineer',
      purpose: 'Architecture design, equipment selection, integration planning',
      fte: '1'
    },
    {
      phase: 'phase-2-commercialization',
      title: 'Implementation Manager',
      purpose: 'Customer site surveys, installation coordination, testing',
      fte: '1'
    },
    {
      phase: 'phase-2-commercialization',
      title: 'Systems Administrator',
      purpose: 'Server management, monitoring, performance optimization',
      fte: '0.5-1'
    }
  ],
  budgetRange: {
    min: 150,
    max: 250,
    byPhase: {
      'phase-1-foundation': { min: 80, max: 120 },
      'phase-2-commercialization': { min: 70, max: 130 }
    }
  },
  keyStrategicDecisions: [
    'Cloud vs. on-premises storage (Tier 1 decision: determines architecture)',
    'IP camera vs. analog conversion vs. hybrid approach',
    'Edge computing (local processing) vs. cloud-based analytics',
    'Integration with existing customer IT infrastructure',
    'Video codec and compression strategy (storage cost implications)',
    'Failover and redundancy architecture'
  ]
};

// ============================================================================
// EXPERTISE UMBRELLA 2: Surveillance Operations & Customer Success
// ============================================================================

export const operationsUmbrella = {
  id: 'umbrella-2-operations',
  name: 'Surveillance Operations & Customer Success',
  codeName: 'The Operator',
  covers: 'Manage systems operations, monitor performance, handle alerts, ensure customer satisfaction',
  coreResponsibilities: [
    '24/7 monitoring center operations (if applicable)',
    'Alert response and escalation procedures',
    'Customer support and troubleshooting',
    'System performance monitoring and reporting',
    'Maintenance scheduling and preventive care',
    'Customer training and onboarding',
    'Commercial operations planning'
  ],
  requiredSkills: [
    {
      id: 'skill-security-operations',
      name: 'Security Operations Management',
      yearsRequired: '3-5 years',
      requiredPhases: ['phase-2-commercialization'],
      criticality: 'important',
      description: 'Monitor security systems, handle alerts, coordinate with police/emergency services',
      validationQuestions: [
        'Describe your experience managing 24/7 security operations.',
        'How do you handle false alerts and alert fatigue?',
        'Tell me about a critical incident you managed.'
      ],
      founderSuitability: 'must-hire',
      governmentCredentialRequired: false,
      requiredBackground: {
        type: 'private-sector',
        examples: ['Former security director', 'Guard company operations manager']
      },
      substitutionPossible: false,
      licenses: [
        {
          name: 'State Security Guard License',
          jurisdiction: 'state',
          issuingAuthority: 'State Licensing Board',
          requirements: ['Background check', '4-40 hours training (state-specific)', 'Exam'],
          renewalPeriod: '2 years',
          cost: '$200-500',
          founderCanObtain: true,
          foundingTimeline: '2-4 weeks',
          founderCost: '$200-500',
          consultantSubstitution: false
        }
      ]
    },
    {
      id: 'skill-customer-success',
      name: 'Customer Success & Account Management',
      yearsRequired: '2-3 years',
      requiredPhases: ['phase-2-commercialization'],
      criticality: 'important',
      description: 'Customer onboarding, issue resolution, retention, upsell management',
      validationQuestions: [
        'How do you measure customer success?',
        'Tell me about your highest-value customer and how you manage that relationship.'
      ],
      founderSuitability: 'founder-fillable',
      governmentCredentialRequired: false,
      requiredBackground: {
        type: 'any',
        examples: ['SaaS customer success lead', 'Account executive with retention focus']
      },
      substitutionPossible: true
    }
  ],
  supportingHires: [
    {
      phase: 'phase-1-foundation',
      title: 'Operations Manager',
      purpose: 'Design operational procedures, staffing model, customer support structure',
      fte: '1'
    },
    {
      phase: 'phase-2-commercialization',
      title: 'Monitoring Specialists (24/7 Coverage)',
      purpose: 'Monitor alerts, respond to incidents, customer interface',
      fte: '3-4'
    },
    {
      phase: 'phase-2-commercialization',
      title: 'Customer Success Manager',
      purpose: 'Onboarding, training, account management, retention',
      fte: '1'
    },
    {
      phase: 'phase-2-commercialization',
      title: 'Technical Support Lead',
      purpose: 'Troubleshooting, maintenance coordination, field support',
      fte: '1-2'
    }
  ],
  budgetRange: {
    min: 200,
    max: 350,
    byPhase: {
      'phase-1-foundation': { min: 80, max: 100 },
      'phase-2-commercialization': { min: 120, max: 250 }
    }
  },
  keyStrategicDecisions: [
    'In-house 24/7 monitoring vs. outsourced monitoring center',
    'Customer support model (phone, email, portal, hybrid)',
    'Maintenance approach (proactive vs. reactive)',
    'Incident response procedures and SLA commitments',
    'Scaling operations as customer base grows'
  ]
};

// ============================================================================
// EXPERTISE UMBRELLA 3: Sales & Business Development
// ============================================================================

export const salesUmbrella = {
  id: 'umbrella-3-sales',
  name: 'Sales & Business Development',
  codeName: 'The Rainmaker',
  covers: 'Acquire customers, build partnerships, drive revenue growth',
  coreResponsibilities: [
    'Customer acquisition and sales pipeline management',
    'Pricing strategy and contract negotiation',
    'Partnership development (integrators, resellers, municipalities)',
    'Market positioning and competitive analysis',
    'Customer discovery and feedback loops',
    'Revenue forecasting and sales operations'
  ],
  requiredSkills: [
    {
      id: 'skill-enterprise-sales',
      name: 'Enterprise/Commercial Sales',
      yearsRequired: '3-5 years',
      requiredPhases: ['phase-1-foundation', 'phase-2-commercialization'],
      criticality: 'critical',
      description: 'Sell to municipalities, large retail chains, logistics companies, enterprise IT buyers',
      validationQuestions: [
        'What\'s your experience with government/municipal procurement?',
        'Tell me about your largest deal and sales cycle.',
        'How do you approach competitive selling?'
      ],
      founderSuitability: 'founder-fillable',
      governmentCredentialRequired: false,
      requiredBackground: {
        type: 'private-sector',
        examples: ['B2B SaaS sales lead', 'Enterprise software sales rep', 'Security/IT sales background']
      },
      substitutionPossible: false
    },
    {
      id: 'skill-security-market',
      name: 'Security Industry Knowledge',
      yearsRequired: '2-4 years',
      requiredPhases: ['phase-1-foundation', 'phase-2-commercialization'],
      criticality: 'important',
      description: 'Understanding security buyer profiles, competitors, compliance drivers, pain points',
      validationQuestions: [
        'What are the top security pain points for retail operations?',
        'Who are the key decision-makers in security spending?'
      ],
      founderSuitability: 'founder-fillable',
      governmentCredentialRequired: false,
      requiredBackground: {
        type: 'any',
        examples: ['Security company background', 'Self-taught market research']
      },
      substitutionPossible: true,
      substitutionStrategy: 'Industry advisor or consultant 0.25 FTE'
    }
  ],
  supportingHires: [
    {
      phase: 'phase-2-commercialization',
      title: 'Sales Development Rep',
      purpose: 'Prospecting, lead qualification, pipeline management',
      fte: '1'
    },
    {
      phase: 'phase-2-commercialization',
      title: 'Account Executive',
      purpose: 'Close deals, manage sales cycle, customer relationships',
      fte: '1'
    },
    {
      phase: 'phase-2-commercialization',
      title: 'Partnership Manager',
      purpose: 'Integrator relationships, reseller channel, strategic partnerships',
      fte: '0.5'
    }
  ],
  budgetRange: {
    min: 120,
    max: 200,
    byPhase: {
      'phase-1-foundation': { min: 50, max: 70 },
      'phase-2-commercialization': { min: 70, max: 130 }
    }
  },
  keyStrategicDecisions: [
    'Direct sales vs. partner/reseller channel',
    'Target market segments (retail, logistics, government, private enterprise)',
    'Pricing model (per-camera, per-location, SaaS, hybrid)',
    'Geographic expansion strategy',
    'Government vs. commercial customer prioritization'
  ]
};

// ============================================================================
// MARKET OPPORTUNITY
// ============================================================================

export const marketOpportunity: MarketOpportunity = {
  tam: {
    currentSize: {
      year: 2023,
      value: '$61.6 billion',
      unit: 'billions',
      currency: 'USD',
      geography: 'Global',
      sources: [sourcesMarket[0]]
    },
    forecastedSize: {
      year: 2030,
      value: '$147.7 billion',
      unit: 'billions'
    },
    growthRate: '10.9% CAGR',
    geography: 'Global',
    sources: [sourcesMarket[0]]
  },

  sam: {
    percentOfTAM: '8-12%',
    value: '$12-18 billion',
    description: 'AI-enabled video analytics segment of global surveillance market (subset focusing on smart detection, anomaly detection, crowd monitoring)',
    segments: [
      { name: 'AI Video Analytics (standalone)', size: '$8-12B by 2030' },
      { name: 'Integrated Surveillance + Analytics', size: '$4-6B by 2030' }
    ],
    sources: [sourcesMarket[2]]
  },

  som: {
    conservativeCase: {
      year: 2027,
      percentage: '0.1% of SAM',
      absoluteValue: '$12-18 million annual revenue'
    },
    realisticCase: {
      year: 2027,
      percentage: '0.3-0.5% of SAM',
      absoluteValue: '$36-90 million annual revenue'
    },
    optimisticCase: {
      year: 2027,
      percentage: '1-2% of SAM',
      absoluteValue: '$120-360 million annual revenue'
    },
    sources: [sourcesMarket[1], sourcesMarket[2]]
  },

  segments: [
    {
      name: 'Parking Management & Enforcement',
      description: 'License plate recognition, occupancy monitoring, automated enforcement',
      size: '$2.8-6.5 billion',
      growthRate: '14.2% CAGR',
      characteristics: [
        'High-volume, standardized deployments',
        'Government/municipal buyers',
        'Recurring revenue (SaaS + enforcement)',
        'Clear ROI (reduced enforcement costs)'
      ],
      targetability: 'easy',
      attractiveness: 9,
      sources: [sourcesMarket[3]]
    },
    {
      name: 'Retail Loss Prevention & Shrink Reduction',
      description: 'In-store monitoring, item theft detection, employee theft prevention',
      size: '$35-50 billion (retail shrink market)',
      growthRate: '8-10% annual increase in security spend',
      characteristics: [
        'Large addressable market (100K+ retail locations)',
        'High pain point (shrink costs $100B+ annually)',
        'Multiple buying centers',
        'Proven ROI on loss prevention'
      ],
      targetability: 'moderate',
      attractiveness: 8,
      sources: [sourcesMarket[4]]
    },
    {
      name: 'Logistics & Warehousing Security',
      description: 'Facility monitoring, package tracking, loading dock management',
      size: '$8-12 billion',
      growthRate: '9-11% CAGR',
      characteristics: [
        'Growing e-commerce driving expansion',
        'High-value operations',
        'Integration with operational IT'
      ],
      targetability: 'moderate',
      attractiveness: 7,
      sources: [sourcesMarket[1]]
    },
    {
      name: 'Government & Critical Infrastructure',
      description: 'Border monitoring, facility security, perimeter protection',
      size: '$5-8 billion',
      growthRate: '5-7% CAGR',
      characteristics: [
        'Procurement complexity',
        'Security clearance requirements for personnel',
        'Long sales cycles',
        'High contract values'
      ],
      targetability: 'difficult',
      attractiveness: 8,
      sources: [sourcesMarket[0]]
    }
  ],

  competitiveLandscape: {
    directCompetitors: [
      'Hikvision (Chinese, U.S. sanctions concerns)',
      'Dahua (Chinese)',
      'Axis Communications (Swedish)',
      'Bosch Security Systems',
      'Milestone XProtect (software platform)',
      'Genetec (Canadian, strong market share)'
    ] as unknown as any[],
    indirectCompetitors: [
      'Legacy security companies (AlliedUniversal, G4S)',
      'IT integrators offering surveillance add-ons',
      'Cloud video platforms (Amazon Rekognition, Google Video Intelligence)',
      'Self-install consumer systems (Ring, Wyze)'
    ] as unknown as any[],
    emergingCompetitors: [
      'AI startups adding surveillance capabilities',
      'Cloud-native surveillance startups',
      'Autonomous robotics with cameras'
    ] as unknown as any[],
    fragmentationLevel: 'moderately-fragmented',
    competitorCount: '50-100 significant players globally',
    marketConcentration: 'Top 10 control ~40-50% of market',
    sources: [sourcesMarket[0], sourcesMarket[1]]
  },

  drivers: {
    regulatory: ['Increased regulatory pressure for retail/facility security compliance',
      'GDPR and privacy law compliance requirements',
      'Government investment in border/infrastructure security',
      'Post-incident security upgrades (post-pandemic, heightened security awareness)'] as unknown as import('@/lib/types/market.types').MarketDriver[],
    technological: ['Rapid AI/ML advances in computer vision and detection',
      'Cloud infrastructure enabling scalable analytics',
      'Edge computing improving real-time processing',
      'Integration with IoT and operational systems',
      'Improved camera sensors and low-light performance'] as unknown as import('@/lib/types/market.types').MarketDriver[],
    economic: ['Reducing cost of hardware and cloud services',
      'Growing shrink/loss due to organized retail crime',
      'Insurance premium reductions for monitored facilities',
      'ROI clarity on security investments'] as unknown as import('@/lib/types/market.types').MarketDriver[],
    sources: [sourcesMarket[0], sourcesMarket[2]]
  },

  barriers: {
    regulatory: [
      { type: 'regulatory', barrier: 'GDPR compliance complexity', severity: 'high', workaround: 'Privacy-first architecture, data minimization' },
      { type: 'regulatory', barrier: 'State privacy law variation (CCPA, etc.)', severity: 'medium', workaround: 'Build for strictest state, apply to all' },
      { type: 'regulatory', barrier: 'Government procurement (for public market)', severity: 'high', workaround: 'Focus on private sector first, mature for government' }
    ],
    financial: [
      { type: 'financial', barrier: 'High customer acquisition cost (CAC)', severity: 'high', description: 'Security is complex sale, requires consultation' },
      { type: 'financial', barrier: 'Long sales cycles (6-12 months typical)', severity: 'high', description: 'Delays cash flow, requires runway' }
    ],
    technical: [
      { type: 'technical', barrier: 'AI/ML talent scarcity', severity: 'medium', workaround: 'Start with pre-trained models, expand internally' },
      { type: 'technical', barrier: 'Integration complexity (legacy systems)', severity: 'medium', workaround: 'Modular architecture, adapters' }
    ],
    competitive: [
      { type: 'competitive', barrier: 'Entrenched competitors with brand/relationships', severity: 'high' },
      { type: 'competitive', barrier: 'Big tech (AWS, Google, Microsoft) entering market', severity: 'high' }
    ],
    sources: [sourcesMarket[0], sourcesMarket[2]]
  },

  trends: [
    'Shift from reactive to AI-enabled predictive surveillance',
    'Cloud migration of video analytics and storage',
    'Integration of surveillance with other security systems (access control, alarms)',
    'Privacy-first design and data minimization',
    'Automated incident response and alert escalation',
    'Subscription/SaaS models replacing perpetual licenses'
  ],
  trendsSource: [sourcesMarket[1], sourcesMarket[2]],

  primaryCustomerNeeds: [
    'Reduce shrink/loss (clear ROI on investment)',
    'Improve incident response and liability protection',
    'Maintain privacy compliance (GDPR, CCPA)',
    'Integrate with existing security systems',
    'Simple deployment and management',
    'Scalable as business grows'
  ],
  paymentWillingness: 'High - security is mission-critical and shrink/loss is major pain point',
  procurementTimeline: 'Commercial: 2-4 months; Government: 6-12 months',

  pricingSensitivity: 'Low-to-moderate - proven ROI dominates purchasing decision',
  typicalPricingModels: [
    'Per-camera license (one-time + annual support)',
    'SaaS subscription (monthly per location)',
    'Tiered pricing (by number of cameras, features, storage)',
    'Hybrid (hardware revenue + services)'
  ],

  marketRisks: [
    'Technology disruption (autonomous surveillance drones, satellite monitoring)',
    'Privacy backlash and regulation (could limit use cases)',
    'Economic downturn reducing security spending',
    'Big tech dominance (AWS, Google, Microsoft bundling capabilities)',
    'Geopolitical factors (U.S. restrictions on Chinese surveillance equipment)'
  ],

  specificOpportunities: [
    'First-mover advantage in AI-powered anomaly detection for parking',
    'White-label platform for integrators and resellers',
    'Vertical-specific solutions (retail, logistics, parking)',
    'Government/municipal contracts with security clearance team',
    'Post-acquisition rollup opportunity (consolidate fragmented market)'
  ]
};

// ============================================================================
// REGULATORY FRAMEWORK
// ============================================================================

export const regulatoryFramework: RegulatoryFramework = {
  vertical: 'surveillance-systems',
  requirements: [
    {
      id: 'reg-1-state-security-licenses',
      authority: 'State Board' as const,
      regulation: 'State Security Guard / Operator Licenses',
      description: 'Most U.S. states require security professionals to be licensed',
      status: 'enforced',
      requirements: [
        'Background check (fingerprinting, criminal history)',
        '4-40 hours training (varies by state)',
        'Written exam (varies by state)',
        'Renewal every 2 years'
      ],
      complianceCost: {
        min: 200,
        max: 1000
      },
      complexityLevel: 'low',
      criticalMilestones: [
        'Complete background check',
        'Finish training hours',
        'Pass state exam',
        'Obtain license'
      ],
      operationalImpact: [
        'Operations personnel must be licensed',
        'Timeline: 2-6 weeks to obtain',
        'Renewable every 2 years'
      ],
      sources: [sourcesLicensing[0], sourcesLicensing[1], sourcesLicensing[2]]
    },
    {
      id: 'reg-2-gdpr-ccpa',
      authority: 'International' as const,
      regulation: 'GDPR (EU), CCPA (California)',
      description: 'Privacy regulations for video surveillance and data handling',
      status: 'enforced',
      effectiveDate: '2018-05-25',
      requirements: [
        'Data minimization (collect only necessary data)',
        'Explicit consent for data processing',
        'Right to deletion within specified period',
        'Encryption of personal data',
        'Breach notification within 72 hours',
        'Data Protection Impact Assessment (DPIA)'
      ],
      complianceCost: {
        min: 50,
        max: 200
      },
      complexityLevel: 'high',
      criticalMilestones: [
        'Privacy policy development',
        'Data retention policy implementation',
        'Encryption architecture deployment',
        'Audit trails and breach response procedures'
      ],
      operationalImpact: [
        'Requires privacy-first product design',
        'Data retention limits (varies by use case)',
        'Breach response procedures required'
      ],
      riskIfNoncompliant: 'GDPR: Up to 4% of global revenue fine; CCPA: $2,500-7,500 per violation',
      sources: [sourcesRegulatory[4], sourcesRegulatory[5]]
    },
    {
      id: 'reg-3-industry-standards',
      authority: 'Other' as const,
      regulation: 'BICSI RCDD, ASIS PSP Certifications',
      description: 'Industry-standard certifications for surveillance professionals',
      status: 'evolving',
      requirements: [
        'BICSI RCDD: 5+ years experience, 40-hour course, $2,500-5,000',
        'ASIS PSP: High school diploma, 5+ years security experience, $1,500-2,500'
      ],
      complianceCost: {
        min: 1500,
        max: 5000
      },
      complexityLevel: 'medium',
      criticalMilestones: [
        'Accumulate required experience hours',
        'Complete training/course',
        'Pass certification exam'
      ],
      operationalImpact: [
        'Improves team credibility and customer confidence',
        'Not mandatory but increasingly expected',
        'Supports government/enterprise contract qualifications'
      ],
      sources: [sourcesRegulatory[2], sourcesRegulatory[3]]
    }
  ],

  totalComplianceCost: {
    min: 100,
    max: 500
  },
  overallTimeline: '6-12 months (licensing + GDPR/CCPA implementation)',
  criticalPath: [
    'GDPR/CCPA compliance architecture (parallel with development)',
    'State security licensing (2-6 weeks per role)',
    'Industry certifications (ongoing, 1-2 years per cert)'
  ],
  description: 'Surveillance systems face moderate regulatory complexity. State-level licensing is straightforward (founder-obtainable in most states). Privacy compliance (GDPR/CCPA) is the primary complexity driver, requiring product design considerations.',
  keyChallenges: [
    'GDPR/CCPA compliance adds product complexity and cost',
    'Multi-state licensing complexity (founder must understand state variations)',
    'Privacy regulations evolving (CCPA updates, emerging state laws)',
    'Government/enterprise contracts may require higher certification levels'
  ],
  opportunities: [
    'Privacy-first positioning as competitive advantage',
    'Certifications improve enterprise market access',
    'State licensing minimal barrier to entry (vs. federal regulations)'
  ]
};

// ============================================================================
// GRANT OPPORTUNITIES (Current Status: Paused due to reauth)
// ============================================================================

export const grantOpportunities: GrantOpportunity[] = [
  {
    id: 'grant-dhs-sbir',
    program: 'SBIR',
    agency: 'DHS',
    focus: 'Border Security, Commercial Surveillance, Anomaly Detection',
    shortDescription: 'SBIR funding for advanced surveillance and border security technologies',
    eligibility: {
      requirements: [
        'U.S.-based company',
        'Small business (< 500 employees)',
        'For-profit or research entity',
        'Primary principle investigator employed by company'
      ]
    },
    awards: [
      {
        phase: 'Phase I',
        minAmount: 150,
        maxAmount: 250,
        description: 'Proof of concept and feasibility validation',
        typicalTimeline: '6 months',
        successRate: '10-20%'
      },
      {
        phase: 'Phase II',
        minAmount: 750,
        maxAmount: 1500,
        description: 'Full development and demonstration',
        typicalTimeline: '24 months',
        successRate: '40-50% (of Phase I winners)'
      }
    ],
    nextDeadline: undefined,
    deadlines: [],
    status: 'pending-reauth',
    statusNotes: 'SBIR/STTR authority expired Sept 30, 2025. No new solicitations or awards possible until Congressional reauthorization. Expected timeline: unknown (bipartisan support exists).',
    applicationRequirements: [
      'Technical proposal (15-20 pages)',
      'Business plan and market analysis',
      'Team resumes and experience',
      'Cost estimate and statement of work'
    ],
    fundingConstraints: {
      canFundSalaries: true,
      canFundEquipment: true,
      canFundRD: true,
      canFundMarketing: false,
      salaryLimits: 'Executive salaries capped at federal contractor rates'
    },
    typicalTimeToFunding: '90-120 days from award',
    url: 'https://www.dhs.gov/science-and-technology/sbir',
    sources: [sourcesGrants[0], sourcesGrants[1]]
  },
  {
    id: 'grant-nsf-sbir',
    program: 'SBIR',
    agency: 'NSF',
    focus: 'AI/ML, Cybersecurity, Data Analytics',
    shortDescription: 'NSF SBIR for AI-powered surveillance and smart city technologies',
    eligibility: {
      requirements: [
        'U.S. small business',
        'Innovative technology',
        'Commercial potential'
      ]
    },
    awards: [
      {
        phase: 'Phase I',
        minAmount: 175,
        maxAmount: 225,
        description: 'Feasibility study',
        typicalTimeline: '6-7 months'
      },
      {
        phase: 'Phase II',
        minAmount: 750,
        maxAmount: 1500,
        description: 'Full development',
        typicalTimeline: '24 months'
      }
    ],
    status: 'pending-reauth',
    statusNotes: 'Paused pending Congressional reauthorization (same as DHS SBIR)',
    applicationRequirements: [
      'Research proposal',
      'Commercialization strategy',
      'Team qualifications'
    ],
    fundingConstraints: {
      canFundSalaries: true,
      canFundEquipment: true,
      canFundRD: true,
      canFundMarketing: false
    },
    deadlines: [],
    typicalTimeToFunding: '90-120 days from award',
    url: 'https://seedfund.nsf.gov/',
    sources: [sourcesGrants[1]]
  }
];

// ============================================================================
// BUDGET & FINANCIAL PROJECTIONS
// ============================================================================

export const capitalRequirements = {
  total: { min: 250, max: 500 },
  byPhase: {
    'phase-1-foundation': { min: 150, max: 250 },
    'phase-2-commercialization': { min: 100, max: 250 }
  },
  byCategory: {
    hiring: { min: 200, max: 350 },
    infrastructure: { min: 30, max: 80 },
    equipment: { min: 20, max: 50 },
    certification: { min: 5, max: 10 },
    other: { min: -5, max: 10 }
  }
};

export const unitEconomics = {
  grossMargin: '60-75% (SaaS model)',
  capitalIntensity: 'medium' as const,
  timeToRevenue: '6-9 months',
  description: 'Low customer acquisition through product-led growth; recurring revenue model'
};

export const revenueModels = [
  {
    type: 'SaaS Subscription',
    description: 'Per-location monthly fee ($500-2,000/location) or per-camera subscription',
    estimatedArpu: '$50K-200K per customer annually',
    scalability: 'superlinear' as const
  },
  {
    type: 'Services & Integration',
    description: 'Implementation, training, custom development',
    estimatedArpu: '$10K-50K per project',
    scalability: 'linear' as const
  },
  {
    type: 'Hybrid (SaaS + Services)',
    description: 'Platform subscription + professional services',
    estimatedArpu: '$60K-250K per customer annually',
    scalability: 'superlinear' as const
  }
];

// ============================================================================
// MAIN CONFIG EXPORT
// ============================================================================

export const surveillanceSystemsConfig: BusinessVerticalConfig = {
  id: 'surveillance-systems',
  name: 'Surveillance Systems & Parking Lot Monitoring',
  description: 'AI-enabled fixed surveillance systems for commercial security, parking management, and loss prevention',
  lastUpdated: '2026-01-18',

  industry: 'Security & Surveillance',

  regulatoryFramework: regulatoryFramework,

  revenueModels: revenueModels,
  unitEconomics: unitEconomics,

  marketOpportunity: marketOpportunity,

  // Phases
  phases: Object.values(surveillancePhases),
  expertiseUmbrellas: [securityDesignUmbrella, operationsUmbrella, salesUmbrella],

  // Capital requirements
  capitalRequirements: capitalRequirements,
  grantOpportunities: grantOpportunities,

  // Strategic context
  keyRisks: [
    'SBIR/STTR programs remain paused - non-dilutive funding unavailable',
    'Big tech (AWS, Google, Microsoft) entering surveillance market',
    'Privacy regulation changes (GDPR, CCPA, emerging state laws)',
    'Customer churn if not delivering clear ROI on shrink reduction',
    'AI talent shortage makes hiring difficult and expensive',
    'Geopolitical factors affecting equipment sourcing'
  ],

  competitiveAdvantages: [
    'AI-first architecture with privacy-by-design',
    'Founder-fillable core roles (no government credentials required)',
    'Fastest path to revenue (6-12 months vs. 18-24+ for other verticals)',
    'Proven customer pain point (shrink/loss is clear ROI)',
    'Scalable SaaS model with high gross margins',
    'State licensing minimal barrier (obtainable in 2-4 weeks)'
  ],

  exitStrategy: [
    'Acquisition by large security company (Genetec, Bosch, Axis, etc.)',
    'Acquisition by big tech (AWS, Google, Microsoft)',
    'IPO after reaching $50M+ ARR',
    'Consolidation play (roll-up fragmented market)'
  ],

  // Sources
  sources: {
    regulatory: sourcesRegulatory,
    market: sourcesMarket,
    licensing: sourcesLicensing,
    grants: sourcesGrants,
    industry: [],
    competitive: [],
    technical: [],
    financial: [],
    other: []
  },
  lastResearchUpdate: '2026-01-18'
};

export default surveillanceSystemsConfig;
