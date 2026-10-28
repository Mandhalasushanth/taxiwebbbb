import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { routePaths } from '@core/config'
import { localStore } from '@core/storage'
import { userStorage } from '@core/storage/userStorage'
import { useAppStore } from '@store/index'
import { formatRupees, generateGstReference } from '@modules/gst/utils/gstFormat'
import { gstProfileService } from '@modules/gst/services/gstProfileService'
import { GST_FEES } from '@modules/gst/constants/gstBusiness.constants'
import { INITIAL_DOCUMENTS } from '@modules/gst/utils/gstDocuments.constants'
import { clampRegistrationStep } from '@modules/gst/utils/gstRegistrationGuard'
import { gstUploadedFiles } from '@modules/gst/services/gstUploadedFiles'
import { useServiceDraft, readServiceDraft, hasFormChanged, deleteServiceDraft, DRAFT_NAMESPACES } from '@shared/saveDraft'
import { useReviewEdit } from '@shared/edit'
import type { DocumentItem } from '@modules/gst/types/gstDocuments.types'
import type { GstBusinessFormData } from '@modules/gst/types/gstBusiness.types'
import type { PaymentResult } from '@modules/gst/types/gst.types'


const SERVICE_ID = 'gst-registration'
const SERVICE_TITLE = 'GST Registration'
const TOTAL_STEPS = 3
const STEP_LABELS = ['Business', 'Documents', 'Review']
const STEP_NAMES: Record<number, string> = { 1: 'business', 2: 'documents', 3: 'review', 4: 'status' }
const STATUS_STEP = 4
const REVIEW_STEP = 3

interface RegistrationDraft {
  businessData: GstBusinessFormData
  documents: DocumentItem[]
}

/** Registration step named by the URL (?step=… or the route path), or null */
const registrationStepFromUrl = (stepParam: string | null, pathname: string): number | null => {
  const step = (stepParam || '').toLowerCase()
  if (step === 'documents' || step === '2' || pathname.includes('document')) return 2
  if (step === 'review' || step === '3' || pathname.includes('review')) return 3
  if (step === 'status' || step === '4' || step === 'success') return 4
  if (step === 'business' || step === '1') return 1
  return null
}

/** Empty registration form with clean blank fields */
const buildInitialBusinessData = (): GstBusinessFormData => ({
  legalName: '',
  tradeName: '',
  constitution: '',
  businessPan: '',
  natureOfBusiness: '',
  commencementDate: '',
  registrationReason: '',
  compositionScheme: '',
  placeOfBusiness: '',
  businessAddress: '',
  city: '',
  district: '',
  state: '',
  pinCode: '',
  hsnSacCode: '',
  accountHolderName: '',
  accountNumber: '',
  confirmAccountNumber: '',
  ifscCode: '',
  bankName: '',
  branch: '',
  accountType: '',
  signatoryName: '',
  signatoryPan: '',
  dob: '',
  designation: '',
  signatoryMobile: '',
  signatoryEmail: '',
  aadhaarConsent: false,
})

/**
 * Detects whether a stored draft was created purely from the legacy user-profile autofill,
 * before registration fields were made blank by default.
 */
const isLegacyAutofillDraft = (formData: RegistrationDraft | null | undefined): boolean => {
  if (!formData?.businessData) return false
  const d = formData.businessData
  const hasUserEnteredCoreField = Boolean(
    d.tradeName?.trim() ||
    d.constitution?.trim() ||
    d.businessPan?.trim() ||
    d.natureOfBusiness?.trim() ||
    d.commencementDate?.trim() ||
    d.placeOfBusiness?.trim() ||
    d.district?.trim() ||
    d.hsnSacCode?.trim() ||
    d.accountNumber?.trim() ||
    d.ifscCode?.trim()
  )
  return !hasUserEnteredCoreField
}

const STEP_NAME_FOR = (step: number): string => STEP_NAMES[step] ?? 'status'

export const useGstRegistrationState = () => {
  const navigate = useNavigate()
  const pushToast = useAppStore((state) => state.pushToast)
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()

  const [savedDraft] = useState(() => {
    const draft = readServiceDraft<RegistrationDraft>(SERVICE_ID, DRAFT_NAMESPACES.gst)
    if (!draft?.formData) return null
    if (isLegacyAutofillDraft(draft.formData)) {
      deleteServiceDraft(SERVICE_ID)
      return null
    }
    return draft
  })
  const [initialBusinessData] = useState(() => buildInitialBusinessData())

  const [businessData, setBusinessData] = useState<GstBusinessFormData>(() => ({
    ...initialBusinessData,
    ...savedDraft?.formData?.businessData,
  }))

  const [documents, setDocuments] = useState<DocumentItem[]>(
    () => savedDraft?.formData?.documents || INITIAL_DOCUMENTS
  )

  // Set on application submission or verified payment; the status step requires it
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null)
  const [applicationRef] = useState(() => generateGstReference('GST'))
  const isSubmitted = Boolean(paymentResult)

  /** Route guard: a requested step is only shown when every earlier step is complete */
  const allowedStep = (requested: number, submitted = isSubmitted): number =>
    clampRegistrationStep(requested, { businessData, documents, isSubmitted: submitted, isPaid: submitted })

  const [currentStep, setCurrentStep] = useState<number>(() => {
    const urlStep = registrationStepFromUrl(searchParams.get('step'), location.pathname)
    const draftStep = savedDraft?.currentStep ?? 1
    const requested = urlStep ?? (draftStep >= 1 && draftStep <= TOTAL_STEPS ? draftStep : 1)
    return clampRegistrationStep(requested, { businessData, documents, isSubmitted: false, isPaid: false })
  })

  const hasEnteredData =
    currentStep > 1 ||
    hasFormChanged(businessData, initialBusinessData) ||
    documents.some((doc) => doc.isUploaded)

  const draft = useServiceDraft<RegistrationDraft>({
    storageNamespace: DRAFT_NAMESPACES.gst,
    serviceId: SERVICE_ID,
    serviceTitle: SERVICE_TITLE,
    totalSteps: TOTAL_STEPS,
    currentStep,
    stepLabel: STEP_LABELS[currentStep - 1] || 'Confirmation',
    resumeRoute: routePaths.gst.registration,
    exitRoute: routePaths.gst.root,
    formData: { businessData, documents },
    hasEnteredData,
    isComplete: currentStep > TOTAL_STEPS,
  })

  // Every wizard history entry carries an explicit ?step= (and a blocked deep link is rewritten
  // to the first pending step) so the URL always matches what is shown
  useEffect(() => {
    if (searchParams.get('step') !== STEP_NAME_FOR(currentStep)) {
      setSearchParams({ step: STEP_NAME_FOR(currentStep) }, { replace: true })
    }
    // Only normalises the entry the wizard was opened with
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Follow the step in the URL (browser Back / Forward), applied during render when the URL changes
  const urlKey = `${location.pathname}?${searchParams.get('step') || ''}`
  const [syncedUrlKey, setSyncedUrlKey] = useState(urlKey)
  if (syncedUrlKey !== urlKey) {
    setSyncedUrlKey(urlKey)
    const urlStep = registrationStepFromUrl(searchParams.get('step'), location.pathname) ?? 1
    // After payment the application is submitted: history must not reopen the payment steps
    const target = currentStep === STATUS_STEP ? STATUS_STEP : allowedStep(urlStep)
    setCurrentStep(target)
    if (target !== urlStep) setSearchParams({ step: STEP_NAME_FOR(target) }, { replace: true })
  }

  /**
   * Step changes replace the current history entry (same as the loans flows), so the browser
   * Back button leaves the wizard and opens the save-draft dialog instead of stepping back.
   * The in-page Back button moves between steps.
   */
  const goToStep = (requestedStep: number) => {
    const step = allowedStep(requestedStep)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setCurrentStep(step)
    if (STEP_NAMES[step]) setSearchParams({ step: STEP_NAMES[step] }, { replace: true })
  }

  // Leaving from step 1 asks to save when something was entered (same as the loans flows)
  const handleCancel = () => navigate(routePaths.gst.root)

  const handleBusinessChange = <K extends keyof GstBusinessFormData>(
    field: K,
    value: GstBusinessFormData[K]
  ) => {
    setBusinessData((prev) => ({ ...prev, [field]: value }))
  }

  const recordApplication = (appCode: string) => {
    const applicant = businessData.tradeName || businessData.legalName || businessData.signatoryName || 'GST Applicant'
    userStorage.saveUserApplication({
      id: `app-gst-${Date.now()}`,
      code: appCode,
      title: SERVICE_TITLE,
      meta: `${applicant} · ${businessData.state || 'India'}`,
      statusLabel: 'Submitted',
      statusTone: 'info',
      progress: 25,
      icon: '📄',
      to: routePaths.applicationTrack(appCode),
    })

    try {
      const apps = localStore.get<any[]>('taxedge_gst_applications') || []
      const newApp = {
        id: `gst_${Date.now()}`,
        reference: appCode,
        legalName: applicant,
        businessType: businessData.constitution || 'proprietorship',
        state: businessData.state || 'India',
        pan: businessData.businessPan || '',
        status: 'SUBMITTED',
        timeline: [
          { id: 't1', label: 'Application submitted', occurredAt: new Date().toISOString(), isComplete: true },
          { id: 't2', label: 'ARN generated', occurredAt: new Date().toISOString(), isComplete: true },
          { id: 't3', label: 'Field verification', occurredAt: '', isComplete: false },
          { id: 't4', label: 'GSTIN issued', occurredAt: '', isComplete: false },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      localStore.set('taxedge_gst_applications', [newApp, ...apps])
    } catch {
      // Local storage fallback handled gracefully
    }
  }

  const submitApplication = () => {
    const result: PaymentResult = {
      applicationRef,
      transactionId: applicationRef,
      receiptNumber: `TE/${new Date().getFullYear()}/REG-${applicationRef.slice(-6)}`,
      method: 'Direct Submission',
      dateText: new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date()),
      amount: 0,
      verified: true,
    }
    setPaymentResult(result)
    setCurrentStep(STATUS_STEP)
    setSearchParams({ step: 'status' }, { replace: true })
    pushToast('GST Application submitted successfully!', 'success')
    window.scrollTo({ top: 0, behavior: 'smooth' })

    // Clear the draft and remember the business details for later GST services
    draft.clearDraft()
    gstUploadedFiles.clear()
    gstProfileService.saveFromRegistration(businessData)
    recordApplication(applicationRef)
  }

  const handlePaymentSuccess = (result: PaymentResult) => {
    // Only a server-verified gateway payment may submit the application
    if (!result.verified) {
      pushToast('Payment could not be verified. Your application has not been submitted.', 'error')
      return
    }
    setPaymentResult(result)
    setCurrentStep(STATUS_STEP)
    setSearchParams({ step: 'status' }, { replace: true })
    pushToast(`Payment of ${formatRupees(result.amount ?? GST_FEES.registration)} successful`, 'success')
    window.scrollTo({ top: 0, behavior: 'smooth' })

    // Clear the draft and remember the business details for later GST services
    draft.clearDraft()
    gstUploadedFiles.clear()
    gstProfileService.saveFromRegistration(businessData)
    recordApplication(result.applicationRef || applicationRef)
  }

  // "Edit" from the Review step: shared behaviour (Update & Review / Back return to the review)
  const reviewEdit = useReviewEdit(() => goToStep(REVIEW_STEP))
  // Review section the user chose to edit (business / bank / signatory / documents)
  const [editSection, setEditSection] = useState<string | null>(null)
  const editingSection = reviewEdit.isEditMode ? editSection : null

  const startEditingFromReview = (step: number, section: string | null = null) => {
    setEditSection(section)
    reviewEdit.startEdit(() => goToStep(step))
  }

  const handleDiscardAndExit = () => {
    gstUploadedFiles.clear()
    draft.handleDiscardAndExit()
  }

  return {
    currentStep,
    businessData,
    documents,
    paymentResult,
    applicationRef,
    isDraftModalOpen: draft.isDraftModalOpen,
    openDraftModal: draft.openDraftModal,
    handleSaveAndExit: draft.handleSaveAndExit,
    handleDiscardAndExit,
    handleKeepEditing: draft.handleKeepEditing,
    handleBusinessChange,
    setDocuments,
    goToStep,
    isEditMode: reviewEdit.isEditMode,
    editSection: editingSection,
    startEditingFromReview,
    // While editing from Review, Back and "Update & Review" both return to the Review step
    handleCancel: reviewEdit.backOrReview(handleCancel),
    handleStep1Next: reviewEdit.nextOrReview(() => goToStep(2)),
    handleStep2Back: reviewEdit.backOrReview(() => goToStep(1)),
    handleStep2Next: reviewEdit.nextOrReview(() => goToStep(REVIEW_STEP)),
    handleStep3Back: () => goToStep(2),
    handleStep3Proceed: submitApplication,
    handleStep4Back: () => goToStep(REVIEW_STEP),
    handlePaymentSuccess,
    submitApplication,
    navigate,
  }
}
