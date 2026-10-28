import React, { useRef, useState, useEffect } from 'react'
import type { AuthUser } from '@core/auth'
import { FileInput, PHOTO_UPLOAD_RULE } from '@shared/upload'
import { isPlaceholderCustomerName, compactRupees, getCustomerId, getCustomerDisplayName } from '../../utils/profileProgress'
import './ProfileHeader.css'

export interface ProfileHeaderProps {
  user: AuthUser | null
  activeAppsCount?: number
  completedAppsCount?: number
  totalPaidAmount?: number
  onEditAvatar?: () => void
}

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
)

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  activeAppsCount = 0,
  completedAppsCount = 0,
  totalPaidAmount = 0,
  onEditAvatar
}) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isDropdownOpen) return

    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.profile-hero__avatar-wrapper')) {
        setIsDropdownOpen(false)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('click', handleDocumentClick)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('click', handleDocumentClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isDropdownOpen])

  const handleEditClick = () => {
    setIsDropdownOpen((prev) => !prev)
  }

  const handleUploadClick = () => {
    setIsDropdownOpen(false)
    fileInputRef.current?.click()
    if (onEditAvatar) onEditAvatar()
  }

  const handleRemoveClick = () => {
    setIsDropdownOpen(false)
    setAvatarUrl(null)
  }

  /** A JPG or PNG photo up to 15 MB */
  const handleFileChange = (file: File) => {
    setAvatarUrl(URL.createObjectURL(file))
  }

  const isProfileComplete = Boolean(
    user?.isProfileComplete &&
    user?.fullName &&
    !isPlaceholderCustomerName(user.fullName)
  )

  const kycVerified = Boolean(
    isProfileComplete &&
    user?.pan &&
    user?.aadhaar
  )

  const customerId = getCustomerId(user)
  const displayName = getCustomerDisplayName(user)
  const customerType = user?.customerType ? user.customerType.toUpperCase() : 'INDIVIDUAL'
  const initials = isProfileComplete && user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U'

  return (
    <div className="profile-hero">
      <div className="profile-hero__bg-mesh" />
      <div className="profile-hero__container">
        
        {/* Left Section: User Identity */}
        <div className="profile-hero__identity">
          <div className="profile-hero__avatar-wrapper">
            <div className="profile-hero__avatar-circle">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile Avatar" className="profile-hero__avatar-img" />
              ) : (
                <span className="profile-hero__avatar-initials">{initials}</span>
              )}
            </div>
            <button className="profile-hero__edit-btn" onClick={handleEditClick} aria-label="Edit avatar">
              <EditIcon />
            </button>
            {isDropdownOpen && (
              <div className="profile-hero__avatar-dropdown">
                <button className="profile-hero__avatar-dropdown-item" onClick={handleUploadClick}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                  Choose from library
                </button>
                {avatarUrl && (
                  <button className="profile-hero__avatar-dropdown-item profile-hero__avatar-dropdown-item--danger" onClick={handleRemoveClick}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    Remove picture
                  </button>
                )}
                <button className="profile-hero__avatar-dropdown-item profile-hero__avatar-dropdown-item--cancel" onClick={() => setIsDropdownOpen(false)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  Cancel
                </button>
              </div>
            )}
            <FileInput
              rule={PHOTO_UPLOAD_RULE}
              ref={fileInputRef}
              onFileSelected={handleFileChange}
              className="profile-hero__file-input-hidden"
            />
          </div>

          <div className="profile-hero__user-info">
            <h2 className="profile-hero__name">{displayName}</h2>
            <p className="profile-hero__id">Customer ID: {customerId}</p>
            <div className="profile-hero__badges">
              {isProfileComplete ? (
                <>
                  <span className="profile-hero__badge profile-hero__badge--type">{customerType}</span>
                  <span className={`profile-hero__badge ${kycVerified ? 'profile-hero__badge--verified' : 'profile-hero__badge--pending'}`}>
                    {kycVerified ? 'KYC Verified ✓' : 'KYC Pending'}
                  </span>
                </>
              ) : (
                <>
                  <span className="profile-hero__badge profile-hero__badge--incomplete">Profile Incomplete</span>
                  <span className="profile-hero__badge profile-hero__badge--pending">KYC Pending</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Section: Animation */}
        <div className="profile-hero__animation-container">
          <div className="profile-hero__pulse-ring"></div>
          <div className="profile-hero__pulse-ring profile-hero__pulse-ring--delay-1"></div>
          <div className="profile-hero__pulse-ring profile-hero__pulse-ring--delay-2"></div>
          <svg className="profile-hero__floating-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </div>

      </div>

      {/* Floating stats card matching Image 1 */}
      <div className="profile-hero__stats-card">
        <div className="profile-hero__stat-item">
          <span className="profile-hero__stat-value">{activeAppsCount}</span>
          <span className="profile-hero__stat-label">Active Apps</span>
        </div>
        <div className="profile-hero__stat-divider" />
        <div className="profile-hero__stat-item">
          <span className="profile-hero__stat-value profile-hero__stat-value--completed">{completedAppsCount}</span>
          <span className="profile-hero__stat-label">Completed</span>
        </div>
        <div className="profile-hero__stat-divider" />
        <div className="profile-hero__stat-item">
          <span className="profile-hero__stat-value profile-hero__stat-value--amount">{compactRupees(totalPaidAmount)}</span>
          <span className="profile-hero__stat-label">Total Paid</span>
        </div>
      </div>
    </div>
  )
}
