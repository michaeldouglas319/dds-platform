import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import {
  float,
  instanceIndex,
  Loop,
  uint,
  uniform,
  uniformArray,
  hash,
  vec3,
  instancedArray,
  Fn,
  sin,
  cos,
  PI,
  time,
  vec4,
  mix,
  mod,
  If,
} from 'three/tsl'
import { V3Config } from '../config/attractors.config'
import { AttractorsPhysicsState } from './useAttractorsPhysics'

export interface AttractorParticlesState {
  positionBuffer: unknown
  velocityBuffer: unknown
  stageBuffer: unknown
  material: unknown
  geometry: THREE.BufferGeometry
  updateCompute: unknown
  initCompute: unknown
  reset: () => void
}

/**
 * Manages particle lifecycle: initialization, physics, morphing
 * Follows curved-takeoff-orbit useV3Particles pattern
 */
export function useAttractorParticles(
  config: V3Config,
  physics: AttractorsPhysicsState,
  gl: THREE.WebGLRenderer & { compute?: (compute: unknown) => void }
): AttractorParticlesState {
  const updateComputeRef = useRef<unknown>(null)
  const initComputeRef = useRef<unknown>(null)

  const particleSystem = useMemo(() => {
    const count = config.particleCount

    // Create material
    const material = new (THREE as unknown as { SpriteNodeMaterial: new (...args: unknown[]) => unknown }).SpriteNodeMaterial({
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    // Setup uniforms
    const attractorMass = uniform(config.physics.attractorMass)
    const particleGlobalMass = uniform(config.physics.particleGlobalMass)
    const spinningStrength = uniform(config.physics.spinningStrength)
    const maxSpeed = uniform(config.physics.maxSpeed)
    const velocityDamping = uniform(config.physics.velocityDamping)
    const scale = uniform(config.particles.scale)
    const boundHalfExtent = uniform(config.particles.boundHalfExtent)
    const colorA = uniform(new THREE.Color(config.particles.colorA))
    const colorB = uniform(new THREE.Color(config.particles.colorB))

    // Morph stage uniforms
    const stageLength = uniform(config.morphing.stageLength)
    const attractionPhaseLength = uniform(config.morphing.attractionPhaseLength)
    const orbitalPhaseLength = uniform(config.morphing.orbitalPhaseLength)

    // Attractor uniforms
    const attractorsPositions = uniformArray(physics.positions)
    const attractorsRotationAxes = uniformArray(physics.orientations)
    const attractorsLength = uniform(physics.positions.length, 'uint')

    // Particle buffers
    const positionBuffer = instancedArray(count, 'vec3')
    const velocityBuffer = instancedArray(count, 'vec3')
    const stageBuffer = instancedArray(count, 'float')

    // Spherical to cartesian conversion
    const sphericalToVec3 = Fn((phi: any, theta: any) => {
      const sinPhiRadius = sin(phi)
      return vec3(
        sinPhiRadius.mul(sin(theta)),
        cos(phi),
        sinPhiRadius.mul(cos(theta))
      )
    })

    // Initialize particles
    const init = Fn(() => {
      const position = positionBuffer.element(instanceIndex)
      const velocity = velocityBuffer.element(instanceIndex)
      const stage = stageBuffer.element(instanceIndex)

      const basePosition = vec3(
        hash(instanceIndex.add(uint(Math.random() * 0xffffff))),
        hash(instanceIndex.add(uint(Math.random() * 0xffffff))),
        hash(instanceIndex.add(uint(Math.random() * 0xffffff)))
      )
        .sub(0.5)
        .mul(vec3(5, 0.2, 5))
      position.assign(basePosition)

      const phi = hash(instanceIndex.add(uint(Math.random() * 0xffffff))).mul(PI).mul(2) as unknown
      const theta = hash(instanceIndex.add(uint(Math.random() * 0xffffff))).mul(PI) as unknown
      const baseVelocity = sphericalToVec3(phi, theta).mul(0.05)
      velocity.assign(baseVelocity)
      stage.assign(float(0))
    })

    initComputeRef.current = init().compute(count)

    // Calculate morphing stage
    const calculateMorphStage = Fn((currentTime: any, timeOffset: any) => {
      const adjustedTime = currentTime.add(timeOffset).mod(stageLength)
      const stage = float(0).toVar()

      If(adjustedTime.lessThan(attractionPhaseLength), () => {
        stage.assign(float(0))
      })

      If(adjustedTime.greaterThanEqual(attractionPhaseLength), () => {
        If(adjustedTime.lessThan(attractionPhaseLength.add(orbitalPhaseLength)), () => {
          stage.assign(float(1))
        })
      })

      If(adjustedTime.greaterThanEqual(attractionPhaseLength.add(orbitalPhaseLength)), () => {
        stage.assign(float(2))
      })

      return stage
    })

    // Update particles
    const particleMassMultiplier = hash(instanceIndex.add(uint(Math.random() * 0xffffff)))
      .remap(0.25, 1)
      .toVar()
    const particleMass = particleMassMultiplier.mul(particleGlobalMass).toVar()

    const update = Fn(() => {
      const delta = float(1 / 60).toVar()
      const position = positionBuffer.element(instanceIndex)
      const velocity = velocityBuffer.element(instanceIndex)
      const stage = stageBuffer.element(instanceIndex)

      // Update morph stage
      const timeOffset = hash(instanceIndex).mul(stageLength)
      const morphStage = calculateMorphStage(time, timeOffset)
      stage.assign(morphStage)

      // Apply forces from attractors
      const force = vec3(0).toVar()

      Loop(attractorsLength, ({ i }) => {
        const attractorPosition = attractorsPositions.element(i)
        const attractorRotationAxis = attractorsRotationAxes.element(i)
        const toAttractor = attractorPosition.sub(position)
        const distance = toAttractor.length()
        const direction = toAttractor.normalize()

        const gravityStrength = attractorMass
          .mul(particleMass)
          .mul(config.physics.gravityConstant)
          .div(distance.pow(2))
          .toVar()
        const gravityForce = direction.mul(gravityStrength)
        force.addAssign(gravityForce)

        const spinningForce = attractorRotationAxis.mul(gravityStrength).mul(spinningStrength)
        const spinningVelocity = spinningForce.cross(toAttractor)
        force.addAssign(spinningVelocity)
      })

      // Update velocity and position
      velocity.addAssign(force.mul(delta))
      const speed = velocity.length()
      If(speed.greaterThan(maxSpeed), () => {
        velocity.assign(velocity.normalize().mul(maxSpeed))
      })
      velocity.mulAssign(velocityDamping.oneMinus())

      position.addAssign(velocity.mul(delta))

      const halfHalfExtent = boundHalfExtent.div(2).toVar()
      position.assign(mod(position.add(halfHalfExtent), boundHalfExtent).sub(halfHalfExtent))
    })

    updateComputeRef.current = update().compute(count)

    // Material nodes
    const typedMaterial = material as any
    typedMaterial.positionNode = positionBuffer.toAttribute()

    typedMaterial.colorNode = Fn(() => {
      const velocity = velocityBuffer.toAttribute()
      const stageAttr = stageBuffer.toAttribute()
      const speed = velocity.length()
      const colorMix = speed.div(maxSpeed).smoothstep(0, 0.5)
      const baseColor = mix(colorA, colorB, colorMix)

      // Brighten during orbital phase
      const stageBrightness = mix(
        float(0.6),
        float(1.2),
        stageAttr.smoothstep(0.4, 1.4)
      )

      return vec4(baseColor.mul(stageBrightness), 1)
    })()

    // Scale based on stage
    typedMaterial.scaleNode = particleMassMultiplier.mul(scale).mul(
      mix(float(0.8), float(1.5), stageBuffer.toAttribute().smoothstep(0.4, 1.4))
    )

    // Geometry
    const geometry = new THREE.PlaneGeometry(1, 1)

    const reset = () => {
      const glCompute = (gl as unknown as { compute?: (compute: unknown) => void }).compute
      if (glCompute && initComputeRef.current) {
        glCompute(initComputeRef.current)
      }
    }

    reset()

    return {
      positionBuffer,
      velocityBuffer,
      stageBuffer,
      material,
      geometry,
      updateCompute: updateComputeRef.current,
      initCompute: initComputeRef.current,
      reset,
    }
  }, [config, physics.positions, physics.orientations, gl])

  return particleSystem
}
