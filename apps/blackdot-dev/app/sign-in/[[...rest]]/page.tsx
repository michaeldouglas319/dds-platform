'use client'

import { Suspense, useRef } from 'react'
import { SignIn } from "@clerk/nextjs"
import { useSearchParams } from "next/navigation"
import { Canvas } from '@react-three/fiber'
import { BubbleButtonLayout } from '@/components/bubble/BubbleButtonLayout'

function SignInContent() {
  const containerRef = useRef<HTMLDivElement>(null)
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get("redirect_url") || "/dashboard"

  const handleLoginClick = () => {
    // Focus the Clerk form container
    const clerkForm = document.querySelector('[data-clerk-signin]') as HTMLElement
    if (clerkForm) {
      clerkForm.scrollIntoView({ behavior: 'smooth', block: 'center' })
      clerkForm.focus()
    }
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-screen h-screen overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800"
    >
      {/* 3D Canvas Background - allows canvas interactions */}
      <div className="absolute inset-0 pointer-events-auto">
        <Canvas
          eventSource={containerRef as React.RefObject<HTMLElement>}
          eventPrefix="client"
          frameloop="always"
          camera={{ position: [0, 0, 2.5], fov: 50 }}
          dpr={1}
          gl={{
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: false,
            stencil: false,
            depth: true,
          }}
        >
          <ambientLight intensity={2.5} />
          <pointLight position={[5, 5, 5]} intensity={3} color="#ffffff" />
          <pointLight position={[-5, -5, 5]} intensity={2.5} color="#8b5cf6" />
          <pointLight position={[0, 0, 6]} intensity={2} color="#06b6d4" />

          {/* White glowing orb */}
          <mesh position={[0, -0.2, 0]} scale={1.2}>
            <icosahedronGeometry args={[0.8, 5]} />
            <meshStandardMaterial
              color="#ffffff"
              metalness={0.4}
              roughness={0.3}
              emissive="#ffffff"
              emissiveIntensity={0.3}
              toneMapped={true}
            />
          </mesh>

          {/* Interactive 3D Text Layout */}
          <BubbleButtonLayout
            clickable={true}
            onClick={handleLoginClick}
            position={[0, 0, 0]}
            scale={0.3}
            variant="circular"
            title={{
              position: [0, 2.5, 0.5],
              content: "Login",
              fontSize: 1,
              color: "#ffffff",
              depth: -0.6,
              glowScale: 1.2,
            }}
            subtitle={{
              position: [0, -2.8, 0.1],
              content: "Click to authenticate",
              fontSize: 0.3,
              color: "#a0a0a0",
              depth: 0,
              glowScale: 1,
            }}
            darkColor="#202020"
            hoverColor="#06b6d4"
            color="white"
          />
        </Canvas>
      </div>

      {/* Login Form - fully isolated from canvas */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-auto">
        <SignIn
          redirectUrl={redirectUrl}
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
        />
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
}
