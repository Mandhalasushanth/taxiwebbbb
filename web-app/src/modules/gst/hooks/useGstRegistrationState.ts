import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { routePaths } from '@core/config'
import { userStorage } from '@core/storage/userStorage'
import { useAppStore, useAuthStore } from '@store/index'
import { formatRupees, generateGstReference } from '@modules/gst/utils/gstFormat'
import { gstProfileService } from '@modules/gst/services/gstProfileService'
import { GST_FEES } from '@modules/gst/constants/gstBusiness.constants'
import { INITIAL_DOCUMENTS } from '@modules/gst/utils/gstDocuments.constants'
import { clampRegistrationStep } from '@modules/gst/utils/gstRegistrationGuard'
import { gstUploadedFiles } from '@modules/gst/services/gstUploadedFiles'
import { useGstDraft, readGstDraft, hasGstFormChanged } from '@modules/gst/hooks/useGstDraft'
import type { DocumentItem } from '@modules/gst/types/gstDocuments.types'
import type { GstBusinessFormData } from '@modules/gst/types/gstBusiness.types'
import type { PaymentResult } from '@modules/gst/types/gst.types'

type CurrentUser = ReturnType<typeof useAuthStore.getState>['user']

const SERVICE_ID = 'gst-registration'
const SERVICE_TITLE = 'GST Registration'
const TOTAL_STEPS = 4
const STEP_LABELS = ['Business', 'Documents', 'Review', 'Payment']
const STEP_NAMES: Record<number, string> = { 1: 'business', 2: 'documents', 3: 'review', 4: 'payment' }
const STATUS_STEP = 5

/** Router state stored on each wizard history entry (lets the in-page Back reuse browser history) */
interface WizardHistoryState {
  gstPrevStep?: number
}

interface RegistrationDraft {
  businessData: GstBusinessFormData
  documents: DocumentItem[]
}

/** Registration step named by the URL (?step=… or the route path), or null */
const registrationStepFromUrl = (stepParam: string | null, pathname: string): number | null => {
  const step = (stepParam || '').toLowerCase()
  if (step === 'documents' || step === '2' || pathname.includes('document')) return 2
  if (step === 'review' || step === '3' || pathname.includes('review')) return 3
  if (step === 'payment' || step === '4' || pathname.includes('payment')) return 4
  if (step === 'status' || step === '5' || step === 'success') return 5
  if (step === 'business' || step === '1') return 1
  return null
}

/** Empty registration form, prefilled from the signed-in user's profile */
const buildInitialBusinessData = (user: CurrentUser): GstBusinessFormData => ({
  legalName: user?.fullName || '',
  tradeName: '',
  constitution: '',
  businessPan: '',
  natureOfBusiness: '',
  commencementDate: '',
  registrationReason: '',
  compositionScheme: '',
  placeOfBusiness: '',
  businessAddress: [user?.addressLine1, user?.addressLine2].filter(Boolean).join(', '),
  city: user?.city || '',
  district: '',
  state: user?.state || '',
  pinCode: user?.pincode || '',
  hsnSacCode: '',
  accountHolderName: user?.fullName || '',
  accountNumber: '',
  confirmAccountNumber: '',
  ifscCode: '',
  bankName: '',
  branch: '',
  accountType: '',
  signatoryName: user?.fullName || '',
  signatoryPan: user?.pan || '',
  dob: '',
  designation: '',
  signatoryMobile: user?.mobile || '',
  signatoryEmail: user?.email || '',
  aadhaarConsent: false,
})

const STEP_NAME_FOR = (step: number): string => STEP_NAMES[step] ?? 'status'

export const useGstRegistrationState = () => {
  const navigate = useNavigate()
  const pushToast = useAppStore((state) => state.pushToast)
  const user = useAuthStore((state) => state.user)
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()

  const [savedDraft] = useState(() => readGstDraft<RegistrationDraft>(SERVICE_ID))
  const [initialBusinessData] = useState(() => buildInitialBusinessData(user))

  const [businessData, setBusinessData] = useState<GstBusinessFormData>(() => ({
    ...initialBusinessData,
    ...savedDraft?.formData?.businessData,
  }))

  const [documents, setDocuments] = useState<DocumentItem[]>(
    () => savedDraft?.formData?.documents || INITIAL_DOCUMENTS
  )

  // Set only by a payment the payments service verified; the status step requires it
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null)
  const [applicationRef] = useState(() => generateGstReference('GST'))
  const isPaid = Boolean(paymentResult?.verified)

  /** Route guard: a requested step is only shown when every earlier step is complete */
  const allowedStep = (requested: number, paid = isPaid): number =>
    clampRegistrationStep(requested, { businessData, documents, isPaid: paid })

  const [currentStep, setCurrentStep] = useState<number>(() => {
    const urlStep = registrationStepFromUrl(searchParams.get('step'), location.pathname)
    const draftStep = savedDraft?.currentStep ?? 1
    const requested = urlStep ?? (draftStep >= 1 && draftStep <= TOTAL_STEPS ? draftStep : 1)
    return clampRegistrationStep(requested, { businessData, documents, isPaid: false })
  })

  const hasEnteredData =
    currentStep > 1 ||
    hasGstFormChanged(businessData, initialBusinessData) ||
    documents.some((doc) => doc.isUploaded)

  const draft = useGstDraft<RegistrationDraft>({
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
   * Forward moves add a browser history entry, so the browser Back button returns to the previous step.
   * The in-page Back button pops that entry when it is the step we are going to, keeping both in sync.
   */
  const goToStep = (requestedStep: number) => {
    const step = allowedStep(requestedStep)
    const historyState = location.state as WizardHistoryState | null
    const isBackToPreviousEntry = step < currentStep && historyState?.gstPrevStep === step
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (isBackToPreviousEntry) {
      navigate(-1)
      return
    }
    setCurrentStep(step)
    if (!STEP_NAMES[step]) return
    const isForward = step > currentStep
    setSearchParams(
      { step: STEP_NAMES[step] },
      isForward ? { state: { gstPrevStep: currentStep } satisfies WizardHistoryState } : { replace: true },
    )
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
      to: `/applications/track/${appCode}`,
    })
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

  const [editingFromReview, setEditingFromReview] = useState(false)

  const startEditingFromReview = (step: number) => {
    setEditingFromReview(true)
    goToStep(step)
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
    handleCancel,
    handleSaveAndExit: draft.handleSaveAndExit,
    handleDiscardAndExit,
    handleKeepEditing: draft.handleKeepEditing,
    handleBusinessChange,
    setDocuments,
    goToStep,
    isEditMode: editingFromReview,
    startEditingFromReview,
    handleStep1Next: () => {
      if (editingFromReview) {
        setEditingFromReview(false)
        goToStep(3)
      } else {
        goToStep(2)
      }
    },
    handleStep2Back: () => goToStep(1),
    handleStep2Next: () => {
      setEditingFromReview(false)
      goToStep(3)
    },
    handleStep3Back: () => goToStep(2),
    handleStep3Proceed: () => goToStep(4),
    handleStep4Back: () => goToStep(3),
    handlePaymentSuccess,
    navigate,
  }
}
