import React from 'react'
import { FieldRow, FileDropzone } from './GSTComplianceFileDropzone'

export interface GSTComplianceNoticeFieldsProps {
  noticeNumber: string
  setNoticeNumber: (val: string) => void
  noticeFile: File | null
  setNoticeFile: (f: File | null) => void
  dueDate: string
  setDueDate: (date: string) => void
  errors: Record<string, string>
  clearErr: (k: string) => void
  setPreviewDoc: (doc: { file: File; title: string }) => void
}

export const GSTComplianceNoticeFields: React.FC<GSTComplianceNoticeFieldsProps> = ({
  noticeNumber,
  setNoticeNumber,
  noticeFile,
  setNoticeFile,
  dueDate,
  setDueDate,
  errors,
  clearErr,
  setPreviewDoc,
}) => {
  return (
    <>
      <FieldRow
        num={7}
        label="Department Notice Number"
        required
        hint="Issued by GST department under section 61, 73, or 74"
        error={errors.noticeNumber}
      >
        <input
          id="compliance-notice-num"
          name="noticeNumber"
          type="text"
          placeholder="Enter notice reference number"
          value={noticeNumber}
          onChange={(e) => {
            setNoticeNumber(
              e.target.value.toUpperCase().replace(/[^A-Z0-9/-]/g, '')
            )
            clearErr('noticeNumber')
          }}
          className={`compliance-text-input ${errors.noticeNumber ? 'has-error' : ''}`}
        />
      </FieldRow>

      <FieldRow
        num={8}
        label="Notice Document"
        required
        hint="Required"
        error={errors.noticeFile}
      >
        <FileDropzone
          label="Upload Notice Document"
          file={noticeFile}
          hasError={!!errors.noticeFile}
          onFileSelect={(f) => {
            setNoticeFile(f)
            clearErr('noticeFile')
          }}
          onFileRemove={() => setNoticeFile(null)}
          onFileView={(f) =>
            setPreviewDoc({ file: f, title: 'Notice Document' })
          }
        />
      </FieldRow>

      <FieldRow
        num={9}
        label="Response Due Date"
        required
        hint="The statutory date indicated on the notice"
        error={errors.dueDate}
      >
        <input
          id="compliance-due-date"
          name="dueDate"
          type="date"
          value={dueDate}
          onChange={(e) => {
            setDueDate(e.target.value)
            clearErr('dueDate')
          }}
          className={`compliance-text-input ${errors.dueDate ? 'has-error' : ''}`}
        />
      </FieldRow>
    </>
  )
}
