/**
 * Test Route - Undefined in route-access.config.ts
 * 
 * This route should default to ADMIN access level (secure-by-default)
 * Purpose: Verify that routes not explicitly configured default to ADMIN
 */

export default function TestUndefinedRoute() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Test Undefined Route</h1>
      <p className="text-muted-foreground">
        This route is NOT defined in route-access.config.ts
      </p>
      <p className="mt-4">
        Expected access level: <strong>ADMIN</strong>
      </p>
      <p className="text-sm text-muted-foreground mt-2">
        If you can see this page without admin access, the secure-by-default behavior is not working correctly.
      </p>
    </div>
  )
}
