import { Outlet } from 'react-router-dom'

import { useAppStore, useAuthStore } from '@store/index'
import { LogoutConfirmModal } from '@shared/components'
import { useLogoutConfirm } from '@modules/authentication'

import { StaffHeader } from './StaffHeader'
import { StaffSidebar } from './StaffSidebar'
import './StaffLayout.css'

export const StaffLayout = () => {
  const user = useAuthStore((state) => state.user)
  const logout = useLogoutConfirm()
  const isSidebarOpen = useAppStore((state) => state.isSidebarOpen)

  if (!user) return null

  return (
    <div className={`staff-shell${isSidebarOpen ? '' : ' staff-shell--collapsed'}`}>
      <StaffSidebar role={user.role} />

      <div className="staff-shell__main">
        <StaffHeader user={user} onSignOut={logout.requestLogout} />
        <main className="staff-shell__content">
          <Outlet />
        </main>
      </div>

      <LogoutConfirmModal
        isOpen={logout.isConfirmOpen}
        isLoggingOut={logout.isLoggingOut}
        onConfirm={logout.confirmLogout}
        onCancel={logout.cancelLogout}
      />
    </div>
  )
}
