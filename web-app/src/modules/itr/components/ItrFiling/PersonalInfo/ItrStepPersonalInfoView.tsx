import React, { useState } from 'react'
import { useAuthStore } from '@store/index'
import {
  getStoredTaxpayerProfile,
  type AssessmentYearOption,
  type ResidentialStatusOption,
  type FilingTypeOption,
  type FilingBankAccount,
  type PreviousItrInfo,
} from '../itrFiling.constants'
import { StepActionBar } from '@shared/components'
import './ItrStepPersonalInfoView.css'
import { ItrStepHeaderStepper } from '../ItrStepHeaderStepper'
import { ItrRefundBankSection } from './ItrRefundBankSection'
import { ItrPreviousItrSection } from './ItrPreviousItrSection'
import {
  ItrTaxpayerProfileCard,
  ItrFilingOptionsCard,
  ItrFilingTypeCard,
} from './ItrPersonalInfoCards'

export interface ItrStepPersonalInfoViewProps {
  onBack: () => void
  onNext: () => void
  onSaveDraft?: () => void
  initialAssessmentYear?: AssessmentYearOption
  onAssessmentYearChange?: (ay: AssessmentYearOption) => void
  initialResidentialStatus?: ResidentialStatusOption
  onResidentialStatusChange?: (status: ResidentialStatusOption) => void
  initialFilingType?: FilingTypeOption
  onFilingTypeChange?: (ft: FilingTypeOption) => void
  initialBankAccounts?: FilingBankAccount[]
  onBankAccountsChange?: (accounts: FilingBankAccount[]) => void
  initialSelectedBankId?: string
  onSelectedBankIdChange?: (id: string) => void
  initialPreviousItr?: PreviousItrInfo
  onPreviousItrChange?: (info: PreviousItrInfo) => void
}

export const ItrStepPersonalInfoView: React.FC<ItrStepPersonalInfoViewProps> = ({
  onBack,
  onNext,
  onSaveDraft,
  initialAssessmentYear,
  onAssessmentYearChange,
  initialResidentialStatus,
  onResidentialStatusChange,
  initialFilingType,
  onFilingTypeChange,
  initialBankAccounts,
  onBankAccountsChange,
  initialSelectedBankId,
  onSelectedBankIdChange,
  initialPreviousItr,
  onPreviousItrChange,
}) => {
  const authUser = useAuthStore((state) => state.user)
  const taxpayerProfile = getStoredTaxpayerProfile(authUser)

  const [assessmentYear, setAssessmentYear] = useState<AssessmentYearOption>(
    initialAssessmentYear || ''
  )
  const [residentialStatus, setResidentialStatus] = useState<ResidentialStatusOption>(
    initialResidentialStatus || ''
  )
  const [filingType, setFilingType] = useState<FilingTypeOption>(
    initialFilingType || ''
  )

  const handleAyChange = (ay: AssessmentYearOption) => {
    setAssessmentYear(ay)
    onAssessmentYearChange?.(ay)
  }

  const handleResidentialChange = (status: ResidentialStatusOption) => {
    setResidentialStatus(status)
    onResidentialStatusChange?.(status)
  }

  const [showErrors, setShowErrors] = useState(false)

  const handleFilingTypeChange = (ft: FilingTypeOption) => {
    setFilingType(ft)
    onFilingTypeChange?.(ft)
  }

  const isFormValid =
    Boolean(assessmentYear) &&
    Boolean(residentialStatus) &&
    Boolean(filingType)

  const handleNext = () => {
    if (!isFormValid) {
      setShowErrors(true)
      const firstInvalid = document.querySelector('.itr-info-card--error, .itr-field-error')
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }
    onNext()
  }

  React.useEffect(() => {
    const handleAttempt = () => {
      if (!isFormValid) {
        setShowErrors(true)
        const firstInvalid = document.querySelector('.itr-info-card--error, .itr-field-error')
        if (firstInvalid) {
          firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }
    }
    window.addEventListener('step-action-bar:submit-attempt', handleAttempt)
    return () => window.removeEventListener('step-action-bar:submit-attempt', handleAttempt)
  }, [isFormValid])

  return (
    <div className="itr-filing-step itr-step-personal-info">
      {/* Header with Step Indicator */}
      <ItrStepHeaderStepper currentStepId={1} />

      {/* 1. Taxpayer Identity Card */}
      <ItrTaxpayerProfileCard taxpayerProfile={taxpayerProfile} />

      {/* 2. Assessment Year & Residential Status */}
      <ItrFilingOptionsCard
        assessmentYear={assessmentYear}
        onAssessmentYearChange={handleAyChange}
        residentialStatus={residentialStatus}
        onResidentialStatusChange={handleResidentialChange}
        ayError={showErrors && !assessmentYear ? 'Please select an Assessment Year to proceed.' : undefined}
        resError={showErrors && !residentialStatus ? 'Please select your residential status.' : undefined}
      />

      {/* 3. Filing Type Card */}
      <ItrFilingTypeCard
        filingType={filingType}
        onFilingTypeChange={handleFilingTypeChange}
        error={showErrors && !filingType ? 'Please select a return filing type.' : undefined}
      />

      {/* 4. Bank Accounts for Refund */}
      <ItrRefundBankSection
        bankAccounts={initialBankAccounts ?? []}
        onBankAccountsChange={onBankAccountsChange ?? (() => {})}
        selectedBankId={initialSelectedBankId ?? ''}
        onSelectedBankIdChange={onSelectedBankIdChange ?? (() => {})}
      />

      {/* 5. Previous Year Return Details */}
      <ItrPreviousItrSection
        previousItr={initialPreviousItr ?? { hasPreviousReturn: false }}
        onPreviousItrChange={onPreviousItrChange ?? (() => {})}
      />

      {/* Floating Action Bar */}
      <StepActionBar
        onBack={onBack}
        onNext={handleNext}
        onSaveDraft={onSaveDraft}
        nextLabel="Continue"
        nextDisabled={!isFormValid}
      />
    </div>
  )
}
