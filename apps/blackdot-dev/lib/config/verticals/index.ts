/**
 * Business Vertical Configuration Barrel Export
 *
 * Centralized import path for business vertical configurations:
 * - Rapid manufacturing vertical data
 * - Surveillance systems vertical data
 *
 * Note: Each config file exports its own capitalRequirements.
 * Import directly from specific config files to access them:
 * - import { capitalRequirements as rmCapitalRequirements } from './rapid-manufacturing.config'
 * - import { capitalRequirements as ssCap italRequirements } from './surveillance-systems.config'
 */

export * from './rapid-manufacturing.config'
// Excluding surveillance-systems exports to avoid duplicate capitalRequirements
// import specific exports from surveillance-systems.config directly if needed
