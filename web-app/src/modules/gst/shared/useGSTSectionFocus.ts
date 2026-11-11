import { useEffect, useState, useCallback } from 'react'
import { setReviewEditNavigationActive } from '@shared/edit'

export interface ScrollToSectionOptions {
  offset?: number
  behavior?: ScrollBehavior
}

declare global {
  interface Window {
    __GST_FOCUS_ACTIVE__?: boolean
  }
}

/**
 * Robustly scrolls to a GST section by element ID or mapped section key.
 * Handles DOM timing, layout shifts, collapsibles, and fixed header offsets.
 */
export const scrollToGstSection = (
  sectionIdOrKey: string,
  sectionMap?: Record<string, string>,
  options: ScrollToSectionOptions = {}
): void => {
  const { offset = 100, behavior = 'smooth' } = options
  const targetId = (sectionMap && sectionMap[sectionIdOrKey]) || sectionIdOrKey

  // Top-level steps or generic documents should smoothly scroll to top
  if (
    !targetId ||
    targetId === 'business' ||
    targetId === 'gst-business-details' ||
    targetId === 'gst-business-identity' ||
    targetId === 'documents' ||
    targetId === 'top'
  ) {
    if (typeof window !== 'undefined') {
      window.__GST_FOCUS_ACTIVE__ = false
      window.scrollTo({ top: 0, behavior })
    }
    return
  }

  // Set active focus flag so global ScrollToTop won't interfere
  if (typeof window !== 'undefined') {
    window.__GST_FOCUS_ACTIVE__ = true
  }

  const cleanId = targetId.replace(/^#/, '')

  const performScroll = (): boolean => {
    const el =
      document.getElementById(cleanId) ||
      document.querySelector(`[data-section="${cleanId}"]`) ||
      document.querySelector(`[name="${cleanId}"]`) ||
      document.querySelector(`#${cleanId}`)

    if (!el) return false

    // If section has a toggle button that is collapsed, expand it
    const toggleBtn = el.querySelector<HTMLButtonElement>('.gst-section__toggle[aria-expanded="false"]')
    if (toggleBtn) {
      toggleBtn.click()
    }

    // Native scrollIntoView handles CSS scroll-margin-top correctly across all scroll containers
    if (typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior, block: 'start' })
    }

    // Also verify and adjust window scroll to maintain the 100px breathing room below sticky header
    if (typeof el.getBoundingClientRect === 'function' && typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      const rect = el.getBoundingClientRect()
      if (rect.top < 70 || rect.top > 160) {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop
        const desiredScroll = currentScroll + rect.top - offset
        window.scrollTo({
          top: Math.max(0, desiredScroll),
          behavior,
        })
      }
    }

    return true
  }

  // Attempt immediately
  performScroll()

  // Retry over multiple ticks to survive layout reflows, child mounting, and router scroll events
  const delays = [50, 100, 180, 300, 500, 750]
  delays.forEach((delay, idx) => {
    setTimeout(() => {
      performScroll()
      if (idx === delays.length - 1 && typeof window !== 'undefined') {
        window.__GST_FOCUS_ACTIVE__ = false
      }
    }, delay)
  })
}

/**
 * Shared hook across all GST modules for scrolling to a specific section when navigating from Review Edit.
 */
export const useGSTSectionFocus = (
  focusSection?: string | null,
  sectionMap?: Record<string, string>,
  options?: ScrollToSectionOptions
): void => {
  useEffect(() => {
    if (!focusSection) return
    scrollToGstSection(focusSection, sectionMap, options)
  }, [focusSection, sectionMap])
}

/**
 * Unified, reusable hook for managing section-targeted edit navigation from Review across all GST services.
 * Eliminates duplicate boilerplate and ensures consistent focus locks, scrolling, and highlights.
 */
export const useGSTReviewEditNavigation = (
  sectionMap?: Record<string, string>,
  defaultOptions?: ScrollToSectionOptions
) => {
  const [editSection, setEditSection] = useState<string | null>(null)

  const startSectionEdit = useCallback(
    (section: string | null = null, onNavigate?: () => void, overrideOptions?: ScrollToSectionOptions) => {
      setEditSection(section)
      const options = { ...defaultOptions, ...overrideOptions }
      const targetAnchor = section ? (sectionMap && sectionMap[section]) || section : null

      if (
        typeof window !== 'undefined' &&
        targetAnchor &&
        targetAnchor !== 'business' &&
        targetAnchor !== 'documents' &&
        targetAnchor !== 'top'
      ) {
        window.__GST_FOCUS_ACTIVE__ = true
      }

      if (onNavigate) {
        setReviewEditNavigationActive(true)
        try {
          onNavigate()
        } finally {
          setTimeout(() => {
            setReviewEditNavigationActive(false)
          }, 150)
        }
      }

      if (!targetAnchor || targetAnchor === 'business' || targetAnchor === 'documents' || targetAnchor === 'top') {
        if (typeof window !== 'undefined') {
          window.__GST_FOCUS_ACTIVE__ = false
          window.scrollTo({ top: 0, behavior: options.behavior || 'smooth' })
        }
      } else {
        scrollToGstSection(targetAnchor, sectionMap, options)
      }
    },
    [sectionMap, defaultOptions]
  )

  const clearSectionEdit = useCallback(() => {
    setEditSection(null)
    if (typeof window !== 'undefined') {
      window.__GST_FOCUS_ACTIVE__ = false
    }
  }, [])

  return {
    editSection,
    setEditSection,
    startSectionEdit,
    clearSectionEdit,
  }
}
