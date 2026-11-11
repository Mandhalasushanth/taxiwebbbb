import React from 'react'
import { SaveDraftButton } from '@shared/saveDraft'
import { UpdateAndReviewButton, getIsReviewEditMode } from '@shared/edit'

export interface GSTAmendmentActionBarProps {
  onBack: () => void
  onSaveDraft?: () => void
  isSubmitting?: boolean
  isEditMode?: boolean
}

export const GSTAmendmentActionBar: React.FC<GSTAmendmentActionBarProps> = ({
  onBack,
  onSaveDraft,
  isSubmitting = false,
  isEditMode = false,
}) => {
  const activeEditMode = Boolean(isEditMode || getIsReviewEditMode())
  return (
    <div className="gst-amend-detail-actions-row">
      {!activeEditMode && (
        <button type="button" onClick={onBack} className="gst-amend-back-pill-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>
      )}
      <div className="form-actions-group">
        {onSaveDraft && (
          <SaveDraftButton onClick={onSaveDraft} />
        )}
        {activeEditMode ? (
          <UpdateAndReviewButton type="submit" isSubmitting={isSubmitting} />
        ) : (
          <button type="submit" disabled={isSubmitting} className="gst-amend-submit-orange-btn">
            {isSubmitting ? 'Submitting...' : 'Continue'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
