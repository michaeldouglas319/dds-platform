/**
 * Composites Contract Manufacturing: Expertise Requirements & Operational Phases
 * Phase-Based Skill Metadata for Acquisition & Operational Scaling
 *
 * Research Source: /Users/bymichaeldouglas/Desktop/ref/COMPOSITES_CONTRACT_MANUFACTURING_GUIDE.md
 * Date: January 11, 2026
 *
 * Structure:
 * - 3-4 Core Expertise Areas (Operations, Quality, Sales, Finance)
 * - 3 Operational Phases (Acquisition & Stabilization, Optimization & Growth, Scale & Diversification)
 * - Phase-specific skill requirements with supporting staff hiring
 */

/**
 * Operational Phase Definition
 */
export type OperationalPhase = 
  | 'phase-1-acquisition-stabilization'
  | 'phase-2-optimization-growth'
  | 'phase-3-scale-diversification';

export interface PhaseMetadata {
  id: OperationalPhase;
  name: string;
  timeline: string;
  description: string;
  importance: number; // 1-3, where 1 is most important
}

export const operationalPhases: Record<OperationalPhase, PhaseMetadata> = {
  'phase-1-acquisition-stabilization': {
    id: 'phase-1-acquisition-stabilization',
    name: 'Acquisition & Stabilization',
    timeline: 'Months 1-6',
    description: 'Complete acquisition, stabilize operations, retain employees and customers, assess gaps. Critical foundation phase.',
    importance: 1
  },
  'phase-2-optimization-growth': {
    id: 'phase-2-optimization-growth',
    name: 'Optimization & Growth',
    timeline: 'Months 7-18',
    description: 'Optimize processes, expand capacity, acquire new customers, improve margins. Growth acceleration phase.',
    importance: 2
  },
  'phase-3-scale-diversification': {
    id: 'phase-3-scale-diversification',
    name: 'Scale & Diversification',
    timeline: 'Months 19-36',
    description: 'Scale to $10M-$20M revenue, diversify customer base, expand capabilities, strategic partnerships. Maturity phase.',
    importance: 3
  }
};

/**
 * Expertise Skill Definition
 */
export type SkillCriticality = 'critical' | 'important' | 'support';

export interface ExpertiseSkill {
  id: string;
  name: string;
  yearsRequired: string;
  requiredPhases: OperationalPhase[];
  criticality: SkillCriticality;
  description: string;
  validationQuestions: string[];
  redFlags: string[];
}

/**
 * Expertise Umbrella Definition
 */
export interface ExpertiseUmbrella {
  id: string;
  name: string;
  codeName: string;
  role: string;
  yearsRequired: string;
  annualCompensation: string;
  coreResponsibilities: string[];
  requiredSkills: ExpertiseSkill[];
  mustHaveSkills: string[];
  redFlags: string[];
  supportingHires: Array<{
    phase: OperationalPhase;
    role: string;
    count: number;
    purpose: string;
    compensation?: string;
  }>;
  budgetRange: {
    phase1: { min: number; max: number };
    phase2: { min: number; max: number };
    phase3: { min: number; max: number };
    totalMin: number;
    totalMax: number;
  };
  keyStrategicDecisions: string[];
  hiringStrategy: {
    target: string;
    timing: string;
    equity?: string;
  };
}

/**
 * Expertise Skills Database
 */
export const compositesSkills: ExpertiseSkill[] = [
  // Operations Skills
  {
    id: 'skill-autoclave-operations',
    name: 'Autoclave Process Operations',
    yearsRequired: '5-8 years',
    requiredPhases: ['phase-1-acquisition-stabilization', 'phase-2-optimization-growth', 'phase-3-scale-diversification'],
    criticality: 'critical',
    description: 'Autoclave cycle optimization, prepreg handling, cure cycle development, process troubleshooting',
    validationQuestions: [
      'Walk me through your autoclave cycle optimization process',
      'How do you handle prepreg material storage and handling?',
      'What\'s your approach to reducing scrap rates in production?',
      'Have you implemented lean manufacturing in composites?'
    ],
    redFlags: [
      '❌ No experience with autoclave processes',
      '❌ Can\'t explain cure cycle development',
      '❌ High scrap rates (>10%)',
      '❌ No process improvement experience'
    ]
  },
  {
    id: 'skill-layup-processes',
    name: 'Composite Layup Processes',
    yearsRequired: '5-8 years',
    requiredPhases: ['phase-1-acquisition-stabilization', 'phase-2-optimization-growth', 'phase-3-scale-diversification'],
    criticality: 'critical',
    description: 'Hand layup, automated layup, fiber orientation, ply sequencing, defect prevention',
    validationQuestions: [
      'What layup methods have you used (hand, automated, hybrid)?',
      'How do you ensure fiber orientation accuracy?',
      'What\'s your defect prevention strategy?',
      'What\'s your experience with different prepreg systems?'
    ],
    redFlags: [
      '❌ Limited to one layup method',
      '❌ No experience with automated systems',
      '❌ High defect rates',
      '❌ Can\'t explain ply sequencing'
    ]
  },
  {
    id: 'skill-cnc-trimming',
    name: 'CNC Trimming & Machining',
    yearsRequired: '3-5 years',
    requiredPhases: ['phase-1-acquisition-stabilization', 'phase-2-optimization-growth'],
    criticality: 'important',
    description: 'CNC programming, tooling selection, composite machining techniques, edge finishing',
    validationQuestions: [
      'What CNC systems have you programmed?',
      'How do you handle composite machining challenges?',
      'What\'s your approach to tooling selection?',
      'What\'s your edge finishing process?'
    ],
    redFlags: [
      '❌ No CNC programming experience',
      '❌ Can\'t explain composite machining challenges',
      '❌ High tooling costs',
      '❌ Poor edge quality'
    ]
  },
  {
    id: 'skill-quality-inspection',
    name: 'Quality Inspection & Testing',
    yearsRequired: '5-8 years',
    requiredPhases: ['phase-1-acquisition-stabilization', 'phase-2-optimization-growth', 'phase-3-scale-diversification'],
    criticality: 'critical',
    description: 'Visual inspection, NDT methods, dimensional inspection, material testing, documentation',
    validationQuestions: [
      'What NDT methods are you certified in?',
      'How do you ensure dimensional accuracy?',
      'What\'s your material testing process?',
      'How do you document inspection results?'
    ],
    redFlags: [
      '❌ No NDT certification',
      '❌ Poor documentation practices',
      '❌ High rejection rates',
      '❌ No material testing capability'
    ]
  },
  // Quality Systems Skills
  {
    id: 'skill-as9100-management',
    name: 'AS9100 Quality Management',
    yearsRequired: '8-10 years',
    requiredPhases: ['phase-1-acquisition-stabilization', 'phase-2-optimization-growth', 'phase-3-scale-diversification'],
    criticality: 'critical',
    description: 'AS9100 certification maintenance, internal audits, corrective actions, quality systems',
    validationQuestions: [
      'Have you maintained AS9100 certification? What was your last audit result?',
      'What\'s your approach to corrective action management?',
      'How do you ensure material traceability from receipt to shipment?',
      'What quality metrics do you track and report?'
    ],
    redFlags: [
      '❌ No AS9100 experience',
      '❌ Failed audits',
      '❌ Poor corrective action system',
      '❌ No traceability system'
    ]
  },
  {
    id: 'skill-nadcap-accreditation',
    name: 'NADCAP Accreditation',
    yearsRequired: '5-8 years',
    requiredPhases: ['phase-2-optimization-growth', 'phase-3-scale-diversification'],
    criticality: 'important',
    description: 'NADCAP accreditation, special process control, audit preparation, compliance',
    validationQuestions: [
      'What NADCAP processes have you managed?',
      'What\'s your audit preparation process?',
      'How do you maintain process control?',
      'What\'s your corrective action process?'
    ],
    redFlags: [
      '❌ No NADCAP experience',
      '❌ Failed audits',
      '❌ Poor process control',
      '❌ No audit preparation system'
    ]
  },
  {
    id: 'skill-traceability-systems',
    name: 'Material Traceability Systems',
    yearsRequired: '5-8 years',
    requiredPhases: ['phase-1-acquisition-stabilization', 'phase-2-optimization-growth', 'phase-3-scale-diversification'],
    criticality: 'critical',
    description: 'Material tracking, lot control, batch tracking, documentation systems',
    validationQuestions: [
      'How do you track materials from receipt to shipment?',
      'What\'s your lot control system?',
      'How do you handle batch tracking?',
      'What documentation systems do you use?'
    ],
    redFlags: [
      '❌ No traceability system',
      '❌ Poor documentation',
      '❌ Lost material traceability',
      '❌ No lot control'
    ]
  },
  // Sales & Business Development Skills
  {
    id: 'skill-aerospace-sales',
    name: 'Aerospace Sales & Account Management',
    yearsRequired: '5-8 years',
    requiredPhases: ['phase-1-acquisition-stabilization', 'phase-2-optimization-growth', 'phase-3-scale-diversification'],
    criticality: 'critical',
    description: 'Aerospace customer relationships, contract negotiation, account management, sales process',
    validationQuestions: [
      'What\'s your approach to qualifying new aerospace customers?',
      'How do you structure contracts to protect margins?',
      'What\'s your customer acquisition cost and sales cycle?',
      'How do you maintain relationships with tier-1 suppliers?'
    ],
    redFlags: [
      '❌ No aerospace sales experience',
      '❌ Long sales cycles (>12 months)',
      '❌ Low close rates (<20%)',
      '❌ Poor customer relationships'
    ]
  },
  {
    id: 'skill-commercial-sales',
    name: 'Commercial Market Sales',
    yearsRequired: '3-5 years',
    requiredPhases: ['phase-2-optimization-growth', 'phase-3-scale-diversification'],
    criticality: 'important',
    description: 'Commercial customer acquisition, volume pricing, market development',
    validationQuestions: [
      'What commercial markets have you sold into?',
      'How do you approach volume pricing?',
      'What\'s your commercial sales cycle?',
      'How do you balance aerospace and commercial customers?'
    ],
    redFlags: [
      '❌ No commercial sales experience',
      '❌ Can\'t explain volume pricing',
      '❌ Poor market knowledge',
      '❌ Low margins'
    ]
  },
  // Financial Skills
  {
    id: 'skill-cost-accounting',
    name: 'Manufacturing Cost Accounting',
    yearsRequired: '5-8 years',
    requiredPhases: ['phase-1-acquisition-stabilization', 'phase-2-optimization-growth', 'phase-3-scale-diversification'],
    criticality: 'important',
    description: 'Cost accounting, pricing models, margin analysis, financial planning',
    validationQuestions: [
      'How do you calculate manufacturing costs?',
      'What\'s your pricing model?',
      'How do you track margins by customer/product?',
      'What\'s your financial planning process?'
    ],
    redFlags: [
      '❌ No cost accounting experience',
      '❌ Poor pricing models',
      '❌ Can\'t explain margins',
      '❌ No financial planning'
    ]
  }
];

/**
 * Expertise Umbrellas
 */
export const compositesExpertiseUmbrellas: ExpertiseUmbrella[] = [
  {
    id: 'umbrella-1-engineering',
    name: 'Composites Engineering & Quality',
    codeName: 'The Technical Backbone',
    role: 'VP Manufacturing / Chief Composites Engineer',
    yearsRequired: '12-18 years aerospace composites manufacturing',
    annualCompensation: '$130K-$200K + equity',
    coreResponsibilities: [
      'Design/optimize manufacturing processes for dual-tier (aerospace + commercial)',
      'Lead AS9100 certification effort',
      'Develop material specifications, supplier quality agreements',
      'Implement NDT (ultrasonic, thermography) testing protocols',
      'Mentorship of technicians, continuous improvement culture'
    ],
    mustHaveSkills: [
      'Hands-on knowledge of wet layup, vacuum bag, pre-preg, AFP processes',
      'Familiarity with CATIA/ANSYS or similar FEA (part design validation)',
      'Understanding of composite mechanics (fiber orientation, load paths, failure modes)',
      'Experience with tooling design (molds, jigs, fixtures)',
      'Prior AS9100 certification leadership (not just passing an audit)',
      'Supplier vetting & material qualification experience'
    ],
    redFlags: [
      '❌ Only aerospace experience (can\'t adapt to commercial markets)',
      '❌ Academia/research background without production floor time',
      '❌ No hands-on manufacturing — purely process design',
      '❌ Limited exposure to cost/cycle time optimization',
      '❌ Weak communication (can\'t mentor or explain to customers)'
    ],
    requiredSkills: [
      compositesSkills.find(s => s.id === 'skill-autoclave-operations')!,
      compositesSkills.find(s => s.id === 'skill-layup-processes')!,
      compositesSkills.find(s => s.id === 'skill-quality-inspection')!,
      compositesSkills.find(s => s.id === 'skill-as9100-management')!
    ],
    supportingHires: [
      { phase: 'phase-1-acquisition-stabilization', role: 'Quality Technician', count: 1, purpose: 'NDT certification + visual inspection', compensation: '$50K-$70K' },
      { phase: 'phase-2-optimization-growth', role: 'Process Engineer', count: 1, purpose: 'Continuous improvement', compensation: '$95K' },
      { phase: 'phase-2-optimization-growth', role: 'Quality Auditor', count: 1, purpose: 'AS9100 audit support', compensation: '$60K' }
    ],
    budgetRange: {
      phase1: { min: 130000, max: 200000 },
      phase2: { min: 150000, max: 250000 },
      phase3: { min: 180000, max: 300000 },
      totalMin: 460000,
      totalMax: 750000
    },
    keyStrategicDecisions: [
      'AS9100 certification scope and timeline',
      'NDT method selection (ultrasonic, thermography, X-ray)',
      'Supplier qualification strategy',
      'Material specification development'
    ],
    hiringStrategy: {
      target: 'Boeing/Lockheed/Raytheon/GE composites manufacturing engineers',
      timing: 'Month 1-3 post-acquisition (hire BEFORE AS9100 push)',
      equity: '0.5-1.5% vesting over 4 years'
    }
  },
  {
    id: 'umbrella-2-operations',
    name: 'Production & Operations',
    codeName: 'The Scaler',
    role: 'Operations Manager / Plant Manager',
    yearsRequired: '8-12 years manufacturing operations (aerospace preferred)',
    annualCompensation: '$100K-$150K + equity',
    coreResponsibilities: [
      'Day-to-day production scheduling, capacity planning',
      'Lead process optimization (reduce cycle time, scrap rate, labor cost)',
      'Safety compliance, EHS management',
      'Hiring and training production teams',
      'Vendor management (resin, fiber, core material sourcing)',
      'Work instruction development, continuous improvement'
    ],
    mustHaveSkills: [
      'Lean manufacturing / 5S methodology',
      'ERP/MES system experience (inventory, work orders)',
      'Production metrics (OEE, cycle time, first-pass yield tracking)',
      'Safety record (OSHA, workers comp management)',
      'Labor cost/productivity optimization',
      'Prior experience scaling production (greenfield or post-M&A)'
    ],
    redFlags: [
      '❌ Only high-volume automotive/consumer manufacturing (aerospace is different)',
      '❌ Weak safety/compliance culture',
      '❌ No cost-control mindset (treats waste as acceptable)',
      '❌ Poor communication with front-line staff'
    ],
    requiredSkills: [
      compositesSkills.find(s => s.id === 'skill-autoclave-operations')!,
      compositesSkills.find(s => s.id === 'skill-layup-processes')!,
      compositesSkills.find(s => s.id === 'skill-cnc-trimming')!,
      compositesSkills.find(s => s.id === 'skill-quality-inspection')!
    ],
    supportingHires: [
      { phase: 'phase-1-acquisition-stabilization', role: 'Production Supervisor', count: 1, purpose: 'Per shift management', compensation: '$55K-$75K' },
      { phase: 'phase-1-acquisition-stabilization', role: 'Composite Technicians', count: 3, purpose: 'Layup/trimming/curing', compensation: '$40K-$60K' },
      { phase: 'phase-2-optimization-growth', role: 'Materials Coordinator', count: 1, purpose: 'Inventory, supplier communication', compensation: '$45K-$65K' },
      { phase: 'phase-2-optimization-growth', role: 'Composite Technicians', count: 5, purpose: 'Additional production capacity', compensation: '$40K-$60K' }
    ],
    budgetRange: {
      phase1: { min: 100000, max: 150000 },
      phase2: { min: 200000, max: 300000 },
      phase3: { min: 300000, max: 450000 },
      totalMin: 600000,
      totalMax: 900000
    },
    keyStrategicDecisions: [
      'Production capacity planning and shift structure',
      'Equipment upgrade vs. replacement strategy',
      'Process automation level (manual vs. automated layup)',
      'Supplier selection and vendor management'
    ],
    hiringStrategy: {
      target: 'Boeing/Lockheed/Spirit AeroSystems plant managers',
      timing: 'Month 1-2 post-acquisition (hire immediately)',
      equity: '0.25-1% vesting over 4 years'
    }
  },
  {
    id: 'umbrella-3-sales',
    name: 'Sales & Customer Relations',
    codeName: 'The Growth Engine',
    role: 'VP Sales / Business Development',
    yearsRequired: '8-12 years aerospace + commercial contract manufacturing sales',
    annualCompensation: '$100K-$180K + 3-8% revenue commission',
    coreResponsibilities: [
      'Target aerospace OEMs (Boeing, Lockheed, GE, Raytheon) for AS9100 business',
      'Develop commercial/automotive customer pipeline (Tier-1 suppliers, sporting goods)',
      'RFQ response, proposal writing, contract negotiation',
      'Quarterly business reviews with customers',
      'Win/loss analysis, pricing strategy',
      'Hiring sales support team (quote specialists, account managers)'
    ],
    mustHaveSkills: [
      'Aerospace supply chain knowledge (Boeing AS9100 requirements, supply schedules)',
      'Ability to translate technical specs into cost/schedule quotes',
      'Relationship-building in defense/commercial manufacturing',
      'RFQ management (using PLM systems, customer portals)',
      'Pricing discipline (knows composite manufacturing cost structures)',
      'Comfortable with long sales cycles (6-12 months for aerospace)'
    ],
    redFlags: [
      '❌ Only automotive/plastics sales experience (aerospace rhythm different)',
      '❌ No understanding of manufacturing cost structures',
      '❌ Transactional sales mentality (composites need long-term partnerships)',
      '❌ No aerospace supply chain relationships'
    ],
    requiredSkills: [
      compositesSkills.find(s => s.id === 'skill-aerospace-sales')!,
      compositesSkills.find(s => s.id === 'skill-commercial-sales')!
    ],
    supportingHires: [
      { phase: 'phase-2-optimization-growth', role: 'Sales Engineer / Quoting Specialist', count: 1, purpose: 'Technical RFQ response', compensation: '$60K-$85K' },
      { phase: 'phase-3-scale-diversification', role: 'Account Manager', count: 1, purpose: 'Customer relationship management', compensation: '$55K-$75K' }
    ],
    budgetRange: {
      phase1: { min: 100000, max: 180000 },
      phase2: { min: 160000, max: 265000 },
      phase3: { min: 215000, max: 330000 },
      totalMin: 475000,
      totalMax: 775000
    },
    keyStrategicDecisions: [
      'Target customer mix (aerospace vs. commercial)',
      'Pricing strategy (cost-plus vs. market-based)',
      'Contract terms (payment terms, volume commitments)',
      'Geographic expansion strategy'
    ],
    hiringStrategy: {
      target: 'Spirit AeroSystems, Hexcel, Cytec, Electroimpact sales leadership',
      timing: 'Month 2-3 (start building pipeline while ops ramping)',
      equity: 'Commission: 3% base, up to 8% for new customer acquisition'
    }
  },
  {
    id: 'umbrella-4-finance',
    name: 'Finance & Admin',
    codeName: 'The Enabler',
    role: 'CFO / Finance Manager',
    yearsRequired: '6-10 years manufacturing finance (preferably aerospace)',
    annualCompensation: '$90K-$150K',
    coreResponsibilities: [
      'Cost accounting (job costing by customer, product line)',
      'Cash flow management (working capital, inventory control)',
      'Fundraising support (financial models, investor relations)',
      'P&L management, margin analysis',
      'AS9100 financial documentation (audit trail)',
      'HR administration, payroll, benefits'
    ],
    mustHaveSkills: [
      'Manufacturing cost accounting (absorption costing, burden rates)',
      'Familiarity with aerospace/defense financial controls',
      'Excel modeling (cash flow projections, what-if scenarios)',
      'Fundraising/investor communication',
      'ERP system experience (Infor, Oracle, NetSuite)'
    ],
    redFlags: [
      '❌ No manufacturing cost accounting experience',
      '❌ Only service/software finance background',
      '❌ Weak Excel/modeling skills',
      '❌ No experience with aerospace financial controls'
    ],
    requiredSkills: [
      compositesSkills.find(s => s.id === 'skill-cost-accounting')!
    ],
    supportingHires: [
      { phase: 'phase-1-acquisition-stabilization', role: 'Finance Manager', count: 1, purpose: 'Financial management', compensation: '$90K-$150K' },
      { phase: 'phase-2-optimization-growth', role: 'Cost Accountant', count: 1, purpose: 'Cost accounting', compensation: '$60K-$80K' },
      { phase: 'phase-3-scale-diversification', role: 'Financial Analyst', count: 1, purpose: 'Financial analysis', compensation: '$65K-$85K' }
    ],
    budgetRange: {
      phase1: { min: 90000, max: 150000 },
      phase2: { min: 150000, max: 230000 },
      phase3: { min: 215000, max: 315000 },
      totalMin: 455000,
      totalMax: 695000
    },
    keyStrategicDecisions: [
      'Financial system selection',
      'Pricing model and margin targets',
      'Capital allocation strategy',
      'Growth financing approach'
    ],
    hiringStrategy: {
      target: 'Manufacturing finance professionals with aerospace experience',
      timing: 'Month 2-3 post-acquisition (crucial for AS9100 audit trail)',
      equity: 'Standard equity package'
    }
  }
];

/**
 * Helper Functions
 */
export function getSkillsByPhase(phase: OperationalPhase): ExpertiseSkill[] {
  return compositesSkills.filter(skill => skill.requiredPhases.includes(phase));
}

export function getUmbrellaById(id: string): ExpertiseUmbrella | undefined {
  return compositesExpertiseUmbrellas.find(umbrella => umbrella.id === id);
}

export function getFoundingPartnerSummary() {
  const totalBudget = compositesExpertiseUmbrellas.reduce(
    (acc, umbrella) => ({
      minMillions: acc.minMillions + umbrella.budgetRange.totalMin / 1000000,
      maxMillions: acc.maxMillions + umbrella.budgetRange.totalMax / 1000000
    }),
    { minMillions: 0, maxMillions: 0 }
  );

  return {
    totalExpertiseUmbrellas: compositesExpertiseUmbrellas.length,
    totalBudget: {
      minMillions: totalBudget.minMillions,
      maxMillions: totalBudget.maxMillions
    },
    timeline: '18-36 months',
    phases: Object.values(operationalPhases)
  };
}

export const allExpertiseUmbrellas = compositesExpertiseUmbrellas;

