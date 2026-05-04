'use client'

import React, { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useNavigationVisibility } from '@/lib/contexts'
import { cn } from '@/lib/utils'

/** Routes that use full-viewport canvas (no footer, no min-h-screen) */
const FULL_SCREEN_ROUTES = ['/portfolio/landing/v3', '/landing-v3']

/** Landing route: no header, no footer, no extra login (Sign In is in the page button bar) */
const LANDING_ROUTE = '/'

// Dynamically import Clerk components to avoid SSR hydration issues
const UserButton = dynamic(() => import('@clerk/nextjs').then(mod => ({ default: mod.UserButton })), {
  ssr: false,
  loading: () => (
    <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
  )
})

const SignedIn = dynamic(() => import('@clerk/nextjs').then(mod => ({ default: mod.SignedIn })), {
  ssr: false
})

const SignedOut = dynamic(() => import('@clerk/nextjs').then(mod => ({ default: mod.SignedOut })), {
  ssr: false
})

interface AppShellProps {
  children: ReactNode
}

/**
 * AppShell - Simplified global navigation wrapper
 *
 * Architecture:
 * - Uses Clerk's UserButton for authentication (proven, battle-tested)
 * - SidebarLayout for page-level navigation (isolated, independent)
 * - Theme Toggle for dark/light mode
 * - Configurable visibility variants (full, minimal, hidden)
 * - No complex custom navigation - keeps concerns separated
 *
 * Navigation Separation:
 * - Global: Clerk UserButton, Theme Toggle, Logo (AppShell)
 * - Page-level: SidebarLayout (independent, configurable)
 * - Both coexist independently without conflicts
 */
export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const { variant, isVisible, showBreadcrumbs, setIsVisible } = useNavigationVisibility()
  const isFullScreenRoute = FULL_SCREEN_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + '/')
  )
  const isLandingRoute = pathname === LANDING_ROUTE

  // Hidden variant - only show floating toggle button
  if (variant === 'hidden') {
    return (
      <div className="flex flex-col min-h-screen">
        {!isVisible && (
          <button
            onClick={() => setIsVisible(true)}
            className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg backdrop-blur-sm transition-all hover:scale-110 active:scale-95"
            aria-label="Show navigation"
          >
            <Menu className="h-6 w-6" />
          </button>
        )}

        {isVisible && (
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden transition-opacity">
            <div
              className="fixed inset-y-0 left-0 z-50 w-screen max-w-sm bg-background/95 backdrop-blur-xl border-r shadow-lg flex flex-col animate-in slide-in-from-left-full duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b">
                <Link href="/" className="flex items-center gap-2 font-bold">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg" />
                  <span>DDS</span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsVisible(false)}
                >
                  ✕
                </Button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <p className="text-sm text-muted-foreground mb-4">Navigation provided by page sidebars</p>
              </div>
              <div className="p-4 border-t flex items-center justify-between">
                <ThemeToggle />
                <SignedIn>
                  <UserButton />
                </SignedIn>
                <SignedOut>
                  <Link href="/sign-in">
                    <Button size="sm" variant="default">
                      Login
                    </Button>
                  </Link>
                </SignedOut>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1">{children}</main>
      </div>
    )
  }

  // Minimal variant - compact floating header
  if (variant === 'minimal') {
    return (
      <div className="flex flex-col min-h-screen">
        {isVisible && (
          <header className="fixed top-4 left-4 right-4 z-40 max-w-md">
            <div className="flex items-center gap-2 bg-background/60 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 shadow-lg">
              <Link href="/" className="flex items-center gap-2 font-bold text-sm">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg" />
                <span className="hidden sm:inline">DDS</span>
              </Link>
              <div className="flex-1" />
              <ThemeToggle />
              <SignedIn>
                <UserButton />
              </SignedIn>
              <SignedOut>
                <Link href="/sign-in">
                  <Button size="sm" variant="default" className="h-8">
                    Login
                  </Button>
                </Link>
              </SignedOut>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsVisible(false)}
              >
                ✕
              </Button>
            </div>
          </header>
        )}

        {!isVisible && (
          <button
            onClick={() => setIsVisible(true)}
            className="fixed top-4 left-4 z-40 p-2 rounded-lg bg-background/60 hover:bg-background/80 backdrop-blur-xl border border-white/10 shadow-lg transition-all hover:scale-105"
            aria-label="Show navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <main className="flex-1">{children}</main>
      </div>
    )
  }

  // Landing route: no header, no footer, no extra login — page has its own button bar
  if (isLandingRoute) {
    return (
      <div className="h-screen min-h-0 overflow-hidden">
        <main className="flex-1 h-full min-h-0 overflow-hidden">{children}</main>
      </div>
    )
  }

  // Full variant - standard sticky header with Clerk UserButton
  // On full-screen routes: no footer, constrain to viewport so canvas can fill 100vh
  return (
    <div
      className={cn(
        'flex flex-col',
        isFullScreenRoute ? 'h-screen min-h-0 overflow-hidden' : 'min-h-screen'
      )}
    >
      {isVisible && (
        <header className={cn(
          'sticky top-0 z-50 w-full border-b border-white/10 bg-background/50 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40 transition-all duration-300'
        )}>
          <div className="flex h-16 items-center justify-between px-4 md:px-6">
            {/* Logo / Branding */}
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg" />
              <span className="hidden sm:inline">DDS</span>
            </Link>

            {/* Center - Spacer */}
            <div className="flex-1" />

            {/* Right Side - Theme Toggle + Clerk UserButton */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <SignedIn>
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: 'h-10 w-10'
                    }
                  }}
                />
              </SignedIn>
              <SignedOut>
                <Link href="/sign-in">
                  <Button size="sm" variant="default">
                    Login
                  </Button>
                </Link>
              </SignedOut>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsVisible(false)}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Close navigation</span>
              </Button>
            </div>
          </div>

          {/* Breadcrumbs Row - Conditional */}
          {showBreadcrumbs && (
            <div className="border-t border-white/5 px-4 md:px-6 py-2 bg-background/20 backdrop-blur-sm">
              <nav className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                <Link href="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
              </nav>
            </div>
          )}
        </header>
      )}

      {/* Toggle Button When Hidden */}
      {!isVisible && (
        <button
          onClick={() => setIsVisible(true)}
          className="fixed top-4 right-4 z-40 p-2.5 rounded-lg bg-background/60 hover:bg-background/80 backdrop-blur-xl border border-white/10 shadow-lg transition-all hover:scale-105 active:scale-95"
          aria-label="Show navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      {/* Main Content */}
      <main className={cn('flex-1', isFullScreenRoute && 'min-h-0 overflow-hidden')}>
        {children}
      </main>

      {/* Footer - hidden on full-screen routes so canvas can fill viewport */}
      {!isFullScreenRoute && (
        <footer className="border-t border-white/10 bg-background/50 backdrop-blur-lg py-4 px-4 md:px-4">
          <div className="container mx-auto text-center text-sm text-muted-foreground">
            <p>&copy; 2026 Michael Douglas. All rights reserved.</p>
          </div>
        </footer>
      )}
    </div>
  )
}
