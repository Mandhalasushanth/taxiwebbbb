import { Link } from 'react-router-dom'
import { routePaths } from '@core/config'
import { classNames } from '@shared/utils'
import { FinsolzBrand } from '@shared/components'
import './MarketingBrand.css'

export interface MarketingBrandProps {
  tone?: 'light' | 'dark'
  onNavigate?: () => void
}

/** Logo lock-up for Finsolz: "Finsolz" + "— Simplifying Your Fin Journey —" */
export const MarketingBrand = ({ tone = 'light', onNavigate }: MarketingBrandProps) => {
  return (
    <Link
      to={routePaths.marketing.home}
      className={classNames('mk-brand', `mk-brand--${tone}`)}
      aria-label="Finsolz - Simplifying Your Fin Journey"
      onClick={onNavigate}
    >
      <img src="/finsolz-icon.png" alt="" className="mk-brand__icon" width={40} height={40} />
      <FinsolzBrand size="md" align="center" taglineTone="light" />
    </Link>
  )
}
