import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@store/index'
import { authStorage, buildProfileCompletionPath } from '@core/auth'
import { routePaths } from '@core/config'
import { maskAadhaar } from '@shared/utils'
import { DetailCard } from '../../components/DetailCard/DetailCard'
import { formatFullAddress } from '../../utils/profileProgress'
import '../PersonalInformation/ProfileDetails.css'

export const KycDetails = () => {
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
    navigate(buildProfileCompletionPath(routePaths.profileKyc), {
      state: { returnTo: routePaths.profileKyc, mobile: user.mobile },
    })
  }

  const identityItems = [
    { label: 'PAN NUMBER', value: user.pan ? user.pan.toUpperCase() : null },
    // Never show the full Aadhaar number: only the last 4 digits (XXXX XXXX 1234)
    { label: 'AADHAAR NUMBER', value: user.aadhaar ? maskAadhaar(user.aadhaar) : null },
    { label: 'ADDRESS', value: formatFullAddress(user), isFullWidth: true },
  ]

  return (
    <div className="profile-details-page" data-testid="kyc-details-page">
      <div className="profile-details-page__content">
        <DetailCard
          title="KYC Details"
          items={identityItems}
          onEdit={handleEdit}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          }
        />
      </div>
    </div>
  )
}

export default KycDetails
