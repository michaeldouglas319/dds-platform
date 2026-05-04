/**
 * Unified Sections Configuration
 * Gold Standard: Single source of truth for all portfolio content
 *
 * Best Practices Applied:
 * - Config-driven UI (Microsoft pattern)
 * - Single source of truth
 * - Type-safe configuration
 * - Hierarchical structure with drilldown support
 */

import { Section, PageConfig, PageType } from './sections.types';

/**
 * RESUME SECTIONS
 */
const resumeSections: Section[] = [
  {
    id: 'resume-overview',
    page: 'resume',
    title: 'Professional Experience',
    subtitle: 'Full Stack Developer & 3D Creative',
    content: {
      heading: 'Michael Douglas',
      subheading: 'Creative Developer specializing in 3D web experiences',
      paragraphs: [
        'Experienced full-stack developer with expertise in React, Three.js, and modern web technologies.',
        'Passionate about creating immersive 3D experiences and interactive portfolios.',
      ],
      skills: ['React', 'Three.js', 'TypeScript', 'Next.js', 'WebGL', 'Node.js'],
    },
    layout: {
      type: 'grid',
      columns: 1,
    },
  },
];

/**
 * PROJECTS SECTIONS
 */
const projectsSections: Section[] = [
  {
    id: 'projects-overview',
    page: 'projects',
    title: 'Featured Projects',
    subtitle: '3D Web Experiences & Interactive Applications',
    content: {
      heading: 'Projects',
      subheading: 'Selected works showcasing creative development',
      paragraphs: [
        'A collection of interactive 3D web experiences, creative portfolios, and experimental projects.',
      ],
    },
    layout: {
      type: 'grid',
      columns: 2,
    },
    drilldown: {
      enabled: true,
      layout: 'detail',
      sections: [
        {
          id: 'project-1',
          page: 'projects',
          title: '3D Portfolio System',
          subtitle: 'React Three Fiber • Next.js',
          content: {
            heading: '3D Portfolio System',
            paragraphs: [
              'A modular 3D portfolio system built with React Three Fiber and Next.js.',
              'Features include dynamic routing, theme reactivity, and performance optimization.',
            ],
            technologies: ['React Three Fiber', 'Next.js', 'TypeScript', 'Tailwind CSS'],
          },
          scene: {
            position: [0, 0, 0],
            color: '#3b82f6',
          },
        },
      ],
    },
  },
];

/**
 * ABOUT SECTIONS
 */
const aboutSections: Section[] = [
  {
    id: 'about-overview',
    page: 'about',
    title: 'About Me',
    subtitle: 'Creative Developer & 3D Enthusiast',
    content: {
      heading: 'About',
      paragraphs: [
        'I\'m a creative developer specializing in building immersive 3D web experiences.',
        'My work combines technical expertise with creative vision to push the boundaries of what\'s possible on the web.',
      ],
      skills: ['React', 'Three.js', 'WebGL', 'TypeScript', 'Creative Coding'],
    },
    layout: {
      type: 'scroll-based',
    },
  },
];

/**
 * OVERVIEW SECTIONS (3D Portal Cards)
 */
const overviewSections: Section[] = [
  {
    id: 'overview-resume',
    page: 'overview',
    title: 'Resume',
    subtitle: 'Professional Experience',
    content: {
      heading: 'Resume',
      paragraphs: ['View my professional experience and skills'],
    },
    path: '/resumev3',
    scene: {
      position: [0, 1.5, 0],
      rotation: [0, 0, 0],
      color: '#3b82f6',
    },
  },
  {
    id: 'overview-projects',
    page: 'overview',
    title: 'Projects',
    subtitle: 'Featured Works',
    content: {
      heading: 'Projects',
      paragraphs: ['Explore my creative projects and experiments'],
    },
    path: '/projects',
    scene: {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      color: '#8b5cf6',
    },
  },
  {
    id: 'overview-about',
    page: 'overview',
    title: 'About',
    subtitle: 'Who I Am',
    content: {
      heading: 'About',
      paragraphs: ['Learn more about my background and skills'],
    },
    path: '/about',
    scene: {
      position: [0, -1.5, 0],
      rotation: [0, 0, 0],
      color: '#ec4899',
    },
  },
];

/**
 * PERSONAL SECTIONS
 */
const personalSections: Section[] = [
  {
    id: 'personal-hero',
    page: 'personal',
    title: 'Personal Portfolio',
    subtitle: 'Creative Development',
    content: {
      heading: 'Personal',
      paragraphs: ['Personal variant of the portfolio experience'],
    },
    layout: {
      type: 'landing',
    },
    scene: {
      position: [0, 0, 0],
      environment: 'city',
      lighting: {
        ambient: { intensity: 2.5 },
      },
    },
  },
];

/**
 * ALL SECTIONS - Combined array for easy filtering
 */
export const allSections: Section[] = [
  ...resumeSections,
  ...projectsSections,
  ...aboutSections,
  ...overviewSections,
  ...personalSections,
];

/**
 * PAGE CONFIGURATIONS
 */
export const pageConfigs: Record<PageType, Partial<PageConfig>> = {
  landing: {
    id: 'landing',
    title: 'Home',
    description: 'Creative Developer Portfolio',
    defaultLayout: 'landing',
    sections: [],
  },
  resume: {
    id: 'resume',
    title: 'Resume',
    description: 'Professional experience and skills',
    defaultLayout: 'grid',
    sections: resumeSections,
  },
  projects: {
    id: 'projects',
    title: 'Projects',
    description: 'Featured works and case studies',
    defaultLayout: 'grid',
    sections: projectsSections,
  },
  about: {
    id: 'about',
    title: 'About',
    description: 'Background and expertise',
    defaultLayout: 'scroll-based',
    sections: aboutSections,
  },
  overview: {
    id: 'overview',
    title: 'Overview',
    description: '3D portfolio navigation',
    defaultLayout: 'portal-cards',
    sections: overviewSections,
    sceneDefaults: {
      lighting: {
        ambient: { intensity: 2.5 },
        point: {
          intensity: 1.5,
          position: [0, 0, 5],
          color: '#8b5cf6',
        },
      },
      environment: 'city',
    },
  },
  personal: {
    id: 'personal',
    title: 'Personal',
    description: 'Personal portfolio variant',
    defaultLayout: 'landing',
    sections: personalSections,
  },
  business: {
    id: 'business',
    title: 'Business',
    description: 'Business portfolio',
    defaultLayout: 'scroll-based',
    sections: [
      {
        id: 'hero',
        page: 'business',
        title: 'Productionizing Gold Standards',
        subtitle: 'Building the Future',
        color: '#0066ff',
        content: {
          heading: 'Productionizing Gold Standards',
          paragraphs: [
            'Transforming innovative UAV technology into scalable, production-ready solutions.',
            'Our approach combines cutting-edge engineering with proven manufacturing processes.',
          ],
          highlights: [
            'Scalable production systems',
            'Quality assurance frameworks',
            'Regulatory compliance',
            'Market-ready solutions',
          ],
        },
        scene: {
          position: [0, 0, 0],
          color: '#0066ff',
        },
        drilldown: { enabled: true },
      },
      {
        id: 'problem',
        page: 'business',
        title: 'The Challenge',
        subtitle: 'Scaling Innovation',
        color: '#ff6b6b',
        content: {
          heading: 'The Challenge',
          paragraphs: [
            'Moving from prototype to production requires robust systems, processes, and infrastructure.',
            'We address the critical gap between innovation and market deployment.',
          ],
          highlights: [
            'Prototype to production gap',
            'Quality and consistency requirements',
            'Regulatory compliance challenges',
            'Scalability and cost optimization',
          ],
        },
        scene: {
          position: [0, 0, 0],
          color: '#ff6b6b',
        },
        drilldown: { enabled: true },
      },
      {
        id: 'solution',
        page: 'business',
        title: 'Our Solution',
        subtitle: 'Production Excellence',
        color: '#51cf66',
        drilldown: { enabled: true },
        content: {
          heading: 'Our Solution',
          paragraphs: [
            'Comprehensive productionization strategy combining engineering excellence with operational efficiency.',
            'End-to-end solutions from design to delivery.',
          ],
          highlights: [
            'Integrated production systems',
            'Quality control frameworks',
            'Supply chain optimization',
            'Continuous improvement processes',
          ],
        },
        scene: {
          position: [0, 0, 0],
          color: '#51cf66',
        },
      },
    ],
  },
  ideas: {
    id: 'ideas',
    title: 'Ideas',
    description: 'Innovative concepts and research',
    defaultLayout: 'scroll-based',
    sections: [],
  },
  uav: {
    id: 'uav',
    title: 'UAV',
    description: 'UAV portfolio',
    defaultLayout: 'scroll-based',
    sections: [],
  },
  showcase: {
    id: 'showcase',
    title: 'Component Showcase',
    description: 'Component demonstrations',
    defaultLayout: 'grid',
    sections: [],
  },
};

/**
 * UTILITY FUNCTIONS
 */

/**
 * Get sections for a specific page
 */
export function getSectionsByPage(page: PageType): Section[] {
  // First try to get from pageConfigs (for business, uav, etc.)
  const pageConfig = pageConfigs[page];
  if (pageConfig?.sections && pageConfig.sections.length > 0) {
    return pageConfig.sections as Section[];
  }
  
  // Fallback to filtering allSections
  return allSections.filter((section) => section.page === page);
}

/**
 * Get a single section by ID
 */
export function getSectionById(id: string): Section | undefined {
  return allSections.find((section) => section.id === id);
}

/**
 * Get page configuration
 */
export function getPageConfig(page: PageType): Partial<PageConfig> {
  return pageConfigs[page] || {};
}

/**
 * Get sections for drilldown
 */
export function getDrilldownSections(parentId: string): Section[] {
  const parent = getSectionById(parentId);
  return parent?.drilldown?.sections || [];
}

/**
 * Get section path (for routing)
 */
export function getSectionPath(section: Section): string {
  if (section.path) return section.path;
  if (section.drilldown?.path) return section.drilldown.path;
  return `/${section.page}/${section.id}`;
}
