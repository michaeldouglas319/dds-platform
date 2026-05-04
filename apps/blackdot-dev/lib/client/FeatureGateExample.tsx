'use client'

/**
 * Example: Using Feature Gate Hooks
 *
 * This file demonstrates how to use the feature gate hooks in client components.
 * Copy the patterns here to gate features behind user access levels.
 */

import { useAuth } from '@/lib/contexts/AuthContext'
import { AccessLevel, AccessLevelWeight } from '@/lib/types/auth.types'

const AccessLevelLabels: Record<string, string> = {
  everyone: 'Everyone',
  member: 'Member',
  member_plus: 'Premium Member',
  partner: 'Partner',
  admin: 'Administrator',
}

/**
 * Example 1: Simple admin-only feature
 */
export function AdminOnlyPanel() {
  const { accessLevel } = useAuth()
  const isAdmin = accessLevel === AccessLevel.ADMIN

  if (!isAdmin) {
    return null
  }

  return (
    <div style={{ border: '2px solid red', padding: '1rem', margin: '1rem 0' }}>
      <h3>🔐 Admin Only Panel</h3>
      <p>This content is only visible to admins</p>
      <button>Debug Tools</button>
      <button>Config Editor</button>
      <button>User Management</button>
    </div>
  )
}

/**
 * Example 2: Premium-only feature
 */
export function PremiumFeature() {
  const { accessLevel } = useAuth()
  const isPremium = AccessLevelWeight[accessLevel] >= AccessLevelWeight[AccessLevel.MEMBER_PLUS]

  return (
    <div style={{ border: '2px solid gold', padding: '1rem', margin: '1rem 0' }}>
      <h3>✨ Premium Feature</h3>
      {isPremium ? (
        <p>You have access to premium features!</p>
      ) : (
        <p style={{ color: 'gray' }}>Upgrade to access premium features</p>
      )}
      <button disabled={!isPremium}>Export Data</button>
      <button disabled={!isPremium}>Advanced Analytics</button>
    </div>
  )
}

/**
 * Example 3: Display user's current access level
 */
export function UserAccessBadge() {
  const { accessLevel } = useAuth()
  const label = AccessLevelLabels[accessLevel]

  const colors: Record<string, string> = {
    everyone: '#ccc',
    member: '#4CAF50',
    member_plus: '#2196F3',
    partner: '#FF9800',
    admin: '#F44336',
  }

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '0.25rem 0.75rem',
        borderRadius: '1rem',
        backgroundColor: colors[accessLevel] || '#ccc',
        color: 'white',
        fontSize: '0.875rem',
        fontWeight: 'bold',
      }}
    >
      {label}
    </span>
  )
}

/**
 * Example 4: Conditional rendering with multiple access levels
 */
export function FeatureTiers() {
  const { accessLevel } = useAuth()
  const isAdmin = accessLevel === AccessLevel.ADMIN
  const isPremium = AccessLevelWeight[accessLevel] >= AccessLevelWeight[AccessLevel.MEMBER_PLUS]

  return (
    <div style={{ margin: '1rem 0' }}>
      <h3>Feature Tiers</h3>

      {/* Everyone can see basic features */}
      <div style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
        <input type="checkbox" defaultChecked disabled /> Basic Dashboard (Always available)
      </div>

      {/* Premium members can see this */}
      {isPremium && (
        <div style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
          <input type="checkbox" defaultChecked disabled /> Advanced Analytics (Premium)
        </div>
      )}

      {/* Admins can see this */}
      {isAdmin && (
        <div style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
          <input type="checkbox" defaultChecked disabled /> System Configuration (Admin)
        </div>
      )}
    </div>
  )
}

/**
 * Example 5: Disabled state vs hidden
 *
 * Choose based on UX:
 * - Hidden: User doesn't know feature exists
 * - Disabled: User knows about feature but can't access it (better for discovery)
 */
export function FeatureAccessComparison() {
  const { accessLevel } = useAuth()
  const isPremium = AccessLevelWeight[accessLevel] >= AccessLevelWeight[AccessLevel.MEMBER_PLUS]

  return (
    <div style={{ margin: '1rem 0' }}>
      <h3>Feature Access Patterns</h3>

      {/* Pattern 1: Hidden (return null) */}
      {isPremium && (
        <div style={{ padding: '0.5rem', backgroundColor: '#f0f0f0', margin: '0.5rem 0' }}>
          Hidden Pattern: This div only renders if premium
        </div>
      )}

      {/* Pattern 2: Disabled but visible */}
      <button
        disabled={!isPremium}
        title={!isPremium ? 'Premium feature - upgrade to access' : ''}
        style={{ margin: '0.5rem 0' }}
      >
        Disabled Pattern: Click to Export (Premium)
      </button>

      {/* Pattern 3: Show different content */}
      <div
        style={{
          padding: '0.5rem',
          backgroundColor: isPremium ? '#f0f0f0' : '#ffe0e0',
          margin: '0.5rem 0',
        }}
      >
        Conditional Pattern: {isPremium ? 'You have premium access!' : 'Upgrade for premium access'}
      </div>
    </div>
  )
}

/**
 * Example 6: Complete admin dashboard
 */
export function AdminDashboard() {
  const { accessLevel } = useAuth()
  const isAdmin = accessLevel === AccessLevel.ADMIN

  if (!isAdmin) {
    return (
      <div style={{ padding: '1rem', textAlign: 'center', color: 'red' }}>
        You do not have access to this page. Admin access required.
      </div>
    )
  }

  return (
    <div style={{ border: '2px solid darkred', padding: '1rem', margin: '1rem 0' }}>
      <h2>🛠️ Admin Dashboard</h2>

      <section style={{ marginBottom: '1rem' }}>
        <h3>System Configuration</h3>
        <button>Edit Database Settings</button>
        <button>Manage API Keys</button>
        <button>View System Logs</button>
      </section>

      <section style={{ marginBottom: '1rem' }}>
        <h3>User Management</h3>
        <button>View All Users</button>
        <button>Assign Roles</button>
        <button>Reset Passwords</button>
      </section>

      <section>
        <h3>Debug Tools</h3>
        <button>Performance Monitor</button>
        <button>Database Inspector</button>
        <button>Cache Manager</button>
      </section>
    </div>
  )
}
