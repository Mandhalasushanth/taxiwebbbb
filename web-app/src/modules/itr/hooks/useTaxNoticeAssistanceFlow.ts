import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '@core/config/routePaths'
import { useAuthStore, useAppStore } from '@store/index'
import { userStorage } from '@core/storage/userStorage'
import { useDraftBlocker } from '@shared/hooks'
import type { NoticeFormData } from '../types/taxNoticeAssistance.types'

export const DRAFT_SERVICE_ID = 'tax-notice-assistance'

export const INITIAL_NOTICE_FORM_DATA: NoticeFormData = {
  pan: '',
  assessmentYear: '',
  noticeType: '',
  noticeDate: '',
  noticeReference: '',
  responseDueDate: '',
  explanation: '',
  documentFile: null,
  documentFileName: '',
  documentFileSize: '',
  supportingDocuments: {},
  remarks: '',
  responseConfirmed: false,
}

const NOTICE_STEP_LABELS: Record<number, string> = {
  1: 'Notice Details',
  2: 'Upload Notice',
  3: 'Notice Summary',
  4: 'Supporting Documents',
  5: 'Review Response',
}

const PREVIOUS_STEP_MAP: Record<number, 1 | 2 | 3 | 4> = {
  2: 1,
  3: 2,
  4: 3,
  5: 4,
}

export const getNoticeStepLabel = (stepNum: number): string => {
  try {
    return NOTICE_STEP_LABELS[stepNum] || 'Notice Details'
  } catch {
    return 'Notice Details'
  }
}

export const useTaxNoticeAssistanceFlow = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const pushToast = useAppStore((state) => state.pushToast)

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<NoticeFormData>(INITIAL_NOTICE_FORM_DATA)

  useEffect(() => {
    try {
      const existingDraft = userStorage.getDraft(DRAFT_SERVICE_ID)
      if (existingDraft?.formData) {
        setFormData((prev) => ({
          ...prev,
          ...(existingDraft.formData as Partial<NoticeFormData>),
        }))
        if (existingDraft.currentStep && existingDraft.currentStep <= 5) {
          setStep(existingDraft.currentStep as 1 | 2 | 3 | 4 | 5)
        }
      }
    } catch {
      // No-op
    }
  }, [])

  const handleUpdateFormData = (patch: Partial<NoticeFormData>) => {
    try {
      setFormData((prev) => ({ ...prev, ...patch }))
    } catch {
      // No-op
    }
  }

  const handleSaveDraft = useCallback(() => {
    try {
      userStorage.saveDraft({
        serviceId: DRAFT_SERVICE_ID,
        serviceTitle: 'Tax Notice Assistance',
        currentStep: step,
        totalSteps: 5,
        stepLabel: getNoticeStepLabel(step),
        formData: {
          ...formData,
          documentFile: null,
        },
        savedAt: new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        savedTimestamp: Date.now(),
        resumeRoute: routePaths.itr.taxNoticeAssistance,
      })
    } catch {
      // No-op
    }
  }, [step, formData])

  const isDirty = Boolean(
    step > 1 ||
    formData.pan.trim() !== '' ||
    formData.assessmentYear.trim() !== '' ||
    formData.noticeType.trim() !== '' ||
    formData.noticeReference.trim() !== '' ||
    formData.noticeDate.trim() !== '' ||
    formData.responseDueDate.trim() !== '' ||
    formData.explanation.trim() !== '' ||
    formData.documentFileName !== '' ||
    Object.keys(formData.supportingDocuments || {}).length > 0 ||
    formData.remarks.trim() !== ''
  )

  useEffect(() => {
    if (isDirty && step <= 5) {
      handleSaveDraft()
    }
  }, [step, formData, isDirty, handleSaveDraft])

  const shouldBlock = step <= 5 && isDirty
  const {
    isModalOpen,
    openModal,
    handleSaveAndExit,
    handleDiscardAndExit,
    handleKeepEditing,
  } = useDraftBlocker({
    shouldBlock,
    onSaveDraft: () => {
      handleSaveDraft()
      pushToast('Tax Notice Application saved as draft', 'success')
    },
    onDiscardDraft: () => {
      userStorage.deleteDraft(DRAFT_SERVICE_ID)
      pushToast('Draft discarded', 'info')
      setStep(1)
      setFormData(INITIAL_NOTICE_FORM_DATA)
    },
    defaultExitRoute: routePaths.itr.root,
  })

  const handleSaveDraftAndExit = () => {
    try {
      openModal()
    } catch {
      // No-op
    }
  }

  const handleBack = () => {
    try {
      const previousStep = PREVIOUS_STEP_MAP[step]
      if (previousStep) {
        setStep(previousStep)
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      if (step === 1) {
        if (isDirty) {
          openModal()
        } else {
          navigate(routePaths.itr.root)
        }
        return
      }
      navigate(routePaths.itr.root)
    } catch {
      navigate(routePaths.itr.root)
    }
  }

  const handleFinalApproveAndSubmit = async () => {
    setIsSubmitting(true)
    try {
      const year = new Date().getFullYear()
      const randomDigits = Math.floor(10000 + Math.random() * 90000)
      const applicationCode = `NOT-${year}-${randomDigits}`
      const ackNo = `ITR-${year}-${Math.floor(10000 + Math.random() * 90000)}`
      const submittedDate = new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })

      userStorage.saveUserApplication({
        id: `notice-app-${Date.now()}`,
        code: applicationCode,
        title: `Tax Notice Assistance · ${formData.noticeType ? formData.noticeType.split(' - ')[0] : 'Section 143(1)(a)'}`,
        meta: `${formData.assessmentYear || 'AY 2025-26'} · Ack: ${ackNo}`,
        statusLabel: 'Response Submitted',
        statusTone: 'success',
        progress: 100,
        icon: 'document',
        to: `/applications/track/${applicationCode}`,
      })

      userStorage.deleteDraft(DRAFT_SERVICE_ID)

      setFormData((prev) => ({
        ...prev,
        applicationCode,
        acknowledgementNo: ackNo,
        submittedAt: submittedDate,
        assignedExecutive: 'Meera Iyer, Tax Executive',
      }))

      setIsSubmitting(false)
      setStep(6)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      setIsSubmitting(false)
    }
  }

  return {
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
    isDirty,
  }
}
