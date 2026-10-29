import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@store/index'
import { authStorage, buildProfileCompletionPath } from '@core/auth'
import { routePaths } from '@core/config'
import { formatMobile } from '@shared/utils'
import { DetailCard } from '../../components/DetailCard/DetailCard'
import { formatCustomerType, formatGender, isPlaceholderCustomerName, isMockEmail } from '../../utils/profileProgress'
import './ProfileDetails.css'

export const PersonalInformation = () => {
  const navigate = useNavigate()
  const storeUser = useAuthStore((state) => state.user)
  const user = storeUser || authStorage.getUser()

  if (!user) {
    return (
      <div className="profile-details-page">
        <div className="profile-details-page__content">
          <p>User not found. Please log in again.</p>
        </div>
      </div>
    )
  }

  const handleEdit = () => {
    navigate(buildProfileCompletionPath(routePaths.profilePersonal), {
      state: { returnTo: routePaths.profilePersonal, mobile: user.mobile },
    })
  }

  const cleanMobile = formatMobile(user.mobile || '')
  const hasValidName = user.fullName && !isPlaceholderCustomerName(user.fullName) ? user.fullName : null
  const hasValidEmail = user.email && !isMockEmail(user.email) ? user.email : null
  const addressLine2 = (user.addressLine2 || user.areaLocality || '').trim()

  const personalItems = [
    { label: 'FULL NAME', value: hasValidName },
    { label: 'EMAIL ADDRESS', value: hasValidEmail },
    {
      label: 'MOBILE NUMBER',
      value: cleanMobile ? `+91 ${cleanMobile}` : null,
      isVerified: Boolean(cleanMobile),
    },
    { label: 'CUSTOMER TYPE', value: formatCustomerType(user.customerType) },
    { label: 'GENDER', value: formatGender(user.gender) },
    { label: 'DATE OF BIRTH', value: user.dob },
    { label: 'FATHER/SPOUSE NAME', value: user.fatherSpouseName },
  ]

  const addressItems = [
    { label: 'ADDRESS LINE 1', value: user.addressLine1 || user.address, isFullWidth: true },
    ...(addressLine2 ? [{ label: 'ADDRESS LINE 2', value: addressLine2, isFullWidth: true }] : []),
    { label: 'CITY / TOWN', value: user.city },
    { label: 'STATE', value: user.state },
    { label: 'PIN CODE', value: user.pincode },
  ]

  return (
    <div className="profile-details-page" data-testid="personal-information-page">
      <div className="profile-details-page__content">
        {/* Personal Information Card matching Image 4 */}
        <DetailCard
          title="Personal Information"
          items={personalItems}
          onEdit={handleEdit}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          }
        />

        {/* Residential Address Card */}
        <DetailCard
          title="Residential Address"
          items={addressItems}
          onEdit={handleEdit}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          }
        />
      </div>
    </div>
  )
}

export default PersonalInformation
