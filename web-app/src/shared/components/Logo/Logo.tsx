import type { HTMLAttributes, FC } from 'react'
import { classNames } from '../../utils/formatUtils'
import './Logo.css'

export interface FinsolzBrandProps {
  size?: 'sm' | 'md' | 'lg'
  taglineTone?: 'light' | 'dark'
  align?: 'center' | 'left'
  className?: string
  showTagline?: boolean
}

export const FinsolzBrand: FC<FinsolzBrandProps> = ({
  size = 'md',
  taglineTone = 'light',
  align = 'center',
  className = '',
  showTagline = true,
}) => {
  return (
    <div
      className={`finsolz-brand finsolz-brand--${size} finsolz-brand--${taglineTone} finsolz-brand--align-${align} ${className}`}
      aria-label="Finsolz - Simplifying Your Fin Journey"
    >
      <span className="finsolz-brand__name" aria-hidden="true">
        <span className="finsolz-brand__fin">
          F<span className="finsolz-brand__i-wrap"><span className="finsolz-brand__i-dot" />ı</span>n
        </span>
        <span className="finsolz-brand__solz">solz</span>
      </span>
      {showTagline && (
        <span className="finsolz-brand__tag" aria-hidden="true">
          <span className="finsolz-brand__tag-dash">—</span>
          <span className="finsolz-brand__tag-text">Simplifying Your Fin Journey</span>
          <span className="finsolz-brand__tag-dash">—</span>
        </span>
      )}
    </div>
  )
}

export type LogoSize = 'sm' | 'md' | 'lg' | 'xl'
export type LogoVariant = 'dark' | 'light'

export interface LogoProps extends HTMLAttributes<HTMLDivElement> {
  size?: LogoSize
  variant?: LogoVariant
  showText?: boolean
  subtitle?: string
}

export const Logo = ({
  size = 'md',
  variant = 'light',
  showText = true,
  subtitle,
  className,
  ...rest
}: LogoProps) => (
  <div
    {...rest}
    className={classNames(
      'taxedge-logo',
      `taxedge-logo--${size}`,
      `taxedge-logo--${variant}`,
      className,
    )}
  >
    <img
      src="/finsolz-icon.png"
      alt="Finsolz Logo"
      className="taxedge-logo__img"
      loading="eager"
    />
    {showText && (
      <div className="taxedge-logo__text-group">
        <FinsolzBrand
          size={size === 'xl' || size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'md'}
          taglineTone={variant === 'dark' ? 'dark' : 'light'}
          align="center"
          showTagline={Boolean(subtitle)}
        />
      </div>
    )}
  </div>
)

export default Logo
