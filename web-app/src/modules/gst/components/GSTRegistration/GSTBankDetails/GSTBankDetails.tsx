import { Wallet } from 'lucide-react'
import { gstInput } from '@modules/gst/utils/gstInputFormatters'
import { BANK_ACCOUNT_TYPE_OPTIONS } from '@modules/gst/utils/gstBusinessDetails.constants'
import { ALL_BANKS } from '@modules/gst/types/gstPayment.types'
import { GSTFormSection } from '@modules/gst/shared/GSTFormSection'
import { GSTFieldShell, GSTSelectField, GSTTextField, fieldInputClass } from '@modules/gst/shared/GSTFormFields'
import type { GstBusinessFormData } from '../GSTStepBusiness/GSTStepBusiness'
import { lookupSampleBankByIfsc, fetchBankDetailsByIfsc } from '@shared/services'
import { ConfirmAccountNumberInput } from '@shared/components'

type BankField =
  | 'accountHolderName'
  | 'accountNumber'
  | 'confirmAccountNumber'
  | 'ifscCode'
  | 'bankName'
  | 'branch'
  | 'accountType'

export interface GSTBankDetailsProps {
  data: Pick<GstBusinessFormData, BankField>
  onChange: <K extends keyof GstBusinessFormData>(field: K, value: GstBusinessFormData[K]) => void
  errors?: Record<string, string>
  onClearError?: (field: string) => void
}

const BANK_FIELDS: readonly BankField[] = [
  'accountHolderName',
  'accountNumber',
  'confirmAccountNumber',
  'ifscCode',
  'bankName',
  'branch',
  'accountType',
]

const IFSC_LENGTH = 11
const IFSC_LOOKUP_MIN_LENGTH = 4

/** Bank list for the dropdown, keeping an IFSC-fetched bank that is not in the list */
const bankOptions = (current: string): readonly string[] =>
  current && !ALL_BANKS.includes(current) ? [...ALL_BANKS, current] : ALL_BANKS

export const GSTBankDetails = ({
  data,
  onChange,
  errors = {},
  onClearError,
}: GSTBankDetailsProps) => {
  const update = <K extends BankField>(field: K, value: GstBusinessFormData[K]) => {
    onChange(field, value)
    onClearError?.(field)
  }

  const applyBankMatch = (match: { bankName: string; branch: string } | null | undefined) => {
    if (!match) return
    update('bankName', match.bankName)
    update('branch', match.branch)
  }

  const handleIfscChange = (value: string) => {
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, IFSC_LENGTH)
    update('ifscCode', cleaned)
    if (cleaned.length >= IFSC_LOOKUP_MIN_LENGTH) applyBankMatch(lookupSampleBankByIfsc(cleaned))
  }

  const handleIfscBlur = async () => {
    const cleaned = data.ifscCode?.trim().toUpperCase()
    if (!cleaned || cleaned.length < IFSC_LOOKUP_MIN_LENGTH) return
    try {
      applyBankMatch(await fetchBankDetailsByIfsc(cleaned))
    } catch {
      // Lookup is a convenience; the user can still pick the bank and type the branch
    }
  }

  return (
    <GSTFormSection
      id="gst-bank-details"
      icon={<Wallet />}
      title="Bank Details"
      subtitle="Account for refunds & credits"
      fields={BANK_FIELDS}
      errors={errors}
      collapsible
    >
      <GSTTextField
        id="accountHolderName"
        label="Account Holder Name"
        placeholder="As per bank records"
        value={data.accountHolderName}
        error={errors.accountHolderName}
        onValueChange={(v) => update('accountHolderName', gstInput.letters(v))}
      />

      <div className="gst-form-row gst-form-row--split">
        <GSTTextField
          id="accountNumber"
          label="Bank Account Number"
          placeholder="Enter account number"
          inputMode="numeric"
          value={data.accountNumber}
          error={errors.accountNumber}
          onValueChange={(v) => update('accountNumber', gstInput.accountNumber(v))}
        />
        <GSTFieldShell id="confirmAccountNumber" label="Confirm Account Number">
          <ConfirmAccountNumberInput
            id="confirmAccountNumber"
            name="confirmAccountNumber"
            className={fieldInputClass(errors.confirmAccountNumber)}
            placeholder="Re-enter account number"
            value={data.confirmAccountNumber}
            onChange={(v) => update('confirmAccountNumber', v)}
            hasError={Boolean(errors.confirmAccountNumber)}
            error={errors.confirmAccountNumber}
          />
        </GSTFieldShell>
      </div>

      <GSTTextField
        id="ifscCode"
        label="IFSC Code"
        placeholder="e.g. HDFC0001234"
        maxLength={IFSC_LENGTH}
        autoCapitalize="characters"
        value={data.ifscCode}
        error={errors.ifscCode}
        onValueChange={handleIfscChange}
        onBlur={handleIfscBlur}
      />

      <div className="gst-form-row gst-form-row--pair">
        <GSTSelectField
          id="bankName"
          label="Bank Name"
          placeholder="Select"
          options={bankOptions(data.bankName)}
          value={data.bankName}
          error={errors.bankName}
          onValueChange={(v) => update('bankName', v)}
        />
        <GSTTextField
          id="branch"
          label="Branch"
          placeholder="Branch Name"
          value={data.branch}
          error={errors.branch}
          onValueChange={(v) => update('branch', gstInput.letters(v))}
        />
      </div>

      <GSTSelectField
        id="accountType"
        label="Account Type"
        placeholder="Select account type"
        options={BANK_ACCOUNT_TYPE_OPTIONS}
        value={data.accountType}
        error={errors.accountType}
        onValueChange={(v) => update('accountType', v)}
      />
    </GSTFormSection>
  )
}

export default GSTBankDetails
