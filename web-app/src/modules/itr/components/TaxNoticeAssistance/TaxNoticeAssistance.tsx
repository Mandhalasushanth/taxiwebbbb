import React from 'react'
import { routePaths } from '@core/config/routePaths'
import { DraftConfirmModal } from '@shared/components'
import { Check as CheckIcon } from 'lucide-react'
import { NoticeInformation, NoticeDocument } from './NoticeInformation'
import { NoticeSummary } from './NoticeSummary'
import { SupportingDocuments } from './SupportingDocuments'
import { ReviewResponse } from './ReviewResponse'
import { NoticeStatus } from './NoticeStatus'
import { useTaxNoticeAssistanceFlow } from '../../hooks/useTaxNoticeAssistanceFlow'
import './TaxNoticeAssistance.css'

export interface NoticeStepItem {
  id: number
  label: string
}

export const NOTICE_ASSISTANCE_STEPS: NoticeStepItem[] = [
  { id: 1, label: 'Notice Details' },
  { id: 2, label: 'Upload Notice' },
  { id: 3, label: 'Notice Summary' },
  { id: 4, label: 'Supporting Docs' },
  { id: 5, label: 'Review Response' },
]

export interface NoticeStepperProps {
  currentStep: number
  onStepClick?: (stepId: number) => void
}

const getStepTone = (stepId: number, currentStep: number): 'completed' | 'active' | 'inactive' => {
  if (stepId < currentStep) return 'completed'
  if (stepId === currentStep) return 'active'
  return 'inactive'
}

export const NoticeStepper: React.FC<NoticeStepperProps> = ({
  currentStep,
  onStepClick,
}) => {
  const renderStepNode = (stepItem: NoticeStepItem, index: number) => {
    const tone = getStepTone(stepItem.id, currentStep)
    const isCompleted = tone === 'completed'
    const isClickable = Boolean(onStepClick && isCompleted)

    return (
      <React.Fragment key={stepItem.id}>
        <div
          className={`notice-stepper-step ${isClickable ? 'notice-stepper-step--clickable' : ''}`}
          onClick={() => {
            try {
              if (isClickable && onStepClick) {
                onStepClick(stepItem.id)
              }
            } catch {
              // No-op
            }
          }}
          role={isClickable ? 'button' : undefined}
          tabIndex={isClickable ? 0 : undefined}
          aria-label={`Step ${stepItem.id}: ${stepItem.label}`}
          title={isClickable ? `Go back to ${stepItem.label}` : `Step ${stepItem.id}: ${stepItem.label}`}
        >
          <div className={`notice-stepper-circle notice-stepper-circle--${tone}`}>
            {isCompleted ? <CheckIcon size={16} /> : stepItem.id}
          </div>
          <span className={`notice-stepper-label notice-stepper-label--${tone}`}>
            {stepItem.label}
          </span>
        </div>
        {index < NOTICE_ASSISTANCE_STEPS.length - 1 && (
          <div className={`notice-stepper-line ${isCompleted ? 'notice-stepper-line--completed' : ''}`} />
        )}
      </React.Fragment>
    )
  }

  return (
    <div className="notice-stepper-wrap" data-testid="notice-stepper">
      <div className="notice-stepper-track" aria-label="Step progress">
        {NOTICE_ASSISTANCE_STEPS.map(renderStepNode)}
      </div>
    </div>
  )
}

export const TaxNoticeAssistance: React.FC = () => {
  const {
    navigate,
    user,
    step,
    setStep,
    formData,
    isSubmitting,
    isModalOpen,
    handleUpdateFormData,
    handleSaveDraftAndExit,
    handleBack,
    handleFinalApproveAndSubmit,
    handleSaveAndExit,
    handleDiscardAndExit,
    handleKeepEditing,
  } = useTaxNoticeAssistanceFlow()

  const goToStep = (targetStep: 1 | 2 | 3 | 4 | 5) => {
    try {
      setStep(targetStep)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      // No-op
    }
  }

  const stepRenderers: Record<number, () => React.ReactNode> = {
    1: () => (
      <NoticeInformation
        formData={formData}
        onChange={handleUpdateFormData}
        onBack={handleBack}
        onSaveDraftAndExit={handleSaveDraftAndExit}
        onNext={() => goToStep(2)}
      />
    ),
    2: () => (
      <NoticeDocument
        formData={formData}
        onChange={handleUpdateFormData}
        onBack={() => goToStep(1)}
        onSaveDraftAndExit={handleSaveDraftAndExit}
        onNext={() => goToStep(3)}
      />
    ),
    3: () => (
      <NoticeSummary
        formData={formData}
        onBack={() => goToStep(2)}
        onSaveDraftAndExit={handleSaveDraftAndExit}
        onNext={() => goToStep(4)}
      />
    ),
    4: () => (
      <SupportingDocuments
        formData={formData}
        onChange={handleUpdateFormData}
        onBack={() => goToStep(3)}
        onSaveDraftAndExit={handleSaveDraftAndExit}
        onNext={() => goToStep(5)}
      />
    ),
    5: () => (
      <ReviewResponse
        formData={formData}
        userName={user?.fullName || 'Assessee'}
        onEditRequest={() => goToStep(1)}
        onApproveAndSubmit={handleFinalApproveAndSubmit}
        isSubmitting={isSubmitting}
      />
    ),
    6: () => (
      <NoticeStatus
        formData={formData}
        onBackToTaxServices={() => navigate(routePaths.itr.root)}
      />
    ),
  }

  const renderActiveStep = (): React.ReactNode => {
    try {
      const renderFn = stepRenderers[step]
      return renderFn ? renderFn() : null
    } catch {
      return null
    }
  }

  return (
    <div className="tax-notice-page">
      <div className="tax-notice-card">
        {step >= 1 && step <= 5 && (
          <NoticeStepper
            currentStep={step}
            onStepClick={(targetStep) => {
              if (targetStep < step) {
                goToStep(targetStep as 1 | 2 | 3 | 4 | 5)
              }
            }}
          />
        )}
        {renderActiveStep()}
      </div>

      <DraftConfirmModal
        isOpen={isModalOpen}
        serviceTitle="Tax Notice Assistance"
        onSaveAndExit={handleSaveAndExit}
        onDiscardAndExit={handleDiscardAndExit}
        onKeepEditing={handleKeepEditing}
      />
    </div>
  )
}

export default TaxNoticeAssistance
