import React, { useState } from 'react'
import { useAuthStore } from '@store/index'
import { authStorage } from '@core/auth'
import type { AuthUser } from '@core/auth'
import { formatMobile } from '@shared/utils'
import { validateDob } from '@shared/utils/validationUtils'
import { DetailCard, type DetailCardItem } from '../../components/DetailCard/DetailCard'
import { formatCustomerType, isPlaceholderCustomerName, isMockEmail } from '../../utils/profileProgress'
import './ProfileDetails.css'

const formatFullAddress = (u: Partial<AuthUser> | null | undefined): string | null => {
  if (!u) return null
  if (u.address && u.address.trim()) return u.address.trim()
  const parts = [
    u.addressLine1,
    u.addressLine2 || u.areaLocality,
    u.city,
    u.state,
    u.pincode,
  ].filter((p): p is string => Boolean(p && String(p).trim()))
  return parts.length > 0 ? parts.join(', ') : null
}

const UserCardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
)

export const PersonalInformation = () => {
  const storeUser = useAuthStore((state) => state.user)
  const user = storeUser || authStorage.getUser()

  const [isEditing, setIsEditing] = useState(false)
  const [dobError, setDobError] = useState('')
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    dob: '',
    customerType: '',
    address: '',
  })

  if (!user) {
    return (
      <div className="profile-details-page">
        <div className="profile-details-page__content">
          <p>User not found. Please log in again.</p>
        </div>
      </div>
    )
  }

  const cleanMobile = formatMobile(user.mobile || '')
  const hasValidName = user.fullName && !isPlaceholderCustomerName(user.fullName) ? user.fullName : null
  const hasValidEmail = user.email && !isMockEmail(user.email) ? user.email : null
  const fullAddress = formatFullAddress(user)

  // A user who only logged in with mobile and has not completed registration/profile should have customerType as Pending
  const isFreshUnregisteredUser = !user.isProfileComplete && !hasValidName
  const hasValidCustomerType =
    isFreshUnregisteredUser
      ? null
      : (user.customerType ? formatCustomerType(user.customerType) : null)

  const handleStartEdit = () => {
    setDobError('')
    setFormData({
      fullName: hasValidName || '',
      mobile: cleanMobile,
      email: hasValidEmail || '',
      dob: user.dob || '',
      customerType: hasValidCustomerType ? (user.customerType?.toLowerCase() || '') : '',
      address: fullAddress || '',
    })
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setDobError('')
    setIsEditing(false)
  }

  const handleSaveEdit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (formData.dob.trim()) {
      const err = validateDob(formData.dob.trim(), { label: 'Date of birth', minAge: 18 })
      if (err) {
        setDobError(err)
        return
      }
    }

    const rawMobile = formData.mobile.replace(/\D/g, '').slice(0, 10)
    const updatedUser: AuthUser = {
      ...user,
      fullName: formData.fullName.trim(),
      mobile: rawMobile || user.mobile,
      email: formData.email.trim(),
      dob: formData.dob.trim(),
      customerType: formData.customerType ? formData.customerType.trim() : undefined,
      address: formData.address.trim(),
      addressLine1: formData.address.trim(),
    }

    useAuthStore.getState().setUser(updatedUser)
    authStorage.setUser(updatedUser)
    setIsEditing(false)
  }

  const personalItems: DetailCardItem[] = [
    { label: 'FULL NAME', value: hasValidName },
    {
      label: 'MOBILE NUMBER',
      value: cleanMobile ? `+91 ${cleanMobile}` : null,
      isVerified: Boolean(cleanMobile),
    },
    { label: 'EMAIL ADDRESS', value: hasValidEmail },
    { label: 'DATE OF BIRTH', value: user.dob || null },
    { label: 'CUSTOMER TYPE', value: hasValidCustomerType },
    { label: 'ADDRESS', value: fullAddress, isFullWidth: true },
  ]

  return (
    <div className="profile-details-page" data-testid="personal-information-page">
      <div className="profile-details-page__content">
        {!isEditing ? (
          <DetailCard
            title="Personal Information"
            items={personalItems}
            onEdit={handleStartEdit}
            icon={<UserCardIcon />}
          />
        ) : (
          <div className="profile-detail-card" data-testid="profile-detail-card-personal-information">
            <div className="profile-detail-card__header">
              <div className="profile-detail-card__header-left">
                <div className="profile-detail-card__icon">
                  <UserCardIcon />
                </div>
                <h3 className="profile-detail-card__title">Personal Information</h3>
              </div>
            </div>

            <form className="profile-edit-form" onSubmit={handleSaveEdit}>
              <div className="profile-edit-grid">
                <div className="profile-edit-field">
                  <label className="profile-edit-field__label" htmlFor="edit-fullName">Full Name</label>
                  <input
                    id="edit-fullName"
                    type="text"
                    className="profile-edit-field__input"
                    placeholder="Enter full name"
                    value={formData.fullName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                  />
                </div>

                <div className="profile-edit-field">
                  <label className="profile-edit-field__label" htmlFor="edit-mobile">Mobile Number</label>
                  <input
                    id="edit-mobile"
                    type="tel"
                    className="profile-edit-field__input"
                    placeholder="Enter 10-digit mobile"
                    maxLength={10}
                    value={formData.mobile}
                    onChange={(e) => setFormData((prev) => ({ ...prev, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                  />
                </div>

                <div className="profile-edit-field">
                  <label className="profile-edit-field__label" htmlFor="edit-email">Email Address</label>
                  <input
                    id="edit-email"
                    type="email"
                    className="profile-edit-field__input"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div className="profile-edit-field">
                  <label className="profile-edit-field__label" htmlFor="edit-dob">Date of Birth</label>
                  <input
                    id="edit-dob"
                    type="text"
                    className="profile-edit-field__input"
                    placeholder="DD-MM-YYYY"
                    value={formData.dob}
                    onChange={(e) => {
                      const val = e.target.value
                      setFormData((prev) => ({ ...prev, dob: val }))
                      if (val.trim().length >= 10) {
                        const err = validateDob(val.trim(), { label: 'Date of birth', minAge: 18 })
                        setDobError(err || '')
                      } else if (dobError) {
                        setDobError('')
                      }
                    }}
                  />
                  {dobError && <span className="form-error" style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{dobError}</span>}
                </div>

                <div className="profile-edit-field">
                  <label className="profile-edit-field__label" htmlFor="edit-customerType">Customer Type</label>
                  <select
                    id="edit-customerType"
                    className="profile-edit-field__select"
                    value={formData.customerType}
                    onChange={(e) => setFormData((prev) => ({ ...prev, customerType: e.target.value }))}
                  >
                    <option value="">Select Customer Type</option>
                    <option value="individual">Individual</option>
                    <option value="salaried">Salaried</option>
                    <option value="business">Business</option>
                    <option value="freelancer">Freelancer</option>
                    <option value="proprietorship">Proprietorship</option>
                    <option value="partnership">Partnership</option>
                    <option value="llp">LLP</option>
                    <option value="pvtltd">Private Limited</option>
                    <option value="huf">HUF</option>
                  </select>
                </div>

                <div className="profile-edit-field profile-edit-field--full">
                  <label className="profile-edit-field__label" htmlFor="edit-address">Address</label>
                  <textarea
                    id="edit-address"
                    rows={3}
                    className="profile-edit-field__textarea"
                    placeholder="Enter residential address"
                    value={formData.address}
                    onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                  />
                </div>
              </div>

              <div className="profile-edit-actions">
                <button
                  type="button"
                  className="profile-edit-btn profile-edit-btn--cancel"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="profile-edit-btn profile-edit-btn--ok"
                >
                  OK
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default PersonalInformation
