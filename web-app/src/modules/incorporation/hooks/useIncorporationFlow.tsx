import React, { createContext, useContext, useState, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { routePaths } from '@core/config'
import { useServiceDraft, readServiceDraft, hasFormChanged, DRAFT_NAMESPACES, type ServiceDraft } from '@shared/saveDraft'
import { useReviewEdit, type ReviewEdit } from '@shared/edit'
import {
  INCORPORATION_SERVICE_ID,
  INCORPORATION_SERVICE_TITLE,
  INCORPORATION_WIZARD_ROUTES,
  INCORPORATION_STEP_LABELS,
  isIncorporationWizardRoute,
  isIncorporationFlowRoute,
  incorporationStepFor,
} from '../utils/incorporationDraft.constants'
import type {
  CompanyEntityType,
  CompanyDetailsFormData,
  DirectorDetails,
  RegisteredOfficeFormData,
  CapitalDetailsFormData,
  DocumentsKycFormData,
  LinkedRegistrationItem,
} from '../types/incorporation.types'

export interface IncorporationFormData {
  companyType: CompanyEntityType | null
  companyDetails: Partial<CompanyDetailsFormData>
  registeredOffice: Partial<RegisteredOfficeFormData>
  promoterDetails: Record<string, unknown>
  capitalDetails: Partial<CapitalDetailsFormData>
  documentsKyc: Partial<DocumentsKycFormData>
  linkedRegistrations: LinkedRegistrationItem[]
  promoters?: DirectorDetails[]
  applicationId?: string
  transactionId?: string
  applicationDate?: string
  paymentMethod?: string
  paidAmount?: number
  paymentCompleted?: boolean
}

/** What the draft stores: the application plus the step to resume on */
interface IncorporationDraft {
  applicationData: IncorporationFormData
  stepRoute: string
}

const DEFAULT_INCORPORATION_DATA: IncorporationFormData = {
  companyType: null,
  companyDetails: {},
  registeredOffice: {},
  promoterDetails: {},
  capitalDetails: {},
  documentsKyc: {},
  linkedRegistrations: [],
}

export interface IncorporationContextValue {
  formData: IncorporationFormData
  updateFormData: (fields: Partial<IncorporationFormData>) => void
  /** Clears the application and every stored draft copy */
  resetFlow: () => void
  /** Save / discard / keep-editing dialog state, same as loans and GST */
  draft: ServiceDraft
  /** "Edit" from the review: steps show "Update & Review" and return to the review */
  reviewEdit: ReviewEdit
  /** Continue / Back between steps; returns to the review instead while editing from it */
  goToStep: (route: string) => void
}

const IncorporationContext = createContext<IncorporationContextValue | null>(null)

export const IncorporationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()

  const [formData, setFormData] = useState<IncorporationFormData>(() => {
    const saved = readServiceDraft<IncorporationDraft>(INCORPORATION_SERVICE_ID, DRAFT_NAMESPACES.incorporation)
    return saved?.formData?.applicationData
      ? { ...DEFAULT_INCORPORATION_DATA, ...saved.formData.applicationData }
      : DEFAULT_INCORPORATION_DATA
  })

  const updateFormData = useCallback((fields: Partial<IncorporationFormData>) => {
    setFormData((prev) => ({ ...prev, ...fields }))
  }, [])

  const isWizardStep = isIncorporationWizardRoute(location.pathname)
  const currentStep = incorporationStepFor(location.pathname)

  const draft = useServiceDraft<IncorporationDraft>({
    serviceId: INCORPORATION_SERVICE_ID,
    serviceTitle: INCORPORATION_SERVICE_TITLE,
    totalSteps: INCORPORATION_WIZARD_ROUTES.length,
    currentStep,
    stepLabel: INCORPORATION_STEP_LABELS[currentStep - 1] || INCORPORATION_SERVICE_TITLE,
    resumeRoute: isWizardStep ? location.pathname : routePaths.incorporation.selectType,
    exitRoute: routePaths.dashboard,
    formData: { applicationData: formData, stepRoute: location.pathname },
    hasEnteredData: isWizardStep && hasFormChanged(formData, DEFAULT_INCORPORATION_DATA),
    // Off the wizard (landing, success, tracking) or paid: nothing to save or block
    isComplete: !isWizardStep || Boolean(formData.paymentCompleted),
    isFlowRoute: isIncorporationFlowRoute,
    storageNamespace: DRAFT_NAMESPACES.incorporation,
    onDiscard: () => setFormData(DEFAULT_INCORPORATION_DATA),
  })

  const goToReview = useCallback(() => navigate(routePaths.incorporation.reviewApplication), [navigate])
  const reviewEdit = useReviewEdit(goToReview)
  const { isEditMode, finishEdit } = reviewEdit
  const goToStep = useCallback(
    (route: string) => (isEditMode ? finishEdit() : navigate(route)),
    [isEditMode, finishEdit, navigate],
  )

  const { clearDraft } = draft
  const resetFlow = useCallback(() => {
    setFormData(DEFAULT_INCORPORATION_DATA)
    clearDraft()
  }, [clearDraft])

  return (
    <IncorporationContext.Provider value={{ formData, updateFormData, resetFlow, draft, reviewEdit, goToStep }}>
      {children}
    </IncorporationContext.Provider>
  )
}

export const useIncorporationFlow = () => {
  const context = useContext(IncorporationContext)
  if (!context) {
    throw new Error('useIncorporationFlow must be used within an IncorporationProvider')
  }
  return context
}
