import { requireAdmin } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AdminPage() {
  await requireAdmin()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Admin Panel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Admin access granted. You can manage application settings here.</p>
            <div className="p-4 bg-slate-100 rounded">
              <p className="text-sm text-slate-600">More admin features coming soon...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
