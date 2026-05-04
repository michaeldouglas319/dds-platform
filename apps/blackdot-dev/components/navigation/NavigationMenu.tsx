'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_CATEGORIES, filterNavCategoriesByAccess, NavCategory, NavItem } from '@/lib/config/navigation'
import { useAuth } from '@/lib/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'

export function NavigationMenu() {
  const pathname = usePathname()
  const { accessLevel } = useAuth()

  // For now, use simple access level detection
  // This will be improved with proper auth integration
  const categories = NAV_CATEGORIES

  const isItemActive = (href: string): boolean => {
    if (href === '#') return false
    if (pathname === href) return true
    if (pathname.startsWith(href + '/')) return true
    return false
  }

  return (
    <nav className="hidden lg:flex items-center gap-1">
      {categories.map((category) => (
        <CategoryMenu key={category.id} category={category} isItemActive={isItemActive} />
      ))}
    </nav>
  )
}

function CategoryMenu({
  category,
  isItemActive,
}: {
  category: NavCategory
  isItemActive: (href: string) => boolean
}) {
  const hasSubmenu = category.items.some((item) => item.submenu && item.submenu.length > 0)

  if (hasSubmenu) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-sm font-medium h-9"
          >
            {category.label}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            {category.label}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {category.items.map((item) => (
            <NavMenuItemContent key={item.id} item={item} isItemActive={isItemActive} />
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div className="flex items-center">
      {category.items.map((item) => (
        <Link key={item.id} href={item.href}>
          <Button
            variant={isItemActive(item.href) ? 'default' : 'ghost'}
            size="sm"
            className="text-sm h-9"
          >
            {item.label}
          </Button>
        </Link>
      ))}
    </div>
  )
}

function NavMenuItemContent({
  item,
  isItemActive,
}: {
  item: NavItem
  isItemActive: (href: string) => boolean
}) {
  if (item.submenu && item.submenu.length > 0) {
    return (
      <div className="px-2 py-1.5">
        <div className="text-sm font-medium mb-1">{item.label}</div>
        <div className="space-y-1 ml-2">
          {item.submenu.map((subitem) => (
            <Link key={subitem.id} href={subitem.href}>
              <div
                className={cn(
                  'text-sm py-1.5 px-2 rounded hover:bg-accent cursor-pointer',
                  isItemActive(subitem.href) && 'bg-accent font-medium',
                )}
              >
                {subitem.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Link key={item.id} href={item.href}>
      <div
        className={cn(
          'text-sm py-2 px-3 rounded hover:bg-accent cursor-pointer',
          isItemActive(item.href) && 'bg-accent font-medium',
        )}
      >
        {item.label}
      </div>
    </Link>
  )
}
