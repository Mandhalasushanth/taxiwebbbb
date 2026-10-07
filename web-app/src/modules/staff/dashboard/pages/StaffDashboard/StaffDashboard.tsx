import { Link } from 'react-router-dom'

import { ROLE_LABELS } from '@core/auth'
import { routePaths } from '@core/config'
import { Badge, Card, EmptyState, Loader } from '@shared/components'
import { SERVICE_LABELS, STATUS_LABELS, STATUS_TONES } from '@shared/constants'
import { formatDate } from '@shared/utils'
import { useAuthStore } from '@store/index'

import { StaffPageHeader, StatTile } from '@modules/staff/components'
import { PipelineBar } from '../../components/PipelineBar/PipelineBar'
import { RevenueByService } from '../../components/RevenueByService/RevenueByService'
import { useStaffDashboard } from '../../hooks/useStaffDashboard'
import './StaffDashboard.css'

export const StaffDashboard = () => {
  const user = useAuthStore((state) => state.user)
  const { data, isLoading, error } = useStaffDashboard()

  if (isLoading) return <Loader fullPage label="Loading the staff dashboard" />
  if (error || !data || !user) {
    return <EmptyState title="Could not load the dashboard" description={error ?? undefined} />
  }

  return (
    <div className="staff-dashboard">
      <StaffPageHeader
        title={`Welcome back, ${user.fullName.split(' ')[0]}`}
        subtitle={`Signed in as ${ROLE_LABELS[user.role]}${user.department ? ` · ${user.department}` : ''}`}
      />

      <section className="staff-dashboard__section">
        <h2 className="staff-dashboard__heading">Work</h2>
        <div className="staff-dashboard__tiles">
          {data.work.map((metric) => (
            <StatTile key={metric.id} label={metric.label} value={metric.value} hint={metric.hint} />
          ))}
        </div>
      </section>

      <section className="staff-dashboard__section">
        <h2 className="staff-dashboard__heading">Money and growth</h2>
        <div className="staff-dashboard__tiles">
          {data.revenue.map((metric) => (
            <StatTile key={metric.id} label={metric.label} value={metric.value} hint={metric.hint} />
          ))}
        </div>
      </section>

      <div className="staff-dashboard__columns">
        <Card title="Revenue by service" subtitle="This financial year">
          <RevenueByService rows={data.revenueByService} />
        </Card>

        <Card title="Lead pipeline" subtitle="Where applications are sitting right now">
          <PipelineBar stages={data.pipeline} />
        </Card>
      </div>

      <Card
        title="Needs attention"
        subtitle="Overdue or waiting in the agent bucket"
        actions={
          <Link className="staff-dashboard__link" to={routePaths.staff.applications}>
            All applications
          </Link>
        }
      >
        {data.needsAttention.length === 0 ? (
          <p className="staff-dashboard__muted">Nothing is overdue or unassigned. Good place to be.</p>
        ) : (
          <ul className="staff-dashboard__attention">
            {data.needsAttention.map((application) => (
              <li key={application.id}>
                <Link to={routePaths.staff.applicationDetail(application.id)}>
                  <div>
                    <p className="staff-dashboard__attention-title">
                      {application.applicationId} · {application.customer.name}
                    </p>
                    <p className="staff-dashboard__attention-meta">
                      {SERVICE_LABELS[application.service]} · due {formatDate(application.dueOn)} ·{' '}
                      {application.assignedTo ? application.assignedTo.name : 'unassigned'}
                    </p>
                  </div>
                  <Badge tone={application.isOverdue ? 'danger' : STATUS_TONES[application.status]}>
                    {application.isOverdue ? 'Overdue' : STATUS_LABELS[application.status]}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

export default StaffDashboard
