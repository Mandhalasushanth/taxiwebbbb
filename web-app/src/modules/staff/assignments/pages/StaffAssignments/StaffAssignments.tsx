import { Card } from '@shared/components'

import { StaffPageHeader } from '@modules/staff/components'
import './StaffAssignments.css'

const planned = [
  'Applications ready for assignment',
  'Claim from the bucket',
  'Manager assignment and reassignment',
  'Assignment history per application',
]

export const StaffAssignments = () => (
  <div className="staff-placeholder">
    <StaffPageHeader title="Assignments" subtitle="The agent bucket, claims and reassignment." />

    <Card title="Planned for this screen" subtitle="Wire it to the API in services/ when the endpoints are ready.">
      <ul className="staff-placeholder__list">
        {planned.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </Card>
  </div>
)

export default StaffAssignments
