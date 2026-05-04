'use client'

import { useState } from 'react'
import { useConfigQuery, useConfigMutation } from '@/lib/hooks/useConfigQuery'
import { JsonEditor } from '@/components/composites/JsonEditor'
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function ConfigsPage() {
  const [configKey] = useState('content.test.sample')

  const { data, isLoading, error, refetch } = useConfigQuery(configKey)
  const mutation = useConfigMutation(configKey)

  const handleSave = async (value: object) => {
    try {
      await mutation.mutateAsync(value)
      toast.success('Config updated successfully!')
    } catch (e) {
      toast.error('Failed to update config')
      throw e
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error Loading Config</CardTitle>
            <CardDescription>{String(error)}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <JsonEditor
        title="Config Editor"
        description="Edit application configurations in real-time"
        initialValue={data.value}
        onSave={handleSave}
        isSaving={mutation.isPending}
        onRefresh={async () => { await refetch(); }}
        showRefresh
        metadata={{
          key: data.key,
          version: data.metadata.version,
          lastUpdated: data.metadata.lastUpdated,
          source: data.metadata.source,
          namespace: data.metadata.namespace,
          category: data.metadata.category,
        }}
        tags={data.metadata.tags}
        height="600px"
        theme="vs-dark"
      />
    </div>
  )
}
