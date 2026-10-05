import { Navigate, useLocation } from 'react-router-dom'
import { buildLoginPath, resolvePostLoginPath } from '@core/auth'
import { routePaths } from '@core/config'
import { useAuthStore } from '@store/index'
import { AuthIdentityHeroPanel } from '../../components/AuthIdentityHeroPanel/AuthIdentityHeroPanel'
import { RegistrationCard } from '../../components/RegistrationCard/RegistrationCard'
import './Register.css'

export const Register = () => {
  const location = useLocation()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)

  if (!isAuthenticated) {
    return <Navigate to={buildLoginPath(location)} replace />
  }

  // Profile done: continue to the service the user started from (?redirect=), else the dashboard
  if (user?.isProfileComplete) {
    return <Navigate to={resolvePostLoginPath(location.search, location.state, routePaths.dashboard)} replace />
  }
  return (
    <div className="register-screen">
      <div className="register-bg" />
      <div className="register-left-overlay" />

      {/* Left Stage: Branded Identity Hero Panel */}
      <section className="register-screen__left">
        <AuthIdentityHeroPanel />
      </section>

      {/* Right Stage: Floating White Registration Card */}
      <aside className="register-screen__right">
        <div className="register-screen__card-box">
          <RegistrationCard />
        </div>
      </aside>
    </div>
  )
}

export default Register

