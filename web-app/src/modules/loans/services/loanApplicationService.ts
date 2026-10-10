import { routePaths } from '@core/config'
import { authStorage } from '@core/auth'
import { localStore } from '@core/storage/localStorage'
import { userStorage } from '@core/storage/userStorage'
import type { LoanApplicationBase } from '@modules/loans/types/loanApplication.types'

const STORAGE_PREFIX = 'taxedge_loan_app_'

/**
 * Storage keys are scoped to the signed-in user so that drafts and submitted
 * applications never leak between accounts sharing a browser.
 */
export const loanStorageKey = (suffix: string): string => {
  const userId = authStorage.getUser()?.id || 'guest'
  return `${STORAGE_PREFIX}${userId}_${suffix}`
}

export const loanApplicationService = {
  getDraft: <T>(loanType: string): T | null => {
    return localStore.get<T>(loanStorageKey(loanType))
  },

  saveDraft: <T>(loanType: string, data: T): void => {
    localStore.set(loanStorageKey(loanType), data)
  },

  clearDraft: (loanType: string): void => {
    localStore.remove(loanStorageKey(loanType))
  },

  getApplication: (refNumber: string): LoanApplicationBase | null => {
    try {
      const getLatest = () => {
        return localStore.get<LoanApplicationBase>(loanStorageKey('latest'))
      }

      const getByRef = () => {
        const data = localStore.get<LoanApplicationBase>(loanStorageKey(`record_${refNumber}`))
        const latest = getLatest()
        const isLatestMatch = latest && (latest.refNumber === refNumber || latest.id === refNumber)
        return data || (isLatestMatch ? latest : null)
      }

      return !refNumber ? getLatest() : getByRef()
    } catch {
      // Stored record is missing or corrupt
      return null
    }
  },

  saveApplication: (app: LoanApplicationBase): void => {
    try {
      localStore.set(loanStorageKey(`record_${app.refNumber}`), app)
      localStore.set(loanStorageKey('latest'), app)
    } catch {
      // Storage full or unavailable; the in-memory application is still returned
    }
  },

  submitApplication: async <T>(
    loanType: string,
    formData: T,
  ): Promise<LoanApplicationBase> => {
    const refNumber = 'TXE-LN-' + Math.floor(100000 + Math.random() * 900000)
    const now = new Date()
    const formattedDate = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    const formattedTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })

    const rawForm = (formData || {}) as Record<string, unknown>
    const innerDetails = (rawForm.details as Record<string, unknown>) || rawForm

    const loanAmountNum =
      Number(
        String(
          rawForm.requestedAmount ||
          rawForm.loanAmount ||
          innerDetails.loanAmount ||
          innerDetails.requiredLoanAmount ||
          innerDetails.requiredAmount ||
          innerDetails.requiredCreditLimit ||
          ''
        ).replace(/\D/g, '')
      ) || 0

    const tenureYearsNum =
      Number(innerDetails.repaymentTenureYears) ||
      Number(rawForm.repaymentTenureYears) ||
      Number(innerDetails.tenureYears) ||
      (rawForm.tenureMonths ? Math.round(Number(rawForm.tenureMonths) / 12) : 0) ||
      (innerDetails.repaymentTenure ? (String(innerDetails.repaymentTenure).match(/\d+/) ? Number(String(innerDetails.repaymentTenure).match(/\d+/)![0]) : 0) : 0)

    const tenureMonthsNum =
      Number(rawForm.tenureMonths) ||
      (tenureYearsNum > 0 ? tenureYearsNum * 12 : 0) ||
      Number(innerDetails.preferredTenureMonths) ||
      (String(innerDetails.repaymentTenure || '').match(/\d+/) ? Number(String(innerDetails.repaymentTenure).match(/\d+/)![0]) : 0)

    const formattedTenure =
      tenureYearsNum > 0
        ? `${tenureYearsNum} Years (${tenureMonthsNum > 0 ? tenureMonthsNum : tenureYearsNum * 12} Mos)`
        : tenureMonthsNum > 0
        ? `${tenureMonthsNum} Months`
        : '—'

    const equipmentVal = String(
      innerDetails.customPropertyIntent ||
      innerDetails.propertyIntent ||
      innerDetails.vehicleMakeModel ||
      innerDetails.vehicleModel ||
      innerDetails.vehicleCategory ||
      innerDetails.machineryName ||
      innerDetails.machineryType ||
      innerDetails.creditPurpose ||
      innerDetails.preferredFacilityType ||
      innerDetails.projectName ||
      innerDetails.projectSector ||
      innerDetails.msmePurpose ||
      innerDetails.purposeOfLoan ||
      innerDetails.loanPurpose ||
      rawForm.title ||
      '—'
    )

    const bankName = String(
      innerDetails.bankName ||
      innerDetails.operatingBank ||
      innerDetails.primaryOperatingBankName ||
      innerDetails.currentAccountBankName ||
      innerDetails.primaryBankName ||
      rawForm.disbursementBank ||
      '—'
    )
    const accNumber = String(innerDetails.accountNumber || '')
    const disbursementBankVal =
      accNumber && accNumber.length >= 4
        ? `${bankName} (••• ${accNumber.slice(-4)})`
        : bankName

    const application: LoanApplicationBase = {
      id: refNumber,
      refNumber,
      referenceNumber: refNumber,
      loanType,
      loanCategory: (rawForm.category as string) || 'Capital & Financing',
      loanAmount: loanAmountNum,
      tenureYears: tenureYearsNum,
      tenureMonths: formattedTenure,
      equipment: equipmentVal,
      disbursementBank: disbursementBankVal,
      loanAgent: 'TaxEdge Loan Agent',
      status: 'submitted',
      statusLabel: 'Documents Received',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      applicationData: { ...innerDetails, ...rawForm },
      milestones: [
        {
          id: 'm1',
          title: 'Application Submitted',
          timestamp: `${formattedDate}  ${formattedTime}`,
          status: 'completed',
        },
        {
          id: 'm2',
          title: 'Agent Review',
          timestamp: 'Documents Received',
          status: 'current',
        },
        {
          id: 'm3',
          title: 'Lender Review',
          timestamp: 'Pending',
          status: 'pending',
        },
        {
          id: 'm4',
          title: 'Sanctioned',
          timestamp: 'Pending',
          status: 'pending',
        },
        {
          id: 'm5',
          title: 'Disbursed',
          timestamp: 'Pending',
          status: 'pending',
        },
      ],
    }

    loanApplicationService.saveApplication(application)
    loanApplicationService.clearDraft(loanType)

    userStorage.saveUserApplication({
      id: refNumber,
      code: refNumber,
      title: loanType === 'business_loan' ? 'Business Loan Application' : 'Home Loan Application',
      meta: `${formattedDate} · ₹${loanAmountNum.toLocaleString('en-IN')}`,
      statusLabel: 'Documents Received',
      statusTone: 'info',
      progress: 20,
      icon: loanType === 'business_loan' ? '💼' : '🏠',
      to: routePaths.loansStatus(refNumber),
    })

    return application
  },
}
