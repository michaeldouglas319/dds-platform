'use client'

import { useThree, useFrame } from '@react-three/fiber'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { V3Config } from './config/attractors.config'
import { useAttractorsPhysics } from './hooks/useAttractorsPhysics'
import { AttractorParticleRenderer } from './components/AttractorParticleRenderer'
import { AttractorDebugVisuals } from './components/AttractorDebugVisuals'

interface Particle {
  position: THREE.Vector3
  velocity: THREE.Vector3
  stage: number
  stageProgress: number
}

export interface V3SceneProps {
  config: V3Config
}

export function CurvedTakeoffOrbitV3({ config }: V3SceneProps) {
  const { scene, camera, gl } = useThree()
  const particlesRef = useRef<Particle[]>([])
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useRef(new THREE.Object3D())

  // Setup attractors with interactive controls
  const physics = useAttractorsPhysics(config, scene, camera as THREE.PerspectiveCamera, gl)

  // Setup OrbitControls
  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return
    const controls = new OrbitControls(camera, gl.domElement)
    controls.enableDamping = true
    controls.minDistance = 0.1
    controls.maxDistance = 50
    return () => controls.dispose()
  }, [camera, gl])

  // Initialize particles
  useEffect(() => {
    const particles: Particle[] = []
    for (let i = 0; i < config.particleCount; i++) {
      particles.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 5,
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 5
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1
        ),
        stage: 0,
        stageProgress: Math.random(),
      })
    }
    particlesRef.current = particles
  }, [config.particleCount])

  // Calculate morphing stage for particle
  const calculateStage = (time: number, seed: number): { stage: number; brightness: number } => {
    const stageLength = config.morphing.stageLength
    const offset = (seed * stageLength) % stageLength
    const t = (time + offset) % stageLength

    const attractionEnd = config.morphing.attractionPhaseLength
    const orbitalEnd = attractionEnd + config.morphing.orbitalPhaseLength

    if (t < attractionEnd) {
      return { stage: 0, brightness: 0.6 }
    } else if (t < orbitalEnd) {
      return { stage: 1, brightness: 1.2 }
    } else {
      return { stage: 2, brightness: 0.8 }
    }
  }

  // Main animation loop
  useFrame(({ clock }) => {
    const mesh = meshRef.current
    if (!mesh) return

    const time = clock.getElapsedTime()
    const delta = 1 / 60

    const particles = particlesRef.current
    const { positions, orientations } = physics

    // Update each particle
    particles.forEach((particle, i) => {
      // Calculate forces from attractors
      const force = new THREE.Vector3()
      const gravityConstant = config.physics.gravityConstant

      positions.forEach((pos, j) => {
        const orientation = orientations[j]
        const toAttractor = pos.clone().sub(particle.position)
        const distance = Math.max(toAttractor.length(), 0.1) // Avoid division by zero
        const direction = toAttractor.normalize()

        // Gravity force
        const gravityStrength =
          (config.physics.attractorMass *
            config.physics.particleGlobalMass *
            gravityConstant) /
          (distance * distance)
        const gravityForce = direction.multiplyScalar(gravityStrength)
        force.add(gravityForce)

        // Spinning force
        const spinningForce = orientation
          .clone()
          .multiplyScalar(gravityStrength * config.physics.spinningStrength)
        const spinningVelocity = spinningForce.clone().cross(toAttractor)
        force.add(spinningVelocity)
      })

      // Apply velocity
      particle.velocity.add(force.multiplyScalar(delta))

      // Clamp speed
      const speed = particle.velocity.length()
      if (speed > config.physics.maxSpeed) {
        particle.velocity.normalize().multiplyScalar(config.physics.maxSpeed)
      }

      // Apply damping
      particle.velocity.multiplyScalar(Math.pow(1.0 - config.physics.velocityDamping, delta * 60))

      // Update position
      particle.position.add(particle.velocity.clone().multiplyScalar(delta))

      // Wrap around bounds
      const halfExtent = config.particles.boundHalfExtent / 2
      if (Math.abs(particle.position.x) > halfExtent)
        particle.position.x = -Math.sign(particle.position.x) * halfExtent
      if (Math.abs(particle.position.y) > halfExtent)
        particle.position.y = -Math.sign(particle.position.y) * halfExtent
      if (Math.abs(particle.position.z) > halfExtent)
        particle.position.z = -Math.sign(particle.position.z) * halfExtent

      // Update stage
      const stageInfo = calculateStage(time, i / config.particleCount)
      particle.stage = stageInfo.stage

      // Update instance matrix
      const scale = config.particles.scale * (0.8 + 0.7 * (stageInfo.stage / 2))
      dummy.current.position.copy(particle.position)
      dummy.current.scale.setScalar(scale)
      dummy.current.updateMatrix()
      mesh.setMatrixAt(i, dummy.current.matrix)

      // Update color based on velocity
      const colorA = new THREE.Color(config.particles.colorA)
      const colorB = new THREE.Color(config.particles.colorB)
      const speedFactor = Math.min(speed / config.physics.maxSpeed, 1)
      const color = colorA.lerp(colorB, speedFactor)

      // Apply brightness based on stage
      color.multiplyScalar(stageInfo.brightness)

      if (mesh.instanceColor) {
        mesh.setColorAt(i, color)
        mesh.instanceColor.needsUpdate = true
      }
    })

    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <>
      {/* Debug visualizations */}
      <AttractorDebugVisuals config={config} physics={physics} scene={scene} />

      {/* Particle rendering */}
      <instancedMesh
        ref={meshRef}
        args={[new THREE.PlaneGeometry(1, 1), new THREE.MeshStandardMaterial(), config.particleCount]}
        frustumCulled={false}
      >
        <meshStandardMaterial
          emissive={0x000000}
          emissiveIntensity={1}
          transparent={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </instancedMesh>
    </>
  )
}
