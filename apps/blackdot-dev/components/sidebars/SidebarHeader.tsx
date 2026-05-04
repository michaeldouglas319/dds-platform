'use client'

import React from 'react'
import { LayoutGrid } from 'lucide-react'

interface SidebarHeaderProps {
  avatarSrc?: string
  userName: string
  userInitials: string
  pageLabel: string
}

/**
 * Theme-aware Sidebar Header
 * Displays user profile and page information
 */
export function SidebarHeader({
  avatarSrc = '/assets/michael_douglas_profile.png',
  userName,
  userInitials,
  pageLabel,
}: SidebarHeaderProps) {
  return (
    <header className="sidebar-header">
      {/* HUD scanline effect - reduced opacity for better performance */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />

      <div className="relative z-10">
        {/* Grid Icon Background */}
        <div className="absolute top-0 right-0 p-2 opacity-20">
          <LayoutGrid size={40} strokeWidth={1} aria-hidden="true" />
        </div>

        {/* Profile Section */}
        <div className="flex items-center gap-4 mb-4">
          <img
            src={avatarSrc}
            alt={userName}
            className="sidebar-avatar"
            style={{
              filter: 'brightness(1.1) contrast(1.15) saturate(1.1)',
            }}
          />
          <div>
            <div className="sidebar-label mb-1">{userInitials}</div>
            <div className="sidebar-username">{userName}</div>
          </div>
        </div>

        {/* Page Label */}
        <h2 className="sidebar-page-label">{pageLabel}</h2>
      </div>
    </header>
  )
}
