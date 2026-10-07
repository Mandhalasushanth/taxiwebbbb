import { STATUS_LABELS } from '@shared/constants'
import { formatDateTime } from '@shared/utils'

import type { ApplicationEvent } from '@modules/staff/types/staff.types'
import './ApplicationTimeline.css'

export interface ApplicationTimelineProps {
  events: ApplicationEvent[]
}

export const ApplicationTimeline = ({ events }: ApplicationTimelineProps) => (
  <ol className="app-timeline">
    {events.map((event, index) => (
      <li className={`app-timeline__item${index === events.length - 1 ? ' is-current' : ''}`} key={event.id}>
        <span className="app-timeline__dot" aria-hidden="true" />
        <div>
          <p className="app-timeline__label">{STATUS_LABELS[event.status]}</p>
          {event.note && <p className="app-timeline__note">{event.note}</p>}
          <p className="app-timeline__meta">
            {event.actor} · {formatDateTime(event.occurredAt)}
          </p>
        </div>
      </li>
    ))}
  </ol>
)
