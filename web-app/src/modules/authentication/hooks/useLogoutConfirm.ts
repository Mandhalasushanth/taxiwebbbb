import { useCallback, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { buildLoginPath } from '@core/auth'
import { useAuthStore } from '@store/index'
import { authFlowService } from '../services/authFlowService'

/**
 * Two-step logout used by every "Log out" control:
 * requestLogout() opens the confirmation popup, confirmLogout() ends the session
 * (server + every open tab) and goes to the login page preserving the previous destination,
 * cancelLogout() keeps the user signed in.
 */
export const useLogoutConfirm = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const signOut = useAuthStore((state) => state.signOut)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const requestLogout = useCallback(() => setIsConfirmOpen(true), [])

  const cancelLogout = useCallback(() => setIsConfirmOpen(false), [])

  const confirmLogout = useCallback(async () => {
    setIsLoggingOut(true)
    const loginTarget = buildLoginPath(location)
    try {
      await authFlowService.logout()
    } catch {
      // Server sign-out failures must never keep the user signed in locally
    }
    setIsConfirmOpen(false)
    setIsLoggingOut(false)
    signOut()
    navigate(loginTarget, { replace: true })
  }, [location, navigate, signOut])

  return { isConfirmOpen, isLoggingOut, requestLogout, cancelLogout, confirmLogout }
}
