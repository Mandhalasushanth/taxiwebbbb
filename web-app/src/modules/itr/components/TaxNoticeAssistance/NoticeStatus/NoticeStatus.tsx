import React from 'react'
import type { NoticeFormData } from '../../../types/taxNoticeAssistance.types'
import './NoticeStatus.css'

export interface NoticeStatusProps {
  formData: NoticeFormData
  onBackToTaxServices: () => void
}

export const NoticeStatus: React.FC<NoticeStatusProps> = ({
  formData,
  onBackToTaxServices,
}) => {
  const noticeNumber = formData.noticeReference || formData.applicationCode || 'CPCGHJ257BJDFHJJK'
  const submittedOn =
    formData.submittedAt ||
    new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  const acknowledgementNo = formData.acknowledgementNo || 'ITR-2026-41262'

  // Extract section if available
  const sectionMatch = formData.noticeType?.match(/Section\s+([0-9a-zA-Z()]+)/i)
  const section = sectionMatch ? sectionMatch[1] : '143(1)(a)'

  const handleDownload = () => {
    // Generate text acknowledgement blob
    const content = `TAX NOTICE ASSISTANCE ACKNOWLEDGEMENT
----------------------------------------
Acknowledgement No : ${acknowledgementNo}
Notice Reference   : ${noticeNumber}
PAN                : ${formData.pan}
Assessment Year    : ${formData.assessmentYear}
Section            : ${section}
Submission Date    : ${submittedOn}
Assigned Executive : Meera Iyer, Senior Tax Executive
Status             : Response Submitted Successfully to Income Tax Department
----------------------------------------
TaxEdge Fin Solutions - Confidential Client Receipt`

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Notice_Acknowledgement_${acknowledgementNo}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="notice-status-container">
      {/* Success Hero Header */}
      <div className="notice-status-hero">
        <div className="notice-status-hero__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="notice-status-hero__title">Response Submitted Successfully</h2>
        <p className="notice-status-hero__desc">
          Your response has been submitted to the Income Tax Department. We will keep you updated on
          any further communication.
        </p>
      </div>

      {/* 2-Column Responsive Grid */}
      <div className="notice-status-grid">
        {/* Left Column: Timeline Stepper */}
        <div className="notice-status-timeline-card">
          <div className="notice-status-timeline">
            {/* Step 1 */}
            <div className="notice-status-step">
              <div className="notice-status-step__dot notice-status-step__dot--completed">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="notice-status-step__content">
                <div className="notice-status-step__header">
                  <span className="notice-status-step__title">Notice &amp; Details Provided</span>
                  <span className="notice-status-step__tag">{formData.assessmentYear || 'AY 2025–26'}</span>
                </div>
                <p className="notice-status-step__desc">
                  Notice details and primary document submitted
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="notice-status-step">
              <div className="notice-status-step__dot notice-status-step__dot--completed">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="notice-status-step__content">
                <div className="notice-status-step__header">
                  <span className="notice-status-step__title">Staff Review &amp; Verification</span>
                  <span className="notice-status-step__tag notice-status-step__tag--green">Verified</span>
                </div>
                <p className="notice-status-step__desc">
                  Tax Executive examined notice &amp; supporting documents
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="notice-status-step">
              <div className="notice-status-step__dot notice-status-step__dot--completed">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="notice-status-step__content">
                <div className="notice-status-step__header">
                  <span className="notice-status-step__title">Response Drafted &amp; Approved</span>
                  <span className="notice-status-step__tag notice-status-step__tag--green">Approved</span>
                </div>
                <p className="notice-status-step__desc">
                  Legal draft confirmed and signed off by assessee
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="notice-status-step">
              <div className="notice-status-step__dot notice-status-step__dot--completed">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="notice-status-step__content">
                <div className="notice-status-step__header">
                  <span className="notice-status-step__title">Response Submitted</span>
                  <span className="notice-status-step__tag">{submittedOn}</span>
                </div>
                <p className="notice-status-step__desc">
                  Response successfully filed on Income Tax e-filing portal
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="notice-status-step notice-status-step--pending">
              <div className="notice-status-step__dot notice-status-step__dot--pending">
                <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor">
                  <circle cx="12" cy="12" r="6" />
                </svg>
              </div>
              <div className="notice-status-step__content">
                <div className="notice-status-step__header">
                  <span className="notice-status-step__title">Department Resolution</span>
                  <span className="notice-status-step__tag">Pending</span>
                </div>
                <p className="notice-status-step__desc">
                  Awaiting final intimation or closure order from CPC / AO
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Key Details Table */}
        <div className="notice-status-details-card">
          <div className="notice-status-table">
            <div className="notice-status-table__row">
              <span className="notice-status-table__label">Notice Number</span>
              <span className="notice-status-table__value">{noticeNumber}</span>
            </div>

            <div className="notice-status-table__row">
              <span className="notice-status-table__label">Section</span>
              <span className="notice-status-table__value">{section}</span>
            </div>

            <div className="notice-status-table__row">
              <span className="notice-status-table__label">Submitted On</span>
              <span className="notice-status-table__value">{submittedOn}</span>
            </div>

            <div className="notice-status-table__row">
              <span className="notice-status-table__label">Acknowledgement No</span>
              <span className="notice-status-table__value">{acknowledgementNo}</span>
            </div>

            <div className="notice-status-table__row">
              <span className="notice-status-table__label">Assigned Tax Executive</span>
              <span className="notice-status-table__value">Meera Iyer, Tax Executive</span>
            </div>

            <div className="notice-status-table__row">
              <span className="notice-status-table__label">Current Status</span>
              <span className="notice-status-table__badge">Response Submitted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="notice-status-actions">
        <button
          type="button"
          className="notice-status-actions__btn notice-status-actions__btn--download"
          onClick={handleDownload}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>Download Filing Acknowledgement</span>
        </button>

        <button
          type="button"
          className="notice-status-actions__btn notice-status-actions__btn--primary"
          onClick={onBackToTaxServices}
        >
          <span>Back to Tax Services</span>
        </button>
      </div>
    </div>
  )
}

export default NoticeStatus
