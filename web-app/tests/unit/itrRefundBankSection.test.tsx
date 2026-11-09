// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ItrRefundBankSection } from '../../src/modules/itr/components/ItrFiling/PersonalInfo/ItrRefundBankSection'
import type { FilingBankAccount } from '../../src/modules/itr/components/ItrFiling/itrFiling.constants'

describe('ItrRefundBankSection - Manual Input & Layout Matching Image 2', () => {
  it('renders fields matching Image 2 order and placeholders, with no auto-fetch on IFSC', () => {
    const onBankAccountsChange = vi.fn()
    const onSelectedBankIdChange = vi.fn()

    render(
      <ItrRefundBankSection
        bankAccounts={[]}
        onBankAccountsChange={onBankAccountsChange}
        selectedBankId=""
        onSelectedBankIdChange={onSelectedBankIdChange}
      />
    )

    // Open Add Bank Account form
    const addBtn = screen.getByRole('button', { name: /add another bank account/i })
    fireEvent.click(addBtn)

    // Form header
    expect(screen.getByText('Add Bank Account')).toBeInTheDocument()
    expect(screen.getByText(/enter bank details for receiving your direct income tax refund/i)).toBeInTheDocument()

    // 1. Bank Name field
    const bankNameInput = screen.getByPlaceholderText('e.g. State Bank of India or HDFC Bank')
    expect(bankNameInput).toBeInTheDocument()
    expect(bankNameInput).not.toHaveAttribute('readonly')

    // 2. Branch Name (Optional) field
    const branchInput = screen.getByPlaceholderText('e.g. Indiranagar Branch')
    expect(branchInput).toBeInTheDocument()

    // 3. IFSC Code field
    const ifscInput = screen.getByPlaceholderText('e.g. SBIN0001234')
    expect(ifscInput).toBeInTheDocument()

    // 4. Account Number field
    const accInput = screen.getByPlaceholderText('Enter 9 to 18 digit account number')
    expect(accInput).toBeInTheDocument()

    // 5. Verify NO Account Type options exist in the form
    expect(screen.queryByText('Savings Account')).not.toBeInTheDocument()
    expect(screen.queryByText('Current Account')).not.toBeInTheDocument()

    // 6. Enter IFSC code and verify it does NOT auto-fetch or overwrite Bank Name
    fireEvent.change(ifscInput, { target: { value: 'SBIN0001234' } })
    expect(bankNameInput).toHaveValue('')

    // 7. Manually fill Bank Name, Branch, Account Number
    fireEvent.change(bankNameInput, { target: { value: 'State Bank of India' } })
    fireEvent.change(branchInput, { target: { value: 'Kurseong Branch' } })
    fireEvent.change(accInput, { target: { value: '123456789012' } })

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /save & validate account/i })
    fireEvent.click(submitBtn)

    // Verify bank account was created with manual entries
    expect(onBankAccountsChange).toHaveBeenCalledTimes(1)
    const accounts = onBankAccountsChange.mock.calls[0][0] as FilingBankAccount[]
    expect(accounts).toHaveLength(1)
    expect(accounts[0].bankName).toBe('State Bank of India')
    expect(accounts[0].branch).toBe('Kurseong Branch')
    expect(accounts[0].ifsc).toBe('SBIN0001234')
    expect(accounts[0].accountNumber).toContain('9012')
    expect(accounts[0].rawAccountNumber).toBe('123456789012')
  })

  it('hides top bank account card when editing, and populates full account number in edit form', () => {
    const onBankAccountsChange = vi.fn()
    const onSelectedBankIdChange = vi.fn()

    const initialAccounts: FilingBankAccount[] = [
      {
        id: 'bank-1',
        bankName: 'HDFC Bank',
        branch: 'MG Road Branch',
        accountNumber: '•••• •••• 7654',
        rawAccountNumber: '547812345678987654',
        ifsc: 'HDFC0000123',
        accountType: 'savings',
        isPrimary: true,
        isPreValidated: true,
      },
    ]

    const { rerender } = render(
      <ItrRefundBankSection
        bankAccounts={initialAccounts}
        onBankAccountsChange={onBankAccountsChange}
        selectedBankId="bank-1"
        onSelectedBankIdChange={onSelectedBankIdChange}
      />
    )

    // Top section is visible initially
    expect(screen.getByText('HDFC Bank')).toBeInTheDocument()
    expect(screen.getByText('•••• •••• 7654')).toBeInTheDocument()
    expect(screen.getByText('Validated')).toBeInTheDocument()

    // Click Edit button
    const editBtn = screen.getByRole('button', { name: /edit hdfc bank details/i })
    fireEvent.click(editBtn)

    // Top section should NOT show when editing
    expect(screen.queryByText('•••• •••• 7654')).not.toBeInTheDocument()
    expect(screen.queryByText('Validated')).not.toBeInTheDocument()

    // Edit form is visible
    expect(screen.getByText('Edit Bank Account')).toBeInTheDocument()

    // Fields are pre-filled with previously entered details
    const bankNameInput = screen.getByPlaceholderText('e.g. State Bank of India or HDFC Bank') as HTMLInputElement
    const branchInput = screen.getByPlaceholderText('e.g. Indiranagar Branch') as HTMLInputElement
    const ifscInput = screen.getByPlaceholderText('e.g. SBIN0001234') as HTMLInputElement
    const accInput = screen.getByPlaceholderText('Enter 9 to 18 digit account number') as HTMLInputElement

    expect(bankNameInput.value).toBe('HDFC Bank')
    expect(branchInput.value).toBe('MG Road Branch')
    expect(ifscInput.value).toBe('HDFC0000123')
    // Full account number must be shown, NOT just 4 digits
    expect(accInput.value).toBe('547812345678987654')

    // Modify branch name
    fireEvent.change(branchInput, { target: { value: 'Koramangala Branch' } })

    // Save & Validate
    const submitBtn = screen.getByRole('button', { name: /save & validate account/i })
    fireEvent.click(submitBtn)

    expect(onBankAccountsChange).toHaveBeenCalledTimes(1)
    const updated = onBankAccountsChange.mock.calls[0][0] as FilingBankAccount[]
    expect(updated[0].branch).toBe('Koramangala Branch')
    expect(updated[0].rawAccountNumber).toBe('547812345678987654')
    expect(updated[0].accountNumber).toBe('•••• •••• 7654')
  })
})
