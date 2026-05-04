'use client'

import * as THREE from 'three'
import React, { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerspectiveCamera, Environment, MeshDistortMaterial, ContactShadows } from '@react-three/drei'
import { useSpring } from '@react-spring/core'
import { a } from '@react-spring/three'

const AnimatedMaterial = a(MeshDistortMaterial)

interface BubbleButtonProps {
  /**
   * Callback when bubble is clicked
   */
  onClick?: () => void
  /**
   * Label text to display below bubble
   */
  label?: string
  /**
   * Color when hovered
   */
  hoverColor?: string
  /**
   * Default color
   */
  color?: string
  /**
   * Dark mode color
   */
  darkColor?: string
  /**
   * Background color
   */
  backgroundColor?: string
  /**
   * Dark mode background
   */
  darkBackgroundColor?: string
  /**
   * Scale of bubble
   */
  scale?: number
  /**
   * Enable shadow
   */
  shadow?: boolean
  /**
   * Custom cursor SVG (base64)
   */
  customCursor?: string
  /**
   * Use parent Canvas lighting instead of creating internal lights
   */
  useParentLighting?: boolean
}

function BubbleContent({
  onClick,
  hoverColor = '#E8B059',
  color = 'white',
  darkColor = '#202020',
  darkBackgroundColor = '#f0f0f0',
  scale = 1,
  shadow = true,
  customCursor,
  useParentLighting = false,
}: BubbleButtonProps) {
  const sphere = useRef<THREE.Mesh>(null)
  const light = useRef<THREE.Light>(null)
  const [mode, setMode] = useState(false)
  const [down, setDown] = useState(false)
  const [hovered, setHovered] = useState(false)
  const baseScaleRef = useRef(scale)

  // Update cursor
  useEffect(() => {
    if (customCursor) {
      document.body.style.cursor = hovered ? 'none' : `url('data:image/svg+xml;base64,${customCursor}'), auto`
    } else {
      document.body.style.cursor = hovered ? 'pointer' : 'auto'
    }
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [hovered, customCursor])

  // Mouse follow and float animation
  useFrame((state) => {
    if (light.current) {
      light.current.position.x = state.mouse.x * 20
      light.current.position.y = state.mouse.y * 20
    }
    if (sphere.current) {
      sphere.current.position.x = THREE.MathUtils.lerp(
        sphere.current.position.x,
        hovered ? state.mouse.x / 2 : 0,
        0.2
      )
      sphere.current.position.y = THREE.MathUtils.lerp(
        sphere.current.position.y,
        Math.sin(state.clock.elapsedTime / 1.5) / 6 + (hovered ? state.mouse.y / 2 : 0),
        0.2
      )
    }
  })

  // Update base scale ref when prop changes
  useEffect(() => {
    baseScaleRef.current = scale
  }, [scale])

  // Spring animations
  const { wobble, coat, materialColor, ambient, env } = useSpring({
    wobble: down ? 1.2 : hovered ? 1.05 : 1,
    coat: mode && !hovered ? 0.04 : 1,
    ambient: mode && !hovered ? 1.5 : 0.5,
    env: mode && !hovered ? 0.4 : 1,
    materialColor: hovered ? hoverColor : mode ? darkColor : color,
    config: { mass: 2, tension: 1000, friction: 10 },
  })

  const handlePointerDown = () => setDown(true)

  const handlePointerUp = () => {
    setDown(false)
    setMode(!mode)
    onClick?.()
  }

  return (
    <>
      {!useParentLighting && (
        <>
          <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={75}>
            <a.ambientLight intensity={ambient} />
            <a.pointLight ref={light} position-z={-15} intensity={env} color="#F8C069" />
          </PerspectiveCamera>
          <Environment preset="warehouse" />
        </>
      )}
      <Suspense fallback={null}>
        <a.mesh
          ref={sphere}
          scale={(wobble as any).to((w: number) => w * baseScaleRef.current)}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          <sphereGeometry args={[1, 64, 64]} />
          <AnimatedMaterial
            color={materialColor}
            envMapIntensity={env}
            clearcoat={coat}
            clearcoatRoughness={0}
            metalness={0.1}
          />
        </a.mesh>
        {!useParentLighting && shadow && (
          <ContactShadows
            rotation={[Math.PI / 2, 0, 0]}
            position={[0, -1.6, 0]}
            opacity={mode ? 0.8 : 0.4}
            width={15}
            height={15}
            blur={2.5}
            far={1.6}
          />
        )}
      </Suspense>
    </>
  )
}

/**
 * BubbleButtonContent - Canvas-agnostic 3D bubble content
 * Use this inside an existing <Canvas> to avoid nesting errors
 * Automatically uses parent Canvas lighting
 *
 * @example
 * <Canvas>
 *   <BubbleButtonContent
 *     onClick={() => console.log('Clicked!')}
 *     hoverColor="#FF6B9D"
 *   />
 * </Canvas>
 */
export function BubbleButtonContent(props: BubbleButtonProps) {
  return <BubbleContent {...props} useParentLighting={true} />
}

/**
 * BubbleButton - Interactive 3D bubble button component
 *
 * A reusable, fully animated bubble that:
 * - Floats and follows mouse
 * - Changes color on hover
 * - Scales on click
 * - Toggles between light/dark mode
 * - Physics-based animations with react-spring
 *
 * @example
 * <div className="w-40 h-40">
 *   <BubbleButton
 *     label="Click Me"
 *     onClick={() => console.log('Clicked!')}
 *     hoverColor="#FF6B9D"
 *     color="white"
 *   />
 * </div>
 */
export function BubbleButton({
  onClick,
  label,
  hoverColor = '#E8B059',
  color = 'white',
  darkColor = '#202020',
  backgroundColor = '#f0f0f0',
  darkBackgroundColor = '#202020',
  scale = 1,
  shadow = true,
  customCursor,
}: BubbleButtonProps) {
  const [isDark, setIsDark] = useState(false)

  return (
    <div
      className="relative w-full h-full rounded-lg overflow-hidden transition-colors duration-300"
      style={{
        backgroundColor: isDark ? darkBackgroundColor : backgroundColor,
      }}
    >
      <Canvas>
        <BubbleContent
          onClick={() => {
            setIsDark(!isDark)
            onClick?.()
          }}
          hoverColor={hoverColor}
          color={color}
          darkColor={darkColor}
          darkBackgroundColor={darkBackgroundColor}
          scale={scale}
          shadow={shadow}
          customCursor={customCursor}
        />
      </Canvas>
      {label && (
        <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
          <p className="text-sm font-semibold text-foreground">{label}</p>
        </div>
      )}
    </div>
  )
}
