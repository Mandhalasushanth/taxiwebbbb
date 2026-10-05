import React from 'react'
import { User, CheckCircle2, Lock } from 'lucide-react'
import type { ApplicantIdentityProfile } from '@modules/loans/types/businessLoan.types'

interface ProfileFieldProps {
  label: string
  value: string
}

/**
 * Pure individual profile field renderer (Loop-free)
 */
const ProfileField: React.FC<ProfileFieldProps> = ({ label, value }) => (
  <div className="applicant-id-card__field">
    <span className="applicant-id-card__field-label">{label}</span>
    <span className="applicant-id-card__field-value">{value || '—'}</span>
  </div>
)

export interface ApplicantIdentityCardProps {
  applicant: ApplicantIdentityProfile
}

/**
 * Verified Applicant Identity card securely pulled from user session
 */
export const ApplicantIdentityCard: React.FC<ApplicantIdentityCardProps> = ({ applicant }) => {
  return (
    <div className="applicant-id-card" data-testid="applicant-identity-card">
      {/* Card Header */}
      <div className="applicant-id-card__header">
        <div className="applicant-id-card__title-group">
          <div className="applicant-id-card__icon-tile">
            <User size={22} aria-hidden="true" />
          </div>
          <h2 className="applicant-id-card__title">Applicant Identity Details</h2>
        </div>

        {applicant.isVerified && (
          <div className="applicant-id-card__badge" aria-label="Verified Profile">
            <CheckCircle2
              size={13}
              className="applicant-id-card__badge-check"
              aria-hidden="true"
            />
            <span>Verified Profile</span>
          </div>
        )}
      </div>

      {/* Security Info Callout */}
      <div className="applicant-id-card__alert">
        <Lock
          size={18}
          className="applicant-id-card__alert-icon"
          aria-hidden="true"
        />
        <span className="applicant-id-card__alert-text">
          Your details are securely pulled from your TaxEdge account. You do not need to re-enter them.
        </span>
      </div>

      {/* Grid of Profile Information (Explicit component calls, loop-free) */}
      <div className="applicant-id-card__grid">
        {/* Row 1 */}
        <div className="applicant-id-card__row">
          <ProfileField label="Name" value={applicant.name} />
          <ProfileField label="Mobile" value={applicant.mobile} />
          <ProfileField label="Email" value={applicant.email} />
        </div>

        <div className="applicant-id-card__divider" />

        {/* Row 2 */}
        <div className="applicant-id-card__row">
          <ProfileField label="PAN" value={applicant.pan} />
          <ProfileField label="Aadhaar" value={applicant.aadhaar} />
          <ProfileField label="Date of Birth" value={applicant.dob} />
        </div>

        <div className="applicant-id-card__divider" />

        {/* Row 3 */}
        <div className="applicant-id-card__row applicant-id-card__row--full">
          <ProfileField label="Address" value={applicant.address} />
        </div>
      </div>
    </div>
  )
}

export default ApplicantIdentityCard
