import React, { createContext, useContext, useState, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { routePaths } from '@core/config'
import { useServiceDraft, readServiceDraft, DRAFT_NAMESPACES, type ServiceDraft } from '@shared/saveDraft'
import { useReviewEdit, type ReviewEdit } from '@shared/edit'
import type {
  CompanyEntityType,
  CompanyDetailsFormData,
  DirectorDetails,
  RegisteredOfficeFormData,
  RegisteredOfficeAddressData,
  CapitalDetailsFormData,
  DocumentsKycFormData,
  LinkedRegistrationItem,
} from '../types/incorporation.types'
import {
  INCORPORATION_SERVICE_ID,
  INCORPORATION_SERVICE_TITLE,
  INCORPORATION_FORM_ROUTES,
  INCORPORATION_STEP_LABELS,
  isIncorporationFormRoute,
  isIncorporationInternalFlowRoute,
  incorporationStepFor,
} from '../utils/incorporationDraft.constants'

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

/** Determines whether the user has actually filled in any fields beyond the empty template */
const hasUserEnteredIncorporationData = (
  data: IncorporationFormData,
  currentPath: string
): boolean => {
  // Never block or count as entered data on the initial catalog/landing page
  if (currentPath === routePaths.incorporation.selectType) {
    return false
  }

  // Only consider active form steps
  if (!isIncorporationFormRoute(currentPath)) {
    return false
  }

  const cd = data.companyDetails || {}
  const hasCompanyDetails = Boolean(
    cd.classOfCompany ||
    cd.categoryOfCompany ||
    cd.subCategoryOfCompany ||
    (cd.primaryBusinessActivity && cd.primaryBusinessActivity.trim()) ||
    (cd.secondaryBusinessActivity && cd.secondaryBusinessActivity.trim()) ||
    (cd.firstPreferredName && cd.firstPreferredName.trim()) ||
    (cd.secondPreferredName && cd.secondPreferredName.trim()) ||
    (cd.nicCode && cd.nicCode.trim()) ||
    ((cd as Record<string, unknown>).companyName && String((cd as Record<string, unknown>).companyName).trim())
  )

  const ro = data.registeredOffice || {}
  const ad = (ro.addressData || {}) as Partial<RegisteredOfficeAddressData>
  const hasAddress = Boolean(
    (ad.addressLine1 && ad.addressLine1.trim()) ||
    (ad.city && ad.city.trim()) ||
    (ad.district && ad.district.trim()) ||
    (ad.state && ad.state.trim()) ||
    (ad.pincode && ad.pincode.trim()) ||
    ad.ownershipStatus ||
    (ad.email && ad.email.trim()) ||
    (ad.mobile && ad.mobile.trim()) ||
    (ro.docs && ro.docs.some((d) => d.isUploaded))
  )

  const promoters = data.promoters || []
  const hasPromoters = promoters.some((p) =>
    Boolean((p.fullName && p.fullName.trim()) || (p.pan && p.pan.trim()) || (p.mobile && p.mobile.trim()))
  )

  const cap = data.capitalDetails || {}
  const hasCapital = Boolean(
    (cap.authorisedCapital && cap.authorisedCapital.trim()) ||
    (cap.subscribedCapital && cap.subscribedCapital.trim()) ||
    (cap.totalShares && cap.totalShares.trim()) ||
    (cap.faceValue && cap.faceValue.trim())
  )

  const kyc = data.documentsKyc || {}
  const hasKyc = Boolean(
    (kyc.promoterDocs && kyc.promoterDocs.some((d) => d.isUploaded)) ||
    (kyc.officeDocs && kyc.officeDocs.some((d) => d.isUploaded)) ||
    (kyc.statutoryDocs && kyc.statutoryDocs.some((d) => d.isUploaded))
  )

  const linked = data.linkedRegistrations || []
  const hasLinked = linked.some((l) => l.checked)

  return hasCompanyDetails || hasAddress || hasPromoters || hasCapital || hasKyc || hasLinked
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

  const isFormStep = isIncorporationFormRoute(location.pathname)
  const currentStep = incorporationStepFor(location.pathname)
  const hasEnteredData = isFormStep && hasUserEnteredIncorporationData(formData, location.pathname)

  const draft = useServiceDraft<IncorporationDraft>({
    serviceId: INCORPORATION_SERVICE_ID,
    serviceTitle: INCORPORATION_SERVICE_TITLE,
    totalSteps: INCORPORATION_FORM_ROUTES.length,
    currentStep,
    stepLabel: INCORPORATION_STEP_LABELS[currentStep - 1] || INCORPORATION_SERVICE_TITLE,
    resumeRoute: isFormStep ? location.pathname : routePaths.incorporation.companyDetails,
    exitRoute: routePaths.dashboard,
    formData: { applicationData: formData, stepRoute: location.pathname },
    hasEnteredData,
    // Off the wizard form steps (catalog landing, success, tracking) or paid: nothing to save or block
    isComplete: !isFormStep || Boolean(formData.paymentCompleted),
    isFlowRoute: isIncorporationInternalFlowRoute,
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
