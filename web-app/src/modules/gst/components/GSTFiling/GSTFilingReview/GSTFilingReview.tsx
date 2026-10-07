import React, { useState } from 'react'
import { withPlatformGst } from '@modules/gst/constants/gstBusiness.constants'
import { GSTFilingStepper } from '@modules/gst/shared/GSTFilingStepper/GSTFilingStepper'
import type { FilingPeriodData } from '../GSTFilingPeriod/GSTFilingPeriod'
import {
  GSTReviewFilingDetailsCard,
  GSTReviewDocumentsCard,
} from './GSTReviewFilingDetails'
import {
  GSTReviewTaxComputationCard,
  GSTReviewFilingFeeCard,
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
  onEditFilingFee?: () => void
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
  onEditFilingFee,
  onEditDocuments,
}) => {
  const [showRequestModal, setShowRequestModal] = useState(false)

  const handleEditFilingDetails = () => {
    if (onEditFilingDetails) {
      onEditFilingDetails()
    } else if (onStepClick) {
      onStepClick(1)
    } else {
      onBack()
    }
  }

  const handleEditTaxComputation = () => {
    if (onEditTaxComputation) {
      onEditTaxComputation()
    } else if (onStepClick) {
      onStepClick(1)
    } else {
      onBack()
    }
  }

  const handleEditFilingFee = () => {
    if (onEditFilingFee) {
      onEditFilingFee()
    } else if (onStepClick) {
      onStepClick(1)
    } else {
      onBack()
    }
  }

  const handleEditDocuments = () => {
    if (onEditDocuments) {
      onEditDocuments()
    } else if (onStepClick) {
      onStepClick(2)
    } else {
      onBack()
    }
  }

  const effectiveUploadedFiles = uploadedFiles ?? {}
  const effectiveNotApplicableDocs = notApplicableDocs ?? {}

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

  const effectiveBaseFee =
    filingData?.baseFee && filingData.baseFee > 0 && filingData.baseFee !== 2500
      ? filingData.baseFee
      : 1986
  const { gst: gstAmount, total: totalPayableFee } = withPlatformGst(effectiveBaseFee)
  const taxFigures = getReconciledTaxComputation(filingData)

  return (
    <div className="gst-review-page">
      {/* Main Page Header */}
      <header className="gst-review-header">
        <h1 className="gst-review-title">GST Filing</h1>
        <p className="gst-review-subtitle">Step 3 of 4 • Review &amp; Summary</p>
      </header>

      {/* Stepper */}
      <div className="gst-review-top-bar">
        <div className="gst-review-stepper-wrap">
          <GSTFilingStepper currentStep={3} onStepClick={onStepClick} />
        </div>
      </div>

      {/* 4 Review Cards in Stack */}
      <div className="gst-review-main-content">
        {/* Section 1: Filing Details */}
        <GSTReviewFilingDetailsCard
          details={details}
          onEdit={handleEditFilingDetails}
        />

        {/* Section 2: Tax Computation (Reconciled) */}
        <GSTReviewTaxComputationCard
          turnover={taxFigures.turnover}
          outputGst={taxFigures.outputGst}
          eligibleItc={taxFigures.eligibleItc}
          netLiability={taxFigures.netLiability}
          onEdit={handleEditTaxComputation}
        />

        {/* Section 3: Professional Filing Fee */}
        <GSTReviewFilingFeeCard
          baseFee={effectiveBaseFee}
          gstFee={gstAmount}
          totalFee={totalPayableFee}
          onEdit={handleEditFilingFee}
        />

        {/* Section 4: Documents */}
        <GSTReviewDocumentsCard
          verifiedCount={docSummaryResult.totalVerified || 3}
          onEdit={handleEditDocuments}
        />
      </div>

      {/* Step Navigation Bar */}
      <StepActionBar
        onBack={onBack}
        onNext={onApprove}
        onSaveDraft={onSaveDraft}
        nextLabel="Continue"
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
