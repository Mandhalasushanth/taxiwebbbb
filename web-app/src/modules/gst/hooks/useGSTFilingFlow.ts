import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { routePaths } from '@core/config'
import { localStore } from '@core/storage'
import { userStorage } from '@core/storage/userStorage'
import { formatGstFileSize } from '@modules/gst/utils/gstFile'
import { generateGstReference } from '@modules/gst/utils/gstFormat'
import { getDefaultFilingData, STEP_LABELS, hasUserEnteredFilingData } from '@modules/gst/utils/gstFiling.constants'
import { useServiceDraft, readServiceDraft, deleteServiceDraft, DRAFT_NAMESPACES } from '@shared/saveDraft'
import { useReviewEdit } from '@shared/edit'
import { useGSTReviewEditNavigation } from '@modules/gst/shared/useGSTSectionFocus'
import { gstUploadedFiles } from '@modules/gst/services/gstUploadedFiles'
import type { FilingPeriodData } from '../components/GSTFiling'
import type { PaymentResult } from '@modules/gst/types/gst.types'
import { DEFAULT_DOCUMENT_ITEMS, type UploadedFileInfo } from '@modules/gst/utils/gstDocumentsData'

type FilingStep = 1 | 2 | 3 | 4 | 5

const SERVICE_ID = 'gst-filing'
const SERVICE_TITLE = 'GST Filing'
const TOTAL_STEPS = 3
const REVIEW_STEP = 3
const STATUS_STEP = 4

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
  4: routePaths.gst.fileSuccess,
  5: routePaths.gst.fileReceipt,
}

/** Filing step for each filing route */
const FILING_STEP_BY_PATH: Record<string, FilingStep> = {
  [routePaths.gst.filing]: 1,
  ...Object.fromEntries(Object.entries(FILING_PATH_BY_STEP).map(([step, path]) => [path, Number(step) as FilingStep])),
}

const isFilingRoute = (pathname: string): boolean => pathname in FILING_STEP_BY_PATH

const buildPaymentResult = (applicationRef: string): PaymentResult => ({
  transactionId: applicationRef,
  receiptNumber: `TE/${new Date().getFullYear()}/FIL-${applicationRef.slice(-6)}`,
  method: 'Direct Submission',
  dateText: new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date()),
  applicationRef,
  amount: 0,
  verified: true,
})

const withoutKey = <V>(record: Record<string, V>, key: string): Record<string, V> =>
  Object.fromEntries(Object.entries(record).filter(([id]) => id !== key))

export const useGSTFilingFlow = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [defaultFilingData] = useState(getDefaultFilingData)
  const [savedDraft] = useState(() => {
    const d = readServiceDraft<FilingDraft>(SERVICE_ID, DRAFT_NAMESPACES.gst)
    if (!d) return null
    const hasData =
      (d.currentStep && d.currentStep > 1) ||
      hasUserEnteredFilingData(d.formData?.filingData, getDefaultFilingData()) ||
      (d.formData?.uploadedFiles && Object.keys(d.formData.uploadedFiles).length > 0) ||
      (d.formData?.notApplicableDocs && Object.keys(d.formData.notApplicableDocs).length > 0)
    if (!hasData) {
      deleteServiceDraft(SERVICE_ID)
      return null
    }
    return d
  })
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

  // Restore uploaded files from draft metadata and IndexedDB store
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedFileInfo>>(() => {
    const saved = savedDraft?.formData?.uploadedFiles
    if (!saved || typeof saved !== 'object') return {}

    const restored: Record<string, UploadedFileInfo> = {}
    Object.entries(saved).forEach(([id, info]) => {
      if (info && info.name) {
        const file = gstUploadedFiles.get(`filing_${id}`)
        restored[id] = {
          ...info,
          file: file || info.file,
          fileUrl: file ? URL.createObjectURL(file) : info.fileUrl,
          status: 'selected',
          isLocal: true,
        }
      }
    })
    return restored
  })

  const [notApplicableDocs, setNotApplicableDocs] = useState<Record<string, boolean>>(
    () => savedDraft?.formData?.notApplicableDocs || {}
  )

  // Re-hydrate any files that were loading asynchronously from IndexedDB
  useEffect(() => {
    const saved = savedDraft?.formData?.uploadedFiles
    if (!saved) return
    let isMounted = true

    Object.keys(saved).forEach(async (id) => {
      const file = await gstUploadedFiles.getAsync(`filing_${id}`)
      if (file && isMounted) {
        setUploadedFiles((prev) => {
          const current = prev[id]
          if (current && (!current.file || !current.fileUrl)) {
            return {
              ...prev,
              [id]: {
                ...current,
                file,
                fileUrl: URL.createObjectURL(file),
              },
            }
          }
          return prev
        })
      }
    })

    return () => {
      isMounted = false
    }
  }, [savedDraft])

  // If user navigated into the generic /gst/filing route and has a draft at a later step, redirect to that step
  useEffect(() => {
    if (location.pathname === routePaths.gst.filing && savedDraft?.currentStep && savedDraft.currentStep > 1) {
      const targetStep = Math.min(savedDraft.currentStep, TOTAL_STEPS) as FilingStep
      setCurrentStep(targetStep)
      navigate(FILING_PATH_BY_STEP[targetStep], { replace: true })
    }
  }, [location.pathname, savedDraft, navigate])

  const hasEnteredData = Boolean(
    hasUserEnteredFilingData(filingData, defaultFilingData) ||
    Object.keys(uploadedFiles).length > 0 ||
    Object.keys(notApplicableDocs).length > 0
  )

  const isComplete = currentStep >= STATUS_STEP

  const draft = useServiceDraft<FilingDraft>({
    storageNamespace: DRAFT_NAMESPACES.gst,
    serviceId: SERVICE_ID,
    serviceTitle: SERVICE_TITLE,
    totalSteps: TOTAL_STEPS,
    currentStep,
    stepLabel: STEP_LABELS[currentStep] || 'Return Filing',
    resumeRoute: FILING_PATH_BY_STEP[currentStep as FilingStep] || routePaths.gst.filing,
    reviewRoute: routePaths.gst.fileReview,
    exitRoute: routePaths.gst.root,
    formData: { filingData, uploadedFiles, notApplicableDocs },
    hasEnteredData: !isComplete && hasEnteredData,
    isComplete,
    isFlowRoute: isFilingRoute,
    onDiscard: () => {
      Object.keys(uploadedFiles).forEach((id) => gstUploadedFiles.remove(`filing_${id}`))
      setUploadedFiles({})
      setNotApplicableDocs({})
    },
  })

  // Follow the step named by the route (applied during render when the path changes)
  const [syncedPath, setSyncedPath] = useState(location.pathname)
  if (syncedPath !== location.pathname) {
    setSyncedPath(location.pathname)
    if (location.pathname !== routePaths.gst.filing) {
      const routeStep = FILING_STEP_BY_PATH[location.pathname]
      if (routeStep) setCurrentStep(routeStep)
    }
  }

  // Steps replace the history entry (same as the loans flows): the browser Back button
  // leaves the filing and opens the save-draft dialog instead of stepping back
  const goToStep = (step: FilingStep, skipScroll = false) => {
    setCurrentStep(step)
    navigate(FILING_PATH_BY_STEP[step], { replace: true })
    if (!skipScroll) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleFileUpload = (id: string, file: File) => {
    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
    if (file.size > MAX_FILE_SIZE) return

    gstUploadedFiles.set(`filing_${id}`, file)

    const fileInfo: UploadedFileInfo = {
      name: file.name,
      sizeText: formatGstFileSize(file.size),
      uploadTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fileUrl: URL.createObjectURL(file),
      file,
      status: 'selected',
      isLocal: true,
    }
    setUploadedFiles((prev) => ({ ...prev, [id]: fileInfo }))
    setNotApplicableDocs((prev) => (prev[id] ? withoutKey(prev, id) : prev))
  }

  const handleFileRemove = (id: string) => {
    gstUploadedFiles.remove(`filing_${id}`)
    setUploadedFiles((prev) => withoutKey(prev, id))
  }

  const handleToggleNotApplicable = (id: string) =>
    setNotApplicableDocs((prev) => (prev[id] ? withoutKey(prev, id) : { ...prev, [id]: true }))

  const handleStepClick = (stepId: number) => {
    const isNil = filingData.filingType === 'nil' || filingData.returnType === 'nil'
    if (isNil && stepId === 2) return // Documents step is skipped for Nil Return
    if (stepId >= 1 && stepId <= TOTAL_STEPS) goToStep(stepId as FilingStep)
  }

  // "Edit" from the Review step: shared behaviour (Update & Review / Back return to the review)
  const reviewEdit = useReviewEdit(() => goToStep(REVIEW_STEP))
  const { editSection, startSectionEdit } = useGSTReviewEditNavigation()
  const editingSection = reviewEdit.isEditMode ? editSection : null

  const startEditingFromReview = (step: FilingStep, section: string | null = null) => {
    startSectionEdit(section, () => {
      reviewEdit.startEdit(() => {
        goToStep(step, Boolean(section))
      })
    })
  }

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
    const isNil = data.filingType === 'nil' || data.returnType === 'nil'
    const nextStep: FilingStep = isNil ? REVIEW_STEP : 2
    reviewEdit.nextOrReview(() => goToStep(nextStep))()
  }

  const submitFiling = () => {
    const res = buildPaymentResult(filingRef)
    setPaymentResult(res)

    // Persist all uploaded filing documents in memory & IndexedDB so they remain viewable in Track Application
    Object.entries(uploadedFiles).forEach(([id, up]) => {
      if (up?.file) {
        gstUploadedFiles.set(`filing_${id}`, up.file)
        gstUploadedFiles.set(id, up.file)
        if (up.name) gstUploadedFiles.set(up.name, up.file)
        gstUploadedFiles.set(`${filingRef}_${id}`, up.file)
      }
    })

    const mappedDocs = DEFAULT_DOCUMENT_ITEMS.map((docDef) => {
      const up = uploadedFiles[docDef.id]
      return {
        id: docDef.id,
        name: docDef.title,
        fileName: up?.name || up?.file?.name,
        meta: up ? `${docDef.title} · ${up.name} · ${up.sizeText}` : `${docDef.subtitle} · IMAGE / PDF · 6.55 MB`,
        date: up?.uploadTime || new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date()),
        url: up?.fileUrl,
        file: up?.file,
        status: 'uploaded' as const,
      }
    })

    draft.clearDraft()
    userStorage.saveUserApplication({
      id: `app-gst-filing-${Date.now()}`,
      code: filingRef,
      title: `GST Filing — ${filingData.selectedMonth || 'Return'}`,
      meta: `${filingData.businessName || 'Business'} · ${filingData.filingType === 'nil' ? 'Nil Return' : (filingData.returnType || 'Regular')}`,
      statusLabel: 'Submitted',
      statusTone: 'info',
      progress: 25,
      icon: '📄',
      to: routePaths.gst.detail(filingRef),
      documents: mappedDocs,
      formData: {
        filingData,
        uploadedFiles,
      },
      paymentStatus: 'Awaiting Verification' as any,
    } as any)

    try {
      const returns = localStore.get<any[]>('taxedge_gst_returns') || []
      const newReturn = {
        id: `r_${Date.now()}`,
        gstin: filingData.gstin || '27AAAAA0000A1Z5',
        returnType: (filingData.returnType || 'GSTR-3B') as any,
        period: filingData.selectedMonth || 'Current Period',
        grossTurnover: Number(filingData.turnover) || 0,
        taxPayable: Number(filingData.taxAmount) || 0,
        status: 'FILED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      localStore.set('taxedge_gst_returns', [newReturn, ...returns])
    } catch {
      // Local storage fallback handled gracefully
    }

    goToStep(STATUS_STEP)
  }

  return {
    navigate,
    currentStep,
    isComplete,
    goToStep,
    filingData,
    setFilingData,
    filingRef,
    paymentResult,
    uploadedFiles,
    notApplicableDocs,
    isModalOpen: draft.isDraftModalOpen,
    isReviewPrompt: draft.isReviewPrompt,
    isSaving: draft.isSaving,
    openModal: draft.openDraftModal,
    handleSaveAndExit: draft.handleSaveAndExit,
    handleDiscardAndExit: draft.handleDiscardAndExit,
    handleKeepEditing: draft.handleKeepEditing,
    handleStepClick,
    handleStep1Continue,
    handleStep1Back,
    handleStep2Back,
    handleStep2Next: reviewEdit.nextOrReview(() => goToStep(REVIEW_STEP)),
    handleStep3Approve: submitFiling,
    handleFileUpload,
    handleFileRemove,
    handleToggleNotApplicable,
    isEditMode: reviewEdit.isEditMode,
    editSection: editingSection,
    startEditingFromReview,
    finishEditingToReview,
  }
}
