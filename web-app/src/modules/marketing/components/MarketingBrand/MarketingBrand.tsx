import { Link } from 'react-router-dom'
import { routePaths } from '@core/config'
import { classNames } from '@shared/utils'
import { MARKETING_BRAND } from '../../data/marketingContent'
import './MarketingBrand.css'

export interface MarketingBrandProps {
  tone?: 'light' | 'dark'
  onNavigate?: () => void
}

const BRAND_SPLIT_INDEX = 3

/** Logo lock-up matching the login screen ("Tax" + orange "Edge" + FIN SOLUTIONS) */
export const MarketingBrand = ({ tone = 'light', onNavigate }: MarketingBrandProps) => {
  const lead = MARKETING_BRAND.name.slice(0, BRAND_SPLIT_INDEX)
  const accent = MARKETING_BRAND.name.slice(BRAND_SPLIT_INDEX)

  return (
    <Link
      to={routePaths.marketing.home}
      className={classNames('mk-brand', `mk-brand--${tone}`)}
      aria-label={`${MARKETING_BRAND.name} home`}
      onClick={onNavigate}
    >
      <img src={MARKETING_BRAND.iconSrc} alt="" className="mk-brand__icon" width={40} height={40} />
      <span className="mk-brand__text">
        <span className="mk-brand__name">
          <span className="mk-brand__lead">{lead}</span>
          <span className="mk-brand__accent">{accent}</span>
        </span>
        <span className="mk-brand__sub">Fin Solutions</span>
      </span>
    </Link>
  )
}
