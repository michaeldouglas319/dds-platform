'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import {
  FadeTransitionExample,
  ScaleRotateExample,
  CameraAnimationExample,
  SlideAndFadeExample,
  ComplexMultiEffectExample,
  MorphEffectExample
} from './examples'

const examples = [
  {
    name: 'Fade Transition',
    description: 'Simple cross-fade between two model states',
    Component: FadeTransitionExample
  },
  {
    name: 'Scale & Rotate',
    description: 'Combined scale and rotation effects',
    Component: ScaleRotateExample
  },
  {
    name: 'Camera Animation',
    description: 'Camera movement synchronized with fade',
    Component: CameraAnimationExample
  },
  {
    name: 'Slide & Fade',
    description: 'Directional slide with staggered fade',
    Component: SlideAndFadeExample
  },
  {
    name: 'Complex Multi-Effect',
    description: 'Multiple effects with precise timing',
    Component: ComplexMultiEffectExample
  },
  {
    name: 'Morph Effect',
    description: 'Simple cross-fade morph between shapes (recommended: use Framer Motion for production)',
    Component: MorphEffectExample
  }
]

function TransitionPreview({
  name,
  description,
  Component
}: {
  name: string
  description: string
  Component: React.ComponentType
}) {
  return (
    <div className="border rounded-lg overflow-hidden bg-card h-full flex flex-col">
      <div className="p-4 border-b bg-muted/50">
        <h3 className="text-sm font-semibold text-foreground">{name}</h3>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
      <div className="aspect-square bg-black/20 flex-1 overflow-hidden">
        <Canvas camera={{ position: [0, 0, 20], fov: 45 }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[10, 10, 10]} intensity={1} />
          <OrbitControls
            enableZoom={true}
            enablePan={true}
            autoRotate={false}
            minDistance={8}
            maxDistance={40}
          />
          <Component />
        </Canvas>
      </div>
      <div className="p-3 border-t bg-muted/30 text-xs text-muted-foreground">
        🔁 Looping infinitely
      </div>
    </div>
  )
}

export default function TransitionsShowcase() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-3 text-foreground">
            3D Model Transition System
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Modular, plugin-based transitions for React Three Fiber with independent effect timing.
          </p>

          {/* Key Features */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {[
              {
                label: 'Modular Effects',
                desc: 'Fade, Scale, Rotate, Slide, Camera, GLTF Animation, Morph'
              },
              {
                label: 'Simple & Practical',
                desc: 'Focused on battle-tested solutions'
              },
              {
                label: 'GSAP Powered',
                desc: 'Precise timeline orchestration'
              },
              {
                label: 'Geometry Morphing',
                desc: 'Simple cross-fade between models'
              },
              {
                label: 'Plugin System',
                desc: 'Extend with custom effects'
              },
              {
                label: 'Production Ready',
                desc: 'For advanced 3D: Use Framer Motion R3F'
              }
            ].map((feature, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-muted/50 border">
                <div className="font-semibold text-sm text-foreground">
                  {feature.label}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {feature.desc}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap gap-3">
            <a
              href="/docs/transitions"
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              📖 Documentation
            </a>
          </div>
        </div>

        {/* Examples Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-foreground">
            Interactive Examples
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {examples.map((example, index) => (
              <TransitionPreview
                key={index}
                name={example.name}
                description={example.description}
                Component={example.Component}
              />
            ))}
          </div>
        </div>

        {/* Code Examples */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-foreground">
            Quick Start
          </h2>

          <div className="space-y-6">
            <div className="rounded-lg bg-muted/50 border p-6">
              <h3 className="font-semibold text-foreground mb-3">
                Basic Usage
              </h3>
              <pre className="bg-background p-4 rounded border overflow-auto text-xs text-muted-foreground">
                {`import { ModelTransition } from '@/lib/threejs/transitions'

<ModelTransition
  beforeModel={<Model1 />}
  afterModel={<Model2 />}
  trigger="click"
  effects={[
    { type: 'fade', duration: 0.5, target: 'before' },
    { type: 'scale', duration: 0.8, from: 0, to: 1, target: 'after' },
    { type: 'camera', duration: 1.2, from: [0,0,20], to: [5,3,15] }
  ]}
/>`}
              </pre>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-lg bg-muted/50 border p-6">
                <h3 className="font-semibold text-foreground mb-3">
                  Available Effects
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• <strong>fade</strong> - Opacity transitions</li>
                  <li>• <strong>scale</strong> - Scale up/down animations</li>
                  <li>• <strong>rotate</strong> - Rotation around axes</li>
                  <li>• <strong>slide</strong> - Directional movement</li>
                  <li>• <strong>camera</strong> - Camera animation</li>
                  <li>• <strong>gltfAnimation</strong> - Embedded animations</li>
                  <li>• <strong>morph</strong> - Simple cross-fade between models</li>
                  <li className="text-xs pt-2 border-t opacity-75">For advanced 3D animations, use <strong>Framer Motion for React Three Fiber</strong></li>
                </ul>
              </div>

              <div className="rounded-lg bg-muted/50 border p-6">
                <h3 className="font-semibold text-foreground mb-3">
                  Control Modes
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• <strong>click</strong> - Trigger on click</li>
                  <li>• <strong>hover</strong> - Trigger on hover</li>
                  <li>• <strong>manual</strong> - External state control</li>
                  <li>• <strong>reverse</strong> - Toggle back with 2nd click</li>
                  <li>• <strong>timeline</strong> - GSAP timeline control</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 pt-8 border-t">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-muted-foreground">
            <div>
              <p className="font-semibold text-foreground mb-2">Documentation</p>
              <p>
                Full documentation and API reference available in{' '}
                <code className="bg-muted px-2 py-1 rounded text-xs">
                  /lib/threejs/transitions/README.md
                </code>
              </p>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-2">
                Custom Effects
              </p>
              <p>
                Extend the system with custom effects using the plugin registry.
                See <code className="bg-muted px-2 py-1 rounded text-xs">effects/README.md</code>
              </p>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-2">Performance</p>
              <p>
                Optimized with GSAP timeline orchestration and automatic model
                cleanup. Targets 60fps on mid-tier devices.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
