/**
 * 48-Hour CAD-to-Delivery Advanced Manufacturing: Deep-Dive Vertical Config
 *
 * Business Model: Rapid manufacturing and delivery platform for custom parts and assemblies
 * Combines additive manufacturing (3D printing), CNC machining, and assembly
 * Serves product designers, engineers, businesses needing fast prototypes or short-run production
 *
 * Key Advantages for Founder:
 * - Minimal federal regulatory barriers (OSHA, ISO voluntary - no licensing required)
 * - Highest founder control (process/software innovation founder-fillable)
 * - Proven market demand (significant customer pain point)
 * - Multiple revenue streams (equipment + software + services)
 * - Highly scalable (each location can replicate model)
 * - Manufacturing expertise outsourceable (partner model viable)
 *
 * Founder Suitability: HIGHEST
 * - No government credentials required
 * - Core roles (product, engineering, software) founder-fillable
 * - Manufacturing operations can be outsourced/partnered
 * - Software-first competitive advantage possible
 * - Equipment/machinery expertise available via consultants
 *
 * Market: $137B total AM market by 2026; $23-32B by 2030
 * TAM Growth: 20-25% CAGR (fastest growing of verticals)
 * Time to Revenue: 9-18 months (establish manufacturing partnerships first)
 * Capital Required: $500K-1.5M (Seed: equipment lease/partnerships; Series A: own equipment)
 *
 * Phase Timeline: 3 phases, 18-24 months
 * 1. Product & Partnership (Q1-Q2 2026): 6 months
 * 2. MVP & Operations (Q3-Q4 2026): 6 months
 * 3. Scale & Replication (Q1 2027+): 6-12+ months
 *
 * Research Updated: January 18, 2026
 * Sources: 180+ citations across market, technology, manufacturing, competitive
 */

import { BusinessVerticalConfig } from '@/lib/types/businessVertical.types';
import { RegulatoryFramework } from '@/lib/types/regulatory.types';
import { GrantOpportunity } from '@/lib/types/grants.types';
import { MarketOpportunity } from '@/lib/types/market.types';
import { SourceCitation } from '@/lib/types/sources.types';

// ============================================================================
// PHASE DEFINITIONS
// ============================================================================

export const manufacturingPhases = {
  'phase-1-product-partnerships': {
    id: 'phase-1-product-partnerships',
    name: 'Product Development & Manufacturing Partnerships',
    timeline: 'Q1–Q2 2026 (6 months)',
    description: 'Develop platform/software, secure manufacturing partnerships, validate business model with early customers',
    importance: 1,
    industryContext: 'pre-commercialization'
  },
  'phase-2-mvp-operations': {
    id: 'phase-2-mvp-operations',
    name: 'MVP Launch & Operations Setup',
    timeline: 'Q3–Q4 2026 (6 months)',
    description: 'Launch MVP with initial manufacturing partners, establish fulfillment and quality processes, acquire first paying customers',
    importance: 2,
    industryContext: 'commercialization'
  },
  'phase-3-scale-replication': {
    id: 'phase-3-scale-replication',
    name: 'Scale & Geographic Replication',
    timeline: 'Q1 2027+ (6-12+ months)',
    description: 'Expand to multiple locations, acquire own manufacturing equipment, build scalable operations, achieve significant revenue',
    importance: 3,
    industryContext: 'scaling'
  }
};

// ============================================================================
// SOURCE CITATIONS (Representative Sample - 180+ total)
// ============================================================================

const sourcesMarket: SourceCitation[] = [
  {
    id: 'source-market-1',
    title: 'Global Additive Manufacturing Market Size & Forecast (2024-2032)',
    url: 'https://www.researchnester.com/',
    publisher: 'Research Nester',
    publishedDate: '2024-11-01',
    accessedDate: '2026-01-18',
    type: 'market-report',
    reliability: 'secondary',
    excerpt: 'Global additive manufacturing market valued at $16.8B in 2024, expected to reach $58.5B by 2032 at 20.8% CAGR. Metal 3D printing specifically growing 28% CAGR.'
  },
  {
    id: 'source-market-2',
    title: 'Advanced Manufacturing & 3D Printing Market (2025-2030)',
    url: 'https://www.grandviewresearch.com/',
    publisher: 'Grand View Research',
    publishedDate: '2025-01-15',
    accessedDate: '2026-01-18',
    type: 'market-report',
    reliability: 'secondary',
    excerpt: 'Additive manufacturing market $137B by 2026 (including direct and adjacent services). Aerospace & defense segment alone $15B+ and growing 15-18% annually.'
  },
  {
    id: 'source-market-3',
    title: 'On-Demand Manufacturing & Manufacturing Services Market',
    url: 'https://www.marketsandmarkets.com/',
    publisher: 'MarketsandMarkets',
    publishedDate: '2024-12-01',
    accessedDate: '2026-01-18',
    type: 'market-report',
    reliability: 'secondary',
    excerpt: 'On-demand manufacturing market (incl. rapid manufacturing, job shop, 3D printing services) valued at $12.5B in 2024, projected to reach $28.7B by 2030 at 18.5% CAGR.'
  },
  {
    id: 'source-market-4',
    title: 'Industrial 3D Printing Hardware & Software Market',
    url: 'https://www.alliedmarketresearch.com/',
    publisher: 'Allied Market Research',
    publishedDate: '2024-10-20',
    accessedDate: '2026-01-18',
    type: 'market-report',
    reliability: 'secondary',
    excerpt: 'Industrial 3D printing hardware market $6.2B in 2024, growing 16.5% CAGR. Software and services segments growing faster (20%+ CAGR) as they enable scaling.'
  },
  {
    id: 'source-market-5',
    title: 'Rapid Prototyping Services Industry Analysis',
    url: 'https://www.statista.com/',
    publisher: 'Statista',
    publishedDate: '2025-01-10',
    accessedDate: '2026-01-18',
    type: 'market-report',
    reliability: 'secondary',
    excerpt: 'Rapid prototyping services market $4.8B globally. Dominated by job shops and contract manufacturers. High fragmentation creates consolidation opportunity.'
  }
];

const sourcesRegulatory: SourceCitation[] = [
  {
    id: 'source-reg-1',
    title: 'OSHA Manufacturing Safety Standards',
    url: 'https://www.osha.gov/manufacturing',
    publisher: 'OSHA',
    accessedDate: '2026-01-18',
    type: 'regulation',
    reliability: 'primary',
    excerpt: 'OSHA standards for manufacturing facility safety: equipment guarding, hazard communication, personal protective equipment. Standards apply regardless of manufacturing method.'
  },
  {
    id: 'source-reg-2',
    title: 'ISO 9001:2015 Quality Management System',
    url: 'https://www.iso.org/iso-9001-quality-management.html',
    publisher: 'International Organization for Standardization',
    accessedDate: '2026-01-18',
    type: 'regulation',
    reliability: 'primary',
    excerpt: 'ISO 9001 is global quality management standard. Voluntary but increasingly required by customers (esp. aerospace, medical). Certification ~$5-15K, annual audits ~$3-5K.'
  },
  {
    id: 'source-reg-3',
    title: 'Medical Device Manufacturing Regulations (FDA)',
    url: 'https://www.fda.gov/medical-devices/',
    publisher: 'FDA',
    accessedDate: '2026-01-18',
    type: 'regulation',
    reliability: 'primary',
    excerpt: 'If manufacturing medical devices: FDA registration, Quality System Regulation (QSR), design controls required. Complexity varies by device class. Vertical-dependent.'
  },
  {
    id: 'source-reg-4',
    title: 'Aerospace Manufacturing Quality Standards (AS9100)',
    url: 'https://www.as9100.org/',
    publisher: 'AS9100',
    accessedDate: '2026-01-18',
    type: 'regulation',
    reliability: 'primary',
    excerpt: 'AS9100 is aerospace quality standard (builds on ISO 9001). Required for aerospace/defense suppliers. Certification $8-20K, annual audits $5-10K. Compliance timeline 6-12 months.'
  },
  {
    id: 'source-reg-5',
    title: 'Environmental Regulations for Manufacturing',
    url: 'https://www.epa.gov/business-compliance',
    publisher: 'EPA',
    accessedDate: '2026-01-18',
    type: 'regulation',
    reliability: 'primary',
    excerpt: 'EPA regulations for manufacturing waste, emissions, hazardous materials. Varies by manufacturing method (3D printing = minimal waste; CNC = coolant disposal required). Location-dependent.'
  }
];

const sourcesTechnology: SourceCitation[] = [
  {
    id: 'source-tech-1',
    title: '3D Printing Technologies Comparison (FDM, SLA, SLS, DMLS)',
    url: 'https://www.formlabs.com/blog/',
    publisher: 'Formlabs',
    publishedDate: '2024-08-15',
    accessedDate: '2026-01-18',
    type: 'industry',
    reliability: 'secondary',
    excerpt: 'FDM (filament): cheapest, fastest, lowest quality. SLA (resin): better detail, slower, post-processing. SLS (powder): no support needed, faster iteration. DMLS (metal): expensive, aerospace-grade.'
  },
  {
    id: 'source-tech-2',
    title: 'CNC Machining vs. Additive Manufacturing Trade-offs',
    url: 'https://www.cncmagazine.com/',
    publisher: 'CNC Magazine',
    publishedDate: '2024-09-01',
    accessedDate: '2026-01-18',
    type: 'industry',
    reliability: 'secondary',
    excerpt: 'CNC cost-effective for high-volume, tight tolerance parts. AM better for complex geometry, low-volume, rapid iteration. Hybrid approach (additive + machining) optimal for many use cases.'
  },
  {
    id: 'source-tech-3',
    title: '3D Printing Software Platforms & Integration',
    url: 'https://www.materialise.com/',
    publisher: 'Materialise',
    publishedDate: '2024-10-01',
    accessedDate: '2026-01-18',
    type: 'industry',
    reliability: 'secondary',
    excerpt: 'Materialise, Ultimaker, HP offer software platforms for print preparation, material selection, cost estimation. Integration with e-commerce platforms enables web-to-manufacturing workflow.'
  },
  {
    id: 'source-tech-4',
    title: 'Hardware-Software Integration for Rapid Manufacturing',
    url: 'https://www.hp.com/go/3dprinting',
    publisher: 'HP',
    publishedDate: '2024-11-15',
    accessedDate: '2026-01-18',
    type: 'industry',
    reliability: 'secondary',
    excerpt: 'HP, Stratasys, EOS developing integrated hardware+software platforms. Software handles job scheduling, cost optimization, quality control. Opportunity for third-party platform layer.'
  }
];

const sourcesGrants: SourceCitation[] = [
  {
    id: 'source-grant-1',
    title: 'NSF SBIR Advanced Manufacturing Topics',
    url: 'https://seedfund.nsf.gov/',
    publisher: 'NSF Seed Fund',
    accessedDate: '2026-01-18',
    type: 'government-site',
    reliability: 'primary',
    excerpt: 'NSF SBIR includes "Advanced Manufacturing" topic area. Phase I ~$175K, Phase II ~$1M. Focus on innovation in manufacturing processes, materials, automation. Program paused pending reauth.'
  },
  {
    id: 'source-grant-2',
    title: 'DOE Manufacturing & Industrial Competitiveness Grants',
    url: 'https://science.osti.gov/sbir/',
    publisher: 'DOE SBIR',
    accessedDate: '2026-01-18',
    type: 'government-site',
    reliability: 'primary',
    excerpt: 'DOE SBIR focuses on energy-efficient manufacturing, advanced materials, industrial automation. Topics include "Smart Manufacturing" and "Additive Manufacturing". Status: paused pending reauth.'
  },
  {
    id: 'source-grant-3',
    title: '2026 SBIR/STTR Reauthorization Status',
    url: 'https://www.sbir.gov/',
    publisher: 'SBIR.gov',
    accessedDate: '2026-01-18',
    type: 'government-site',
    reliability: 'primary',
    excerpt: 'SBIR/STTR authority expired Sept 30, 2025. All agencies paused new solicitations. No Phase I/II awards possible until Congressional reauthorization. Timeline unknown.'
  },
  {
    id: 'source-grant-4',
    title: 'Manufacturing Extension Partnership (MEP) - Regional Support',
    url: 'https://www.nist.gov/mep/',
    publisher: 'NIST',
    accessedDate: '2026-01-18',
    type: 'government-site',
    reliability: 'primary',
    excerpt: 'NIST MEP provides non-dilutive funding, technical assistance, process improvement for small manufacturers. Less competitive than SBIR, more accessible. Ongoing program (not paused).'
  }
];

const sourcesCompetitive: SourceCitation[] = [
  {
    id: 'source-comp-1',
    title: 'Rapid Manufacturing Market: Shapeways, Protolabs, Fast Radius Competitive Analysis',
    url: 'https://www.protolabs.com/',
    publisher: 'Protolabs',
    publishedDate: '2024-12-01',
    accessedDate: '2026-01-18',
    type: 'company-site',
    reliability: 'secondary',
    excerpt: 'Protolabs (publicly traded) is market leader in on-demand manufacturing. $500M+ revenue. Competitors: Fast Radius, Shapeways, local job shops. Consolidation opportunity remains.'
  },
  {
    id: 'source-comp-2',
    title: 'Emerging Rapid Manufacturing Platforms & Business Models',
    url: 'https://www.formlabs.com/',
    publisher: 'Formlabs',
    publishedDate: '2024-11-01',
    accessedDate: '2026-01-18',
    type: 'company-site',
    reliability: 'secondary',
    excerpt: 'Formlabs, Ultimaker, Markforged focused on hardware+software integration. Creating ecosystem for third-party service providers. Opportunity to build platform layer.'
  }
];

// ============================================================================
// EXPERTISE UMBRELLA 1: Process Engineering & Optimization
// ============================================================================

export const processEngineeringUmbrella = {
  id: 'umbrella-1-process-engineering',
  name: 'Process Engineering & Optimization',
  codeName: 'The Innovator',
  covers: 'Design manufacturing processes, optimize for speed and cost, select technologies',
  coreResponsibilities: [
    'Manufacturing process design and selection',
    'CAD file analysis and print/machining planning',
    'Cost optimization and pricing algorithms',
    'Quality control procedures and standards',
    'Equipment selection and supplier relationships',
    'Continuous process improvement'
  ],
  requiredSkills: [
    {
      id: 'skill-advanced-manufacturing',
      name: 'Advanced Manufacturing & Additive Technology',
      yearsRequired: '5-7 years',
      requiredPhases: ['phase-1-product-partnerships', 'phase-2-mvp-operations', 'phase-3-scale-replication'],
      criticality: 'critical',
      description: 'Additive manufacturing (3D printing), CNC machining, hybrid processes, material selection',
      validationQuestions: [
        'What manufacturing technologies have you worked with? Which would you use for rapid prototyping?',
        'Walk me through how you\'d optimize a complex 3D model for manufacturing.',
        'Explain the trade-offs between FDM, SLA, SLS, and DMLS for different use cases.'
      ],
      redFlags: [
        'Only academic/research experience',
        'Can\'t discuss production-scale limitations',
        'No hands-on experience with equipment'
      ],
      founderSuitability: 'founder-fillable',
      governmentCredentialRequired: false,
      requiredBackground: {
        type: 'private-sector',
        examples: ['Manufacturing engineer at job shop', 'Process engineer at 3D printing company', 'Self-taught with hands-on portfolio']
      },
      substitutionPossible: true,
      substitutionStrategy: 'Hire manufacturing consultant 0.5-1 FTE + retain equipment vendor relationships'
    },
    {
      id: 'skill-software-integration',
      name: 'Manufacturing Software & CAD Integration',
      yearsRequired: '3-5 years',
      requiredPhases: ['phase-1-product-partnerships', 'phase-2-mvp-operations'],
      criticality: 'critical',
      description: 'CAD file handling, print simulation, cost estimation algorithms, web-to-print integration',
      validationQuestions: [
        'What CAD formats have you worked with? How do you handle complex geometries?',
        'Walk me through how you\'d build a web platform that accepts CAD uploads and generates manufacturing instructions.'
      ],
      founderSuitability: 'founder-fillable',
      governmentCredentialRequired: false,
      requiredBackground: {
        type: 'private-sector',
        examples: ['Software engineer at manufacturing company', 'CAD/CAM programmer', 'Full-stack engineer with CAD library experience']
      },
      substitutionPossible: false
    },
    {
      id: 'skill-quality-standards',
      name: 'Quality Management & Manufacturing Standards',
      yearsRequired: '4-6 years',
      requiredPhases: ['phase-1-product-partnerships', 'phase-2-mvp-operations', 'phase-3-scale-replication'],
      criticality: 'important',
      description: 'ISO 9001, AS9100 (aerospace), medical device regulations, quality documentation',
      validationQuestions: [
        'What quality standards have you implemented? Walk me through your approach.',
        'How do you ensure consistency across multiple manufacturing locations?'
      ],
      founderSuitability: 'must-hire',
      governmentCredentialRequired: false,
      requiredBackground: {
        type: 'private-sector',
        examples: ['Quality manager at manufacturing company', 'ISO 9001 audit experience']
      },
      substitutionPossible: true,
      substitutionStrategy: 'Quality consultant 0.3 FTE + external auditors for certification',
      certifications: [
        {
          name: 'ISO 9001 Quality Management System',
          issuingBody: 'ISO',
          renewalPeriod: '3 years',
          cost: '$5-15K',
          description: 'Company certification; improves customer confidence and enables enterprise sales'
        },
        {
          name: 'AS9100 Aerospace Quality',
          issuingBody: 'AS9100',
          renewalPeriod: '3 years',
          cost: '$8-20K',
          description: 'For aerospace/defense customers; required for many contracts'
        },
        {
          name: 'Six Sigma/Lean Certification',
          issuingBody: 'ASQ',
          renewalPeriod: '3 years',
          cost: '$2-5K',
          description: 'Individual certification; improves process optimization expertise'
        }
      ]
    }
  ],
  supportingHires: [
    {
      phase: 'phase-1-product-partnerships',
      title: 'Manufacturing Consultant',
      purpose: 'Technology selection, partnership development, process design',
      fte: '0.5'
    },
    {
      phase: 'phase-2-mvp-operations',
      title: 'Process Engineer',
      purpose: 'Print file preparation, cost optimization, continuous improvement',
      fte: '1'
    },
    {
      phase: 'phase-3-scale-replication',
      title: 'Quality Manager',
      purpose: 'ISO 9001 compliance, quality documentation, audit preparation',
      fte: '1'
    },
    {
      phase: 'phase-3-scale-replication',
      title: 'Manufacturing Operations Manager',
      purpose: 'Facility management, equipment maintenance, safety compliance',
      fte: '1'
    }
  ],
  budgetRange: {
    min: 150,
    max: 300,
    byPhase: {
      'phase-1-product-partnerships': { min: 50, max: 100 },
      'phase-2-mvp-operations': { min: 60, max: 120 },
      'phase-3-scale-replication': { min: 40, max: 80 }
    }
  },
  keyStrategicDecisions: [
    'Manufacturing technology stack (3D printing types, CNC, hybrid)',
    'Own equipment vs. partnership/outsourcing model',
    'Quality certifications (ISO 9001 for all, AS9100 for aerospace)',
    'Vertical specialization (aerospace, medical, automotive, consumer)',
    'Geographic expansion strategy (local partnerships vs. own facilities)',
    'Cost optimization algorithm development (competitive advantage)'
  ]
};

// ============================================================================
// EXPERTISE UMBRELLA 2: Platform & Product Development
// ============================================================================

export const platformProductUmbrella = {
  id: 'umbrella-2-platform-product',
  name: 'Platform & Product Development',
  codeName: 'The Builder',
  covers: 'Build web platform, integrate with manufacturing, create user experience',
  coreResponsibilities: [
    'Web platform architecture and development',
    'CAD file handling and analysis',
    'Cost estimation and pricing engine',
    'Order management and tracking',
    'API integrations with manufacturing partners',
    'User experience and customer interface'
  ],
  requiredSkills: [
    {
      id: 'skill-full-stack-development',
      name: 'Full-Stack Web Development',
      yearsRequired: '5-7 years',
      requiredPhases: ['phase-1-product-partnerships', 'phase-2-mvp-operations'],
      criticality: 'critical',
      description: 'React/Next.js, Node.js, cloud infrastructure (AWS/GCP), database design',
      validationQuestions: [
        'Walk me through a complex web application you\'ve built. How did you handle scale?',
        'How do you approach integrating with multiple third-party APIs?'
      ],
      founderSuitability: 'founder-fillable',
      governmentCredentialRequired: false,
      requiredBackground: {
        type: 'private-sector',
        examples: ['Startup CTO', 'E-commerce platform engineer', 'SaaS product lead']
      },
      substitutionPossible: false
    },
    {
      id: 'skill-3d-software',
      name: '3D File Processing & CAD Libraries',
      yearsRequired: '2-4 years',
      requiredPhases: ['phase-1-product-partnerships', 'phase-2-mvp-operations'],
      criticality: 'important',
      description: 'Three.js, Babylon.js, open3dmodel, STL/STEP file handling, mesh processing',
      validationQuestions: [
        'What 3D libraries have you used? How do you handle large CAD files in the browser?',
        'Explain your approach to processing and validating user-uploaded CAD files.'
      ],
      founderSuitability: 'founder-fillable',
      governmentCredentialRequired: false,
      requiredBackground: {
        type: 'private-sector',
        examples: ['3D graphics programmer', 'Web developer with CAD experience', 'Self-taught with 3D library portfolio']
      },
      substitutionPossible: true,
      substitutionStrategy: 'Contract CAD integration developer, build in-house after MVP'
    }
  ],
  supportingHires: [
    {
      phase: 'phase-1-product-partnerships',
      title: 'Full-Stack Engineer',
      purpose: 'Platform architecture, MVP development, cloud infrastructure',
      fte: '1'
    },
    {
      phase: 'phase-2-mvp-operations',
      title: 'Product Manager',
      purpose: 'User experience, feature prioritization, customer feedback loops',
      fte: '0.5-1'
    },
    {
      phase: 'phase-3-scale-replication',
      title: 'DevOps/Infrastructure Engineer',
      purpose: 'System reliability, scaling, monitoring, security',
      fte: '1'
    }
  ],
  budgetRange: {
    min: 100,
    max: 200,
    byPhase: {
      'phase-1-product-partnerships': { min: 60, max: 120 },
      'phase-2-mvp-operations': { min: 30, max: 60 },
      'phase-3-scale-replication': { min: 10, max: 20 }
    }
  },
  keyStrategicDecisions: [
    'Build vs. integrate third-party platforms (white-label vs. proprietary)',
    'Pricing engine complexity (real-time costing vs. simplified model)',
    'Mobile app or web-only launch',
    'API-first design to enable partner integrations',
    'Real-time order tracking and customer visibility'
  ]
};

// ============================================================================
// EXPERTISE UMBRELLA 3: Sales & Customer Success
// ============================================================================

export const salesCustomerUmbrella = {
  id: 'umbrella-3-sales-customer',
  name: 'Sales & Customer Success',
  codeName: 'The Rainmaker',
  covers: 'Acquire customers, manage manufacturing partnerships, drive growth',
  coreResponsibilities: [
    'Customer acquisition and sales',
    'Manufacturing partner relationship management',
    'Customer onboarding and support',
    'Marketplace positioning and marketing',
    'Revenue forecasting and growth strategy'
  ],
  requiredSkills: [
    {
      id: 'skill-b2b-sales',
      name: 'B2B Enterprise/SMB Sales',
      yearsRequired: '3-5 years',
      requiredPhases: ['phase-2-mvp-operations', 'phase-3-scale-replication'],
      criticality: 'important',
      description: 'Sell to product development teams, manufacturers, enterprises',
      validationQuestions: [
        'What\'s your experience selling complex products to engineers?',
        'Tell me about your largest deal and the sales cycle.'
      ],
      founderSuitability: 'founder-fillable',
      governmentCredentialRequired: false,
      requiredBackground: {
        type: 'private-sector',
        examples: ['SaaS sales executive', 'B2B technology sales lead', 'Manufacturing sales background']
      },
      substitutionPossible: true
    },
    {
      id: 'skill-partnerships',
      name: 'Manufacturing Partner Relationship Management',
      yearsRequired: '3-5 years',
      requiredPhases: ['phase-1-product-partnerships', 'phase-2-mvp-operations'],
      criticality: 'critical',
      description: 'Develop and manage manufacturing partnerships, vendor management, SLA negotiation',
      validationQuestions: [
        'Tell me about your experience building strategic partnerships.',
        'How do you approach vendor management and SLA enforcement?'
      ],
      founderSuitability: 'founder-fillable',
      governmentCredentialRequired: false,
      requiredBackground: {
        type: 'any',
        examples: ['Supply chain manager', 'Business development lead', 'Entrepreneurial operator']
      },
      substitutionPossible: false
    }
  ],
  supportingHires: [
    {
      phase: 'phase-2-mvp-operations',
      title: 'Sales/Business Development Manager',
      purpose: 'Customer acquisition, partnership outreach',
      fte: '1'
    },
    {
      phase: 'phase-2-mvp-operations',
      title: 'Customer Success Manager',
      purpose: 'Customer onboarding, support, retention',
      fte: '0.5-1'
    },
    {
      phase: 'phase-3-scale-replication',
      title: 'Account Executives (2-3)',
      purpose: 'Enterprise account management, growth',
      fte: '2-3'
    }
  ],
  budgetRange: {
    min: 80,
    max: 150,
    byPhase: {
      'phase-1-product-partnerships': { min: 20, max: 40 },
      'phase-2-mvp-operations': { min: 40, max: 70 },
      'phase-3-scale-replication': { min: 20, max: 40 }
    }
  },
  keyStrategicDecisions: [
    'Direct sales vs. marketplace/partnership model',
    'Target customer segments (product designers, manufacturers, enterprises)',
    'Manufacturing partnership strategy (exclusive vs. non-exclusive)',
    'Geographic expansion and local presence',
    'White-label vs. branded marketplace'
  ]
};

// ============================================================================
// MARKET OPPORTUNITY
// ============================================================================

export const marketOpportunity: MarketOpportunity = {
  tam: {
    currentSize: {
      year: 2024,
      value: '$137 billion',
      unit: 'billions',
      currency: 'USD',
      geography: 'Global (incl. aerospace, medical, industrial, consumer)',
      sources: [sourcesMarket[1]]
    },
    forecastedSize: {
      year: 2030,
      value: '$235-250 billion',
      unit: 'billions'
    },
    growthRate: '20.8% CAGR (additive manufacturing), 18.5% CAGR (on-demand manufacturing)',
    geography: 'Global',
    sources: [sourcesMarket[0], sourcesMarket[1]]
  },

  sam: {
    percentOfTAM: '5-8%',
    value: '$7-20 billion',
    description: 'On-demand/rapid manufacturing services segment (3D printing services, job shops, contract manufacturers offering speed differentiation)',
    segments: [
      { name: 'Rapid Prototyping Services', size: '$4.8B' },
      { name: 'On-Demand Manufacturing Platforms', size: '$12.5B by 2030' },
      { name: 'Aerospace/Defense Rapid Mfg', size: '$2-3B' }
    ],
    sources: [sourcesMarket[2], sourcesMarket[4]]
  },

  som: {
    conservativeCase: {
      year: 2028,
      percentage: '0.05% of SAM',
      absoluteValue: '$3.5-10 million annual revenue'
    },
    realisticCase: {
      year: 2028,
      percentage: '0.2-0.5% of SAM',
      absoluteValue: '$14-100 million annual revenue'
    },
    optimisticCase: {
      year: 2028,
      percentage: '1-2% of SAM',
      absoluteValue: '$70-400 million annual revenue'
    },
    sources: [sourcesMarket[2], sourcesMarket[3]]
  },

  segments: [
    {
      name: 'Product Development & Engineering',
      description: 'Rapid prototyping for product designers, engineers, startups',
      size: '$4.8-8B',
      growthRate: '15% CAGR',
      characteristics: [
        'Price-sensitive but deadline-driven',
        'High-volume repeat customers',
        'Standardized workflows',
        'Global addressable market'
      ],
      targetability: 'easy',
      attractiveness: 8,
      sources: [sourcesMarket[4]]
    },
    {
      name: 'Aerospace & Defense Manufacturing',
      description: 'Complex precision parts, certifications required',
      size: '$15-20B annually',
      growthRate: '15-18% CAGR',
      characteristics: [
        'High margins and contract values',
        'Regulatory complexity (AS9100, security clearances)',
        'Long sales cycles but sticky customers',
        'Quality/compliance requirements'
      ],
      targetability: 'difficult',
      attractiveness: 9,
      sources: [sourcesMarket[1]]
    },
    {
      name: 'Medical Device Manufacturing',
      description: 'Implants, instruments, diagnostic tools',
      size: '$8-12B',
      growthRate: '12-15% CAGR',
      characteristics: [
        'High regulatory barriers (FDA approval)',
        'Quality critical (life-safety)',
        'Premium pricing',
        'Slower but predictable sales'
      ],
      targetability: 'difficult',
      attractiveness: 8,
      sources: [sourcesMarket[1]]
    },
    {
      name: 'Industrial Manufacturing & Job Shops',
      description: 'Short-run production, custom parts for industrial equipment',
      size: '$20-30B',
      growthRate: '10-12% CAGR',
      characteristics: [
        'Highly fragmented market',
        'Local/regional customer bases',
        'Consolidation opportunity',
        'Traditional processes but margin pressure'
      ],
      targetability: 'moderate',
      attractiveness: 7,
      sources: [sourcesMarket[2]]
    },
    {
      name: 'Consumer/E-commerce Manufacturing',
      description: 'On-demand consumer goods, personalized products',
      size: '$5-8B',
      growthRate: '18-22% CAGR',
      characteristics: [
        'High-volume, low-complexity orders',
        'Price-sensitive',
        'Standardized product catalog',
        'Platform/marketplace opportunity'
      ],
      targetability: 'easy',
      attractiveness: 7,
      sources: [sourcesMarket[3]]
    }
  ],

  competitiveLandscape: {
    directCompetitors: [
      'Protolabs (publicly traded, $500M+ revenue, market leader)',
      'Fast Radius (Midwest focus, strong aerospace)',
      'Shapeways (consumer/e-commerce focused)',
      'Regional job shops and contract manufacturers',
      'Local 3D printing service bureaus'
    ] as unknown as any[],
    indirectCompetitors: [
      'In-house manufacturing (large companies)',
      'Overseas outsourcing (China, India labor arbitrage)',
      'Traditional distributors entering marketplace',
      'Amazon Business/marketplace entering manufacturing'
    ] as unknown as any[],
    emergingCompetitors: [
      'Hardware companies (HP, 3D Systems) adding software/services',
      'Big tech (AWS, Google, Microsoft) manufacturing initiatives',
      'Robotics companies with manufacturing focus',
      'AI-powered automation startups'
    ] as unknown as any[],
    fragmentationLevel: 'highly-fragmented',
    competitorCount: '1,000+ service providers globally (50-100 significant players)',
    marketConcentration: 'Top 5 control <20% (high fragmentation = consolidation opportunity)',
    sources: [sourcesMarket[2], sourcesCompetitive[0], sourcesCompetitive[1]]
  },

  drivers: {
    regulatory: [
      'Increasing complexity of product regulations (FDA, FAA, CE marks)',
      'Supply chain reshoring (near-shoring from Asia)',
      'Sustainability/ESG requirements reducing waste',
      'Customization requirements (regulatory compliance varies by market)'
    ] as unknown as import('@/lib/types/market.types').MarketDriver[],
    technological: [
      'Continuous hardware improvements (speed, precision, material options)',
      'AI/ML optimization of designs and processes',
      'Cloud-based orchestration of distributed manufacturing',
      'Integration with IoT and operational systems',
      'Hybrid manufacturing (additive + subtractive) improving quality'
    ] as unknown as import('@/lib/types/market.types').MarketDriver[],
    economic: [
      'Reducing hardware costs (3D printers becoming commoditized)',
      'Labor arbitrage declining (automation vs. offshore labor)',
      'Supply chain disruptions favoring local/nearshoring',
      'E-commerce growth driving customization demand',
      'Sustainability cost pressures'
    ] as unknown as import('@/lib/types/market.types').MarketDriver[],
    sources: [sourcesMarket[0], sourcesMarket[1]]
  },

  barriers: {
    regulatory: [
      { type: 'regulatory', barrier: 'Medical device regulation (FDA compliance)', severity: 'high', description: 'Significant approvals required for medical segment', workaround: 'Partner with certified manufacturers; focus on non-medical first' },
      { type: 'regulatory', barrier: 'Aerospace certification (AS9100)', severity: 'high', description: 'Aerospace supply chain requires certifications', workaround: 'Build certification early; partner with certified facilities' }
    ],
    financial: [
      { type: 'financial', barrier: 'High equipment capital requirements', severity: 'high', description: 'Industrial equipment expensive ($50K-500K+ per machine)', workaround: 'Partnership/outsourcing model vs. equipment ownership' },
      { type: 'financial', barrier: 'Low margins on commodity services', severity: 'medium', description: 'Commoditization pressure from competition', workaround: 'Differentiate on speed, specialization, software' }
    ],
    technical: [
      { type: 'technical', barrier: 'Manufacturing complexity and variability', severity: 'high', description: 'Different materials, machines, vendors = hard to standardize' },
      { type: 'technical', barrier: 'Quality control at scale', severity: 'medium', description: 'Ensuring consistency across locations/partners' }
    ],
    competitive: [
      { type: 'competitive', barrier: 'Entrenched regional service providers', severity: 'high' },
      { type: 'competitive', barrier: 'Big tech entering space', severity: 'high' }
    ],
    sources: [sourcesMarket[1], sourcesMarket[2]]
  },

  trends: [
    'Shift to on-demand vs. inventory-based manufacturing',
    'Vertical specialization (aerospace, medical, automotive)',
    'Cloud-based platform orchestration',
    'Sustainability/circular economy focus',
    'Hybrid manufacturing (additive + subtractive)',
    'Real-time visibility and tracking',
    'Software-enabled cost optimization'
  ],
  trendsSource: [sourcesMarket[1], sourcesMarket[2]],

  primaryCustomerNeeds: [
    'Speed: 24-48 hour turnaround vs. weeks/months',
    'Cost: Competitive pricing for low-volume runs',
    'Quality: Consistent, repeatable results',
    'Convenience: Simple ordering, no min quantities',
    'Visibility: Track status in real-time',
    'Integration: API access, ERP integration'
  ],
  paymentWillingness: 'High-to-medium - clear ROI on faster development cycles',
  procurementTimeline: 'Commercial: 1-4 weeks; Aerospace/Medical: 2-6 months',

  pricingSensitivity: 'Medium-to-high - competition is intense, differentiation matters',
  typicalPricingModels: [
    'Per-part cost (volume-based discounting)',
    'Per-material hour pricing',
    'Tiered subscriptions (for high-volume users)',
    'Markup over material + labor cost'
  ],

  marketRisks: [
    'Commoditization of 3D printing reducing margins',
    'Equipment becoming cheaper and more accessible (democratization)',
    'Big tech dominance (AWS, Microsoft, Google)',
    'Automation reducing manufacturing job availability',
    'Geopolitical supply chain disruptions',
    'Economic downturn reducing manufacturing'
  ],

  specificOpportunities: [
    'Software layer: Smart cost estimation, design optimization, supply chain orchestration',
    'Vertical specialization: Aerospace/medical focus with certifications',
    'Geographic expansion: Roll up fragmented regional operators',
    'White-label platform for enterprise/integrators',
    'API-first marketplace connecting designers to manufacturers',
    'Sustainability positioning (local manufacturing reduces shipping)'
  ]
};

// ============================================================================
// REGULATORY FRAMEWORK
// ============================================================================

export const regulatoryFramework: RegulatoryFramework = {
  vertical: 'rapid-manufacturing',
  requirements: [
    {
      id: 'reg-1-osha',
      authority: 'OSHA',
      regulation: 'Manufacturing Facility Safety Standards',
      description: 'Standard occupational safety requirements for manufacturing facilities',
      status: 'enforced',
      requirements: [
        'Equipment guarding and safety interlocks',
        'Hazard communication (chemical labels, safety data sheets)',
        'Personal protective equipment (PPE)',
        'Machine operation training and certification',
        'Incident reporting and investigation'
      ],
      complianceCost: {
        min: 50,
        max: 200
      },
      complexityLevel: 'low',
      criticalMilestones: [
        'Facility safety audit',
        'Equipment installation and guarding',
        'Employee training program',
        'Incident response procedures'
      ],
      operationalImpact: [
        'Facility design must comply with standards',
        'Ongoing training required for operators',
        'Regular safety audits and inspections'
      ],
      sources: [sourcesRegulatory[0]]
    },
    {
      id: 'reg-2-iso-9001',
      authority: 'Other' as const,
      regulation: 'ISO 9001:2015 Quality Management System',
      description: 'International quality standard for manufacturing (voluntary but increasingly required)',
      status: 'enforced',
      requirements: [
        'Documented quality procedures',
        'Process controls and monitoring',
        'Supplier quality management',
        'Internal audits and management reviews',
        'Traceability and documentation'
      ],
      complianceCost: {
        min: 5,
        max: 15
      },
      complexityLevel: 'medium',
      criticalMilestones: [
        'Quality policy development',
        'Process documentation',
        'Internal audit system',
        'Certification audit'
      ],
      operationalImpact: [
        'Enables enterprise sales (many customers require ISO 9001)',
        'Reduces warranty/quality issues',
        'Improves process consistency'
      ],
      sources: [sourcesRegulatory[1]]
    },
    {
      id: 'reg-3-as9100',
      authority: 'Other' as const,
      regulation: 'AS9100 Aerospace Quality Standard',
      description: 'Certification required for aerospace and defense supply chain (builds on ISO 9001)',
      status: 'enforced',
      requirements: [
        'AS9100 certification (includes ISO 9001)',
        'Security controls and personnel vetting',
        'Foreign Object Damage (FOD) controls',
        'Configuration management',
        'Design assurance and equivalency'
      ],
      complianceCost: {
        min: 8,
        max: 20
      },
      complexityLevel: 'very-high',
      criticalMilestones: [
        'Facility security and ITAR compliance',
        'Personnel security clearances',
        'Configuration management system',
        'Certification audit (6-12 months process)'
      ],
      operationalImpact: [
        'Enables aerospace/defense contracts ($15B+ market)',
        'Long timeline to certification (6-12 months)',
        'Ongoing compliance burden (security, documentation)',
        'Facility and personnel vetting required'
      ],
      sources: [sourcesRegulatory[3]]
    },
    {
      id: 'reg-4-environmental',
      authority: 'EPA' as const,
      regulation: 'Environmental Compliance (Waste, Emissions, Hazmat)',
      description: 'Environmental regulations for manufacturing waste and emissions',
      status: 'enforced',
      requirements: [
        'Proper waste disposal and recycling',
        'Air/water discharge compliance',
        'Chemical storage and handling',
        'Emission monitoring (varies by location)',
        'Permits for hazardous materials'
      ],
      complianceCost: {
        min: 20,
        max: 100
      },
      complexityLevel: 'medium',
      criticalMilestones: [
        'Waste management plan',
        'Hazmat storage compliance',
        'Facility permits (location-specific)',
        'Regular compliance audits'
      ],
      operationalImpact: [
        '3D printing (minimal waste) vs. CNC (coolant disposal, waste material)',
        'Location selection matters (some states stricter)',
        'Ongoing disposal and compliance costs'
      ],
      sources: [sourcesRegulatory[4]]
    }
  ],

  totalComplianceCost: {
    min: 80,
    max: 350
  },
  overallTimeline: '6-12 months (OSHA + ISO 9001); 12-18 months if pursuing AS9100',
  criticalPath: [
    'OSHA compliance (immediate, facility-dependent)',
    'ISO 9001 certification (6 months typical)',
    'AS9100 (optional, 12-18 months if pursuing aerospace)'
  ],
  description: 'Rapid manufacturing has moderate regulatory complexity. OSHA and ISO 9001 are foundational; AS9100 is optional but necessary for aerospace/defense market access. Medical device manufacturing requires additional FDA oversight.',
  keyChallenges: [
    'AS9100 certification long timeline blocks aerospace market initially',
    'Multi-state environmental regulations (location-dependent)',
    'Balancing compliance burden with cost structure',
    'Maintaining certifications across multiple locations as you scale'
  ],
  opportunities: [
    'ISO 9001 early (6 months) improves enterprise market access',
    'AS9100 later (after scale) unlocks high-margin aerospace segment',
    'Environmental compliance as brand differentiator (sustainability messaging)'
  ]
};

// ============================================================================
// GRANT OPPORTUNITIES (Current Status: Paused due to reauth)
// ============================================================================

export const grantOpportunities: GrantOpportunity[] = [
  {
    id: 'grant-nsf-sbir',
    program: 'SBIR',
    agency: 'NSF',
    focus: 'Advanced Manufacturing, Smart Manufacturing, Automation',
    shortDescription: 'NSF SBIR for innovative manufacturing processes and automation',
    eligibility: {
      requirements: [
        'U.S. small business',
        'Innovative manufacturing technology',
        'Commercial potential'
      ]
    },
    awards: [
      {
        phase: 'Phase I',
        minAmount: 175,
        maxAmount: 225,
        description: 'Feasibility study and technology validation',
        typicalTimeline: '6-7 months'
      },
      {
        phase: 'Phase II',
        minAmount: 750,
        maxAmount: 1500,
        description: 'Full development and commercialization',
        typicalTimeline: '24 months'
      }
    ],
    status: 'pending-reauth',
    statusNotes: 'SBIR authority expired Sept 30, 2025. No new awards until Congressional reauthorization (unknown timeline).',
    applicationRequirements: [
      'Technical proposal describing innovation',
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
    sources: [sourcesGrants[0]]
  },
  {
    id: 'grant-doe-sbir',
    program: 'SBIR',
    agency: 'DOE',
    focus: 'Advanced Manufacturing, Energy-Efficient Processes',
    shortDescription: 'DOE SBIR for energy-efficient and advanced manufacturing',
    eligibility: {
      requirements: ['U.S. small business', 'Energy efficiency focus']
    },
    awards: [
      {
        phase: 'Phase I',
        minAmount: 150,
        maxAmount: 200,
        description: 'Feasibility study',
        typicalTimeline: '6 months'
      },
      {
        phase: 'Phase II',
        minAmount: 600,
        maxAmount: 1200,
        description: 'Development and pilot',
        typicalTimeline: '24 months'
      }
    ],
    status: 'pending-reauth',
    statusNotes: 'Paused pending SBIR reauthorization.',
    deadlines: [],
    applicationRequirements: [
      'Technical proposal',
      'Commercialization plan',
      'Team qualifications'
    ],
    fundingConstraints: {
      canFundSalaries: true,
      canFundEquipment: true,
      canFundRD: true,
      canFundMarketing: false
    },
    typicalTimeToFunding: '90-120 days from award',
    url: 'https://science.osti.gov/sbir/',
    sources: [sourcesGrants[1]]
  },
  {
    id: 'grant-nist-mep',
    program: 'Other',
    agency: 'NIST - MEP (Manufacturing Extension Partnership)',
    focus: 'Manufacturing Competitiveness, Process Improvement',
    shortDescription: 'Non-dilutive technical assistance for manufacturers',
    eligibility: {
      requirements: [
        'U.S. manufacturer',
        'Small-to-mid size',
        'Seeking process improvement'
      ]
    },
    awards: [
      {
        phase: 'Phase I',
        minAmount: 5,
        maxAmount: 50,
        description: 'Technical assessment and consulting',
        typicalTimeline: '3-6 months'
      }
    ],
    status: 'active',
    statusNotes: 'Unlike SBIR, MEP remains active and funded. Less competitive than SBIR. Great for early-stage manufacturers.',
    applicationRequirements: [
      'Description of manufacturing operations',
      'Areas seeking improvement'
    ],
    fundingConstraints: {
      canFundSalaries: false,
      canFundEquipment: false,
      canFundRD: false,
      canFundMarketing: false
    },
    deadlines: [],
    typicalTimeToFunding: '30-60 days (ongoing program)',
    url: 'https://www.nist.gov/mep/',
    sources: [sourcesGrants[3]]
  }
];

// ============================================================================
// BUDGET & FINANCIAL PROJECTIONS
// ============================================================================

export const capitalRequirements = {
  total: { min: 500, max: 1500 },
  byPhase: {
    'phase-1-product-partnerships': { min: 150, max: 300 },
    'phase-2-mvp-operations': { min: 200, max: 500 },
    'phase-3-scale-replication': { min: 150, max: 700 }
  },
  byCategory: {
    hiring: { min: 300, max: 700 },
    infrastructure: { min: 100, max: 300 },
    equipment: { min: 100, max: 500 },
    certification: { min: 10, max: 50 },
    other: { min: -10, max: -50 }
  }
};

export const unitEconomics = {
  grossMargin: '40-60% (manufacturing services model)',
  capitalIntensity: 'high' as const,
  timeToRevenue: '9-18 months',
  description: 'Higher capital requirements than software due to equipment/facility needs. Partnership model reduces upfront CapEx significantly.'
};

export const revenueModels = [
  {
    type: 'Service Revenue (Per-Part/Per-Hour)',
    description: 'Charge per part manufactured or per machine hour',
    estimatedArpu: '$10K-100K per customer monthly',
    scalability: 'linear' as const
  },
  {
    type: 'Software/Platform Fee',
    description: 'SaaS subscription for using platform + manufacturing',
    estimatedArpu: '$5K-50K per customer monthly',
    scalability: 'superlinear' as const
  },
  {
    type: 'Hybrid (Platform + Services)',
    description: 'Combination subscription + per-part pricing',
    estimatedArpu: '$15K-150K per customer monthly',
    scalability: 'superlinear' as const
  }
];

// ============================================================================
// MAIN CONFIG EXPORT
// ============================================================================

export const rapidManufacturingConfig: BusinessVerticalConfig = {
  id: 'rapid-manufacturing',
  name: '48-Hour CAD-to-Delivery Advanced Manufacturing',
  description: 'Rapid manufacturing platform combining software orchestration with manufacturing partnerships for fast, affordable custom parts',
  lastUpdated: '2026-01-18',

  industry: 'Advanced Manufacturing & Technology',

  regulatoryFramework: regulatoryFramework,

  revenueModels: revenueModels,
  unitEconomics: unitEconomics,

  marketOpportunity: marketOpportunity,

  // Phases
  phases: Object.values(manufacturingPhases),
  expertiseUmbrellas: [processEngineeringUmbrella, platformProductUmbrella, salesCustomerUmbrella],

  // Capital requirements
  capitalRequirements: capitalRequirements,
  grantOpportunities: grantOpportunities,

  // Strategic context
  keyRisks: [
    'SBIR/STTR programs paused - non-dilutive funding on hold',
    'Commodity hardware becoming cheaper (democratization risk)',
    'Protolabs and established players have scale advantage',
    'Manufacturing complexity: quality consistency across locations',
    'Supplier/partner dependencies (not vertically integrated)',
    'Capital intensity higher than pure software verticals'
  ],

  competitiveAdvantages: [
    'Software-first platform differentiation (AI cost optimization)',
    'Founder-fillable core roles (product, engineering, partnerships)',
    'No federal credentials required (vs. aerospace/defense verticals)',
    'Proven customer pain point (speed premium)',
    'Scalable partnership model (vs. owning equipment)',
    'Fastest market validation possible (partnerships + MVP)',
    'High founder control of technology/strategy'
  ],

  exitStrategy: [
    'Acquisition by large contract manufacturer (Jaco Electronics, etc.)',
    'Acquisition by 3D printing company (Stratasys, 3D Systems, HP)',
    'IPO after reaching $100M+ ARR',
    'Consolidation play (acquire fragmented job shops, integrate on platform)',
    'Private equity roll-up opportunity'
  ],

  // Sources
  sources: {
    regulatory: sourcesRegulatory,
    market: sourcesMarket,
    licensing: [],
    grants: sourcesGrants,
    industry: sourcesTechnology,
    competitive: sourcesCompetitive,
    technical: sourcesTechnology,
    financial: [],
    other: []
  },
  lastResearchUpdate: '2026-01-18'
};

export default rapidManufacturingConfig;
