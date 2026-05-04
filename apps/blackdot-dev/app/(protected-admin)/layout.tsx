import { ReactNode } from 'react'

/**
 * Admin Route Group Layout
 *
 * All routes in (protected-admin) require ADMIN access.
 * Auth is handled by middleware - this layout is just a wrapper.
 *
 * Routes in this group:
 * - /curved-takeoff-orbit - 3D orbital physics demo
 * - /homev2 - Home scene v2
 * - /resumev4 - Resume visualization
 * - /path-orbit-simple - Path orbit simulator
 * - /loaders-showcase - Loading animations showcase
 * - /transitions-showcase - Transition effects showcase
 * - /advanced-functions - Advanced demos
 * - /demos/physics-character-controller - Physics controller demo
 */
export default function ProtectedAdminLayout({
  children,
}: {
  children: ReactNode
}) {
  // Auth handled by middleware/other mechanism
  // No server-side check needed here
  return <>{children}</>
}
