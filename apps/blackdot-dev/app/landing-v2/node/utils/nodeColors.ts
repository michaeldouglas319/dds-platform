import * as THREE from 'three';
import { NodeData } from '../../types/node.types';
import { COLORS } from '../../config/colors.config';
import { NETWORK_CONFIG } from '../../config/network.config';

/**
 * Calculate color for a node based on its state
 */
export function calculateNodeColor(
  nodeState: NodeData,
  currentTime: number,
  agitationLevel: number
): THREE.Color {
  // Use neutral gray color for default nodes
  const defaultColor = new THREE.Color('#aaaaaa'); // Neutral gray
  const redColor = new THREE.Color(COLORS.red);
  const greenColor = new THREE.Color(COLORS.green);
  const blackColor = new THREE.Color(0, 0, 0);
  
  if (!nodeState.alive) {
    return blackColor;
  }
  
  switch (nodeState.state) {
    case 'dying': {
      const fadeProgress = nodeState.timer > 0 
        ? 1 - (nodeState.timer / NETWORK_CONFIG.deathFadeTime) 
        : 1;
      return redColor.clone().lerp(blackColor, fadeProgress);
    }
    case 'deleting':
      return blackColor;
    case 'new': {
      const pulse = Math.sin(currentTime * 3 + nodeState.pulsePhase) * 0.3 + 0.7;
      const greenPulse = greenColor.clone().multiplyScalar(pulse);
      
      if (nodeState.timer > NETWORK_CONFIG.newSpawnTime - 0.5) {
        // Phase 1: Fade In (0.5s) with flash effect
        const fadeIn = 1 - ((nodeState.timer - (NETWORK_CONFIG.newSpawnTime - 0.5)) / 0.5);
        // Add intensity flash - bright burst that decays
        const flash = Math.pow(1 - fadeIn, 2) * 2.0; // Quadratic decay for smooth flash
        const baseColor = blackColor.clone().lerp(greenPulse, fadeIn);
        // Boost brightness for flash effect
        return baseColor.clone().multiplyScalar(1 + flash);
      } else if (nodeState.timer < 0.5 && nodeState.timer > 0) {
        // Phase 3: Transition to Default (0.5s)
        const fadeToDefault = 1 - (nodeState.timer / 0.5);
        return greenPulse.clone().lerp(defaultColor, fadeToDefault);
      }
      // Phase 2: Green Pulse (1.5s)
      return greenPulse;
    }
    case 'cleaning': {
      const cleaningProgress = nodeState.timer > 0 
        ? 1 - (nodeState.timer / NETWORK_CONFIG.cleaningTime) 
        : 1;
      const agitatedColor = defaultColor.clone().lerp(
        new THREE.Color(COLORS.purple), 
        agitationLevel * 0.3
      );
      return agitatedColor.clone().lerp(defaultColor, cleaningProgress);
    }
    default: {
      const agitationColor = new THREE.Color(COLORS.purple);
      return defaultColor.clone().lerp(agitationColor, agitationLevel * 0.3);
    }
  }
}

