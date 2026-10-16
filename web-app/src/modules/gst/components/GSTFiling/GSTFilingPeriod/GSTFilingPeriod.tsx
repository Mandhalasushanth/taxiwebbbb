import { GSTStepErrorBanner } from '@modules/gst/shared/GSTStepErrorBanner'
import React, { useState, useMemo, useEffect } from 'react'
import { gstFieldRules, GST_STEP_ERROR } from '@modules/gst/validation/gstFieldRules'
import { gstProfileService } from '@modules/gst/services/gstProfileService'
import { getFilingBaseFee } from '@modules/gst/constants/gstBusiness.constants'
import { Calendar, FileText, Calculator } from 'lucide-react'
import { GSTFormSection } from '@modules/gst/shared/GSTFormSection'
import { GSTFilingStepper } from '@modules/gst/shared/GSTFilingStepper/GSTFilingStepper'
import { GSTCalculationMethod } from './GSTCalculationMethod'
import { GSTFilingFrequency } from './GSTFilingFrequency'
import { GSTFilingTypeSelector } from './GSTFilingTypeSelector'
import { GSTPeriodSelectionFields, GSTTaxpayerReturnFields } from './GSTPeriodFields'
import {
  CURRENT_FINANCIAL_YEAR,
  FINANCIAL_YEAR_OPTIONS,
  getPeriodOptionsByFrequencyAndYear,
  remapPeriodToFinancialYear,
  type SelectOption,
} from '@modules/gst/utils/gstPeriodOptions'
import { StepActionBar } from '@shared/components'
import './GSTFilingPeriod.css'
export interface FilingPeriodData {
  gstin: string
  businessName: string
  financialYear: string
  frequency: string
  selectedMonth: string
  returnType: 'gstr1' | 'gstr3b' | 'nil' | ''
  baseFee: number
  filingType?: 'regular' | 'nil' | ''
  calculationMethod?: 'ca_calculate' | 'estimated_figures' | ''
  estimatedSales?: string
  estimatedPurchases?: string
  estimatedItc?: string
}

interface GSTFilingPeriodProps {
  initialData?: Partial<FilingPeriodData>
  isEditMode?: boolean
  onStepClick?: (step: number) => void
  onContinue: (data: FilingPeriodData) => void
  onCancel: () => void
  onSaveDraft?: () => void
  /** Receives the form on every change so drafts always hold the latest values */
  onDraftChange?: (data: FilingPeriodData) => void
}

export const GSTFilingPeriod: React.FC<GSTFilingPeriodProps> = ({
  initialData,
  isEditMode = false,
  onStepClick,
  onContinue,
  onCancel,
  onSaveDraft,
  onDraftChange,
}) => {
  const profile = useMemo(() => gstProfileService.get(), [])
  const [financialYear, setFinancialYear] = useState(
    initialData?.financialYear || CURRENT_FINANCIAL_YEAR || FINANCIAL_YEAR_OPTIONS[0]?.value || ''
  )
  const [frequency, setFrequency] = useState(initialData?.frequency || 'Monthly')
  const [returnPeriod, setReturnPeriod] = useState(initialData?.selectedMonth || '')
  const [gstin, setGstin] = useState(initialData?.gstin || '')
  const [returnType, setReturnType] = useState<string>(initialData?.returnType || 'gstr1')
  const [filingType, setFilingType] = useState<'regular' | 'nil' | ''>(initialData?.filingType || 'regular')
  const [calculationMethod, setCalculationMethod] = useState<'ca_calculate' | 'estimated_figures' | ''>(
    initialData?.calculationMethod || 'ca_calculate'
  )
  const [estimatedSales, setEstimatedSales] = useState(initialData?.estimatedSales || '')
  const [estimatedPurchases, setEstimatedPurchases] = useState(initialData?.estimatedPurchases || '')
  const [estimatedItc, setEstimatedItc] = useState(initialData?.estimatedItc || '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [stepError, setStepError] = useState<string | null>(null)

  const handleClearError = (field: string) => {
    setStepError(null)
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev }
        delete updated[field]
        return updated
      })
    }
  }

  const periodOptions = useMemo<SelectOption[]>(
    () => getPeriodOptionsByFrequencyAndYear(frequency, financialYear),
    [frequency, financialYear]
  )

  const handleFinancialYearChange = (newYear: string) => {
    setFinancialYear(newYear)
    handleClearError('financialYear')
    if (returnPeriod) {
      const remapped = remapPeriodToFinancialYear(returnPeriod, newYear, frequency)
      setReturnPeriod(remapped)
    }
  }

  const handleFrequencyChange = (newFreq: string) => {
    setFrequency(newFreq)
    handleClearError('frequency')
    if (newFreq === 'Annual') {
      const annualOptions = getPeriodOptionsByFrequencyAndYear('Annual', financialYear)
      setReturnPeriod(annualOptions[0]?.value || '')
    } else {
      setReturnPeriod('')
    }
  }

  // The form as it will be submitted; also reported to the flow for drafts
  const periodData = useMemo<FilingPeriodData>(
    () => ({
      gstin: gstin.toUpperCase().trim(),
      businessName: initialData?.businessName || profile.tradeName || profile.legalName,
      financialYear,
      frequency,
      selectedMonth: returnPeriod,
      returnType: (filingType === 'nil' ? 'nil' : (returnType as FilingPeriodData['returnType'])) || 'gstr1',
      baseFee: getFilingBaseFee(filingType, returnType),
      filingType,
      calculationMethod,
      estimatedSales,
      estimatedPurchases,
      estimatedItc,
    }),
    [gstin, initialData?.businessName, profile, financialYear, frequency, returnPeriod, filingType, returnType, calculationMethod, estimatedSales, estimatedPurchases, estimatedItc]
  )

  useEffect(() => {
    onDraftChange?.(periodData)
  }, [periodData, onDraftChange])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}
    if (!frequency) newErrors.frequency = 'Please select a filing frequency'
    if (!financialYear) newErrors.financialYear = 'Please select a financial year'
    if (!returnPeriod) newErrors.returnPeriod = 'Please select a return period'
    const gstinError = gstFieldRules.gstin(gstin)
    if (gstinError) newErrors.gstin = gstinError
    if (filingType === 'regular') {
      if (!returnType) newErrors.returnType = 'Please select a return type'
      if (!calculationMethod) newErrors.calculationMethod = 'Please select a tax calculation method'
      if (calculationMethod === 'estimated_figures') {
        if (!estimatedSales || !estimatedSales.trim()) {
          newErrors.estimatedSales = 'Please enter estimated taxable sales'
        }
        if (!estimatedPurchases || !estimatedPurchases.trim()) {
          newErrors.estimatedPurchases = 'Please enter estimated taxable purchases'
        }
        if (!estimatedItc || !estimatedItc.trim()) {
          newErrors.estimatedItc = 'Please enter estimated eligible ITC'
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setStepError(GST_STEP_ERROR)
      return
    }

    onContinue(periodData)
  }


  return (
    <div className="gst-filing-period-container">
      {/* Main Page Title and Subtitle */}
      <header className="gst-filing-period__header">
        <h1 className="gst-filing-period__title">Filing Period</h1>
        <p className="gst-filing-period__subtitle">
          Provide the filing details to proceed with your GST return.
        </p>
      </header>

      {/* Step Progress Stepper */}
      <GSTFilingStepper currentStep={1} onStepClick={onStepClick} />

      {/* Main Content Form with Section Cards */}
      <form className="gst-filing-period__form" onSubmit={handleSubmit} noValidate>
        {/* Card 1: Filing Frequency & Period */}
        <GSTFormSection
          id="gst-filing-frequency-period"
          icon={<Calendar />}
          title="Filing Frequency & Period"
          subtitle="Select filing frequency and return period"
          fields={['frequency', 'financialYear', 'returnPeriod']}
          errors={errors}
        >
          <GSTFilingFrequency
            value={frequency}
            onChange={handleFrequencyChange}
            error={errors.frequency}
          />

          <div className="gst-filing-period__row">
            <GSTPeriodSelectionFields
              frequency={frequency}
              financialYear={financialYear}
              setFinancialYear={handleFinancialYearChange}
              returnPeriod={returnPeriod}
              setReturnPeriod={setReturnPeriod}
              periodOptions={periodOptions}
              errors={errors}
              handleClearError={handleClearError}
            />
          </div>
        </GSTFormSection>

        {/* Card 2: Taxpayer & Return Details */}
        <GSTFormSection
          id="gst-taxpayer-details"
          icon={<FileText />}
          title="Taxpayer & Return Details"
          subtitle="Enter 15-character GSTIN & return type"
          fields={['gstin', 'returnType', 'filingType']}
          errors={errors}
        >
          <div className="gst-filing-period__row">
            <GSTTaxpayerReturnFields
              gstin={gstin}
              setGstin={setGstin}
              returnType={returnType}
              setReturnType={setReturnType}
              filingType={filingType}
              errors={errors}
              handleClearError={handleClearError}
            />
          </div>

          <GSTFilingTypeSelector
            value={filingType}
            onChange={(type) => {
              setFilingType(type)
              handleClearError('filingType')
            }}
          />
        </GSTFormSection>

        {/* Card 3: Tax Calculation Method */}
        {filingType === 'regular' && (
          <GSTFormSection
            id="gst-calculation-method"
            icon={<Calculator />}
            title="Tax Calculation Method"
            subtitle="Choose how tax calculations should be handled"
            fields={['calculationMethod', 'estimatedSales', 'estimatedPurchases', 'estimatedItc']}
            errors={errors}
          >
            <GSTCalculationMethod
              value={calculationMethod}
              onChange={(method) => {
                setCalculationMethod(method)
                handleClearError('calculationMethod')
                if (method !== 'estimated_figures') {
                  handleClearError('estimatedSales')
                  handleClearError('estimatedPurchases')
                  handleClearError('estimatedItc')
                }
              }}
              error={errors.calculationMethod}
              errors={errors}
              estimatedSales={estimatedSales}
              onSalesChange={(val) => {
                setEstimatedSales(val)
                handleClearError('estimatedSales')
              }}
              estimatedPurchases={estimatedPurchases}
              onPurchasesChange={(val) => {
                setEstimatedPurchases(val)
                handleClearError('estimatedPurchases')
              }}
              estimatedItc={estimatedItc}
              onItcChange={(val) => {
                setEstimatedItc(val)
                handleClearError('estimatedItc')
              }}
            />
          </GSTFormSection>
        )}

        <GSTStepErrorBanner message={stepError} />

        {/* Action Navigation Footer */}
        <StepActionBar
          onBack={onCancel}
          onSaveDraft={onSaveDraft}
          nextType="submit"
          isEditMode={isEditMode}
        />
      </form>
    </div>
  )
}

export default GSTFilingPeriod
