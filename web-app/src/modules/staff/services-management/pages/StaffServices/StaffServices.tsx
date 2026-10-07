import { Card } from '@shared/components'

import { StaffPageHeader } from '@modules/staff/components'
import './StaffServices.css'

const planned = [
  'Add, edit and disable a service',
  'Category and description',
  'Requirements and document checklist',
  'Makes the customer services page backend-driven',
]

export const StaffServices = () => (
  <div className="staff-placeholder">
    <StaffPageHeader title="Services" subtitle="The service catalogue the customer app reads from." />

    <Card title="Planned for this screen" subtitle="Wire it to the API in services/ when the endpoints are ready.">
      <ul className="staff-placeholder__list">
        {planned.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </Card>
  </div>
)

export default StaffServices
