// @vitest-environment jsdom
process.env.VITE_API_BASE_URL = 'http://localhost:3000'

import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, describe, it, expect } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { authStorage } from '../../src/core/auth'
import { localStore } from '../../src/core/storage/localStorage'
import { userStorage } from '../../src/core/storage/userStorage'
import { IncorporationWizardLayout } from '../../src/modules/incorporation/components/IncorporationWizardLayout/IncorporationWizardLayout'
import { useIncorporationFlow } from '../../src/modules/incorporation/hooks'

/** A wizard step that types into the application and offers "Save Draft & Exit" */
const CompanyStep = () => {
  const { formData, updateFormData, draft } = useIncorporationFlow()
  return (
    <>
      <span data-testid="company-name">{String(formData.companyDetails.companyName ?? '')}</span>
      <button onClick={() => updateFormData({ companyDetails: { companyName: 'Tanvox Technologies' } })}>type</button>
      <button onClick={draft.openDraftModal}>save-draft</button>
    </>
  )
}

const makeRouter = () =>
  createMemoryRouter(
    [
      { path: '/dashboard', element: <span>DASHBOARD</span> },
      {
        path: '/incorporation',
        element: <IncorporationWizardLayout />,
        children: [{ path: 'company-details', element: <CompanyStep /> }],
      },
    ],
    { initialEntries: ['/dashboard', '/incorporation/company-details'], initialIndex: 1 },
  )

describe('Incorporation draft works like loans and GST (shared useServiceDraft)', () => {
  afterEach(cleanup)
  beforeEach(() => {
    window.scrollTo = () => {}
    localStorage.clear()
    localStore.clear()
    authStorage.setUser({ id: 'inc-user', mobile: '9876543210', fullName: 'Test User', isLoggedIn: true, role: 'customer' })
  })

  it('"Save as Draft & Exit" keeps the entered details, lists the draft and restores it', async () => {
    const router = makeRouter()
    render(<RouterProvider router={router} />)
    fireEvent.click(screen.getByText('type'))
    fireEvent.click(screen.getByText('save-draft'))
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Save as Draft/i }))
    })
    expect(router.state.location.pathname).toBe('/dashboard')
    expect(userStorage.getDraft('incorporation')?.resumeRoute).toBe('/incorporation/company-details')

    cleanup()
    render(<RouterProvider router={makeRouter()} />)
    expect(screen.getByTestId('company-name')).toHaveTextContent('Tanvox Technologies')
  })

  it('browser Back with unsaved details opens the dialog; Discard clears the draft', async () => {
    const router = makeRouter()
    render(<RouterProvider router={router} />)
    fireEvent.click(screen.getByText('type'))
    await act(() => router.navigate(-1))
    expect(router.state.location.pathname).toBe('/incorporation/company-details')
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Discard/i }))
    })
    expect(userStorage.getDraft('incorporation')).toBeNull()

    cleanup()
    render(<RouterProvider router={makeRouter()} />)
    expect(screen.getByTestId('company-name')).toHaveTextContent('')
  })
})
