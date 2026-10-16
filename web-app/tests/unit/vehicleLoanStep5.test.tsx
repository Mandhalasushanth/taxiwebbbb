// @vitest-environment jsdom
process.env.VITE_API_BASE_URL = 'http://localhost:3000'

import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cleanup, render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { ApplicationSubmitted } from '../../src/modules/loans/components/VehicleLoan/steps/ApplicationSubmitted/ApplicationSubmitted'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Vehicle Loan – Step 5 Application Submitted', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    if (typeof window !== 'undefined') {
      window.scrollTo = vi.fn()
    }
  })

  afterEach(() => {
    cleanup()
  })

  it('renders application submitted screen matching Screenshot 3', () => {
    render(
      <MemoryRouter>
        <ApplicationSubmitted
          referenceNumber="TXE-LN-217542"
          applicationType="Vehicle Loan"
          requestedAmount="9978"
          submittedAt="2026-10-15T17:40:00.000Z"
        />
      </MemoryRouter>,
    )

    // Heading & Subtitle
    expect(screen.getByRole('heading', { level: 2, name: 'Application Submitted' })).toBeInTheDocument()
    expect(screen.getByText('Your application is under review')).toBeInTheDocument()
    expect(
      screen.getByText('Our agent will review your application and come in contact with you soon.'),
    ).toBeInTheDocument()

    // Art badge
    expect(screen.getByTestId('veh-submitted-art')).toBeInTheDocument()

    // Summary Card Rows
    expect(screen.getByText('Application Reference')).toBeInTheDocument()
    expect(screen.getByText('TXE-LN-217542')).toBeInTheDocument()

    expect(screen.getByText('Application Type')).toBeInTheDocument()
    expect(screen.getByText('Vehicle Loan')).toBeInTheDocument()

    expect(screen.getByText('Requested Amount')).toBeInTheDocument()
    expect(screen.getByText('₹9,978')).toBeInTheDocument()

    expect(screen.getByText('Submitted On')).toBeInTheDocument()

    expect(screen.getByText('Current Status')).toBeInTheDocument()
    expect(screen.getByText('Under Review')).toBeInTheDocument()

    // Note
    expect(
      screen.getByText(
        'Saved on this device. This reference will be confirmed once our team receives your application.',
      ),
    ).toBeInTheDocument()

    // Action buttons
    expect(screen.getByRole('button', { name: 'Go to Home' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Contact Support' })).toBeInTheDocument()
  })

  it('navigates to home when "Go to Home" button is clicked', () => {
    render(
      <MemoryRouter>
        <ApplicationSubmitted
          referenceNumber="TXE-LN-217542"
          applicationType="Vehicle Loan"
          requestedAmount="9978"
        />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Go to Home' }))
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('navigates to support when "Contact Support" button is clicked', () => {
    render(
      <MemoryRouter>
        <ApplicationSubmitted
          referenceNumber="TXE-LN-217542"
          applicationType="Vehicle Loan"
          requestedAmount="9978"
        />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Contact Support' }))
    expect(mockNavigate).toHaveBeenCalledWith('/support')
  })

  it('invokes onGoHome and onContactSupport callbacks when provided', () => {
    const handleGoHome = vi.fn()
    const handleContactSupport = vi.fn()

    render(
      <MemoryRouter>
        <ApplicationSubmitted
          referenceNumber="TXE-LN-217542"
          applicationType="Vehicle Loan"
          requestedAmount="9978"
          onGoHome={handleGoHome}
          onContactSupport={handleContactSupport}
        />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Go to Home' }))
    expect(handleGoHome).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'Contact Support' }))
    expect(handleContactSupport).toHaveBeenCalledTimes(1)
  })
})
