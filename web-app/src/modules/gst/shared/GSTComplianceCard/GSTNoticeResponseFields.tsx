import { formatGstFileSize } from '@modules/gst/utils/gstFile'
import React, { useRef } from 'react'
import { gstInput } from '@modules/gst/utils/gstInputFormatters'
import { DocumentCard, CaretInput, FieldInfoTooltip } from '@shared/components'
import { UPLOAD_HINT, DOCUMENT_UPLOAD_RULE } from '@shared/upload'
import { openGstDocumentPreview } from '@modules/gst/utils/gstDocumentPreview'
import { assertGstUploadCriteria, GstUploadException } from '@modules/gst/utils/gstUploadValidator'
import { getTodayIso } from '@shared/utils/dateUtils'
import './GSTComplianceUploadFields.css'

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
  onNoticeFileError?: (message: string | undefined) => void
  onPreviewDoc?: (file: File, title: string) => void
  onBlurField?: (field: keyof NoticeResponseValues) => void
}

const toDisplayDate = (iso: string): string => {
  if (!iso) return ''
  const parts = iso.split('-')
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`
  }
  return iso
}

/** Notice details for a compliance request; the values live in the parent so they can be validated and drafted */
export const GSTNoticeResponseFields: React.FC<GSTNoticeResponseFieldsProps> = ({
  values,
  onChange,
  noticeFile,
  onNoticeFileChange,
  errors = {},
  onNoticeFileError,
  onPreviewDoc,
  onBlurField,
}) => {
  const { noticeNumber, issueDate, dueDate, additionalInfo } = values

  const issueDateInputRef = useRef<HTMLInputElement>(null)
  const dueDateInputRef = useRef<HTMLInputElement>(null)

  const openIssueDatePicker = () => {
    if (issueDateInputRef.current) {
      try {
        issueDateInputRef.current.showPicker()
      } catch {
        issueDateInputRef.current.focus()
      }
    }
  }

  const openDueDatePicker = () => {
    if (dueDateInputRef.current) {
      try {
        dueDateInputRef.current.showPicker()
      } catch {
        dueDateInputRef.current.focus()
      }
    }
  }

  const handleNoticeUpload = (_id: string, file: File) => {
    try {
      assertGstUploadCriteria(file, DOCUMENT_UPLOAD_RULE)
      onNoticeFileChange(file)
      onNoticeFileError?.(undefined)
    } catch (err) {
      const msg =
        err instanceof GstUploadException
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Invalid file'
      onNoticeFileChange(null)
      onNoticeFileError?.(msg)
    }
  }

  const handleView = () => {
    if (!noticeFile) return
    if (onPreviewDoc) {
      onPreviewDoc(noticeFile, 'Department Notice Copy')
    } else {
      openGstDocumentPreview({
        file: noticeFile,
        fileName: noticeFile.name,
        title: 'Department Notice Copy',
      })
    }
  }

  return (
    <div className="gst-notice-card" id="gst-notice-details">
      {/* Card Header */}
      <div className="gst-notice-header">
        <div className="gst-notice-header-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        </div>
        <div>
          <h3 className="gst-notice-header-title">Notice Details &amp; Documents</h3>
          <p className="gst-notice-header-sub">Notice numbers, critical dates &amp; notice copy</p>
        </div>
      </div>

      <div className="gst-notice-body">
        {/* Field 1: Notice Number */}
        <div className="gst-notice-field-group">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <label className="gst-notice-label" htmlFor="gst-notice-number-input">
              Notice Number <span className="req-asterisk">*</span>
            </label>
            <FieldInfoTooltip
              title="Notice Number Information"
              description="Enter the notice or reference number mentioned in the GST notice issued by the GST department. Ensure the number matches the official notice."
            />
          </div>
          <CaretInput
            id="gst-notice-number-input"
            type="text"
            maxLength={20}
            className={`gst-notice-input ${errors.noticeNumber ? 'has-error' : ''}`}
            placeholder="e.g. GST/NOT/2026/001"
            value={noticeNumber}
            onChange={(e) => onChange('noticeNumber', gstInput.noticeNumber(e.target.value))}
            onBlur={() => onBlurField?.('noticeNumber')}
          />
          {errors.noticeNumber && <span className="form-error">{errors.noticeNumber}</span>}
        </div>

        {/* Section 2: Date Grid (Notice Issue Date & Reply Due Date in one row side by side) */}
        <div className="gst-notice-grid-row">
          {/* Issue Date */}
          <div className="gst-notice-field-group">
            <label className="gst-notice-label" htmlFor="gst-notice-issue-date">
              Notice Issue Date <span className="req-asterisk">*</span>
            </label>
            <div
              className={`gst-notice-date-wrapper ${errors.issueDate ? 'has-error' : ''}`}
              onClick={openIssueDatePicker}
            >
              <span className={`gst-notice-date-display ${issueDate ? '' : 'gst-notice-date-display--empty'}`}>
                {issueDate ? toDisplayDate(issueDate) : 'dd-mm-yyyy'}
              </span>
              <div className="gst-notice-date-picker-anchor">
                <input
                  ref={issueDateInputRef}
                  id="gst-notice-issue-date"
                  type="date"
                  max={getTodayIso()}
                  value={issueDate}
                  onChange={(e) => onChange('issueDate', e.target.value)}
                  onClick={openIssueDatePicker}
                  onBlur={() => onBlurField?.('issueDate')}
                  className="gst-notice-date-input"
                  aria-label="Notice Issue Date"
                  tabIndex={0}
                />
                <button
                  type="button"
                  className="gst-notice-date-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    openIssueDatePicker()
                  }}
                  aria-label="Open Notice Issue Date picker"
                  tabIndex={-1}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </button>
              </div>
            </div>
            {errors.issueDate && <span className="form-error">{errors.issueDate}</span>}
          </div>

          {/* Due Date */}
          <div className="gst-notice-field-group">
            <label className="gst-notice-label" htmlFor="gst-notice-due-date">
              Reply Due Date <span className="req-asterisk">*</span>
            </label>
            <div
              className={`gst-notice-date-wrapper ${errors.dueDate ? 'has-error' : ''}`}
              onClick={openDueDatePicker}
            >
              <span className={`gst-notice-date-display ${dueDate ? '' : 'gst-notice-date-display--empty'}`}>
                {dueDate ? toDisplayDate(dueDate) : 'dd-mm-yyyy'}
              </span>
              <div className="gst-notice-date-picker-anchor">
                <input
                  ref={dueDateInputRef}
                  id="gst-notice-due-date"
                  type="date"
                  max={getTodayIso()}
                  value={dueDate}
                  onChange={(e) => onChange('dueDate', e.target.value)}
                  onClick={openDueDatePicker}
                  onBlur={() => onBlurField?.('dueDate')}
                  className="gst-notice-date-input"
                  aria-label="Reply Due Date"
                  tabIndex={0}
                />
                <button
                  type="button"
                  className="gst-notice-date-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    openDueDatePicker()
                  }}
                  aria-label="Open Reply Due Date picker"
                  tabIndex={-1}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </button>
              </div>
            </div>
            {errors.dueDate && <span className="form-error">{errors.dueDate}</span>}
          </div>
        </div>

        {/* Section 3: Upload Notice Copy Card */}
        <div id="gst-notice-docs" className="gst-notice-field-group">
          <DocumentCard
            id="notice-copy"
            title="Upload Notice Copy"
            subtitle={`Upload official GST notice copy from the tax department (${UPLOAD_HINT})`}
            isRequired={true}
            isUploaded={Boolean(noticeFile)}
            fileName={noticeFile?.name}
            fileSize={noticeFile ? formatGstFileSize(noticeFile.size) : undefined}
            file={noticeFile || undefined}
            error={errors.noticeFile}
            onUpload={handleNoticeUpload}
            onUploadError={(_id, msg) => {
              onNoticeFileChange(null)
              onNoticeFileError?.(msg)
            }}
            onRemove={() => {
              onNoticeFileChange(null)
              onNoticeFileError?.(undefined)
            }}
            onView={() => handleView()}
          />
        </div>

        {/* Section 4: Remarks (Optional) */}
        <div className="gst-notice-field-group">
          <label className="gst-notice-label" htmlFor="gst-notice-remarks-input">
            Remarks (Optional)
          </label>
          <div className="gst-notice-textarea-wrapper">
            <textarea
              id="gst-notice-remarks-input"
              rows={4}
              maxLength={500}
              placeholder="Remarks (Optional)"
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
