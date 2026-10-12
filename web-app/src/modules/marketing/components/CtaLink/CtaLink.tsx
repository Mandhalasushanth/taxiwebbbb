import { Link } from 'react-router-dom'
import type { LinkProps } from 'react-router-dom'
import type { ReactNode } from 'react'
import { classNames } from '@shared/utils'
import './CtaLink.css'

export type CtaLinkVariant = 'primary' | 'outline' | 'ghost' | 'light'
export type CtaLinkSize = 'sm' | 'md' | 'lg'

export interface CtaLinkProps extends LinkProps {
  variant?: CtaLinkVariant
  size?: CtaLinkSize
  fullWidth?: boolean
  icon?: ReactNode
}

/** A router link styled like the app's buttons, used for every marketing call to action */
export const CtaLink = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  className,
  children,
  ...rest
}: CtaLinkProps) => (
  <Link
    {...rest}
    className={classNames(
      'mk-cta',
      `mk-cta--${variant}`,
      `mk-cta--${size}`,
      fullWidth && 'mk-cta--block',
      className,
    )}
  >
    <span>{children}</span>
    {icon && <span className="mk-cta__icon">{icon}</span>}
  </Link>
)
