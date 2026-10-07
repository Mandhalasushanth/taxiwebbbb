import { Card } from '@shared/components'

import { StaffPageHeader } from '@modules/staff/components'
import './StaffCustomers.css'

const planned = [
  'Customer information and KYC',
  'Customer type and assigned executive',
  'Applications, documents and payments',
  'Communications and activity history',
]

export const StaffCustomers = () => (
  <div className="staff-placeholder">
    <StaffPageHeader title="Customers" subtitle="A 360-degree view of every customer and their history." />

    <Card title="Planned for this screen" subtitle="Wire it to the API in services/ when the endpoints are ready.">
      <ul className="staff-placeholder__list">
        {planned.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </Card>
  </div>
)

export default StaffCustomers
