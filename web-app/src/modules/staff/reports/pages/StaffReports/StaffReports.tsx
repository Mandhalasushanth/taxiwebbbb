import { Card } from '@shared/components'

import { StaffPageHeader } from '@modules/staff/components'
import './StaffReports.css'

const planned = [
  'Revenue and service-wise revenue',
  'Applications: pending, completed, conversion',
  'Staff performance',
  'Payments and customer growth',
]

export const StaffReports = () => (
  <div className="staff-placeholder">
    <StaffPageHeader title="Reports" subtitle="Revenue, throughput and staff performance." />

    <Card title="Planned for this screen" subtitle="Wire it to the API in services/ when the endpoints are ready.">
      <ul className="staff-placeholder__list">
        {planned.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </Card>
  </div>
)

export default StaffReports
