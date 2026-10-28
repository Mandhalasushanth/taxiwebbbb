import React, { useState, useEffect, useRef } from 'react'
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
import { profileSectionsConfig, PROFILE_NAV_SCROLL_OFFSET } from './profileConfig'
import './Profile.css'

export const Profile = () => {
  const navigate = useNavigate()
  const storeUser = useAuthStore((state) => state.user)
  const user = storeUser || authStorage.getUser()

  const { data: applications } = useApplications()
  const activeAppsCount = applications?.filter((app) => app.status !== 'COMPLETED' && app.status !== 'Completed').length ?? 0
  const completedAppsCount = applications?.filter((app) => app.status === 'COMPLETED' || app.status === 'Completed').length ?? 0
  const totalPaidAmount = applications?.reduce((sum, app) => sum + (app.amount || 0), 0) ?? 0
  const UNAVAILABLE_ITEM_IDS = ['password', '2fa', 'history', 'privacy', 'rate', 'terms', 'policy']
  const [activeSection, setActiveSection] = useState('account')
  const [activeModal, setActiveModal] = useState<ProfileModalType | null>(null)
  const [unavailableTitle, setUnavailableTitle] = useState<string | null>(null)
  const observer = useRef<IntersectionObserver | null>(null)

  const handleItemClick = (itemId: string, itemLabel: string) => {
    if (itemId === 'gst' || itemId === 'itr' || itemId === 'loan') {
      const type = itemId === 'loan' ? 'loans' : (itemId as ProfileModalType)
      setActiveModal(type)
    } else if (UNAVAILABLE_ITEM_IDS.includes(itemId)) {
      setUnavailableTitle(itemLabel)
    }
  }

  useEffect(() => {
    observer.current = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries.filter((entry) => entry.isIntersecting)
        if (visibleSections.length > 0) {
          // Find the topmost visible section
          visibleSections.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
          setActiveSection(visibleSections[0].target.id)
        }
      },
      {
        rootMargin: `-${PROFILE_NAV_SCROLL_OFFSET}px 0px -50% 0px`, // Offset for the sticky header + nav
        threshold: 0.1,
      }
    )

    profileSectionsConfig.map((section) => {
      const el = document.getElementById(section.title.toLowerCase())
      if (el && observer.current) observer.current.observe(el)
      return el
    })

    return () => {
      if (observer.current) observer.current.disconnect()
    }
  }, [])

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

      <nav className="profile-page-view__sticky-nav" aria-label="Profile sections">
        <div className="profile-page-view__sticky-nav-container">
          {profileSectionsConfig.map((section) => {
            const id = section.title.toLowerCase()
            return (
              <button
                key={id}
                type="button"
                aria-current={activeSection === id ? 'true' : undefined}
                className={`profile-page-view__nav-btn ${activeSection === id ? 'profile-page-view__nav-btn--active' : ''}`}
                onClick={() => {
                  setActiveSection(id)
                  const el = document.getElementById(id)
                  if (el) {
                    const y = el.getBoundingClientRect().top + window.scrollY - PROFILE_NAV_SCROLL_OFFSET
                    window.scrollTo({ top: y, behavior: 'smooth' })
                  }
                }}
              >
                {section.title}
              </button>
            )
          })}
        </div>
      </nav>

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
