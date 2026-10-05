import React, { createContext, useContext, useState, useCallback } from 'react'
import { userStorage } from '@core/storage/userStorage'
import type {
  CompanyEntityType,
  CompanyDetailsFormData,
  DirectorDetails,
  RegisteredOfficeFormData,
  CapitalDetailsFormData,
  DocumentsKycFormData,
  LinkedRegistrationItem,
} from '../types/incorporation.types'

export interface IncorporationFormData {
  companyType: CompanyEntityType | null
  companyDetails: Partial<CompanyDetailsFormData>
  registeredOffice: Partial<RegisteredOfficeFormData>
  promoterDetails: Record<string, unknown>
  capitalDetails: Partial<CapitalDetailsFormData>
  documentsKyc: Partial<DocumentsKycFormData>
  linkedRegistrations: LinkedRegistrationItem[]
  promoters?: DirectorDetails[]
  applicationId?: string
  transactionId?: string
  applicationDate?: string
  paymentMethod?: string
  paidAmount?: number
  paymentCompleted?: boolean
}

const DEFAULT_INCORPORATION_DATA: IncorporationFormData = {
  companyType: null,
  companyDetails: {},
  registeredOffice: {},
  promoterDetails: {},
  capitalDetails: {},
  documentsKyc: {},
  linkedRegistrations: [],
}

export interface IncorporationContextValue {
  formData: IncorporationFormData
  updateFormData: (fields: Partial<IncorporationFormData>) => void
  resetFlow: () => void
}

const IncorporationContext = createContext<IncorporationContextValue | null>(null)

export const IncorporationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [formData, setFormData] = useState<IncorporationFormData>(() => {
    try {
      const draft = userStorage.getDraft('incorporation')
      if (draft && draft.formData && draft.formData.applicationData) {
        return draft.formData.applicationData as IncorporationFormData
      }
    } catch {
      // Fall back safely to initial defaults
    }
    return DEFAULT_INCORPORATION_DATA
  })

  const updateFormData = useCallback((fields: Partial<IncorporationFormData>) => {
    setFormData((prev) => {
      const updated = { ...prev, ...fields }
      try {
        const draft = userStorage.getDraft('incorporation')
        if (draft) {
          userStorage.saveDraft({
            ...draft,
            formData: { ...draft.formData, applicationData: updated },
          })
        }
      } catch {
        // Silently preserve state in memory even if storage fails
      }
      return updated
    })
  }, [])

  const resetFlow = useCallback(() => {
    setFormData(DEFAULT_INCORPORATION_DATA)
    try {
      userStorage.deleteDraft('incorporation')
    } catch {
      // Ignore storage errors on cleanup
    }
  }, [])

  return (
    <IncorporationContext.Provider value={{ formData, updateFormData, resetFlow }}>
      {children}
    </IncorporationContext.Provider>
  )
}

export const useIncorporationFlow = () => {
  const context = useContext(IncorporationContext)
  if (!context) {
    throw new Error('useIncorporationFlow must be used within an IncorporationProvider')
  }
  return context
}
