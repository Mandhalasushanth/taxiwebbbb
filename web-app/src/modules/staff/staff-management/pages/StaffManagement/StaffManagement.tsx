import { useState } from 'react'

import { Badge, Button, Card, EmptyState, Input, Modal } from '@shared/components'
import { formatDate } from '@shared/utils'

import { DataTable, RoleBadge, StaffPageHeader } from '@modules/staff/components'
import type { DataTableColumn } from '@modules/staff/components'
import type { StaffMember } from '@modules/staff/types/staff.types'
import { PermissionMatrix } from '../../components/PermissionMatrix/PermissionMatrix'
import { StaffForm } from '../../components/StaffForm/StaffForm'
import { useStaffMembers } from '../../hooks/useStaffMembers'
import type { StaffMemberOutput } from '../../validation/staffMemberSchema'
import './StaffManagement.css'

export const StaffManagement = () => {
  const { members, isLoading, error, search, setSearch, isSaving, create, update, setActive } =
    useStaffMembers()

  const [editing, setEditing] = useState<StaffMember | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [showPermissions, setShowPermissions] = useState(false)

  const closeForm = () => {
    setIsFormOpen(false)
    setEditing(null)
  }

  const handleSubmit = async (values: StaffMemberOutput) => {
    const payload = {
      fullName: values.fullName,
      email: values.email,
      mobile: values.mobile,
      role: values.role as StaffMember['role'],
      department: values.department as StaffMember['department'],
      isActive: values.isActive,
    }
    const ok = editing ? await update(editing.id, payload) : await create(payload)
    if (ok) closeForm()
  }

  const columns: Array<DataTableColumn<StaffMember>> = [
    {
      key: 'name',
      header: 'Staff member',
      render: (row) => (
        <span className="staff-management__person">
          <span>{row.fullName}</span>
          <span>
            {row.employeeCode} · {row.email}
          </span>
        </span>
      ),
    },
    { key: 'role', header: 'Role', render: (row) => <RoleBadge role={row.role} /> },
    { key: 'department', header: 'Department', render: (row) => row.department },
    {
      key: 'assigned',
      header: 'Open work',
      align: 'right',
      render: (row) => `${row.assignedApplications}`,
    },
    { key: 'joined', header: 'Joined', render: (row) => formatDate(row.joinedOn) },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge tone={row.isActive ? 'success' : 'neutral'}>{row.isActive ? 'Active' : 'Inactive'}</Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (row) => (
        <span className="staff-management__row-actions">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setEditing(row)
              setIsFormOpen(true)
            }}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={isSaving}
            onClick={() => void setActive(row.id, !row.isActive)}
          >
            {row.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </span>
      ),
    },
  ]

  return (
    <div className="staff-management">
      <StaffPageHeader
        title="Staff management"
        subtitle="Employees, their roles and what each role is allowed to do."
        actions={
          <>
            <Button variant="secondary" onClick={() => setShowPermissions((value) => !value)}>
              {showPermissions ? 'Hide permissions' : 'Role permissions'}
            </Button>
            <Button
              onClick={() => {
                setEditing(null)
                setIsFormOpen(true)
              }}
            >
              Add staff member
            </Button>
          </>
        }
      />

      {showPermissions && (
        <Card
          title="Role permissions"
          subtitle="Shown for reference — the backend enforces these independently."
        >
          <PermissionMatrix />
        </Card>
      )}

      <Input
        name="search"
        className="staff-management__search"
        placeholder="Search by name, email or employee code"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {error ? (
        <EmptyState title="Could not load staff" description={error} />
      ) : (
        <DataTable
          columns={columns}
          rows={members}
          rowKey={(row) => row.id}
          isLoading={isLoading}
          emptyMessage="No staff match that search"
        />
      )}

      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={editing ? `Edit ${editing.fullName}` : 'Add staff member'}
      >
        <StaffForm
          member={editing ?? undefined}
          isSaving={isSaving}
          onSubmit={handleSubmit}
          onCancel={closeForm}
        />
      </Modal>
    </div>
  )
}

export default StaffManagement
