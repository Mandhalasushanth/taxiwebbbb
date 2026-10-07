import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '@core/config'
import { userStorage } from '@core/storage/userStorage'
import { useServiceDraft, readServiceDraft, useReviewEdit } from '@shared/hooks'
import { ITR_DRAFT_NAMESPACE } from '../utils/itrDraft.constants'
import { revisedItrService } from '../services/revisedItrService'
import type {
  OriginalReturnDetails, RevisionReasonKey, IncomeCorrectionState, DeductionCorrectionState,
  BankCorrectionState, DocumentTypeId, UploadedDocument, RevisedItrValidationErrors,
} from '../types/revisedItr.types'
import {
  formatFileSize, sanitizeAckNumberInput, sanitizeNumericAmount, isNumericKeyAllowed, validateRevisedItrStage,
} from '../validation/revisedItrValidation'

export interface RevisedItrDraftData {
  ackNumber?: string
  selectedAy?: string
  isReturnFound?: boolean
  returnDetails?: OriginalReturnDetails
  selectedReason?: RevisionReasonKey
  otherReasonText?: string
  incomeCorrections?: IncomeCorrectionState
  deductionCorrections?: DeductionCorrectionState
  bankCorrections?: BankCorrectionState
  uploadedDocuments?: Partial<Record<DocumentTypeId, UploadedDocument>>
}

const SERVICE_ID = 'revised-itr'
const TOTAL_STAGES = 5

const STAGE_LABELS: Record<number, string> = {
  1: 'Original Return', 2: 'Reason for Revision', 3: 'Correction Details', 4: 'Supporting Documents', 5: 'Review Revision',
}

const downloadRevisedReceipt = (params: { applicationId: string; ackNumber: string; selectedAy: string; docCount: number }) => {
  try {
    const { applicationId, ackNumber, selectedAy, docCount } = params
    const content = [
      '==================================================',
      '           TAXEDGE REVISED ITR RECEIPT             ',
      '==================================================', '',
      `Application ID   : ${applicationId}`,
      `Original Ack No  : ${ackNumber || '987656789876789'}`,
      `Assessment Year  : ${selectedAy || 'AY 2025-26'}`,
      `Return Form      : Revised ITR (ITR-1)`,
      `Income Sources   : Revised Return Filing`,
      `Tax Regime       : New Tax Regime`,
      `Documents        : ${docCount} of 6 received`,
      `Refund Bank      : HDFC Bank ···· 1234`,
      `Filing Fee Paid  : ₹999 (Inclusive of 18% GST)`,
      `Submitted At     : ${new Date().toLocaleString('en-IN')}`, '',
      '--------------------------------------------------',
      'CURRENT STAGE: Stage 3 of 6 (CA Verification)',
      'Certified CA verifying original filing and revised declaration.',
      'SLA: 4-Hour CA Review with Notice Protection',
      '--------------------------------------------------', '',
      'Thank you for filing with TaxEdge.',
      'Support: support@taxedge.in | 1800-TAX-EDGE',
      '==================================================',
    ].join('\n')

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url; link.download = `TaxEdge_Revised_ITR_${applicationId}.txt`
    document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url)
  } catch {
    // Safe fallback
  }
}

export const useRevisedItr = () => {
  const navigate = useNavigate()
  const [existingDraft] = useState(() => readServiceDraft<RevisedItrDraftData>(SERVICE_ID, ITR_DRAFT_NAMESPACE))

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(() =>
    existingDraft?.currentStep && existingDraft.currentStep >= 1 && existingDraft.currentStep <= 5 ? (existingDraft.currentStep as 1 | 2 | 3 | 4 | 5) : 1
  )
  const [showPayment, setShowPayment] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [applicationId, setApplicationId] = useState('ITR-2026-50983')
  const [ackNumber, setAckNumber] = useState<string>(() => existingDraft?.formData?.ackNumber || '')
  const [selectedAy, setSelectedAy] = useState<string>(() => existingDraft?.formData?.selectedAy || '')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isReturnFound, setIsReturnFound] = useState<boolean>(() => Boolean(existingDraft?.formData?.isReturnFound))
  const [returnDetails, setReturnDetails] = useState<OriginalReturnDetails | null>(() => existingDraft?.formData?.returnDetails || null)
  const [selectedReason, setSelectedReason] = useState<RevisionReasonKey | null>(() => existingDraft?.formData?.selectedReason || null)
  const [otherReasonText, setOtherReasonText] = useState<string>(() => existingDraft?.formData?.otherReasonText || '')
  const [incomeCorrections, setIncomeCorrections] = useState<IncomeCorrectionState>(() => existingDraft?.formData?.incomeCorrections || { salaryIncome: '', otherIncome: '', taxableIncome: '' })
  const [deductionCorrections, setDeductionCorrections] = useState<DeductionCorrectionState>(() => existingDraft?.formData?.deductionCorrections || { section80c: '', section80d: '', homeLoanInterest: '', taxableIncome: '' })
  const [bankCorrections, setBankCorrections] = useState<BankCorrectionState>(() => existingDraft?.formData?.bankCorrections || { accountNumber: '', ifsc: '' })
  const [uploadedDocuments, setUploadedDocuments] = useState<Partial<Record<DocumentTypeId, UploadedDocument>>>(() => existingDraft?.formData?.uploadedDocuments || {})
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<RevisedItrValidationErrors>({})
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      try {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsDropdownOpen(false)
      } catch {
        // Fallback
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isDirty = useMemo(() => {
    return Boolean(
      step > 1 ||
      Boolean(existingDraft) ||
      ackNumber.trim() !== '' ||
      selectedAy.trim() !== '' ||
      isReturnFound ||
      selectedReason !== null ||
      otherReasonText.trim() !== '' ||
      incomeCorrections.salaryIncome !== '' ||
      incomeCorrections.otherIncome !== '' ||
      incomeCorrections.taxableIncome !== '' ||
      deductionCorrections.section80c !== '' ||
      deductionCorrections.section80d !== '' ||
      deductionCorrections.homeLoanInterest !== '' ||
      deductionCorrections.taxableIncome !== '' ||
      bankCorrections.accountNumber !== '' ||
      bankCorrections.ifsc !== '' ||
      Object.keys(uploadedDocuments).length > 0
    )
  }, [
    step,
    existingDraft,
    ackNumber,
    selectedAy,
    isReturnFound,
    selectedReason,
    otherReasonText,
    incomeCorrections,
    deductionCorrections,
    bankCorrections,
    uploadedDocuments,
  ])

  // Same draft behaviour as loans and GST: auto-save, save / discard dialog, browser Back prompt
  const serviceDraft = useServiceDraft<RevisedItrDraftData>({
    serviceId: SERVICE_ID,
    serviceTitle: 'Revised ITR Filing',
    totalSteps: TOTAL_STAGES,
    currentStep: step,
    stepLabel: STAGE_LABELS[step] || 'Revision Details',
    resumeRoute: routePaths.itr.revisedItr,
    exitRoute: routePaths.itr.root,
    formData: {
      ackNumber, selectedAy, isReturnFound, returnDetails: returnDetails || undefined,
      selectedReason: selectedReason || undefined, otherReasonText, incomeCorrections,
      deductionCorrections, bankCorrections, uploadedDocuments,
    },
    hasEnteredData: isDirty,
    isComplete: isSubmitted,
    storageNamespace: ITR_DRAFT_NAMESPACE,
    onDiscard: () => {
      setStep(1)
      setAckNumber('')
      setSelectedAy('')
      setIsReturnFound(false)
      setReturnDetails(null)
    },
  })
  const {
    isDraftModalOpen: isModalOpen,
    openDraftModal: openModal,
    handleSaveAndExit,
    handleDiscardAndExit,
    handleKeepEditing,
    clearDraft,
  } = serviceDraft

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isNumericKeyAllowed(e.key, e.ctrlKey || e.metaKey)) e.preventDefault()
  }, [])

  const handleAckChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setAckNumber(sanitizeAckNumberInput(e.target.value))
    setErrors((prev) => ({ ...prev, ackError: null }))
    setIsReturnFound(false)
  }, [])

  const handleSelectAy = useCallback((ay: string) => {
    setSelectedAy(ay); setIsDropdownOpen(false); setErrors((prev) => ({ ...prev, ayError: null })); setIsReturnFound(false)
  }, [])

  const handleToggleDropdown = useCallback(() => setIsDropdownOpen((prev) => !prev), [])
  const handleCloseDropdown = useCallback(() => setIsDropdownOpen(false), [])

  const handleSelectReason = useCallback((reason: RevisionReasonKey) => {
    setSelectedReason(reason); setErrors((prev) => ({ ...prev, reasonError: null, ...(reason !== 'other' ? { otherReasonError: null } : {}) }))
  }, [])

  const handleOtherReasonChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setOtherReasonText(e.target.value); setErrors((prev) => ({ ...prev, otherReasonError: null }))
  }, [])

  const handleIncomeChange = useCallback((field: keyof IncomeCorrectionState, val: string) => {
    setIncomeCorrections((prev) => ({ ...prev, [field]: sanitizeNumericAmount(val) }))
    if (field === 'salaryIncome') setErrors((prev) => ({ ...prev, salaryIncomeError: null }))
    else if (field === 'taxableIncome') setErrors((prev) => ({ ...prev, taxableIncomeError: null }))
  }, [])

  const handleDeductionChange = useCallback((field: keyof DeductionCorrectionState, val: string) => {
    setDeductionCorrections((prev) => ({ ...prev, [field]: sanitizeNumericAmount(val) }))
    if (field === 'taxableIncome') setErrors((prev) => ({ ...prev, taxableIncomeError: null }))
  }, [])

  const handleBankChange = useCallback((field: keyof BankCorrectionState, val: string) => {
    const cleanVal = field === 'accountNumber' ? val.replace(/\D/g, '').slice(0, 20) : val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11)
    setBankCorrections((prev) => ({ ...prev, [field]: cleanVal }))
    setErrors((prev) => ({ ...prev, ...(field === 'accountNumber' ? { bankAccountError: null } : { ifscError: null }) }))
  }, [])

  const handleFileUpload = useCallback((docId: DocumentTypeId, file: File) => {
    try {
      const newDoc: UploadedDocument = { id: docId, fileName: file.name, fileSize: formatFileSize(file.size), uploadedAt: new Date().toLocaleTimeString(), file }
      setUploadedDocuments((prev) => ({ ...prev, [docId]: newDoc }))
      setErrors((prev) => ({ ...prev, documentsError: null }))
    } catch {
      // Fallback
    }
  }, [])

  const handleFileRemove = useCallback((docId: DocumentTypeId) => {
    setUploadedDocuments((prev) => {
      const copy = { ...prev }; delete copy[docId]; return copy
    })
  }, [])

  // "Edit" from the review (stage 5): the stage shows "Update & Review" and Continue / Back return to the review
  const goToReview = useCallback(() => {
    setStep(TOTAL_STAGES); setShowPayment(false); window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])
  const reviewEdit = useReviewEdit(goToReview)
  const isEditMode = reviewEdit.isEditMode && step < TOTAL_STAGES

  const handleBack = useCallback(() => {
    if (isSubmitted) { navigate(routePaths.itr.root); return }
    if (showPayment) { setShowPayment(false); return }
    if (isEditMode) { reviewEdit.finishEdit(); return }
    if (step > 1) { setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4 | 5); window.scrollTo({ top: 0, behavior: 'smooth' }); return }
    if (isDirty) { openModal(); return }
    navigate(routePaths.itr.root)
  }, [step, isDirty, showPayment, isSubmitted, isEditMode, reviewEdit, openModal, navigate])

  const handlePaymentSuccess = useCallback((result?: { paymentId?: string }) => {
    try {
      setShowPayment(false); setIsSubmitted(true)
      const finalAppId = result?.paymentId ? 'ITR-2026-' + result.paymentId.replace(/[^0-9]/g, '').slice(-5).padStart(5, '50983') : 'ITR-2026-50983'
      setApplicationId(finalAppId); clearDraft()
      userStorage.saveUserApplication({
        id: `app-rev-itr-${Date.now()}`, code: finalAppId, title: 'Revised ITR Filing',
        meta: `${returnDetails?.personalInfo?.fullName || 'Taxpayer'} · ${selectedAy || 'AY 2025-26'}`,
        statusLabel: 'Under Verification', statusTone: 'info', progress: 30, icon: '📄', to: `/applications/track/${finalAppId}`,
      })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      // Fallback
    }
  }, [returnDetails, selectedAy, clearDraft])

  const handleDownloadReceipt = useCallback(() => {
    downloadRevisedReceipt({ applicationId, ackNumber, selectedAy, docCount: Object.keys(uploadedDocuments).length })
  }, [applicationId, ackNumber, selectedAy, uploadedDocuments])

  const goToStep = useCallback((targetStep: 1 | 2 | 3 | 4 | 5) => {
    setStep(targetStep); setShowPayment(false); window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleContinue = useCallback(async () => {
    try {
      const result = validateRevisedItrStage({
        step, ackNumber, selectedAy, selectedReason, otherReasonText,
        incomeCorrections, deductionCorrections, bankCorrections, uploadedDocuments,
      })
      if (!result.isValid) { setErrors(result.errors); return }
      setErrors({})
      if (step === 1 && !isReturnFound) {
        setIsLoading(true)
        try {
          const details = await revisedItrService.findOriginalReturn({ ackNumber, assessmentYear: selectedAy })
          setReturnDetails(details); setIsReturnFound(true)
        } finally {
          setIsLoading(false)
        }
        return
      }
      if (isEditMode) { reviewEdit.finishEdit(); return }
      if (step < 5) {
        setStep((prev) => (prev + 1) as 1 | 2 | 3 | 4 | 5); window.scrollTo({ top: 0, behavior: 'smooth' }); return
      }
      setShowPayment(true)
    } catch {
      setIsLoading(false)
    }
  }, [step, ackNumber, selectedAy, selectedReason, otherReasonText, incomeCorrections, deductionCorrections, bankCorrections, uploadedDocuments, isReturnFound, isEditMode, reviewEdit])

  /** "Edit" on the review summary: opens that stage in edit mode */
  const editStep = useCallback((targetStep: 1 | 2 | 3 | 4 | 5) => {
    reviewEdit.startEdit(() => goToStep(targetStep))
  }, [reviewEdit, goToStep])

  return {
    step, showPayment, setShowPayment, isSubmitted, setIsSubmitted, applicationId, ackNumber, selectedAy,
    isDropdownOpen, isReturnFound, setIsReturnFound, returnDetails, setReturnDetails, selectedReason,
    otherReasonText, incomeCorrections, deductionCorrections, bankCorrections, uploadedDocuments, isLoading,
    setIsLoading, errors, setErrors, dropdownRef, handleKeyDown, handleAckChange, handleSelectAy,
    handleToggleDropdown, handleCloseDropdown, handleSelectReason, handleOtherReasonChange, handleIncomeChange,
    handleDeductionChange, handleBankChange, handleFileUpload, handleFileRemove, handleBack, handleContinue,
    handlePaymentSuccess, handleDownloadReceipt, goToStep, editStep, isEditMode, isModalOpen, openModal, handleSaveAndExit,
    handleDiscardAndExit, handleKeepEditing, isDirty,
  }
}
