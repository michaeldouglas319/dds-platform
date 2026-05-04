'use client'

import * as THREE from 'three/webgpu'
import { Inspector } from 'three/addons/inspector/Inspector.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { TransformControls } from 'three/addons/controls/TransformControls.js'
import { useEffect, useRef } from 'react'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'

// Default Configuration - override from parent page
interface AttractorsV4Config {
  particleMode?: 'simple-particles' | 'advanced-mesh'
}

const DEFAULT_ATTRACTORS_V4_CONFIG: AttractorsV4Config = {
  particleMode: 'simple-particles',
}

const particleCount = 10000 // CPU-managed particles
const sourceSpawnInterval = 0.05 // 20 spawns per second per source

interface AttractorsParticlesV4Props {
  config?: AttractorsV4Config
}

export default function AttractorsParticlesV4(props: AttractorsParticlesV4Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const CONFIG = { ...DEFAULT_ATTRACTORS_V4_CONFIG, ...props.config }

  useEffect(() => {
    if (!containerRef.current) return

    let camera: THREE.PerspectiveCamera
    let scene: THREE.Scene
    let renderer: any
    let controls: OrbitControls
    let isOrbitControlsActive = false
    let nextParticleIndex = 0 // Track next available particle slot for spawning
    let sourceTimers: Map<number, number> = new Map() // Track spawn timers per source
    let uavMesh: THREE.Group | null = null // Store UAV for collision detection
    let uavBoundingSphere: THREE.Sphere | null = null // Bounding sphere for fast collision check
    let deflectors: THREE.Mesh[] = [] // Store deflector meshes for collision
    let flowField: Float32Array | null = null // Pre-computed velocity field
    let flowFieldGrid = { size: 32, bounds: { min: new THREE.Vector3(-20, -5, -20), max: new THREE.Vector3(20, 10, 20) } }

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()

    // Configuration (mutable arrays for dynamic add)
    const attractors: Array<{ position: THREE.Vector3; mesh: THREE.Mesh }> = []
    const groundSources: Array<{ position: THREE.Vector3; mesh: THREE.Mesh }> = []

    function computeFlowField(mesh: THREE.Group, gridSize: number, bounds: { min: THREE.Vector3; max: THREE.Vector3 }): Float32Array {
      // Pre-compute velocity field around the UAV using potential flow theory
      // Grid stores 3D velocity vectors: [vx, vy, vz] per cell
      const fieldSize = gridSize * gridSize * gridSize
      const field = new Float32Array(fieldSize * 3)

      const cellSize = new THREE.Vector3(
        (bounds.max.x - bounds.min.x) / gridSize,
        (bounds.max.y - bounds.min.y) / gridSize,
        (bounds.max.z - bounds.min.z) / gridSize
      )

      const baseFlow = new THREE.Vector3(0, 0, 1) // Wind tunnel flow direction (positive Z)
      const baseSpeed = 1.0

      for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
          for (let z = 0; z < gridSize; z++) {
            // World position of this grid cell
            const worldPos = new THREE.Vector3(
              bounds.min.x + (x + 0.5) * cellSize.x,
              bounds.min.y + (y + 0.5) * cellSize.y,
              bounds.min.z + (z + 0.5) * cellSize.z
            )

            // Start with base flow
            const velocity = baseFlow.clone().multiplyScalar(baseSpeed)

            // Distance to UAV center (simple approximation)
            const distToUAV = worldPos.distanceTo(mesh.position)
            const uavInfluenceRadius = 8.0

            if (distToUAV < uavInfluenceRadius) {
              // Repulsion from UAV (pushes particles away)
              const repulsionDir = new THREE.Vector3().subVectors(worldPos, mesh.position).normalize()
              const repulsionStrength = Math.max(0, 1.0 - distToUAV / uavInfluenceRadius)
              velocity.add(repulsionDir.multiplyScalar(repulsionStrength * 0.5))

              // Circular flow around UAV (creates vortex shedding effect)
              // Uses cross product to create perpendicular flow
              const crossFlow = new THREE.Vector3()
              crossFlow.crossVectors(new THREE.Vector3(0, 1, 0), repulsionDir) // Perpendicular to radial
              velocity.add(crossFlow.multiplyScalar(repulsionStrength * 0.3))
            }

            // Store velocity in grid
            const idx = (x + y * gridSize + z * gridSize * gridSize) * 3
            field[idx] = velocity.x
            field[idx + 1] = velocity.y
            field[idx + 2] = velocity.z
          }
        }
      }

      console.log(`Flow field computed: ${gridSize}³ = ${fieldSize} cells`)
      return field
    }

    function sampleFlowField(pos: THREE.Vector3, field: Float32Array, gridSize: number, bounds: { min: THREE.Vector3; max: THREE.Vector3 }): THREE.Vector3 {
      // Sample velocity from pre-computed field with trilinear interpolation

      // Normalize position to grid coordinates
      const cellSize = new THREE.Vector3(
        (bounds.max.x - bounds.min.x) / gridSize,
        (bounds.max.y - bounds.min.y) / gridSize,
        (bounds.max.z - bounds.min.z) / gridSize
      )

      const gridCoord = new THREE.Vector3(
        (pos.x - bounds.min.x) / cellSize.x,
        (pos.y - bounds.min.y) / cellSize.y,
        (pos.z - bounds.min.z) / cellSize.z
      )

      // Clamp to grid bounds
      gridCoord.x = Math.max(0, Math.min(gridSize - 1.001, gridCoord.x))
      gridCoord.y = Math.max(0, Math.min(gridSize - 1.001, gridCoord.y))
      gridCoord.z = Math.max(0, Math.min(gridSize - 1.001, gridCoord.z))

      // Trilinear interpolation
      const x0 = Math.floor(gridCoord.x)
      const y0 = Math.floor(gridCoord.y)
      const z0 = Math.floor(gridCoord.z)
      const x1 = Math.min(x0 + 1, gridSize - 1)
      const y1 = Math.min(y0 + 1, gridSize - 1)
      const z1 = Math.min(z0 + 1, gridSize - 1)

      const fx = gridCoord.x - x0
      const fy = gridCoord.y - y0
      const fz = gridCoord.z - z0

      // Helper to get velocity at grid cell
      const getVel = (gx: number, gy: number, gz: number): THREE.Vector3 => {
        const idx = (gx + gy * gridSize + gz * gridSize * gridSize) * 3
        return new THREE.Vector3(field[idx], field[idx + 1], field[idx + 2])
      }

      // Interpolate all 8 corners
      const v000 = getVel(x0, y0, z0)
      const v100 = getVel(x1, y0, z0)
      const v010 = getVel(x0, y1, z0)
      const v110 = getVel(x1, y1, z0)
      const v001 = getVel(x0, y0, z1)
      const v101 = getVel(x1, y0, z1)
      const v011 = getVel(x0, y1, z1)
      const v111 = getVel(x1, y1, z1)

      // Trilinear blend
      const v = new THREE.Vector3()
      v.addScaledVector(v000, (1 - fx) * (1 - fy) * (1 - fz))
      v.addScaledVector(v100, fx * (1 - fy) * (1 - fz))
      v.addScaledVector(v010, (1 - fx) * fy * (1 - fz))
      v.addScaledVector(v110, fx * fy * (1 - fz))
      v.addScaledVector(v001, (1 - fx) * (1 - fy) * fz)
      v.addScaledVector(v101, fx * (1 - fy) * fz)
      v.addScaledVector(v011, (1 - fx) * fy * fz)
      v.addScaledVector(v111, fx * fy * fz)

      return v
    }

    function createWingGeometry(): THREE.BufferGeometry {
      // Wing-shaped deflector geometry
      const vertices: number[] = []
      const indices: number[] = []

      // Wing body: simplified cone-like shape
      const wingPoints = [
        new THREE.Vector3(0, 0, 0),    // tip
        new THREE.Vector3(-2, -1, 2),  // left base
        new THREE.Vector3(2, -1, 2),   // right base
        new THREE.Vector3(-1.5, 0, 4), // left far
        new THREE.Vector3(1.5, 0, 4),  // right far
      ]

      wingPoints.forEach((p) => {
        vertices.push(p.x, p.y, p.z)
      })

      // Triangulate wing surfaces
      indices.push(0, 1, 2) // front triangle
      indices.push(1, 3, 4, 4, 2, 1) // side surfaces
      indices.push(0, 2, 4, 4, 3, 0) // back surfaces

      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3))
      geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1))
      geometry.computeVertexNormals()

      return geometry
    }

    function setupDeflectors(scene: THREE.Scene) {
      // Create 3 deflector wings positioned in wind tunnel
      const deflectorPositions = [
        new THREE.Vector3(-6, 3, 2),   // Left deflector
        new THREE.Vector3(0, 4, 0),    // Center deflector
        new THREE.Vector3(6, 3, 2),    // Right deflector
      ]

      const wingGeometry = createWingGeometry()
      const material = new THREE.MeshStandardMaterial({
        color: '#ff6600',
        metalness: 0.6,
        roughness: 0.4,
        emissive: '#ff3300',
        emissiveIntensity: 0.3,
      })

      deflectorPositions.forEach((pos) => {
        const mesh = new THREE.Mesh(wingGeometry, material)
        mesh.position.copy(pos)
        mesh.rotation.z = Math.PI * 1.5
        mesh.castShadow = true
        mesh.receiveShadow = true
        scene.add(mesh)
        deflectors.push(mesh)
      })

      console.log(`Created ${deflectors.length} deflectors`)
    }

    async function init() {
      // Camera & Scene
      camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.1, 100)
      camera.position.set(3, 5, 8)
      scene = new THREE.Scene()

      // Lights
      scene.add(new THREE.AmbientLight('#ffffff', 0.5))
      const light = new THREE.DirectionalLight('#ffffff', 1.5)
      light.position.set(4, 2, 0)
      scene.add(light)

      // Renderer
      renderer = new THREE.WebGPURenderer({ antialias: true })
      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setAnimationLoop(animate)
      renderer.inspector = new Inspector()
      containerRef.current!.appendChild(renderer.domElement)
      await renderer.init()

      // Controls
      controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      controls.addEventListener('start', () => {
        isOrbitControlsActive = true
      })
      controls.addEventListener('end', () => {
        isOrbitControlsActive = false
      })

      // Wind tunnel deflectors
      setupDeflectors(scene)

      // Invisible ground plane for raycasting
      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100),
        new THREE.MeshBasicMaterial({ visible: false })
      )
      plane.rotateX(-Math.PI / 2)
      plane.name = 'ground'
      scene.add(plane)

      // Wind tunnel setup: sources in front (negative Z), exits in back (positive Z)
      // Each source has a corresponding exit attractor across the model
      // Left stream
      addGroundSource(new THREE.Vector3(-8, 0, -12))
      addAttractor(new THREE.Vector3(-8, 2, 15))

      // Center stream
      addGroundSource(new THREE.Vector3(0, 0, -12))
      addAttractor(new THREE.Vector3(0, 2, 15))

      // Right stream
      addGroundSource(new THREE.Vector3(8, 0, -12))
      addAttractor(new THREE.Vector3(8, 2, 15))

      // Load UAV model
      const loader = new GLTFLoader()
      const dracoLoader = new DRACOLoader()
      dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/')
      loader.setDRACOLoader(dracoLoader)
      loader.load('/assets/models/drone_uav_wing_desert_camo_gltf/scene.gltf', (gltf) => {
        uavMesh = gltf.scene
        uavMesh.position.set(0, 2, 0)
        uavMesh.scale.set(0.5, 0.5, 0.5)
        scene.add(uavMesh)

        // Calculate bounding sphere for fast collision detection
        const box = new THREE.Box3().setFromObject(uavMesh)
        uavBoundingSphere = new THREE.Sphere()
        box.getBoundingSphere(uavBoundingSphere)

        // Compute flow field around UAV (one-time offline computation)
        const startTime = performance.now()
        flowField = computeFlowField(uavMesh, flowFieldGrid.size, flowFieldGrid.bounds)
        const computeTime = performance.now() - startTime
        console.log(`Flow field computed in ${computeTime.toFixed(2)}ms`)
      })

      // Particles
      const particleData = setupParticles()

      // Initialize source timers
      for (let i = 0; i < groundSources.length; i++) {
        sourceTimers.set(i, 0)
      }

      // Spawn initial batch of particles so we see something immediately
      for (let i = 0; i < groundSources.length; i++) {
        spawnParticles(i, 100, particleData) // 100 particles per source to start
      }

      // Mouse events
      renderer.domElement.addEventListener('pointerdown', onPointerDown)
      window.addEventListener('resize', onWindowResize)

      // Store reference for animate loop
      ;(renderer as any).__particleData = particleData
    }

    function addAttractor(position: THREE.Vector3) {
      // Simple sphere marker
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 16, 16),
        new THREE.MeshStandardMaterial({
          color: '#00aaff',
          emissive: '#0088ff',
          emissiveIntensity: 0.5,
        })
      )
      mesh.position.copy(position)
      scene.add(mesh)

      attractors.push({ position: position.clone(), mesh })
    }

    function addGroundSource(position: THREE.Vector3) {
      // Cylinder marker
      const hue = Math.random()
      const color = new THREE.Color().setHSL(hue, 0.8, 0.6)
      const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(1, 1, 0.2, 16),
        new THREE.MeshStandardMaterial({
          color,
          emissive: color,
          emissiveIntensity: 0.3,
        })
      )
      mesh.position.copy(position)
      mesh.position.y = 0.1
      scene.add(mesh)

      const sourceIndex = groundSources.length
      groundSources.push({ position: position.clone(), mesh })

      // Initialize timer for this source
      sourceTimers.set(sourceIndex, 0)
    }


    function setupParticles() {
      // CPU-managed particle arrays
      const positions = new Float32Array(particleCount * 3)
      const velocities = new Float32Array(particleCount * 3)
      const active = new Uint32Array(particleCount)
      const team = new Uint32Array(particleCount) // Team/source index
      const hasPhysics = new Uint32Array(particleCount) // 1 = affected by attractors, 0 = free fall
      const colors = new Float32Array(particleCount * 3) // RGB color per particle

      // Physics parameters
      const params = {
        attractorMass: 5e7,
        particleMass: 1e4,
        spinningStrength: 0,
        maxSpeed: 12,
        damping: 0.08,
        scale: 0.05,
        gravity: 0,
        collisionRadius: 1.2,
      }

      // Material with instanced rendering and vertex colors
      const material = new THREE.MeshStandardMaterial({
        vertexColors: true,
        emissiveIntensity: 0.6,
      })

      // Create instanced mesh with simple geometry
      const geometry = new THREE.SphereGeometry(1, 8, 8)
      // Set up vertex color attribute
      const colorAttribute = new THREE.BufferAttribute(new Float32Array(particleCount * 3), 3)
      geometry.setAttribute('color', colorAttribute)

      const particles = new THREE.InstancedMesh(geometry, material, particleCount)
      particles.frustumCulled = false

      // Store colors in the instanced color buffer
      ;(particles as any).__colors = colors
      ;(particles as any).__colorAttribute = colorAttribute

      scene.add(particles)

      // Inspector GUI for real-time tweaking
      const gui = renderer.inspector.createParameters('Parameters')

      gui.add({ mass: 7.7 }, 'mass', 1, 10, 0.1).onChange((v: number) => {
        params.attractorMass = 10 ** v
      })
      gui.add(params, 'spinningStrength', 0, 10, 0.1).name('spinningStrength')
      gui.add(params, 'maxSpeed', 1, 30, 0.5).name('maxSpeed')
      gui.add(params, 'damping', 0, 0.3, 0.01).name('damping')
      gui.add(params, 'scale', 0.1, 3, 0.1).name('scale')
      gui.add(params, 'gravity', 0, 30, 0.5).name('gravity')
      gui.add(params, 'collisionRadius', 0.5, 3, 0.1).name('collisionRadius')

      // Return references
      return { positions, velocities, active, team, hasPhysics, colors, particles, params }
    }

    function spawnParticles(sourceIndex: number, count: number, particleData: any) {
      const { positions, velocities, active, team, hasPhysics, colors } = particleData
      const source = groundSources[sourceIndex]
      if (!source) return

      // Get source color
      const mat = groundSources[sourceIndex].mesh.material as any
      const sourceColor = mat.color || { r: 0.5, g: 0.5, b: 0.5 }

      // Spawn particles from this source
      for (let i = 0; i < count; i++) {
        const idx = nextParticleIndex
        nextParticleIndex = (nextParticleIndex + 1) % particleCount

        // Position at source with small random offset
        const sx = source.position.x + (Math.random() - 0.5) * 0.3
        const sy = Math.max(0.5, source.position.y)
        const sz = source.position.z + (Math.random() - 0.5) * 0.3

        // Initial velocity (upward with spread)
        const vx = (Math.random() - 0.5) * 2
        const vy = 4 + Math.random() * 2
        const vz = (Math.random() - 0.5) * 2

        // Write to CPU buffers
        positions[idx * 3] = sx
        positions[idx * 3 + 1] = sy
        positions[idx * 3 + 2] = sz

        velocities[idx * 3] = vx
        velocities[idx * 3 + 1] = vy
        velocities[idx * 3 + 2] = vz

        // Set team and color
        team[idx] = sourceIndex
        colors[idx * 3] = sourceColor.r
        colors[idx * 3 + 1] = sourceColor.g
        colors[idx * 3 + 2] = sourceColor.b

        active[idx] = 1
        hasPhysics[idx] = 1 // Start with physics enabled
      }
    }

    function updateParticles(particleData: any) {
      const { positions, velocities, active, team, hasPhysics, colors, params, particles } = particleData
      const dt = 1 / 60
      const dummy = new THREE.Object3D()
      const scale = params.scale

      // Pre-allocate reusable vectors for collision detection (avoid allocation in loop)
      const particlePos = new THREE.Vector3()
      const velocity = new THREE.Vector3()
      const rayDir = new THREE.Vector3()
      const normalWorld = new THREE.Vector3()
      const deflection = new THREE.Vector3()
      const pushOut = new THREE.Vector3()
      const rayOrigin = new THREE.Vector3()

      for (let i = 0; i < particleCount; i++) {
        if (active[i] === 0) continue

        const posIdx = i * 3
        const velIdx = i * 3

        let fx = 0, fy = 0, fz = 0

        // Check collision with attractors and apply forces if not collided
        if (hasPhysics[i] === 1) {
          let collided = false
          for (let j = 0; j < attractors.length; j++) {
            const aPos = attractors[j].position
            const dx = aPos.x - positions[posIdx]
            const dy = aPos.y - positions[posIdx + 1]
            const dz = aPos.z - positions[posIdx + 2]
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

            // Collision detected - lose physics
            if (dist < params.collisionRadius) {
              hasPhysics[i] = 0
              collided = true
              break
            }

            if (dist < 0.1) continue

            const dirX = dx / dist
            const dirY = dy / dist
            const dirZ = dz / dist

            // Gravity
            const strength =
              (params.attractorMass * params.particleMass * 6.67e-11) / (dist * dist)
            fx += dirX * strength
            fy += dirY * strength
            fz += dirZ * strength

            // Spinning force: Y-axis cross product with attraction vector
            // (0, 1, 0) × (dx, dy, dz) = (dz, 0, -dx)
            const spinX = dz * strength * params.spinningStrength
            const spinY = 0
            const spinZ = -dx * strength * params.spinningStrength

            fx += spinX
            fy += spinY
            fz += spinZ
          }

          if (!collided) {
            // Update velocity with forces
            velocities[velIdx] += fx * dt
            velocities[velIdx + 1] += fy * dt
            velocities[velIdx + 2] += fz * dt

            // Clamp speed
            const velLen = Math.sqrt(
              velocities[velIdx] ** 2 +
              velocities[velIdx + 1] ** 2 +
              velocities[velIdx + 2] ** 2
            )
            if (velLen > params.maxSpeed) {
              velocities[velIdx] = (velocities[velIdx] / velLen) * params.maxSpeed
              velocities[velIdx + 1] = (velocities[velIdx + 1] / velLen) * params.maxSpeed
              velocities[velIdx + 2] = (velocities[velIdx + 2] / velLen) * params.maxSpeed
            }

            // Apply damping
            velocities[velIdx] *= 1 - params.damping
            velocities[velIdx + 1] *= 1 - params.damping
            velocities[velIdx + 2] *= 1 - params.damping
          }
        }

        // If physics disabled, apply gravity
        if (hasPhysics[i] === 0) {
          velocities[velIdx + 1] -= params.gravity * dt
        }

        // Deflector collision detection (wind tunnel wings)
        if (hasPhysics[i] === 1 && deflectors.length > 0) {
          particlePos.set(positions[posIdx], positions[posIdx + 1], positions[posIdx + 2])
          velocity.set(velocities[velIdx], velocities[velIdx + 1], velocities[velIdx + 2])
          const velLen = velocity.length()

          if (velLen > 0.01) {
            rayDir.copy(velocity).normalize()
            rayOrigin.copy(particlePos)

            // Check collision with each deflector
            for (let d = 0; d < deflectors.length; d++) {
              const deflector = deflectors[d]
              const distToDeflector = particlePos.distanceTo(deflector.position)

              // Only ray-cast if near deflector (within 5 units)
              if (distToDeflector < 5.0) {
                raycaster.set(rayOrigin, rayDir)
                const intersects = raycaster.intersectObject(deflector)

                if (intersects.length > 0) {
                  const hit = intersects[0]
                  const hitPoint = hit.point

                  // Get normal in world space
                  if (hit.face && hit.object) {
                    normalWorld.copy(hit.face.normal)
                    normalWorld.transformDirection(hit.object.matrixWorld)
                    normalWorld.normalize()
                  } else {
                    normalWorld.set(0, 1, 0)
                  }

                  // Reflect velocity off surface
                  const dotProduct = velocity.dot(normalWorld)
                  if (dotProduct < 0) {
                    deflection.copy(normalWorld).multiplyScalar(-2 * dotProduct)
                    velocity.add(deflection)
                    velocity.normalize().multiplyScalar(velLen)

                    // Push out to prevent re-collision
                    pushOut.copy(normalWorld).multiplyScalar(0.15)
                    positions[posIdx] = hitPoint.x + pushOut.x
                    positions[posIdx + 1] = hitPoint.y + pushOut.y
                    positions[posIdx + 2] = hitPoint.z + pushOut.z

                    velocities[velIdx] = velocity.x
                    velocities[velIdx + 1] = velocity.y
                    velocities[velIdx + 2] = velocity.z
                  }
                  break // Collision handled, move to next particle
                }
              }
            }
          }
        }

        // Sample pre-computed flow field (aerodynamic deflection)
        if (hasPhysics[i] === 1 && flowField) {
          particlePos.set(positions[posIdx], positions[posIdx + 1], positions[posIdx + 2])

          // Sample velocity from the pre-computed flow field
          const fieldVelocity = sampleFlowField(particlePos, flowField, flowFieldGrid.size, flowFieldGrid.bounds)

          // Blend particle velocity with flow field (follow the streamlines)
          const blendFactor = 0.4 // How strongly to follow the flow field (0=free flow, 1=locked)
          velocities[velIdx] = velocities[velIdx] * (1 - blendFactor) + fieldVelocity.x * blendFactor
          velocities[velIdx + 1] = velocities[velIdx + 1] * (1 - blendFactor) + fieldVelocity.y * blendFactor
          velocities[velIdx + 2] = velocities[velIdx + 2] * (1 - blendFactor) + fieldVelocity.z * blendFactor
        }

        // Update position
        positions[posIdx] += velocities[velIdx] * dt
        positions[posIdx + 1] += velocities[velIdx + 1] * dt
        positions[posIdx + 2] += velocities[velIdx + 2] * dt

        // Kill particles at bounds (wind tunnel: wide inlet/outlet, generous Z range)
        if (
          Math.abs(positions[posIdx]) > 15 ||
          positions[posIdx + 1] < -5 ||
          positions[posIdx + 1] > 15 ||
          positions[posIdx + 2] > 25 ||
          positions[posIdx + 2] < -15
        ) {
          active[i] = 0
          continue
        }

        // Set instance matrix
        dummy.position.set(positions[posIdx], positions[posIdx + 1], positions[posIdx + 2])
        dummy.scale.setScalar(scale)
        dummy.updateMatrix()
        particles.setMatrixAt(i, dummy.matrix)

        // Update color
        const colorAttr = (particles as any).__colorAttribute
        if (colorAttr) {
          colorAttr.setXYZ(i, colors[i * 3], colors[i * 3 + 1], colors[i * 3 + 2])
        }
      }

      particles.instanceMatrix.needsUpdate = true
      const colorAttr = (particles as any).__colorAttribute
      if (colorAttr) colorAttr.needsUpdate = true
    }

    function onPointerDown(event: PointerEvent) {
      // Skip raycasting if orbiting
      if (isOrbitControlsActive) return

      // Convert mouse coordinates to normalized device coordinates
      pointer.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
      )

      // Cast ray from camera through mouse position
      raycaster.setFromCamera(pointer, camera)
      const ground = scene.getObjectByName('ground')
      if (!ground) return

      const intersects = raycaster.intersectObject(ground)

      if (intersects.length > 0) {
        const point = intersects[0].point.clone()

        if (event.shiftKey) {
          // Shift-click: add attractor in sky
          point.y = 3
          addAttractor(point)
        } else {
          // Regular click: add ground source on ground
          addGroundSource(point)
        }
      }
    }

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    function animate() {
      const deltaTime = 1 / 60
      controls.update()

      // Spawn and update particles
      const particleData = (renderer as any).__particleData
      if (particleData) {
        // Spawn from sources
        for (let i = 0; i < groundSources.length; i++) {
          const currentTime = sourceTimers.get(i) || 0
          sourceTimers.set(i, currentTime + deltaTime)

          if (sourceTimers.get(i)! >= sourceSpawnInterval) {
            spawnParticles(i, 10, particleData) // 10 per spawn
            sourceTimers.set(i, 0)
          }
        }

        // Update all particles (physics + rendering)
        updateParticles(particleData)
      }

      renderer.render(scene, camera)
    }

    // Start initialization
    init()

    // Cleanup
    return () => {
      window.removeEventListener('resize', onWindowResize)
      if (renderer) renderer.dispose()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
      }}
    />
  )
}
