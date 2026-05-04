export const NETWORK_CONFIG = {
  nodeCount: 60,
  connectionDistance: 1.2,
  baseScale: 0.4,
  growthFactor: 0.7,
  evolutionInterval: 3.0,
  randomSetInterval: 8.0,
  similarityThreshold: 0.3,
  deathFadeTime: 1.0, // Time for red to black fade
  newSpawnTime: 2.0, // Time for new node to mature
  cleaningTime: 0.5, // Time for cleaning node to fade to default
  spawnDelayMin: 0.5, // Min delay for new node spawn
  spawnDelayMax: 3.0, // Max delay for new node spawn
} as const;



