import { Card } from '@shared/components'

import { StaffPageHeader } from '@modules/staff/components'
import './StaffDocuments.css'

const planned = [
  'Documents pending verification',
  'Verify, reject and request a replacement',
  'Document checklist per service',
  'Download and preview',
]

export const StaffDocuments = () => (
  <div className="staff-placeholder">
    <StaffPageHeader title="Documents" subtitle="Everything customers have uploaded, waiting for verification." />

    <Card title="Planned for this screen" subtitle="Wire it to the API in services/ when the endpoints are ready.">
      <ul className="staff-placeholder__list">
        {planned.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </Card>
  </div>
)

export default StaffDocuments
