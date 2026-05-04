/**
 * Sunny Patel Three.js Portfolio Configuration
 * Converted to DDS (Declarative Design System) Format
 *
 * Structure:
 * - resumeJobsPatel: Professional experience timeline
 * - educationEntriesPatel: Educational background
 * - skillCategoriesPatel: Skill categories with items
 * - portfolioProjectsPatel: Featured projects with descriptions
 *
 * Each section includes 3D model configuration for immersive visualization
 */

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Job/Experience Section Interface
 * Extends base content structure with employment-specific fields
 */
export interface JobSection {
  id: string;
  company: string;
  role: string;
  period: string;
  location?: string;
  color: string;
  imageUrl?: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  modelConfig?: ModelConfig;
  codeFile?: string; // Path to canvas scene component
  content: {
    heading: string;
    paragraphs: string[];
    highlights?: string[];
    technologies?: string[];
  };
}

/**
 * Education Entry Interface
 * Structure for educational background
 */
export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  field: string;
  period: string;
  color: string;
  imageUrl?: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  modelConfig?: ModelConfig;
  content: {
    heading: string;
    paragraphs?: string[];
    highlights?: string[];
  };
}

/**
 * Skill Category Interface
 * Organizes skills into categories
 */
export interface SkillCategory {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  items: string[];
  modelConfig?: ModelConfig;
}

/**
 * Project Entry Interface
 * Configuration for portfolio projects
 */
export interface ProjectEntry {
  id: string;
  title: string;
  category: string;
  description: string;
  role: string;
  period?: string;
  color: string;
  imageUrl?: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  modelConfig?: ModelConfig;
  codeFile?: string;
  links?: {
    github?: string;
    live?: string;
    demo?: string;
  };
  content: {
    heading: string;
    paragraphs: string[];
    highlights?: string[];
    technologies?: string[];
  };
}

/**
 * 3D Model Configuration
 * Defines behavior and appearance of 3D models in scenes
 */
export interface ModelConfig {
  path?: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  animation?: {
    type: 'rotate' | 'float' | 'pulse' | 'none';
    speed?: number;
    amplitude?: number;
  };
  models?: Array<{
    path: string;
    scale?: number;
    position?: [number, number, number];
    rotation?: [number, number, number];
    animation?: { type: 'rotate' | 'float' | 'pulse'; speed: number; amplitude: number };
    key: string;
  }>;
  sceneMode?: 'single' | 'multiple' | 'canvas';
  fallback?: {
    trigger?: 'webgl-unsupported' | 'model-load-fail' | 'low-memory';
    type?: '2d-image' | 'simple-geometry';
    imageUrl?: string;
    color?: string;
  };
  preload?: boolean;
}

// ============================================================================
// IMAGE URL HELPER
// ============================================================================

const pexel = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260`;

// ============================================================================
// PROFESSIONAL EXPERIENCE - JOBS
// ============================================================================

export const resumeJobsPatel: JobSection[] = [
  {
    id: 'ibm-intern',
    company: 'IBM',
    role: 'Software Engineer Intern',
    period: 'Jan 2024 - Present',
    location: 'Toronto, ON',
    color: '#0f62fe', // IBM Blue
    imageUrl: pexel(3183150), // Technology workplace
    position: [0, 3, 0],
    rotation: [0, 0, 0],
    modelConfig: {
      path: '/models/portfolio/ibm-logo.glb',
      scale: 1.2,
      animation: {
        type: 'rotate',
        speed: 2,
        amplitude: 0.3,
      },
      fallback: {
        trigger: 'model-load-fail',
        type: 'simple-geometry',
        color: '#0f62fe',
      },
    },
    content: {
      heading: 'Software Engineer Intern',
      paragraphs: [
        'Contributing to cloud infrastructure and enterprise software solutions at one of the world\'s leading technology companies.',
        'Working on scalable backend services, API development, and cloud-based applications.',
        'Collaborating with senior engineers to design and implement production-quality code.',
        'Participating in code reviews, architecture discussions, and cross-functional team initiatives.',
      ],
      highlights: [
        'Enterprise software development',
        'Cloud infrastructure & APIs',
        'Scalable backend services',
        'Production-grade code quality',
        'Cross-functional collaboration',
      ],
      technologies: ['Java', 'Node.js', 'REST APIs', 'Docker', 'Kubernetes', 'PostgreSQL'],
    },
  },
  {
    id: 'wonderland-tech',
    company: "Canada's Wonderland",
    role: 'IT Technician',
    period: 'May 2023 - Dec 2023',
    location: 'Vaughan, ON',
    color: '#ff6b35', // Wonderland Orange
    imageUrl: pexel(2559827), // Recreation/theme park
    position: [0, 1.2, 0],
    rotation: [0, 0, 0],
    modelConfig: {
      path: '/models/portfolio/wonderland-icon.glb',
      scale: 0.9,
      animation: {
        type: 'float',
        speed: 1.5,
        amplitude: 0.2,
      },
      fallback: {
        trigger: 'model-load-fail',
        type: 'simple-geometry',
        color: '#ff6b35',
      },
    },
    content: {
      heading: 'IT Technician',
      paragraphs: [
        'Managed IT infrastructure and support services for a major theme park attraction.',
        'Provided technical support to park staff and maintained critical systems.',
        'Troubleshot hardware and software issues in a fast-paced operational environment.',
        'Ensured uptime of point-of-sale systems, ticketing, and guest-facing applications.',
      ],
      highlights: [
        'System administration & troubleshooting',
        'Point-of-sale system maintenance',
        'Ticketing system support',
        'Hardware diagnostics',
        'Fast-paced operational support',
      ],
      technologies: ['Windows Server', 'Active Directory', 'Network Troubleshooting', 'POS Systems'],
    },
  },
  {
    id: 'mackenzie-health',
    company: 'Mackenzie Health System',
    role: 'System Support Technician',
    period: 'Jan 2023 - Apr 2023',
    location: 'Richmond Hill, ON',
    color: '#00a86b', // Healthcare Green
    imageUrl: pexel(3825517), // Healthcare/medical
    position: [0, -0.6, 0],
    rotation: [0, 0, 0],
    modelConfig: {
      path: '/models/portfolio/healthcare-icon.glb',
      scale: 1,
      animation: {
        type: 'pulse',
        speed: 2,
        amplitude: 0.15,
      },
      fallback: {
        trigger: 'model-load-fail',
        type: 'simple-geometry',
        color: '#00a86b',
      },
    },
    content: {
      heading: 'System Support Technician',
      paragraphs: [
        'Provided technical support and system administration for a major healthcare facility.',
        'Managed electronic health record (EHR) systems and medical IT infrastructure.',
        'Resolved critical issues to ensure patient care continuity.',
        'Documented incidents and implemented preventative maintenance procedures.',
      ],
      highlights: [
        'EHR system support',
        'Healthcare IT infrastructure',
        'Critical incident resolution',
        'Preventative maintenance',
        'HIPAA compliance awareness',
      ],
      technologies: ['EHR Systems', 'Windows Server', 'Network Administration', 'HIPAA Compliance'],
    },
  },
  {
    id: 'staples-sales',
    company: 'Staples Canada',
    role: 'Sales Associate & IT Support',
    period: 'Jun 2021 - Dec 2022',
    location: 'Richmond Hill, ON',
    color: '#d32f2f', // Staples Red
    imageUrl: pexel(3807517), // Retail environment
    position: [0, -2.4, 0],
    rotation: [0, 0, 0],
    modelConfig: {
      path: '/models/portfolio/staples-icon.glb',
      scale: 0.8,
      animation: {
        type: 'rotate',
        speed: 1,
        amplitude: 0.25,
      },
      fallback: {
        trigger: 'model-load-fail',
        type: 'simple-geometry',
        color: '#d32f2f',
      },
    },
    content: {
      heading: 'Sales Associate & IT Support',
      paragraphs: [
        'Provided customer service and technical support in a retail environment.',
        'Assisted customers with IT products, peripherals, and solutions.',
        'Maintained POS systems and inventory management software.',
        'Resolved customer inquiries and processed transactions efficiently.',
      ],
      highlights: [
        'Customer service & support',
        'IT product consultation',
        'POS system operation',
        'Inventory management',
        'Sales performance',
      ],
      technologies: ['POS Systems', 'Inventory Software', 'Customer Service'],
    },
  },
];

// ============================================================================
// EDUCATION
// ============================================================================

export const educationEntriesPatel: EducationEntry[] = [
  {
    id: 'ontariotech-cs',
    institution: 'Ontario Tech University',
    degree: 'Bachelor of Science',
    field: 'Computer Science',
    period: '2022 - Present',
    color: '#1e40af', // Ontario Tech Blue
    imageUrl: pexel(3962285), // University campus
    position: [0, 1.5, 0],
    rotation: [0, 0, 0],
    modelConfig: {
      path: '/models/portfolio/ontariotech-logo.glb',
      scale: 1.1,
      animation: {
        type: 'float',
        speed: 1.2,
        amplitude: 0.2,
      },
      fallback: {
        trigger: 'model-load-fail',
        type: 'simple-geometry',
        color: '#1e40af',
      },
    },
    content: {
      heading: 'Bachelor of Science in Computer Science',
      paragraphs: [
        'Pursuing a comprehensive degree in Computer Science with focus on software engineering and systems design.',
        'Coursework includes algorithms, data structures, operating systems, databases, and software engineering.',
        'Active in coding competitions and technical projects.',
      ],
      highlights: [
        'Algorithm & Data Structures',
        'Software Engineering Principles',
        'Operating Systems',
        'Database Systems',
        'Competitive Programming',
      ],
    },
  },
  {
    id: 'richmond-hill-high',
    institution: 'Richmond Hill High School',
    degree: 'High School Diploma',
    field: 'Sciences & Mathematics',
    period: '2018 - 2022',
    color: '#7c2d12', // High School Brown
    imageUrl: pexel(3195664), // School building
    position: [0, -0.9, 0],
    rotation: [0, 0, 0],
    modelConfig: {
      path: '/models/portfolio/school-icon.glb',
      scale: 0.95,
      animation: {
        type: 'pulse',
        speed: 1.8,
        amplitude: 0.15,
      },
      fallback: {
        trigger: 'model-load-fail',
        type: 'simple-geometry',
        color: '#7c2d12',
      },
    },
    content: {
      heading: 'High School Diploma',
      paragraphs: [
        'Completed secondary education with strong performance in STEM subjects.',
        'Developed foundational knowledge in mathematics, computer science, and sciences.',
      ],
      highlights: [
        'Advanced Placement courses',
        'Mathematics & Sciences',
        'Computer Science Fundamentals',
      ],
    },
  },
];

// ============================================================================
// SKILLS BY CATEGORY
// ============================================================================

export const skillCategoriesPatel: SkillCategory[] = [
  {
    id: 'main-technologies',
    name: 'Main Technologies',
    icon: 'code',
    color: '#3b82f6',
    items: [
      'TypeScript',
      'JavaScript',
      'Python',
      'Java',
      'React',
      'Node.js',
      'Next.js',
      'Three.js',
      'REST APIs',
      'SQL',
      'Git',
      'Docker',
    ],
    modelConfig: {
      path: '/models/portfolio/tech-cube.glb',
      scale: 1.3,
      animation: {
        type: 'rotate',
        speed: 2.5,
        amplitude: 0.4,
      },
    },
  },
  {
    id: 'it-tools',
    name: 'IT & DevOps Tools',
    icon: 'server',
    color: '#8b5cf6',
    items: [
      'Linux Administration',
      'Windows Server',
      'Active Directory',
      'Kubernetes',
      'CI/CD Pipelines',
      'Cloud Platforms',
    ],
    modelConfig: {
      path: '/models/portfolio/server-icon.glb',
      scale: 1.1,
      animation: {
        type: 'float',
        speed: 1.5,
        amplitude: 0.2,
      },
    },
  },
  {
    id: 'cybersecurity',
    name: 'Cybersecurity & Compliance',
    icon: 'shield',
    color: '#ef4444',
    items: [
      'Network Security',
      'Penetration Testing',
      'HIPAA Compliance',
      'System Hardening',
    ],
    modelConfig: {
      path: '/models/portfolio/security-shield.glb',
      scale: 1,
      animation: {
        type: 'pulse',
        speed: 2,
        amplitude: 0.25,
      },
    },
  },
  {
    id: 'design',
    name: 'Design & 3D',
    icon: 'palette',
    color: '#ec4899',
    items: [
      'Three.js',
      'WebGL',
      'UI/UX Design',
    ],
    modelConfig: {
      path: '/models/portfolio/design-palette.glb',
      scale: 0.95,
      animation: {
        type: 'rotate',
        speed: 1.8,
        amplitude: 0.3,
      },
    },
  },
];

// ============================================================================
// PORTFOLIO PROJECTS
// ============================================================================

export const portfolioProjectsPatel: ProjectEntry[] = [
  {
    id: 'axelot-project',
    title: 'Axelot',
    category: 'Web Application',
    description: 'Collaborative writing platform with real-time synchronization',
    role: 'Full Stack Developer',
    period: '2023 - Present',
    color: '#667eea',
    imageUrl: pexel(3183150),
    position: [0, 2.5, 0],
    rotation: [0, 0, 0],
    modelConfig: {
      path: '/models/portfolio/axelot-model.glb',
      scale: 1.2,
      animation: {
        type: 'float',
        speed: 1.5,
        amplitude: 0.25,
      },
      fallback: {
        trigger: 'model-load-fail',
        type: 'simple-geometry',
        color: '#667eea',
      },
    },
    links: {
      github: 'https://github.com/sunnypatel',
      live: 'https://axelot.app',
    },
    content: {
      heading: 'Axelot - Collaborative Writing Platform',
      paragraphs: [
        'Full-stack web application designed for collaborative writing and document sharing.',
        'Features real-time synchronization using WebSockets, enabling multiple users to edit simultaneously.',
        'Built with React for the frontend and Node.js for the backend with a PostgreSQL database.',
        'Implemented user authentication, role-based access control, and document versioning.',
      ],
      highlights: [
        'Real-time collaborative editing',
        'WebSocket integration',
        'User authentication & RBAC',
        'Document versioning system',
        'Rich text editor integration',
      ],
      technologies: ['React', 'Node.js', 'PostgreSQL', 'WebSocket', 'TypeScript'],
    },
  },
  {
    id: 'netdash-project',
    title: 'Netdash',
    category: 'Network Tool',
    description: 'Comprehensive networking toolkit for IT professionals',
    role: 'Lead Developer',
    period: '2023',
    color: '#764ba2',
    imageUrl: pexel(3183436),
    position: [0, 0.8, 0],
    rotation: [0, 0, 0],
    modelConfig: {
      path: '/models/portfolio/netdash-model.glb',
      scale: 1.15,
      animation: {
        type: 'rotate',
        speed: 2,
        amplitude: 0.3,
      },
      fallback: {
        trigger: 'model-load-fail',
        type: 'simple-geometry',
        color: '#764ba2',
      },
    },
    links: {
      github: 'https://github.com/sunnypatel/netdash',
    },
    content: {
      heading: 'Netdash - Network Toolbox',
      paragraphs: [
        'Comprehensive command-line and GUI toolkit for network troubleshooting and analysis.',
        'Provides utilities for ping, traceroute, DNS lookup, port scanning, and network monitoring.',
        'Cross-platform support for Windows, macOS, and Linux.',
        'Built with Python backend and modern web frontend for accessibility.',
      ],
      highlights: [
        'Multi-platform support',
        'Network diagnostics',
        'Port scanning & analysis',
        'Real-time monitoring',
        'Command-line & GUI interfaces',
      ],
      technologies: ['Python', 'React', 'Node.js', 'Socket programming', 'Electron'],
    },
  },
  {
    id: 'securebank-project',
    title: 'SecureBank',
    category: 'Security Training',
    description: 'Capture-the-Flag (CTF) security training platform',
    role: 'Security Engineer',
    period: '2022 - 2023',
    color: '#f093fb',
    imageUrl: pexel(3557067),
    position: [0, -0.9, 0],
    rotation: [0, 0, 0],
    modelConfig: {
      path: '/models/portfolio/securebank-model.glb',
      scale: 1.05,
      animation: {
        type: 'pulse',
        speed: 2.2,
        amplitude: 0.2,
      },
      fallback: {
        trigger: 'model-load-fail',
        type: 'simple-geometry',
        color: '#f093fb',
      },
    },
    links: {
      github: 'https://github.com/sunnypatel/securebank',
    },
    content: {
      heading: 'SecureBank - CTF Training Platform',
      paragraphs: [
        'Interactive platform for learning and practicing cybersecurity skills through Capture-the-Flag challenges.',
        'Includes vulnerable applications designed to teach web security, cryptography, and system hardening.',
        'Provides hints, write-ups, and progressive difficulty levels for learners.',
        'Used for security awareness training in corporate environments.',
      ],
      highlights: [
        'CTF challenge system',
        'Vulnerable application lab',
        'Progress tracking',
        'Educational resources',
        'Security best practices',
      ],
      technologies: ['Python', 'Node.js', 'Docker', 'Linux', 'Web Security'],
    },
  },
  {
    id: 'sunnify-project',
    title: 'Sunnify',
    category: 'Utility Application',
    description: 'Spotify music downloader with playlist management',
    role: 'Full Stack Developer',
    period: '2022',
    color: '#1db954',
    imageUrl: pexel(3407650),
    position: [0, -2.6, 0],
    rotation: [0, 0, 0],
    modelConfig: {
      path: '/models/portfolio/sunnify-model.glb',
      scale: 1,
      animation: {
        type: 'float',
        speed: 1.8,
        amplitude: 0.25,
      },
      fallback: {
        trigger: 'model-load-fail',
        type: 'simple-geometry',
        color: '#1db954',
      },
    },
    links: {
      github: 'https://github.com/sunnypatel/sunnify',
    },
    content: {
      heading: 'Sunnify - Spotify Downloader',
      paragraphs: [
        'Desktop application for downloading and managing Spotify playlists.',
        'Integrates with Spotify API for seamless playlist import and metadata management.',
        'Supports batch downloads and format conversion.',
        'Cross-platform Electron application with intuitive UI.',
      ],
      highlights: [
        'Spotify API integration',
        'Batch download support',
        'Playlist management',
        'Format conversion',
        'User-friendly interface',
      ],
      technologies: ['Electron', 'React', 'Python', 'Spotify API', 'TypeScript'],
    },
  },
  {
    id: 'financialflow-project',
    title: 'FinancialFlow',
    category: 'Finance Dashboard',
    description: 'Personal finance tracking and analysis platform',
    role: 'Full Stack Developer',
    period: '2022',
    color: '#00d084',
    imageUrl: pexel(3531173),
    position: [0, 1.5, 0],
    rotation: [0, 0, 0],
    modelConfig: {
      path: '/models/portfolio/finance-model.glb',
      scale: 1.1,
      animation: {
        type: 'rotate',
        speed: 1.5,
        amplitude: 0.2,
      },
      fallback: {
        trigger: 'model-load-fail',
        type: 'simple-geometry',
        color: '#00d084',
      },
    },
    links: {
      github: 'https://github.com/sunnypatel/financialflow',
    },
    content: {
      heading: 'FinancialFlow - Finance Tracking Platform',
      paragraphs: [
        'Comprehensive personal finance management application with advanced analytics.',
        'Features transaction tracking, budget planning, and investment portfolio monitoring.',
        'Provides visualizations and insights for financial planning decisions.',
        'Built with React frontend and Node.js/Express backend with MongoDB.',
      ],
      highlights: [
        'Transaction tracking',
        'Budget management',
        'Investment tracking',
        'Financial analytics',
        'Data visualization',
      ],
      technologies: ['React', 'Node.js', 'MongoDB', 'Chart.js', 'TypeScript'],
    },
  },
  {
    id: 'knifethrow-project',
    title: 'KnifeThrow',
    category: 'Game Development',
    description: 'Retro-style arcade knife throwing game',
    role: 'Game Developer',
    period: '2021 - 2022',
    color: '#ff6b6b',
    imageUrl: pexel(3318609),
    position: [0, -0.5, 0],
    rotation: [0, 0, 0],
    modelConfig: {
      path: '/models/portfolio/game-model.glb',
      scale: 1.15,
      animation: {
        type: 'rotate',
        speed: 2.5,
        amplitude: 0.35,
      },
      fallback: {
        trigger: 'model-load-fail',
        type: 'simple-geometry',
        color: '#ff6b6b',
      },
    },
    links: {
      github: 'https://github.com/sunnypatel/knifethrow',
      live: 'https://knifethrow.game',
    },
    content: {
      heading: 'KnifeThrow - Arcade Game',
      paragraphs: [
        'Addictive arcade-style game built with Three.js and WebGL for smooth 3D rendering.',
        'Features progressive difficulty, power-ups, and a scoring system.',
        'Implemented physics engine for realistic knife trajectory and collision detection.',
        'Deployed as web-based game with leaderboard functionality.',
      ],
      highlights: [
        'Three.js 3D rendering',
        'Physics simulation',
        'Progressive difficulty',
        'Leaderboard system',
        'Mobile responsive design',
      ],
      technologies: ['Three.js', 'WebGL', 'JavaScript', 'Physics Engine', 'Canvas API'],
    },
  },
];

// ============================================================================
// HERO SECTION 3D MODELS
// ============================================================================

/**
 * Global 3D Model Configuration for Portfolio Hero Sections
 * These are shared across all sections for consistent visual experience
 */
export const portfolioHeroModels = {
  heroPc: {
    path: '/models/portfolio/hero-pc.glb',
    scale: 2,
    position: [0, 0, 0] as [number, number, number],
    animation: {
      type: 'float' as const,
      speed: 0.8,
      amplitude: 0.3,
    },
  },
  earth: {
    path: '/models/portfolio/earth.glb',
    scale: 1.5,
    position: [0, 0, 0] as [number, number, number],
    animation: {
      type: 'rotate' as const,
      speed: 0.5,
      amplitude: 0,
    },
  },
  starfield: {
    path: '/models/portfolio/starfield.glb',
    scale: 10,
    position: [0, 0, -5] as [number, number, number],
    animation: {
      type: 'none' as const,
    },
  },
};

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * All exports are named for easy consumption in component registry
 */
export default {
  resumeJobsPatel,
  educationEntriesPatel,
  skillCategoriesPatel,
  portfolioProjectsPatel,
  portfolioHeroModels,
};
