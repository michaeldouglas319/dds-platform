"use client"

import { useRouter, usePathname } from "next/navigation"
import { useCallback } from "react"
import type { UnifiedSection } from "@/lib/config/content/sections"
import type { UnifiedSection as ConfigUnifiedSection } from "@/lib/config/content/sections.config"

type NavigableSection = UnifiedSection | ConfigUnifiedSection

export function useNavigation() {
  const router = useRouter()
  const pathname = usePathname()

  const navigateToSection = useCallback(
    (section: NavigableSection) => {
      if (section.drilldown?.enabled) {
        router.push(`/${section.page}/${section.id}`)
      } else {
        router.push(`/${section.page}`)
      }
    },
    [router],
  )

  const navigateToDrilldown = useCallback(
    (parentSection: NavigableSection, childSection: NavigableSection) => {
      router.push(`/${parentSection.page}/${parentSection.id}/${childSection.id}`)
    },
    [router],
  )

  const goBack = useCallback(() => {
    router.back()
  }, [router])

  return {
    pathname,
    navigateToSection,
    navigateToDrilldown,
    goBack,
  }
}
