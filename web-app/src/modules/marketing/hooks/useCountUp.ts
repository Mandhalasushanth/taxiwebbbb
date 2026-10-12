import { useEffect, useState } from 'react'
import { prefersReducedMotion } from '../utils/motion'

const DEFAULT_DURATION_MS = 1400

const easeOutCubic = (progress: number): number => 1 - (1 - progress) ** 3

/** Animates a number from 0 to `target` once `isActive` turns true. */
export const useCountUp = (target: number, isActive: boolean, durationMs = DEFAULT_DURATION_MS): number => {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!isActive) return undefined
    if (prefersReducedMotion()) {
      setValue(target)
      return undefined
    }

    const startedAt = performance.now()
    let frame = 0

    // requestAnimationFrame re-schedules itself until the animation completes
    const tick = (now: number): void => {
      const progress = Math.min((now - startedAt) / durationMs, 1)
      setValue(target * easeOutCubic(progress))
      if (progress < 1) frame = window.requestAnimationFrame(tick)
    }

    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [target, isActive, durationMs])

  return value
}
