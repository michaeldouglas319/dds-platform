'use client'

import React from 'react'

interface ProfileSectionProps {
  imageUrl: string
  imageName: string
  initials: string
  name: string
}

/**
 * Theme-aware Profile Section
 * Displays user profile with avatar and name
 */
export function ProfileSection({
  imageUrl,
  imageName,
  initials,
  name,
}: ProfileSectionProps) {
  return (
    <div className="p-8 border-b border-white/5 bg-white/5">
      <div className="flex items-center gap-4 mb-4">
        <img
          src={imageUrl}
          alt={imageName}
          className="sidebar-avatar"
          style={{
            filter: 'brightness(1.1) contrast(1.15) saturate(1.1)',
          }}
        />
        <div>
          <div className="sidebar-label mb-1">{initials}</div>
          <div className="sidebar-username">{name}</div>
        </div>
      </div>
    </div>
  )
}
