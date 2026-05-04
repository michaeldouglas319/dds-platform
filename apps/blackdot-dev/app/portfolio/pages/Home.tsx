import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'


export default function Home() {
  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative' }}>
      <Canvas style={{ position: 'absolute', inset: 0 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
      </Canvas>
      <div style={{ position: 'relative', zIndex: 10, height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <h1 style={{ color: 'white', fontSize: 48, margin: 0, textAlign: 'center' }}>React Three Fiber Portfolio</h1>
        <p style={{ color: 'rgba(255,255,255,.85)', maxWidth: '640px', textAlign: 'center' }}>
          A showcase of reusable 3D components, shaders, and performance optimizations.
        </p>
        <div style={{ marginTop: 20 }}>
          <a href="http://localhost:5174" style={{ color: 'white', padding: '10px 18px', background: 'rgba(0,0,0,.4)', borderRadius: 8, textDecoration: 'none' }}>Explore Components</a>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 20, left: 20, zIndex: 10 }}>
        <small style={{ color: 'white' }}>Built with React &rarr; R3F + Drei + GLSL</small>
      </div>
    </div>
  )
}
