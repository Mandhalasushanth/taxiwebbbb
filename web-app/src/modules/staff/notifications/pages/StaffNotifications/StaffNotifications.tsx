import { Card } from '@shared/components'

import { StaffPageHeader } from '@modules/staff/components'
import './StaffNotifications.css'

const planned = [
  'Application and payment alerts',
  'Deadline reminders',
  'Automated customer follow-ups',
  'Notification templates',
]

export const StaffNotifications = () => (
  <div className="staff-placeholder">
    <StaffPageHeader title="Notifications" subtitle="Alerts, reminders and automated follow-ups." />

    <Card title="Planned for this screen" subtitle="Wire it to the API in services/ when the endpoints are ready.">
      <ul className="staff-placeholder__list">
        {planned.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </Card>
  </div>
)

export default StaffNotifications
