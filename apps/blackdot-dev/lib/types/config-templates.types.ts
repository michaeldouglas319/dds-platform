/**
 * Config Template Metadata Types
 *
 * Defines standard template patterns for configs to enable:
 * - Automatic UI rendering based on template type
 * - Validation of config structure
 * - Type-safe config consumption
 */

// Template type definitions
export const CONFIG_TEMPLATES = {
  // Content templates
  'job-sections': {
    name: 'Job Sections',
    description: 'Array of job/role sections with company, period, content',
    category: 'content',
    expectedStructure: {
      id: 'string',
      company: 'string',
      role: 'string',
      period: 'string',
      color: 'string',
      content: {
        heading: 'string',
        paragraphs: 'string[]',
        highlights: 'string[]?',
      },
      position: '[number, number, number]?',
      rotation: '[number, number, number]?',
      modelType: 'string?',
    },
  },
  'pitch-deck-sections': {
    name: 'Pitch Deck Sections',
    description: 'Array of pitch deck sections with heading, content, highlights',
    category: 'content',
    expectedStructure: {
      id: 'string',
      title: 'string',
      subtitle: 'string?',
      color: 'string',
      content: {
        heading: 'string',
        paragraphs: 'string[]',
        highlights: 'string[]?',
      },
    },
  },
  'model-registry': {
    name: 'Model Registry',
    description: 'Registry of 3D models with paths, textures, and metadata',
    category: 'models',
    expectedStructure: {
      id: 'string',
      name: 'string',
      path: 'string',
      textureUrl: 'string?',
      scale: 'number?',
      position: '[number, number, number]?',
      rotation: '[number, number, number]?',
    },
  },
  'design-tokens': {
    name: 'Design Tokens',
    description: 'Design system tokens (colors, spacing, typography)',
    category: 'design',
    expectedStructure: {
      colors: 'object',
      spacing: 'object',
      typography: 'object',
      breakpoints: 'object?',
    },
  },
  'navigation-config': {
    name: 'Navigation Configuration',
    description: 'Navigation routes and menu structure',
    category: 'navigation',
    expectedStructure: {
      routes: 'array',
      menuItems: 'array',
      metadata: 'object?',
    },
  },
  'annotation-data': {
    name: 'Annotation Data',
    description: 'Annotations for sections, features, or components',
    category: 'annotations',
    expectedStructure: {
      id: 'string',
      sectionId: 'string',
      title: 'string',
      description: 'string',
      position: 'object?',
    },
  },
  'expertise-data': {
    name: 'Expertise Data',
    description: 'Expertise areas, skills, and competencies',
    category: 'expertise',
    expectedStructure: {
      id: 'string',
      name: 'string',
      description: 'string',
      level: 'string?',
      categories: 'string[]?',
    },
  },
  'particle-config': {
    name: 'Particle Configuration',
    description: 'Particle system configuration (colors, physics, behavior)',
    category: 'particles',
    expectedStructure: {
      count: 'number',
      colors: 'array',
      physics: 'object',
      behavior: 'object',
    },
  },
} as const;

export type TemplateType = keyof typeof CONFIG_TEMPLATES;

export interface ConfigTemplateMetadata {
  templateType: TemplateType;
  version?: string;
  schemaVersion?: number;
  customFields?: Record<string, any>;
}

/**
 * Template tag format: "template:{templateType}"
 * Example: "template:job-sections"
 */
export function getTemplateTag(templateType: TemplateType): string {
  return `template:${templateType}`;
}

/**
 * Extract template type from tags array
 */
export function extractTemplateType(tags: string[]): TemplateType | null {
  const templateTag = tags.find(tag => tag.startsWith('template:'));
  if (!templateTag) return null;

  const type = templateTag.replace('template:', '') as TemplateType;
  return type in CONFIG_TEMPLATES ? type : null;
}

/**
 * Get template metadata from template type
 */
export function getTemplateMetadata(templateType: TemplateType) {
  return CONFIG_TEMPLATES[templateType];
}

/**
 * Check if config matches expected template structure (basic validation)
 */
export function validateTemplateStructure(
  data: any,
  templateType: TemplateType
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const template = CONFIG_TEMPLATES[templateType];

  if (!template) {
    errors.push(`Unknown template type: ${templateType}`);
    return { valid: false, errors };
  }

  // Basic validation - check if data is array for content templates
  if (template.category === 'content') {
    if (!Array.isArray(data)) {
      errors.push(`Expected array for ${templateType}, got ${typeof data}`);
      return { valid: false, errors };
    }

    if (data.length === 0) {
      errors.push(`Empty array for ${templateType}`);
      return { valid: false, errors };
    }

    // Check first item has required fields
    const firstItem = data[0];
    const structure = template.expectedStructure;

    for (const [key, typeDesc] of Object.entries(structure)) {
      const typeStr = typeof typeDesc === 'string' ? typeDesc : String(typeDesc);
      if (typeStr.endsWith('?')) continue; // Optional field

      if (!(key in firstItem)) {
        errors.push(`Missing required field '${key}' in ${templateType} items`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Template type to recommended config key mapping
 */
export const TEMPLATE_RECOMMENDED_KEYS: Record<TemplateType, string[]> = {
  'job-sections': ['content.resume', 'content.career', 'content.experience'],
  'pitch-deck-sections': ['content.business', 'content.ideas', 'content.pitch'],
  'model-registry': ['models.shared', 'models.resume', 'models.scene'],
  'design-tokens': ['design.tokens', 'design.theme'],
  'navigation-config': ['navigation.config', 'navigation.routes'],
  'annotation-data': ['annotations.business', 'annotations.ideas'],
  'expertise-data': ['expertise.faa', 'expertise.composites'],
  'particle-config': ['particles.config', 'particles.system'],
};

/**
 * Get recommended namespaces for template type
 */
export function getRecommendedNamespace(templateType: TemplateType): string {
  const template = CONFIG_TEMPLATES[templateType];
  return template.category;
}
