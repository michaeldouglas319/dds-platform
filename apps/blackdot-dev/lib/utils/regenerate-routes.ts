/**
 * Routes Registry Regeneration Utility
 * 
 * Provides programmatic way to regenerate routes registry
 * Can be called from Next.js plugins, API routes, or build scripts
 */

import { execSync } from 'child_process'
import path from 'path'

export interface RegenerateRoutesOptions {
  silent?: boolean
  throwOnError?: boolean
}

/**
 * Regenerate routes registry programmatically
 * 
 * @param options - Options for regeneration
 * @returns True if successful, false otherwise
 */
export function regenerateRoutesRegistry(
  options: RegenerateRoutesOptions = {}
): boolean {
  const { silent = false, throwOnError = false } = options

  try {
    const scriptPath = path.resolve(process.cwd(), 'scripts/generate-routes-registry.ts')
    
    if (!silent) {
      console.log('🔄 Regenerating routes registry...')
    }

    execSync(`ts-node "${scriptPath}"`, {
      stdio: silent ? 'pipe' : 'inherit',
      cwd: process.cwd(),
    })

    if (!silent) {
      console.log('✅ Routes registry regenerated successfully')
    }

    return true
  } catch (error) {
    if (!silent) {
      console.error('❌ Failed to regenerate routes registry:', error)
    }

    if (throwOnError) {
      throw error
    }

    return false
  }
}

/**
 * Check if routes registry needs regeneration
 * Compares modification times of config files vs registry
 */
export function shouldRegenerateRegistry(): boolean {
  try {
    const fs = require('fs')
    const registryPath = path.resolve(process.cwd(), 'public/registry/routes.json')
    const configPath = path.resolve(process.cwd(), 'lib/config/route-access.config.ts')

    if (!fs.existsSync(registryPath)) {
      return true // Registry doesn't exist
    }

    const registryTime = fs.statSync(registryPath).mtimeMs
    const configTime = fs.statSync(configPath).mtimeMs

    // Regenerate if config is newer than registry
    return configTime > registryTime
  } catch {
    return true // If we can't check, regenerate to be safe
  }
}
