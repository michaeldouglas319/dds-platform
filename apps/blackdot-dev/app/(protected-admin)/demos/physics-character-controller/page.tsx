'use client'

import { useState } from 'react'
import { ArticleLayout } from './components/ArticleLayout'
import { ArticleContent } from './components/ArticleContent'
import { PhysicsDemo } from './components/PhysicsDemo'
import { DemoControls } from './components/DemoControls'
import { physicsDemoConfig } from './config/article.config'
import { Button } from '@/components/ui/button'

export default function PhysicsCharacterControllerPage() {
  // Physics parameters state
  const [gravity, setGravity] = useState(9.81)
  const [bounce, setBounce] = useState(0.3)
  const [maxSpeed, setMaxSpeed] = useState(10)
  const [acceleration, setAcceleration] = useState(15)
  const [jumpForce, setJumpForce] = useState(7.5)
  const [fullScreen, setFullScreen] = useState(false)

  if (fullScreen) {
    return (
      <div className="w-screen h-screen flex flex-col bg-background overflow-hidden">
        {/* Full Screen 3D View */}
        <div className="flex-1 overflow-hidden">
          <PhysicsDemo
            gravity={gravity}
            bounce={bounce}
            maxSpeed={maxSpeed}
            acceleration={acceleration}
            jumpForce={jumpForce}
          />
        </div>

        {/* Controls Panel - Bottom Right Corner */}
        <div className="fixed bottom-6 right-6 max-w-sm max-h-96 overflow-y-auto bg-background/95 backdrop-blur-md border border-border/50 rounded-lg p-6 shadow-2xl z-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-sm">Physics Controls</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFullScreen(false)}
              className="text-xs"
            >
              Exit Fullscreen
            </Button>
          </div>
          <DemoControls
            gravity={gravity}
            bounce={bounce}
            maxSpeed={maxSpeed}
            acceleration={acceleration}
            jumpForce={jumpForce}
            onGravityChange={setGravity}
            onBounceChange={setBounce}
            onMaxSpeedChange={setMaxSpeed}
            onAccelerationChange={setAcceleration}
            onJumpForceChange={setJumpForce}
          />
        </div>

        {/* Instructions - Top Left */}
        <div className="fixed top-6 left-6 bg-background/95 backdrop-blur-md border border-border/50 rounded-lg p-4 shadow-lg z-50 max-w-xs text-sm">
          <p className="font-semibold mb-2">Controls:</p>
          <ul className="space-y-1 text-xs text-foreground/80">
            <li><strong>W/A/S/D</strong> - Move</li>
            <li><strong>Space</strong> - Jump</li>
          </ul>
        </div>
      </div>
    )
  }

  const demoPanel = (
    <div className="space-y-4">
      <div className="aspect-video rounded-lg overflow-hidden border border-border/50 bg-background/50">
        <PhysicsDemo
          gravity={gravity}
          bounce={bounce}
          maxSpeed={maxSpeed}
          acceleration={acceleration}
          jumpForce={jumpForce}
        />
      </div>
      <div className="space-y-3">
        <DemoControls
          gravity={gravity}
          bounce={bounce}
          maxSpeed={maxSpeed}
          acceleration={acceleration}
          jumpForce={jumpForce}
          onGravityChange={setGravity}
          onBounceChange={setBounce}
          onMaxSpeedChange={setMaxSpeed}
          onAccelerationChange={setAcceleration}
          onJumpForceChange={setJumpForce}
        />
        <Button
          onClick={() => setFullScreen(true)}
          variant="default"
          className="w-full"
        >
          Fullscreen Mode
        </Button>
      </div>
    </div>
  )

  return (
    <ArticleLayout
      metadata={physicsDemoConfig.metadata}
      demoPanel={demoPanel}
    >
      <ArticleContent config={physicsDemoConfig} />
    </ArticleLayout>
  )
}
