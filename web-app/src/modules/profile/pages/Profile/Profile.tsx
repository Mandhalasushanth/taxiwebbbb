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
import { ProfileSectionModal, type ProfileModalType } from '../../components/ProfileSectionModal/ProfileSectionModal'
import { UnavailableModal } from '../../components/UnavailableModal/UnavailableModal'
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
  const UNAVAILABLE_ITEM_IDS = ['password', '2fa', 'history', 'privacy', 'rate', 'terms', 'policy']
  const [activeModal, setActiveModal] = useState<ProfileModalType | null>(null)
  const [unavailableTitle, setUnavailableTitle] = useState<string | null>(null)

  const handleItemClick = (itemId: string, itemLabel: string) => {
    if (itemId === 'gst' || itemId === 'itr' || itemId === 'loan') {
      const type = itemId === 'loan' ? 'loans' : (itemId as ProfileModalType)
      setActiveModal(type)
    } else if (UNAVAILABLE_ITEM_IDS.includes(itemId)) {
      setUnavailableTitle(itemLabel)
    }
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
          const id = section.title.toLowerCase()
          return (
            <div id={id} key={id} className="profile-page-view__section-anchor">
              <ProfileSection title={section.title.toUpperCase()}>
                {section.items.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <ProfileMenuItem
                      label={item.label}
                      to={['gst', 'itr', 'loan', ...UNAVAILABLE_ITEM_IDS].includes(item.id) ? undefined : item.to}
                      onClick={() => handleItemClick(item.id, item.label)}
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

      <ProfileSectionModal
        isOpen={Boolean(activeModal)}
        onClose={() => setActiveModal(null)}
        modalType={activeModal}
      />

      <UnavailableModal
        isOpen={Boolean(unavailableTitle)}
        title={unavailableTitle}
        onClose={() => setUnavailableTitle(null)}
      />
    </div>
  )
}

export default Profile
