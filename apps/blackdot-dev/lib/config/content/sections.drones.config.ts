/**
 * Drones & Products Sections
 * Covers product showcase, market opportunity, competition, and product variants
 */

import { UnifiedSection } from './sections.config';

const pexel = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260`;

export const dronesSections: UnifiedSection[] = [
  {
    id: 'overview',
    page: 'uav',
    title: 'Navigation Overview',
    subtitle: 'Explore Your Path of Interest',
    imageUrl: pexel(3184431),
    position: [-1.2, 2.5, 0],
    rotation: [0, 0, 0],
    content: {
      heading: 'Your Journey Through Billion-Scale Quality Innovation',
      paragraphs: [
        '**Strategic Navigation:** Navigate through our comprehensive exploration of the billion-drone quality imperative. Choose your path based on your interests and expertise level.',
        '**Tailored Insights:** Each section is designed to provide deep insights while remaining accessible to different audiences, from technical engineers to business executives.'
      ],
      highlights: [
        'Manufacturing Excellence: Quality orchestration at billion-unit scale',
        'Drone Technology: From entry-level to advanced swarm systems',
        'Use Cases & Applications: Real-world mission scenarios',
        'Business Opportunities: Market analysis and partnership pathways'
      ]
    },
    children: [
      {
        id: 'overview-navigation',
        page: 'uav',
        title: 'Cross-Page Navigation',
        parentId: 'overview',
        content: {
          heading: 'Explore Multiple Perspectives',
          paragraphs: [
            'This technical exploration focuses on UAV technology, manufacturing processes, and mission capabilities.',
            'For business strategy, market analysis, and partnership opportunities, visit our Business Overview section.'
          ],
          highlights: [
            'Technical Deep-Dive: Manufacturing, quality control, and drone systems',
            'Business Strategy: Market analysis, partnerships, and revenue models',
            'Flexible Navigation: Switch between perspectives based on your interests',
            'Comprehensive Coverage: Technical and business insights in one platform'
          ]
        }
      },
      {
        id: 'overview-manufacturing',
        page: 'uav',
        title: 'Manufacturing Excellence Path',
        parentId: 'overview',
        content: {
          heading: 'The Billion-Unit Quality Revolution',
          paragraphs: [
            'Explore how we solve the impossible equation: achieving aerospace-grade quality at billion-unit production scale.',
            'Learn about AI-driven quality orchestration, automated inspection systems, and sovereign supply chain verification.'
          ],
          highlights: [
            'Quality Orchestration: AI systems inspecting 1000+ components/second',
            'Scale Innovation: From thousands to billions of units',
            'Sovereign Assurance: Domestic supply chains with verified integrity',
            'Zero-Defect Reality: Aerospace standards across industrial volumes'
          ]
        }
      },
      {
        id: 'overview-drones',
        page: 'uav',
        title: 'Drone Technology Path',
        parentId: 'overview',
        content: {
          heading: 'From Entry-Level to Advanced Swarms',
          paragraphs: [
            'Discover our comprehensive drone product line, from productionized Pixhawk systems to NASA-grade swarm intelligence.',
            'Explore solar-powered perpetual flight, AI-enhanced autonomy, and mission-critical reliability.'
          ],
          highlights: [
            'Entry-Level: Productionized Pixhawk systems with basic autonomy',
            'Mid-Tier: PX4/ArduPilot hybrids with AI navigation',
            'Advanced: NASA cFS swarms for BVLOS operations',
            'Solar Variants: Perpetual daylight endurance capabilities'
          ]
        }
      },
      {
        id: 'overview-usecases',
        page: 'uav',
        title: 'Use Cases & Applications Path',
        parentId: 'overview',
        content: {
          heading: 'Real-World Mission Scenarios',
          paragraphs: [
            'See how our quality-assured drone systems enable mission-critical applications across defense, infrastructure, and commercial sectors.',
            'From surveillance and logistics to environmental monitoring and industrial inspection.'
          ],
          highlights: [
            'Defense & Security: BVLOS operations with aerospace reliability',
            'Infrastructure: Critical inspection and monitoring capabilities',
            'Logistics: Autonomous delivery with zero-defect assurance',
            'Environmental: Extended endurance for comprehensive monitoring'
          ]
        }
      },
      {
        id: 'overview-business',
        page: 'uav',
        title: 'Business Opportunities Path',
        parentId: 'overview',
        content: {
          heading: 'Market Analysis & Partnership Pathways',
          paragraphs: [
            'Understand the $163B market opportunity and explore strategic partnership opportunities.',
            'Learn about competitive positioning, regulatory landscapes, and revenue models for billion-scale quality.'
          ],
          highlights: [
            '$163B Market: Defense, agriculture, and logistics opportunities',
            'Strategic Partnerships: AI-build services and sub-assembly provision',
            'Regulatory Landscape: FAA Part 108 and BVLOS enablement',
            'Competitive Edge: Sovereign, productionized open-source advantage'
          ]
        }
      }
    ]
  },
  {
    id: 'hero',
    page: 'uav',
    title: 'The Billion-Drone Quality Imperative',
    subtitle: 'Aerospace Standards at Consumer Scale',
    imageUrl: pexel(1108090),
    position: [0, 2.5, 0],
    rotation: [0, 0, 0],
    content: {
      heading: 'The Impossible Equation: 1 Billion Units × Aerospace Quality',
      paragraphs: [
        '**The Scale Paradox:** Modern manufacturing can produce 1 billion drone components annually, yet achieving aerospace-grade reliability at this scale remains impossible—until now.',
        '**Quality Orchestration:** Our innovation: AI-driven quality orchestration that transforms mass production into precision engineering, ensuring every unit meets DO-178C standards through intelligent automation.'
      ],
      highlights: [
        'Scale Paradox: Billion-unit capacity meets zero-defect reality',
        'Quality Orchestration: AI that conducts manufacturing symphonies',
        'Sovereign Precision: Domestic supply chains with aerospace integrity',
        'Automation Mastery: Human oversight replaced by algorithmic perfection'
      ]
    },
    children: [
      {
        id: 'hero-strategy',
        page: 'uav',
        title: 'The Synthesis Paradox',
        parentId: 'hero',
        content: {
          heading: 'How AI Builds What Humans Dream',
          paragraphs: [
            '**Deterministic Realities:** At the heart of our vision lies a profound question: Can AI truly forge reliability from the void? Through "correct-by-construction" synthesis, we transform abstract requirements into deterministic realities.',
            '**Sovereign Stacks:** Our AI agents don\'t just code—they orchestrate entire flight ecosystems, evolving sovereign stacks that self-verify and adapt beyond human imagination.'
          ],
          highlights: [
            'The Void to Reality: Transforming intent into unbreakable code',
            'Sovereign Evolution: Stacks that grow, learn, and self-verify',
            'Beyond Human Limits: AI orchestration that redefines possibility'
          ]
        }
      },
      {
        id: 'hero-tech-deep',
        page: 'uav',
        title: 'AI as the Silent Composer',
        parentId: 'hero',
        content: {
          heading: 'Orchestrating Flight from Abstract Missions',
          paragraphs: [
            '**Symphonic Autonomy:** Our AI agents compose symphonies of autonomy, transforming fleeting requirements into eternal flight patterns. Through partition-isolated architectures and deterministic execution, we create skies that breathe with intelligent precision.',
            '**Emergent Intelligence:** This isn\'t mere automation—it\'s emergence, where complex adaptive systems birth drones that think, evolve, and transcend their programming.'
          ],
          highlights: [
            'Symphonic Orchestration: From chaos to orchestrated precision',
            'Deterministic Emergence: AI that births living flight systems',
            'Transcendent Intelligence: Drones that evolve beyond their code'
          ]
        }
      }
    ]
  },
  {
    id: 'market',
    page: 'uav',
    title: 'Market Opportunity Analysis',
    subtitle: 'A Vision for the $163B Sky',
    imageUrl: pexel(3184431),
    position: [1.2, -5, 0],
    rotation: [0, 0, 0],
    content: {
      heading: '$163B Global Market Projection',
      paragraphs: [
        '**Market Potential:** The global UAV market is projected to reach $163.2B by 2032, with a 15.2% CAGR. Our solutions address critical needs in defense, agriculture, and the emerging BVLOS logistics market.',
        '**Growth Drivers:** The shift to sovereign, domestic manufacturing is a key growth driver as regulations (FAA Part 108) aim to enable mass commercial deployment.'
      ],
      highlights: [
        'Market Scale: $163.2B global opportunity by 2032',
        'Quality Validation: Foundation in extensive continuous testing',
        'Key Segments: Defense, Agriculture, and Logistics',
        'Regulatory Shift: FAA Part 108 enabling commercial BVLOS'
      ],
      stats: [
        { label: 'Market 2032 Proj.', value: '$163.2B' },
        { label: 'CAGR Proj.', value: '15.2%' },
        { label: 'Target Segments', value: '4' }
      ]
    }
  },
  {
    id: 'products',
    page: 'uav',
    title: 'Proposed Product Showcase',
    subtitle: 'Planned Foundation Across Tiers',
    imageUrl: pexel(1108090),
    position: [1.2, -7.5, 0],
    rotation: [0, 0, 0],
    drilldown: {
      enabled: true,
      layout: 'detail',
    },
    content: {
      heading: 'Productionized Gold Standards Across Product Tiers',
      paragraphs: [
        '**Product Range:** Our product line spans from entry-level Pixhawk-based systems to advanced AI swarms built on NASA cFS frameworks.',
        '**Quality Assurance:** Every unit undergoes a rigorous productionization process, ensuring aerospace-grade reliability in every flight.'
      ],
      highlights: [
        'Entry-Level: Productionized Pixhawk systems',
        'Mid-Tier: Productionized PX4/ArduPilot systems',
        'Advanced: Productionized NASA cFS systems',
        'Process: Rigorous automated QC across all tiers'
      ]
    },
    children: [
      {
        id: 'uav-products-tier1',
        page: 'uav',
        title: 'Advanced Tier Plan',
        parentId: 'products',
        content: {
          heading: 'NASA-Grade Swarm Strategy',
          paragraphs: [
            '**Swarm Intelligence:** Our flagship swarm systems leverage NASA cFS for inter-drone coordination, enabling complex BVLOS operations with redundant, fail-safe communications.'
          ]
        }
      },
      {
        id: 'uav-products-solar-variant',
        page: 'uav',
        title: 'Solar Power Foundation Plan',
        parentId: 'products',
        subtitle: 'Perpetual Flight Strategy',
        content: {
          heading: 'Proposed Unlimited Daylight Endurance',
          paragraphs: [
            {
              subtitle: 'Solar Architecture',
              description: 'Inspired by "rctestflight" Solar Plane V3 and Skydweller technologies, we integrate Sunpower Maxeon cells (~22-24% efficiency for current Gen 6/7 tech, commercial ~22-24%, lab-tested up to ~24.9%) directly into carbon fiber wing structures.',
              citations: [
                { text: 'Maxeon / A1 SolarStore Specs (2025-2026)', url: 'https://a1solarstore.com/solar-panels/maxeon-solar-panels.html' },
                { text: 'This Old House / Neexgent Reviews (2025-2026 efficiencies)', url: 'https://www.thisoldhouse.com/solar-alternative-energy/most-efficient-solar-panels' }
              ]
            },
            '**Power Efficiency:** Our custom MPPT (Maximum Power Point Tracking) controllers are optimized for the dynamic shading and vibration of high-speed UAV flight, harvesting energy more efficiently than standard solar arrays.',
            {
              subtitle: 'Structural Optimization',
              description: 'Advanced structural engineering (1mm plates with internal honeycomb) allows for a 4-meter wingspan with a dry weight of only 3.5kg. Target: Indefinite daylight endurance (months continuous with solar HAPS).',
              citations: [
                { text: 'Airbus Zephyr: Months continuous flight (solar-powered)', url: 'https://www.airbus.com/en/products-services/defence/uas/zephyr' },
                { text: 'Zephyr records: 67 days, 25+ days', url: 'https://amprius.com/aalto-zephyr-achieves-world-record-67-day-flight-powered-by-amprius-ultra-high-energy-batteries/' }
              ]
            }
          ],
          highlights: [
            'Solar Cells: Sunpower Maxeon (Gen 6/7: ~22-24% commercial efficiency, lab-tested up to ~24.9%)',
            'Power Systems: Custom high-frequency MPPT controllers',
            'Structural Design: Honeycomb-core carbon fiber wings',
            'Endurance Validation: Continuous testing for perpetual flight',
            'Mission Profile: Zero-emission surveillance foundation'
          ],
          stats: [
            { label: 'Target Harvest', value: '250W/m²' },
            { label: 'Target Dry Weight', value: '3.5kg' },
            { label: 'Target Wingspan', value: '4.0m' },
            { label: 'Target Uptime', value: 'TBD' }
          ],
          knowledgeGaps: [
            'Propeller stall characteristics in high-altitude low-density air.',
            'Custom MPPT vibration resilience under high-frequency GaN switching.'
          ]
        },
        children: [
          {
            id: 'solar-dynamics',
            page: 'uav',
            title: 'Power Management',
            parentId: 'uav-products-solar-variant',
            content: {
              heading: 'Dynamic Energy Balancing',
              paragraphs: [
                'My firmware dynamically adjusts flight speed and altitude to maximize solar incidence angle. During peak sun, the system over-charges internal solid-state batteries for extended sunset endurance.',
                'By leveraging ultra-lightweight carbon fiber (1mm honeycomb plates), I minimize the power-to-weight ratio, allowing the surplus energy to be converted directly into gravitational potential energy.'
              ]
            }
          },
          {
            id: 'solar-potential-energy',
            page: 'uav',
            title: 'Potential Energy Strategy',
            parentId: 'uav-products-solar-variant',
            content: {
              heading: 'Climb by Day, Descend by Night',
              paragraphs: [
                {
                  subtitle: 'Stratospheric Storage',
                  description: 'To achieve true perpetual flight, we implement a "Stratospheric Potential Energy Storage" strategy. During daylight hours, the system uses surplus solar power to climb to extreme altitudes. Target: Up to 70,000 ft altitude (stratospheric HAPS).',
                  citations: [
                    { text: 'Zephyr: ~70,000 ft (21 km) stratosphere', url: 'https://www.airbus.com/en/products-services/defence/uas/zephyr' },
                    { text: 'Multiple HAPS at 60,000-70,000 ft', url: 'https://en.wikipedia.org/wiki/High-altitude_platform_station' }
                  ]
                },
                '**Controlled Descent:** When the sun sets, we transition the aircraft into a high-efficiency glide mode. This controlled descent allows the UAV to remain airborne through the night without relying solely on battery mass, maintaining a minimum mission altitude before the next sunrise.',
                '**Altitude Cycling:** This "Altitude Cycling" method, inspired by early pioneers like AstroFlight Sunrise and perfected in modern HAPS like Skydweller, is the key to infinite endurance.'
              ],
              highlights: [
                'Energy Storage: Gravitational potential energy as a primary medium',
                'Mass Reduction: Significantly reduced battery weight requirements',
                'Strategic Cycling: Altitude cycling from 10k ft to 70k ft',
                'Mission Endurance: Indefinite flight targets for persistent monitoring'
              ],
              knowledgeGaps: [
                'Wind gradient modeling for automated glide-mode energy conservation.',
                'Thermal management of solid-state batteries at -50°C stratospheric temps.'
              ]
            }
          }
        ]
      }
    ]
  },
  {
    id: 'hero',
    page: 'business',
    title: 'Scaling Quality for Commercial Drone Growth',
    subtitle: 'Aerospace Reliability at Industrial Volumes',
    imageUrl: pexel(1108090),
    position: [0, 2.5, 0],
    layout: { type: 'scroll-based' },
    rendering: {
      contentId: 'business',
      sceneId: 'business-overview',
      portalId: 'uav',
    },
    drilldown: {
      enabled: true,
      layout: 'detail',
    },
    modelConfig: {
      path: '/assets/models/2_plane.glb',
      scale: 1.0,
      animation: { type: 'rotate', speed: 0.25 }
    },
    content: {
      heading: 'High-Volume Quality Assurance at Scale',
      paragraphs: [
        {
          subtitle: 'The Market Expansion',
          description: 'The global drone market is scaling from $73.06B (2024) to $163.60B by 2030 at 14.3% CAGR. Unit volume projections vary widely—one 2025 report estimates ~24M total drone units by 2030 (all segments). This represents a fundamental shift: production capacity far exceeds quality assurance capability. Traditional inspection and testing methods cannot scale with volume while maintaining aerospace-grade reliability.',
          citations: [
            { text: 'Grand View Research - Drone Market Report (2025)', url: 'https://www.grandviewresearch.com/industry-analysis/drone-market-report' }
          ]
        },
        {
          subtitle: 'The Quality Solution',
          description: 'AI-driven quality orchestration enables high-speed inspection (thousands of components/second), predictive defect prevention, and continuous improvement. This creates the foundation for both regulatory compliance (DO-178C) and mission-critical reliability in defense and enterprise applications.'
        }
      ],
      highlights: [
        { subtitle: 'Market Growth', description: '$73.06B (2024) → $163.60B (2030) at 14.3% CAGR (Grand View Research)' },
        { subtitle: 'Quality Gap', description: 'Production capacity exceeds traditional QA capability' },
        { subtitle: 'AI Solution', description: 'Automated inspection and predictive quality systems' },
        { subtitle: 'Market Enablement', description: 'Aerospace standards unlock enterprise and defense markets' }
      ],
      knowledgeGaps: [
        'Real-time AI vision accuracy across diverse component types',
        'Supply chain quality correlation at multi-million unit volumes',
        'Scalable quality metrics across distributed manufacturing'
      ]
    },
    children: [
      {
        id: 'hero-deep',
        page: 'business',
        title: 'Strategic Timelines',
        parentId: 'hero',
        modelConfig: {
          path: '/assets/models/dron_low_poly_3d_model_gltf/scene.gltf',
          scale: 0.2,
          animation: { type: 'rotate', speed: 0.3 }
        },
        content: {
          heading: 'Market Convergence 2026-2027',
          paragraphs: [
            {
              subtitle: 'Regulatory Catalyst',
              description: 'The FAA released the Part 108 NPRM in August 2025 with a final rule expected Spring 2026 (Q1/Q2, per Executive Order deadline ~February 2026). Implementation: 6-12 months post-finalization (late 2026–early 2027). This regulatory framework will be the catalyst enabling commercial BVLOS drone operations at scale. Our pre-certified, quality-assured systems position partners to deploy immediately when regulations finalize.',
              citations: [
                { text: 'FAA Official NPRM (Federal Register)', url: 'https://www.federalregister.gov/documents/2025/08/07/2025-14992/normalizing-unmanned-aircraft-systems-beyond-visual-line-of-sight-operations' },
                { text: 'DLA Piper Analysis (Aug 2025 NPRM)', url: 'https://www.dlapiper.com/en-us/insights/publications/2025/10/faa-proposed-part-108-bvlos-rule' },
                { text: 'Elsight / Pillsbury Law Timeline Summary', url: 'https://www.elsight.com/blog/faa-part-108-the-next-step-for-bvlos-drone-flights/' }
              ]
            },
            {
              subtitle: 'Industrial Opportunity',
              description: 'The global drone market: $73.06B (2024) → $163.60B (2030) at 14.3% CAGR. Unit volume projections vary widely—one 2025 report estimates ~24M total drone units by 2030 (all segments). Modern manufacturing capacity now enables high-volume, aerospace-grade reliability—the critical requirement for enterprise and defense markets.',
              citations: [
                { text: 'Grand View Research - Drone Market Report (2025)', url: 'https://www.grandviewresearch.com/industry-analysis/drone-market-report' }
              ]
            }
          ],
          highlights: [
            { subtitle: 'Regulatory Timeline', description: 'Final Part 108 rule expected Spring 2026 (Q1/Q2), implementation late 2026–early 2027' },
            { subtitle: 'Market Growth', description: '$73.06B (2024) → $163.60B (2030) at 14.3% CAGR (Grand View Research)' },
            { subtitle: 'Unit Projections', description: '~24M total drone units by 2030 (all segments, estimates vary)' },
            { subtitle: 'Market Access', description: 'Pre-certified systems enable immediate deployment post-finalization' }
          ]
        },
        children: [
          {
            id: 'hero-market-dynamics',
            page: 'business',
            title: 'Market Dynamics',
            parentId: 'hero-deep',
            modelConfig: {
              path: '/assets/models/aircraft_presentation_cover.glb',
              scale: 0.9,
              animation: { type: 'rotate', speed: 0.28 }
            },
            content: {
              heading: 'Data & Autonomy at Scale',
              paragraphs: [
                {
                  subtitle: 'Commercial Applications',
                  description: 'As BVLOS regulations finalize (2026-2027), drone adoption accelerates across agriculture (crop monitoring, yield optimization), logistics (package delivery, last-mile economics), and infrastructure (inspection, environmental monitoring). Each mission generates real-time data.'
                },
                {
                  subtitle: 'Hardware Reliability Imperative',
                  description: 'Mission-critical data capture requires aerospace-grade reliability. System failures in autonomous operations directly impact business economics, safety, and operational trust. Quality assurance at scale is the prerequisite for autonomous applications.'
                }
              ]
            }
          }
        ]
      }
    ]
  },
  {
    id: 'market',
    page: 'business',
    title: 'Market Opportunity Vision',
    subtitle: 'Proposed Growth to $163B',
    imageUrl: pexel(3184431),
    position: [1.2, -5, 0],
    rotation: [0, 0, 0],
    layout: { type: 'carousel' },
    drilldown: { enabled: true, layout: 'sidebar' },
    modelConfig: {
      path: '/assets/models/drone_uav_wing_desert_camo_gltf/scene.gltf',
      scale: 0.2,
      animation: { type: 'rotate', speed: 0.22 }
    },
    content: {
      heading: 'The Global Drone Economy Expansion',
      paragraphs: [
        {
          subtitle: 'Market Evolution',
          description: 'The global drone market is projected to grow from $73.06B (2024) to $163.60B by 2030 at 14.3% CAGR, driven by regulatory enablement and the shift toward autonomous commercial operations. This represents sustained high growth across industrial, defense, and logistics sectors.',
          citations: [
            { text: 'Grand View Research - Drone Market Report (2025)', url: 'https://www.grandviewresearch.com/industry-analysis/drone-market-report' }
          ]
        },
        {
          subtitle: 'Commercial Expansion',
          description: 'Unit volume projections vary widely. One 2025 report estimates ~24M total drone units by 2030 (all segments). Commercial-specific annual shipments are lower (hundreds of thousands to low millions). Agriculture, logistics, and infrastructure inspection lead commercial adoption, with defense sectors driving volume growth post-Part 108 finalization.',
          citations: [
            { text: 'Note: Unit projections vary by scope and source', url: '#' }
          ]
        },
        {
          subtitle: 'Strategic Positioning',
          description: 'Quality-assured, pre-certified systems that meet aerospace standards are the critical enabler. Early adoption of standardized, reliable platforms captures market share before competitive commoditization.'
        }
      ],
      knowledgeGaps: [
        'Real-world BVLOS logistics cost savings once Part 108 regulations are finalized',
        'Adoption rates across agriculture, delivery, and infrastructure sectors post-2026',
        'Supply chain reliability metrics for scaled production (millions of units annually)'
      ],
      stats: [
        { label: 'Global Market 2030', value: '$163.60B' },
        { label: 'Market 2024', value: '$73.06B' },
        { label: 'CAGR (2025-2030)', value: '14.3%' },
        { label: 'Total Units 2030 (est.)', value: '~24M (all segments)' }
      ]
    },
    children: [
      {
        id: 'market-drivers',
        page: 'business',
        title: 'Primary Growth Drivers',
        parentId: 'market',
        modelConfig: {
          path: '/assets/models/chess_set.glb',
          scale: 2.0,
          animation: { type: 'rotate', speed: 0.32 }
        },
        content: {
          heading: 'Regulatory Framework & Market Enablement',
          paragraphs: [
            {
              subtitle: 'FAA Part 108 Status',
              description: 'NPRM released August 2025, final rule expected Spring 2026 (Q1/Q2, per Executive Order deadline ~February 2026). Implementation: 6-12 months post-finalization (late 2026–early 2027). This standardized framework replaces the waiver-based system, enabling commercial BVLOS operations for package delivery, agriculture, infrastructure inspection, and public safety missions.',
              citations: [
                { text: 'FAA Official NPRM (Federal Register)', url: 'https://www.federalregister.gov/documents/2025/08/07/2025-14992/normalizing-unmanned-aircraft-systems-beyond-visual-line-of-sight-operations' },
                { text: 'DLA Piper Analysis (Aug 2025 NPRM)', url: 'https://www.dlapiper.com/en-us/insights/publications/2025/10/faa-proposed-part-108-bvlos-rule' },
                { text: 'Elsight / Pillsbury Law Timeline Summary', url: 'https://www.elsight.com/blog/faa-part-108-the-next-step-for-bvlos-drone-flights/' }
              ]
            },
            {
              subtitle: 'Production Reality',
              description: 'Global manufacturing capacity supports high-volume production. Unit volume projections vary widely—one 2025 report estimates ~24M total drone units by 2030 (all segments). The critical gap: proven aerospace-grade reliability at scale. Standard-compliant systems and quality assurance are the market gatekeepers.'
            },
            {
              subtitle: 'Market Dynamics',
              description: 'Early regulatory clarity in the US attracts international manufacturers. Domestic supply chains for flight control, sensors, and power systems become competitive advantages.'
            }
          ],
          stats: [
            { label: 'Commercial Units 2025', value: '8-10M+/year' },
            { label: 'Part 108 Final Rule', value: 'Spring 2026' },
            { label: 'Implementation Timeline', value: '6-12 months post-rule' }
          ]
        }
      }
    ]
  },
  {
    id: 'competition',
    page: 'business',
    title: 'Competitive Strategy',
    subtitle: 'Sovereign Edge Goal vs. Giants',
    imageUrl: pexel(1108090),
    position: [1.2, -7.5, 0],
    rotation: [0, 0, 0],
    layout: { type: 'grid' },
    drilldown: { enabled: true },
    content: {
      heading: 'Proposed Differentiation Strategy',
      paragraphs: [
        {
          subtitle: 'Legacy Limitations',
          description: 'Legacy proprietary platforms often rely on closed architectures that lack the transparency and auditability required for mission-critical infrastructure.'
        },
        {
          subtitle: 'Corporate Silos',
          description: 'Traditional manufacturers often build expensive, proprietary hardware silos that are difficult to scale and maintain.'
        },
        {
          subtitle: 'Open Standards',
          description: 'Our differentiation is the use of productionized open-source (NASA/PX4), providing the flexibility of open standards with the reliability of a tier-1 aerospace manufacturer.'
        }
      ],
      highlights: [
        'Sovereign Security: High-reliability compliance and transparency',
        'Rapid Iteration: 10x faster development via open ecosystems',
        'Platform Flexibility: High payload adaptability and open flight stacks'
      ],
      knowledgeGaps: [
        'Detailed competitor analysis of "Sovereign Stack" emerging startups in the EU and APAC regions.',
        'Patent landscape for message-bus flight architectures and AI build agents.'
      ]
    },
    children: [
      {
        id: 'competition-analysis',
        page: 'business',
        title: 'Deep Market Share',
        parentId: 'competition',
        content: {
          heading: 'The 2025 Market Shift',
          paragraphs: [
            {
              subtitle: 'Technical Depth',
              description: 'The massive industrial shift towards 1 billion unit annual capacity has exposed "White Label" companies that lack technical depth. We have a manufacturing roadmap built on individual mastery and high-scale strategic partnerships.'
            },
            {
              subtitle: 'Productionization Gap',
              description: 'While others focus on swarm intelligence, we focus on the hardware productionization gap they often outsource.'
            }
          ],
          stats: [
            { label: 'DJI US Market Share', value: '~70-80%+ (2025 estimates)' },
            { label: 'Blue UAS Growth', value: '16+ platforms (2025), 23+ selected (Feb 2025)' }
          ]
          // Note: citations have been integrated into paragraph objects with subtitle/description pattern
        }
      }
    ]
  },
  {
    id: 'products',
    page: 'business',
    title: 'Proposed Product Line',
    subtitle: 'Planned Tiered Solutions',
    imageUrl: pexel(3861968),
    position: [1.2, -10, 0],
    rotation: [0, 0, 0],
    layout: { type: 'gallery' },
    drilldown: { enabled: true },
    modelConfig: {
      path: '/assets/models/neuron/neuron.gltf',
      scale: 1.5,
      animation: { type: 'rotate', speed: 0.5 }
    },
    content: {
      heading: 'Proposed Tiers from Entry to Enterprise Swarms',
      paragraphs: [
        {
          subtitle: 'Entry Tier',
          description: 'Pixhawk-based systems with target: 30-minute flight times and basic autonomy.',
          citations: [
            { text: 'Typical 15-30 min for consumer/commercial', url: 'https://www.dronepilotgroundschool.com/drone-types/' },
            { text: 'Many 30-min flight time drones available', url: 'https://www.alibaba.com/showroom/30-min-flight-time-drone.html' }
          ]
        },
        {
          subtitle: 'Mid Tier',
          description: 'PX4/ArduPilot hybrids with AI-enhanced navigation and extended range.'
        },
        {
          subtitle: 'Advanced Tier',
          description: 'NASA-enhanced swarm systems for complex BVLOS operations.'
        }
      ],
      features: [
        'Customizable Payloads: Adaptable for diverse mission requirements',
        'FAA-Certified Path: Built for regulatory compliance from day one',
        'Sustainable Materials: Carbon fiber and GaN-based efficiency'
      ],
      knowledgeGaps: [
        'Specific battery energy density milestones required for 4-hour endurance on Mid-Tier platforms.',
        'LiDAR-to-Mesh real-time processing overhead on GaN-based flight stages.'
      ]
    },
    children: [
      {
        id: 'products-deep',
        page: 'business',
        title: 'Spec Details',
        parentId: 'products',
        content: {
          heading: 'Performance Goals',
          stats: [
            { label: 'Target Range', value: 'Significant (TBD)' },
            { label: 'Target Payload', value: 'High (TBD)' },
            { label: 'Target Uptime', value: 'High (TBD)' }
          ]
        }
      },
      {
        id: 'products-endurance',
        page: 'business',
        title: 'Endurance Systems',
        parentId: 'products',
        subtitle: 'Extended Flight Capabilities',
        content: {
          heading: 'Long-Duration Flight Solutions',
          paragraphs: [
            {
              subtitle: 'Strategic Goal',
              description: 'Develop UAV systems capable of extended operational periods. Target: 4+ hour flight times for mid-tier platforms and indefinite daylight endurance for advanced solar-powered variants.',
              citations: [
                { text: 'Fixed-wing commercial: >90 min possible', url: 'https://advexure.com/collections/commercial-enterprise-drones-for-sale' }
              ]
            },
            {
              subtitle: 'Power Management',
              description: 'Integration of high-energy-density battery systems with intelligent power distribution algorithms to maximize flight duration while maintaining mission-critical performance.'
            },
            {
              subtitle: 'Efficiency Optimization',
              description: 'Advanced aerodynamic design combined with lightweight materials to minimize power consumption and extend operational range.'
            }
          ],
          highlights: [
            'Target: 4+ hour flight time for mid-tier platforms',
            'Architecture: High-energy-density battery integration',
            'Optimization: Lightweight materials and aerodynamic efficiency',
            'Validation: Extensive flight testing for endurance validation'
          ],
          stats: [
            { label: 'Target Flight Time', value: '4+ hours' },
            { label: 'Battery Energy Density', value: 'TBD Wh/kg' },
            { label: 'Power Efficiency', value: 'Optimized' }
          ],
          knowledgeGaps: [
            'Specific battery energy density milestones required for 4-hour endurance on Mid-Tier platforms.',
            'Thermal management strategies for extended flight operations.',
            'Power distribution algorithms for optimal energy utilization.'
          ]
        }
      },
      {
        id: 'products-dormant',
        page: 'business',
        title: 'Dormant Systems',
        parentId: 'products',
        subtitle: 'Standby and Recovery Capabilities',
        content: {
          heading: 'Low-Power Standby and Rapid Activation',
          paragraphs: [
            {
              subtitle: 'Strategic Goal',
              description: 'Develop systems capable of extended dormant periods with minimal power consumption, enabling rapid deployment and activation when mission requirements arise.'
            },
            {
              subtitle: 'Power Conservation',
              description: 'Ultra-low-power standby modes that maintain system readiness while consuming minimal energy, allowing for extended field deployment without active operation.'
            },
            {
              subtitle: 'Rapid Activation',
              description: 'Quick-start capabilities that enable systems to transition from dormant state to full operational readiness within seconds, ensuring mission responsiveness.'
            }
          ],
          highlights: [
            'Standby: Ultra-low-power dormant modes',
            'Activation: Rapid transition to operational state',
            'Deployment: Extended field deployment capabilities',
            'Readiness: Maintained system readiness during dormancy'
          ],
          stats: [
            { label: 'Standby Power (Target)', value: '< 1W' },
            { label: 'Activation Time (Target)', value: '< 30s' },
            { label: 'Dormant Duration', value: 'Weeks' }
          ],
          knowledgeGaps: [
            'Optimal power management algorithms for extended dormant periods.',
            'Battery self-discharge mitigation strategies.',
            'Environmental protection requirements for dormant field deployment.'
          ]
        }
      }
    ]
  },
  {
    id: 'team',
    page: 'uav',
    title: 'Visionary & Founder Plan',
    subtitle: 'Individual Mastery Goal in Vision & Systems',
    imageUrl: pexel(3184431),
    position: [1.2, -22.5, 0],
    rotation: [0, 0, 0],
    content: {
      heading: 'Michael Douglas: Aerospace Visionary Strategy',
      paragraphs: [
        '**Domain Expertise:** As a Software Engineer at Tesla specializing in vision systems, Michael Douglas brings a unique blend of high-scale automation and deep technical integration to the UAV space.',
        '**Sourcing History:** His background spans high-resolution imaging, ML-based quality control, and international supply chain management with extensive experience in high-volume industrial sourcing.',
        '**Core Mission:** We are dedicated to productionizing open-source gold standards to ensure that the future of autonomous flight is sovereign, reliable, and built on an open foundation.'
      ],
      highlights: [
        'Experience: Software Engineer, Tesla (Vision Systems)',
        'Expertise: ML & Computer Vision Automation',
        'Procurement: International Industrial Sourcing',
        'Vision: Founder of the Sovereign Stack'
      ]
    }
  },
  {
    id: 'cta',
    page: 'uav',
    title: 'Proposed Collaboration',
    subtitle: 'Build the Future of Flight Strategy',
    imageUrl: pexel(1108090),
    position: [1.2, -25, 0],
    rotation: [0, 0, 0],
    content: {
      heading: 'Join the Sovereign Foundation Plan',
      paragraphs: [
        '**Strategic Partnership:** We are seeking strategic partners and collaborators who understand the critical importance of domestic, production-grade UAV technology.',
        '**Technical Collaboration:** Our foundation plan is open for technical collaboration and strategic sourcing partnerships to scale automated assembly lines for sovereign drone stacks.',
        '**Outreach:** Reach out to explore pilot programs for industrial vision, logistics, and environmental monitoring.'
      ],
      highlights: [
        'Strategic: Partnership opportunities for billion-scale quality',
        'Sovereignty: Technology foundation for domestic autonomy',
        'Validation: Pilot programs for high-reliability operations',
        'Technical: Vision systems and ML orchestration collaboration'
      ],
      features: [
        'Action: Collaborate',
        'Action: Pilot Program',
        'Action: Contact',
        'Action: Schedule Demo'
      ]
    }
  },
  {
    id: 'footer',
    page: 'uav',
    title: 'Proposed Navigation',
    subtitle: 'Navigation & Sovereignty Plan',
    imageUrl: pexel(3184436),
    position: [1.2, -27.5, 0],
    rotation: [0, 0, 0],
    content: {
      heading: 'Proposed Secure, Sovereign, Scalable Foundation',
      paragraphs: [
        '**Data Security:** All data is handled via end-to-end encrypted sovereign cloud infrastructure. Compliance with FAA Part 89 (Remote ID) and Part 108 (BVLOS) is a core objective.',
        '**Visionary Journey:** Follow our journey as we build the productionized gold standard for autonomous flight at billion-unit scale.'
      ]
    }
  }
];


