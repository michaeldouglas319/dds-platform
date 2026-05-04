'use client'

import { useRouter } from 'next/navigation'
import { Navigation3DButton, type Navigation3DButtonProps } from './Navigation3DButton'

export interface Navigation3DButton {
  id: string
  label: string
  path: string
  color?: string
}

export interface Navigation3DButtonGridProps {
  buttons: Navigation3DButton[]
  position?: [number, number, number]
  spacing?: number
}

export function Navigation3DButtonGrid({
  buttons,
  position = [0, -3, 0],
  spacing = 1.5,
}: Navigation3DButtonGridProps) {
  const router = useRouter()
  const [posX, posY, posZ] = position

  // Arrange buttons in a row
  const startX = -(buttons.length - 1) * spacing * 0.5

  return (
    <group position={position}>
      {buttons.map((button, index) => (
        <Navigation3DButton
          key={button.id}
          id={button.id}
          label={button.label}
          path={button.path}
          position={[startX + index * spacing, 0, 0]}
          onClick={() => router.push(button.path)}
          color={button.color || '#3b82f6'}
          hoverColor={button.color ? `${button.color}dd` : '#60a5fa'}
        />
      ))}
    </group>
  )
}
