import type { FloatingButton } from '../components/FloatingButtonsContainer';

/**
 * Helper function to generate dock-style positions
 * Creates evenly spaced buttons along the bottom with equal margins from screen edges
 *
 * @param count - Number of buttons
 * @param bottomY - Y position (vertical)
 * @param spacing - Distance between button centers
 * @param zDepth - Z position (depth)
 * @param screenWidth - Available screen width for button distribution (default: 10)
 * @param marginX - Margin from left/right screen edges (default: 0.5)
 */
function generateDockPositions(
  count: number,
  bottomY: number = -1.2,
  spacing: number = 0.6,
  zDepth: number = 0,
  screenWidth: number = 10,
  marginX: number = 0.5
): [number, number, number][] {
  const positions: [number, number, number][] = [];

  if (count === 1) {
    // Single button centered
    positions.push([0, bottomY, zDepth]);
    return positions;
  }

  // Calculate available width considering margins
  const availableWidth = screenWidth - 2 * marginX;

  // Method 1: Fixed spacing (original behavior)
  const totalWidth = (count - 1) * spacing;
  const canFitWithSpacing = totalWidth + 2 * marginX <= screenWidth;

  if (canFitWithSpacing) {
    // Use fixed spacing, center the group
    const startX = -totalWidth / 2;
    for (let i = 0; i < count; i++) {
      positions.push([startX + i * spacing, bottomY, zDepth]);
    }
  } else {
    // Method 2: Distribute evenly across available width
    const stepX = availableWidth / (count - 1);
    const startX = -availableWidth / 2;
    for (let i = 0; i < count; i++) {
      positions.push([startX + i * stepX, bottomY, zDepth]);
    }
  }

  return positions;
}

/**
 * Apple Dock style - horizontal row at bottom with hover lift effect
 * Buttons are arranged in a clean horizontal line
 */
export const FLOATING_BUTTONS_DOCK: FloatingButton[] = (() => {
  const positions = generateDockPositions(5, -6, 0.7, 0);

  return [
    {
      id: 'btn-portfolio',
      position: positions[0],
      color: '#FF718F',
      shape: 'icosahedron',
      scale: 0.75,
      floatIntensity: 0.4,
      rotationIntensity: 0,
      speed: 2,
      label: 'Portfolio',
      onClick: () => {
        console.log('Portfolio button clicked');
      },
    },
    {
      id: 'btn-projects',
      position: positions[1],
      color: '#29C1A2',
      shape: 'octahedron',
      scale: 0.75,
      floatIntensity: 0.4,
      rotationIntensity: 0,
      speed: 2,
      label: 'Projects',
      onClick: () => {
        console.log('Projects button clicked');
      },
    },
    {
      id: 'btn-skills',
      position: positions[2],
      color: '#FF9060',
      shape: 'sphere',
      scale: 0.75,
      floatIntensity: 0.4,
      rotationIntensity: 0,
      speed: 2,
      label: 'Skills',
      onClick: () => {
        console.log('Skills button clicked');
      },
    },
    {
      id: 'btn-contact',
      position: positions[3],
      color: '#823FFF',
      shape: 'torus',
      scale: 0.75,
      floatIntensity: 0.4,
      rotationIntensity: 0,
      speed: 2,
      label: 'Contact',
      onClick: () => {
        console.log('Contact button clicked');
      },
    },
    {
      id: 'btn-blog',
      position: positions[4],
      color: '#4ECDC4',
      shape: 'box',
      scale: 0.75,
      floatIntensity: 0.4,
      rotationIntensity: 0.03,
      speed: 2,
      label: 'Blog',
      onClick: () => {
        console.log('Blog button clicked');
      },
    },
  ];
})();

/**
 * Extended dock - more buttons, good for portfolio showcase
 */
export const FLOATING_BUTTONS_DOCK_EXTENDED: FloatingButton[] = (() => {
  const positions = generateDockPositions(7, -1.2, 0.55, 0);

  const configs: Partial<FloatingButton>[] = [
    {
      id: 'btn-portfolio',
      color: '#FF718F',
      shape: 'icosahedron',
      label: 'Portfolio',
    },
    {
      id: 'btn-projects',
      color: '#29C1A2',
      shape: 'octahedron',
      label: 'Projects',
    },
    {
      id: 'btn-skills',
      color: '#FF9060',
      shape: 'sphere',
      label: 'Skills',
    },
    {
      id: 'btn-experience',
      color: '#823FFF',
      shape: 'torus',
      label: 'Experience',
    },
    {
      id: 'btn-services',
      color: '#4ECDC4',
      shape: 'box',
      label: 'Services',
    },
    // {
    //   id: 'btn-contact',
    //   color: '#FFD166',
    //   shape: 'tetrahedron',
    //   label: 'Contact',
    // },
    // {
    //   id: 'btn-social',
    //   color: '#EF476F',
    //   shape: 'icosahedron',
    //   label: 'Social',
    // },
  ];

  return configs.map((config, i) => ({
    ...config,
    position: positions[i],
    scale: 0.7,
    floatIntensity: 0.35,
    rotationIntensity: 0.25,
    speed: 2,
    onClick: () => console.log(`${config.label} button clicked`),
  })) as FloatingButton[];
})();

/**
 * Responsive configuration - distributes buttons evenly left to right with margins
 * Uses the new screenWidth and marginX parameters for precise alignment
 *
 * screenWidth: 10 (typical 3D scene width)
 * marginX: 1.0 (equal 1.0 unit margin from left and right edges)
 * This ensures buttons are centered horizontally with consistent padding
 */
export const FLOATING_BUTTONS_RESPONSIVE: FloatingButton[] = (() => {
  const positions = generateDockPositions(
    5,
    -1.2,
    0.7,
    0,
    10, // screenWidth
    1.0 // marginX - equal margin from left/right edges
  );

  return [
    {
      id: 'btn-portfolio',
      position: positions[0],
      color: '#FF718F',
      shape: 'icosahedron',
      scale: 0.75,
      floatIntensity: 0.4,
      rotationIntensity: 0,
      speed: 2,
      label: 'Portfolio',
      onClick: () => console.log('Portfolio button clicked'),
    },
    {
      id: 'btn-projects',
      position: positions[1],
      color: '#29C1A2',
      shape: 'octahedron',
      scale: 0.75,
      floatIntensity: 0.4,
      rotationIntensity: 0,
      speed: 2,
      label: 'Projects',
      onClick: () => console.log('Projects button clicked'),
    },
    {
      id: 'btn-skills',
      position: positions[2],
      color: '#FF9060',
      shape: 'sphere',
      scale: 0.75,
      floatIntensity: 0.4,
      rotationIntensity: 0,
      speed: 2,
      label: 'Skills',
      onClick: () => console.log('Skills button clicked'),
    },
    {
      id: 'btn-contact',
      position: positions[3],
      color: '#823FFF',
      shape: 'torus',
      scale: 0.75,
      floatIntensity: 0.4,
      rotationIntensity: 0,
      speed: 2,
      label: 'Contact',
      onClick: () => console.log('Contact button clicked'),
    },
    {
      id: 'btn-blog',
      position: positions[4],
      color: '#4ECDC4',
      shape: 'box',
      scale: 0.75,
      floatIntensity: 0.4,
      rotationIntensity: 0.03,
      speed: 2,
      label: 'Blog',
      onClick: () => console.log('Blog button clicked'),
    },
  ];
})();

/**
 * Default floating button configurations for the landing scene
 * @deprecated Use FLOATING_BUTTONS_DOCK instead
 */
export const FLOATING_BUTTONS_CONFIG: FloatingButton[] = FLOATING_BUTTONS_RESPONSIVE;

/**
 * Minimal configuration - fewer buttons for cleaner look
 */
export const FLOATING_BUTTONS_MINIMAL: FloatingButton[] = (() => {
  const positions = generateDockPositions(2, -1.2, 1, 0);

  return [
    {
      id: 'btn-explore',
      position: positions[0],
      color: '#FF718F',
      shape: 'icosahedron',
      scale: 0.85,
      floatIntensity: 0.5,
      rotationIntensity: 0.4,
      speed: 2,
      label: 'Explore',
      onClick: () => console.log('Explore button clicked'),
    },
    {
      id: 'btn-connect',
      position: positions[1],
      color: '#29C1A2',
      shape: 'octahedron',
      scale: 0.85,
      floatIntensity: 0.5,
      rotationIntensity: 0.4,
      speed: 2,
      label: 'Connect',
      onClick: () => console.log('Connect button clicked'),
    },
  ];
})();
