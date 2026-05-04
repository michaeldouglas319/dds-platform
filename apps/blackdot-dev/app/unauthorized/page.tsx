import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { auth } from '@clerk/nextjs/server'
import { getUserRole } from '@/lib/auth'
import { AccessLevelLabels } from '@/lib/types/auth.types'

export default async function UnauthorizedPage() {
  const { userId } = await auth()
  const role = await getUserRole()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8 flex items-center justify-center">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-destructive">Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>You don't have permission to access this page.</p>

          {userId && (
            <div className="p-4 bg-slate-100 rounded">
              <p className="text-sm text-slate-600">
                Your current access level: <strong>{AccessLevelLabels[role]}</strong>
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button asChild variant="default">
              <Link href="/">Go Home</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
