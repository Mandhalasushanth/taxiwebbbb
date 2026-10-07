import { Card } from '@shared/components'

import { StaffPageHeader } from '@modules/staff/components'
import './StaffSettings.css'

const planned = [
  'Organisation profile',
  'Working hours and holidays',
  'Workflow and SLA configuration',
  'Integrations and audit log',
]

export const StaffSettings = () => (
  <div className="staff-placeholder">
    <StaffPageHeader title="Settings" subtitle="Organisation-level configuration." />

    <Card title="Planned for this screen" subtitle="Wire it to the API in services/ when the endpoints are ready.">
      <ul className="staff-placeholder__list">
        {planned.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </Card>
  </div>
)

export default StaffSettings
