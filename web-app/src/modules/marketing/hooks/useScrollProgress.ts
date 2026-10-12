import { useEffect, useState } from 'react'

/** Page scroll progress from 0 to 1, updated at most once per animation frame. */
export const useScrollProgress = (): number => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let frame = 0

    const measure = () => {
      frame = 0
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement
      const scrollable = scrollHeight - clientHeight
      setProgress(scrollable > 0 ? Math.min(scrollTop / scrollable, 1) : 0)
    }

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return progress
}
