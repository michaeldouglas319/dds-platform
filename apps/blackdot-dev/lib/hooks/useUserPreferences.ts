'use client'

/**
 * useUserPreferences Hook
 * 
 * Manages user preferences for favorites and recently visited routes.
 * Persists to localStorage automatically.
 */

import { useState, useEffect, useCallback } from 'react'
import {
  saveFavorites,
  loadFavorites,
  saveRecentlyVisited,
  loadRecentlyVisited,
  addToRecentlyVisited as addToRecent,
} from '@/lib/utils/userPreferences'

export interface UseUserPreferencesReturn {
  favorites: string[]
  recentlyVisited: string[]
  addFavorite: (path: string) => void
  removeFavorite: (path: string) => void
  toggleFavorite: (path: string) => void
  isFavorite: (path: string) => boolean
  trackVisit: (path: string) => void
  clearFavorites: () => void
  clearRecentlyVisited: () => void
}

/**
 * Hook to manage user preferences
 */
export function useUserPreferences(): UseUserPreferencesReturn {
  const [favorites, setFavorites] = useState<string[]>([])
  const [recentlyVisited, setRecentlyVisited] = useState<string[]>([])

  // Load preferences on mount
  useEffect(() => {
    setFavorites(loadFavorites())
    setRecentlyVisited(loadRecentlyVisited())
  }, [])

  /**
   * Add a route to favorites
   */
  const addFavorite = useCallback((path: string) => {
    setFavorites((prev) => {
      if (prev.includes(path)) {
        return prev
      }
      const updated = [...prev, path]
      saveFavorites(updated)
      return updated
    })
  }, [])

  /**
   * Remove a route from favorites
   */
  const removeFavorite = useCallback((path: string) => {
    setFavorites((prev) => {
      const updated = prev.filter((p) => p !== path)
      saveFavorites(updated)
      return updated
    })
  }, [])

  /**
   * Toggle favorite status
   */
  const toggleFavorite = useCallback(
    (path: string) => {
      if (favorites.includes(path)) {
        removeFavorite(path)
      } else {
        addFavorite(path)
      }
    },
    [favorites, addFavorite, removeFavorite]
  )

  /**
   * Check if a route is favorited
   */
  const isFavorite = useCallback(
    (path: string) => {
      return favorites.includes(path)
    },
    [favorites]
  )

  /**
   * Track a route visit
   */
  const trackVisit = useCallback((path: string) => {
    addToRecent(path)
    setRecentlyVisited((prev) => {
      // Remove if already exists
      const filtered = prev.filter((p) => p !== path)
      // Add to front
      const updated = [path, ...filtered].slice(0, 10)
      saveRecentlyVisited(updated)
      return updated
    })
  }, [])

  /**
   * Clear all favorites
   */
  const clearFavorites = useCallback(() => {
    setFavorites([])
    saveFavorites([])
  }, [])

  /**
   * Clear recently visited
   */
  const clearRecentlyVisited = useCallback(() => {
    setRecentlyVisited([])
    saveRecentlyVisited([])
  }, [])

  return {
    favorites,
    recentlyVisited,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    trackVisit,
    clearFavorites,
    clearRecentlyVisited,
  }
}
