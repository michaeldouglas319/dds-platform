'use client'

import { useState, useMemo } from 'react'
import { useUser, SignOutButton } from "@clerk/nextjs"
import { useAuth } from "@/lib/contexts/AuthContext"
import { useRoutesRegistry } from "@/lib/hooks/useRoutesRegistry"
import { AccessLevel, AccessLevelLabels, AccessLevelWeight } from "@/lib/types/auth.types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RouteSearch } from './components/RouteSearch'
import { RouteCard } from './components/RouteCard'
import { CategoryFilter } from './components/CategoryFilter'
import { FavoritesSection } from './components/FavoritesSection'
import { RecentlyVisitedSection } from './components/RecentlyVisitedSection'

export default function DashboardPage() {
  // All hooks must be called at the top, before any conditional returns
  const { user, isLoaded } = useUser()
  const { accessLevel: currentRole } = useAuth()
  const isMemberPlus = AccessLevelWeight[currentRole] >= AccessLevelWeight[AccessLevel.MEMBER_PLUS]
  const isPartner = AccessLevelWeight[currentRole] >= AccessLevelWeight[AccessLevel.PARTNER]
  const isAdmin = currentRole === AccessLevel.ADMIN

  const { registry, routes, loading, error } = useRoutesRegistry()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Filter routes based on access level and user permissions
  const publicRoutes = registry?.byAccessLevel.EVERYONE || []
  const memberPlusRoutes = isMemberPlus ? (registry?.byAccessLevel.MEMBER_PLUS || []) : []
  const partnerRoutes = isPartner ? (registry?.byAccessLevel.PARTNER || []) : []
  const adminRoutes = isAdmin ? (registry?.byAccessLevel.ADMIN || []) : []

  // Combine all accessible routes
  const allAccessibleRoutes = useMemo(() => {
    if (!registry) return []
    return [
      ...publicRoutes,
      ...memberPlusRoutes,
      ...partnerRoutes,
      ...adminRoutes,
    ].filter((route) => !route.hidden)
  }, [registry, publicRoutes, memberPlusRoutes, partnerRoutes, adminRoutes])

  // Filter routes by search query and category
  const filteredRoutes = useMemo(() => {
    let filtered = allAccessibleRoutes

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((route) => route.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (route) =>
          route.label.toLowerCase().includes(query) ||
          route.description?.toLowerCase().includes(query) ||
          route.path.toLowerCase().includes(query) ||
          route.tags?.some((tag) => tag.toLowerCase().includes(query))
      )
    }

    return filtered
  }, [allAccessibleRoutes, selectedCategory, searchQuery])

  // Now we can do conditional returns after all hooks are called
  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              Loading dashboard...
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!registry) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-6 text-red-500">
              Failed to load routes. Please refresh the page.
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Card */}
        <Card>
          <CardHeader>
            <CardTitle>Welcome to DDS V3</CardTitle>
            <p className="text-xs text-slate-400 mt-2">
              Auto-discovered routes from registry
              {registry && (
                <> (v{registry.version}, updated {new Date(registry.generatedAt).toLocaleDateString()})</>
              )}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-semibold">Email:</span> {user?.primaryEmailAddress?.emailAddress}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Role:</span> {AccessLevelLabels[currentRole]}
              </p>
              {user?.firstName && (
                <p className="text-sm">
                  <span className="font-semibold">Name:</span> {user.firstName} {user.lastName}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <RouteSearch onSearchChange={setSearchQuery} />
              <CategoryFilter
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            </div>
          </CardContent>
        </Card>

        {/* Favorites Section */}
        <FavoritesSection />

        {/* Recently Visited Section */}
        <RecentlyVisitedSection />

        {/* All Routes Section */}
        <Card>
          <CardHeader>
            <CardTitle>
              All Routes ({filteredRoutes.length})
              {searchQuery && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  matching &quot;{searchQuery}&quot;
                </span>
              )}
              {selectedCategory && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  in {selectedCategory}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredRoutes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No routes found.</p>
                {searchQuery && (
                  <p className="text-sm mt-2">Try a different search query.</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRoutes.map((route) => (
                  <RouteCard key={route.id} route={route} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sign Out */}
        <Card>
          <CardContent className="pt-6">
            <SignOutButton redirectUrl="/">
              <Button variant="destructive" className="w-full">
                Sign Out
              </Button>
            </SignOutButton>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
