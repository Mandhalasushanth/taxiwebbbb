import { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

const SCROLL_THRESHOLD_PX = 12
const DESKTOP_BREAKPOINT_PX = 960

/** Header behaviour: scroll shadow and mobile menu (Escape / resize / navigation close it). */
export const useMarketingHeader = () => {
  const { pathname, hash } = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const closeMenu = useCallback(() => setIsMenuOpen(false), [])
  const toggleMenu = useCallback(() => setIsMenuOpen((open) => !open), [])

  // Any navigation closes the mobile menu
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname, hash])

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > SCROLL_THRESHOLD_PX)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!isMenuOpen) return undefined
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false)
    }
    const onResize = () => {
      if (window.innerWidth >= DESKTOP_BREAKPOINT_PX) setIsMenuOpen(false)
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('resize', onResize)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('resize', onResize)
    }
  }, [isMenuOpen])

  return { isMenuOpen, isScrolled, closeMenu, toggleMenu }
}
