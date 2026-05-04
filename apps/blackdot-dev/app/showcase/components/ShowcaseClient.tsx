'use client';

/**
 * Showcase Client Component
 *
 * Main client-side component for the component showcase.
 * Handles registry loading, search, filtering, and display.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ComponentRegistry, ComponentMetadata, ComponentCategory, ThreeDSubcategory } from '@/lib/registry/types';
import { loadComponentRegistry, searchComponents } from '@/lib/registry/componentRegistry';
import { ShowcaseTable } from './ShowcaseTable';
import { ComponentDetail } from './ComponentDetail';
import { ShowcaseStats } from './ShowcaseStats';

export function ShowcaseClient() {
  const [registry, setRegistry] = useState<ComponentRegistry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<ComponentCategory | 'all'>('all');
  const [subcategoryFilter, setSubcategoryFilter] = useState<ThreeDSubcategory | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load registry on mount
  useEffect(() => {
    (async () => {
      try {
        const loadedRegistry = await loadComponentRegistry();
        setRegistry(loadedRegistry);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load component registry');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Filter and search components
  const filteredComponents = useMemo(() => {
    if (!registry) return [];

    let components = Object.values(registry.byId);

    // Apply category filter
    if (categoryFilter !== 'all') {
      components = components.filter(c => c.category === categoryFilter);
    }

    // Apply subcategory filter
    if (subcategoryFilter !== 'all') {
      components = components.filter(c => c.subcategory === subcategoryFilter);
    }

    // Apply search
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      components = components.filter(c =>
        c.name.toLowerCase().includes(lowerQuery) ||
        c.description?.toLowerCase().includes(lowerQuery) ||
        c.id.toLowerCase().includes(lowerQuery) ||
        c.path.toLowerCase().includes(lowerQuery) ||
        c.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    }

    return components.sort((a, b) => a.name.localeCompare(b.name));
  }, [registry, searchQuery, categoryFilter, subcategoryFilter]);

  // Get unique subcategories in filtered results
  const availableSubcategories = useMemo(() => {
    if (!registry) return [];
    const subs = new Set<ThreeDSubcategory>();

    Object.values(registry.byId).forEach(component => {
      if (component.subcategory && (categoryFilter === 'all' || component.category === categoryFilter)) {
        subs.add(component.subcategory);
      }
    });

    return Array.from(subs).sort();
  }, [registry, categoryFilter]);

  // Get selected component details
  const selectedComponent = useMemo(() => {
    if (!registry || !selectedComponentId) return null;
    return registry.byId[selectedComponentId];
  }, [registry, selectedComponentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading component registry...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!registry) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>No Registry Found</CardTitle>
            <CardDescription>Run `npm run generate-registry` to generate the component registry.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold">Component Showcase</h1>
          <p className="text-muted-foreground mt-2">
            Interactive catalog of {registry.totalComponents} components across all categories
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="border-b bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <ShowcaseStats stats={registry.stats} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Filters */}
          <div className="space-y-6">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search components..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              {searchQuery && (
                <p className="text-xs text-muted-foreground">{filteredComponents.length} results</p>
              )}
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <div className="space-y-1">
                {['all', 'ui', 'composite', 'layout', 'scene', 'model', 'hook', 'utility'].map(cat => (
                  <Button
                    key={cat}
                    variant={categoryFilter === cat ? 'default' : 'ghost'}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      setCategoryFilter(cat as any);
                      setSubcategoryFilter('all');
                    }}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    {cat !== 'all' && (
                      <span className="ml-auto text-xs">
                        {registry.stats.countByCategory[cat as ComponentCategory]}
                      </span>
                    )}
                  </Button>
                ))}
              </div>
            </div>

            {/* Subcategory Filter (3D) */}
            {availableSubcategories.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">3D Subcategory</label>
                <div className="space-y-1">
                  <Button
                    variant={subcategoryFilter === 'all' ? 'default' : 'ghost'}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setSubcategoryFilter('all')}
                  >
                    All Subcategories
                  </Button>
                  {availableSubcategories.map(subcat => (
                    <Button
                      key={subcat}
                      variant={subcategoryFilter === subcat ? 'default' : 'ghost'}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setSubcategoryFilter(subcat)}
                    >
                      {subcat.charAt(0).toUpperCase() + subcat.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Clear Filters */}
            {(searchQuery || categoryFilter !== 'all' || subcategoryFilter !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('all');
                  setSubcategoryFilter('all');
                }}
              >
                Clear All Filters
              </Button>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {filteredComponents.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    {searchQuery ? 'No components found matching your search.' : 'No components found.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Component Table */}
                <ShowcaseTable
                  components={filteredComponents}
                  selectedId={selectedComponentId}
                  onSelect={setSelectedComponentId}
                />

                {/* Component Detail */}
                {selectedComponent && (
                  <ComponentDetail component={selectedComponent} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
