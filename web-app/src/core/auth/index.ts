export { authService } from './authService'
export { authStorage } from './authStorage'
export {
  REDIRECT_PARAM,
  buildLoginPath,
  buildProfileCompletionPath,
  isSafeRedirect,
  resolvePostLoginPath,
} from './authRedirect'
export { isIdleExpired, startIdleWatcher } from './idleWatcher'
export type { IdleWatcherOptions } from './idleWatcher'
export type { SessionEndReason } from './sessionSync'
export {
  AGENT_ROLES,
  ROLE_LABELS,
  STAFF_ROLES,
  USER_ROLES,
  isAgentRole,
  isStaffRole,
} from './authTypes'
export type { AgentRole, AuthSession, AuthTokens, AuthUser, RegisteredUserRecord, StaffRole, UserRole } from './authTypes'
export { PERMISSIONS, ROLE_PERMISSIONS, permissionsFor, roleHasPermission } from './permissions'
export type { Permission } from './permissions'
export { userRepository, localStorageUserRepository, apiUserRepository, type IUserRepository, type StoredUserRecord } from '../storage/userRepository'
