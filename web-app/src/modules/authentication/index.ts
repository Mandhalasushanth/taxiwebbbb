/**
 * Public surface of the authentication module.
 * Other modules import from here and nothing deeper.
 */
export { authenticationRoutes } from './routes'
export { useAuth } from './hooks/useAuth'
export { useLogoutConfirm } from './hooks/useLogoutConfirm'
export { authFlowService } from './services/authFlowService'
export type {
  LoginPayload,
  VerifyOtpPayload,
} from './types/auth.types'
