/**
 * FAA Part 108 BVLOS Operations: Founding Partner Expertise Requirements
 * Phase-Based Skill Metadata for Investor Pitch & Hiring Roadmap
 *
 * Research Source: /Users/bymichaeldouglas/Desktop/ref/FAA_PART_108_EXPERT_REQUIREMENTS.md
 * Date: January 11, 2026
 *
 * Structure:
 * - 4 Core Expertise Umbrellas (Regulatory, Hardware, Systems, Operations)
 * - 3 Phases (Pre-Final Rule Q1-Q2 2026, Post-Final Rule Q3-Q4 2026, Execution 2027)
 * - Phase-specific skill requirements with supporting staff hiring
 */

/**
 * Phase Definition - 8 Phases Ordered by Importance
 * Breaking down the original 3 phases into 8 critical milestones
 */
export type CertificationPhase = 
  | 'phase-1-foundation' 
  | 'phase-2-sms-design' 
  | 'phase-3-rule-analysis' 
  | 'phase-4-hardware-design'
  | 'phase-5-component-vetting'
  | 'phase-6-prototype-development'
  | 'phase-7-testing-validation'
  | 'phase-8-faa-submission';

export interface PhaseMetadata {
  id: CertificationPhase;
  name: string;
  timeline: string;
  description: string;
  importance: number; // 1-8, where 1 is most important
  originalPhase: 'phase-1-pre-rule' | 'phase-2-post-rule' | 'phase-3-execution';
}

export const certificationPhases: Record<CertificationPhase, PhaseMetadata> = {
  'phase-1-foundation': {
    id: 'phase-1-foundation',
    name: 'Foundation & Organization Setup',
    timeline: 'Q1 2026 (3 months)',
    description: 'Establish legal entity, initial team structure, regulatory relationships, and organizational foundation. Most critical first step.',
    importance: 1,
    originalPhase: 'phase-1-pre-rule'
  },
  'phase-2-sms-design': {
    id: 'phase-2-sms-design',
    name: 'SMS Design & Regulatory Strategy',
    timeline: 'Q1–Q2 2026 (3 months)',
    description: 'Design Safety Management System (SMS), establish regulatory approach, determine Permitted vs. Certificated path. Critical for all subsequent work.',
    importance: 2,
    originalPhase: 'phase-1-pre-rule'
  },
  'phase-3-rule-analysis': {
    id: 'phase-3-rule-analysis',
    name: 'Final Rule Analysis & Certification Planning',
    timeline: 'Q2–Q3 2026 (3 months)',
    description: 'Analyze published final rule, develop detailed certification strategy, identify Special Conditions needs, plan FAA pre-application meeting.',
    importance: 3,
    originalPhase: 'phase-2-post-rule'
  },
  'phase-4-hardware-design': {
    id: 'phase-4-hardware-design',
    name: 'Hardware Design & Specification',
    timeline: 'Q3 2026 (3 months)',
    description: 'Complete aircraft design specification, DAA system selection, avionics integration planning, structural design. Foundation for all hardware work.',
    importance: 4,
    originalPhase: 'phase-2-post-rule'
  },
  'phase-5-component-vetting': {
    id: 'phase-5-component-vetting',
    name: 'Component Sourcing & Blue UAS Vetting',
    timeline: 'Q3–Q4 2026 (3 months)',
    description: 'Source components, initiate Blue UAS vetting, establish supplier relationships, cybersecurity compliance, supply chain traceability.',
    importance: 5,
    originalPhase: 'phase-2-post-rule'
  },
  'phase-6-prototype-development': {
    id: 'phase-6-prototype-development',
    name: 'Prototype Development & Integration',
    timeline: 'Q4 2026–Q1 2027 (6 months)',
    description: 'Build first prototype, integrate DAA/Remote ID/UTM systems, validate integration, initial ground testing. Critical path for certification.',
    importance: 6,
    originalPhase: 'phase-3-execution'
  },
  'phase-7-testing-validation': {
    id: 'phase-7-testing-validation',
    name: 'Testing, Validation & Compliance',
    timeline: 'Q1–Q2 2027 (6 months)',
    description: 'Flight testing, performance validation, compliance verification, FMEA completion, test data analysis. Proves equivalent safety.',
    importance: 7,
    originalPhase: 'phase-3-execution'
  },
  'phase-8-faa-submission': {
    id: 'phase-8-faa-submission',
    name: 'FAA Submission & Operational Readiness',
    timeline: 'Q2–Q3 2027 (6 months)',
    description: 'Compile certification data package, submit to FAA, respond to requests, finalize operations procedures, achieve operational readiness.',
    importance: 8,
    originalPhase: 'phase-3-execution'
  }
};

/**
 * Expertise Skill Definition
 */
export interface ExpertiseSkill {
  id: string;
  name: string;
  yearsRequired: string;
  requiredPhases: CertificationPhase[];
  criticality: 'critical' | 'important' | 'support';
  description: string;
  validationQuestions: string[];
  redFlags?: string[];
}

export interface ExpertiseUmbrella {
  id: string;
  name: string;
  codeName: string; // For pitch deck reference
  covers: string;
  coreResponsibilities: string[];
  requiredSkills: ExpertiseSkill[];
  supportingHires: {
    phase: CertificationPhase;
    roles: Array<{ title: string; purpose: string; fte?: string }>;
  }[];
  budgetRange: {
    phase1Min: number; // in thousands
    phase1Max: number;
    phase2Min: number;
    phase2Max: number;
    phase3Min: number;
    phase3Max: number;
    totalMin: number;
    totalMax: number;
  };
  keyStrategicDecisions: string[];
}

/**
 * Helper function to map old 3-phase system to new 8-phase system
 */
function mapPhases(oldPhases: ('phase-1-pre-rule' | 'phase-2-post-rule' | 'phase-3-execution')[]): CertificationPhase[] {
  const phaseMap: Record<string, CertificationPhase[]> = {
    'phase-1-pre-rule': ['phase-1-foundation', 'phase-2-sms-design'],
    'phase-2-post-rule': ['phase-3-rule-analysis', 'phase-4-hardware-design', 'phase-5-component-vetting'],
    'phase-3-execution': ['phase-6-prototype-development', 'phase-7-testing-validation', 'phase-8-faa-submission']
  };
  
  const newPhases: CertificationPhase[] = [];
  oldPhases.forEach(oldPhase => {
    newPhases.push(...phaseMap[oldPhase]);
  });
  return Array.from(new Set(newPhases)); // Remove duplicates
}

/**
 * EXPERTISE UMBRELLA 1: FAA Regulatory & Compliance Strategy
 */
export const regulatoryUmbrella: ExpertiseUmbrella = {
  id: 'umbrella-1-regulatory',
  name: 'FAA Regulatory & Compliance Strategy',
  codeName: 'The Gatekeeper',
  covers: 'Navigate FAA bureaucracy, build certification case, design Safety Management Systems',
  coreResponsibilities: [
    'Lead FAA strategy and certification approach',
    'Design Safety Management System (SMS) for Certificated operations',
    'Manage regulatory timeline and FAA communications',
    'Oversee TSA security integration and background checks',
    'Coordinate legal/compliance (Blue UAS, ITAR/EAR, supply chain agreements)'
  ],
  requiredSkills: [
    {
      id: 'skill-faa-cert-lead',
      name: 'FAA Certification Program Leadership',
      yearsRequired: '8–12 years',
      requiredPhases: mapPhases(['phase-1-pre-rule', 'phase-2-post-rule', 'phase-3-execution']),
      criticality: 'critical',
      description: 'Lead successful FAA certification programs (Part 23, Part 135, or Part 107 waivers)',
      validationQuestions: [
        'Tell me about your most recent FAA certification program. What was the timeline?',
        'Have you led a Special Conditions negotiation? Walk me through that process.',
        'How would you approach SMS design for a startup UAS manufacturer?'
      ],
      redFlags: [
        'Only has manned aircraft experience (doesn\'t understand UAS vernacular)',
        'Can\'t name specific relationships at FAA',
        'Overpromises timeline ("we can be certified in 12 months")'
      ]
    },
    {
      id: 'skill-sms-design',
      name: 'Safety Management System (SMS) Design',
      yearsRequired: '5–7 years',
      requiredPhases: mapPhases(['phase-1-pre-rule', 'phase-2-post-rule', 'phase-3-execution']),
      criticality: 'critical',
      description: '14 CFR Part 5 compliance, FMEA/FTA methodology, continuous improvement',
      validationQuestions: [
        'Tell me about an SMS you designed from scratch. What took longest?',
        'Walk me through how you\'d identify hazards for a UAS operation you\'ve never done before.'
      ],
      redFlags: [
        '"SMS is mostly paperwork"',
        'Can\'t explain 14 CFR Part 5 alignment'
      ]
    },
    {
      id: 'skill-special-conditions',
      name: 'Special Conditions & Equivalent Safety',
      yearsRequired: '7+ years',
      requiredPhases: mapPhases(['phase-2-post-rule', 'phase-3-execution']),
      criticality: 'important',
      description: 'Negotiating with FAA on novel design features and equivalent safety arguments',
      validationQuestions: [
        'Part 108 is performance-based, not prescriptive. How does that change your certification strategy?'
      ]
    }
  ],
  supportingHires: [
    {
      phase: 'phase-1-foundation',
      roles: [
        {
          title: 'Regulatory Coordinator (optional)',
          purpose: 'Documentation, FAA submissions, filing tracking',
          fte: '0-1'
        }
      ]
    },
    {
      phase: 'phase-2-sms-design',
      roles: [
        {
          title: 'SMS/Safety Specialist',
          purpose: 'Build formal SMS, hazard analysis, audit preparation',
          fte: '1'
        }
      ]
    },
    {
      phase: 'phase-8-faa-submission',
      roles: [
        {
          title: 'Quality/Compliance Officer',
          purpose: 'Internal audits, continuous improvement, incident investigation',
          fte: '1'
        }
      ]
    }
  ],
  budgetRange: {
    phase1Min: 150,
    phase1Max: 200,
    phase2Min: 300,
    phase2Max: 400,
    phase3Min: 400,
    phase3Max: 500,
    totalMin: 850,
    totalMax: 1100
  },
  keyStrategicDecisions: [
    'Permitted vs. Certificated operations path (determines SMS requirement)',
    'Category level for operations (Category 1–5: determines complexity)',
    'Blue UAS vetting vs. domestic sourcing strategy',
    'FAA pre-application meeting approach and timing',
    'Special Conditions negotiation strategy (if needed)'
  ]
};

/**
 * EXPERTISE UMBRELLA 2: UAS Hardware & Systems Design
 */
export const hardwareUmbrella: ExpertiseUmbrella = {
  id: 'umbrella-2-hardware',
  name: 'UAS Hardware & Systems Design',
  codeName: 'The Builder',
  covers: 'Design and integrate UAS hardware to meet Part 108 technical requirements',
  coreResponsibilities: [
    'Aircraft/airframe design and structural validation',
    'Integration of Detect-and-Avoid (DAA) systems',
    'Remote ID implementation and accuracy validation',
    'Avionics selection and integration',
    'Propulsion, battery, and thermal management',
    'Component procurement and supplier quality',
    'Design specification and technical documentation'
  ],
  requiredSkills: [
    {
      id: 'skill-uas-hardware-design',
      name: 'UAS Hardware Design & Integration',
      yearsRequired: '8–12 years',
      requiredPhases: mapPhases(['phase-1-pre-rule', 'phase-2-post-rule', 'phase-3-execution']),
      criticality: 'critical',
      description: 'UAS or aerospace hardware design, airworthiness design standards (DO-254)',
      validationQuestions: [
        'Have you integrated DAA systems before? If not, how do you mitigate that risk?',
        'Walk me through RTCA performance categories and how they impact your design',
        "What's your experience managing a distributed aerospace supplier chain?"
      ],
      redFlags: [
        'Only has commercial drone experience (not aerospace)',
        'Underestimates integration timeline',
        'Can\'t explain RTCA performance metrics'
      ]
    },
    {
      id: 'skill-daa-integration',
      name: 'Detect-and-Avoid (DAA) System Integration',
      yearsRequired: '7–10 years',
      requiredPhases: mapPhases(['phase-2-post-rule', 'phase-3-execution']),
      criticality: 'critical',
      description: 'Optical/radar/hybrid DAA systems, sensor integration, avoidance logic',
      validationQuestions: [
        'Have you integrated DAA systems before?',
        'Explain the tradeoffs between optical, radar, and hybrid DAA approaches.'
      ]
    },
    {
      id: 'skill-remote-id-implementation',
      name: 'Remote ID Systems (ASTM F3411 / Part 89)',
      yearsRequired: '5–7 years',
      requiredPhases: mapPhases(['phase-2-post-rule', 'phase-3-execution']),
      criticality: 'important',
      description: 'GPS accuracy validation, ASTM F3411 broadcasting, failsafe integration',
      validationQuestions: [
        'Walk me through how Remote ID behaves if your GPS fails mid-flight.'
      ]
    },
    {
      id: 'skill-avionics-integration',
      name: 'Avionics & Flight Control Systems',
      yearsRequired: '7–10 years',
      requiredPhases: mapPhases(['phase-2-post-rule', 'phase-3-execution']),
      criticality: 'critical',
      description: 'Autopilot selection, control algorithms, failsafe design, hardware integration',
      validationQuestions: [
        'What autopilot platforms have you integrated?',
        'How do you approach failsafe design for flight control systems?'
      ]
    },
    {
      id: 'skill-supply-chain-mgmt',
      name: 'Aerospace Supply Chain Management',
      yearsRequired: '5–7 years',
      requiredPhases: mapPhases(['phase-1-pre-rule', 'phase-2-post-rule', 'phase-3-execution']),
      criticality: 'important',
      description: 'Component sourcing, supplier quality, Blue UAS compliance, ITAR/EAR',
      validationQuestions: [
        "What's your experience with Blue UAS vetting?",
        'How would you approach the 2027 regulatory transition for supply chain?'
      ]
    }
  ],
  supportingHires: [
    {
      phase: 'phase-1-foundation',
      roles: []
    },
    {
      phase: 'phase-4-hardware-design',
      roles: [
        {
          title: 'DAA Integration Engineer',
          purpose: 'DAA system vendor selection, integration design, performance validation',
          fte: '1'
        },
        {
          title: 'Avionics Specialist',
          purpose: 'Autopilot selection, control system integration, failsafe design',
          fte: '1'
        },
        {
          title: 'Structural/Propulsion Engineer',
          purpose: 'Airframe design, propulsion systems, thermal management',
          fte: '1'
        }
      ]
    },
    {
      phase: 'phase-6-prototype-development',
      roles: [
        {
          title: 'Test Engineers',
          purpose: 'Prototype testing, validation, performance characterization',
          fte: '2-3'
        },
        {
          title: 'Assembly Lead',
          purpose: 'Prototype build, manufacturing processes, quality checks',
          fte: '1'
        },
        {
          title: 'Manufacturing Quality Engineer',
          purpose: 'Production readiness, supplier quality, manufacturing standards',
          fte: '1'
        }
      ]
    }
  ],
  budgetRange: {
    phase1Min: 50,
    phase1Max: 100,
    phase2Min: 400,
    phase2Max: 600,
    phase3Min: 600,
    phase3Max: 900,
    totalMin: 1050,
    totalMax: 1600
  },
  keyStrategicDecisions: [
    'New airframe design vs. integrate existing platform (huge timeline impact)',
    'DAA system vendor selection (optical vs. radar vs. hybrid)',
    'Avionics/autopilot platform (legacy proven systems vs. emerging platforms)',
    'Component sourcing: Blue UAS, Buy American, or foreign (supply chain strategy)',
    'Prototype build timeline and test schedule',
    'Supplier selection and quality management'
  ]
};

/**
 * EXPERTISE UMBRELLA 3: Systems Integration, Safety & Quality Assurance
 */
export const systemsSafetyUmbrella: ExpertiseUmbrella = {
  id: 'umbrella-3-systems-safety',
  name: 'Systems Integration, Safety & Quality Assurance',
  codeName: 'The Glue',
  covers: 'Integrate hardware with operations, validate everything works together, ensure quality and safety',
  coreResponsibilities: [
    'Systems-level safety analysis (failure mode analysis, hazard assessment)',
    'UTM integration and airspace management',
    'Cybersecurity and supply chain compliance',
    'Test & Evaluation planning and execution',
    'Quality management systems',
    'Software integration and validation'
  ],
  requiredSkills: [
    {
      id: 'skill-systems-safety',
      name: 'Systems Safety Engineering & FMEA',
      yearsRequired: '8–10 years',
      requiredPhases: mapPhases(['phase-1-pre-rule', 'phase-2-post-rule', 'phase-3-execution']),
      criticality: 'critical',
      description: 'Failure mode analysis, hazard assessment, equivalent safety cases, design FMEA',
      validationQuestions: [
        'Walk me through how you\'d structure an FMEA for a UAS aircraft.',
        'Tell me about a time you discovered a major quality issue mid-project and how you handled it.'
      ],
      redFlags: [
        'Can\'t walk through FMEA methodology',
        'Treats safety analysis as checkbox activity'
      ]
    },
    {
      id: 'skill-utm-integration',
      name: 'UTM Integration & Airspace Management',
      yearsRequired: '5–7 years',
      requiredPhases: mapPhases(['phase-2-post-rule', 'phase-3-execution']),
      criticality: 'important',
      description: 'Part 146 Automated Data Service Providers, strategic deconfliction, conformance monitoring',
      validationQuestions: [
        'Do you understand Part 146 UTM providers and integration requirements?',
        'What happens when your UTM link fails mid-flight?'
      ]
    },
    {
      id: 'skill-cybersecurity-supply-chain',
      name: 'Cybersecurity & Supply Chain Vetting',
      yearsRequired: '5–7 years',
      requiredPhases: mapPhases(['phase-1-pre-rule', 'phase-2-post-rule', 'phase-3-execution']),
      criticality: 'critical',
      description: 'NIST standards, DoD requirements, Blue UAS vetting, component traceability, export control',
      validationQuestions: [
        'Have you worked on Blue UAS vetting or similar government cybersecurity assessments?',
        'If you discover mid-design that a critical component has a foreign subcomponent, how do you remediate?'
      ],
      redFlags: [
        'Supply chain is "just cost optimization"',
        'Only has commercial supply chain experience',
        'Underestimates vetting timelines'
      ]
    },
    {
      id: 'skill-test-evaluation',
      name: 'Test & Evaluation Planning',
      yearsRequired: '6–8 years',
      requiredPhases: mapPhases(['phase-2-post-rule', 'phase-3-execution']),
      criticality: 'important',
      description: 'Validation test planning, test data analysis, compliance verification, flight test support',
      validationQuestions: [
        'How would you design a validation test plan to demonstrate FAA compliance?'
      ]
    }
  ],
  supportingHires: [
    {
      phase: 'phase-2-sms-design',
      roles: [
        {
          title: 'Systems Safety Engineer',
          purpose: 'Hazard analysis, FMEA framework, SMS support',
          fte: '1'
        }
      ]
    },
    {
      phase: 'phase-3-rule-analysis',
      roles: [
        {
          title: 'Test & Evaluation Lead',
          purpose: 'Design validation test plan, T&E strategy, compliance roadmap',
          fte: '1'
        },
        {
          title: 'Cybersecurity/Supply Chain Officer',
          purpose: 'Component vetting, Blue UAS dossier, supplier management',
          fte: '1'
        }
      ]
    },
    {
      phase: 'phase-7-testing-validation',
      roles: [
        {
          title: 'Test Engineers',
          purpose: 'Flight testing, data collection, analysis',
          fte: '2-3'
        },
        {
          title: 'Quality Officer',
          purpose: 'Internal audits, corrective actions, compliance tracking',
          fte: '1'
        },
        {
          title: 'UTM Integration Specialist',
          purpose: 'Part 146 provider coordination, flight planning integration',
          fte: '1'
        }
      ]
    }
  ],
  budgetRange: {
    phase1Min: 100,
    phase1Max: 150,
    phase2Min: 300,
    phase2Max: 450,
    phase3Min: 450,
    phase3Max: 600,
    totalMin: 850,
    totalMax: 1200
  },
  keyStrategicDecisions: [
    'Hazard identification approach (what could go wrong?)',
    'Test & Evaluation strategy (how do you prove compliance?)',
    'UTM provider selection (which Part 146 provider to use?)',
    'Supply chain vetting timeline (Blue UAS or domestic sourcing?)',
    'Quality system design (how do you ensure continuous compliance?)',
    'Failure mode prioritization (what risks are acceptable?)'
  ]
};

/**
 * EXPERTISE UMBRELLA 4: Flight Operations & Commercial Execution
 */
export const operationsUmbrella: ExpertiseUmbrella = {
  id: 'umbrella-4-operations',
  name: 'Flight Operations & Commercial Execution',
  codeName: 'The Operator',
  covers: 'Define operations, train personnel, execute flights, manage commercial viability and revenue',
  coreResponsibilities: [
    'Operations procedures and flight planning',
    'Personnel training and qualifications',
    'Flight supervision and pilot management',
    'Maintenance procedures and documentation',
    'Commercial operations planning',
    'TSA coordination for personnel',
    'Customer operations and flight execution'
  ],
  requiredSkills: [
    {
      id: 'skill-operations-management',
      name: 'Flight Operations Management',
      yearsRequired: '5–7 years',
      requiredPhases: mapPhases(['phase-1-pre-rule', 'phase-2-post-rule', 'phase-3-execution']),
      criticality: 'critical',
      description: 'UAS or manned aviation operations, Part 107/BVLOS procedures, flight safety culture',
      validationQuestions: [
        'Can you write comprehensive flight procedures for a new operation?',
        'Walk me through your experience with BVLOS operations.'
      ],
      redFlags: [
        'Only has VLOS experience (doesn\'t understand BVLOS challenges)',
        'Treats procedures as bureaucratic checkbox'
      ]
    },
    {
      id: 'skill-personnel-training',
      name: 'Personnel Training & Team Leadership',
      yearsRequired: '5–7 years',
      requiredPhases: mapPhases(['phase-2-post-rule', 'phase-3-execution']),
      criticality: 'important',
      description: 'Flight crew training, maintenance technician qualification, safety culture',
      validationQuestions: [
        'Tell me about building a flight operations team from scratch.',
        'How would you handle TSA background check coordination for 10+ personnel?'
      ]
    },
    {
      id: 'skill-maintenance-logistics',
      name: 'Aircraft Maintenance & Logistics',
      yearsRequired: '4–6 years',
      requiredPhases: mapPhases(['phase-2-post-rule', 'phase-3-execution']),
      criticality: 'important',
      description: 'Maintenance planning, spare parts logistics, reliability tracking, compliance documentation',
      validationQuestions: [
        'How do you plan maintenance schedules for UAS operations?',
        "What's your approach to spare parts logistics?"
      ]
    },
    {
      id: 'skill-commercial-planning',
      name: 'Commercial Operations Planning',
      yearsRequired: '4–6 years',
      requiredPhases: mapPhases(['phase-2-post-rule', 'phase-3-execution']),
      criticality: 'important',
      description: 'Customer operations, use case commercialization, revenue model integration',
      validationQuestions: [
        'How do you align operations with commercial use cases?',
        'What revenue models have you implemented for UAS operations?'
      ]
    }
  ],
  supportingHires: [
    {
      phase: 'phase-1-foundation',
      roles: [
        {
          title: 'Operations Manager',
          purpose: 'Procedures development, training planning, operating model definition',
          fte: '1'
        }
      ]
    },
    {
      phase: 'phase-4-hardware-design',
      roles: [
        {
          title: 'Flight Coordinator',
          purpose: 'Mission planning, UTM coordination, airspace management',
          fte: '0-1'
        }
      ]
    },
    {
      phase: 'phase-7-testing-validation',
      roles: [
        {
          title: 'Remote Pilots (BVLOS-certified)',
          purpose: 'Flight operations, mission execution',
          fte: '2-3'
        },
        {
          title: 'Maintenance Technicians',
          purpose: 'Aircraft maintenance, reliability, documentation',
          fte: '1-2'
        },
        {
          title: 'Flight Supervisors',
          purpose: 'Flight supervision, safety oversight, crew management',
          fte: '1'
        }
      ]
    }
  ],
  budgetRange: {
    phase1Min: 50,
    phase1Max: 80,
    phase2Min: 100,
    phase2Max: 150,
    phase3Min: 400,
    phase3Max: 600,
    totalMin: 550,
    totalMax: 830
  },
  keyStrategicDecisions: [
    'Permitted vs. Certificated operations (affects procedures complexity)',
    'Flight operation categories (high-altitude, urban, remote? CAT 1–5?)',
    'Maintenance approach (in-house vs. contracted)',
    'Personnel hiring timeline and training strategy',
    'Commercial use cases and customer operations',
    'Contingency/failsafe procedures'
  ]
};

/**
 * Optional EXPERTISE UMBRELLA 5: Business, Finance & Infrastructure
 */
export const businessUmbrella: ExpertiseUmbrella = {
  id: 'umbrella-5-business',
  name: 'Business, Finance & Operations Infrastructure',
  codeName: 'The Business Lead',
  covers: 'Fundraising, financial planning, HR, legal entity, business development, strategy',
  coreResponsibilities: [
    'Fundraising and investor relations',
    'Financial planning and capital allocation',
    'HR and people operations',
    'Legal entity and compliance',
    'Business development and customer acquisition',
    'Corporate strategy and partnerships'
  ],
  requiredSkills: [
    {
      id: 'skill-venture-capital',
      name: 'Venture Capital Fundraising',
      yearsRequired: '5–7 years',
      requiredPhases: mapPhases(['phase-1-pre-rule', 'phase-2-post-rule', 'phase-3-execution']),
      criticality: 'critical',
      description: 'Experience raising Series A/B in aerospace/defense or complex hardware startups',
      validationQuestions: [
        'Tell me about your most recent fundraising. What was your story to investors?'
      ]
    },
    {
      id: 'skill-aerospace-business',
      name: 'Aerospace/Defense Business Development',
      yearsRequired: '5–7 years',
      requiredPhases: mapPhases(['phase-1-pre-rule', 'phase-2-post-rule', 'phase-3-execution']),
      criticality: 'important',
      description: 'Understanding defense procurement, FAA regulatory environment, customer acquisition',
      validationQuestions: [
        "What's your experience with defense procurement processes?",
        'How do you navigate FAA regulatory environment for business development?'
      ]
    },
    {
      id: 'skill-hr-scaling',
      name: 'HR & Team Scaling',
      yearsRequired: '3–5 years',
      requiredPhases: mapPhases(['phase-2-post-rule', 'phase-3-execution']),
      criticality: 'important',
      description: 'Building technical teams, safety-critical hiring, TSA clearance processes',
      validationQuestions: [
        'How do you approach hiring for safety-critical roles?',
        "What's your experience with TSA clearance coordination?"
      ]
    }
  ],
  supportingHires: [
    {
      phase: 'phase-1-foundation',
      roles: []
    },
    {
      phase: 'phase-3-rule-analysis',
      roles: []
    },
    {
      phase: 'phase-8-faa-submission',
      roles: [
        {
          title: 'CFO or Finance Lead',
          purpose: 'Financial planning, budget management, investor reporting',
          fte: '0.5-1'
        }
      ]
    }
  ],
  budgetRange: {
    phase1Min: 0,
    phase1Max: 0,
    phase2Min: 0,
    phase2Max: 0,
    phase3Min: 0,
    phase3Max: 0,
    totalMin: 0,
    totalMax: 0
  },
  keyStrategicDecisions: [
    'Fundraising strategy and timeline',
    'Series A/B positioning for Part 108 certification',
    'Customer acquisition strategy (government vs. commercial)',
    'Partnership opportunities (UTM providers, suppliers, integrators)',
    'Corporate structure and IP strategy'
  ]
};

/**
 * Collection of all expertise umbrellas
 */
export const allExpertiseUmbrellas: ExpertiseUmbrella[] = [
  regulatoryUmbrella,
  hardwareUmbrella,
  systemsSafetyUmbrella,
  operationsUmbrella,
  businessUmbrella
];

/**
 * Helper function to get founding partner requirements summary
 */
export function getFoundingPartnerSummary() {
  return {
    totalExpertiseUmbrellas: 4,
    optionalUmbrellas: 1,
    phases: Object.values(certificationPhases),
    totalBudget: {
      minThousands: 3150,
      maxThousands: 3950,
      minMillions: 3.15,
      maxMillions: 3.95
    },
    timeline: '18–24 months',
    criticalHires: [
      'FAA Certification Lead (Umbrella 1)',
      'UAS Hardware Design Lead (Umbrella 2)',
      'Systems Safety & Quality Lead (Umbrella 3)',
      'Flight Operations Lead (Umbrella 4)'
    ]
  };
}

/**
 * Helper function to get skills needed for a specific phase
 */
export function getSkillsByPhase(phase: CertificationPhase): ExpertiseSkill[] {
  const skills: ExpertiseSkill[] = [];
  const umbrellas = [regulatoryUmbrella, hardwareUmbrella, systemsSafetyUmbrella, operationsUmbrella];

  umbrellas.forEach(umbrella => {
    umbrella.requiredSkills.forEach(skill => {
      if (skill.requiredPhases.includes(phase)) {
        skills.push(skill);
      }
    });
  });

  return skills;
}

/**
 * Helper function to get phases ordered by importance
 */
export function getPhasesByImportance(): PhaseMetadata[] {
  return Object.values(certificationPhases).sort((a, b) => a.importance - b.importance);
}

/**
 * Helper function to get umbrella by ID
 */
export function getUmbrellaById(id: string): ExpertiseUmbrella | undefined {
  return allExpertiseUmbrellas.find(u => u.id === id);
}

/**
 * Helper function to calculate budget by phase
 */
export function getBudgetByPhase(umbrella: ExpertiseUmbrella, phase: CertificationPhase): { min: number; max: number } {
  const phaseMap: Record<CertificationPhase, 'phase1' | 'phase2' | 'phase3'> = {
    'phase-1-foundation': 'phase1',
    'phase-2-sms-design': 'phase1',
    'phase-3-rule-analysis': 'phase2',
    'phase-4-hardware-design': 'phase2',
    'phase-5-component-vetting': 'phase2',
    'phase-6-prototype-development': 'phase3',
    'phase-7-testing-validation': 'phase3',
    'phase-8-faa-submission': 'phase3'
  };

  const mappedPhase = phaseMap[phase];
  if (mappedPhase === 'phase1') {
    return { min: umbrella.budgetRange.phase1Min, max: umbrella.budgetRange.phase1Max };
  } else if (mappedPhase === 'phase2') {
    return { min: umbrella.budgetRange.phase2Min, max: umbrella.budgetRange.phase2Max };
  } else {
    return { min: umbrella.budgetRange.phase3Min, max: umbrella.budgetRange.phase3Max };
  }
}

/**
 * Helper function to get skill overlap between umbrellas
 */
export function getSkillOverlap(): Array<{ skill: string; umbrellas: string[] }> {
  const skillMap = new Map<string, string[]>();
  const coreUmbrellas = allExpertiseUmbrellas.filter(u => u.id !== 'umbrella-5-business');

  coreUmbrellas.forEach(umbrella => {
    umbrella.requiredSkills.forEach(skill => {
      if (!skillMap.has(skill.name)) {
        skillMap.set(skill.name, []);
      }
      skillMap.get(skill.name)!.push(umbrella.codeName);
    });
  });

  return Array.from(skillMap.entries())
    .filter(([_, umbrellas]) => umbrellas.length > 1)
    .map(([skill, umbrellas]) => ({ skill, umbrellas }));
}

/**
 * Helper function to get phase dependencies
 */
export function getPhaseDependencies(): Record<CertificationPhase, CertificationPhase[]> {
  return {
    'phase-1-foundation': [],
    'phase-2-sms-design': ['phase-1-foundation'],
    'phase-3-rule-analysis': ['phase-2-sms-design'],
    'phase-4-hardware-design': ['phase-3-rule-analysis'],
    'phase-5-component-vetting': ['phase-4-hardware-design'],
    'phase-6-prototype-development': ['phase-5-component-vetting'],
    'phase-7-testing-validation': ['phase-6-prototype-development'],
    'phase-8-faa-submission': ['phase-7-testing-validation']
  };
}

/**
 * Helper function to generate timeline data
 */
export function getTimelineData() {
  const phases = getPhasesByImportance();
  return phases.map(phase => ({
    id: phase.id,
    name: phase.name,
    timeline: phase.timeline,
    importance: phase.importance,
    description: phase.description
  }));
}
