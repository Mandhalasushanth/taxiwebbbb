import { useState, useEffect, useCallback } from 'react'
import { routePaths } from '@core/config'
import { useAppStore, useAuthStore } from '@store/index'
import { userStorage } from '@core/storage/userStorage'
import { useDraftBlocker } from '@shared/hooks'
import { authStorage } from '@core/auth'
import { EMPTY_PROFILE, EMPTY_BANK, EMPTY_TAX, syncProfileWithAuthUser } from '../utils/tdsRefund.constants'
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

  const [profile, setProfile] = useState<TdsProfile>(() => {
    try {
      const draftProf = draft?.formData?.profile as TdsProfile | undefined
      const u = user || authStorage.getUser()
      const base = { ...EMPTY_PROFILE, ...draftProf }
      return syncProfileWithAuthUser(base, u).profile
    } catch (err) {
      console.error('Failed to initialize TDS refund profile:', err)
      return { ...EMPTY_PROFILE }
    }
  })

  const [bankDetails, setBankDetails] = useState<TdsBankDetails>(() => {
    const draftBank = draft?.formData?.bankDetails as TdsBankDetails | undefined
    const u = user || authStorage.getUser()
    return {
      ...EMPTY_BANK,
      ...draftBank,
      accountHolder: draftBank?.accountHolder || u?.fullName || '',
    }
  })

  // Sync profile if user details become available/updated
  useEffect(() => {
    try {
      const u = user || authStorage.getUser()
      if (!u) return
      const timer = setTimeout(() => {
        setProfile((prev) => {
          const { profile: nextProfile, hasChanges } = syncProfileWithAuthUser(prev, u)
          return hasChanges ? nextProfile : prev
        })
      }, 0)
      return () => clearTimeout(timer)
    } catch (err) {
      console.error('Failed to sync TDS refund profile:', err)
    }
  }, [user])

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

  const isDirty = Boolean(
    currentStep >= 1 &&
      currentStep <= 4 &&
      (currentStep > 1 ||
        Boolean(draft) ||
        taxData.taxRegime !== null ||
        profile.pan.trim() !== '' ||
        profile.dob.trim() !== '' ||
        bankDetails.accountNumber.trim() !== '' ||
        bankDetails.ifsc.trim() !== '' ||
        taxData.salaryIncome !== '' ||
        taxData.otherIncome !== '' ||
        taxData.interestIncome !== '' ||
        (taxData.totalTdsDeducted !== '' && taxData.totalTdsDeducted !== '0') ||
        (taxData.tcsAmount !== '' && taxData.tcsAmount !== '0') ||
        taxData.rentalIncome === 'yes' ||
        taxData.capitalGains === 'yes' ||
        taxData.businessIncome === 'yes' ||
        taxData.homeLoanInterest === 'yes' ||
        taxData.taxDeductions === 'yes' ||
        Object.keys(uploads).length > 0)
  )

  useEffect(() => {
    if (isDirty) {
      saveCurrentDraft()
    }
  }, [currentStep, isDirty, saveCurrentDraft])

  const { isModalOpen, openModal, handleSaveAndExit, handleDiscardAndExit, handleKeepEditing } =
    useDraftBlocker({
      shouldBlock: isDirty,
      onSaveDraft: () => {
        saveCurrentDraft()
        pushToast('Application saved as draft', 'success')
      },
      onDiscardDraft: () => {
        userStorage.deleteDraft('tds-refund')
        pushToast('Draft discarded', 'info')
        setCurrentStep(0)
      },
      defaultExitRoute: routePaths.itr.root,
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
    isDirty,
  }
}
