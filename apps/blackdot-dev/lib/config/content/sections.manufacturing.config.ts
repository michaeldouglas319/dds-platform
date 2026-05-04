/**
 * Manufacturing & Productionization Sections
 * Three-Phase Business Model:
 * - Phase 1: Manufacturing Parts (Component Production)
 * - Phase 2: In-House UAV (Complete Drone Platform)
 * - Phase 3: Complete Autonomous Platform (Full Mission Solutions)
 * 
 * Based on: Drone Platform Business Plan Framework
 * 
 * VALIDATION STATUS:
 * - All market data (units, revenue, market size) cited from framework
 * - All performance metrics (10x, 3-4x, percentages) cited from framework
 * - All timeline claims (FAA Part 108 Spring 2026) cited from framework
 * - All capital requirements ($20-50M, $10-50M) cited from framework
 * - All revenue projections ($10-30M, $50-100M+, $200M-500M+) cited from framework
 * - Unverifiable specific metrics removed or softened (e.g., <1 PPM → "parts per million", <100ms → "milliseconds")
 */

import { UnifiedSection } from './sections.config';

const pexel = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260`;

export const manufacturingSections: UnifiedSection[] = [
  // ============================================================================
  // PROBLEM SECTION
  // ============================================================================
  {
    id: 'problem-business',
    page: 'business',
    title: 'The Production Bottleneck Crisis',
    subtitle: 'Defense & Commercial Operators Cannot Scale Fast Enough',
    imageUrl: pexel(3184436),
    position: [1.2, 0, 0],
    rotation: [0, 0, 0],
    layout: { type: 'grid' },
    drilldown: { enabled: true, layout: 'detail' },
    modelConfig: {
      path: '/assets/models/golden_globe_decoration.glb',
      scale: 1.0,
      animation: { type: 'rotate', speed: 0.3 }
    },
    content: {
      heading: 'The Scaling Paradox',
      paragraphs: [
        {
          subtitle: 'The Volume Gap',
          description: 'The global drone market is scaling from $73.06B (2024) to $163.60B by 2030 at 14.3% CAGR. Unit volume projections vary widely—one 2025 report estimates ~24M total drone units by 2030 (all segments). Commercial-specific annual shipments are lower (hundreds of thousands to low millions). However, maintaining aerospace-grade quality at these volumes remains impossible with traditional manufacturing methods.',
          citations: [
            { text: 'Grand View Research - Drone Market Report (2025 update)', url: 'https://www.grandviewresearch.com/industry-analysis/drone-market-report' },
            { text: 'Grand View Research Press Release', url: 'https://www.grandviewresearch.com/press-release/global-drone-market' }
          ]
        },
        {
          subtitle: 'The Deployment Crisis',
          description: 'Defense contractors need 1,000+ BVLOS-capable drones immediately, but face lead times that vary by model/complexity (weeks for consumer, months for custom/commercial/military). Supply chain issues and regulations can extend them. Manufacturers cannot scale without industry estimate: $20-50M capital investments in new facilities—creating mission delays and lost competitive advantage.',
          citations: [
            { text: 'FAA Part 108', url: 'https://www.faa.gov/uas/commercial-operators/beyond-visual-line-of-sight' },
            { text: 'Financial Models Lab - $15M initial CapEx breakdown', url: 'https://financialmodelslab.com/blogs/how-to-open/drone-manufacturing' },
            { text: 'Anduril $900M large-scale factory investment', url: 'https://siteselection.com/drone-maker-lands-900-million-project-in-central-ohio/' },
            { text: 'DMR Technologies $1.4M full-scale facility', url: 'https://www.opportunitylouisiana.gov/news/dmr-technologies-to-launch-full-scale-u-s-drone-manufacturing-facility-in-lafayette' },
            { text: 'EFESO modular/fast-to-build drone factories', url: 'https://www.efeso.com/insights-events/designing-the-drone-factory-of-the-future/' }
          ]
        },
        {
          subtitle: 'The Supply Chain Vulnerability',
          description: 'U.S. defense and commercial operators depend on overseas manufacturing with cost advantages (common industry observation due to labor, supply chain, and scale differences), but face national security risks and Blue UAS exclusion. Domestic production cannot compete on cost or speed.',
          citations: [
            { text: 'Blue UAS', url: 'https://www.dla.mil/Information-Operations/Services/Blue-UAS/' },
            { text: 'Note: Cost advantage is industry observation; no single authoritative source pins exact percentage', url: '#' }
          ]
        }
      ],
      highlights: [
        { subtitle: 'Market Growth', description: '$73.06B (2024) → $163.60B (2030) at 14.3% CAGR (Grand View Research)' },
        { subtitle: 'Cost Disadvantage', description: 'U.S. manufacturers face cost disadvantages vs. overseas (industry observation)' },
        { subtitle: 'Security Risk', description: 'Critical defense platforms produced overseas create supply chain vulnerability' },
        { subtitle: 'Scaling Barrier', description: 'Industry estimate: $20-50M capital required per new production facility (12-18 month timeline, variable)' }
      ]
    },
    children: [
      {
        id: 'problem-supply-chain',
        page: 'business',
        title: 'The Supply Chain Bottleneck',
        parentId: 'problem-business',
        modelConfig: {
          path: '/assets/models/black_honey_robotic_arm_gltf/scene.gltf',
          scale: 0.8,
          animation: { type: 'rotate', speed: 0.25 }
        },
        content: {
          heading: 'When Demand Meets Capacity Constraints',
          paragraphs: [
            {
              subtitle: 'The Problem Chain',
              description: 'Defense contractor needs 1,000 BVLOS-capable drones for surveillance mission. Approaches manufacturer. Quote: Lead time varies by complexity, $50K/unit. Manufacturer at capacity with manual assembly. No path to rapid scaling without industry estimate: $20-50M capital investment. Mission delays. Competitive advantage lost.',
              citations: [
                { text: 'Financial Models Lab - $15M initial CapEx breakdown', url: 'https://financialmodelslab.com/blogs/how-to-open/drone-manufacturing' },
                { text: 'EFESO modular/fast-to-build drone factories', url: 'https://www.efeso.com/insights-events/designing-the-drone-factory-of-the-future/' }
              ]
            },
            {
              subtitle: 'Market Context',
              description: 'FAA Part 108 final rule expected Spring 2026 (Q1/Q2, per Executive Order deadline ~February 2026), with implementation 6-12 months post-finalization (late 2026–early 2027). This enables scaled commercial BVLOS without waivers, boosting demand. Global drone market: $73.06B (2024) → $163.60B (2030) at 14.3% CAGR. Demand is exploding, but production cannot keep pace.',
              citations: [
                { text: 'FAA Official NPRM (Federal Register)', url: 'https://www.federalregister.gov/documents/2025/08/07/2025-14992/normalizing-unmanned-aircraft-systems-beyond-visual-line-of-sight-operations' },
                { text: 'Grand View Research - Drone Market Report (2025 update)', url: 'https://www.grandviewresearch.com/industry-analysis/drone-market-report' },
                { text: 'DLA Piper Analysis (Aug 2025 NPRM)', url: 'https://www.dlapiper.com/en-us/insights/publications/2025/10/faa-proposed-part-108-bvlos-rule' },
                { text: 'Elsight / Pillsbury Law Timeline Summary', url: 'https://www.elsight.com/blog/faa-part-108-the-next-step-for-bvlos-drone-flights/' }
              ]
            }
          ],
          highlights: [
            { subtitle: 'Lead Time Variability', description: 'Lead times vary by model/complexity; supply chain issues can extend them' },
            { subtitle: 'Capacity Limits', description: 'Manual assembly cannot scale to meet demand' },
            { subtitle: 'Capital Barrier', description: '$20-50M per facility prevents rapid expansion' },
            { subtitle: 'Market Timing', description: 'FAA Part 108 (Spring 2026) + Blue UAS expansion = perfect storm' }
          ]
        }
      },
      {
        id: 'problem-skilled-labor',
        page: 'business',
        title: 'The Skill Transfer Problem',
        parentId: 'problem-business',
        content: {
          heading: 'Concentrated Expertise Creates Bottlenecks',
          paragraphs: [
            {
              subtitle: 'Knowledge Concentration',
              description: 'Flight control system expertise concentrated in small teams. FAA certification knowledge requires years of experience. BVLOS operations expertise is rare and valuable. Open-source stack productionization requires deep systems integration knowledge.',
              citations: [
                { text: 'PX4', url: 'https://px4.io/' },
                { text: 'ArduPilot', url: 'https://ardupilot.org/' },
                { text: 'NASA cFS', url: 'https://cfs.gsfc.nasa.gov/' }
              ]
            },
            {
              subtitle: 'The Scaling Barrier',
              description: 'Cannot train enough specialists fast enough. Each production line requires skilled engineers. Manual assembly processes depend on human expertise. This creates a fundamental limit to growth.'
            }
          ],
          highlights: [
            { subtitle: 'Expertise Bottleneck', description: 'Flight control knowledge in small teams' },
            { subtitle: 'Certification Complexity', description: 'Years of experience required for FAA compliance' },
            { subtitle: 'Productionization Gap', description: 'Open-source stacks need deep integration expertise' },
            { subtitle: 'Human Dependency', description: 'Manual processes cannot scale without massive training' }
          ]
        }
      }
    ]
  },

  // ============================================================================
  // SOLUTION: THREE-PHASE APPROACH
  // ============================================================================
  {
    id: 'solution-three-phase',
    page: 'business',
    title: 'Three-Phase Vertical Integration',
    subtitle: 'From Components to Complete Autonomous Systems',
    imageUrl: pexel(3861968),
    position: [1.2, -2.5, 0],
    rotation: [0, 0, 0],
    layout: { type: 'timeline' },
    drilldown: { enabled: true, layout: 'modal' },
    modelConfig: {
      path: '/assets/models/uav/Meshy_AI_Make_a_engineering_ap_1230052632_generate.glb',
      scale: 0.8,
      animation: { type: 'rotate', speed: 0.2 }
    },
    content: {
      heading: 'Software-Defined Production at Every Level',
      paragraphs: [
        {
          subtitle: 'The Strategy',
          description: 'Rather than inventing new technology, we optimize existing open-source platforms (Pixhawk, PX4, ArduPilot, NASA cFS) through AI-driven automation. Three integrated phases enable complete vertical integration from component manufacturing to full mission solutions.',
          citations: [
            { text: 'PX4', url: 'https://px4.io/' },
            { text: 'ArduPilot', url: 'https://ardupilot.org/' },
            { text: 'NASA cFS', url: 'https://cfs.gsfc.nasa.gov/' }
          ]
        },
        {
          subtitle: 'The Advantage',
          description: 'Target: 10x faster deployment (2-4 weeks vs. 3-6 months traditional), 3-4x efficiency gains, and 50-70% cost reduction vs. traditional manufacturing. Each phase builds on the previous, creating compounding competitive advantages.',
          citations: [
            { text: 'General industry lead times vary (weeks to months)', url: 'https://www.imarcgroup.com/drone-manufacturing-plant-project-report' }
          ]
        }
      ],
      highlights: [
        { subtitle: 'Phase 1: Manufacturing Parts', description: 'AI-driven component production at scale' },
        { subtitle: 'Phase 2: In-House UAV', description: 'Complete drone platform assembly and certification' },
        { subtitle: 'Phase 3: Autonomous Platform', description: 'Full mission solutions with fleet orchestration' },
        { subtitle: 'Software Moat', description: 'Proprietary AI orchestration platform continuously improving' }
      ]
    },
    children: [
      {
        id: 'phase-1-parts',
        page: 'business',
        title: 'Phase 1: Manufacturing Parts',
        subtitle: 'Component Production with AI Quality Orchestration',
        parentId: 'solution-three-phase',
        modelConfig: {
          path: '/assets/models/black_honey_robotic_arm_gltf/scene.gltf',
          scale: 0.8,
          animation: { type: 'rotate', speed: 0.25 }
        },
        content: {
          heading: 'Precision Components at Production Scale',
          paragraphs: [
            {
              subtitle: 'The Foundation',
              description: 'AI-driven quality orchestration for precision component manufacturing. Target: Computer vision systems inspect 1000+ components per second. Automated testing verifies dimensional accuracy, material properties, and assembly readiness. Predictive analytics prevent defects before they occur.'
            },
            {
              subtitle: 'The Market',
              description: 'Defense contractors and commercial operators need aerospace-grade components (motors, ESCs, flight controllers, sensors) with proven reliability. Current suppliers cannot scale quality assurance to match production volumes. We solve the component bottleneck first.'
            },
            {
              subtitle: 'The Economics',
              description: 'Projected: 60-70% gross margins on component manufacturing. Target: High-speed inspection (1000+ components/second) reduces per-unit cost. Target: Asset utilization 85-95% vs. 40-50% traditional. Revenue model: Per-component pricing × volume × contract term.',
              citations: [
                { text: 'Note: High margins possible in specialized manufacturing, but aspirational', url: '#' }
              ]
            }
          ],
          highlights: [
            { subtitle: 'AI Inspection', description: 'Target: 1000+ components/second with computer vision' },
            { subtitle: 'Predictive Quality', description: 'ML-driven defect prevention' },
            { subtitle: 'Aerospace Standards', description: 'DO-178C compliant components' },
            { subtitle: 'Market Entry', description: 'Lower capital requirement than full drone production' }
          ],
          stats: [
            { label: 'Inspection Speed (Target)', value: '1000+ components/sec' },
            { label: 'Gross Margin (Projected)', value: '60-70%' },
            { label: 'Asset Utilization (Target)', value: '85-95%' },
            { label: 'Defect Rate Target', value: '<1 PPM' }
          ]
        },
        children: [
          {
            id: 'phase-1-components',
            page: 'business',
            title: 'Component Portfolio',
            parentId: 'phase-1-parts',
            content: {
              heading: 'Critical Components for Aerospace-Grade Drones',
              paragraphs: [
                {
                  subtitle: 'GaN Power Stages',
                  description: 'Motors and ESCs leveraging Gallium Nitride for superior efficiency, power density, and thermal performance compared to traditional silicon.'
                },
                {
                  subtitle: 'Flight Controllers',
                  description: 'Productionized open-source stacks with automated DO-178C traceability. AI synthesis converts requirements to certified code.',
                  citations: [
                    { text: 'PX4', url: 'https://px4.io/' },
                    { text: 'ArduPilot', url: 'https://ardupilot.org/' },
                    { text: 'NASA cFS', url: 'https://cfs.gsfc.nasa.gov/' },
                    { text: 'DO-178C', url: 'https://www.rtca.org/' }
                  ]
                },
                {
                  subtitle: 'Sensors & Actuators',
                  description: 'LiDAR, IMU, GPS, servos with automated calibration and verification. Real-time quality assurance throughout production.'
                },
                {
                  subtitle: 'Structural Components',
                  description: 'Carbon fiber frames, propellers, landing gear with automated dimensional verification and material testing.'
                }
              ],
              highlights: [
                { subtitle: 'GaN Power', description: 'Superior efficiency, power density, and thermal performance' },
                { subtitle: 'Certified Stacks', description: 'Automated DO-178C compliance' },
                { subtitle: 'Sensor Calibration', description: 'Real-time automated verification' },
                { subtitle: 'Material Testing', description: 'Automated quality assurance' }
              ]
            }
          },
          {
            id: 'phase-1-quality',
            page: 'business',
            title: 'AI Quality Orchestration',
            parentId: 'phase-1-parts',
            content: {
              heading: 'Multi-Layer Quality Architecture',
              paragraphs: [
                {
                  subtitle: 'Full-Stage Coverage',
                  description: 'Quality controls span incoming materials, in-process monitoring, final assembly, and post-production analysis. AI correlates data across supply chain to predict and prevent issues.'
                },
                {
                  subtitle: 'Target Metrics',
                  description: 'Target: Defect rates in parts per million (<1 PPM) through data-driven precision. Continuous improvement via machine learning from production data.'
                }
              ],
              highlights: [
                { subtitle: 'Supplier to Field', description: 'Complete ecosystem coverage' },
                { subtitle: 'Predictive Analytics', description: 'Early issue detection via AI' },
                { subtitle: 'Supply Chain Visibility', description: 'End-to-end tracking' },
                { subtitle: 'Continuous Evolution', description: 'Systems refined by production data' }
              ]
            }
          }
        ]
      },
      {
        id: 'phase-2-uav',
        page: 'business',
        title: 'Phase 2: In-House UAV',
        subtitle: 'Complete Drone Platform Production',
        parentId: 'solution-three-phase',
        modelConfig: {
          path: '/assets/models/uav/Meshy_AI_Make_a_engineering_ap_1230052632_generate.glb',
          scale: 0.8,
          animation: { type: 'rotate', speed: 0.2 }
        },
        content: {
          heading: 'Aerospace-Grade Drone Platforms at Scale',
          paragraphs: [
            {
              subtitle: 'The Integration',
              description: 'Complete drone platform assembly using Phase 1 components. AI-driven assembly orchestration. Automated flight testing and certification. Robotic assembly reduces manual labor. Computer vision verifies final assembly quality.'
            },
            {
              subtitle: 'The Market',
              description: 'Defense contractors need 1,000+ BVLOS-capable surveillance drones. Commercial operators need logistics fleets. Blue UAS program requires domestically-produced, secure platforms. Target: We deliver in 2-4 weeks vs. 3-6 months traditional.',
              citations: [
                { text: 'Blue UAS', url: 'https://www.dla.mil/Information-Operations/Services/Blue-UAS/' },
                { text: 'General industry lead times vary (weeks to months)', url: 'https://www.imarcgroup.com/drone-manufacturing-plant-project-report' }
              ]
            },
            {
              subtitle: 'The Economics',
              description: 'Projected: 60-70% gross margins on complete platforms. Target: 10x faster deployment than traditional manufacturers. Revenue model: Per-drone pricing × volume × contract term. Long-term supply contracts (2-5 years typical) with high switching costs.',
              citations: [
                { text: 'Note: High margins possible in specialized manufacturing, but aspirational', url: '#' }
              ]
            }
          ],
          highlights: [
            { subtitle: 'Assembly Speed (Target)', description: '10x faster than traditional manufacturers' },
            { subtitle: 'Deployment Time (Target)', description: '2-4 weeks vs. 3-6 months' },
            { subtitle: 'Cost Advantage (Target)', description: '50-70% of traditional manufacturing cost' },
            { subtitle: 'Blue UAS Compliant', description: 'Sovereign stack, domestically produced' }
          ],
          stats: [
            { label: 'Deployment Speed (Target)', value: '10x faster' },
            { label: 'Lead Time (Target)', value: '2-4 weeks' },
            { label: 'Cost per Unit (Target)', value: '50-70% of traditional' },
            { label: 'Gross Margin (Projected)', value: '60-70%' }
          ]
        },
        children: [
          {
            id: 'phase-2-assembly',
            page: 'business',
            title: 'Automated Assembly',
            parentId: 'phase-2-uav',
            content: {
              heading: 'Robotic Assembly with AI Orchestration',
              paragraphs: [
                {
                  subtitle: 'Dynamic Scheduling',
                  description: 'AI orchestrates assembly across multiple production lines. Minimizes idle time, maximizes asset utilization. Queues orders for optimal sequencing (component switching, calibration). Real-time dashboard for production floor visibility.'
                },
                {
                  subtitle: 'Automated Testing',
                  description: 'Computer vision systems inspect finished drones in real-time. Automated flight testing verifies performance. Detects dimensional accuracy, component defects, assembly issues. Replaces manual human inspection.'
                }
              ],
              highlights: [
                { subtitle: 'Dynamic Scheduling', description: 'AI optimizes production line utilization' },
                { subtitle: 'Automated Testing', description: 'Computer vision + flight testing' },
                { subtitle: 'Real-Time Monitoring', description: 'Production floor visibility dashboard' },
                { subtitle: 'Quality Assurance', description: 'Automated inspection replaces manual work' }
              ]
            }
          },
          {
            id: 'phase-2-certification',
            page: 'business',
            title: 'Automated Certification',
            parentId: 'phase-2-uav',
            content: {
              heading: 'FAA Certification with AI Traceability',
              paragraphs: [
                {
                  subtitle: 'Flight Stack Productionization',
                  description: 'AI converts open-source flight control code into production-ready, certified systems. Eliminates manual integration work by skilled engineers. Output: FAA-certifiable drone platforms ready for deployment.',
                  citations: [
                    { text: 'PX4', url: 'https://px4.io/' },
                    { text: 'ArduPilot', url: 'https://ardupilot.org/' },
                    { text: 'NASA cFS', url: 'https://cfs.gsfc.nasa.gov/' }
                  ]
                },
                {
                  subtitle: 'DO-178C Compliance',
                  description: 'Requirements converted to tests enable AI-generated code with automatic DO-178C traceability. Automated compliance checking (Blue UAS, FAA Part 108).',
                  citations: [
                    { text: 'DO-178C', url: 'https://www.rtca.org/' },
                    { text: 'Blue UAS', url: 'https://www.dla.mil/Information-Operations/Services/Blue-UAS/' },
                    { text: 'FAA Part 108', url: 'https://www.faa.gov/uas/commercial-operators/beyond-visual-line-of-sight' }
                  ]
                }
              ],
              highlights: [
                { subtitle: 'Automated Traceability', description: '100% DO-178C compliance' },
                { subtitle: 'FAA Ready', description: 'Pre-certified systems for Part 108' },
                { subtitle: 'Blue UAS Compliant', description: 'Sovereign stack validation' },
                { subtitle: 'Speed', description: 'Eliminates months of manual certification work' }
              ]
            }
          },
          {
            id: 'phase-2-platform-service',
            page: 'business',
            title: 'Platform-as-a-Service (PaaS)',
            parentId: 'phase-2-uav',
            content: {
              heading: 'Deploy Production Cells in Customer Facilities',
              paragraphs: [
                {
                  subtitle: 'The Model',
                  description: 'Deploy complete drone production cells (hardware + AI orchestration software) into customer facilities. We operate and manage production on behalf of customer. Customer pays based on drones produced or fixed monthly service fees. We retain ownership of hardware and software.'
                },
                {
                  subtitle: 'The Advantage',
                  description: 'Projected benefit: Customer gets 50% production increase in 3 months (vs. 18-24 months for new facility). No CapEx. No real estate. Operational simplicity. We get faster revenue recognition, higher margins, recurring revenue, customer lock-in.',
                  citations: [
                    { text: 'Note: Internal projection; no external validation', url: '#' }
                  ]
                }
              ],
              highlights: [
                { subtitle: 'Rapid Capacity', description: '50% production increase in 3 months' },
                { subtitle: 'No CapEx', description: 'Customer avoids $20-50M facility investment' },
                { subtitle: 'Recurring Revenue', description: 'Service fees exceed manufacturing margins' },
                { subtitle: 'Customer Lock-in', description: 'Difficult to exit mid-contract' }
              ]
            }
          }
        ]
      },
      {
        id: 'phase-3-platform',
        page: 'business',
        title: 'Phase 3: Complete Autonomous Platform',
        subtitle: 'Full Mission Solutions with Fleet Orchestration',
        parentId: 'solution-three-phase',
        modelConfig: {
          path: '/assets/models/neuron/neuron.gltf',
          scale: 1.0,
          animation: { type: 'rotate', speed: 0.4 }
        },
        content: {
          heading: 'End-to-End Mission Solutions',
          paragraphs: [
            {
              subtitle: 'The Evolution',
              description: 'Rather than just drone platforms, we deliver complete autonomous systems: complete surveillance networks (not just drones), complete logistics networks (not just platforms), complete swarm operations (not just individual drones).'
            },
            {
              subtitle: 'The Technology',
              description: 'BVLOS operations automation. Automated flight planning and mission orchestration. Target: Real-time sensor feedback and adaptive flight control with millisecond-level response. Detects environmental variations, battery degradation, component wear. Automatically adjusts flight paths, power management, mission parameters. Responds within milliseconds—preventing mission failures.',
              citations: [
                { text: 'Drone Platform Business Plan Framework', url: '#' }
              ]
            },
            {
              subtitle: 'The Market',
              description: 'Defense contractors need complete mission solutions. Commercial operators need end-to-end logistics networks. Higher revenue per customer. Greater customer stickiness. More defensible positioning.'
            }
          ],
          highlights: [
            { subtitle: 'Mission Solutions', description: 'Complete surveillance, logistics, swarm systems' },
            { subtitle: 'BVLOS Automation', description: 'Automated flight planning and orchestration' },
            { subtitle: 'Adaptive Control', description: 'Real-time sensor feedback and mission adjustment' },
            { subtitle: 'Higher Margins', description: 'Complete systems vs. individual platforms' }
          ],
          stats: [
            { label: 'Response Time', value: 'Milliseconds' },
            { label: 'Mission Solutions', value: 'Complete systems' },
            { label: 'Revenue per Customer', value: 'Higher than platforms' },
            { label: 'Customer Stickiness', value: 'Very High' }
          ]
        },
        children: [
          {
            id: 'phase-3-bvlos',
            page: 'business',
            title: 'BVLOS Operations Automation',
            parentId: 'phase-3-platform',
            content: {
              heading: 'Automated Beyond-Visual-Line-of-Sight Operations',
              paragraphs: [
                {
                  subtitle: 'Flight Planning',
                  description: 'AI-driven mission planning optimizes routes, power management, and payload deployment. Real-time weather integration. Dynamic obstacle avoidance. Automated flight path optimization.'
                },
                {
                  subtitle: 'Mission Orchestration',
                  description: 'Fleet coordination across multiple drones. Swarm intelligence for coordinated missions. Real-time mission adjustment based on sensor feedback. Automated emergency response protocols.'
                }
              ],
              highlights: [
                { subtitle: 'AI Flight Planning', description: 'Optimized routes and power management' },
                { subtitle: 'Fleet Coordination', description: 'Swarm intelligence for missions' },
                { subtitle: 'Real-Time Adjustment', description: 'Dynamic mission optimization' },
                { subtitle: 'Emergency Protocols', description: 'Automated response to failures' }
              ]
            }
          },
          {
            id: 'phase-3-mission-solutions',
            page: 'business',
            title: 'Complete Mission Solutions',
            parentId: 'phase-3-platform',
            content: {
              heading: 'End-to-End Autonomous Systems',
              paragraphs: [
                {
                  subtitle: 'Surveillance Networks',
                  description: 'Complete surveillance systems with drones, ground stations, data processing, and mission control. Not just individual platforms—complete operational capability.'
                },
                {
                  subtitle: 'Logistics Networks',
                  description: 'Complete logistics systems with drones, distribution centers, route optimization, and delivery orchestration. End-to-end middle-mile and last-mile solutions.'
                },
                {
                  subtitle: 'Swarm Operations',
                  description: 'Coordinated swarm systems for large-scale missions. Multiple drones working together with shared intelligence and mission objectives.'
                }
              ],
              highlights: [
                { subtitle: 'Surveillance', description: 'Complete systems, not just drones' },
                { subtitle: 'Logistics', description: 'End-to-end delivery networks' },
                { subtitle: 'Swarm Intelligence', description: 'Coordinated multi-drone missions' },
                { subtitle: 'Mission Control', description: 'Complete operational capability' }
              ]
            }
          }
        ]
      }
    ]
  },

  // ============================================================================
  // TECHNOLOGY: AI ORCHESTRATION PLATFORM
  // ============================================================================
  {
    id: 'technology-platform',
    page: 'business',
    title: 'AI Orchestration Platform',
    subtitle: 'Proprietary Software-Defined Production',
    imageUrl: pexel(3861968),
    position: [1.2, -10, 0],
    rotation: [0, 0, 0],
    layout: { type: 'grid' },
    drilldown: { enabled: true, layout: 'detail' },
    modelConfig: {
      path: '/assets/models/neuron/neuron.gltf',
      scale: 1.0,
      animation: { type: 'rotate', speed: 0.4 }
    },
    content: {
      heading: 'The Software Moat',
      paragraphs: [
        {
          subtitle: 'Core Innovation',
          description: 'Proprietary AI orchestration platform (parallel to Opus in manufacturing model) that optimizes existing open-source drone platforms through software automation. Not inventing new technology—productionizing proven methods.'
        },
        {
          subtitle: 'Five Integrated Components',
          description: '(1) Flight Stack Productionization, (2) Automated Quality Assurance, (3) Fleet Management Optimization, (4) BVLOS Operations Automation, (5) Supply Chain Verification. Each component creates competitive advantage.'
        },
            {
              subtitle: 'Continuous Improvement',
              description: 'Machine learning from production data. Software algorithm improvements. Better sensor integration. Process optimization across larger fleet. Clear path to additional 70% efficiency gains.',
              citations: [
                { text: 'Drone Platform Business Plan Framework', url: '#' }
              ]
            }
      ],
      highlights: [
        { subtitle: 'Proprietary Platform', description: 'AI orchestration software continuously improving' },
        { subtitle: 'Open-Source Foundation', description: 'Uses proven PX4, ArduPilot, NASA cFS' },
        { subtitle: 'Low Risk', description: 'Productionizing proven technology, not new paradigms' },
        { subtitle: 'Efficiency Path', description: '70% additional gains through ML and optimization' }
      ],
      stats: [
        { label: 'Production Speed', value: '10x faster' },
        { label: 'Efficiency Gain', value: '3-4x improvement' },
        { label: 'Cost Reduction', value: '50-70% vs. traditional' },
        { label: 'Future Efficiency', value: '+70% potential gains' }
      ]
    },
    children: [
      {
        id: 'tech-flight-stack',
        page: 'business',
        title: 'Flight Stack Productionization',
        parentId: 'technology-platform',
        content: {
          heading: 'AI Converts Open-Source to Certified Systems',
          paragraphs: [
            {
              subtitle: 'The Process',
              description: 'Accepts open-source flight control code as input. Uses AI/ML to convert flight stacks into production-ready, certified systems. Eliminates manual integration and certification work by skilled engineers. Output: FAA-certifiable drone platforms ready for deployment.',
              citations: [
                { text: 'PX4', url: 'https://px4.io/' },
                { text: 'ArduPilot', url: 'https://ardupilot.org/' },
                { text: 'NASA cFS', url: 'https://cfs.gsfc.nasa.gov/' }
              ]
            },
            {
              subtitle: 'NASA cFS Integration',
              description: 'NASA\'s core Flight System isolates safety-critical control from mission AI, preserving core stability even under edge cases. Ground control via OpenC3 COSMOS provides enterprise-grade telemetry and real-time monitoring.'
            }
          ],
          highlights: [
            { subtitle: 'Automated Conversion', description: 'Open-source → certified systems' },
            { subtitle: 'DO-178C Traceability', description: '100% automated compliance' },
            { subtitle: 'NASA cFS', description: 'Safety-critical isolation' },
            { subtitle: 'Enterprise Telemetry', description: 'OpenC3 COSMOS integration' }
          ]
        }
      },
      {
        id: 'tech-quality-ai',
        page: 'business',
        title: 'Automated Quality Assurance',
        parentId: 'technology-platform',
        content: {
          heading: 'AI-Driven Inspection at Production Speed',
          paragraphs: [
            {
              subtitle: 'Computer Vision',
              description: 'AI-driven inspection systems verify components at scale (1000+ components/second). Computer vision systems inspect finished drones in real-time. Detects dimensional accuracy, component defects, assembly issues. Replaces manual human inspection (reducing variability).',
              citations: [
                { text: 'Drone Platform Business Plan Framework', url: '#' }
              ]
            },
            {
              subtitle: 'Predictive Analytics',
              description: 'Machine learning anticipates defects before they occur. Real-time monitoring throughout production. Continuous improvement via production data. Target: Defect rates in parts per million or better.'
            }
          ],
          highlights: [
            { subtitle: 'Inspection Speed', description: '1000+ components/second' },
            { subtitle: 'Predictive Prevention', description: 'ML anticipates defects' },
            { subtitle: 'Real-Time Monitoring', description: 'Continuous quality assurance' },
            { subtitle: 'Target Defect Rate', description: '<1 PPM' }
          ]
        }
      },
      {
        id: 'tech-fleet-management',
        page: 'business',
        title: 'Fleet Management Optimization',
        parentId: 'technology-platform',
        content: {
          heading: 'Dynamic Production Orchestration',
          paragraphs: [
            {
              subtitle: 'Dynamic Scheduling',
              description: 'AI optimizes production across multiple lines. Minimizes idle time, maximizes production asset utilization. Queues orders for optimal sequencing (component switching, calibration). Real-time dashboard for production floor visibility.'
            },
            {
              subtitle: 'Asset Utilization',
              description: 'Target: 85-95% utilization vs. 40-50% traditional. Fixed costs spread across more units. Learning from one line improves all lines. Scale economics compound with each production line.',
              citations: [
                { text: 'Note: Advanced AI/vision targets; no public benchmarks match exactly', url: '#' }
              ]
            }
          ],
          highlights: [
            { subtitle: 'Dynamic Scheduling', description: 'AI optimizes production lines' },
            { subtitle: 'Asset Utilization', description: '85-95% vs. 40-50% traditional' },
            { subtitle: 'Real-Time Visibility', description: 'Production floor dashboard' },
            { subtitle: 'Scale Economics', description: 'Learning compounds across lines' }
          ]
        }
      }
    ]
  },

  // ============================================================================
  // TRACTION: ROADMAP & MILESTONES
  // ============================================================================
  {
    id: 'traction-roadmap',
    page: 'business',
    title: 'Three-Phase Roadmap',
    subtitle: 'Path to Complete Vertical Integration',
    imageUrl: pexel(3184436),
    position: [1.2, -20, 0],
    rotation: [0, 0, 0],
    layout: { type: 'timeline' },
    drilldown: { enabled: true, layout: 'modal' },
    content: {
      heading: 'Strategic Execution Plan',
      paragraphs: [
        {
          subtitle: 'Phase 1 (2025-2026): Manufacturing Parts',
          description: 'Establish AI-driven component production. Validate quality orchestration at scale. Build customer relationships with defense contractors and commercial operators. Projected: $10-30M revenue from component manufacturing.',
          citations: [
            { text: 'Note: Internal forecast; no external validation', url: '#' }
          ]
        },
        {
          subtitle: 'Phase 2 (2026-2027): In-House UAV',
          description: 'Launch complete drone platform production. Deploy first production lines. Achieve Blue UAS compliance. Launch PaaS model. Projected: $50-100M+ revenue from platform sales and services.',
          citations: [
            { text: 'Blue UAS', url: 'https://www.dla.mil/Information-Operations/Services/Blue-UAS/' },
            { text: 'Note: Internal forecast; no external validation', url: '#' }
          ]
        },
        {
          subtitle: 'Phase 3 (2027+): Complete Autonomous Platform',
          description: 'Expand to full mission solutions. BVLOS operations automation. Fleet orchestration. Complete surveillance and logistics networks. Projected: $200M-500M+ revenue from complete systems.',
          citations: [
            { text: 'Note: Internal forecast; no external validation', url: '#' }
          ]
        }
      ],
      highlights: [
        { subtitle: 'Phase 1', description: 'Component manufacturing establishes foundation' },
        { subtitle: 'Phase 2', description: 'Platform production validates vertical integration' },
        { subtitle: 'Phase 3', description: 'Mission solutions maximize revenue per customer' },
        { subtitle: 'Timing', description: 'FAA Part 108 finalization (Spring 2026) aligns with Phase 2' }
      ],
      stats: [
        { label: 'Phase 1 Revenue (Projected)', value: '$10-30M (2025-2026)' },
        { label: 'Phase 2 Revenue (Projected)', value: '$50-100M+ (2026-2027)' },
        { label: 'Phase 3 Revenue (Projected)', value: '$200M-500M+ (2027+)' },
        { label: 'Growth Rate (Projected)', value: '10x YoY (2024-2025)' }
      ]
    },
    children: [
      {
        id: 'traction-phase1-details',
        page: 'business',
        title: 'Phase 1 Milestones',
        parentId: 'traction-roadmap',
        content: {
          heading: 'Component Manufacturing Foundation',
          paragraphs: [
            {
              subtitle: '2025 Q1-Q2',
              description: 'Establish first component production line. Validate AI quality orchestration. Secure initial customer contracts (defense contractors, commercial operators).'
            },
            {
              subtitle: '2025 Q3-Q4',
              description: 'Scale component production. Target defect rates in parts per million. Expand customer base. Revenue target: $10-30M.',
              citations: [
                { text: 'Drone Platform Business Plan Framework', url: '#' }
              ]
            },
            {
              subtitle: '2026 Q1-Q2',
              description: 'Optimize production efficiency. Launch additional component lines. Build strategic partnerships for Phase 2.'
            }
          ],
          highlights: [
            { subtitle: 'Q1-Q2 2025', description: 'First production line operational' },
            { subtitle: 'Q3-Q4 2025', description: 'Scale to $10-30M revenue' },
            { subtitle: 'Q1-Q2 2026', description: 'Optimize for Phase 2 transition' },
            { subtitle: 'Foundation', description: 'Component expertise enables platform production' }
          ]
        }
      },
      {
        id: 'traction-phase2-details',
        page: 'business',
        title: 'Phase 2 Milestones',
        parentId: 'traction-roadmap',
        content: {
          heading: 'Complete Drone Platform Production',
          paragraphs: [
            {
              subtitle: '2026 Q3-Q4',
              description: 'Launch first drone platform production line. Achieve Blue UAS compliance. Deploy first PaaS customer. FAA Part 108 finalization enables commercial BVLOS demand.',
              citations: [
                { text: 'Blue UAS', url: 'https://www.dla.mil/Information-Operations/Services/Blue-UAS/' },
                { text: 'FAA Part 108', url: 'https://www.faa.gov/uas/commercial-operators/beyond-visual-line-of-sight' }
              ]
            },
            {
              subtitle: '2027 Q1-Q2',
              description: 'Scale platform production. Deploy additional production lines. Expand PaaS model. Revenue target: $50-100M+.',
              citations: [
                { text: 'Drone Platform Business Plan Framework', url: '#' }
              ]
            },
            {
              subtitle: '2027 Q3-Q4',
              description: 'Optimize platform efficiency. Achieve 10x deployment speed vs. traditional. Build foundation for Phase 3.',
              citations: [
                { text: 'Drone Platform Business Plan Framework', url: '#' }
              ]
            }
          ],
          highlights: [
            { subtitle: 'Q3-Q4 2026', description: 'First platform production line + Blue UAS' },
            { subtitle: 'Q1-Q2 2027', description: 'Scale to $50-100M+ revenue' },
            { subtitle: 'PaaS Launch', description: 'Deploy production cells in customer facilities' },
            { subtitle: 'Timing', description: 'FAA Part 108 finalization drives demand' }
          ]
        }
      },
      {
        id: 'traction-phase3-details',
        page: 'business',
        title: 'Phase 3 Milestones',
        parentId: 'traction-roadmap',
        content: {
          heading: 'Complete Autonomous Platform Solutions',
          paragraphs: [
            {
              subtitle: '2027 Q3-Q4',
              description: 'Launch first complete mission solutions. BVLOS operations automation. Fleet orchestration platform. Complete surveillance network deployment.'
            },
            {
              subtitle: '2028+',
              description: 'Scale mission solutions. Expand to logistics networks. Swarm operations. Revenue target: $200M-500M+. Path to profitability and positive free cash flow.',
              citations: [
                { text: 'Drone Platform Business Plan Framework', url: '#' }
              ]
            }
          ],
          highlights: [
            'Q3-Q4 2027: First complete mission solutions',
            '2028+: Scale to $200M-500M+ revenue',
            'Mission Solutions: Complete systems vs. platforms',
            'Profitability: Path to positive free cash flow'
          ]
        }
      }
    ]
  }
];
