'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_CATEGORIES, NavCategory, NavItem } from '@/lib/config/navigation/navigation.config'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'

interface MobileNavDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileNavDrawer({ open, onOpenChange }: MobileNavDrawerProps) {
  const pathname = usePathname()

  const isItemActive = (href: string): boolean => {
    if (href === '#') return false
    if (pathname === href) return true
    if (pathname.startsWith(href + '/')) return true
    return false
  }

  const handleNavigate = () => {
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 sm:w-96">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-6">
          <nav className="space-y-1 pr-4">
            {/* Home Link */}
            <Link href="/">
              <Button
                variant={pathname === '/' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={handleNavigate}
              >
                Home
              </Button>
            </Link>

            {/* Navigation Categories */}
            <Accordion type="single" collapsible className="w-full">
              {NAV_CATEGORIES.map((category) => (
                <CategoryAccordion
                  key={category.id}
                  category={category}
                  isItemActive={isItemActive}
                  onNavigate={handleNavigate}
                />
              ))}
            </Accordion>
          </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

function CategoryAccordion({
  category,
  isItemActive,
  onNavigate,
}: {
  category: NavCategory
  isItemActive: (href: string) => boolean
  onNavigate: () => void
}) {
  const hasSubmenu = category.items.some((item) => item.submenu && item.submenu.length > 0)

  if (!hasSubmenu && category.items.length === 1) {
    // Single item without submenu - show as direct link
    const item = category.items[0]
    return (
      <Link href={item.href}>
        <Button
          variant={isItemActive(item.href) ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={onNavigate}
        >
          {item.label}
        </Button>
      </Link>
    )
  }

  if (!hasSubmenu && category.items.length > 1) {
    // Multiple items without submenu - show as group
    return (
      <div className="space-y-1 py-2">
        <div className="px-3 py-1.5 font-semibold text-sm">{category.label}</div>
        {category.items.map((item) => (
          <Link key={item.id} href={item.href}>
            <Button
              variant={isItemActive(item.href) ? 'default' : 'ghost'}
              className="w-full justify-start ml-2"
              onClick={onNavigate}
            >
              {item.label}
            </Button>
          </Link>
        ))}
      </div>
    )
  }

  // Has submenu - use accordion
  return (
    <AccordionItem value={category.id} className="border-none">
      <AccordionTrigger className="py-2 hover:no-underline hover:bg-accent px-3 rounded">
        <span className="text-sm font-medium">{category.label}</span>
      </AccordionTrigger>
      <AccordionContent className="pb-2">
        <nav className="space-y-1 ml-2">
          {category.items.map((item) => (
            <CategoryItem
              key={item.id}
              item={item}
              isItemActive={isItemActive}
              onNavigate={onNavigate}
            />
          ))}
        </nav>
      </AccordionContent>
    </AccordionItem>
  )
}

function CategoryItem({
  item,
  isItemActive,
  onNavigate,
}: {
  item: NavItem
  isItemActive: (href: string) => boolean
  onNavigate: () => void
}) {
  if (item.submenu && item.submenu.length > 0) {
    return (
      <Accordion type="single" collapsible>
        <AccordionItem value={item.id} className="border-none">
          <AccordionTrigger className="py-2 hover:no-underline hover:bg-accent px-3 rounded text-sm">
            {item.label}
          </AccordionTrigger>
          <AccordionContent className="pb-2">
            <nav className="space-y-1 ml-2">
              {item.submenu.map((subitem) => (
                <Link key={subitem.id} href={subitem.href}>
                  <Button
                    variant={isItemActive(subitem.href) ? 'default' : 'ghost'}
                    className="w-full justify-start text-sm"
                    size="sm"
                    onClick={onNavigate}
                  >
                    {subitem.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    )
  }

  return (
    <Link href={item.href}>
      <Button
        variant={isItemActive(item.href) ? 'default' : 'ghost'}
        className="w-full justify-start text-sm"
        size="sm"
        onClick={onNavigate}
      >
        {item.label}
      </Button>
    </Link>
  )
}
