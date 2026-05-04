/**
 * WebGL Context Manager
 * 
 * Manages WebGL context state globally, handles context loss/restore events,
 * and provides monitoring for context health.
 * 
 * Best Practices:
 * - Prevents context exhaustion by tracking active contexts
 * - Handles context loss gracefully with automatic recovery
 * - Provides warnings when approaching browser limits (~8 contexts)
 */

export type ContextState = 'active' | 'lost' | 'restored' | 'error';

export interface ContextInfo {
  id: string;
  state: ContextState;
  lostAt?: number;
  restoredAt?: number;
  errorCount: number;
}

class WebGLContextManager {
  private contexts: Map<string, ContextInfo> = new Map();
  private listeners: Map<string, Set<(state: ContextState) => void>> = new Map();
  private maxContexts = 8; // Browser limit
  private warningThreshold = 6; // Warn when approaching limit

  /**
   * Register a new WebGL context
   */
  registerContext(id: string, canvas: HTMLCanvasElement): void {
    if (this.contexts.has(id)) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[ContextManager] Context ${id} already registered`);
      }
      return;
    }

    // Check if we're approaching the limit
    if (this.contexts.size >= this.warningThreshold) {
      console.warn(
        `[ContextManager] Warning: ${this.contexts.size}/${this.maxContexts} contexts active. ` +
        `Approaching browser limit. Consider consolidating Canvas components.`
      );
    }

    if (this.contexts.size >= this.maxContexts) {
      console.error(
        `[ContextManager] Error: Maximum context limit (${this.maxContexts}) reached. ` +
        `Oldest context will be lost.`
      );
    }

    const contextInfo: ContextInfo = {
      id,
      state: 'active',
      errorCount: 0,
    };

    this.contexts.set(id, contextInfo);

    // Set up context loss/restore listeners
    const handleContextLost = (event: Event) => {
      event.preventDefault(); // Prevent default behavior to allow recovery
      this.setContextState(id, 'lost');
      
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[ContextManager] Context ${id} lost`);
      }
    };

    const handleContextRestored = () => {
      this.setContextState(id, 'restored');
      
      if (process.env.NODE_ENV === 'development') {
        console.info(`[ContextManager] Context ${id} restored`);
      }
    };

    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    if (process.env.NODE_ENV === 'development') {
      console.debug(`[ContextManager] Registered context ${id} (${this.contexts.size}/${this.maxContexts} active)`);
    }
  }

  /**
   * Unregister a WebGL context
   */
  unregisterContext(id: string): void {
    const context = this.contexts.get(id);
    if (!context) {
      return;
    }

    this.contexts.delete(id);
    this.listeners.delete(id);

    if (process.env.NODE_ENV === 'development') {
      console.debug(`[ContextManager] Unregistered context ${id} (${this.contexts.size}/${this.maxContexts} active)`);
    }
  }

  /**
   * Set context state
   */
  private setContextState(id: string, state: ContextState): void {
    const context = this.contexts.get(id);
    if (!context) {
      return;
    }

    const now = Date.now();
    context.state = state;

    if (state === 'lost') {
      context.lostAt = now;
    } else if (state === 'restored') {
      context.restoredAt = now;
      context.lostAt = undefined;
    } else if (state === 'error') {
      context.errorCount++;
    }

    // Notify listeners
    const listeners = this.listeners.get(id);
    if (listeners) {
      listeners.forEach((listener) => listener(state));
    }
  }

  /**
   * Get context state
   */
  getContextState(id: string): ContextState | null {
    return this.contexts.get(id)?.state ?? null;
  }

  /**
   * Subscribe to context state changes
   */
  subscribe(id: string, callback: (state: ContextState) => void): () => void {
    if (!this.listeners.has(id)) {
      this.listeners.set(id, new Set());
    }
    this.listeners.get(id)!.add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(id);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.listeners.delete(id);
        }
      }
    };
  }

  /**
   * Get all active contexts
   */
  getActiveContexts(): ContextInfo[] {
    return Array.from(this.contexts.values()).filter(
      (ctx) => ctx.state === 'active'
    );
  }

  /**
   * Get context count
   */
  getContextCount(): number {
    return this.contexts.size;
  }

  /**
   * Check if we're approaching the limit
   */
  isNearLimit(): boolean {
    return this.contexts.size >= this.warningThreshold;
  }

  /**
   * Check if we're at the limit
   */
  isAtLimit(): boolean {
    return this.contexts.size >= this.maxContexts;
  }

  /**
   * Get health status
   */
  getHealthStatus(): {
    active: number;
    lost: number;
    total: number;
    nearLimit: boolean;
    atLimit: boolean;
  } {
    const contexts = Array.from(this.contexts.values());
    return {
      active: contexts.filter((c) => c.state === 'active').length,
      lost: contexts.filter((c) => c.state === 'lost').length,
      total: contexts.length,
      nearLimit: this.isNearLimit(),
      atLimit: this.isAtLimit(),
    };
  }
}

// Singleton instance
export const contextManager = new WebGLContextManager();
