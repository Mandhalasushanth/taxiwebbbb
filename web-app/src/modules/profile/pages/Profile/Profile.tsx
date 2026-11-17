import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@store/index'
import { authStorage, buildProfileCompletionPath } from '@core/auth'
import { routePaths } from '@core/config'

import { ProfileHeader } from '../../components/ProfileHeader/ProfileHeader'
import { ProfileSection } from '../../components/ProfileSection/ProfileSection'
import { ProfileMenuItem } from '../../components/ProfileMenuItem/ProfileMenuItem'
import { LogoutButton } from '../../components/LogoutButton/LogoutButton'
import { LogoutConfirmModal } from '@shared/components'
import { useLogoutConfirm } from '@modules/authentication'
import { CompleteProfileCard } from '../../components/CompleteProfileCard/CompleteProfileCard'
import { ChangePasscodeModal } from '../../components/ChangePasscodeModal/ChangePasscodeModal'
import { DeleteAccountModal } from '../../components/DeleteAccountModal/DeleteAccountModal'
import { calculateProfileProgress } from '../../utils/profileProgress'
import { useApplications } from '@modules/applications'
import profileSectionsConfigDefault, { profileSectionsConfig as profileSectionsConfigNamed } from './profileConfig'
import './Profile.css'

const profileSectionsConfig = profileSectionsConfigNamed || profileSectionsConfigDefault || []

export const Profile = () => {
  const navigate = useNavigate()
  const storeUser = useAuthStore((state) => state.user)
  const user = storeUser || authStorage.getUser()

  const { data: applications } = useApplications()
  const activeAppsCount = applications?.filter((app) => app.status !== 'COMPLETED' && app.status !== 'Completed').length ?? 0
  const completedAppsCount = applications?.filter((app) => app.status === 'COMPLETED' || app.status === 'Completed').length ?? 0
  const totalPaidAmount = applications?.reduce((sum, app) => sum + (app.amount || 0), 0) ?? 0

  const [isChangePasscodeOpen, setIsChangePasscodeOpen] = useState(false)
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false)

  const handleItemClick = (itemId: string) => {
    if (itemId === 'passcode') {
      setIsChangePasscodeOpen(true)
    } else if (itemId === 'delete-account') {
      setIsDeleteAccountOpen(true)
    }
  }

  const handleConfirmDeleteAccount = () => {
    useAuthStore.getState().signOut()
    authStorage.clear()
    setIsDeleteAccountOpen(false)
    navigate(routePaths.auth.login, { replace: true })
  }

  const logout = useLogoutConfirm()

  const { percentage, isFullyComplete } = calculateProfileProgress(user)

  const handleCompleteProfile = () => {
    navigate(buildProfileCompletionPath(routePaths.profile), {
      state: { returnTo: routePaths.profile, mobile: user?.mobile },
    })
  }

  const handleEditAvatar = () => {
    // Empty for now
  }

  return (
    <div className="profile-page-view" data-testid="profile-page">
      <ProfileHeader
        user={user}
        activeAppsCount={activeAppsCount}
        completedAppsCount={completedAppsCount}
        totalPaidAmount={totalPaidAmount}
        onEditAvatar={handleEditAvatar}
      />

      <div className="profile-page-view__content">
        {/* Prominent Complete Profile CTA card */}
        {!isFullyComplete && (
          <CompleteProfileCard
            progress={percentage}
            onCompleteProfile={handleCompleteProfile}
          />
        )}

        {profileSectionsConfig.map((section) => {
          const id = section.title.toLowerCase().replace(/\s+/g, '-')
          return (
            <div id={id} key={id} className="profile-page-view__section-anchor">
              <ProfileSection title={section.title.toUpperCase()}>
                {section.items.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <ProfileMenuItem
                      label={item.label}
                      to={item.to}
                      target={item.target}
                      rel={item.rel}
                      onClick={() => handleItemClick(item.id)}
                      icon={item.icon}
                      iconBgClass={item.iconBgClass}
                    />
                    {index < section.items.length - 1 && (
                      <div className="profile-page-view__item-divider" />
                    )}
                  </React.Fragment>
                ))}
              </ProfileSection>
            </div>
          )
        })}

        <div className="profile-page-view__logout-wrapper">
          <LogoutButton onClick={logout.requestLogout} />
          <LogoutConfirmModal
            isOpen={logout.isConfirmOpen}
            isLoggingOut={logout.isLoggingOut}
            onConfirm={logout.confirmLogout}
            onCancel={logout.cancelLogout}
          />
        </div>
      </div>

      <ChangePasscodeModal
        isOpen={isChangePasscodeOpen}
        onClose={() => setIsChangePasscodeOpen(false)}
      />

      <DeleteAccountModal
        isOpen={isDeleteAccountOpen}
        onClose={() => setIsDeleteAccountOpen(false)}
        onConfirm={handleConfirmDeleteAccount}
      />
    </div>
  )
}

export default Profile
