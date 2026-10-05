import { ROLE_LABELS } from '@core/auth'
import type { AuthUser } from '@core/auth'
import { initialsOf } from '@shared/utils'
import { useAppStore } from '@store/index'

export interface StaffHeaderProps {
  user: AuthUser
  onSignOut: () => void
}

export const StaffHeader = ({ user, onSignOut }: StaffHeaderProps) => {
  const toggleSidebar = useAppStore((state) => state.toggleSidebar)
  const toggleTheme = useAppStore((state) => state.toggleTheme)
  const theme = useAppStore((state) => state.theme)

  return (
    <header className="staff-shell__header">
      <button
        className="staff-shell__icon-button"
        type="button"
        onClick={toggleSidebar}
        aria-label="Toggle navigation"
      >
        ☰
      </button>

      <div className="staff-shell__header-actions">
        <button
          className="staff-shell__icon-button"
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
        >
          {theme === 'light' ? '☾' : '☀'}
        </button>

        <div className="staff-shell__user">
          <span className="staff-shell__avatar" aria-hidden="true">
            {initialsOf(user.fullName)}
          </span>
          <span className="staff-shell__user-meta">
            <span className="staff-shell__user-name">{user.fullName}</span>
            <span className="staff-shell__user-role">{ROLE_LABELS[user.role]}</span>
          </span>
        </div>

        <button className="staff-shell__signout" type="button" onClick={onSignOut}>
          Log out
        </button>
      </div>
    </header>
  )
}
