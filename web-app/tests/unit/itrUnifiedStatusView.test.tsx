// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import React from 'react'
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { TdsRefundProgressTracker } from '../../src/modules/itr/components/TdsRefund/TdsRefundOverview'
import { TdsRefundStatus } from '../../src/modules/itr/components/TdsRefund/TdsRefundStatus/TdsRefundStatus'
import { ItrFilingSubmittedView } from '../../src/modules/itr/components/ItrFiling/FilingSubmitted/ItrFilingSubmittedView'
import { RevisionApplicationReceived } from '../../src/modules/itr/components/RevisedItr/ApplicationReceived/RevisionApplicationReceived'

describe('ITR Unified Application Status & 2-Step Stepper Tests', () => {
  afterEach(() => {
    cleanup()
  })

  it('1. TDS Refund Stepper has exactly 2 steps: Application Details and Review & Submit (No Step 3)', () => {
    render(<TdsRefundProgressTracker currentStep={1} />)

    expect(screen.getByText('Application Details')).toBeInTheDocument()
    expect(screen.getByText('Review & Submit')).toBeInTheDocument()
    expect(screen.queryByText('Application Status')).toBeNull()
    expect(screen.getByTestId('tds-step-1')).toBeInTheDocument()
    expect(screen.getByTestId('tds-step-2')).toBeInTheDocument()
    expect(screen.queryByTestId('tds-step-3')).toBeNull()
  })

  it('2. TDS Refund Status view matches Image 2 UI with user details and 3 action buttons side by side', () => {
    render(
      <MemoryRouter>
        <TdsRefundStatus
          applicationId="TDS87F6ACDC716E"
          customerName="Sagarika Jena"
          appliedDate="2026-11-05"
        />
      </MemoryRouter>
    )

    // Header Title & Subtitle removed per user request
    expect(screen.queryByTestId('status-title')).toBeNull()
    expect(screen.queryByText('Application Status')).toBeNull()

    // Green banner
    expect(screen.getByTestId('status-success-banner')).toBeInTheDocument()
    expect(screen.getByText('Application Submitted!')).toBeInTheDocument()
    expect(
      screen.getByText(/Your TDS Refund application has been successfully filed with Finsolz/i)
    ).toBeInTheDocument()

    // Navy card details
    expect(screen.getByTestId('status-app-id')).toHaveTextContent('TDS87F6ACDC716E')
    expect(screen.getByTestId('status-badge-text')).toHaveTextContent('Under Verification')
    expect(screen.getByTestId('status-customer-name')).toHaveTextContent('Sagarika Jena')
    expect(screen.getByTestId('status-service-name')).toHaveTextContent('TDS Refund')
    expect(screen.getByTestId('status-applied-date')).toHaveTextContent('05 Nov 2026')
    expect(screen.getByTestId('status-est-completion')).toHaveTextContent('1-2 Business Days')

    // 3 Buttons in a row side by side
    expect(screen.getByTestId('status-btn-dashboard')).toHaveTextContent('Go to Home Dashboard')
    expect(screen.getByTestId('status-btn-track')).toHaveTextContent('Track in My Applications')
    expect(screen.getByTestId('status-btn-support')).toHaveTextContent('Contact Support / CA')
  })

  it('3. ITR Filing Submitted view matches Image 3 UI with applicable form details and 3 buttons', () => {
    render(
      <MemoryRouter>
        <ItrFilingSubmittedView
          submittedRef="ITR-2026-873414"
          selectedSources={['capital_gains']}
          customerName="Sagarika Jena"
        />
      </MemoryRouter>
    )

    // Header Title & Subtitle removed per user request
    expect(screen.queryByTestId('status-title')).toBeNull()
    expect(screen.queryByText('Application Status')).toBeNull()

    // Green banner
    expect(screen.getByText('Application Submitted!')).toBeInTheDocument()

    // Navy card
    expect(screen.getByTestId('status-app-id')).toHaveTextContent('ITR-2026-873414')
    expect(screen.getByTestId('status-badge-text')).toHaveTextContent('Under Verification')
    expect(screen.getByTestId('status-customer-name')).toHaveTextContent('Sagarika Jena')
    expect(screen.getByTestId('status-service-name')).toHaveTextContent(
      'ITR Filing - ITR-2 (Capital Gains & Other Incomes)'
    )
    expect(screen.getByTestId('status-est-completion')).toHaveTextContent('1-2 Business Days')

    // 3 Buttons
    expect(screen.getByTestId('status-btn-dashboard')).toBeInTheDocument()
    expect(screen.getByTestId('status-btn-track')).toBeInTheDocument()
    expect(screen.getByTestId('status-btn-support')).toBeInTheDocument()
  })

  it('4. Revised ITR status screen uses the exact same UI structure with Revised ITR details', () => {
    render(
      <MemoryRouter>
        <RevisionApplicationReceived
          applicationId="REV-2026-554433"
          selectedAy="2025-26"
          returnDetails={{
            personalInfo: { fullName: 'Sagarika Jena', pan: 'ABCDE1234F', mobile: '9999999999', email: 's@test.com', dob: '1990-01-01', address: 'Bangalore' },
            status: 'Filed',
            assessmentYear: '2025-26',
            itrForm: 'ITR-1',
            grossTotalIncome: '800000',
          }}
        />
      </MemoryRouter>
    )

    expect(screen.queryByTestId('status-title')).toBeNull()
    expect(screen.queryByText('Application Status')).toBeNull()
    expect(screen.getByText('Application Submitted!')).toBeInTheDocument()
    expect(screen.getByTestId('status-app-id')).toHaveTextContent('REV-2026-554433')
    expect(screen.getByTestId('status-customer-name')).toHaveTextContent('Sagarika Jena')
    expect(screen.getByTestId('status-service-name')).toHaveTextContent('Revised ITR Filing (AY 2025-26)')
    expect(screen.getByTestId('status-est-completion')).toHaveTextContent('1-2 Business Days')

    // 3 Buttons
    expect(screen.getByTestId('status-btn-dashboard')).toBeInTheDocument()
    expect(screen.getByTestId('status-btn-track')).toBeInTheDocument()
    expect(screen.getByTestId('status-btn-support')).toBeInTheDocument()
  })
})
