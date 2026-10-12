import { useEffect, useRef, useState } from 'react'

const DEFAULT_OPTIONS: IntersectionObserverInit = { threshold: 0.2 }

/**
 * Reports once when the element first scrolls into view (used for reveal and count-up effects).
 * Falls back to "visible" where IntersectionObserver is unavailable.
 */
export const useInView = <T extends HTMLElement>(options: IntersectionObserverInit = DEFAULT_OPTIONS) => {
  const ref = useRef<T | null>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element || isInView) return undefined
    if (typeof IntersectionObserver === 'undefined') {
      setIsInView(true)
      return undefined
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setIsInView(true)
        observer.disconnect()
      }
    }, options)
    observer.observe(element)
    return () => observer.disconnect()
  }, [isInView, options])

  return { ref, isInView }
}
