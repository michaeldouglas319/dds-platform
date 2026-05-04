/**
 * Testing & Verification Sections
 * Covers simulation, verification, HIL/SIL testing, digital twin, and test synthesis
 */

import { UnifiedSection } from './sections.config';

const pexel = (id: number) => 
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260`;

export const testingSections: UnifiedSection[] = [
  {
    id: 'simulation',
    page: 'uav',
    title: 'Autonomous Verification Plan',
    subtitle: 'AI-Driven Test Synthesis',
    imageUrl: pexel(3861968),
    position: [1.2, -15, 0],
    rotation: [0, 0, 0],
    content: {
      heading: 'Verification Strategy: Requirements to Tests',
      paragraphs: [
        '**Test Synthesis:** We transform mission requirements into a proprietary set of automated HIL/SIL tests. AI build agents then iterate until 100% of these requirements are verified in simulation.',
        '**Stress Testing:** We use AI to synthesize extreme edge-case scenarios in Gazebo and AirSim, achieving mission reliability that exceeds human-written test coverage.',
        '**Continuous Verification:** Every software commit triggers an autonomous build cycle where AI verifies the code against formal requirement specifications, ensuring absolute compliance.'
      ],
      highlights: [
        'Edge-Case Synthesis: AI-generated scenarios for extreme reliability',
        'Automated Formalization: Requirement-to-Test transformation',
        'Continuous Validation: Foundation in extensive automated testing',
        'Certification Readiness: 100% automated DO-178C evidence generation'
      ],
      stats: [
        { label: 'Target Daily Sim.', value: 'TBD' },
        { label: 'Test Coverage', value: '100% MCDC' },
        { label: 'Verification Path', value: 'AI-Formal' }
      ]
    },
    children: [
      {
        id: 'sim-digital-twin',
        page: 'uav',
        title: 'Digital Twin Logic',
        parentId: 'simulation',
        content: {
          heading: 'Predictive Maintenance',
          paragraphs: [
            '**Digital Twin Integration:** Every physical unit has a Digital Twin. Real-time telemetry is compared against simulation to detect motor bearing wear or battery degradation before it leads to a mission failure.',
            '**Predictive Analytics:** By correlating field data with simulation models, we anticipate maintenance needs and optimize fleet availability.'
          ]
        }
      }
    ]
  }
];


