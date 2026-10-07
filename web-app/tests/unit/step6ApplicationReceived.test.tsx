// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

process.env.VITE_API_BASE_URL = 'http://localhost:3000'

afterEach(() => {
  cleanup()
})

import { Step6ApplicationReceived } from '../../src/modules/itr/components/RevisedItr/ApplicationReceived/Step6ApplicationReceived'

describe('Step6ApplicationReceived', () => {
  const mockProps = {
    applicationId: 'ITR-2026-50983',
    selectedAy: 'AY 2025-26',
    returnDetails: {
      status: 'Verified from IT Portal',
      assessmentYear: 'AY 2025-26',
      itrForm: 'ITR-1',
      grossTotalIncome: '₹8,12,400',
      salaryOriginal: 812400,
      otherOriginal: 0,
      taxableOriginal: 492400,
      personalInfo: {
        fullName: 'Sagarika Jena',
        pan: 'XXXXX4743E',
        dob: '02-02-2000',
        mobile: '7008138785',
        email: 'jenasagarika5211@gmail.com',
        address: 'Ameerpet, Hyderabad, Telangana - 500018',
      },
    },
    uploadedDocuments: {},
    onBack: vi.fn(),
    onDownloadReceipt: vi.fn(),
  }

  it('renders application received hero headline and application ID', () => {
    render(
      <MemoryRouter>
        <Step6ApplicationReceived {...mockProps} />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('heading', {
        name: /Your Revised ITR application has been received/i,
      })
    ).toBeDefined()

    expect(screen.getByText('ITR-2026-50983')).toBeDefined()
    expect(screen.getByText(/A Tax Executive will review them before preparing your return/i)).toBeDefined()
  })

  it('renders all 6 timeline stages and stage 3 callout', () => {
    render(
      <MemoryRouter>
        <Step6ApplicationReceived {...mockProps} />
      </MemoryRouter>
    )

    expect(screen.getByText('Stage 3 of 6')).toBeDefined()
    expect(screen.getByText('Application Received')).toBeDefined()
    expect(screen.getByText('Payment Completed')).toBeDefined()
    expect(screen.getByText('CA Verification')).toBeDefined()
    expect(screen.getByText('Revised ITR Preparation')).toBeDefined()
    expect(screen.getByText('Filing')).toBeDefined()
    expect(screen.getByText('Income Tax Processing')).toBeDefined()

    expect(screen.getByText(/Current Stage 3: CA Verification/i)).toBeDefined()
    expect(screen.getByText(/Certified CA verifying original filing and revised declaration/i)).toBeDefined()
  })

  it('renders "What we have" details accurately', () => {
    render(
      <MemoryRouter>
        <Step6ApplicationReceived {...mockProps} />
      </MemoryRouter>
    )

    expect(screen.getByText('What we have')).toBeDefined()
    expect(screen.getByText('Assessment Year')).toBeDefined()
    expect(screen.getByText('AY 2025-26')).toBeDefined()
    expect(screen.getByText('Revised ITR')).toBeDefined()
    expect(screen.getByText('New Tax Regime')).toBeDefined()
    expect(screen.getByText('0 of 6 received')).toBeDefined()
    expect(screen.getByText('HDFC Bank ···· 1234')).toBeDefined()
  })

  it('renders "What happens next" guidance', () => {
    render(
      <MemoryRouter>
        <Step6ApplicationReceived {...mockProps} />
      </MemoryRouter>
    )

    expect(screen.getByText('What happens next')).toBeDefined()
    expect(
      screen.getByText(/A Tax Executive will verify your documents, prepare the return/i)
    ).toBeDefined()
  })

  it('calls onDownloadReceipt when download button is clicked', () => {
    render(
      <MemoryRouter>
        <Step6ApplicationReceived {...mockProps} />
      </MemoryRouter>
    )

    const downloadBtn = screen.getByRole('button', {
      name: /Download Receipt/i,
    })
    fireEvent.click(downloadBtn)
    expect(mockProps.onDownloadReceipt).toHaveBeenCalledTimes(1)
  })

  it('renders Track My Application, Go to Dashboard, and Download Receipt buttons', () => {
    render(
      <MemoryRouter>
        <Step6ApplicationReceived {...mockProps} />
      </MemoryRouter>
    )

    const trackBtn = screen.getByRole('button', { name: /Track My Application/i })
    expect(trackBtn).toBeDefined()

    const dashboardBtn = screen.getByRole('button', { name: /Go to Dashboard/i })
    expect(dashboardBtn).toBeDefined()

    const downloadBtn = screen.getByRole('button', { name: /Download Receipt/i })
    expect(downloadBtn).toBeDefined()
  })
})
