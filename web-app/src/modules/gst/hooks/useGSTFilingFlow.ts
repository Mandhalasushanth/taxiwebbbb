import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { routePaths } from '@core/config'
import { userStorage } from '@core/storage/userStorage'
import { formatGstFileSize } from '@modules/gst/utils/gstFile'
import { generateGstReference } from '@modules/gst/utils/gstFormat'
import { GST_FEES, withPlatformGst } from '@modules/gst/constants/gstBusiness.constants'
import { getDefaultFilingData, STEP_LABELS } from '@modules/gst/utils/gstFiling.constants'
import { useServiceDraft, readServiceDraft, hasFormChanged, DRAFT_NAMESPACES } from '@shared/saveDraft'
import { useReviewEdit } from '@shared/edit'
import type { FilingPeriodData } from '../components/GSTFiling'
import type { PaymentResult } from '@modules/gst/types/gst.types'
import type { UploadedFileInfo } from '@modules/gst/utils/gstDocumentsData'

type FilingStep = 1 | 2 | 3 | 4 | 5 | 6

const SERVICE_ID = 'gst-filing'
const SERVICE_TITLE = 'GST Filing'
const TOTAL_STEPS = 4
const REVIEW_STEP = 3

interface FilingDraft {
  filingData: FilingPeriodData
  uploadedFiles: Record<string, UploadedFileInfo>
  notApplicableDocs: Record<string, boolean>
}

/** Route of each filing step */
const FILING_PATH_BY_STEP: Record<FilingStep, string> = {
  1: routePaths.gst.filePeriod,
  2: routePaths.gst.fileUpload,
  3: routePaths.gst.fileReview,
  4: routePaths.gst.filePayment,
  5: routePaths.gst.fileSuccess,
  6: routePaths.gst.fileReceipt,
}

/** Filing step for each filing route */
const FILING_STEP_BY_PATH: Record<string, FilingStep> = {
  [routePaths.gst.filing]: 1,
  ...Object.fromEntries(Object.entries(FILING_PATH_BY_STEP).map(([step, path]) => [path, Number(step) as FilingStep])),
}

const isFilingRoute = (pathname: string): boolean => pathname in FILING_STEP_BY_PATH

const buildPaymentResult = (applicationRef: string): PaymentResult => ({
  transactionId: `TXN${Date.now()}`,
  receiptNumber: `TE/${new Date().getFullYear()}/R-${Math.floor(1000 + Math.random() * 9000)}`,
  method: 'UPI',
  dateText: new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date()),
  applicationRef,
  amount: withPlatformGst(GST_FEES.filingCombo).total,
  // Placeholder until the payments service verifies a real payment
  verified: false,
})

const withoutKey = <V>(record: Record<string, V>, key: string): Record<string, V> =>
  Object.fromEntries(Object.entries(record).filter(([id]) => id !== key))

export const useGSTFilingFlow = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [savedDraft] = useState(() => readServiceDraft<FilingDraft>(SERVICE_ID, DRAFT_NAMESPACES.gst))
  const [defaultFilingData] = useState(getDefaultFilingData)
  const [filingRef] = useState(() => generateGstReference('GST-FIL'))

  const [currentStep, setCurrentStep] = useState<FilingStep>(() => {
    const routeStep = FILING_STEP_BY_PATH[location.pathname]
    if (routeStep && routeStep > 1) return routeStep
    const draftStep = savedDraft?.currentStep ?? 1
    return (draftStep >= 1 && draftStep <= TOTAL_STEPS ? draftStep : 1) as FilingStep
  })

  const [filingData, setFilingData] = useState<FilingPeriodData>(() => ({
    ...defaultFilingData,
    ...savedDraft?.formData?.filingData,
  }))
  const [paymentResult, setPaymentResult] = useState<PaymentResult>(() => buildPaymentResult(filingRef))
  // Uploaded files cannot be stored, so a restored draft asks for them again (same as loans)
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedFileInfo>>({})
  const [notApplicableDocs, setNotApplicableDocs] = useState<Record<string, boolean>>(
    () => savedDraft?.formData?.notApplicableDocs || {}
  )

  const hasEnteredData =
    currentStep > 1 ||
    hasFormChanged(filingData, defaultFilingData) ||
    Object.keys(uploadedFiles).length > 0 ||
    Object.keys(notApplicableDocs).length > 0

  const draft = useServiceDraft<FilingDraft>({
    storageNamespace: DRAFT_NAMESPACES.gst,
    serviceId: SERVICE_ID,
    serviceTitle: SERVICE_TITLE,
    totalSteps: TOTAL_STEPS,
    currentStep: Math.min(currentStep, TOTAL_STEPS),
    stepLabel: STEP_LABELS[currentStep] || 'Return Filing',
    resumeRoute: routePaths.gst.filing,
    exitRoute: routePaths.gst.root,
    formData: { filingData, uploadedFiles, notApplicableDocs },
    hasEnteredData,
    isComplete: currentStep > TOTAL_STEPS,
    isFlowRoute: isFilingRoute,
  })

  // Follow the step named by the route (applied during render when the path changes)
  const [syncedPath, setSyncedPath] = useState(location.pathname)
  if (syncedPath !== location.pathname) {
    setSyncedPath(location.pathname)
    const routeStep = FILING_STEP_BY_PATH[location.pathname]
    if (routeStep) setCurrentStep(routeStep)
  }

  // Steps replace the history entry (same as the loans flows): the browser Back button
  // leaves the filing and opens the save-draft dialog instead of stepping back
  const goToStep = (step: FilingStep) => {
    setCurrentStep(step)
    navigate(FILING_PATH_BY_STEP[step], { replace: true })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleFileUpload = (id: string, file: File) => {
    const fileInfo: UploadedFileInfo = {
      name: file.name,
      sizeText: formatGstFileSize(file.size),
      uploadTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fileUrl: URL.createObjectURL(file),
      status: 'verified',
    }
    setUploadedFiles((prev) => ({ ...prev, [id]: fileInfo }))
    setNotApplicableDocs((prev) => (prev[id] ? withoutKey(prev, id) : prev))
  }

  const handleFileRemove = (id: string) => setUploadedFiles((prev) => withoutKey(prev, id))

  const handleToggleNotApplicable = (id: string) =>
    setNotApplicableDocs((prev) => (prev[id] ? withoutKey(prev, id) : { ...prev, [id]: true }))

  const handleStepClick = (stepId: number) => {
    if (stepId >= 1 && stepId <= TOTAL_STEPS) goToStep(stepId as FilingStep)
  }

  // "Edit" from the Review step: shared behaviour (Update & Review / Back return to the review)
  const reviewEdit = useReviewEdit(() => goToStep(REVIEW_STEP))

  const startEditingFromReview = (step: FilingStep) => reviewEdit.startEdit(() => goToStep(step))

  const finishEditingToReview = (updatedData?: FilingPeriodData) => {
    if (updatedData) {
      setFilingData(updatedData)
    }
    reviewEdit.finishEdit()
  }

  // While editing from Review, Back returns to the Review step instead of leaving the flow
  const handleStep1Back = reviewEdit.backOrReview(() => navigate(routePaths.gst.root))
  const handleStep2Back = reviewEdit.backOrReview(() => goToStep(1))

  const handleStep1Continue = (data: FilingPeriodData) => {
    setFilingData(data)
    reviewEdit.nextOrReview(() => goToStep(2))()
  }

  const handleStep4Success = (res: PaymentResult) => {
    setPaymentResult(res)
    const finalRef = res.applicationRef || filingRef
    draft.clearDraft()
    userStorage.saveUserApplication({
      id: `app-gst-filing-${Date.now()}`,
      code: finalRef,
      title: `GST Filing — ${filingData.selectedMonth || 'Return'}`,
      meta: `${filingData.businessName || 'Business'} · ${filingData.returnType || 'GSTR-3B'}`,
      statusLabel: 'Submitted',
      statusTone: 'info',
      progress: 25,
      icon: '📄',
      to: routePaths.gst.detail(finalRef),
    })
    goToStep(5)
  }

  return {
    navigate,
    currentStep,
    goToStep,
    filingData,
    setFilingData,
    filingRef,
    paymentResult,
    uploadedFiles,
    notApplicableDocs,
    isModalOpen: draft.isDraftModalOpen,
    openModal: draft.openDraftModal,
    handleSaveAndExit: draft.handleSaveAndExit,
    handleDiscardAndExit: draft.handleDiscardAndExit,
    handleKeepEditing: draft.handleKeepEditing,
    handleStepClick,
    handleStep1Continue,
    handleStep1Back,
    handleStep2Back,
    handleStep2Next: reviewEdit.nextOrReview(() => goToStep(REVIEW_STEP)),
    handleStep3Approve: () => goToStep(4),
    handleStep4Success,
    handleFileUpload,
    handleFileRemove,
    handleToggleNotApplicable,
    isEditMode: reviewEdit.isEditMode,
    startEditingFromReview,
    finishEditingToReview,
  }
}
