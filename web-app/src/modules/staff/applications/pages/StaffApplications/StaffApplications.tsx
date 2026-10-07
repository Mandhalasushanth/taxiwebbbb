import { useNavigate } from 'react-router-dom'

import { routePaths } from '@core/config'
import { Badge, EmptyState } from '@shared/components'
import {
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_TONES,
  SERVICE_LABELS,
  STATUS_LABELS,
  STATUS_TONES,
} from '@shared/constants'
import { formatCurrency, formatDate } from '@shared/utils'

import { STAGE_LABELS } from '@modules/staff/constants/staff.constants'
import { DataTable, StaffPageHeader } from '@modules/staff/components'
import type { DataTableColumn } from '@modules/staff/components'
import type { StaffApplication } from '@modules/staff/types/staff.types'
import { ApplicationFilters } from '../../components/ApplicationFilters/ApplicationFilters'
import { useStaffApplications } from '../../hooks/useStaffApplications'
import './StaffApplications.css'

export const StaffApplications = () => {
  const navigate = useNavigate()
  const { data, isLoading, error, filter, setFilter, search, setSearch } = useStaffApplications()

  const columns: Array<DataTableColumn<StaffApplication>> = [
    {
      key: 'applicationId',
      header: 'Application ID',
      render: (row) => (
        <span className="staff-applications__id">
          {row.applicationId}
          {row.isOverdue && <span className="staff-applications__overdue">Overdue</span>}
        </span>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (row) => (
        <span className="staff-applications__customer">
          <span>{row.customer.name}</span>
          <span>{row.customer.mobile}</span>
        </span>
      ),
    },
    { key: 'service', header: 'Service', render: (row) => SERVICE_LABELS[row.service] },
    { key: 'stage', header: 'Stage', render: (row) => STAGE_LABELS[row.stage] },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge tone={STATUS_TONES[row.status]}>{STATUS_LABELS[row.status]}</Badge>,
    },
    {
      key: 'assignedTo',
      header: 'Assigned to',
      render: (row) =>
        row.assignedTo ? (
          row.assignedTo.name
        ) : (
          <span className="staff-applications__unassigned">Agent bucket</span>
        ),
    },
    { key: 'fee', header: 'Fee', align: 'right', render: (row) => formatCurrency(row.fee) },
    {
      key: 'paymentStatus',
      header: 'Payment',
      render: (row) => (
        <Badge tone={PAYMENT_STATUS_TONES[row.paymentStatus]}>
          {PAYMENT_STATUS_LABELS[row.paymentStatus]}
        </Badge>
      ),
    },
    { key: 'createdAt', header: 'Created', render: (row) => formatDate(row.createdAt) },
    { key: 'updatedAt', header: 'Updated', render: (row) => formatDate(row.updatedAt) },
  ]

  return (
    <div className="staff-applications">
      <StaffPageHeader
        title="Applications"
        subtitle="Everything customers have submitted, across every service."
      />

      <ApplicationFilters
        filter={filter}
        search={search}
        onFilterChange={setFilter}
        onSearchChange={setSearch}
      />

      {error ? (
        <EmptyState title="Could not load applications" description={error} />
      ) : (
        <DataTable
          columns={columns}
          rows={data ?? []}
          rowKey={(row) => row.id}
          isLoading={isLoading}
          emptyMessage="No applications match this filter"
          onRowClick={(row) => navigate(routePaths.staff.applicationDetail(row.id))}
        />
      )}
    </div>
  )
}

export default StaffApplications
