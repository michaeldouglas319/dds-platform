/**
 * Canvas Registry
 * 
 * Tracks all active Canvas instances and enforces single Canvas per route/page.
 * Prevents context exhaustion by managing Canvas lifecycle.
 * 
 * Best Practices:
 * - One Canvas per route/page
 * - Automatic cleanup on route changes
 * - Context count monitoring
 */

import { contextManager } from './contextManager';

export interface CanvasInstance {
  id: string;
  route: string;
  mountedAt: number;
  componentName?: string;
}

class CanvasRegistry {
  private instances: Map<string, CanvasInstance> = new Map();
  private routeMap: Map<string, string> = new Map(); // route -> canvasId

  /**
   * Register a Canvas instance
   */
  register(
    id: string,
    route: string,
    componentName?: string
  ): void {
    // Check if route already has a Canvas
    const existingId = this.routeMap.get(route);
    if (existingId && existingId !== id) {
      console.warn(
        `[CanvasRegistry] Route "${route}" already has a Canvas (${existingId}). ` +
        `Multiple Canvases on the same route can cause context exhaustion.`
      );
    }

    const instance: CanvasInstance = {
      id,
      route,
      mountedAt: Date.now(),
      componentName,
    };

    this.instances.set(id, instance);
    this.routeMap.set(route, id);

    if (process.env.NODE_ENV === 'development') {
      console.debug(
        `[CanvasRegistry] Registered Canvas ${id} for route "${route}" ` +
        `(${this.instances.size} total)`
      );
    }
  }

  /**
   * Unregister a Canvas instance
   */
  unregister(id: string): void {
    const instance = this.instances.get(id);
    if (!instance) {
      return;
    }

    this.instances.delete(id);
    
    // Clean up route mapping if this was the registered Canvas for the route
    const routeId = this.routeMap.get(instance.route);
    if (routeId === id) {
      this.routeMap.delete(instance.route);
    }

    // Also unregister from context manager
    contextManager.unregisterContext(id);

    if (process.env.NODE_ENV === 'development') {
      console.debug(
        `[CanvasRegistry] Unregistered Canvas ${id} from route "${instance.route}" ` +
        `(${this.instances.size} remaining)`
      );
    }
  }

  /**
   * Get Canvas instance by ID
   */
  getInstance(id: string): CanvasInstance | undefined {
    return this.instances.get(id);
  }

  /**
   * Get Canvas instance for route
   */
  getInstanceByRoute(route: string): CanvasInstance | undefined {
    const id = this.routeMap.get(route);
    return id ? this.instances.get(id) : undefined;
  }

  /**
   * Check if route has a Canvas
   */
  hasRoute(route: string): boolean {
    return this.routeMap.has(route);
  }

  /**
   * Get all active instances
   */
  getAllInstances(): CanvasInstance[] {
    return Array.from(this.instances.values());
  }

  /**
   * Get instance count
   */
  getCount(): number {
    return this.instances.size;
  }

  /**
   * Clean up all instances for a route (useful for route changes)
   */
  cleanupRoute(route: string): void {
    const id = this.routeMap.get(route);
    if (id) {
      this.unregister(id);
    }
  }

  /**
   * Clean up all instances (useful for app shutdown)
   */
  cleanupAll(): void {
    const ids = Array.from(this.instances.keys());
    ids.forEach((id) => this.unregister(id));
  }

  /**
   * Get registry stats
   */
  getStats(): {
    total: number;
    byRoute: Record<string, number>;
    oldest: CanvasInstance | null;
    newest: CanvasInstance | null;
  } {
    const instances = Array.from(this.instances.values());
    const byRoute: Record<string, number> = {};
    
    instances.forEach((instance) => {
      byRoute[instance.route] = (byRoute[instance.route] || 0) + 1;
    });

    const sorted = instances.sort((a, b) => a.mountedAt - b.mountedAt);

    return {
      total: instances.length,
      byRoute,
      oldest: sorted[0] || null,
      newest: sorted[sorted.length - 1] || null,
    };
  }
}

// Singleton instance
export const canvasRegistry = new CanvasRegistry();
