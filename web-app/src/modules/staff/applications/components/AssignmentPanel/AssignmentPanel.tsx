import { useState } from 'react'

import { ROLE_LABELS } from '@core/auth'
import { Button } from '@shared/components'
import { formatDateTime } from '@shared/utils'

import type { AssignmentRecord, StaffMember } from '@modules/staff/types/staff.types'
import type { AssignedStaff } from '@modules/staff/types/staff.types'
import './AssignmentPanel.css'

export interface AssignmentPanelProps {
  assignedTo: AssignedStaff | null
  history: AssignmentRecord[]
  agents: StaffMember[]
  canAssign: boolean
  canClaim: boolean
  isSaving: boolean
  onAssign: (staffId: string | null, note?: string) => void
  onClaim: () => void
}

const ACTION_LABELS: Record<AssignmentRecord['action'], string> = {
  ASSIGNED: 'Assigned',
  REASSIGNED: 'Reassigned',
  CLAIMED: 'Claimed',
  UNASSIGNED: 'Returned to bucket',
}

export const AssignmentPanel = ({
  assignedTo,
  history,
  agents,
  canAssign,
  canClaim,
  isSaving,
  onAssign,
  onClaim,
}: AssignmentPanelProps) => {
  const [selected, setSelected] = useState('')
  const [note, setNote] = useState('')

  return (
    <div className="assignment-panel">
      <div className="assignment-panel__current">
        <p className="assignment-panel__label">Assigned to</p>
        {assignedTo ? (
          <p className="assignment-panel__name">
            {assignedTo.name} <span>· {ROLE_LABELS[assignedTo.role]}</span>
          </p>
        ) : (
          <p className="assignment-panel__unassigned">In the agent bucket — nobody has picked this up</p>
        )}
      </div>

      {canAssign && (
        <div className="assignment-panel__form">
          <div className="field">
            <label className="field__label" htmlFor="assignee">
              {assignedTo ? 'Reassign to' : 'Assign to'}
            </label>
            <div className="field__control">
              <select
                id="assignee"
                className="field__input"
                value={selected}
                onChange={(event) => setSelected(event.target.value)}
              >
                <option value="">Select an agent</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.fullName} — {ROLE_LABELS[agent.role]} ({agent.assignedApplications} open)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label className="field__label" htmlFor="assign-note">
              Note (optional)
            </label>
            <div className="field__control">
              <input
                id="assign-note"
                className="field__input"
                value={note}
                placeholder="Why this agent?"
                onChange={(event) => setNote(event.target.value)}
              />
            </div>
          </div>

          <div className="assignment-panel__actions">
            <Button
              size="sm"
              disabled={!selected}
              isLoading={isSaving}
              onClick={() => {
                onAssign(selected, note || undefined)
                setSelected('')
                setNote('')
              }}
            >
              {assignedTo ? 'Reassign' : 'Assign'}
            </Button>
            {assignedTo && (
              <Button size="sm" variant="secondary" disabled={isSaving} onClick={() => onAssign(null)}>
                Return to bucket
              </Button>
            )}
          </div>
        </div>
      )}

      {canClaim && !assignedTo && (
        <Button size="sm" isLoading={isSaving} onClick={onClaim}>
          Claim this application
        </Button>
      )}

      <div className="assignment-panel__history">
        <p className="assignment-panel__label">Assignment history</p>
        {history.length === 0 ? (
          <p className="assignment-panel__empty">No assignment activity yet.</p>
        ) : (
          <ul>
            {history.map((record) => (
              <li key={record.id}>
                <span className="assignment-panel__action">{ACTION_LABELS[record.action]}</span> {record.staffName}
                <span className="assignment-panel__meta">
                  {record.actedBy} · {formatDateTime(record.actedAt)}
                  {record.note ? ` · ${record.note}` : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
