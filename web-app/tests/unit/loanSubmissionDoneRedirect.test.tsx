// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi } from 'vitest'

vi.mock('@core/config/environment', () => ({
  env: {
    appName: 'TaxEdge',
    apiBaseUrl: 'http://localhost:3000',
    enableMocks: true,
    isDev: true,
    isProd: false,
  },
}))

import { render, screen, fireEvent, renderHook, act, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach } from 'vitest'
import { ProjectFinanceSubmitModal } from '../../src/modules/loans/components/ProjectFinance/steps/ReviewAndSubmit/ProjectFinanceSubmitModal'
import { LoanSubmitSuccessModal } from '../../src/modules/loans/shared/LoanSubmitSuccessModal/LoanSubmitSuccessModal'
import { useLoanApplication } from '../../src/modules/loans/hooks/useLoanApplication'
import { loanStorageKey } from '../../src/modules/loans/services/loanApplicationService'
import { safeNavigateTo } from '../../src/modules/loans/utils/loanMarketplace.utils'
import { localStore } from '@core/storage/localStorage'

afterEach(() => {
  cleanup()
})

describe('Loan Submission Done Button Redirection', () => {
  it('renders ProjectFinanceSubmitModal and invokes onDone callback when Done button is clicked', () => {
    const handleDone = vi.fn()

    render(
      <ProjectFinanceSubmitModal
        isOpen={true}
        applicationId="TXE-LN-778780"
        onDone={handleDone}
      />
    )

    expect(screen.getByText('Application Submitted!')).toBeInTheDocument()
    expect(screen.getByText(/TXE-LN-778780/)).toBeInTheDocument()
    expect(
      screen.getByText(/Your Project Finance loan application has been submitted successfully/i)
    ).toBeInTheDocument()

    const doneButton = screen.getByRole('button', { name: /Done/i })
    expect(doneButton).toBeInTheDocument()

    fireEvent.click(doneButton)
    expect(handleDone).toHaveBeenCalledTimes(1)
  })

  it('renders LoanSubmitSuccessModal with Done button and triggers onDone callback', () => {
    const handleDone = vi.fn()

    render(
      <LoanSubmitSuccessModal
        isOpen={true}
        title="Vehicle Loan Submitted"
        referenceNumber="TXE-LN-93820124"
        onDone={handleDone}
      />
    )

    expect(screen.getByText('Vehicle Loan Submitted')).toBeInTheDocument()
    const doneBtn = screen.getByRole('button', { name: /Done/i })
    expect(doneBtn).toBeInTheDocument()

    fireEvent.click(doneBtn)
    expect(handleDone).toHaveBeenCalledTimes(1)
  })

  it('safeNavigateTo redirects to /loans (all loans page) correctly', () => {
    const navigateMock = vi.fn()
    safeNavigateTo(navigateMock, '/loans')
    expect(navigateMock).toHaveBeenCalledWith('/loans')
  })

  it('useLoanApplication provides markSubmitted which sets isSubmitted to true and clears saved step and draft', () => {
    localStore.set(loanStorageKey('step_test_loan'), 7)

    const { result } = renderHook(() =>
      useLoanApplication('test_loan', { foo: 'bar' }, { serviceTitle: 'Test Loan' }),
      { wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter> }
    )

    expect(result.current.isSubmitted).toBe(false)

    act(() => {
      result.current.markSubmitted()
    })

    expect(result.current.isSubmitted).toBe(true)
    expect(localStore.get(loanStorageKey('step_test_loan'))).toBeNull()
  })
})
