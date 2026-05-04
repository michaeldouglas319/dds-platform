/**
 * Contract & Procurement Sections
 * Covers contracting strategy, procurement, certifications, and contract-specific systems
 */

import { UnifiedSection } from './sections.config';

const pexel = (id: number) => 
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260`;

export const contractSections: UnifiedSection[] = [
  {
    id: 'contracting-strategy',
    page: 'business',
    title: 'Proposed Autonomous Build Roadmap',
    subtitle: 'Strategic Entry via AI-Build Infrastructure',
    imageUrl: pexel(3184436),
    position: [1.2, -12.5, 0],
    rotation: [0, 0, 0],
    layout: { type: 'timeline' },
    drilldown: { enabled: true, layout: 'detail' },
    modelConfig: {
      path: '/assets/models/assembly_line_gltf/scene.gltf',
      scale: 0.9,
      animation: { type: 'rotate', speed: 0.2 }
    },
    content: {
      heading: 'Proposed Autonomous Build & Verification Service',
      paragraphs: [
        {
          subtitle: 'Strategic Vision',
          description: 'We are positioning our foundation as a specialized AI-build partner for aerospace primes. Our approach turns high-level requirements into a proprietary set of formal tests, allowing AI build agents to synthesize components with absolute precision.'
        },
        {
          subtitle: 'Primary Strategy',
          description: 'While building internal capability, we are assessing procurement contacts for high-standard parts. This strategy alleviates failure costs while perfecting in-house processes, scaling from wire harnesses to carbon fiber structures to full assembly.'
        },
        {
          subtitle: 'Entry Point',
          description: 'Leveraging deep experience in high-volume manufacturing, we provide "Correct-by-Construction" sub-assemblies where AI build agents ensure 100% compliance with aerospace standards like DO-178C.'
        },
        {
          subtitle: 'Market Integration',
          description: 'Our roadmap includes registration on key procurement portals to offer "AI-Build-as-a-Service," bridging the gap between high-level specs and certified industrial drone hardware at billion-unit scale.'
        }
      ],
      highlights: [
        'Infrastructure Goal: AI-build systems for UAV sub-assemblies',
        'Sourcing Strategy: Scalable procurement assessment (Harness to Full Assembly)',
        'Strategic Path: Entry point via "AI-Build-as-a-Service"',
        'Quality Validation: Foundation in extensive continuous testing'
      ],
      knowledgeGaps: [
        'Precise requirements for AS9100 integration within an AI-automated manufacturing workflow.',
        'Cybersecurity insurance mandates for AI build agents in federal contracting.'
      ],
      stats: [
        { label: 'AI Build Speed', value: 'TBD' },
        { label: 'Traceability', value: '100% (Auto)' },
        { label: 'Compliance Path', value: 'AI-DO-178C' }
      ]
    },
    children: [
      {
        id: 'contracting-details',
        page: 'business',
        title: 'Contracting Infrastructure',
        parentId: 'contracting-strategy',
        content: {
          heading: 'Certifications & Procurement Readiness',
          paragraphs: [
            {
              subtitle: 'Government & Defense',
              description: 'We are preparing for SAM.gov registration and obtaining a CAGE code to enable direct subcontracting on federal UAV projects. This foundation allows us to serve as a reliable domestic source for critical autonomous assemblies.'
            },
            {
              subtitle: 'Industrial Marketplaces',
              description: 'By establishing a presence on MFG.com and Thomasnet, we are bridging the gap between small-scale precision engineering and high-volume industrial demand.'
            },
            {
              subtitle: 'Quality Traceability',
              description: 'Every assembly is backed by a deterministic testing log, providing the traceability required for aerospace certification (DO-178C/Part 108).'
            }
          ],
          highlights: [
            'Registration Readiness: CAGE Code & SAM.gov preparation',
            'Full Traceability: Deterministic testing logs for every component',
            'Scalable Production: Small-batch to high-volume industrial capacity'
          ]
        }
      }
    ]
  },
  {
    id: 'products-contracts',
    page: 'business',
    title: 'Contract Systems',
    parentId: 'products',
    subtitle: 'Customized Solutions for Specific Contracts',
    modelConfig: {
      path: '/assets/models/carbon_fiber_texture.glb',
      scale: 1.2,
      animation: { type: 'rotate', speed: 0.35 }
    },
    content: {
      heading: 'Contract-Specific Product Configurations',
      paragraphs: [
        {
          subtitle: 'Strategic Goal',
          description: 'Develop flexible product configurations that can be rapidly customized to meet specific contract requirements, enabling quick adaptation to customer needs and mission parameters.'
        },
        {
          subtitle: 'Modular Architecture',
          description: 'Component-based design allowing for rapid reconfiguration of payloads, sensors, and capabilities to match contract specifications without requiring full redesign.'
        },
        {
          subtitle: 'Compliance Integration',
          description: 'Built-in support for various certification standards and regulatory requirements, ensuring contract deliverables meet all specified compliance criteria.'
        }
      ],
      highlights: [
        'Flexibility: Rapid customization for contract requirements',
        'Modularity: Component-based reconfigurable architecture',
        'Compliance: Built-in certification and regulatory support',
        'Delivery: Quick adaptation to customer specifications'
      ],
      stats: [
        { label: 'Customization Time', value: 'Weeks' },
        { label: 'Compliance Standards', value: 'Multiple' },
        { label: 'Modular Components', value: 'TBD' }
      ],
      knowledgeGaps: [
        'Standardization requirements across different contract specifications.',
        'Rapid reconfiguration workflows for contract-specific modifications.',
        'Multi-jurisdictional compliance integration strategies.'
      ]
    }
  }
];


