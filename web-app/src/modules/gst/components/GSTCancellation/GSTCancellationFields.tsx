import React, { useState } from 'react'
import { gstInput } from '@modules/gst/utils/gstInputFormatters'
import { DobDatePickerModal } from '@modules/authentication/components/DobDatePickerModal/DobDatePickerModal'

interface GSTCancellationFieldsProps {
  gstin: string
  setGstin: (val: string) => void
  reason: string
  setReason: (val: string) => void
  cancellationDate: string
  setCancellationDate: (val: string) => void
  pendingLiabilities: string
  setPendingLiabilities: (val: string) => void
  lastGstr3bFiled: string
  setLastGstr3bFiled: (val: string) => void
  closingStockDetails: string
  setClosingStockDetails: (val: string) => void
  errors: Record<string, string>
  clearError: (field: string) => void
}

const REASON_OPTIONS = [
  'Discontinuance of business / closure',
  'Change in constitution of business',
  'Transfer / Merger / Amalgamation',
  'No longer liable to be registered',
  'Death of sole proprietor',
  'Other reasons',
]

export const GSTCancellationFields: React.FC<GSTCancellationFieldsProps> = ({
  gstin, setGstin, reason, setReason, cancellationDate, setCancellationDate,
  pendingLiabilities, setPendingLiabilities, lastGstr3bFiled, setLastGstr3bFiled,
  closingStockDetails, setClosingStockDetails, errors, clearError,
}) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const handleCalendarClick = () => {
    setIsCalendarOpen((prev) => !prev)
  }

  return (
    <div className="gst-canc-card-box">
      <div className="gst-canc-field-group">
        <label htmlFor="gst-canc-gstin-input" className="gst-canc-label">
          GSTIN (15-Character) <span className="gst-canc-star">*</span>
        </label>
        <input
          id="gst-canc-gstin-input" type="text" maxLength={15} placeholder="Enter your GSTIN"
          value={gstin} onChange={(e) => { setGstin(gstInput.gstin(e.target.value)); clearError('gstin') }}
          className={`gst-canc-input ${errors.gstin ? 'has-error' : ''}`}
        />
        {errors.gstin && <span className="gst-canc-error-msg">{errors.gstin}</span>}
      </div>

      <div className="gst-canc-form-row">
        <div className="gst-canc-field-group">
          <label htmlFor="gst-canc-reason-select" className="gst-canc-label">
            Reason for Cancellation <span className="gst-canc-star">*</span>
          </label>
          <div className="gst-canc-select-wrapper">
            <select
              id="gst-canc-reason-select" value={reason}
              onChange={(e) => { setReason(e.target.value); clearError('reason') }}
              className={`gst-canc-select ${errors.reason ? 'has-error' : ''}`}
            >
              <option value="">Select Reason for Cancellation</option>
              {REASON_OPTIONS.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
            </select>
            <span className="gst-canc-chevron">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </div>
          {errors.reason && <span className="gst-canc-error-msg">{errors.reason}</span>}
        </div>

        <div className="gst-canc-field-group">
          <label htmlFor="gst-canc-date-input" className="gst-canc-label">
            Date Cancellation Is Sought <span className="gst-canc-star">*</span>
          </label>
          <div
            className="gst-canc-date-wrapper"
            onClick={handleCalendarClick}
            style={{ position: 'relative', cursor: 'pointer' }}
          >
            <input
              id="gst-canc-date-input"
              type="text"
              readOnly
              placeholder="DD-MM-YYYY"
              value={cancellationDate ? cancellationDate.split('-').reverse().join('-') : ''}
              className={`gst-canc-date-input ${errors.cancellationDate ? 'has-error' : ''}`}
            />
            <button
              type="button"
              className="gst-canc-calendar-btn"
              onClick={(e) => { e.stopPropagation(); handleCalendarClick() }}
              aria-label="Open calendar"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </button>
            <DobDatePickerModal
              isOpen={isCalendarOpen}
              value={cancellationDate}
              title="Date Cancellation Is Sought"
              format="YYYY-MM-DD"
              onApply={(val) => {
                setCancellationDate(val)
                clearError('cancellationDate')
              }}
              onClose={() => setIsCalendarOpen(false)}
            />
          </div>
          {errors.cancellationDate && <span className="gst-canc-error-msg">{errors.cancellationDate}</span>}
        </div>
      </div>

      <div className="gst-canc-form-row">
        <div className="gst-canc-field-group">
          <label htmlFor="gst-canc-dues-input" className="gst-canc-label">Pending Dues / Liabilities (Optional)</label>
          <input id="gst-canc-dues-input" type="text" placeholder="Enter any pending penalty or tax dues, if any" value={pendingLiabilities} onChange={(e) => setPendingLiabilities(e.target.value)} className="gst-canc-input" />
        </div>

        <div className="gst-canc-field-group">
          <label htmlFor="gst-canc-gstr3b-input" className="gst-canc-label">
            Last GSTR-3B Filed ARN / Period <span className="gst-canc-star">*</span>
          </label>
          <input
            id="gst-canc-gstr3b-input" type="text" placeholder="Enter ARN or return period" value={lastGstr3bFiled}
            onChange={(e) => { setLastGstr3bFiled(gstInput.text(e.target.value, 60)); clearError('lastGstr3bFiled') }}
            className={`gst-canc-input ${errors.lastGstr3bFiled ? 'has-error' : ''}`}
          />
          {errors.lastGstr3bFiled && <span className="gst-canc-error-msg">{errors.lastGstr3bFiled}</span>}
        </div>
      </div>

      <div className="gst-canc-field-group">
        <label htmlFor="gst-canc-stock-textarea" className="gst-canc-label">
          Details of Closing Stock & Input Tax Reversal <span className="gst-canc-star">*</span>
        </label>
        <div className="gst-canc-textarea-wrapper">
          <textarea
            id="gst-canc-stock-textarea" rows={3} maxLength={300} placeholder="Describe closing inventory value and ITC reversal or enter 'Nil'"
            value={closingStockDetails} onChange={(e) => { setClosingStockDetails(gstInput.text(e.target.value, 500)); clearError('closingStockDetails') }}
            className={`gst-canc-textarea ${errors.closingStockDetails ? 'has-error' : ''}`}
          />
          <span className="gst-canc-char-count">{closingStockDetails.length}/300</span>
        </div>
        {errors.closingStockDetails && <span className="gst-canc-error-msg">{errors.closingStockDetails}</span>}
      </div>
    </div>
  )
}

export default GSTCancellationFields
