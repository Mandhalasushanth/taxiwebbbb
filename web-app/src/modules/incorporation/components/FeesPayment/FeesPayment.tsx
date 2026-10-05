import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '@core/config'
import { userStorage } from '@core/storage/userStorage'
import { getEntityStructureLabel, getProposedCompanyName } from '../../types/incorporation.types'
import { useIncorporationFlow } from '../../hooks'
import './FeesPayment.css'

export const FeesPayment: React.FC = () => {
  const navigate = useNavigate()
  const { formData } = useIncorporationFlow()

  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking' | null>(null)
  const [paymentError, setPaymentError] = useState<string>('')
  const [showSubmittedModal, setShowSubmittedModal] = useState<boolean>(false)
  const [submittedPayload, setSubmittedPayload] = useState<Record<string, any>>(formData)

  const professionalFee = 4999
  const gst = 900
  const mcaCharges = 1500
  const totalAmount = professionalFee + gst + mcaCharges

  const companyType = formData.companyType || 'pvt_ltd'
  const entityStructure = getEntityStructureLabel(companyType)
  const companyName = getProposedCompanyName(companyType, formData.companyDetails?.firstPreferredName)


  const handlePayAndSubmit = () => {
    if (!selectedMethod) {
      setPaymentError('Please select a payment method before proceeding.')
      return
    }

    const applicationId = formData.applicationId || 'INC-2026-89421'
    const transactionId = formData.transactionId || 'TXN-96771922'
    const applicationDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

    const finalState = {
      ...formData,
      paymentMethod: selectedMethod,
      paymentCompleted: true,
      applicationId,
      transactionId,
      paidAmount: totalAmount,
      applicationDate,
    }

    userStorage.deleteDraft('incorporation')
    userStorage.saveUserApplication({
      id: applicationId,
      code: applicationId,
      title: `${companyName} Incorporation`,
      meta: 'Under Verification',
      statusLabel: 'Verification',
      statusTone: 'warning',
      progress: 90,
      icon: '🏢',
      to: routePaths.incorporation.applicationTracking,
    })

    setSubmittedPayload(finalState)
    setShowSubmittedModal(true)
  }

  const handleContinueToTracking = () => {
    navigate(routePaths.incorporation.applicationTracking, {
      state: submittedPayload,
    })
  }

  const handleSelectMethod = (method: 'upi' | 'card' | 'netbanking') => {
    setPaymentError('')
    setSelectedMethod(method)
  }

  const paymentMethods: { id: 'upi' | 'card' | 'netbanking'; name: string; icon: React.ReactNode }[] = [
    {
      id: 'upi',
      name: 'UPI (GPay / PhonePe / Paytm / BHIM)',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <path d="M14 14h2v2h-2z" />
          <path d="M18 14h3v3h-3z" />
          <path d="M14 18h3v3h-3z" />
        </svg>
      ),
    },
    {
      id: 'card',
      name: 'Credit / Debit Card',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      ),
    },
    {
      id: 'netbanking',
      name: 'Net Banking (All Indian Banks)',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 21h18M3 10h18M5 10v11M19 10v11M9 10v11M15 10v11M12 2L2 7h20L12 2z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="fees-pay-page">
      {/* Progress Tracker */}
      <div className="fees-pay-stepbar">
        <span className="fees-pay-stepbar__badge">Step 9 of 11</span>
        <span className="fees-pay-stepbar__text">Fees & Payment Breakdown</span>
        <div className="fees-pay-stepbar__line">
          <div className="fees-pay-stepbar__line-fill" />
        </div>
      </div>

      {/* Header */}
      <div className="fees-pay-header">
        <h1 className="fees-pay-header__title">Fees & Payment Breakdown</h1>
        <p className="fees-pay-header__subtitle">
          Review itemized MCA government filing fees and TaxEdge professional charges.
        </p>
      </div>

      {/* Fees Breakdown Card */}
      <section className="fees-breakdown-card">
        <div className="fees-breakdown-row">
          <span className="fees-breakdown-row__label">TaxEdge Professional Fee</span>
          <span className="fees-breakdown-row__value">₹4,999</span>
        </div>
        <div className="fees-breakdown-row">
          <span className="fees-breakdown-row__label">GST (18%)</span>
          <span className="fees-breakdown-row__value">₹900</span>
        </div>
        <div className="fees-breakdown-row">
          <span className="fees-breakdown-row__label">Estimated / Applicable MCA Statutory Charges</span>
          <span className="fees-breakdown-row__value">₹1,500</span>
        </div>

        <div className="fees-breakdown-divider" />

        <div className="fees-breakdown-row fees-breakdown-row--total">
          <span className="fees-breakdown-row__label">Total Payable Amount</span>
          <span className="fees-breakdown-row__value">₹7,399</span>
        </div>
      </section>

      {/* Note */}
      <p className="fees-note">
        * ₹1,500 represents estimated / applicable MCA government filing fee and stamp duty charges.
      </p>

      {/* Select Payment Method */}
      <section className="fees-payment-methods">
        <h2 className="fees-payment-methods__title">Select Payment Method</h2>
        <div className={`fees-methods-list ${paymentError ? 'fees-methods-list--error' : ''}`}>
          {paymentMethods.map((m) => (
            <div
              key={m.id}
              className={`fees-method-item ${selectedMethod === m.id ? 'fees-method-item--selected' : ''}`}
              onClick={() => handleSelectMethod(m.id)}
              role="radio"
              aria-checked={selectedMethod === m.id}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleSelectMethod(m.id)
                }
              }}
            >
              <div className="fees-method-item__left">
                <div className="fees-method-item__icon">{m.icon}</div>
                <span className="fees-method-item__name">{m.name}</span>
              </div>
              <div className="fees-radio">
                {selectedMethod === m.id && <div className="fees-radio__inner" />}
              </div>
            </div>
          ))}
        </div>
        {paymentError && <span className="fees-field-error">{paymentError}</span>}
      </section>

      {/* Footer Actions */}
      <footer className="fees-pay-footer">
        <button
          type="button"
          className="fees-pay-btn-back"
          onClick={() => navigate(routePaths.incorporation.reviewApplication)}
        >
          &larr; Back
        </button>
        <button
          type="button"
          className="fees-pay-btn-submit"
          onClick={handlePayAndSubmit}
        >
          {`Pay ₹${totalAmount.toLocaleString('en-IN')} & Submit`}
        </button>
      </footer>

      {/* Application Submitted Success Popup Modal */}
      {showSubmittedModal && (
        <div className="fees-submit-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="fees-modal-title">
          <div className="fees-submit-modal-card">
            {/* Green Checkmark Circle */}
            <div className="fees-submit-modal-icon-wrap" aria-hidden="true">
              <svg
                width="44"
                height="44"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <div className="fees-submit-modal-header">
              <h2 id="fees-modal-title" className="fees-submit-modal-title">Application Submitted Successfully!</h2>
              <p className="fees-submit-modal-subtitle">
                Your company incorporation file has been received and assigned to a TaxEdge compliance officer.
              </p>
            </div>

            {/* Status Summary Card */}
            <section className="fees-submit-modal-summary" aria-label="Submission Summary">
              <div className="fees-submit-modal-row">
                <span className="fees-submit-modal-label">Application ID</span>
                <span className="fees-submit-modal-val fees-submit-modal-id">
                  {submittedPayload.applicationId || 'INC-2026-89421'}
                </span>
              </div>
              <div className="fees-submit-modal-row">
                <span className="fees-submit-modal-label">Proposed Company Name</span>
                <span className="fees-submit-modal-val">{companyName}</span>
              </div>
              <div className="fees-submit-modal-row">
                <span className="fees-submit-modal-label">Entity Structure</span>
                <span className="fees-submit-modal-val">{entityStructure}</span>
              </div>
              <div className="fees-submit-modal-row">
                <span className="fees-submit-modal-label">Current Status</span>
                <span className="fees-submit-modal-val fees-submit-modal-status">Under Verification</span>
              </div>
            </section>

            {/* Action Buttons */}
            <div className="fees-submit-modal-actions">
              <button
                type="button"
                className="fees-submit-modal-btn-primary"
                onClick={handleContinueToTracking}
              >
                <span>View Application Status</span>
                <span aria-hidden="true">&rarr;</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default FeesPayment
