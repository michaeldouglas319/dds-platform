/**
 * User Preferences Storage
 * 
 * Handles localStorage persistence for user preferences:
 * - Favorites (bookmarked routes)
 * - Recently visited (last 10 routes)
 */

export const USER_PREFERENCES_KEYS = {
  FAVORITES: 'dds-v3-favorites',
  RECENTLY_VISITED: 'dds-v3-recently-visited',
} as const

const MAX_RECENTLY_VISITED = 10

/**
 * Save favorites to localStorage
 */
export function saveFavorites(favorites: string[]): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(USER_PREFERENCES_KEYS.FAVORITES, JSON.stringify(favorites))
  } catch (error) {
    console.warn('Failed to save favorites:', error)
  }
}

/**
 * Load favorites from localStorage
 */
export function loadFavorites(): string[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(USER_PREFERENCES_KEYS.FAVORITES)
    if (stored) {
      const parsed = JSON.parse(stored)
      return Array.isArray(parsed) ? parsed : []
    }
  } catch (error) {
    console.warn('Failed to load favorites:', error)
  }
  
  return []
}

/**
 * Save recently visited routes to localStorage
 */
export function saveRecentlyVisited(paths: string[]): void {
  if (typeof window === 'undefined') return
  
  try {
    // Keep only last MAX_RECENTLY_VISITED
    const limited = paths.slice(0, MAX_RECENTLY_VISITED)
    localStorage.setItem(USER_PREFERENCES_KEYS.RECENTLY_VISITED, JSON.stringify(limited))
  } catch (error) {
    console.warn('Failed to save recently visited:', error)
  }
}

/**
 * Load recently visited routes from localStorage
 */
export function loadRecentlyVisited(): string[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(USER_PREFERENCES_KEYS.RECENTLY_VISITED)
    if (stored) {
      const parsed = JSON.parse(stored)
      return Array.isArray(parsed) ? parsed : []
    }
  } catch (error) {
    console.warn('Failed to load recently visited:', error)
  }
  
  return []
}

/**
 * Add a route to recently visited
 */
export function addToRecentlyVisited(path: string): void {
  if (typeof window === 'undefined') return
  
  const current = loadRecentlyVisited()
  
  // Remove if already exists (to move to front)
  const filtered = current.filter((p) => p !== path)
  
  // Add to front
  const updated = [path, ...filtered].slice(0, MAX_RECENTLY_VISITED)
  
  saveRecentlyVisited(updated)
}

/**
 * Clear all preferences
 */
export function clearPreferences(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(USER_PREFERENCES_KEYS.FAVORITES)
    localStorage.removeItem(USER_PREFERENCES_KEYS.RECENTLY_VISITED)
  } catch (error) {
    console.warn('Failed to clear preferences:', error)
  }
}
