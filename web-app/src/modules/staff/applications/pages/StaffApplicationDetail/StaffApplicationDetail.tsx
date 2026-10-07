import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { isAgentRole, roleHasPermission } from '@core/auth'
import { routePaths } from '@core/config'
import { Badge, Button, Card, EmptyState, Loader } from '@shared/components'
import {
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_TONES,
  SERVICE_LABELS,
  STATUS_LABELS,
  STATUS_TONES,
} from '@shared/constants'
import { formatCurrency, formatDate, formatDateTime, formatFileSize } from '@shared/utils'
import { useAuthStore } from '@store/index'

import { NEXT_STATUSES, STAGE_LABELS } from '@modules/staff/constants/staff.constants'
import { StaffPageHeader } from '@modules/staff/components'
import { useAssignableAgents } from '@modules/staff/staff-management/hooks/useAssignableAgents'
import { ApplicationTimeline } from '../../components/ApplicationTimeline/ApplicationTimeline'
import { AssignmentPanel } from '../../components/AssignmentPanel/AssignmentPanel'
import { useStaffApplication } from '../../hooks/useStaffApplication'
import './StaffApplicationDetail.css'

export const StaffApplicationDetail = () => {
  const { applicationId } = useParams<{ applicationId: string }>()
  const user = useAuthStore((state) => state.user)
  const { data, isLoading, error, isSaving, assign, changeStatus, raiseQuery, addNote } =
    useStaffApplication(applicationId)
  const { data: agents } = useAssignableAgents()

  const [queryText, setQueryText] = useState('')
  const [noteText, setNoteText] = useState('')

  if (isLoading) return <Loader label="Loading application" />
  if (error || !data || !user) {
    return (
      <EmptyState
        title="Application not found"
        description={error ?? undefined}
        action={
          <Link to={routePaths.staff.applications}>
            <Button variant="secondary">Back to applications</Button>
          </Link>
        }
      />
    )
  }

  const canAssign = roleHasPermission(user.role, 'applications.assign')
  const canClaim = roleHasPermission(user.role, 'assignments.claim') && isAgentRole(user.role)
  const canChangeStage = roleHasPermission(user.role, 'applications.stage.update')
  const canQuery = roleHasPermission(user.role, 'applications.query')
  const nextStatuses = NEXT_STATUSES[data.status]

  return (
    <div className="staff-application">
      <StaffPageHeader
        breadcrumb={
          <>
            <Link to={routePaths.staff.applications}>Applications</Link>
            <span aria-hidden="true"> / </span>
            <span>{data.applicationId}</span>
          </>
        }
        title={data.customer.name}
        subtitle={`${SERVICE_LABELS[data.service]} · ${data.applicationId} · ${STAGE_LABELS[data.stage]} stage`}
        actions={
          <>
            <Badge tone={STATUS_TONES[data.status]}>{STATUS_LABELS[data.status]}</Badge>
            <Badge tone={PAYMENT_STATUS_TONES[data.paymentStatus]}>
              {PAYMENT_STATUS_LABELS[data.paymentStatus]}
            </Badge>
          </>
        }
      />

      <div className="staff-application__grid">
        <div className="staff-application__column">
          <Card title="Application">
            <dl className="staff-application__facts">
              <div>
                <dt>Customer</dt>
                <dd>
                  {data.customer.name} · {data.customer.mobile}
                </dd>
              </div>
              <div>
                <dt>Service</dt>
                <dd>{SERVICE_LABELS[data.service]}</dd>
              </div>
              <div>
                <dt>Fee</dt>
                <dd>{formatCurrency(data.fee)}</dd>
              </div>
              <div>
                <dt>Due on</dt>
                <dd className={data.isOverdue ? 'is-overdue' : undefined}>
                  {formatDate(data.dueOn)}
                  {data.isOverdue ? ' · overdue' : ''}
                </dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{formatDate(data.createdAt)}</dd>
              </div>
              <div>
                <dt>Last update</dt>
                <dd>{formatDateTime(data.updatedAt)}</dd>
              </div>
            </dl>
          </Card>

          {canChangeStage && (
            <Card title="Move this application" subtitle="Only the transitions the workflow allows are offered.">
              {nextStatuses.length === 0 ? (
                <p className="staff-application__muted">This application has reached the end of the workflow.</p>
              ) : (
                <div className="staff-application__stage-actions">
                  {nextStatuses.map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={status === 'REJECTED' || status === 'CANCELLED' ? 'danger' : 'secondary'}
                      disabled={isSaving}
                      onClick={() => changeStatus(status)}
                    >
                      {STATUS_LABELS[status]}
                    </Button>
                  ))}
                </div>
              )}
            </Card>
          )}

          <Card title="Documents" subtitle={`${data.documents.length} uploaded`}>
            <ul className="staff-application__documents">
              {data.documents.map((document) => (
                <li key={document.id}>
                  <div>
                    <p className="staff-application__document-name">{document.name}</p>
                    <p className="staff-application__meta">
                      {formatFileSize(document.sizeBytes)} · {document.uploadedBy} ·{' '}
                      {formatDate(document.uploadedAt)}
                    </p>
                  </div>
                  <Badge tone={document.isVerified ? 'success' : 'warning'}>
                    {document.isVerified ? 'Verified' : 'To verify'}
                  </Badge>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Queries" subtitle="Raised to the customer or to admin">
            {data.queries.length === 0 ? (
              <p className="staff-application__muted">No queries on this application.</p>
            ) : (
              <ul className="staff-application__queries">
                {data.queries.map((query) => (
                  <li key={query.id}>
                    <p>{query.message}</p>
                    <p className="staff-application__meta">
                      {query.raisedBy} · {formatDateTime(query.raisedAt)} ·{' '}
                      {query.isResolved ? 'Resolved' : 'Awaiting response'}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            {canQuery && (
              <form
                className="staff-application__compose"
                onSubmit={(event) => {
                  event.preventDefault()
                  if (!queryText.trim()) return
                  void raiseQuery(queryText.trim())
                  setQueryText('')
                }}
              >
                <textarea
                  className="staff-application__textarea"
                  rows={2}
                  placeholder="What does the customer need to fix or provide?"
                  value={queryText}
                  onChange={(event) => setQueryText(event.target.value)}
                />
                <Button type="submit" size="sm" disabled={!queryText.trim()} isLoading={isSaving}>
                  Raise query
                </Button>
              </form>
            )}
          </Card>

          <Card title="Internal notes" subtitle="Visible to staff only">
            {data.notes.length === 0 ? (
              <p className="staff-application__muted">No notes yet.</p>
            ) : (
              <ul className="staff-application__notes">
                {data.notes.map((note) => (
                  <li key={note.id}>
                    <p>{note.message}</p>
                    <p className="staff-application__meta">
                      {note.author} · {formatDateTime(note.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            <form
              className="staff-application__compose"
              onSubmit={(event) => {
                event.preventDefault()
                if (!noteText.trim()) return
                void addNote(noteText.trim())
                setNoteText('')
              }}
            >
              <textarea
                className="staff-application__textarea"
                rows={2}
                placeholder="Add a note for whoever picks this up next"
                value={noteText}
                onChange={(event) => setNoteText(event.target.value)}
              />
              <Button type="submit" size="sm" variant="secondary" disabled={!noteText.trim()} isLoading={isSaving}>
                Add note
              </Button>
            </form>
          </Card>
        </div>

        <div className="staff-application__column">
          <Card title="Assignment">
            <AssignmentPanel
              assignedTo={data.assignedTo}
              history={data.assignmentHistory}
              agents={agents ?? []}
              canAssign={canAssign}
              canClaim={canClaim}
              isSaving={isSaving}
              onAssign={(staffId, note) => void assign(staffId, note)}
              onClaim={() => void assign(user.id, 'Claimed from the agent bucket')}
            />
          </Card>

          <Card title="Progress">
            <ApplicationTimeline events={data.timeline} />
          </Card>
        </div>
      </div>
    </div>
  )
}

export default StaffApplicationDetail
