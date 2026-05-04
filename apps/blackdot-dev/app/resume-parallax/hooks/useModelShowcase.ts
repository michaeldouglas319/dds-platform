'use client'

import { useState } from 'react'
import type { JobSection } from '@/lib/config/content'

interface UseModelShowcaseReturn {
  currentJob: JobSection
  activeIndex: number
  totalJobs: number
  setActiveIndex: (index: number) => void
  navigateNext: () => void
  navigatePrev: () => void
}

export function useModelShowcase(jobs: JobSection[]): UseModelShowcaseReturn {
  const [activeIndex, setActiveIndex] = useState(0)

  const currentJob = jobs[activeIndex]

  const navigateNext = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % jobs.length)
  }

  const navigatePrev = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + jobs.length) % jobs.length)
  }

  const handleSetActiveIndex = (index: number) => {
    const validIndex = ((index % jobs.length) + jobs.length) % jobs.length
    setActiveIndex(validIndex)
  }

  return {
    currentJob,
    activeIndex,
    totalJobs: jobs.length,
    setActiveIndex: handleSetActiveIndex,
    navigateNext,
    navigatePrev
  }
}
