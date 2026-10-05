import React from 'react'
import { LogoutIcon } from '@shared/components'
import './LogoutButton.css'

export interface LogoutButtonProps {
  onClick: () => void
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ onClick }) => {
  return (
    <button type="button" className="profile-logout-btn" onClick={onClick}>
      <span className="profile-logout-btn__icon">
        <LogoutIcon />
      </span>
      <span className="profile-logout-btn__text">Log out</span>
    </button>
  )
}
