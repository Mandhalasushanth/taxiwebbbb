import type { ReactNode } from 'react'
import { classNames } from '@shared/utils'
import { useInView } from '../../hooks/useInView'

export interface RevealProps {
  children: ReactNode
  className?: string
  /** Stagger delay in ms for items revealed together */
  delayMs?: number
}

/** Fades its content up the first time it scrolls into view */
export const Reveal = ({ children, className, delayMs = 0 }: RevealProps) => {
  const { ref, isInView } = useInView<HTMLDivElement>()

  return (
    <div
      ref={ref}
      className={classNames('mk-reveal', isInView && 'mk-reveal--visible', className)}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  )
}
