import { formatGstFileSize } from '@modules/gst/utils/gstFile'
import React, { useState } from 'react'
import { gstInput } from '@modules/gst/utils/gstInputFormatters'
import { DocumentCard } from '@shared/components'
import { DobDatePickerModal } from '@modules/authentication/components/DobDatePickerModal/DobDatePickerModal'
import './GSTComplianceUploadFields.css'
import { UPLOAD_HINT } from '@shared/upload'

export interface NoticeResponseValues {
  noticeNumber: string
  issueDate: string
  dueDate: string
  additionalInfo: string
}

interface GSTNoticeResponseFieldsProps {
  values: NoticeResponseValues
  onChange: <K extends keyof NoticeResponseValues>(field: K, value: NoticeResponseValues[K]) => void
  noticeFile: File | null
  onNoticeFileChange: (file: File | null) => void
  errors?: Partial<Record<keyof NoticeResponseValues | 'noticeFile', string>>
  onPreviewDoc?: (file: File, title: string) => void
}

/** Notice details for a compliance request; the values live in the parent so they can be validated and drafted */
export const GSTNoticeResponseFields: React.FC<GSTNoticeResponseFieldsProps> = ({
  values,
  onChange,
  noticeFile,
  onNoticeFileChange,
  errors = {},
  onPreviewDoc,
}) => {
  const { noticeNumber, issueDate, dueDate, additionalInfo } = values
  const [isIssueOpen, setIsIssueOpen] = useState(false)
  const [isDueOpen, setIsDueOpen] = useState(false)

  const handleView = () => {
    if (!noticeFile) return
    if (onPreviewDoc) {
      onPreviewDoc(noticeFile, 'Department Notice Copy')
    } else {
      const url = URL.createObjectURL(noticeFile)
      window.open(url, '_blank')
    }
  }

  return (
    <div className="gst-notice-card">
      {/* Card Header */}
      <div className="gst-notice-header">
        <div className="gst-notice-header-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        </div>
        <div>
          <h3 className="gst-notice-header-title">Notice Details &amp; Response</h3>
          <p className="gst-notice-header-sub">Provide the notice details and upload the required documents.</p>
        </div>
      </div>

      <div className="gst-notice-body">
        {/* Field 1: Notice Number */}
        <div className="gst-notice-field-group">
          <label className="gst-notice-label">
            Enter notice number <span className="req-asterisk">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter notice number"
            value={noticeNumber}
            onChange={(e) => onChange('noticeNumber', gstInput.reference(e.target.value))}
            className={`gst-notice-input ${errors.noticeNumber ? 'has-error' : ''}`}
          />
          {errors.noticeNumber && <span className="form-error">{errors.noticeNumber}</span>}
        </div>

        {/* Field 2 & 3: Issue Date & Due Date (2-column row with right-aligned calendar icon) */}
        <div className="gst-notice-grid-row">
          <div className="gst-notice-field-group">
            <label className="gst-notice-label">
              Notice Issue Date <span className="req-asterisk">*</span>
            </label>
            <div
              className="gst-notice-date-wrapper"
              onClick={() => setIsIssueOpen((prev) => !prev)}
              style={{ position: 'relative', cursor: 'pointer' }}
            >
              <input
                type="text"
                readOnly
                placeholder="DD-MM-YYYY"
                value={issueDate ? issueDate.split('-').reverse().join('-') : ''}
                className="gst-notice-date-input"
              />
              <span className="gst-notice-date-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </span>
              <DobDatePickerModal
                isOpen={isIssueOpen}
                value={issueDate}
                title="Notice Issue Date"
                format="YYYY-MM-DD"
                maxDate={new Date()}
                onApply={(val) => onChange('issueDate', val)}
                onClose={() => setIsIssueOpen(false)}
              />
            </div>
            {errors.issueDate && <span className="form-error">{errors.issueDate}</span>}
          </div>

          <div className="gst-notice-field-group">
            <label className="gst-notice-label">
              Reply Due Date <span className="req-asterisk">*</span>
            </label>
            <div
              className="gst-notice-date-wrapper"
              onClick={() => setIsDueOpen((prev) => !prev)}
              style={{ position: 'relative', cursor: 'pointer' }}
            >
              <input
                type="text"
                readOnly
                placeholder="DD-MM-YYYY"
                value={dueDate ? dueDate.split('-').reverse().join('-') : ''}
                className="gst-notice-date-input"
              />
              <span className="gst-notice-date-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </span>
              <DobDatePickerModal
                isOpen={isDueOpen}
                value={dueDate}
                title="Reply Due Date"
                format="YYYY-MM-DD"
                minDate={new Date()}
                onApply={(val) => onChange('dueDate', val)}
                onClose={() => setIsDueOpen(false)}
              />
            </div>
            {errors.dueDate && <span className="form-error">{errors.dueDate}</span>}
          </div>
        </div>

        {/* Section 3: Upload Notice Copy Card */}
        <DocumentCard
          id="notice-copy"
          title="Upload Notice Copy"
          subtitle={`Upload official GST notice copy from the tax department (${UPLOAD_HINT})`}
          isRequired={true}
          isUploaded={Boolean(noticeFile)}
          fileName={noticeFile?.name}
          fileSize={noticeFile ? formatGstFileSize(noticeFile.size) : undefined}
          file={noticeFile || undefined}
          onUpload={(_, file) => onNoticeFileChange(file)}
          onRemove={() => onNoticeFileChange(null)}
          onView={() => handleView()}
        />
        {errors.noticeFile && <span className="form-error">{errors.noticeFile}</span>}

        {/* Section 4: Additional Information */}
        <div className="gst-notice-field-group">
          <div className="gst-notice-title-box gst-notice-title-box--spaced">
            <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" width="20" height="20">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <span className="gst-notice-section-name">Additional Information</span>
          </div>
          <div className="gst-notice-textarea-wrapper">
            <textarea
              rows={4}
              maxLength={500}
              placeholder="Add any important information for our CA team..."
              value={additionalInfo}
              onChange={(e) => onChange('additionalInfo', gstInput.text(e.target.value, 500))}
              className="gst-notice-textarea"
            />
            <span className="gst-notice-char-counter">{additionalInfo.length}/500</span>
          </div>
        </div>
      </div>
    </div>
  )
}


