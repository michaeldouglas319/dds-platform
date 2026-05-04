'use client'

import React, { ReactNode } from 'react'

interface SidebarFooterProps {
  pageLabel: string
  versionLabel: string
  progressPercentage?: number
  actions?: ReactNode
  isOnline?: boolean
}

/**
 * Theme-aware Sidebar Footer
 * Displays status, version, and action buttons
 */
export function SidebarFooter({
  pageLabel,
  versionLabel,
  progressPercentage = 0,
  actions,
  isOnline = true,
}: SidebarFooterProps) {
  return (
    <footer className="sidebar-footer">
      {/* Profile Status */}
      <div className="sidebar-footer-status">
        <span className="sidebar-footer-label">Profile Status</span>
        <span className="sidebar-footer-badge">
          {isOnline && <div className="sidebar-status-indicator" aria-hidden="true" />}
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </span>
      </div>

      {/* Progress Bar */}
      <div className="sidebar-progress-bar" role="progressbar" aria-valuenow={progressPercentage} aria-valuemin={0} aria-valuemax={100}>
        <div
          className="sidebar-progress-fill"
          style={{ width: `${progressPercentage}%` }}
          aria-hidden="true"
        />
      </div>

      {/* Version Info */}
      <div className="sidebar-footer-version">
        <span className="sidebar-footer-label">{pageLabel} Version</span>
        <span className="sidebar-footer-label">{versionLabel}</span>
      </div>

      {/* Actions */}
      {actions && <div className="sidebar-footer-actions">{actions}</div>}
    </footer>
  )
}
