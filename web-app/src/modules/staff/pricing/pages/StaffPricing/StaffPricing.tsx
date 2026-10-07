import { Card } from '@shared/components'

import { StaffPageHeader } from '@modules/staff/components'
import './StaffPricing.css'

const planned = [
  'Service price and professional fee',
  'Discounts and tax configuration',
  'Service-specific pricing',
  'Active and inactive price lists',
]

export const StaffPricing = () => (
  <div className="staff-placeholder">
    <StaffPageHeader title="Pricing" subtitle="Fees, discounts and tax configuration." />

    <Card title="Planned for this screen" subtitle="Wire it to the API in services/ when the endpoints are ready.">
      <ul className="staff-placeholder__list">
        {planned.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </Card>
  </div>
)

export default StaffPricing
