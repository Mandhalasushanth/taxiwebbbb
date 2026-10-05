/** Standardized role names — identical to the backend enum. */
export const USER_ROLES = [
  'CUSTOMER',
  'SUPER_ADMIN',
  'ADMIN',
  'MANAGER',
  'GST_AGENT',
  'ITR_AGENT',
  'LOAN_AGENT',
  'INSURANCE_AGENT',
  'REGISTRATION_AGENT',
  'ACCOUNTS_AGENT',
] as const
export type UserRole = (typeof USER_ROLES)[number]

export const STAFF_ROLES = USER_ROLES.filter((role): role is StaffRole => role !== 'CUSTOMER')
export type StaffRole = Exclude<UserRole, 'CUSTOMER'>

export const AGENT_ROLES = [
  'GST_AGENT',
  'ITR_AGENT',
  'LOAN_AGENT',
  'INSURANCE_AGENT',
  'REGISTRATION_AGENT',
  'ACCOUNTS_AGENT',
] as const
export type AgentRole = (typeof AGENT_ROLES)[number]

export const ROLE_LABELS: Record<UserRole, string> = {
  CUSTOMER: 'Customer',
  SUPER_ADMIN: 'Super admin',
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  GST_AGENT: 'GST agent',
  ITR_AGENT: 'ITR agent',
  LOAN_AGENT: 'Loan agent',
  INSURANCE_AGENT: 'Insurance agent',
  REGISTRATION_AGENT: 'Registration agent',
  ACCOUNTS_AGENT: 'Accounts agent',
}

export const isStaffRole = (role: UserRole): role is StaffRole => role !== 'CUSTOMER'
export const isAgentRole = (role: UserRole): role is AgentRole =>
  (AGENT_ROLES as readonly string[]).includes(role)

export interface AuthUser {
  id: string
  fullName: string
  email: string
  mobile: string
  role: UserRole
  permissions?: string[]
  department?: string
  avatarUrl?: string
  isProfileComplete: boolean
  businessName?: string
  /** CIN / LLPIN / firm registration number for business-entity customers */
  registrationNumber?: string
  incorporationDate?: string
  // Profile and registration details
  gender?: string
  dob?: string
  fatherSpouseName?: string
  pan?: string
  aadhaar?: string
  addressLine1?: string
  addressLine2?: string
  areaLocality?: string
  city?: string
  district?: string
  pincode?: string
  state?: string
  address?: string
  customerType?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresAt?: number
}

export interface AuthSession {
  user: AuthUser
  tokens: AuthTokens
}

export interface RegisteredUserRecord {
  mobile: string
  passcode: string
  isRegistered: boolean
  user: AuthUser
}
