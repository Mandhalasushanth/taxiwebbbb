import { z } from 'zod'

import { STAFF_ROLES } from '@core/auth'
import { REGEX } from '@shared/constants'

import { DEPARTMENTS } from '../../types/staff.types'

const staffRoleValues = STAFF_ROLES as unknown as [string, ...string[]]
const departmentValues = DEPARTMENTS as unknown as readonly [string, ...string[]]

export const staffMemberSchema = z.object({
  fullName: z.string().trim().min(3, 'Enter the full name'),
  email: z.string().trim().regex(REGEX.email, 'Enter a valid work email'),
  mobile: z.string().trim().regex(REGEX.mobile, 'Enter a valid 10-digit mobile number'),
  role: z.enum(staffRoleValues, { message: 'Select a role' }),
  department: z.enum(departmentValues, { message: 'Select a department' }),
  isActive: z.boolean(),
})

export type StaffMemberInput = z.input<typeof staffMemberSchema>
export type StaffMemberOutput = z.output<typeof staffMemberSchema>
