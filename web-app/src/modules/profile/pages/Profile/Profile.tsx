import React, { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@store/index'
import { authStorage } from '@core/auth'

import { ProfileHeader } from '../../components/ProfileHeader/ProfileHeader'
import { ProfileSection } from '../../components/ProfileSection/ProfileSection'
import { ProfileMenuItem } from '../../components/ProfileMenuItem/ProfileMenuItem'
import { LogoutButton } from '../../components/LogoutButton/LogoutButton'
import { LogoutConfirmModal } from '@shared/components'
import { useLogoutConfirm } from '@modules/authentication'
import { profileSectionsConfig } from './profileConfig'
import './Profile.css'

export const Profile = () => {
  const storeUser = useAuthStore((state) => state.user)
  const user = storeUser || authStorage.getUser()

  const [activeAppsCount] = useState(0)
  const [completedAppsCount] = useState(0)
  const [totalPaidAmount] = useState(0)
  const [activeSection, setActiveSection] = useState('account')
  const observer = useRef<IntersectionObserver | null>(null)

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
        rootMargin: '-250px 0px -50% 0px', // Offset for the fixed header
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

  const handleEditAvatar = () => {
    // Empty for now
  }

  return (
    <div className="profile-page-view">
      <div className="profile-page-view__header-wrapper">
        <ProfileHeader
          user={user}
          activeAppsCount={activeAppsCount}
          completedAppsCount={completedAppsCount}
          totalPaidAmount={totalPaidAmount}
          onEditAvatar={handleEditAvatar}
        />

        <div className="profile-page-view__sticky-nav">
          <div className="profile-page-view__sticky-nav-container">
            {profileSectionsConfig.map((section) => {
              const id = section.title.toLowerCase()
              return (
                <button
                  key={id}
                  className={`profile-page-view__nav-btn ${activeSection === id ? 'profile-page-view__nav-btn--active' : ''}`}
                  onClick={() => {
                    setActiveSection(id)
                    const el = document.getElementById(id)
                    if (el) {
                      const y = el.getBoundingClientRect().top + window.scrollY - 280
                      window.scrollTo({ top: y, behavior: 'smooth' })
                    }
                  }}
                >
                  {section.title}
                </button>
              )
            })}
          </div>
        </div>
      </div>
      
      <div className="profile-page-view__content">
        {profileSectionsConfig.map((section) => {
          const id = section.title.toLowerCase()
          return (
          <div id={id} key={id} className="profile-page-view__section-anchor">
          <ProfileSection title={section.title.toUpperCase()}>
            {section.items.map((item, index) => (
              <React.Fragment key={item.id}>
                <ProfileMenuItem
                  label={item.label}
                  to={item.to}
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
    </div>
  )
}

export default Profile
