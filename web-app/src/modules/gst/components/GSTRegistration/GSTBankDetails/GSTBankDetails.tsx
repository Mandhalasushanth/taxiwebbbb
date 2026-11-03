import { Wallet } from 'lucide-react'
import { gstInput } from '@modules/gst/utils/gstInputFormatters'
import { BANK_ACCOUNT_TYPE_OPTIONS } from '@modules/gst/utils/gstBusinessDetails.constants'
import { GSTFormSection } from '@modules/gst/shared/GSTFormSection'
import { GSTFieldShell, GSTSelectField, GSTTextField, fieldInputClass } from '@modules/gst/shared/GSTFormFields'
import type { GstBusinessFormData } from '../GSTStepBusiness/GSTStepBusiness'
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
  onBlur?: (field: keyof GstBusinessFormData) => void
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

export const GSTBankDetails = ({
  data,
  onChange,
  onBlur,
  errors = {},
  onClearError,
}: GSTBankDetailsProps) => {
  const update = <K extends BankField>(field: K, value: GstBusinessFormData[K]) => {
    onChange(field, value)
    onClearError?.(field)
  }

  const handleIfscChange = (value: string) => {
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, IFSC_LENGTH)
    update('ifscCode', cleaned)
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
        onValueChange={(v) => update('accountHolderName', gstInput.businessName(v))}
        onBlur={() => {
          onChange('accountHolderName', data.accountHolderName.trim())
          onBlur?.('accountHolderName')
        }}
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
          onBlur={() => onBlur?.('accountNumber')}
        />
        <GSTFieldShell id="confirmAccountNumber" label="Confirm Account Number">
          <ConfirmAccountNumberInput
            id="confirmAccountNumber"
            name="confirmAccountNumber"
            className={fieldInputClass(errors.confirmAccountNumber)}
            placeholder="Re-enter account number"
            value={data.confirmAccountNumber}
            onChange={(v) => update('confirmAccountNumber', gstInput.accountNumber(v))}
            onBlur={() => onBlur?.('confirmAccountNumber')}
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
        onBlur={() => onBlur?.('ifscCode')}
      />

      <div className="gst-form-row gst-form-row--pair">
        <GSTTextField
          id="bankName"
          label="Bank Name"
          placeholder="Enter bank name"
          value={data.bankName}
          error={errors.bankName}
          onValueChange={(v) => update('bankName', gstInput.letters(v, 100))}
          onBlur={() => {
            onChange('bankName', data.bankName.trim())
            onBlur?.('bankName')
          }}
        />
        <GSTTextField
          id="branch"
          label="Branch"
          placeholder="Branch Name"
          value={data.branch}
          error={errors.branch}
          onValueChange={(v) => update('branch', gstInput.branch(v))}
          onBlur={() => {
            onChange('branch', data.branch.trim())
            onBlur?.('branch')
          }}
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
        onBlur={() => onBlur?.('accountType')}
      />
    </GSTFormSection>
  )
}

export default GSTBankDetails
