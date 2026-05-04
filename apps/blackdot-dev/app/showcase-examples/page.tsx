/**
 * Showcase Examples Page
 *
 * Interactive examples showcasing dashboard and editor components
 * with 3D models in action.
 */

import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Component Showcase Examples - Development Only',
  description: 'Interactive examples of dashboard and editor components with 3D models'
};

/**
 * Showcase examples page - development only
 */
export default function ShowcaseExamplesPage() {
  // Block access in production
  if (process.env.NODE_ENV !== 'development') {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold">Component Showcase Examples</h1>
          <p className="text-muted-foreground mt-2">
            Interactive examples demonstrating dashboard and editor components with 3D models
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">3D Model Dashboard</h2>
            <p className="text-muted-foreground">
              A comprehensive dashboard for viewing and controlling 3D models with live property editing.
            </p>
            <div className="border rounded-lg bg-muted/30 p-4 h-96">
              <div className="flex items-center justify-center h-full text-muted-foreground">
                3D Model Dashboard Component (requires 3D model implementation)
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Scene Control Panel</h2>
            <p className="text-muted-foreground">
              Control panel for managing 3D scene properties including lighting, camera, and effects.
            </p>
            <div className="border rounded-lg bg-muted/30 p-4 h-96">
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Scene Control Panel Component (requires 3D scene implementation)
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Property Editor with 3D Preview</h2>
            <p className="text-muted-foreground">
              Edit object properties in real-time with live 3D preview updates.
            </p>
            <div className="border rounded-lg bg-muted/30 p-4 h-96">
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Property Editor Component (requires 3D model implementation)
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
