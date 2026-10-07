import { SERVICE_LABELS } from '@shared/constants'
import { formatCurrency } from '@shared/utils'

import type { RevenueByService as RevenueByServiceRow } from '@modules/staff/types/staff.types'
import './RevenueByService.css'

export interface RevenueByServiceProps {
  rows: RevenueByServiceRow[]
}

export const RevenueByService = ({ rows }: RevenueByServiceProps) => {
  const max = Math.max(...rows.map((row) => row.amount), 1)

  return (
    <ul className="revenue-by-service">
      {rows.map((row) => (
        <li key={row.service}>
          <div className="revenue-by-service__row">
            <span>{SERVICE_LABELS[row.service]}</span>
            <span className="revenue-by-service__amount">{formatCurrency(row.amount)}</span>
          </div>
          <progress className="revenue-by-service__bar" value={row.amount} max={max} aria-label={SERVICE_LABELS[row.service]} />
        </li>
      ))}
    </ul>
  )
}
