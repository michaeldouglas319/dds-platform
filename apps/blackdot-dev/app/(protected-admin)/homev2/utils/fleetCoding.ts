import type { DroneFleet, FleetColorScheme } from '../types/fleet.types';

/**
 * Fleet-based color schemes for visual distinction
 * Each fleet gets a unique color for identification
 */
export const FLEET_COLORS: Record<string, FleetColorScheme> = {
  'warehouse-north': {
    primary: '#FF6347',        // Tomato Red
    emissive: '#CC4F38',       // Dark red
    light: '#FF7F50',          // Coral
    dark: '#CC4F38',
  },
  'distribution-south': {
    primary: '#4169E1',        // Royal Blue
    emissive: '#2E5DB8',       // Dark blue
    light: '#6495ED',          // Cornflower Blue
    dark: '#2E5DB8',
  },
  'mobile-unit': {
    primary: '#32CD32',        // Lime Green
    emissive: '#228B22',       // Forest Green
    light: '#90EE90',          // Light Green
    dark: '#1a7a1a',
  },
  'express-fleet': {
    primary: '#FFD700',        // Gold
    emissive: '#CCAA00',       // Dark Gold
    light: '#FFED4E',          // Bright Gold
    dark: '#B8A400',
  },
  'heavy-operations': {
    primary: '#8B4513',        // Saddle Brown
    emissive: '#654321',       // Dark Brown
    light: '#A0522D',          // Sienna
    dark: '#3E2723',
  },
  'autonomous-test': {
    primary: '#9370DB',        // Medium Purple
    emissive: '#6B4FAA',       // Dark Purple
    light: '#BA55D3',          // Medium Orchid
    dark: '#4A235A',
  },
};

/**
 * Fleet emoji mapping for console logging
 */
export const FLEET_EMOJI: Record<string, string> = {
  'warehouse-north': '🏭',     // Warehouse
  'distribution-south': '📦',  // Distribution
  'mobile-unit': '🚚',         // Mobile
  'express-fleet': '⚡',       // Express (lightning)
  'heavy-operations': '🏋️',    // Heavy (weight)
  'autonomous-test': '🤖',     // Autonomous (robot)
};

/**
 * Get color scheme for a fleet
 */
export function getFleetColorScheme(fleetId: string): FleetColorScheme {
  return FLEET_COLORS[fleetId] || {
    primary: '#CCCCCC',
    emissive: '#999999',
    light: '#EEEEEE',
    dark: '#666666',
  };
}

/**
 * Get primary color for a fleet
 */
export function getFleetPrimaryColor(fleetId: string): string {
  const scheme = getFleetColorScheme(fleetId);
  return scheme.primary;
}

/**
 * Get emissive color for a fleet
 */
export function getFleetEmissiveColor(fleetId: string): string {
  const scheme = getFleetColorScheme(fleetId);
  return scheme.emissive;
}

/**
 * Get emoji for a fleet
 */
export function getFleetEmoji(fleetId: string): string {
  return FLEET_EMOJI[fleetId] || '✈️';
}

/**
 * Get display name for a fleet (for console output)
 */
export function getFleetDisplayName(fleetId: string, fleetName: string): string {
  const emoji = getFleetEmoji(fleetId);
  return `${emoji} ${fleetName}`;
}

/**
 * Create a fleet color log style for console.log with colors
 */
export function getFleetConsoleStyle(fleetId: string): [string, string] {
  const scheme = getFleetColorScheme(fleetId);
  const style = `color: ${scheme.primary}; font-weight: bold; font-size: 12px; text-shadow: 0 0 5px ${scheme.emissive}`;
  const resetStyle = 'color: inherit; font-weight: normal';
  return [style, resetStyle];
}

/**
 * Log fleet activity with color and emoji
 */
export function logFleetActivity(
  fleetId: string,
  fleetName: string,
  particleIdx: number,
  message: string
): void {
  const emoji = getFleetEmoji(fleetId);
  const [style, resetStyle] = getFleetConsoleStyle(fleetId);
  console.log(
    `%c${emoji} [${fleetName}] Particle ${particleIdx}: ${message}`,
    style
  );
}
