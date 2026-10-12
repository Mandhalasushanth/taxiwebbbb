import { useCallback, useEffect, useState } from 'react'
import { prefersReducedMotion } from '../utils/motion'

const DEFAULT_INTERVAL_MS = 6000

/**
 * Index state for a carousel that auto-advances (one timeout per slide, so no loop),
 * pauses while hovered/focused, and never auto-plays for reduced-motion users.
 */
export const useCarousel = (count: number, intervalMs = DEFAULT_INTERVAL_MS) => {
  const [index, setIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [canAutoPlay] = useState(() => !prefersReducedMotion())

  const goTo = useCallback((next: number) => setIndex(((next % count) + count) % count), [count])
  const next = useCallback(() => setIndex((current) => (current + 1) % count), [count])
  const previous = useCallback(() => setIndex((current) => (current - 1 + count) % count), [count])

  useEffect(() => {
    if (!canAutoPlay || isPaused || count < 2) return undefined
    const timer = window.setTimeout(next, intervalMs)
    return () => window.clearTimeout(timer)
  }, [index, isPaused, canAutoPlay, count, intervalMs, next])

  const pause = useCallback(() => setIsPaused(true), [])
  const resume = useCallback(() => setIsPaused(false), [])

  return {
    index,
    isPaused,
    goTo,
    next,
    previous,
    /** Spread on the carousel root to pause on hover and keyboard focus */
    pauseHandlers: { onMouseEnter: pause, onMouseLeave: resume, onFocus: pause, onBlur: resume },
  }
}
