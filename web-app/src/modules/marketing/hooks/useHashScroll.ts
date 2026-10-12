import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const scrollToHash = (hash: string): boolean => {
  const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null
  target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  return Boolean(target)
}

const scrollToTop = (): void => {
  try {
    window.scrollTo({ top: 0, behavior: 'auto' })
  } catch {
    // Older browsers / test environments without scrollTo options support
    document.documentElement.scrollTop = 0
  }
}

/**
 * React Router does not scroll on navigation: jump to the #section in the URL,
 * or to the top of the page when the route changes without a hash.
 */
export const useHashScroll = (): void => {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    // Wait a frame so lazily rendered sections exist before looking them up
    const frame = window.requestAnimationFrame(() => {
      if (!scrollToHash(hash)) scrollToTop()
    })
    return () => window.cancelAnimationFrame(frame)
  }, [pathname, hash])
}
