// @vitest-environment jsdom
process.env.VITE_API_BASE_URL = 'http://localhost:3000'

import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, describe, it, expect } from 'vitest'
import { act, cleanup, fireEvent, render, renderHook, screen } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { authStorage } from '../../src/core/auth'
import { localStore } from '../../src/core/storage/localStorage'
import { useReviewEdit } from '../../src/shared/edit'
import { StepActionBar } from '../../src/shared/components'
import { IncorporationWizardLayout } from '../../src/modules/incorporation/components/IncorporationWizardLayout/IncorporationWizardLayout'
import { useIncorporationFlow } from '../../src/modules/incorporation/hooks'
import { useLoanStepFlow } from '../../src/modules/loans/hooks/useLoanStepFlow'

afterEach(cleanup)

describe('useReviewEdit (shared by GST, Loans, ITR, Incorporation)', () => {
  it('startEdit opens the step in edit mode; Continue and Back both return to the review', () => {
    const calls: string[] = []
    const { result } = renderHook(() => useReviewEdit(() => calls.push('review')))

    act(() => result.current.startEdit(() => calls.push('open step 2')))
    expect(result.current.isEditMode).toBe(true)

    act(() => result.current.nextOrReview(() => calls.push('next'))())
    expect(calls).toEqual(['open step 2', 'review'])
    expect(result.current.isEditMode).toBe(false)

    act(() => result.current.startEdit(() => calls.push('open step 1')))
    act(() => result.current.backOrReview(() => calls.push('back'))())
    expect(calls.at(-1)).toBe('review')
  })

  it('outside edit mode Continue and Back keep their normal behaviour', () => {
    const calls: string[] = []
    const { result } = renderHook(() => useReviewEdit(() => calls.push('review')))
    act(() => result.current.nextOrReview(() => calls.push('next'))())
    act(() => result.current.backOrReview(() => calls.push('back'))())
    expect(calls).toEqual(['next', 'back'])
  })
})

describe('StepActionBar label', () => {
  it('reads "Continue" normally and "Update & Review" in edit mode', () => {
    const { rerender } = render(<StepActionBar onNext={() => {}} />)
    expect(screen.getByTestId('step-continue-btn')).toHaveTextContent('Continue')
    rerender(<StepActionBar onNext={() => {}} isEditMode />)
    expect(screen.getByTestId('step-continue-btn')).toHaveTextContent('Update & Review')
  })
})

describe('Incorporation: Edit from the review returns with "Update & Review"', () => {
  beforeEach(() => {
    window.scrollTo = () => {}
    localStorage.clear()
    localStore.clear()
    authStorage.setUser({ id: 'inc-edit', mobile: '9876543210', fullName: 'Test User', isLoggedIn: true, role: 'customer' })
  })

  const Review = () => {
    const { reviewEdit } = useIncorporationFlow()
    return (
      <>
        <span>REVIEW</span>
        <button onClick={() => reviewEdit.startEdit(() => router.navigate('/incorporation/company-details'))}>edit-company</button>
      </>
    )
  }
  const Step = () => {
    const { reviewEdit, goToStep } = useIncorporationFlow()
    return (
      <StepActionBar
        isEditMode={reviewEdit.isEditMode}
        onNext={() => goToStep('/incorporation/registered-office')}
        onBack={() => goToStep('/incorporation/select-type')}
      />
    )
  }

  let router: ReturnType<typeof createMemoryRouter>
  const renderWizard = () => {
    router = createMemoryRouter(
      [
        {
          path: '/incorporation',
          element: <IncorporationWizardLayout />,
          children: [
            { path: 'review-application', element: <Review /> },
            { path: 'company-details', element: <Step /> },
            { path: 'registered-office', element: <span>NEXT STEP</span> },
          ],
        },
      ],
      { initialEntries: ['/incorporation/review-application'] },
    )
    render(<RouterProvider router={router} />)
  }

  it('Edit opens the step with "Update & Review", which goes straight back to the review', async () => {
    renderWizard()
    await act(async () => fireEvent.click(screen.getByText('edit-company')))
    expect(router.state.location.pathname).toBe('/incorporation/company-details')
    expect(screen.getByTestId('step-continue-btn')).toHaveTextContent('Update & Review')

    await act(async () => fireEvent.click(screen.getByTestId('step-continue-btn')))
    expect(router.state.location.pathname).toBe('/incorporation/review-application')
  })

  it('Back while editing returns to the review instead of the previous step', async () => {
    renderWizard()
    await act(async () => fireEvent.click(screen.getByText('edit-company')))
    await act(async () => fireEvent.click(screen.getByTestId('step-back-btn')))
    expect(router.state.location.pathname).toBe('/incorporation/review-application')
  })
})

describe('Loans: Edit from the review (shared useLoanStepFlow)', () => {
  beforeEach(() => {
    window.scrollTo = () => {}
    localStorage.clear()
    localStore.clear()
    authStorage.setUser({ id: 'loan-edit', mobile: '9876543210', fullName: 'Test User', isLoggedIn: true, role: 'customer' })
  })

  const pass = () => ({ isValid: true, errors: {} })

  const LoanHarness = () => {
    const flow = useLoanStepFlow({
      loanType: 'edit_test_loan',
      initialValues: { amount: '' },
      application: { serviceTitle: 'Test Loan', totalSteps: 3 },
      validators: [pass, pass, pass],
      loanTitle: 'Test Loan',
    })
    return (
      <>
        <span data-testid="loan-step">{flow.currentStep}</span>
        <button onClick={() => flow.goToStep(3)}>to-review</button>
        <button onClick={() => flow.navigateToStep(1)}>edit-step-1</button>
        <StepActionBar isEditMode={flow.isEditMode} onNext={flow.handleNext} onBack={flow.handleBack} />
      </>
    )
  }

  const renderLoan = () =>
    render(
      <RouterProvider
        router={createMemoryRouter([{ path: '/loans/test', element: <LoanHarness /> }], { initialEntries: ['/loans/test'] })}
      />,
    )

  it('Edit opens the step with "Update & Review", which returns straight to the review', async () => {
    renderLoan()
    fireEvent.click(screen.getByText('to-review'))
    fireEvent.click(screen.getByText('edit-step-1'))
    expect(screen.getByTestId('loan-step')).toHaveTextContent('1')
    expect(screen.getByTestId('step-continue-btn')).toHaveTextContent('Update & Review')

    await act(async () => fireEvent.click(screen.getByTestId('step-continue-btn')))
    expect(screen.getByTestId('loan-step')).toHaveTextContent('3')
  })

  it('Back while editing returns to the review instead of the previous step', async () => {
    renderLoan()
    fireEvent.click(screen.getByText('to-review'))
    fireEvent.click(screen.getByText('edit-step-1'))
    await act(async () => fireEvent.click(screen.getByTestId('step-back-btn')))
    expect(screen.getByTestId('loan-step')).toHaveTextContent('3')
  })
})
