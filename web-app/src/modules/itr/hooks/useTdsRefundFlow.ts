import { useState, useEffect, useCallback } from 'react'
import { routePaths } from '@core/config'
import { useAppStore, useAuthStore } from '@store/index'
import { userStorage } from '@core/storage/userStorage'
import { useDraftBlocker } from '@shared/hooks'
import { EMPTY_PROFILE, EMPTY_BANK, EMPTY_TAX } from '../utils/tdsRefund.constants'
import type { TdsProfile, TdsBankDetails, TdsIncomeTaxData, UploadedFileMeta } from '../types/tdsRefund.types'

const STEP_LABELS: Record<number, string> = {
  1: 'Customer & Income',
  2: 'Upload Documents',
  3: 'Review',
  4: 'Payment',
}

export const useTdsRefundFlow = () => {
  const pushToast = useAppStore((s) => s.pushToast)
  const user = useAuthStore((s) => s.user)

  const [draft] = useState(() => {
    try {
      return userStorage.getDraft('tds-refund')
    } catch {
      return undefined
    }
  })

  const [tdsRef] = useState(
    () => `TDS-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`
  )

  const [currentStep, setCurrentStep] = useState<number>(() =>
    draft && draft.currentStep >= 1 && draft.currentStep <= 4 ? draft.currentStep : 0
  )

  const [profile, setProfile] = useState<TdsProfile>(
    () => (draft?.formData?.profile as TdsProfile) || { ...EMPTY_PROFILE }
  )
  const [bankDetails, setBankDetails] = useState<TdsBankDetails>(
    () => (draft?.formData?.bankDetails as TdsBankDetails) || { ...EMPTY_BANK }
  )
  const [taxData, setTaxData] = useState<TdsIncomeTaxData>(
    () => (draft?.formData?.taxData as TdsIncomeTaxData) || { ...EMPTY_TAX }
  )
  const [uploads, setUploads] = useState<Record<string, UploadedFileMeta>>(
    () => (draft?.formData?.uploads as Record<string, UploadedFileMeta>) || {}
  )

  const saveCurrentDraft = useCallback(() => {
    try {
      const timeStr = new Date().toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
      const stepLabel = STEP_LABELS[currentStep] || 'Payment'
      userStorage.saveDraft({
        serviceId: 'tds-refund',
        serviceTitle: 'TDS Refund',
        currentStep,
        totalSteps: 4,
        stepLabel,
        formData: { profile, bankDetails, taxData, uploads },
        savedAt: timeStr,
        savedTimestamp: Date.now(),
        resumeRoute: routePaths.itr.tdsRefund,
      })
    } catch {
      // Fallback
    }
  }, [currentStep, profile, bankDetails, taxData, uploads])

  useEffect(() => {
    if (currentStep > 1 && currentStep <= 4) {
      saveCurrentDraft()
    }
  }, [currentStep, profile, bankDetails, taxData, uploads, saveCurrentDraft])

  const { isModalOpen, openModal, handleSaveAndExit, handleDiscardAndExit, handleKeepEditing } =
    useDraftBlocker({
      shouldBlock: currentStep > 1 && currentStep <= 4,
      onSaveDraft: () => {
        saveCurrentDraft()
        pushToast('Application saved as draft', 'success')
      },
      onDiscardDraft: () => {
        userStorage.deleteDraft('tds-refund')
        pushToast('Draft discarded', 'info')
      },
      defaultExitRoute: routePaths.dashboard,
    })

  const handleFinishSubmission = () => {
    try {
      userStorage.deleteDraft('tds-refund')
      const refundClaim = Number(taxData.totalTdsDeducted || 0) + Number(taxData.tcsAmount || 0)
      userStorage.saveUserApplication({
        id: `app-tds-${Date.now()}`,
        code: tdsRef,
        title: 'TDS Refund',
        meta: `${profile.fullName || profile.name || user?.fullName || 'Taxpayer'} · ${
          refundClaim > 0 ? `₹${refundClaim.toLocaleString('en-IN')}` : 'Refund Claim'
        }`,
        statusLabel: 'Under Review',
        statusTone: 'info',
        progress: 25,
        icon: '💰',
        to: `/applications/track/${tdsRef}`,
      })
      setProfile({ ...EMPTY_PROFILE })
      setBankDetails({ ...EMPTY_BANK })
      setTaxData({ ...EMPTY_TAX })
      setUploads({})
      setCurrentStep(5)
    } catch {
      setCurrentStep(5)
    }
  }

  return {
    user,
    tdsRef,
    currentStep,
    setCurrentStep,
    profile,
    setProfile,
    bankDetails,
    setBankDetails,
    taxData,
    setTaxData,
    uploads,
    setUploads,
    isModalOpen,
    openModal,
    handleSaveAndExit,
    handleDiscardAndExit,
    handleKeepEditing,
    handleFinishSubmission,
  }
}
