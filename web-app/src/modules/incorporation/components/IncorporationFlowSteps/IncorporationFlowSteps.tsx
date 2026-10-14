import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { ServiceDraftModal } from '@shared/saveDraft'
import { FlowStepper, type FlowStepItem } from '@shared/components'
import { routePaths } from '@core/config'
import { IncorporationProvider, useIncorporationFlow } from '../../hooks'
import {
  INCORPORATION_SERVICE_TITLE,
  INCORPORATION_FORM_ROUTES,
  incorporationStepFor,
  isIncorporationFormRoute,
} from '../../utils/incorporationDraft.constants'
import './IncorporationFlowSteps.css'

export const INCORPORATION_FLOW_STEPS: FlowStepItem[] = [
  { stepNumber: 1, title: 'Company Details', shortLabel: 'Company Details' },
  { stepNumber: 2, title: 'Registered Office', shortLabel: 'Registered Office' },
  { stepNumber: 3, title: 'Promoter Details', shortLabel: 'Promoter Details' },
  { stepNumber: 4, title: 'Capital Details', shortLabel: 'Capital Details' },
  { stepNumber: 5, title: 'Documents & KYC', shortLabel: 'Documents & KYC' },
  { stepNumber: 6, title: 'Review Application', shortLabel: 'Review Application' },
  { stepNumber: 7, title: 'Submission Success', shortLabel: 'Submission Success' },
]

const STEP_HEADERS: Record<string, { title: string; subtitle?: string }> = {
  [routePaths.incorporation.companyDetails]: {
    title: 'Company Details',
    subtitle: 'Define MCA statutory classification, your proposed company name and business activity.',
  },
  [routePaths.incorporation.registeredOffice]: {
    title: 'Registered Office Details',
    subtitle: 'Enter official communication address and premises documentation details.',
  },
  [routePaths.incorporation.promoterDetails]: {
    title: 'Promoter / Director Details',
    subtitle: 'Enter essential details of all promoters/directors for CA processing.',
  },
  [routePaths.incorporation.capitalDetails]: {
    title: 'Shareholding & Capital',
    subtitle: 'Define authorized capital, face value, and view derived subscribed capital.',
  },
  [routePaths.incorporation.documentsKyc]: {
    title: 'Documents & KYC Checklist',
    subtitle: 'Upload digital copies of promoter identity, office proofs, and statutory e-MoA/e-AoA drafts.',
  },
  [routePaths.incorporation.reviewApplication]: {
    title: 'Review Application',
  },
}

/** Renders the step page header above the global shared FlowStepper */
const IncorporationFlowStepperHeader: React.FC = () => {
  const location = useLocation()
  const { goToStep } = useIncorporationFlow()
  const isFormStep = isIncorporationFormRoute(location.pathname)

  if (!isFormStep) return null

  const isSuccess = location.pathname === routePaths.incorporation.submissionSuccess
  const currentStep = incorporationStepFor(location.pathname)
  const headerInfo = STEP_HEADERS[location.pathname]

  const handleStepClick = (stepNumber: number) => {
    if (isSuccess) return
    if (stepNumber < currentStep) {
      const targetRoute = INCORPORATION_FORM_ROUTES[stepNumber - 1]
      if (targetRoute) {
        goToStep(targetRoute)
      }
    }
  }

  return (
    <div className="incorporation-wizard-top">
      {headerInfo && !isSuccess && (
        <div className="incorporation-wizard-page-header">
          <h1 className="incorporation-wizard-page-title">{headerInfo.title}</h1>
          {headerInfo.subtitle && (
            <p className="incorporation-wizard-page-subtitle">{headerInfo.subtitle}</p>
          )}
        </div>
      )}
      <div className="incorporation-wizard-stepper-wrap">
        <FlowStepper
          steps={INCORPORATION_FLOW_STEPS}
          currentStep={currentStep}
          onStepClick={handleStepClick}
        />
      </div>
    </div>
  )
}

/** Save / discard / keep-editing dialog for the wizard (opened by "Save Draft & Exit" or by leaving) */
const IncorporationDraftModal: React.FC = () => {
  const { draft } = useIncorporationFlow()
  const location = useLocation()
  if (location.pathname === routePaths.incorporation.submissionSuccess) {
    return null
  }
  return (
    <ServiceDraftModal draft={draft} serviceTitle={INCORPORATION_SERVICE_TITLE} />
  )
}

export const IncorporationFlowSteps: React.FC = () => (
  <IncorporationProvider>
    <IncorporationFlowStepperHeader />
    <Outlet />
    <IncorporationDraftModal />
  </IncorporationProvider>
)

export const IncorporationWizardLayout = IncorporationFlowSteps

export default IncorporationFlowSteps
