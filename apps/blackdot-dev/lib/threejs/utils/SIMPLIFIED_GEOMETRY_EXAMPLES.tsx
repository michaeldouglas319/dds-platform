/**
 * Example implementations of InteractiveGeometry with simplified morphs
 * Copy and adapt these examples for your own use cases
 */

import React, { useState } from 'react'
import { LOW_POLY_GEOMETRY_SETS } from './simplifyGeometry'
import { InteractiveSphere, InteractiveGeometry } from '@/app/landing/components/InteractiveSphere'

// ===== EXAMPLE 1: Basic Sphere Morph =====
// Smooth sphere becomes low-poly on hover
export function SphereExample() {
  return (
    <InteractiveSphere
      position={[0, 0, 0]}
      scale={1}
      geometry={<sphereGeometry args={LOW_POLY_GEOMETRY_SETS.sphere.detailed} />}
      hoverGeometry={<sphereGeometry args={LOW_POLY_GEOMETRY_SETS.sphere.simplified} />}
      morphSpeed={0.12}
      color="#4ECDC4"
      hoverColor="#FF6B9D"
      onClick={() => console.log('Sphere clicked')}
    />
  )
}

// ===== EXAMPLE 2: Torus Morph with Scale =====
// Torus becomes low-poly AND scales up
export function TorusExample() {
  return (
    <InteractiveGeometry
      position={[2, 0, 0]}
      scale={1}
      geometry={<torusGeometry args={LOW_POLY_GEOMETRY_SETS.torus.detailed} />}
      hoverGeometry={<torusGeometry args={LOW_POLY_GEOMETRY_SETS.torus.simplified} />}
      hoverScale={1.2}
      activeScale={1.4}
      morphSpeed={0.15}
      color="#00D9FF"
      hoverColor="#FFD700"
      onClick={() => console.log('Torus interacted')}
    />
  )
}

// ===== EXAMPLE 3: Icosahedron with Fast Morph =====
// Complex polyhedron that morphs quickly
export function IcosahedronExample() {
  return (
    <InteractiveGeometry
      position={[-2, 0, 0]}
      scale={1.5}
      geometry={<icosahedronGeometry args={LOW_POLY_GEOMETRY_SETS.icosahedron.detailed} />}
      hoverGeometry={<icosahedronGeometry args={LOW_POLY_GEOMETRY_SETS.icosahedron.simplified} />}
      morphSpeed={0.25}  // Fast morph
      float={true}
      floatIntensity={0.2}
      floatSpeed={1.5}
      color="#9D4EDD"
      hoverColor="#FF006E"
      hoverScale={1.15}
    />
  )
}

// ===== EXAMPLE 4: Cone Morph with Material Customization =====
// Shows how to customize material properties
export function ConeExample() {
  return (
    <InteractiveGeometry
      position={[0, 2, 0]}
      scale={1}
      geometry={<coneGeometry args={LOW_POLY_GEOMETRY_SETS.cone.detailed} />}
      hoverGeometry={<coneGeometry args={LOW_POLY_GEOMETRY_SETS.cone.simplified} />}
      morphSpeed={0.1}
      color="#3A86FF"
      hoverColor="#FB5607"
      materialProps={{
        metalness: 0.7,
        roughness: 0.1,
        envMapIntensity: 1.5,
      }}
      hoverScale={1.25}
      activeScale={1.4}
      onClick={() => console.log('Cone activated')}
    />
  )
}

// ===== EXAMPLE 5: Cylinder with Event Handlers =====
// Demonstrates all event handlers
export function CylinderExample() {
  return (
    <InteractiveGeometry
      position={[0, -2, 0]}
      scale={1.2}
      geometry={<cylinderGeometry args={LOW_POLY_GEOMETRY_SETS.cylinder.detailed} />}
      hoverGeometry={<cylinderGeometry args={LOW_POLY_GEOMETRY_SETS.cylinder.simplified} />}
      morphSpeed={0.12}
      color="#1A659E"
      hoverColor="#004E89"
      onClick={() => console.log('✓ Clicked')}
      onHover={(hovered) => console.log(`Hover: ${hovered}`)}
      onPointerDown={() => console.log('↓ Pressed')}
      onPointerUp={() => console.log('↑ Released')}
      float={true}
      floatIntensity={0.1}
    />
  )
}

// ===== EXAMPLE 6: Torus Knot - Complex Morph =====
// Most complex example - torus knot morphing
export function TorusKnotExample() {
  return (
    <InteractiveGeometry
      position={[3, 1, 0]}
      scale={0.8}
      geometry={<torusKnotGeometry args={LOW_POLY_GEOMETRY_SETS.torusKnot.detailed} />}
      hoverGeometry={<torusKnotGeometry args={LOW_POLY_GEOMETRY_SETS.torusKnot.simplified} />}
      morphSpeed={0.08}  // Slower for complex morph
      color="#118DFF"
      hoverColor="#8000FF"
      hoverScale={1.2}
      float={true}
      floatIntensity={0.25}
      floatSpeed={2}
      materialProps={{
        metalness: 0.8,
        roughness: 0.2,
      }}
    />
  )
}

// ===== EXAMPLE 7: Collection of Geometries =====
// Multiple interactive geometries in one scene
export function GeometryGrid() {
  return (
    <>
      {/* Top Row */}
      <InteractiveSphere
        position={[-3, 1, 0]}
        scale={0.8}
        geometry={<sphereGeometry args={LOW_POLY_GEOMETRY_SETS.sphere.detailed} />}
        hoverGeometry={<sphereGeometry args={LOW_POLY_GEOMETRY_SETS.sphere.simplified} />}
        morphSpeed={0.12}
        color="#FF006E"
      />

      <InteractiveGeometry
        position={[0, 1, 0]}
        scale={0.9}
        geometry={<icosahedronGeometry args={LOW_POLY_GEOMETRY_SETS.icosahedron.detailed} />}
        hoverGeometry={<icosahedronGeometry args={LOW_POLY_GEOMETRY_SETS.icosahedron.simplified} />}
        morphSpeed={0.15}
        color="#00D9FF"
      />

      <InteractiveGeometry
        position={[3, 1, 0]}
        scale={0.8}
        geometry={<torusGeometry args={LOW_POLY_GEOMETRY_SETS.torus.detailed} />}
        hoverGeometry={<torusGeometry args={LOW_POLY_GEOMETRY_SETS.torus.simplified} />}
        morphSpeed={0.12}
        color="#FFD60A"
      />

      {/* Bottom Row */}
      <InteractiveGeometry
        position={[-3, -1, 0]}
        scale={1}
        geometry={<coneGeometry args={LOW_POLY_GEOMETRY_SETS.cone.detailed} />}
        hoverGeometry={<coneGeometry args={LOW_POLY_GEOMETRY_SETS.cone.simplified} />}
        morphSpeed={0.12}
        color="#3A86FF"
      />

      <InteractiveGeometry
        position={[0, -1, 0]}
        scale={0.85}
        geometry={<cylinderGeometry args={LOW_POLY_GEOMETRY_SETS.cylinder.detailed} />}
        hoverGeometry={<cylinderGeometry args={LOW_POLY_GEOMETRY_SETS.cylinder.simplified} />}
        morphSpeed={0.12}
        color="#06FFA5"
      />

      <InteractiveGeometry
        position={[3, -1, 0]}
        scale={0.75}
        geometry={<torusKnotGeometry args={LOW_POLY_GEOMETRY_SETS.torusKnot.detailed} />}
        hoverGeometry={<torusKnotGeometry args={LOW_POLY_GEOMETRY_SETS.torusKnot.simplified} />}
        morphSpeed={0.1}
        color="#FF006E"
      />
    </>
  )
}

// ===== EXAMPLE 8: Custom Segment Counts =====
// Create custom detailed/simplified pairs without pre-made sets
export function CustomSegmentsExample() {
  return (
    <InteractiveGeometry
      position={[0, 0, 0]}
      scale={1}
      // Ultra smooth to very blocky
      geometry={<sphereGeometry args={[1, 256, 256]} />}
      hoverGeometry={<sphereGeometry args={[1, 4, 4]} />}
      morphSpeed={0.12}
      color="#000000"
      hoverColor="#FFFFFF"
    />
  )
}

// ===== EXAMPLE 9: Minimal Setup =====
// Bare minimum configuration
export function MinimalExample() {
  return (
    <InteractiveSphere
      geometry={<sphereGeometry args={LOW_POLY_GEOMETRY_SETS.sphere.detailed} />}
      hoverGeometry={<sphereGeometry args={LOW_POLY_GEOMETRY_SETS.sphere.simplified} />}
    />
  )
}

// ===== EXAMPLE 10: With Custom Behavior =====
// Full interaction example with state
export function InteractiveExample() {
  const [clicked, setClicked] = React.useState(false)
  const [hovered, setHovered] = React.useState(false)

  return (
    <InteractiveGeometry
      position={[0, 0, 0]}
      scale={clicked ? 1.2 : 1}
      geometry={<sphereGeometry args={LOW_POLY_GEOMETRY_SETS.sphere.detailed} />}
      hoverGeometry={<sphereGeometry args={LOW_POLY_GEOMETRY_SETS.sphere.simplified} />}
      morphSpeed={0.12}
      color={clicked ? '#FF006E' : '#4ECDC4'}
      hoverColor={clicked ? '#FFD60A' : '#FF006E'}
      onClick={() => setClicked(!clicked)}
      onHover={(isHovered) => setHovered(isHovered)}
    />
  )
}
