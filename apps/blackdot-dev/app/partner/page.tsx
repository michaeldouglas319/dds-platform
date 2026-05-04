import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function PartnerPage() {
  // Auth access level verified by middleware (proxy.ts)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Partner Portal</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Welcome to the partner collaboration area!</p>
            <p className="text-sm text-slate-600 mt-4">
              This page requires Partner access level or higher.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
