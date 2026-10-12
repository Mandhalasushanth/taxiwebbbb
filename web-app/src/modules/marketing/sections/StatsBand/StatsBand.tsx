import { appConfig } from '@core/config'
import { useCountUp } from '../../hooks/useCountUp'
import { useInView } from '../../hooks/useInView'
import { MARKETING_STATS } from '../../data/marketingContent'
import type { MarketingStat } from '../../types/marketing.types'
import './StatsBand.css'

const numberFormatter = new Intl.NumberFormat(appConfig.defaultLocale, { maximumFractionDigits: 1 })

const decimalsOf = (value: number): number => (Number.isInteger(value) ? 0 : 1)

const formatStat = (value: number, target: number): string => {
  const decimals = decimalsOf(target)
  return numberFormatter.format(Number(value.toFixed(decimals)))
}

interface StatItemProps {
  stat: MarketingStat
  isActive: boolean
}

const StatItem = ({ stat, isActive }: StatItemProps) => {
  const value = useCountUp(stat.value, isActive)
  return (
    <li className="mk-stats__item">
      <span className="mk-stats__value">
        {formatStat(value, stat.value)}
        <span className="mk-stats__suffix">{stat.suffix}</span>
      </span>
      <span className="mk-stats__label">{stat.label}</span>
    </li>
  )
}

/** Animated counters that start when the band scrolls into view */
export const StatsBand = () => {
  const { ref, isInView } = useInView<HTMLDivElement>()

  return (
    <section className="mk-stats" aria-label="Our impact in numbers">
      <div ref={ref} className="mk-container">
        <ul className="mk-stats__list">
          {MARKETING_STATS.map((stat) => (
            <StatItem key={stat.id} stat={stat} isActive={isInView} />
          ))}
        </ul>
      </div>
    </section>
  )
}
