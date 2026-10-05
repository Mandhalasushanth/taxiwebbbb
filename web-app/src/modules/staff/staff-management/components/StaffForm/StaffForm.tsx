import { ROLE_LABELS, STAFF_ROLES } from '@core/auth'
import { Button, Input } from '@shared/components'
import { useZodForm } from '@shared/hooks'
import { formatMobile } from '@shared/utils'

import { DEPARTMENTS } from '../../../types/staff.types'
import type { StaffMember } from '../../../types/staff.types'
import { staffMemberSchema } from '../../validation/staffMemberSchema'
import type { StaffMemberInput, StaffMemberOutput } from '../../validation/staffMemberSchema'
import './StaffForm.css'

export interface StaffFormProps {
  member?: StaffMember
  isSaving: boolean
  onSubmit: (values: StaffMemberOutput) => Promise<void>
  onCancel: () => void
}

export const StaffForm = ({ member, isSaving, onSubmit, onCancel }: StaffFormProps) => {
  const initial: StaffMemberInput = {
    fullName: member?.fullName ?? '',
    email: member?.email ?? '',
    mobile: member?.mobile ?? '',
    role: member?.role ?? 'GST_AGENT',
    department: member?.department ?? 'Compliance',
    isActive: member?.isActive ?? true,
  }

  const form = useZodForm(staffMemberSchema, initial, onSubmit)

  return (
    <form className="staff-form" onSubmit={form.handleSubmit} noValidate>
      <Input
        name="fullName"
        label="Full name"
        value={String(form.values.fullName)}
        error={form.errors.fullName}
        onChange={form.handleChange}
        required
      />

      <div className="staff-form__row">
        <Input
          name="email"
          type="email"
          label="Work email"
          value={String(form.values.email)}
          error={form.errors.email}
          onChange={form.handleChange}
          required
        />
        <Input
          name="mobile"
          label="Mobile"
          inputMode="numeric"
          prefix="+91"
          value={String(form.values.mobile)}
          error={form.errors.mobile}
          onChange={(e) => form.setValue('mobile', formatMobile(e.target.value))}
          required
        />
      </div>

      <div className="staff-form__row">
        <div className="field">
          <label className="field__label" htmlFor="role">
            Role
          </label>
          <div className="field__control">
            <select
              id="role"
              name="role"
              className="field__input"
              value={String(form.values.role)}
              onChange={form.handleChange}
            >
              {STAFF_ROLES.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </select>
          </div>
          {form.errors.role && <p className="field__error">{form.errors.role}</p>}
        </div>

        <div className="field">
          <label className="field__label" htmlFor="department">
            Department
          </label>
          <div className="field__control">
            <select
              id="department"
              name="department"
              className="field__input"
              value={String(form.values.department)}
              onChange={form.handleChange}
            >
              {DEPARTMENTS.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </div>
          {form.errors.department && <p className="field__error">{form.errors.department}</p>}
        </div>
      </div>

      <label className="staff-form__toggle">
        <input
          type="checkbox"
          checked={Boolean(form.values.isActive)}
          onChange={(event) => form.setValue('isActive', event.target.checked)}
        />
        <span>Active — can sign in and be assigned work</span>
      </label>

      {form.errors.form && <p className="staff-form__error">{form.errors.form}</p>}

      <div className="staff-form__actions">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSaving || form.isSubmitting}>
          {member ? 'Save changes' : 'Add staff member'}
        </Button>
      </div>
    </form>
  )
}
