import type { PointerEvent } from 'react'

export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Writes the pointer position inside the element as CSS variables
 * (--mk-pointer-x / --mk-pointer-y in px, --mk-tilt-x / --mk-tilt-y from -1 to 1).
 * CSS decides what to do with them (spotlight, tilt), so React never re-renders.
 */
export const trackPointer = (event: PointerEvent<HTMLElement>): void => {
  const element = event.currentTarget
  const rect = element.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  element.style.setProperty('--mk-pointer-x', `${x}px`)
  element.style.setProperty('--mk-pointer-y', `${y}px`)
  element.style.setProperty('--mk-tilt-x', ((x / rect.width) * 2 - 1).toFixed(3))
  element.style.setProperty('--mk-tilt-y', ((y / rect.height) * 2 - 1).toFixed(3))
}

/** Resets the tilt when the pointer leaves */
export const resetPointer = (event: PointerEvent<HTMLElement>): void => {
  event.currentTarget.style.setProperty('--mk-tilt-x', '0')
  event.currentTarget.style.setProperty('--mk-tilt-y', '0')
}
