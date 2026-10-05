import React from 'react'
import { Users, ChevronDown } from 'lucide-react'
import type {
  ProjectFinanceData,
  ApplicantEntityType,
  BankingRelationshipType,
  PrimaryBusinessActivityType,
} from '@modules/loans/types/projectFinance.types'

const ENTITY_TYPES = [
  { label: 'Private Limited Company', value: 'Private Limited Company' },
  { label: 'Public Limited Company', value: 'Public Limited Company' },
  { label: 'Partnership Firm', value: 'Partnership Firm' },
  { label: 'Limited Liability Partnership', value: 'Limited Liability Partnership' },
  { label: 'Proprietorship', value: 'Proprietorship' },
  { label: 'Trust / Society', value: 'Trust / Society' },
]

const BANKING_RELATIONSHIPS = [
  { label: 'Existing Borrower', value: 'Existing Borrower' },
  { label: 'Deposit Customer', value: 'Deposit Customer' },
  { label: 'New to Bank', value: 'New to Bank' },
]

const PRIMARY_BUSINESS_ACTIVITIES = [
  { label: 'Manufacturing', value: 'Manufacturing' },
  { label: 'Services', value: 'Services' },
  { label: 'Trading', value: 'Trading' },
  { label: 'Infrastructure', value: 'Infrastructure' },
  { label: 'Agriculture / Allied', value: 'Agriculture / Allied' },
]

export interface ApplicantDetailsSectionProps {
  data: ProjectFinanceData
  onChange: (fields: Partial<ProjectFinanceData>) => void
  isOpen: boolean
  onToggle: () => void
  onOpenPicker?: (picker: 'entityType' | 'bankingRelationship' | 'primaryBusinessActivity') => void
  errors?: Record<string, string>
}

export const ApplicantDetailsSection: React.FC<ApplicantDetailsSectionProps> = ({
  data,
  onChange,
  isOpen,
  onToggle,
  errors = {},
}) => {
  return (
    <div className="pf-collapsible-card">
      <div className="pf-collapsible-header" onClick={onToggle}>
        <div className="pf-collapsible-header__left">
          <div className="pf-section-icon-tile pf-section-icon-tile--orange">
            <Users size={20} />
          </div>
          <h3 className="pf-collapsible-title">Applicant / Borrower Details</h3>
        </div>
        <span className={`pf-chevron ${isOpen ? 'pf-chevron--open' : ''}`}>
          <ChevronDown size={18} />
        </span>
      </div>

      {isOpen && (
        <div className="pf-collapsible-body">
          {/* Applicant Name */}
          <div className="pf-field-group">
            <label htmlFor="applicantName" className="pf-field-label">
              Applicant / Borrower Name <span className="pf-req">*</span>
            </label>
            <input
              id="applicantName"
              type="text"
              className={`pf-custom-input ${errors.applicantName ? 'pf-custom-input--error' : ''}`}
              placeholder="Enter applicant name"
              value={data.applicantName || ''}
              onChange={(e) => onChange({ applicantName: e.target.value })}
            />
            {errors.applicantName && <span className="pf-field-error">{errors.applicantName}</span>}
          </div>

          {/* Constitution / Entity Type */}
          <div className="pf-field-group">
            <label htmlFor="entityType" className="pf-field-label">
              Constitution / Entity Type <span className="pf-req">*</span>
            </label>
            <select
              id="entityType"
              className={`pf-custom-select ${errors.entityType ? 'pf-custom-select--error' : ''}`}
              value={data.entityType || ''}
              onChange={(e) => onChange({ entityType: e.target.value as ApplicantEntityType })}
            >
              <option value="" disabled>Select entity type</option>
              {ENTITY_TYPES.map((opt: { label: string, value: string }) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.entityType && <span className="pf-field-error">{errors.entityType}</span>}
          </div>

          {/* PAN */}
          <div className="pf-field-group">
            <label htmlFor="pan" className="pf-field-label">
              PAN <span className="pf-req">*</span>
            </label>
            <input
              id="pan"
              type="text"
              maxLength={10}
              className={`pf-custom-input ${errors.pan ? 'pf-custom-input--error' : ''}`}
              placeholder="Enter PAN"
              value={data.pan || ''}
              onChange={(e) => onChange({ pan: e.target.value.toUpperCase() })}
            />
            {errors.pan && <span className="pf-field-error">{errors.pan}</span>}
          </div>

          {/* CIN / LLPIN */}
          <div className="pf-field-group">
            <label htmlFor="cinLlpin" className="pf-field-label">
              CIN / LLPIN
            </label>
            <input
              id="cinLlpin"
              type="text"
              className="pf-custom-input"
              placeholder="Enter CIN / LLPIN"
              value={data.cinLlpin || ''}
              onChange={(e) => onChange({ cinLlpin: e.target.value.toUpperCase() })}
            />
          </div>

          {/* Date of Incorporation */}
          <div className="pf-field-group">
            <label htmlFor="dateOfIncorporation" className="pf-field-label">
              Date of Incorporation <span className="pf-req">*</span>
            </label>
            <input
              id="dateOfIncorporation"
              type="date"
              className={`pf-custom-input ${errors.dateOfIncorporation ? 'pf-custom-input--error' : ''}`}
              value={data.dateOfIncorporation || ''}
              onChange={(e) => onChange({ dateOfIncorporation: e.target.value })}
            />
            {errors.dateOfIncorporation && (
              <span className="pf-field-error">{errors.dateOfIncorporation}</span>
            )}
          </div>

          {/* Existing Customer? */}
          <div className="pf-field-group">
            <label className="pf-field-label">
              Existing Customer? <span className="pf-req">*</span>
            </label>
            <div className="pf-radio-group">
              <label className="pf-radio-label">
                <input
                  type="radio"
                  name="isExistingCustomer"
                  className="pf-radio-input"
                  checked={data.isExistingCustomer === true || data.isExistingBankCustomer === true}
                  onChange={() => onChange({ isExistingCustomer: true, isExistingBankCustomer: true })}
                />
                <div className="pf-radio-custom">
                  <div className="pf-radio-custom-dot" />
                </div>
                <span>Yes</span>
              </label>
              <label className="pf-radio-label">
                <input
                  type="radio"
                  name="isExistingCustomer"
                  className="pf-radio-input"
                  checked={data.isExistingCustomer === false && data.isExistingBankCustomer === false}
                  onChange={() => onChange({ isExistingCustomer: false, isExistingBankCustomer: false })}
                />
                <div className="pf-radio-custom">
                  <div className="pf-radio-custom-dot" />
                </div>
                <span>No</span>
              </label>
            </div>
          </div>

          {/* Banking Relationship */}
          <div className="pf-field-group">
            <label htmlFor="bankingRelationship" className="pf-field-label">Banking Relationship</label>
            <select
              id="bankingRelationship"
              className="pf-custom-select"
              value={data.bankingRelationship || ''}
              onChange={(e) => onChange({ bankingRelationship: e.target.value as BankingRelationshipType })}
            >
              <option value="" disabled>Select relationship</option>
              {BANKING_RELATIONSHIPS.map((opt: { label: string, value: string }) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Primary Business Activity */}
          <div className="pf-field-group">
            <label htmlFor="primaryBusinessActivity" className="pf-field-label">
              Primary Business Activity <span className="pf-req">*</span>
            </label>
            <select
              id="primaryBusinessActivity"
              className={`pf-custom-select ${errors.primaryBusinessActivity ? 'pf-custom-select--error' : ''}`}
              value={data.primaryBusinessActivity || ''}
              onChange={(e) => onChange({ primaryBusinessActivity: e.target.value as PrimaryBusinessActivityType })}
            >
              <option value="" disabled>Select primary business activity</option>
              {PRIMARY_BUSINESS_ACTIVITIES.map((opt: { label: string, value: string }) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.primaryBusinessActivity && (
              <span className="pf-field-error">{errors.primaryBusinessActivity}</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}