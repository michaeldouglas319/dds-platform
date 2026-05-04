/**
 * Resume Data Configuration
 * Based on Michael Douglas' LinkedIn Profile
 * Each section represents a professional role/job
 */

import type { ModelType } from '@/lib/config/models';

const pexel = (id: number) => 
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260`;
export interface JobSection {
  id: string;
  company: string;
  role: string;
  period: string;
  color: string;
  decal?: string;
  imageUrl?: string;
  modelType?: ModelType; // 3D model type for scene rendering (references modelTypes registry)
  modelPath?: string; // Optional override path (if different from modelTypes default)
  textureUrl?: string; // Optional override texture URL (if different from modelTypes default)
  position: [number, number, number];
  rotation?: [number, number, number];
  content: {
    heading: string;
    paragraphs: string[];
    highlights?: string[];
  };
}

export const resumeJobs: JobSection[] = [
  {
    id: 'tesla',
    company: 'Tesla',
    role: 'Software Engineer',
    period: 'Jan 2025 - Present',
    color: '#cc0000', // Tesla red - RGB(204, 0, 0)
    imageUrl: pexel(1108090), // Technology/automotive image
    modelType: 'tesla', // Uses modelTypes['tesla'] - Tesla logo GLB model
    position: [0, 3, 0],
    rotation: [0, 0, 0],
    content: {
      heading: 'Software Engineer',
      paragraphs: [
        'Experienced in full-stack full life cycle development for performative, in-house applications, owning several applications in their entirety while supporting several others.',
        'Expertise spans multiple database technologies including MySQL, PostgreSQL, MSSQL, ClickHouse, and MongoDB. Deeply familiar with agent and RAG (Retrieval-Augmented Generation) systems, contributing to the future of data preparation and retrieval through innovative UI/UX design and AI SDK integration.',
        'Previously served as Vision Engineering Technician II and Vision Engineering Technician, developing and maintaining cutting-edge vision systems for vehicle quality inspections using machine learning, high-resolution imaging, and various training platforms.'
      ],
      highlights: [
        'Front-end Development: TypeScript, React, Python',
        'Full-stack for performative native applications',
        'Owner of 2 complete applications, supporting multiple others',
        'Database Expertise: MySQL, PostgreSQL, MSSQL, ClickHouse, MongoDB',
        'Agent & RAG Systems: UI/UX design for data preparation & retrieval',
        'AI SDK integration & development'
      ]
    }
  },
  {
    id: 'tesla-vision',
    company: 'Tesla',
    role: 'Vision Engineering Technician',
    period: 'May 2023 - Jan 2025',
    color: '#cc0000', // Tesla red - RGB(204, 0, 0)
    imageUrl: pexel(3861968), // Vision/technology image
    modelType: 'tesla', // Uses modelTypes['tesla'] - Tesla logo GLB model
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    content: {
      heading: 'Vision Engineering Technician',
      paragraphs: [
        'Developed and maintained cutting-edge vision systems for vehicle quality inspections, utilizing machine learning, high-resolution imaging and various training platforms.',
        'Created custom solutions to manipulate datasets in bulk, reducing process times by 95%, and another application to generate complex data-queries resulting in improved efficiency for various skill levels.',
        'Owner of numerous high-value inspections and enhanced over a dozen legacy projects, significantly increasing product longevity. Recognized across quality and process departments for rapid and high-quality delivery.',
        'Validated implementation of Python and various machine learning techniques, with a passion for advancing computer vision capabilities.',
        'Managed end-to-end project processes, from feasibility studies to hardware installation, model building, efficacy testing, and launch.'
      ],
      highlights: [
        '95% reduction in process times through automation',
        'Owner of high-value inspection systems',
        'Enhanced 12+ legacy projects',
        'Python, Machine Learning, Computer Vision'
      ]
    }
  },
  {
    id: 'renewed-vision',
    company: 'Renewed Vision Cddc',
    role: 'Business Process Analyst',
    period: 'Jan 2023 - Apr 2023',
    color: '#6366f1',
    imageUrl: pexel(3184436), // Business/process image
    modelType: 'renewed-vision', // Uses modelTypes['renewed-vision'] - Renewed Vision logo texture
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    content: {
      heading: 'Business Process Analyst',
      paragraphs: [
        'Responsible for designing, implementing, and optimizing business processes across multiple departments. This included automating HR processes, managing documentation, and refining workflows to improve overall efficiency and productivity.',
        'Played a key role in managing and maintaining the company\'s IT infrastructure, including hardware and software systems.',
        'Developed strong skills in project management, process optimization, and IT support, with a focus on utilizing technology to drive organizational success.'
      ],
      highlights: [
        'Process automation & optimization',
        'IT infrastructure management',
        'Microsoft Power Apps, Power Automate',
        'Project management expertise'
      ]
    }
  },
  {
    id: 'skyline',
    company: 'Skyline Products, Inc.',
    role: 'Test Technician',
    period: 'Feb 2022 - Jan 2023',
    color: '#10b981',
    imageUrl: '/images/resume/skyline-products.png', // Skyline Products transportation signs
    modelType: 'skyline', // Uses modelTypes['skyline'] - Skyline Products logo texture
    position: [1.2, -5, 0],
    rotation: [0, 0, 0],
    content: {
      heading: 'Test Technician',
      paragraphs: [
        'Conducted comprehensive testing and analysis of both entire products and specific components, ensuring the highest standards of quality and functionality.',
        'Demonstrated proficiency in comprehending electrical schematics, enabling efficient identification and resolution of technical problems. Employed a methodical approach to troubleshoot issues to their root cause, significantly reducing downtime and improving product reliability.',
        'Compiled detailed reports on test findings, which were critical in informing supervisors and company executives about product performance and areas for improvement.',
        'Applied a strong foundation in scientific and engineering principles, utilizing an array of machines and software programs to conduct tests and analyze results.'
      ],
      highlights: [
        'Electrical schematic interpretation',
        'Component-level troubleshooting',
        'Test equipment & feasibility studies',
        'Data analysis & reporting'
      ]
    }
  },
  {
    id: 'lapp',
    company: 'LAPP International',
    role: 'Engineering & Procurement',
    period: 'Dec 2017 - Sep 2021',
    color: '#f59e0b',
    imageUrl: pexel(3184431), // Engineering/manufacturing image
    modelType: 'neural-network', // Uses modelTypes['neural-network'] - Neural network component
    position: [1.2, -7.5, 0],
    rotation: [0, 0, 0],
    content: {
      heading: 'Engineering & Procurement',
      paragraphs: [
        'Developed various predictive algorithms utilizing object recognition for motion planning.',
        'Created a lucrative replacement for a digital control device. Sourced components and developed various supply networks within China.',
        'Managed procurement planning and sourcing operations, establishing international supply chain relationships.'
      ],
      highlights: [
        'Predictive algorithms & object recognition',
        'Supply chain management',
        'International sourcing (China)',
        'C#, Sourcing, Procurement'
      ]
    }
  },
  {
    id: 'global-call',
    company: 'Global Call Solutions',
    role: 'Floor Support Supervisor',
    period: 'Feb 2017 - Dec 2018',
    color: '#8b5cf6',
    imageUrl: pexel(3184436), // Support/operations image
    modelType: 'gcs', // Uses modelTypes['gcs'] - GCS logo texture
    position: [1.2, -10, 0],
    rotation: [0, 0, 0],
    content: {
      heading: 'Floor Support Supervisor & Sales',
      paragraphs: [
        'Created a new order entry tool to streamline operations and improve efficiency.',
        'Trained new representatives and actively participated in transitioning the office through management changes.',
        'Developed skills in data monitoring, process improvement, and team leadership.'
      ],
      highlights: [
        'Order entry tool development',
        'Team training & management',
        'C# development',
        'Data monitoring & analysis'
      ]
    }
  }
];
