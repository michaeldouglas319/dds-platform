export interface ArticleMetadata {
  title: string;
  subtitle: string;
  author: string;
  date: string;
  category: string;
  tags?: string[];
  externalLinks?: {
    demo?: string;
    code?: string;
    course?: string;
  };
}

export interface ArticleContent {
  paragraphs: string[];
  image?: { src: string; alt: string; caption?: string };
  codeSnippet?: { language: string; code: string; filename?: string };
  highlights?: string[];
}

export interface ArticleSection {
  id: string;
  heading: string;
  content: ArticleContent;
}

export interface ArticleConfig {
  metadata: ArticleMetadata;
  sections: ArticleSection[];
}

export const physicsDemoConfig: ArticleConfig = {
  metadata: {
    title: "Building a Physics-Based Character Controller with the Help of AI",
    subtitle: "A comprehensive guide to implementing realistic character physics using AI-assisted development",
    author: "Ian Curtis",
    date: "January 2025",
    category: "Game Development",
    tags: ["physics", "game-dev", "character-controller", "AI", "3D", "webgl"],
    externalLinks: {
      demo: "#",
      code: "#",
      course: "#",
    },
  },
  sections: [
    {
      id: "introduction",
      heading: "Introduction",
      content: {
        paragraphs: [
          "Creating a smooth, responsive character controller is one of the fundamental challenges in game development. Whether you're building a first-person shooter, action-adventure game, or platformer, the way your character moves and interacts with the physics world defines the entire player experience.",
          "In this comprehensive guide, we'll walk through the complete process of building a physics-based character controller from the ground up. What makes this guide unique is that we'll explore how AI tools can accelerate your development workflow, helping you focus on the creative and architectural decisions while handling the boilerplate and implementation details.",
          "We'll cover everything from the initial physics setup with a simple capsule shape and ground detection, through real-time parameter tuning, character animation states, and finally, cross-platform input support. By the end, you'll have a solid foundation for building any type of character controller.",
        ],
        highlights: [
          "Set up physics with capsule colliders and raycasting",
          "Create real-time parameter tuning with GUI controls",
          "Detect ground contact for jump mechanics",
          "Integrate rigged characters with animation states",
          "Build complete world environments",
          "Support multiple input devices (keyboard, gamepad, touch)",
        ],
      },
    },
    {
      id: "physics-foundation",
      heading: "Step 1: Setting Up Physics with a Capsule and Ground",
      content: {
        paragraphs: [
          "The foundation of any character controller is the physics representation. We use a capsule shape as our character's collision primitive because it approximates the human form well: tall, relatively narrow, and with rounded ends that won't get caught on ledges.",
          "The physics setup involves three key elements: the character capsule (our collision shape), a ground plane (to stand on), and a physics engine to handle the interactions. We'll use Rapier, a popular physics engine that integrates well with Three.js.",
          "The character's movement isn't driven directly by the capsule's physics forces. Instead, we use the physics body for collision detection and gravity, while manually applying velocity based on input. This hybrid approach gives us the tight control needed for responsive gameplay while maintaining physical realism.",
        ],
        codeSnippet: {
          language: "typescript",
          filename: "PhysicsSetup.ts",
          code: `import * as THREE from 'three'
import * as RAPIER from '@react-three/rapier'

// Create character capsule
const capsuleGeometry = new THREE.CapsuleGeometry(0.5, 1.8, 8, 32)
const capsuleMaterial = new THREE.MeshStandardMaterial({ color: 0x4a90e2 })
const capsuleMesh = new THREE.Mesh(capsuleGeometry, capsuleMaterial)

// Physics body configuration
const capsuleRigidBodyDesc = RAPIER.RigidBodyDesc.dynamic()
  .setTranslation(0, 3, 0)
  .lockRotation() // Prevent capsule from tipping over

const groundColliderDesc = RAPIER.ColliderDesc.cuboid(10, 0.1, 10)
const groundCollider = world.createCollider(
  groundColliderDesc,
  groundRigidBody
)`,
        },
      },
    },
    {
      id: "parameter-tuning",
      heading: "Step 2: Real-Time Tuning with a GUI",
      content: {
        paragraphs: [
          "One of the most important aspects of character controller development is parameter tuning. Values like gravity scale, movement speed, jump force, and acceleration feel different to different developers. Rather than compiling and testing repeatedly, we use a GUI to adjust parameters in real-time.",
          "Modern game engines like Unity and Godot have built-in inspector windows for this. In a Three.js environment, we can achieve the same result with a control panel that directly modifies physics parameters.",
          "The beauty of this approach is that you can immediately feel how changes affect the character's movement. A jump that feels weak at force 5 might feel floaty at force 8. With real-time tuning, you can find the perfect feel in minutes instead of hours.",
        ],
        highlights: [
          "Adjust gravity scale without recompiling",
          "Tune acceleration and deceleration separately",
          "Control jump force and max jump height",
          "Adjust movement speed and air control",
          "See changes instantly as you play",
        ],
      },
    },
    {
      id: "ground-detection",
      heading: "Step 3: Ground Detection with Raycasting",
      content: {
        paragraphs: [
          "Knowing whether the character is on the ground is critical for jump mechanics. You can't jump while jumping, and you shouldn't apply gravity changes while airborne. This is where raycasting comes in.",
          "Raycasting shoots a line from the character's position downward and checks if it hits any colliders. If it does, we're on the ground. If it doesn't, we're in the air. We use a short raycast distance (slightly longer than the capsule radius) to ensure we only detect the ground we're standing on.",
          "A subtle but important detail: we need to raycast from the bottom of the capsule, not from its center. We also apply a small offset to avoid edge cases where the ray originates inside a collider. This is where AI assistance really shines—the logic is straightforward but easy to get wrong.",
        ],
        codeSnippet: {
          language: "typescript",
          filename: "GroundDetection.ts",
          code: `function isGrounded(
  world: RAPIER.World,
  characterPos: THREE.Vector3,
  rayDistance: number = 0.6
): boolean {
  const origin = characterPos.clone()
  const direction = new THREE.Vector3(0, -1, 0)

  // Raycast downward from character position
  const ray = new RAPIER.Ray(
    { x: origin.x, y: origin.y, z: origin.z },
    { x: direction.x, y: direction.y, z: direction.z }
  )

  const hit = world.castRay(ray, rayDistance, false)
  return hit !== null
}`,
        },
      },
    },
    {
      id: "animation-states",
      heading: "Step 4: Integrating a Rigged Character with Animation States",
      content: {
        paragraphs: [
          "A capsule shape is fine for physics, but players expect to see an actual character on screen. This is where rigged character models come in. A rigged model is a 3D mesh with a skeleton (bones) that can be posed and animated.",
          "The process involves loading a pre-animated character model (usually from an asset store or custom artist), positioning it at the same location as the physics capsule, and synchronizing the capsule's movement with the character's animations.",
          "Animation states are crucial here. Your character should have different animations for idle, walking, running, jumping, falling, and landing. The state machine determines which animation plays based on the character's current velocity and ground state. This creates a seamless animation flow.",
        ],
        highlights: [
          "Load rigged character models from glTF/glB files",
          "Position character mesh at physics body location",
          "Create animation state machine (idle → walk → run)",
          "Blend animations for smooth transitions",
          "Scale animations based on movement speed",
        ],
      },
    },
    {
      id: "world-building",
      heading: "Step 5: World Building and Asset Integration",
      content: {
        paragraphs: [
          "A character controller in an empty void isn't very interesting. We need environments to explore, obstacles to navigate, and visual interest to engage the player. This step involves populating your scene with buildings, terrain, props, and decorative elements.",
          "Asset integration is where performance considerations become critical. Loading thousands of high-poly models will tank your frame rate. We use techniques like level-of-detail (LOD) rendering, occlusion culling, and asset compression to maintain 60 FPS performance.",
          "The physics world needs to match the visual world. Every building, wall, and obstacle in your scene needs a corresponding collider so the character doesn't fall through objects or walk through walls. Tools like Blender can bake these collision meshes into your assets.",
        ],
        highlights: [
          "Design navigable level layouts",
          "Balance visual complexity with performance",
          "Use LOD (Level of Detail) for distant objects",
          "Implement occlusion culling for large scenes",
          "Compress 3D models using Draco compression",
          "Create physics colliders for all obstacles",
        ],
      },
    },
    {
      id: "input-support",
      heading: "Step 6: Cross-Platform Input Support",
      content: {
        paragraphs: [
          "Your character controller will be played on different devices: desktop with keyboard and mouse, mobile with touch, and console with gamepad. Supporting all input methods requires a flexible input system that abstracts away the hardware differences.",
          "Rather than checking for keyboard input directly throughout your code, create an input handler that normalizes all input types into a common format. This could be a movement vector and a jump button state, regardless of whether the player is using WASD, a gamepad joystick, or mobile touch controls.",
          "Mobile input is particularly interesting because it's spatial. Tapping on one side of the screen should move the character that direction, but you need to handle cases where the player lifts their finger and touches again elsewhere.",
        ],
        codeSnippet: {
          language: "typescript",
          filename: "InputHandler.ts",
          code: `class InputHandler {
  private movementVector = new THREE.Vector2(0, 0)
  private jumpPressed = false

  handleKeyboard(event: KeyboardEvent) {
    const keys = {
      'w': [0, 1],
      'a': [-1, 0],
      's': [0, -1],
      'd': [1, 0],
    }
    if (keys[event.key]) {
      const [x, z] = keys[event.key]
      this.movementVector.x = x
      this.movementVector.y = z
    }
    if (event.key === ' ') this.jumpPressed = true
  }

  handleGamepad(gamepad: Gamepad) {
    this.movementVector.x = gamepad.axes[0]
    this.movementVector.y = gamepad.axes[1]
    this.jumpPressed = gamepad.buttons[0].pressed
  }

  getMovementInput(): THREE.Vector2 {
    return this.movementVector
  }
}`,
        },
      },
    },
    {
      id: "ai-workflow",
      heading: "The Role of AI in the Workflow",
      content: {
        paragraphs: [
          "Throughout this guide, you've seen hints of how AI tools can accelerate your development process. Rather than manually typing out physics calculations, animation state machines, and input handlers, AI can generate the boilerplate code based on your descriptions and requirements.",
          "The most valuable way to use AI in character controller development is for the architectural decisions and creative aspects. Should the character accelerate gradually or instantly? Should jumping feel \"floaty\" or \"snappy\"? These creative decisions come from you. AI handles the implementation details—the code that makes your vision real.",
          "Another key benefit is rapid prototyping. You can describe a feature in plain English, get a working implementation in seconds, test it, and iterate. This feedback loop is much tighter than traditional development, allowing you to explore more ideas and find better solutions faster.",
          "As you continue your game development journey, remember that AI is a tool to enhance your productivity and creativity, not replace it. The best results come from combining AI's speed with your artistic vision and technical judgment.",
        ],
        highlights: [
          "Use AI to generate boilerplate code quickly",
          "Focus your creativity on design decisions",
          "Iterate rapidly with AI-assisted prototyping",
          "Maintain code quality with peer review",
          "Learn from AI-generated code to improve your skills",
        ],
      },
    },
  ],
};
