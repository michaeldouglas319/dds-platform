#!/usr/bin/env node

/**
 * Component Registry Generator
 *
 * Scans the codebase to auto-discover and catalog all components.
 * Generates /lib/registry/components.json with complete metadata.
 *
 * Usage:
 *   npx ts-node scripts/generate-registry.ts
 *   npm run generate-registry
 *
 * Features:
 * - Auto-discovers components by scanning directories
 * - Extracts JSDoc metadata and TypeScript exports
 * - Detects 3D component subcategories (lighting, camera, etc.)
 * - Generates searchable JSON registry
 * - Validates component exports
 * - Calculates component statistics
 */

import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';
import { fileURLToPath } from 'url';

// Handle ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type ThreeDSubcategory =
  | 'lighting'
  | 'camera'
  | 'materials'
  | 'animations'
  | 'physics'
  | 'interactions'
  | 'effects'
  | 'optimization';

type ComponentCategory = 'ui' | 'composite' | 'layout' | 'scene' | 'model' | 'hook' | 'utility';
type ArchitectureLayer = 1 | 2 | 3;

interface ComponentExport {
  name: string;
  isComponent: boolean;
  isHook: boolean;
  type: 'named' | 'default' | 'namespace';
  typeDefinition?: string;
}

interface ComponentDependency {
  name: string;
  isInternal: boolean;
  internalPath?: string;
}

interface ComponentMetadata {
  id: string;
  name: string;
  path: string;
  category: ComponentCategory;
  layer?: ArchitectureLayer;
  subcategory?: ThreeDSubcategory;
  description?: string;
  documentation?: string;
  tags?: string[];
  exports: ComponentExport[];
  dependencies?: ComponentDependency[];
  deprecated?: boolean;
  deprecationMessage?: string;
  docLink?: string;
}

interface ComponentRegistry {
  version: string;
  generatedAt: string;
  totalComponents: number;
  byCategory: Record<ComponentCategory, ComponentMetadata[]>;
  byId: Record<string, ComponentMetadata>;
  stats: {
    countByCategory: Record<ComponentCategory, number>;
    countByLayer: Record<ArchitectureLayer | 'none', number>;
    countBySubcategory: Record<ThreeDSubcategory, number>;
    averageBundleSize?: number;
    commonDependencies: Array<{ name: string; count: number }>;
  };
}

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, '..');
const COMPONENTS_DIR = path.join(PROJECT_ROOT, 'components');
const LIB_DIR = path.join(PROJECT_ROOT, 'lib');
const HOOKS_DIR = path.join(PROJECT_ROOT, 'hooks');
const OUTPUT_FILE = path.join(PROJECT_ROOT, 'public', 'registry', 'components.json');
const OUTPUT_DIR = path.dirname(OUTPUT_FILE);

const DIRECTORIES_TO_SCAN = [
  { path: path.join(COMPONENTS_DIR, 'ui'), category: 'ui' as ComponentCategory, layer: 1 as ArchitectureLayer },
  { path: path.join(COMPONENTS_DIR, 'primitives'), category: 'composite' as ComponentCategory, layer: 2 as ArchitectureLayer },
  { path: path.join(COMPONENTS_DIR, 'PitchDeck'), category: 'composite' as ComponentCategory, layer: 2 as ArchitectureLayer },
  { path: path.join(COMPONENTS_DIR, 'sections'), category: 'composite' as ComponentCategory, layer: 2 as ArchitectureLayer },
  { path: path.join(COMPONENTS_DIR, 'dashboard'), category: 'composite' as ComponentCategory, layer: 2 as ArchitectureLayer },
  { path: path.join(COMPONENTS_DIR, 'editor'), category: 'composite' as ComponentCategory, layer: 2 as ArchitectureLayer },
  { path: path.join(COMPONENTS_DIR, '3d-dashboard'), category: 'composite' as ComponentCategory, layer: 2 as ArchitectureLayer },
  { path: path.join(COMPONENTS_DIR, 'layouts'), category: 'layout' as ComponentCategory, layer: 3 as ArchitectureLayer },
  { path: path.join(COMPONENTS_DIR, 'layout'), category: 'layout' as ComponentCategory, layer: 3 as ArchitectureLayer },
  { path: path.join(COMPONENTS_DIR, 'resume'), category: 'composite' as ComponentCategory, layer: 2 as ArchitectureLayer },
  { path: path.join(LIB_DIR, 'scenes', 'models'), category: 'model' as ComponentCategory },
  { path: path.join(LIB_DIR, 'threejs'), category: 'scene' as ComponentCategory },
  { path: path.join(HOOKS_DIR), category: 'hook' as ComponentCategory },
];

/**
 * Extract JSDoc metadata from file content
 */
function extractJSDocMetadata(content: string): {
  description: string;
  tags: Record<string, string>;
  deprecated?: boolean;
  category?: ComponentCategory;
  layer?: ArchitectureLayer;
  subcategory?: ThreeDSubcategory;
} {
  const jsdocRegex = /\/\*\*\s*([\s\S]*?)\*\//;
  const match = content.match(jsdocRegex);

  if (!match) {
    return { description: '', tags: {} };
  }

  const jsdoc = match[1];
  const lines = jsdoc.split('\n').map(line => line.replace(/^\s*\*\s?/, ''));

  let description = '';
  let inDescription = true;
  const tags: Record<string, string> = {};
  let deprecated = false;
  let category: ComponentCategory | undefined;
  let layer: ArchitectureLayer | undefined;
  let subcategory: ThreeDSubcategory | undefined;

  for (const line of lines) {
    if (line.startsWith('@')) {
      inDescription = false;
      const [tagName, ...rest] = line.slice(1).split(/\s+/);
      const tagValue = rest.join(' ');

      if (tagName === 'deprecated') {
        deprecated = true;
        tags.deprecated = tagValue || 'true';
      } else if (tagName === 'category') {
        category = tagValue as ComponentCategory;
        tags.category = tagValue;
      } else if (tagName === 'layer') {
        layer = parseInt(tagValue) as ArchitectureLayer;
        tags.layer = tagValue;
      } else if (tagName === 'subcategory') {
        subcategory = tagValue as ThreeDSubcategory;
        tags.subcategory = tagValue;
      } else {
        tags[tagName] = tagValue;
      }
    } else if (inDescription && line.trim()) {
      description += (description ? ' ' : '') + line.trim();
    }
  }

  return { description, tags, deprecated, category, layer, subcategory };
}

/**
 * Detect 3D subcategory from import statements and patterns
 */
function detect3DSubcategory(content: string, fileName: string): ThreeDSubcategory | undefined {
  const lowerContent = content.toLowerCase();
  const lowerFileName = fileName.toLowerCase();

  // Lighting detection
  if (
    lowerContent.includes('directionallight') ||
    lowerContent.includes('ambientlight') ||
    lowerContent.includes('pointlight') ||
    lowerFileName.includes('light')
  ) {
    return 'lighting';
  }

  // Camera detection
  if (
    lowerContent.includes('perspectivecamera') ||
    lowerContent.includes('orthographiccamera') ||
    lowerFileName.includes('camera')
  ) {
    return 'camera';
  }

  // Materials detection
  if (
    lowerContent.includes('material') ||
    lowerContent.includes('shader') ||
    lowerFileName.includes('material')
  ) {
    return 'materials';
  }

  // Animations detection
  if (
    lowerContent.includes('useframe') ||
    lowerContent.includes('@react-three/fiber') ||
    lowerContent.includes('animation') ||
    lowerFileName.includes('animation')
  ) {
    return 'animations';
  }

  // Physics detection
  if (
    lowerContent.includes('fluid') ||
    lowerContent.includes('physics') ||
    lowerContent.includes('solver') ||
    lowerFileName.includes('physics') ||
    lowerFileName.includes('fluid')
  ) {
    return 'physics';
  }

  // Interactions detection
  if (
    lowerContent.includes('onclick') ||
    lowerContent.includes('onpointer') ||
    lowerContent.includes('annotation') ||
    lowerContent.includes('interactive') ||
    lowerFileName.includes('interaction')
  ) {
    return 'interactions';
  }

  // Effects detection
  if (
    lowerContent.includes('effect') ||
    lowerContent.includes('bloom') ||
    lowerContent.includes('postprocessing') ||
    lowerFileName.includes('effect')
  ) {
    return 'effects';
  }

  // Optimization detection
  if (
    lowerContent.includes('dispose') ||
    lowerContent.includes('memory') ||
    lowerContent.includes('performance') ||
    lowerContent.includes('optimization') ||
    lowerFileName.includes('dispose') ||
    lowerFileName.includes('optimization')
  ) {
    return 'optimization';
  }

  return undefined;
}

/**
 * Extract TypeScript exports from file
 */
function extractExports(content: string): ComponentExport[] {
  const exports: ComponentExport[] = [];

  // Named exports pattern
  const namedExportRegex = /export\s+(?:async\s+)?(?:function|const|class|interface|type)\s+(\w+)/g;
  let match;

  while ((match = namedExportRegex.exec(content)) !== null) {
    const name = match[1];
    const isComponent = /^[A-Z]/.test(name) && !name.includes('_');
    const isHook = name.startsWith('use') && /^use[A-Z]/.test(name);

    exports.push({
      name,
      isComponent,
      isHook,
      type: 'named'
    });
  }

  // Default export
  if (/export\s+default/.test(content)) {
    const defaultMatch = content.match(/export\s+default\s+(?:function|const)\s+(\w+)/);
    if (defaultMatch) {
      const name = defaultMatch[1];
      exports.push({
        name,
        isComponent: /^[A-Z]/.test(name),
        isHook: name.startsWith('use'),
        type: 'default'
      });
    }
  }

  return exports;
}

/**
 * Extract dependencies from imports
 */
function extractDependencies(content: string, filePath: string): ComponentDependency[] {
  const dependencies: ComponentDependency[] = [];
  const importRegex = /import\s+(?:{[^}]*}|[\w,\s]*)\s+from\s+['"]([^'"]+)['"]/g;

  let match;
  const dirName = path.dirname(filePath);

  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    const isInternal = importPath.startsWith('.');

    if (isInternal) {
      const resolvedPath = path.resolve(dirName, importPath);
      const internalPath = path.relative(PROJECT_ROOT, resolvedPath);

      dependencies.push({
        name: importPath,
        isInternal: true,
        internalPath
      });
    } else {
      dependencies.push({
        name: importPath,
        isInternal: false
      });
    }
  }

  return dependencies;
}

/**
 * Scan a directory for component files
 */
async function scanDirectory(
  dirPath: string,
  category: ComponentCategory,
  layer?: ArchitectureLayer
): Promise<ComponentMetadata[]> {
  const components: ComponentMetadata[] = [];

  if (!fs.existsSync(dirPath)) {
    return components;
  }

  try {
    const files = await fsPromises.readdir(dirPath);

    for (const file of files) {
      if (!file.endsWith('.tsx') && !file.endsWith('.ts')) continue;
      if (file === 'index.ts' || file === 'index.tsx') continue;

      const filePath = path.join(dirPath, file);
      const content = await fsPromises.readFile(filePath, 'utf-8');
      const jsdoc = extractJSDocMetadata(content);
      const exports = extractExports(content);
      const dependencies = extractDependencies(content, filePath);

      if (exports.length === 0) continue;

      const id = path.basename(file, path.extname(file));
      const relativePath = path.relative(PROJECT_ROOT, filePath);

      // Detect 3D subcategory if applicable
      let subcategory: ThreeDSubcategory | undefined = jsdoc.subcategory;
      if (!subcategory && (category === 'scene' || category === 'model')) {
        subcategory = detect3DSubcategory(content, file);
      }

      const componentMeta: ComponentMetadata = {
        id,
        name: id.replace(/([A-Z])/g, ' $1').trim(),
        path: relativePath,
        category: jsdoc.category || category,
        layer: jsdoc.layer || layer,
        subcategory,
        description: jsdoc.description,
        tags: ['generated'], // Will be enhanced later
        exports,
        dependencies: dependencies.length > 0 ? dependencies : undefined,
        deprecated: jsdoc.deprecated,
        deprecationMessage: jsdoc.tags.deprecated
      };

      components.push(componentMeta);
    }
  } catch (error) {
    console.warn(`Warning scanning ${dirPath}:`, error);
  }

  return components;
}

/**
 * Build complete registry
 */
async function buildRegistry(): Promise<ComponentRegistry> {
  const allComponents: ComponentMetadata[] = [];

  console.log('🔍 Scanning component directories...');

  for (const dir of DIRECTORIES_TO_SCAN) {
    console.log(`  Scanning: ${dir.path}`);
    const components = await scanDirectory(dir.path, dir.category, dir.layer);
    allComponents.push(...components);
  }

  console.log(`✅ Found ${allComponents.length} components\n`);

  // Build indices
  const byCategory: Record<ComponentCategory, ComponentMetadata[]> = {
    ui: [],
    composite: [],
    layout: [],
    scene: [],
    model: [],
    hook: [],
    utility: []
  };

  const byId: Record<string, ComponentMetadata> = {};

  for (const component of allComponents) {
    byId[component.id] = component;
    // Ensure category exists in byCategory
    if (!byCategory[component.category]) {
      byCategory[component.category] = [];
    }
    byCategory[component.category].push(component);
  }

  // Sort each category by name
  Object.keys(byCategory).forEach(key => {
    (byCategory as any)[key].sort((a: any, b: any) => a.name.localeCompare(b.name));
  });

  // Calculate statistics
  const stats = {
    countByCategory: {
      ui: byCategory.ui.length,
      composite: byCategory.composite.length,
      layout: byCategory.layout.length,
      scene: byCategory.scene.length,
      model: byCategory.model.length,
      hook: byCategory.hook.length,
      utility: byCategory.utility.length
    },
    countByLayer: {
      1: allComponents.filter(c => c.layer === 1).length,
      2: allComponents.filter(c => c.layer === 2).length,
      3: allComponents.filter(c => c.layer === 3).length,
      none: allComponents.filter(c => !c.layer).length
    },
    countBySubcategory: {
      lighting: allComponents.filter(c => c.subcategory === 'lighting').length,
      camera: allComponents.filter(c => c.subcategory === 'camera').length,
      materials: allComponents.filter(c => c.subcategory === 'materials').length,
      animations: allComponents.filter(c => c.subcategory === 'animations').length,
      physics: allComponents.filter(c => c.subcategory === 'physics').length,
      interactions: allComponents.filter(c => c.subcategory === 'interactions').length,
      effects: allComponents.filter(c => c.subcategory === 'effects').length,
      optimization: allComponents.filter(c => c.subcategory === 'optimization').length
    },
    commonDependencies: calculateCommonDependencies(allComponents)
  };

  return {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    totalComponents: allComponents.length,
    byCategory,
    byId,
    stats
  };
}

/**
 * Calculate most common dependencies
 */
function calculateCommonDependencies(
  components: ComponentMetadata[]
): Array<{ name: string; count: number }> {
  const depMap = new Map<string, number>();

  for (const component of components) {
    if (component.dependencies) {
      for (const dep of component.dependencies) {
        if (!dep.isInternal) {
          depMap.set(dep.name, (depMap.get(dep.name) || 0) + 1);
        }
      }
    }
  }

  return Array.from(depMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
}

/**
 * Write registry to file
 */
async function writeRegistry(registry: ComponentRegistry): Promise<void> {
  // Ensure output directory exists
  await fsPromises.mkdir(OUTPUT_DIR, { recursive: true });

  // Write JSON registry
  await fsPromises.writeFile(OUTPUT_FILE, JSON.stringify(registry, null, 2));

  console.log(`📝 Registry written to: ${path.relative(PROJECT_ROOT, OUTPUT_FILE)}`);
  console.log(`\n📊 Registry Statistics:`);
  console.log(`   Total components: ${registry.totalComponents}`);
  console.log(`   Categories: ${Object.entries(registry.stats.countByCategory)
    .filter(([_, count]) => count > 0)
    .map(([cat, count]) => `${cat}(${count})`)
    .join(', ')}`);

  // Print subcategories for 3D components
  const threeDCount = Object.values(registry.stats.countBySubcategory).reduce((a, b) => a + b, 0);
  if (threeDCount > 0) {
    console.log(`   3D Subcategories: ${Object.entries(registry.stats.countBySubcategory)
      .filter(([_, count]) => count > 0)
      .map(([subcat, count]) => `${subcat}(${count})`)
      .join(', ')}`);
  }
}

/**
 * Print summary
 */
function printSummary(registry: ComponentRegistry): void {
  console.log('\n✨ Registry Generation Complete!\n');
  console.log('Components by Category:');
  Object.entries(registry.stats.countByCategory).forEach(([category, count]) => {
    if (count > 0) {
      console.log(`  ${category.padEnd(12)} ${count} components`);
    }
  });
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  try {
    console.log('🏗️  Generating Component Registry\n');
    const registry = await buildRegistry();
    await writeRegistry(registry);
    printSummary(registry);
  } catch (error) {
    console.error('❌ Error generating registry:', error);
    process.exit(1);
  }
}

// Run if executed directly
main();
