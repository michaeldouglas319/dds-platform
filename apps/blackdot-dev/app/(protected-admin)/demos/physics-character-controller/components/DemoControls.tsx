'use client'

import { PropertyPanel, PropertySection, PropertyInput } from '@/components/editor'

interface DemoControlsProps {
  gravity: number
  bounce: number
  maxSpeed: number
  acceleration: number
  jumpForce: number
  onGravityChange: (value: number) => void
  onBounceChange: (value: number) => void
  onMaxSpeedChange: (value: number) => void
  onAccelerationChange: (value: number) => void
  onJumpForceChange: (value: number) => void
  className?: string
}

export function DemoControls({
  gravity,
  bounce,
  maxSpeed,
  acceleration,
  jumpForce,
  onGravityChange,
  onBounceChange,
  onMaxSpeedChange,
  onAccelerationChange,
  onJumpForceChange,
  className = '',
}: DemoControlsProps) {

  return (
    <div className={`rounded-lg overflow-hidden border border-border/50 bg-background/90 backdrop-blur-lg ${className}`}>
      <PropertyPanel
        title="Physics Parameters"
        onApply={() => {
          /* Parameters update in real-time */
        }}
      >
        <PropertySection title="Physics">
          <PropertyInput
            label="Gravity"
            type="range"
            value={gravity}
            min={0}
            max={20}
            step={0.1}
            onChange={(value) => onGravityChange(Number(value))}
          />
          <PropertyInput
            label="Bounce"
            type="range"
            value={bounce}
            min={0}
            max={1}
            step={0.05}
            onChange={(value) => onBounceChange(Number(value))}
          />
        </PropertySection>

        <PropertySection title="Movement">
          <PropertyInput
            label="Max Speed"
            type="range"
            value={maxSpeed}
            min={1}
            max={20}
            step={0.5}
            onChange={(value) => onMaxSpeedChange(Number(value))}
          />
          <PropertyInput
            label="Acceleration"
            type="range"
            value={acceleration}
            min={1}
            max={30}
            step={0.5}
            onChange={(value) => onAccelerationChange(Number(value))}
          />
        </PropertySection>

        <PropertySection title="Jumping">
          <PropertyInput
            label="Jump Force"
            type="range"
            value={jumpForce}
            min={1}
            max={15}
            step={0.25}
            onChange={(value) => onJumpForceChange(Number(value))}
          />
        </PropertySection>
      </PropertyPanel>

      {/* Info Footer */}
      <div className="border-t border-border/50 p-4 text-xs text-foreground/60">
        <p className="font-mono">
          <span className="text-green-500">✓ Physics Active</span>
        </p>
        <p className="mt-2">
          <strong>Controls:</strong> W/A/S/D to move, Space to jump
        </p>
      </div>
    </div>
  )
}
