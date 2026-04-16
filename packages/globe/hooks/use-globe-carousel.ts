'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type UseGlobeCarouselOptions = {
  length: number
  autoAdvanceMs?: number
  paused?: boolean
}

export type GlobeCarouselApi = {
  focusedIndex: number
  setFocusedIndex: (i: number) => void
  next: () => void
  prev: () => void
  isPaused: boolean
  setPaused: (p: boolean) => void
}

/**
 * Headless carousel state — index, prev/next, optional auto-advance.
 * Keyboard binding is the caller's responsibility (or use `bindKeys`).
 */
export function useGlobeCarousel({
  length,
  autoAdvanceMs,
  paused = false,
}: UseGlobeCarouselOptions): GlobeCarouselApi {
  const [focusedIndex, setIndex] = useState(0)
  const [userPaused, setUserPaused] = useState(paused)
  const savedHandler = useRef<() => void>()

  const next = useCallback(() => {
    if (length === 0) return
    setIndex((i) => (i + 1) % length)
  }, [length])
  const prev = useCallback(() => {
    if (length === 0) return
    setIndex((i) => (i - 1 + length) % length)
  }, [length])

  savedHandler.current = next

  useEffect(() => {
    if (!autoAdvanceMs || autoAdvanceMs <= 0) return
    if (userPaused) return
    const id = window.setInterval(() => savedHandler.current?.(), autoAdvanceMs)
    return () => window.clearInterval(id)
  }, [autoAdvanceMs, userPaused])

  useEffect(() => {
    if (focusedIndex >= length && length > 0) setIndex(0)
  }, [focusedIndex, length])

  return {
    focusedIndex,
    setFocusedIndex: (i: number) => setIndex(Math.max(0, Math.min(length - 1, i))),
    next,
    prev,
    isPaused: userPaused,
    setPaused: setUserPaused,
  }
}
