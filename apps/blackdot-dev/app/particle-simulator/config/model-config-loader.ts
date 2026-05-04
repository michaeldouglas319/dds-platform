/**
 * Model Configuration Loader
 * Loads model positioning and orientation from JSON config
 */

export interface ModelConfig {
  targetSize: number;
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
  };
  dynamic_source_area?: boolean; // Enable dynamic wind tunnel (object-aware spawning)
}

export interface ModelConfigFile {
  models: Record<string, ModelConfig>;
  defaults: ModelConfig;
}

let configCache: ModelConfigFile | null = null;

// Initialize window listeners for development mode (call after hydration)
function initializeCacheClearing() {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
    return;
  }
  // Clear cache on page load in dev mode
  window.addEventListener('beforeunload', () => {
    configCache = null;
  });
}

/**
 * Load model configuration from JSON file
 */
export async function loadModelConfig(forceReload = false): Promise<ModelConfigFile> {
  if (configCache && !forceReload) {
    return configCache;
  }

  try {
    // Try to load from public directory with cache busting in dev
    const cacheBuster = process.env.NODE_ENV === 'development' ? `?t=${Date.now()}` : '';
    const response = await fetch(`/config/model-config.json${cacheBuster}`);
    if (!response.ok) {
      throw new Error(`Failed to load model config: ${response.statusText}`);
    }
    const config = await response.json() as ModelConfigFile;
    configCache = config;
    console.log('Model config loaded successfully', config);
    console.log('Available model paths:', Object.keys(config.models));
    return config;
  } catch (error) {
    console.warn('Failed to load model config, using defaults:', error);
    // Return default config if file doesn't exist
    const defaultConfig = {
      models: {},
      defaults: {
        targetSize: 60,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        dynamic_source_area: true, // Default: enable dynamic wind tunnel
      },
    };
    configCache = defaultConfig;
    return defaultConfig;
  }
}

/**
 * Get configuration for a specific model path
 */
export async function getModelConfig(modelPath: string, forceReload = false): Promise<ModelConfig> {
  const config = await loadModelConfig(forceReload);
  
  console.log(`Looking for config: "${modelPath}"`);
  console.log('Available paths:', Object.keys(config.models));
  
  // Try exact match first
  if (config.models[modelPath]) {
    console.log(`✓ Found exact config for: ${modelPath}`, config.models[modelPath]);
    return config.models[modelPath];
  }
  
  // Try matching by filename (in case path differs)
  const modelFilename = modelPath.split('/').pop() || modelPath;
  for (const [configPath, configData] of Object.entries(config.models)) {
    if (configPath.includes(modelFilename) || modelPath.includes(configPath.split('/').pop() || '')) {
      console.log(`✓ Found config by filename match: ${configPath}`, configData);
      return configData;
    }
  }
  
  // Return defaults
  console.warn(`✗ No config found for "${modelPath}", using defaults`);
  return config.defaults;
}

/**
 * Clear config cache (useful for hot reloading)
 */
export function clearModelConfigCache(): void {
  configCache = null;
}

/**
 * Initialize cache clearing listeners (call after hydration)
 */
export { initializeCacheClearing };

