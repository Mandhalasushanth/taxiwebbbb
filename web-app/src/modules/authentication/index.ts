/**
 * Public surface of the authentication module.
 * Other modules import from here and nothing deeper.
 */
export { authenticationRoutes } from './routes'
export { useLogoutConfirm } from './hooks/useLogoutConfirm'
export { BackNavigationLogoutGuard } from './components/BackNavigationLogoutGuard/BackNavigationLogoutGuard'
export { authFlowService } from './services/authFlowService'
export type {
  LoginPayload,
  VerifyOtpPayload,
} from './types/auth.types'
