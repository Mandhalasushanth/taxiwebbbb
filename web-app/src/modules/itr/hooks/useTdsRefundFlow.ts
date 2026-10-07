import { useState, useEffect } from 'react'
import { routePaths } from '@core/config'
import { useAuthStore } from '@store/index'
import { userStorage } from '@core/storage/userStorage'
import { useServiceDraft, readServiceDraft } from '@shared/hooks'
import { authStorage } from '@core/auth'
import { EMPTY_PROFILE, EMPTY_BANK, EMPTY_TAX, syncProfileWithAuthUser } from '../utils/tdsRefund.constants'
import { ITR_DRAFT_NAMESPACE } from '../utils/itrDraft.constants'
import type { TdsProfile, TdsBankDetails, TdsIncomeTaxData, UploadedFileMeta } from '../types/tdsRefund.types'

const SERVICE_ID = 'tds-refund'
const TOTAL_STEPS = 4
const SUCCESS_STEP = 5

const STEP_LABELS: Record<number, string> = {
  1: 'Customer & Income',
  2: 'Upload Documents',
  3: 'Review',
  4: 'Payment',
}

interface TdsRefundDraft {
  profile: TdsProfile
  bankDetails: TdsBankDetails
  taxData: TdsIncomeTaxData
  uploads: Record<string, UploadedFileMeta>
}

export const useTdsRefundFlow = () => {
  const user = useAuthStore((s) => s.user)

  const [draft] = useState(() => readServiceDraft<TdsRefundDraft>(SERVICE_ID, ITR_DRAFT_NAMESPACE))

  const [tdsRef] = useState(
    () => `TDS-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`
  )

  const [currentStep, setCurrentStep] = useState<number>(() =>
    draft && draft.currentStep >= 1 && draft.currentStep <= TOTAL_STEPS ? draft.currentStep : 0
  )

  const [profile, setProfile] = useState<TdsProfile>(() => {
    try {
      const u = user || authStorage.getUser()
      const base = { ...EMPTY_PROFILE, ...draft?.formData?.profile }
      return syncProfileWithAuthUser(base, u).profile
    } catch {
      return { ...EMPTY_PROFILE }
    }
  })

  const [bankDetails, setBankDetails] = useState<TdsBankDetails>(() => {
    const draftBank = draft?.formData?.bankDetails
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
    } catch {
      // Profile sync is a convenience; the user can still type the details
    }
  }, [user])

  const [taxData, setTaxData] = useState<TdsIncomeTaxData>(
    () => draft?.formData?.taxData || { ...EMPTY_TAX }
  )
  const [uploads, setUploads] = useState<Record<string, UploadedFileMeta>>(
    () => draft?.formData?.uploads || {}
  )

  const isDirty = Boolean(
    currentStep >= 1 &&
      currentStep <= TOTAL_STEPS &&
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

  // Same draft behaviour as loans and GST: auto-save, save / discard dialog, browser Back prompt
  const serviceDraft = useServiceDraft<TdsRefundDraft>({
    serviceId: SERVICE_ID,
    serviceTitle: 'TDS Refund',
    totalSteps: TOTAL_STEPS,
    currentStep: Math.min(Math.max(currentStep, 1), TOTAL_STEPS),
    stepLabel: STEP_LABELS[currentStep] || STEP_LABELS[1],
    resumeRoute: routePaths.itr.tdsRefund,
    exitRoute: routePaths.itr.root,
    formData: { profile, bankDetails, taxData, uploads },
    hasEnteredData: isDirty,
    isComplete: currentStep >= SUCCESS_STEP,
    storageNamespace: ITR_DRAFT_NAMESPACE,
    onDiscard: () => setCurrentStep(0),
  })

  const handleFinishSubmission = () => {
    try {
      serviceDraft.clearDraft()
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
      setCurrentStep(SUCCESS_STEP)
    } catch {
      setCurrentStep(SUCCESS_STEP)
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
    isModalOpen: serviceDraft.isDraftModalOpen,
    openModal: serviceDraft.openDraftModal,
    handleSaveAndExit: serviceDraft.handleSaveAndExit,
    handleDiscardAndExit: serviceDraft.handleDiscardAndExit,
    handleKeepEditing: serviceDraft.handleKeepEditing,
    handleFinishSubmission,
    isDirty,
  }
}
