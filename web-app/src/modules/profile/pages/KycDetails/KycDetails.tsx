import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@store/index'
import { authStorage, buildProfileCompletionPath } from '@core/auth'
import { routePaths } from '@core/config'
import { maskPan, maskAadhaarAsterisk } from '@shared/utils'
import { DetailCard, type DetailCardItem } from '../../components/DetailCard/DetailCard'
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

  const isVerified = Boolean((user.pan && user.aadhaar) || user.isProfileComplete || user.pan)

  const identityItems: DetailCardItem[] = [
    { label: 'PAN Number', value: user.pan ? maskPan(user.pan) : null },
    { label: 'Aadhaar Number', value: user.aadhaar ? maskAadhaarAsterisk(user.aadhaar) : null },
    {
      label: 'Verification Status',
      value: isVerified ? (
        <span className="profile-verified-badge" data-testid="kyc-verification-status">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Verified</span>
        </span>
      ) : (
        <span className="profile-pending-badge" data-testid="kyc-pending-status">
          Pending
        </span>
      ),
    },
  ]

  return (
    <div className="profile-details-page" data-testid="kyc-details-page">
      <div className="profile-details-page__content">
        <DetailCard
          title="KYC Details"
          items={identityItems}
          onEdit={handleEdit}
          footerNote="Status reflects the PAN and Aadhaar documents uploaded against your applications."
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
