import { ArrowUp } from 'lucide-react'
import { classNames } from '@shared/utils'
import { useScrollProgress } from '../../hooks/useScrollProgress'
import { prefersReducedMotion } from '../../utils/motion'
import './ScrollIndicators.css'

/** Back-to-top appears once the visitor is this far down the page */
const BACK_TO_TOP_THRESHOLD = 0.15
const RING_RADIUS = 22
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
}

/** Back-to-top button whose ring fills as the visitor scrolls down the page */
export const ScrollIndicators = () => {
  const progress = useScrollProgress()
  const isBackToTopVisible = progress > BACK_TO_TOP_THRESHOLD

  return (
    <button
      type="button"
      className={classNames('mk-back-to-top', isBackToTopVisible && 'mk-back-to-top--visible')}
      aria-label="Back to top"
      tabIndex={isBackToTopVisible ? 0 : -1}
      onClick={scrollToTop}
    >
      <svg className="mk-back-to-top__ring" viewBox="0 0 48 48" aria-hidden="true">
        <circle className="mk-back-to-top__track" cx="24" cy="24" r={RING_RADIUS} />
        <circle
          className="mk-back-to-top__value"
          cx="24"
          cy="24"
          r={RING_RADIUS}
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={RING_CIRCUMFERENCE * (1 - progress)}
        />
      </svg>
      <ArrowUp className="mk-back-to-top__icon" aria-hidden="true" />
    </button>
  )
}
