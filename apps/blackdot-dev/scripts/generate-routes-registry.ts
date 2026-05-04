import fs from 'fs'
import path from 'path'
import { readdirSync, readFileSync } from 'fs'

interface RouteMetadata {
  id: string
  path: string
  label: string
  accessLevel: 'EVERYONE' | 'MEMBER' | 'MEMBER_PLUS' | 'PARTNER' | 'ADMIN'
  accessLevelValue: number
  description?: string
  category?: string
  isPublic: boolean
  featured?: boolean
  icon?: string
  tags?: string[]
  order?: number
  hidden?: boolean
}

interface RoutesRegistry {
  version: string
  generatedAt: string
  totalRoutes: number
  byAccessLevel: Record<string, RouteMetadata[]>
  byId: Record<string, RouteMetadata>
  stats: {
    countByAccessLevel: Record<string, number>
  }
}

const ACCESS_LEVEL_MAP: Record<string, { level: string; value: number }> = {
  ADMIN: { level: 'ADMIN', value: 4 },
  PARTNER: { level: 'PARTNER', value: 3 },
  MEMBER_PLUS: { level: 'MEMBER_PLUS', value: 2 },
  MEMBER: { level: 'MEMBER', value: 1 },
  EVERYONE: { level: 'EVERYONE', value: 0 },
}

// Load blocklist configuration
function loadBlocklist(): { isRouteBlocked: (path: string, context?: string) => boolean } {
  try {
    const blocklistPath = path.resolve(process.cwd(), 'lib/config/route-blocklist.config.ts')
    const content = readFileSync(blocklistPath, 'utf-8')
    
    // Extract BLOCKED_ROUTES array
    const blockedRoutesMatch = content.match(/export const BLOCKED_ROUTES[^=]*=\s*\[([\s\S]*?)\]/)
    const blockedRoutes: string[] = []
    if (blockedRoutesMatch) {
      const lines = blockedRoutesMatch[1].split('\n')
      for (const line of lines) {
        const match = line.match(/['"]([^'"]+)['"]/)
        if (match) {
          blockedRoutes.push(match[1])
        }
      }
    }

    // Extract ROUTE_BLOCKLIST entries
    const blocklistMatch = content.match(/export const ROUTE_BLOCKLIST[^=]*=\s*\[([\s\S]*?)\]/)
    const blocklistPaths: string[] = []
    if (blocklistMatch) {
      const lines = blocklistMatch[1].split('\n')
      for (const line of lines) {
        const pathMatch = line.match(/path:\s*['"]([^'"]+)['"]/)
        if (pathMatch) {
          blocklistPaths.push(pathMatch[1])
        }
      }
    }

    return {
      isRouteBlocked: (path: string, context: string = 'all') => {
        // Check exact matches
        if (blockedRoutes.includes(path)) return true
        if (blocklistPaths.includes(path)) return true
        
        // Check pattern matches (for dynamic routes)
        for (const pattern of blocklistPaths) {
          if (pattern.includes('[') && pattern.includes(']')) {
            const regexPattern = pattern.replace(/\[.*?\]/g, '[^/]+')
            const regex = new RegExp(`^${regexPattern}$`)
            if (regex.test(path)) return true
          }
        }
        
        return false
      }
    }
  } catch (error) {
    console.warn('Could not load blocklist config, using defaults:', error)
    // Fallback to original excluded routes
    const EXCLUDED_ROUTES = ['/api', '/_next', '/login']
    const EXCLUDED_PATHS = ['/ideas/composites', '/ideas/general', '/ideas/umbrellav1', '/business/[sectionId]', '/ideas/[sectionId]']
    return {
      isRouteBlocked: (path: string) => {
        return EXCLUDED_ROUTES.includes(path) || EXCLUDED_PATHS.some(p => path.startsWith(p))
      }
    }
  }
}

const blocklist = loadBlocklist()

// Legacy excluded routes (kept for backward compatibility)
const EXCLUDED_ROUTES = ['/api', '/_next', '/login']
const EXCLUDED_PATHS = ['/ideas/composites', '/ideas/general', '/ideas/umbrellav1', '/business/[sectionId]', '/ideas/[sectionId]']

// Load configuration files
function loadFeaturedRoutes(): Array<{ path: string; icon: string; order: number; label?: string }> {
  try {
    const configPath = path.resolve(process.cwd(), 'lib/config/featured-routes.config.ts')
    const content = readFileSync(configPath, 'utf-8')
    // Extract FEATURED_ROUTES array from the file
    const match = content.match(/export const FEATURED_ROUTES[^=]*=\s*\[([\s\S]*?)\]/)
    if (match) {
      // Simple parsing - in production, use a proper TypeScript parser
      const routes: Array<{ path: string; icon: string; order: number; label?: string }> = []
      const lines = match[1].split('\n')
      for (const line of lines) {
        const pathMatch = line.match(/path:\s*['"]([^'"]+)['"]/)
        const iconMatch = line.match(/icon:\s*['"]([^'"]+)['"]/)
        const orderMatch = line.match(/order:\s*(\d+)/)
        const labelMatch = line.match(/label:\s*['"]([^'"]+)['"]/)
        if (pathMatch && iconMatch && orderMatch) {
          routes.push({
            path: pathMatch[1],
            icon: iconMatch[1],
            order: parseInt(orderMatch[1], 10),
            label: labelMatch ? labelMatch[1] : undefined,
          })
        }
      }
      return routes
    }
  } catch (error) {
    console.warn('Could not load featured routes config:', error)
  }
  return []
}

function loadIconMap(): Record<string, string> {
  try {
    const configPath = path.resolve(process.cwd(), 'lib/config/route-icons.config.ts')
    const content = readFileSync(configPath, 'utf-8')
    const iconMap: Record<string, string> = {}
    // Extract ROUTE_ICON_MAP entries
    const match = content.match(/export const ROUTE_ICON_MAP[^=]*=\s*\{([\s\S]*?)\}/)
    if (match) {
      const lines = match[1].split('\n')
      for (const line of lines) {
        const routeMatch = line.match(/['"]([^'"]+)['"]:\s*['"]([^'"]+)['"]/)
        if (routeMatch) {
          iconMap[routeMatch[1]] = routeMatch[2]
        }
      }
    }
    return iconMap
  } catch (error) {
    console.warn('Could not load icon map config:', error)
  }
  return {}
}

function loadCategories(): Record<string, string> {
  // Simple category mapping based on path patterns
  return {
    '/': 'main',
    '/about': 'main',
    '/dashboard': 'main',
    '/resumev3': 'portfolio',
    '/business': 'portfolio',
    '/ideas': 'portfolio',
    '/showcase': 'demos',
    '/showcase-examples': 'demos',
    '/aerosim': 'simulations',
    '/particle-simulator': 'simulations',
    '/particle-interaction': 'simulations',
    '/forces': 'simulations',
    '/configurator': 'tools',
    '/admin': 'admin',
  }
}

// Load route access configuration from centralized config (SINGLE SOURCE OF TRUTH)
function loadRouteAccessConfig(): Record<string, Partial<RouteMetadata>> {
  try {
    const configPath = path.resolve(process.cwd(), 'lib/config/route-access.config.ts')
    const content = readFileSync(configPath, 'utf-8')
    
    // Extract ROUTE_ACCESS_CONFIG object
    const configMatch = content.match(/export const ROUTE_ACCESS_CONFIG[^=]*=\s*\{([\s\S]*?)\n\}/)
    const overrides: Record<string, Partial<RouteMetadata>> = {}
    
    if (configMatch) {
      // Parse each route configuration
      const routePattern = /['"]([^'"]+)['"]:\s*\{([\s\S]*?)\n\s*\},?/g
      let match
      
      while ((match = routePattern.exec(configMatch[1])) !== null) {
        const routePath = match[1]
        const routeConfig = match[2]
        
        // Extract properties from route config
        const accessLevelMatch = routeConfig.match(/accessLevel:\s*['"]([^'"]+)['"]/)
        const labelMatch = routeConfig.match(/label:\s*['"]([^'"]+)['"]/)
        const descriptionMatch = routeConfig.match(/description:\s*['"]([^'"]+)['"]/)
        const categoryMatch = routeConfig.match(/category:\s*['"]([^'"]+)['"]/)
        const featuredMatch = routeConfig.match(/featured:\s*(true|false)/)
        const iconMatch = routeConfig.match(/icon:\s*['"]([^'"]+)['"]/)
        const orderMatch = routeConfig.match(/order:\s*(\d+)/)
        const hiddenMatch = routeConfig.match(/hidden:\s*(true|false)/)
        const tagsMatch = routeConfig.match(/tags:\s*\[([^\]]+)\]/)
        
        const override: Partial<RouteMetadata> = {}
        
        if (accessLevelMatch) {
          override.accessLevel = accessLevelMatch[1] as any
        }
        if (labelMatch) {
          override.label = labelMatch[1]
        }
        if (descriptionMatch) {
          override.description = descriptionMatch[1]
        }
        if (categoryMatch) {
          override.category = categoryMatch[1]
        }
        if (featuredMatch) {
          override.featured = featuredMatch[1] === 'true'
        }
        if (iconMatch) {
          override.icon = iconMatch[1]
        }
        if (orderMatch) {
          override.order = parseInt(orderMatch[1], 10)
        }
        if (hiddenMatch) {
          override.hidden = hiddenMatch[1] === 'true'
        }
        if (tagsMatch) {
          const tags = tagsMatch[1].split(',').map(t => t.trim().replace(/['"]/g, ''))
          override.tags = tags.filter(Boolean)
        }
        
        if (Object.keys(override).length > 0) {
          overrides[routePath] = override
        }
      }
    }
    
    return overrides
  } catch (error) {
    console.warn('Could not load route access config, using defaults:', error)
    // Fallback to minimal defaults
    return {
      '/': {
        label: 'Home',
        accessLevel: 'EVERYONE',
        category: 'main',
        featured: true,
        icon: 'Home',
        order: 1,
      },
    }
  }
}

function detectAccessLevel(
  filePath: string,
  route: string,
  manualOverrides: Record<string, Partial<RouteMetadata>>
): { level: string; value: number } {
  try {
    // Check centralized route access config (SINGLE SOURCE OF TRUTH)
    const accessConfig = manualOverrides[route]
    if (accessConfig && accessConfig.accessLevel) {
      const configuredLevel = accessConfig.accessLevel
      // Validate access level exists in ACCESS_LEVEL_MAP
      if (configuredLevel in ACCESS_LEVEL_MAP) {
        return ACCESS_LEVEL_MAP[configuredLevel]
      }
      // If invalid access level provided, default to ADMIN
      console.warn(`Invalid access level "${configuredLevel}" for route "${route}", defaulting to ADMIN`)
      return ACCESS_LEVEL_MAP.ADMIN
    }

    // NO LEGACY FILE-BASED DETECTION
    // All access levels must be defined in ROUTE_ACCESS_CONFIG (centralized config)
    // This ensures single source of truth - no file-based detection
    
    // DEFAULT TO ADMIN (secure-by-default) for unconfigured routes
    // Only routes explicitly configured in ROUTE_ACCESS_CONFIG with valid access levels are public
    // Dynamic routes and unspecified paths default to ADMIN (admin-only)
    return ACCESS_LEVEL_MAP.ADMIN
  } catch {
    // Default to ADMIN (secure-by-default) if file can't be read or any error occurs
    return ACCESS_LEVEL_MAP.ADMIN
  }
}

function getRouteFromPath(filePath: string): string {
  // Convert file path to route
  // /app/admin/page.tsx → /admin
  // /app/page.tsx → /
  // /app/resumev3/page.tsx → /resumev3
  // /app/(protected-admin)/curved-takeoff-orbit/page.tsx → /curved-takeoff-orbit
  const appDir = path.resolve(process.cwd(), 'app')
  const relative = path.relative(appDir, filePath)
  let route = relative.replace(/\/page\.tsx$/, '').replace(/\/layout\.tsx$/, '') || '/'

  // Remove route groups (folders in parentheses like (protected-admin))
  route = route.replace(/\([^)]+\)\/?/g, '')

  return '/' + route.replace(/^\//g, '').replace(/\\/g, '/') // Handle Windows paths
}

function getCategoryFromAccessLevel(level: string): string {
  if (level === 'ADMIN') return 'admin'
  if (level === 'PARTNER') return 'partner'
  if (level === 'MEMBER_PLUS') return 'member_plus'
  if (level === 'MEMBER') return 'member'
  return 'public'
}

function getLabelFromPath(pathname: string): string {
  // Convert /admin → Admin, /particle-interaction → Particle Interaction
  return pathname
    .split('/')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' '))
    .join(' ')
}

function scanAppDirectory(): RouteMetadata[] {
  const appDir = path.resolve(process.cwd(), 'app')
  const routes: RouteMetadata[] = []
  const discoveredPaths = new Set<string>()
  
  // Load configs once (including centralized route access config)
  const featuredRoutes = loadFeaturedRoutes()
  const iconMap = loadIconMap()
  const categoryMap = loadCategories()
  const MANUAL_OVERRIDES = loadRouteAccessConfig() // Load centralized access config

  function walkDir(dir: string) {
    try {
      const entries = readdirSync(dir, { withFileTypes: true })

      for (const entry of entries) {
        // Skip excluded routes
        if (EXCLUDED_ROUTES.some((excluded) => entry.name.startsWith(excluded.replace('/', '')))) {
          continue
        }

        // Skip dynamic route segments (e.g., [sectionId])
        if (entry.isDirectory() && (entry.name.startsWith('[') && entry.name.endsWith(']'))) {
          continue
        }

        const fullPath = path.join(dir, entry.name)

        if (entry.isDirectory()) {
          walkDir(fullPath)
        } else if (entry.name === 'page.tsx') {
          const route = getRouteFromPath(fullPath)

          // Skip if already discovered
          if (discoveredPaths.has(route)) {
            continue
          }

          // Skip dynamic routes containing brackets
          if (route.includes('[')) {
            continue
          }

          // Skip explicitly excluded paths
          if (EXCLUDED_PATHS.includes(route)) {
            continue
          }

          // Check blocklist (exclude from discovery)
          if (blocklist.isRouteBlocked(route, 'discovery')) {
            continue
          }

          // Skip malformed routes (e.g., /page.tsx instead of /)
          if (route.endsWith('.tsx')) {
            continue
          }

          discoveredPaths.add(route)

          // Get access level from centralized config ONLY
          // No file-based detection - single source of truth
          let { level, value } = detectAccessLevel(fullPath, route, MANUAL_OVERRIDES)

          // Get override config for other metadata (label, description, etc.)
          const override = MANUAL_OVERRIDES[route]
          
          // Ensure access level comes from centralized config or defaults to ADMIN
          if (override && override.accessLevel) {
            const overrideLevelData = ACCESS_LEVEL_MAP[override.accessLevel]
            level = overrideLevelData.level
            value = overrideLevelData.value
          } else {
            // If not in config, default to ADMIN (secure-by-default)
            level = ACCESS_LEVEL_MAP.ADMIN.level
            value = ACCESS_LEVEL_MAP.ADMIN.value
          }

          // Check if route is featured
          const featuredRoute = featuredRoutes.find((fr) => fr.path === route)
          const isFeatured = featuredRoute !== undefined || override?.featured === true
          
          // Get icon
          const icon = override?.icon || featuredRoute?.icon || iconMap[route] || undefined
          
          // Get category
          const category = override?.category || categoryMap[route] || getCategoryFromAccessLevel(level)
          
          // Get order
          const routeOrder = override?.order || featuredRoute?.order || undefined

          const routeMeta: RouteMetadata = {
            id: route.replace(/\//g, '-').slice(1) || 'home',
            path: route,
            label: override?.label || featuredRoute?.label || getLabelFromPath(route),
            accessLevel: level as 'EVERYONE' | 'MEMBER' | 'MEMBER_PLUS' | 'PARTNER' | 'ADMIN',
            accessLevelValue: value,
            category,
            description: override?.description,
            isPublic: level === 'EVERYONE',
            featured: isFeatured,
            icon,
            order: routeOrder,
            tags: override?.tags,
            hidden: override?.hidden || blocklist.isRouteBlocked(route, 'all'),
          }

          routes.push(routeMeta)
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dir}:`, error)
    }
  }

  walkDir(appDir)

  // Add manual routes that weren't discovered
  // (featuredRoutes, iconMap, categoryMap already loaded above)
  for (const [routePath, override] of Object.entries(MANUAL_OVERRIDES)) {
    if (!discoveredPaths.has(routePath)) {
      const accessLevelStr = override.accessLevel || 'EVERYONE'
      const levelData = ACCESS_LEVEL_MAP[accessLevelStr]
      
      // Check if route is featured
      const featuredRoute = featuredRoutes.find((fr) => fr.path === routePath)
      const isFeatured = featuredRoute !== undefined || override?.featured === true
      
      // Get icon
      const icon = override?.icon || featuredRoute?.icon || iconMap[routePath] || undefined
      
      // Get category
      const category = override?.category || categoryMap[routePath] || getCategoryFromAccessLevel(accessLevelStr)
      
      // Get order
      const routeOrder = override?.order || featuredRoute?.order || undefined

      const routeMeta: RouteMetadata = {
        id: routePath.replace(/\//g, '-').slice(1) || 'home',
        path: routePath,
        label: override.label || featuredRoute?.label || getLabelFromPath(routePath),
        accessLevel: levelData.level as RouteMetadata['accessLevel'],
        accessLevelValue: levelData.value,
        category,
        description: override.description,
        isPublic: levelData.level === 'EVERYONE',
        featured: isFeatured,
        icon,
        order: routeOrder,
        tags: override?.tags,
        hidden: override?.hidden,
      }

      routes.push(routeMeta)
    }
  }

  // Sort by path
  routes.sort((a, b) => a.path.localeCompare(b.path))

  return routes
}

function generateRegistry(): RoutesRegistry {
  const routes = scanAppDirectory()

  // Group by access level
  const byAccessLevel: Record<string, RouteMetadata[]> = {
    EVERYONE: [],
    MEMBER: [],
    MEMBER_PLUS: [],
    PARTNER: [],
    ADMIN: [],
  }

  const byId: Record<string, RouteMetadata> = {}
  const countByAccessLevel: Record<string, number> = {
    EVERYONE: 0,
    MEMBER: 0,
    MEMBER_PLUS: 0,
    PARTNER: 0,
    ADMIN: 0,
  }

  for (const route of routes) {
    byAccessLevel[route.accessLevel].push(route)
    byId[route.id] = route
    countByAccessLevel[route.accessLevel]++
  }

  return {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    totalRoutes: routes.length,
    byAccessLevel,
    byId,
    stats: {
      countByAccessLevel,
    },
  }
}

function main() {
  try {
    console.log('🔍 Scanning app directory for routes...')
    const registry = generateRegistry()

    console.log(`✅ Found ${registry.totalRoutes} routes`)
    console.log(`   - Public (EVERYONE): ${registry.stats.countByAccessLevel.EVERYONE}`)
    console.log(`   - Member: ${registry.stats.countByAccessLevel.MEMBER}`)
    console.log(`   - Member+: ${registry.stats.countByAccessLevel.MEMBER_PLUS}`)
    console.log(`   - Partner: ${registry.stats.countByAccessLevel.PARTNER}`)
    console.log(`   - Admin: ${registry.stats.countByAccessLevel.ADMIN}`)

    // Ensure output directory exists
    const outputDir = path.resolve(process.cwd(), 'public/registry')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // Write registry
    const outputFile = path.join(outputDir, 'routes.json')
    fs.writeFileSync(outputFile, JSON.stringify(registry, null, 2))
    console.log(`\n📝 Routes registry written to: ${outputFile}`)
    
    // Count featured routes
    const featuredCount = Object.values(registry.byId).filter((r) => r.featured).length
    console.log(`   - Featured routes: ${featuredCount}`)
    
    console.log(`\n✨ Route discovery complete!`)
  } catch (error) {
    console.error('❌ Error generating routes registry:', error)
    process.exit(1)
  }
}

main()
