import React, { useState } from 'react'
import { GSTFilingStepper } from '@modules/gst/shared/GSTFilingStepper/GSTFilingStepper'
import type { FilingPeriodData } from '../GSTFilingPeriod/GSTFilingPeriod'
import {
  GSTReviewFilingDetailsCard,
  GSTReviewDocumentsCard,
} from './GSTReviewFilingDetails'
import {
  GSTReviewTaxComputationCard,
} from './GSTReviewComputation'
import { GSTRequestChangesModal } from './GSTRequestChangesModal'
import {
  getResolvedReviewDetails,
  getReconciledTaxComputation,
} from '@modules/gst/utils/gstReviewData'
import {
  DEFAULT_DOCUMENT_ITEMS,
  calculateDocumentSummary,
  type UploadedFileInfo,
} from '@modules/gst/utils/gstDocumentsData'
import { StepActionBar } from '@shared/components'
import { GSTStepErrorBanner } from '@modules/gst/shared/GSTStepErrorBanner'
import './GSTFilingReview.css'

export interface GSTFilingReviewProps {
  selectedMonth?: string
  baseFee?: number
  filingData?: Partial<FilingPeriodData>
  uploadedFiles?: Record<string, UploadedFileInfo>
  notApplicableDocs?: Record<string, boolean>
  onBack: () => void
  onRequestChange?: () => void
  onStepClick?: (step: number) => void
  onApprove: () => void
  onSaveDraft?: () => void
  onEditFilingDetails?: () => void
  onEditTaxComputation?: () => void
  onEditDocuments?: () => void
}

export const GSTFilingReview: React.FC<GSTFilingReviewProps> = ({
  selectedMonth,
  filingData,
  uploadedFiles,
  notApplicableDocs,
  onBack,
  onRequestChange,
  onStepClick,
  onApprove,
  onSaveDraft,
  onEditFilingDetails,
  onEditTaxComputation,
  onEditDocuments,
}) => {
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const isNilReturn = filingData?.filingType === 'nil' || filingData?.returnType === 'nil'

  const navigateToEdit = (step: number, customHandler?: () => void) => {
    try {
      if (isNilReturn && step > 1) {
        return
      }
      const action = customHandler ?? (onStepClick ? () => onStepClick(step) : null)
      if (!action) {
        throw new Error(`No navigation target defined for step ${step}`)
      }
      action()
    } catch {
      onBack()
    }
  }

  const handleEditFilingDetails = () => navigateToEdit(1, onEditFilingDetails)
  const handleEditTaxComputation = () => navigateToEdit(1, onEditTaxComputation)
  const handleEditDocuments = () => {
    setSubmitError(null)
    navigateToEdit(2, onEditDocuments)
  }

  const effectiveUploadedFiles = uploadedFiles ?? {}
  const effectiveNotApplicableDocs = notApplicableDocs ?? {}

  const missingDocs = DEFAULT_DOCUMENT_ITEMS.filter(
    (doc) => doc.isRequired && !effectiveUploadedFiles[doc.id] && !effectiveNotApplicableDocs[doc.id]
  )
  const hasMissingDocs = !isNilReturn && (missingDocs.length > 0 || Object.keys(effectiveUploadedFiles).length === 0)

  const displayedError = hasMissingDocs ? submitError : null

  const handleSubmit = () => {
    if (hasMissingDocs) {
      setSubmitError('Please upload all required documents before submitting.')
      return
    }
    setSubmitError(null)
    onApprove()
  }

  const docSummaryResult = calculateDocumentSummary(
    DEFAULT_DOCUMENT_ITEMS,
    effectiveUploadedFiles,
    effectiveNotApplicableDocs
  )

  const details = getResolvedReviewDetails(
    {
      ...filingData,
      selectedMonth: selectedMonth || filingData?.selectedMonth,
    },
    docSummaryResult.totalVerified
  )

  const taxFigures = getReconciledTaxComputation(filingData)

  return (
    <div className="gst-review-page" data-testid="gst-filing-review-page">
      {/* Main Page Header */}
      <header className="gst-review-header">
        <h1 className="gst-review-title">Review and Summary</h1>
        <p className="gst-review-subtitle">
          {isNilReturn
            ? 'Review your Nil return filing details before submission.'
            : hasMissingDocs
            ? 'Please submit all required documents before final submission.'
            : 'Review your filing details, uploaded documents, and computed tax figures before submission.'}
        </p>
      </header>

      {/* Stepper */}
      <div className="gst-review-top-bar">
        <div className="gst-review-stepper-wrap">
          <GSTFilingStepper
            currentStep={3}
            onStepClick={onStepClick}
            isNilReturn={isNilReturn}
          />
        </div>
      </div>

      {/* Review Cards in Stack */}
      <div className="gst-review-main-content">
        {/* Section 1: Filing Details */}
        <GSTReviewFilingDetailsCard
          details={details}
          onEdit={handleEditFilingDetails}
        />

        {/* Section 2: Tax Computation (Omitted for Nil Return) */}
        {!isNilReturn && (
          <GSTReviewTaxComputationCard
            turnover={taxFigures.turnover}
            purchases={taxFigures.purchases}
            outputGst={taxFigures.outputGst}
            eligibleItc={taxFigures.eligibleItc}
            netLiability={taxFigures.netLiability}
            calculationMethod={filingData?.calculationMethod}
            isPending={filingData?.calculationMethod === 'ca_calculate'}
            onEdit={handleEditTaxComputation}
          />
        )}

        {/* Section 3: Documents (Omitted for Nil Return) */}
        {!isNilReturn && (
          <GSTReviewDocumentsCard
            verifiedCount={docSummaryResult.totalVerified || Object.keys(effectiveUploadedFiles).length}
            hasMissingDocs={hasMissingDocs}
            missingCount={missingDocs.length}
            onEdit={handleEditDocuments}
            onSubmitDocuments={handleEditDocuments}
          />
        )}
      </div>

      {/* Red Warning Banner when Submit is clicked without uploading required documents */}
      <GSTStepErrorBanner message={displayedError} />

      {/* Step Navigation Bar */}
      <StepActionBar
        onBack={onBack}
        onNext={handleSubmit}
        onSaveDraft={onSaveDraft}
        nextLabel="Submit"
      />

      {/* Confirmation Modal */}
      <GSTRequestChangesModal
        isOpen={showRequestModal}
        onClose={() => {
          setShowRequestModal(false)
          if (onRequestChange) {
            onRequestChange()
          }
        }}
      />
    </div>
  )
}

export default GSTFilingReview
