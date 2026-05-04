'use client'

import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export interface NavigationButton {
  id: string
  label: string
  path: string
  icon?: string
}

export interface NavigationButtonBlockProps {
  buttons: NavigationButton[]
  className?: string
  variant?: 'grid' | 'row' | 'column'
}

export function NavigationButtonBlock({
  buttons,
  className,
  variant = 'grid',
}: NavigationButtonBlockProps) {
  const router = useRouter()

  const layoutClasses = {
    grid: 'grid grid-cols-2 gap-3 md:grid-cols-4',
    row: 'flex flex-wrap gap-3',
    column: 'flex flex-col gap-3',
  }

  return (
    <div className={cn(layoutClasses[variant], className)}>
      {buttons.map((button) => (
        <button
          key={button.id}
          onClick={() => router.push(button.path)}
          className={cn(
            'group relative px-6 py-4 rounded-lg',
            'bg-primary/10 hover:bg-primary/20 transition-all',
            'border border-primary/20 hover:border-primary/40',
            'text-foreground font-medium text-sm md:text-base',
            'active:scale-95 cursor-pointer'
          )}
        >
          {button.icon && <span className="mr-2">{button.icon}</span>}
          {button.label}
        </button>
      ))}
    </div>
  )
}
