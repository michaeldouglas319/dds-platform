/**
 * Content Configuration Barrel Export
 *
 * Centralized import path for all content-related configurations:
 * - Page content (resume, business, ideas data)
 * - Pitch deck configurations
 * - Section configurations (manufacturing, contract, drones, testing)
 * - Common data utilities
 */

// Section configurations - export types explicitly for isolatedModules mode
export type {
  SectionLayout,
  SectionRendering,
  SlideSubcategory,
  SectionDrilldown,
  ModelConfig,
  UnifiedSection,
  SectionValidationResult
} from './sections.config'
export {
  allSections,
  getSectionsByPage,
  getSectionById,
  validateSections,
  validateAndLog
} from './sections.config'

export { manufacturingSections } from './sections.manufacturing.config'
export { contractSections } from './sections.contract.config'
export { dronesSections } from './sections.drones.config'
export { testingSections } from './sections.testing.config'
export { sectionsShowcase } from './sections-showcase.config'
export * from './sections.common.data'

// Resume data - explicitly export to avoid naming conflicts
export type { JobSection } from './resume-data.config'
export { resumeJobs } from './resume-data.config'

export * from './business-data.config'
export * from './ideas-data.config'

// Portfolio data - named exports to avoid conflicts with resume-data and sections.config
export type {
  JobSection as PortfolioJobSection,
  EducationEntry as PortfolioEducationEntry,
  SkillCategory as PortfolioSkillCategory,
  ProjectEntry as PortfolioProjectEntry,
  ModelConfig as PortfolioModelConfig
} from './portfolio-patel.config'
export {
  resumeJobsPatel,
  educationEntriesPatel,
  skillCategoriesPatel,
  portfolioProjectsPatel,
  portfolioHeroModels
} from './portfolio-patel.config'
