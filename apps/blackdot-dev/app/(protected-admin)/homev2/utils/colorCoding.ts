import type { ParticleState } from '../types/particle.types';

/**
 * State-based color coding for visual debugging
 * Each state has a distinct color to make particle behavior visible
 */
export const STATE_COLORS: Record<ParticleState, string> = {
  parked: '#90EE90',      // Light green - at gate
  taxiing: '#FFD700',     // Gold - moving on ground
  takeoff: '#FF6347',     // Tomato red - ascending
  mergingIn: '#FFA500',   // Orange - transitioning to orbit
  orbiting: '#00BFFF',    // Deep sky blue - in orbit
  approaching: '#9370DB', // Medium purple - returning
  landing: '#FF8C00',     // Dark orange - descending
};

/**
 * State-based emissive colors (darker versions for glow effect)
 */
export const STATE_EMISSIVE: Record<ParticleState, string> = {
  parked: '#6BC86B',      // Darker green
  taxiing: '#CCAA00',     // Darker gold
  takeoff: '#CC4F38',     // Darker red
  mergingIn: '#CC8500',  // Darker orange
  orbiting: '#0099CC',    // Darker blue
  approaching: '#6B4FAA', // Darker purple
  landing: '#CC7000',     // Darker orange
};

/**
 * Get color for a particle state
 */
export function getStateColor(state: ParticleState): string {
  return STATE_COLORS[state] || '#FFFFFF';
}

/**
 * Get emissive color for a particle state
 */
export function getStateEmissive(state: ParticleState): string {
  return STATE_EMISSIVE[state] || '#888888';
}
