import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import { isStaffRole } from '@core/auth'
import { routePaths } from '@core/config'
import { useAuthStore } from '@store/index'
import type { AuthSession } from '@core/auth'

import { authFlowService } from '../services/authFlowService'
import type { LoginPayload, VerifyOtpPayload, VerifyPasscodePayload } from '../types/auth.types'

/** The authentication module's public surface for pages. */
export const useAuth = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, signIn, signOut, setUser } = useAuthStore()

  const completeSignIn = useCallback(
    (session: AuthSession) => {
      signIn(session)

      if (isStaffRole(session.user.role)) {
        navigate(routePaths.staff.dashboard, { replace: true })
        return
      }

      navigate(routePaths.dashboard, {
        replace: true,
      })
    },
    [signIn, navigate],
  )

  const login = useCallback(
    async (payload: LoginPayload) => {
      completeSignIn(await authFlowService.login(payload))
    },
    [completeSignIn],
  )

  const verifyOtp = useCallback(
    async (payload: VerifyOtpPayload) => {
      completeSignIn(await authFlowService.verifyOtp(payload))
    },
    [completeSignIn],
  )

  const verifyPasscode = useCallback(
    async (payload: VerifyPasscodePayload) => {
      const session = await authFlowService.verifyPasscode(payload)
      signIn(session)

      if (isStaffRole(session.user.role)) {
        navigate(routePaths.staff.dashboard, { replace: true })
        return
      }

      navigate(routePaths.dashboard, { replace: true })
    },
    [signIn, navigate],
  )

  const logout = useCallback(async () => {
    await authFlowService.logout()
    signOut()
    navigate(routePaths.auth.login, { replace: true })
  }, [signOut, navigate])

  return { user, isAuthenticated, login, verifyOtp, verifyPasscode, logout, setUser }
}
