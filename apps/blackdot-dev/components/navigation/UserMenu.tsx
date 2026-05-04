'use client'

import React from 'react'
import Link from 'next/link'
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { useAuth } from '@/lib/contexts/AuthContext'
import { AccessLevel, AccessLevelLabels, AccessLevelColors } from '@/lib/types/auth.types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LayoutDashboard, LogOut } from 'lucide-react'

export function UserMenu() {
  const { accessLevel: currentRole, isAuthenticated } = useAuth()

  return (
    <>
      <SignedOut>
        <div className="flex items-center gap-2">
          <SignInButton mode="modal">
            <Button variant="ghost" size="sm" className="h-9">
              Sign In
            </Button>
          </SignInButton>
        </div>
      </SignedOut>

      <SignedIn>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-9 gap-2">
              <UserButton />
              <Badge variant="secondary" className="ml-1 text-xs">
                {AccessLevelLabels[currentRole]}
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Account</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Dashboard Link */}
            <DropdownMenuItem asChild>
              <Link href="/dashboard" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            </DropdownMenuItem>

            {/* Premium Features - Show for Member+ */}
            {(currentRole === AccessLevel.MEMBER_PLUS ||
              currentRole === AccessLevel.PARTNER ||
              currentRole === AccessLevel.ADMIN) && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground">Premium</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href="/premium">Premium Portal</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/influences">Influences</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/configurator">3D Configurator</Link>
                </DropdownMenuItem>
              </>
            )}

            {/* Partner Area - Show for Partner */}
            {(currentRole === AccessLevel.PARTNER || currentRole === AccessLevel.ADMIN) && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground">Partner</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href="/partner">Partner Portal</Link>
                </DropdownMenuItem>
              </>
            )}

            {/* Admin Panel - Show for Admin */}
            {currentRole === AccessLevel.ADMIN && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground">Admin</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href="/admin">Admin Panel</Link>
                </DropdownMenuItem>
              </>
            )}

            <DropdownMenuSeparator />
            {/* Sign Out - Handled by UserButton in the header */}
          </DropdownMenuContent>
        </DropdownMenu>
      </SignedIn>
    </>
  )
}
