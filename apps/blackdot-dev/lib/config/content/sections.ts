/**
 * Unified Sections Configuration
 * Config-based system for defining sections, jobs, and drilldown content
 */

export interface JobSection {
  id: string
  company: string
  role: string
  period: string
  color: string
  decal?: string
  imageUrl: string
  position: [number, number, number]
  rotation?: [number, number, number]
  content: {
    heading: string
    paragraphs: string[]
    highlights?: string[]
  }
}

export interface SectionLayout {
  type: "scroll-based" | "grid" | "carousel" | "timeline" | "gallery" | "custom"
  variant?: string
  component?: string
}

export interface SectionRendering {
  contentComponent?: string
  sceneComponent?: string
  portalComponent?: string
  contentId?: string
  sceneId?: string
  portalId?: string
}

export interface SectionDrilldown {
  enabled: boolean
  path?: string
  layout?: "detail" | "fullscreen" | "modal" | "sidebar"
  sections?: UnifiedSection[]
}

export interface UnifiedSection {
  id: string
  page: "home" | "resume" | "business" | "about" | "ideas"
  title: string
  subtitle?: string
  color?: string
  imageUrl?: string
  position?: [number, number, number]
  rotation?: [number, number, number]
  content: {
    heading: string
    paragraphs?: string[] | Array<{ subtitle?: string; description: string; citations?: Array<{ text: string; url: string }> }>
    highlights?: string[] | Array<{ subtitle: string; description: string }>
    stats?: { label: string; value: string }[]
    features?: string[]
    validation?: { proofPoints?: string[] }
  }
  layout?: SectionLayout
  rendering?: SectionRendering
  drilldown?: SectionDrilldown & {
    subcategories?: Array<{
      id: string
      title: string
      icon?: string
      content: {
        summary: string
        details: string[]
      }
    }>
  }
  children?: UnifiedSection[]
  parentId?: string
  modelConfig?: {
    path: string
    scale: number
    position: [number, number, number]
    rotation: [number, number, number]
    animation: { type: string; speed?: number; amplitude?: number }
  }
  investorLevel?: string
  importance?: string
  taxonomy?: {
    primary: string
    secondary?: string
    contentTypes?: string[]
    displayMode?: string
    investorLevel?: string
    importance?: string
    duration?: number
    order?: number
  }
}

// Home page sections
export const homeSections: UnifiedSection[] = [
  {
    id: "hero",
    page: "home",
    title: "Portfolio",
    subtitle: "Creative Developer & 3D Enthusiast",
    color: "#3b82f6",
    content: {
      heading: "Welcome",
      paragraphs: ["Crafting interactive experiences with React Three Fiber and modern web technologies"],
    },
    layout: { type: "custom" },
  },
]

// Resume page sections with jobs
export const resumeSections: UnifiedSection[] = [
  {
    id: "experience",
    page: "resume",
    title: "Experience",
    subtitle: "Professional Journey",
    color: "#10b981",
    content: {
      heading: "Work Experience",
      paragraphs: ["A collection of roles and projects that shaped my career"],
    },
    layout: { type: "timeline" },
    drilldown: {
      enabled: true,
      layout: "detail",
      sections: [
        {
          id: "job-1",
          page: "resume",
          title: "Senior Developer",
          subtitle: "Tech Startup",
          color: "#f59e0b",
          position: [0, 0, 0],
          imageUrl: "/senior-developer-role.jpg",
          content: {
            heading: "Led Full-Stack Development",
            paragraphs: [
              "Architected and built scalable web applications using React and Node.js",
              "Mentored junior developers and established best practices",
              "Reduced API response times by 40% through optimization",
            ],
            highlights: ["React", "Node.js", "TypeScript", "PostgreSQL", "AWS"],
          },
          drilldown: { enabled: false },
        },
        {
          id: "job-2",
          page: "resume",
          title: "Full-Stack Developer",
          subtitle: "Design Agency",
          color: "#8b5cf6",
          position: [0, 1, 0],
          imageUrl: "/full-stack-developer.png",
          content: {
            heading: "Built Interactive Web Experiences",
            paragraphs: [
              "Developed 20+ client projects with focus on performance and UX",
              "Implemented 3D graphics using Three.js and Babylon.js",
              "Created reusable component libraries for rapid development",
            ],
            highlights: ["React", "Three.js", "Tailwind CSS", "Figma", "GraphQL"],
          },
          drilldown: { enabled: false },
        },
        {
          id: "job-3",
          page: "resume",
          title: "Frontend Developer",
          subtitle: "E-commerce Company",
          color: "#ec4899",
          position: [0, 2, 0],
          imageUrl: "/frontend-developer-ecommerce.jpg",
          content: {
            heading: "Enhanced User Experience",
            paragraphs: [
              "Built responsive interfaces serving 500K+ monthly users",
              "Improved Core Web Vitals resulting in 25% increase in conversions",
              "Implemented real-time features with WebSockets",
            ],
            highlights: ["React", "Redux", "HTML/CSS", "Jest", "Webpack"],
          },
          drilldown: { enabled: false },
        },
      ],
    },
  },
]

// About page sections
export const aboutSections: UnifiedSection[] = [
  {
    id: "about",
    page: "about",
    title: "About",
    subtitle: "Who I Am",
    color: "#6366f1",
    content: {
      heading: "About Me",
      paragraphs: [
        "I am a passionate developer focused on creating beautiful, performant web experiences.",
        "With expertise in React, 3D graphics, and modern web technologies, I bridge the gap between design and technology.",
      ],
    },
    layout: { type: "scroll-based" },
  },
]

export const allSections: UnifiedSection[] = [...homeSections, ...resumeSections, ...aboutSections]

/**
 * Helper functions to access sections
 */
export function getSectionsByPage(page: UnifiedSection["page"]): UnifiedSection[] {
  const flattened: UnifiedSection[] = []

  function process(sections: UnifiedSection[]) {
    for (const section of sections) {
      if (section.page === page) {
        flattened.push(section)
      }
      if (section.children) {
        process(section.children)
      }
    }
  }

  process(allSections)
  return flattened
}

export function getSectionById(page: UnifiedSection["page"], id: string): UnifiedSection | undefined {
  const sections = getSectionsByPage(page)
  return sections.find((s) => s.id === id)
}

export function getAllSectionsFlat(): UnifiedSection[] {
  const flattened: UnifiedSection[] = []

  function process(sections: UnifiedSection[]) {
    for (const section of sections) {
      flattened.push(section)
      if (section.drilldown?.sections) {
        process(section.drilldown.sections)
      }
      if (section.children) {
        process(section.children)
      }
    }
  }

  process(allSections)
  return flattened
}
