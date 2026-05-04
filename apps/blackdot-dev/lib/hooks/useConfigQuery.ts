'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export const configKeys = {
  all: ['configs'] as const,
  detail: (key: string) => [...configKeys.all, key] as const,
}

export function useConfigQuery(key: string) {
  return useQuery({
    queryKey: configKeys.detail(key),
    queryFn: async () => {
      const res = await fetch(`/api/config/${encodeURIComponent(key)}`)
      if (!res.ok) throw new Error('Failed to fetch config')
      return res.json()
    },
  })
}

export function useConfigMutation(key: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (value: any) => {
      const res = await fetch(`/api/config/${encodeURIComponent(key)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      })
      if (!res.ok) throw new Error('Failed to update config')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configKeys.detail(key) })
    },
  })
}
