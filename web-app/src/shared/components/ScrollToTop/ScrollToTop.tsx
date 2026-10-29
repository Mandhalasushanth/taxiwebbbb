import React, { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

export interface ScrollToTopProps {
  /** Optional children if used as a wrapper component */
  children?: React.ReactNode
  /** Whether to scroll to matching #hash if present, defaults to true */
  allowHashScroll?: boolean
}

/**
 * Universal scroll-to-top function that resets scroll position across
 * window, documentElement, body, and any custom scroll containers in the app.
 */
export const resetScrollToTop = (allowHashScroll = true): void => {
  if (typeof window === 'undefined') return

  if (allowHashScroll && window.location.hash) {
    try {
      const id = decodeURIComponent(window.location.hash.replace('#', ''))
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    } catch {
      // Fallback to top if hash is invalid
    }
  }

  // Window scroll
  try {
    if (typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
    }
  } catch {
    try {
      window.scrollTo(0, 0)
    } catch {
      // jsdom or legacy environments
    }
  }

  // Document & body scroll
  if (typeof document !== 'undefined') {
    if (document.documentElement) {
      document.documentElement.scrollTop = 0
    }
    if (document.body) {
      document.body.scrollTop = 0
    }

    // Custom layout scrollable containers (e.g. .shell__main, .shell__content, main, #root)
    const containers = document.querySelectorAll<HTMLElement>(
      '.shell, .shell__main, .shell__content, main, [data-scroll-container], #root'
    )
    containers.forEach((el) => {
      if (el && el.scrollTop !== 0) {
        el.scrollTop = 0
      }
    })
  }
}

/**
 * Global shared component that ensures every page and screen in the web app
 * opens from the top (0, 0) upon navigation or screen changes.
 */
export const ScrollToTop: React.FC<ScrollToTopProps> = ({
  children,
  allowHashScroll = true,
}) => {
  const location = useLocation()
  const prevKeyRef = useRef<string | null>(null)

  useEffect(() => {
    // Disable browser default scroll restoration if available so navigation doesn't retain old scroll
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      try {
        window.history.scrollRestoration = 'manual'
      } catch {
        // Ignore if unsupported
      }
    }
  }, [])

  useEffect(() => {
    // Immediate scroll reset
    resetScrollToTop(allowHashScroll)

    // Run again on the next animation frame to catch late-mounting children / layout reflow
    const rafId = typeof requestAnimationFrame === 'function'
      ? requestAnimationFrame(() => {
          resetScrollToTop(allowHashScroll)
        })
      : null

    // Also run a short timeout check for async lazy chunks / Suspense resolution
    const timeoutId = setTimeout(() => {
      resetScrollToTop(allowHashScroll)
    }, 60)

    prevKeyRef.current = location.key

    return () => {
      if (rafId !== null && typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(rafId)
      }
      clearTimeout(timeoutId)
    }
  }, [location.pathname, location.search, location.hash, location.key, allowHashScroll])

  return children ? <>{children}</> : null
}

export default ScrollToTop

