// @vitest-environment jsdom
process.env.VITE_API_BASE_URL = 'http://localhost:3000'

import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cleanup, render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { ApplicationSubmitted } from '../../src/modules/loans/components/PersonalLoan/steps/ApplicationSubmitted/ApplicationSubmitted'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Personal Loan – Step 5 Application Submitted', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    if (typeof window !== 'undefined') {
      window.scrollTo = vi.fn()
    }
  })

  afterEach(() => {
    cleanup()
  })

  it('renders confirmation header, details card, next steps and action buttons matching screenshot', () => {
    const handleTrack = vi.fn()

    render(
      <ApplicationSubmitted
        referenceNumber="TXE-LN-372617"
        applicationType="Personal Loan"
        requestedAmount="549599"
        submittedAt="2026-10-15T10:29:00.000Z"
        onTrackApplication={handleTrack}
      />,
    )

    // Header
    expect(screen.getByText('Application Submitted')).toBeInTheDocument()
    expect(screen.getByText('Your application is under review')).toBeInTheDocument()
    expect(
      screen.getByText(/Our agent will review your application and come in contact with you soon/i),
    ).toBeInTheDocument()

    // Summary Card rows
    expect(screen.getByText('Application Reference')).toBeInTheDocument()
    expect(screen.getByText('TXE-LN-372617')).toBeInTheDocument()
    expect(screen.getByText('Application Type')).toBeInTheDocument()
    expect(screen.getByText('Personal Loan')).toBeInTheDocument()
    expect(screen.getByText('Requested Amount')).toBeInTheDocument()
    expect(screen.getByText('₹5,49,599')).toBeInTheDocument()
    expect(screen.getByText('Submitted On')).toBeInTheDocument()
    expect(screen.getByText('Current Status')).toBeInTheDocument()
    expect(screen.getByText('Under Review')).toBeInTheDocument()

    // Note
    expect(
      screen.getByText(/Saved on this device. This reference will be confirmed once our team receives your application/i),
    ).toBeInTheDocument()

    // Next steps
    expect(screen.getByText('What happens next?')).toBeInTheDocument()
    expect(screen.getByText('Our agent will review your application.')).toBeInTheDocument()
    expect(screen.getByText('We may contact you if additional information is required.')).toBeInTheDocument()
    expect(screen.getByText('You will be contacted with the next update.')).toBeInTheDocument()

    // Action buttons
    const dashboardBtn = screen.getByRole('button', { name: /Go to Dashboard/i })
    expect(dashboardBtn).toBeInTheDocument()
    fireEvent.click(dashboardBtn)
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard')

    expect(screen.queryByRole('button', { name: /Track Application/i })).not.toBeInTheDocument()

    const supportBtn = screen.getByRole('button', { name: /Contact Support/i })
    expect(supportBtn).toBeInTheDocument()
    fireEvent.click(supportBtn)
    expect(mockNavigate).toHaveBeenCalledWith('/support')
  })
})
