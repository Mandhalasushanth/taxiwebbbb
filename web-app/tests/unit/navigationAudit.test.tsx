// @vitest-environment jsdom
process.env.VITE_API_BASE_URL = 'http://localhost:3000'

import '@testing-library/jest-dom/vitest'
import { afterEach, describe, it, expect } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { routePaths } from '../../src/core/config/routePaths'
import { useSafeBack } from '../../src/shared/hooks/useSafeBack'
import { commonLoanValidation } from '../../src/modules/loans/validation/commonLoanValidation'

afterEach(cleanup)

const BackButton = () => {
  const goBack = useSafeBack(routePaths.payments)
  return <button onClick={goBack}>Back</button>
}

const OpenReceipt = () => {
  const navigate = useNavigate()
  return <button onClick={() => navigate(routePaths.paymentReceiptDirect)}>Open receipt</button>
}

const renderAt = (initialEntries: string[]) =>
  render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path={routePaths.dashboard} element={<><p>Dashboard page</p><OpenReceipt /></>} />
        <Route path={routePaths.payments} element={<p>Payments page</p>} />
        <Route path={routePaths.paymentReceiptDirect} element={<BackButton />} />
      </Routes>
    </MemoryRouter>,
  )

describe('useSafeBack', () => {
  it('falls back to the given page when the screen was opened directly', () => {
    renderAt([routePaths.paymentReceiptDirect])
    fireEvent.click(screen.getByText('Back'))
    expect(screen.getByText('Payments page')).toBeInTheDocument()
  })

  it('steps back through in-app history when there is one', () => {
    renderAt([routePaths.dashboard])
    fireEvent.click(screen.getByText('Open receipt'))
    fireEvent.click(screen.getByText('Back'))
    expect(screen.getByText('Dashboard page')).toBeInTheDocument()
  })
})

describe('route helpers', () => {
  it('builds tracking and loan status URLs from routePaths', () => {
    expect(routePaths.applicationTrack('GST-123')).toBe('/applications/track/GST-123')
    expect(routePaths.loansStatus('LN-9')).toBe('/loans/status/LN-9')
  })
})

describe('loan identity validation', () => {
  it('rejects 12-digit numbers that fail the Aadhaar checksum', () => {
    expect(commonLoanValidation.isValidAadhaar('000000000000')).toBe(false)
    expect(commonLoanValidation.isValidAadhaar('1234 5678 9012')).toBe(false)
  })

  it('rejects mobiles that do not start with 6-9 or are repeated digits', () => {
    expect(commonLoanValidation.validatePhone('0123456789').isValid).toBe(false)
    expect(commonLoanValidation.validatePhone('9999999999').isValid).toBe(false)
    expect(commonLoanValidation.validatePhone('+91 91234 98765').isValid).toBe(true)
  })
})
