// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@core/config/environment', () => ({
  env: {
    appName: 'TaxEdge',
    apiBaseUrl: 'http://localhost:3000',
    enableMocks: true,
    isDev: true,
    isProd: false,
  },
}))

import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { LoanApplicationStatus } from '../../src/modules/loans/components/LoanApplicationStatus'
import { loanApplicationService } from '../../src/modules/loans/services/loanApplicationService'
import type { LoanApplicationBase } from '../../src/modules/loans/types/loanApplication.types'

afterEach(() => {
  cleanup()
})

describe('Business Loan - Application Status Page', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders all sections and matches reference screenshot details by default', () => {
    render(
      <MemoryRouter initialEntries={['/loans/status/TXE-LN-235646']}>
        <Routes>
          <Route path="/loans/status/:id" element={<LoanApplicationStatus />} />
        </Routes>
      </MemoryRouter>
    )

    // 1. Page Header
    expect(screen.getByRole('heading', { level: 1, name: 'Loan Application Status' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Help and Support' })).toBeInTheDocument()

    // 2. Success Banner
    expect(screen.getByText('Application Submitted Successfully')).toBeInTheDocument()
    expect(
      screen.getByText(/Your Business Loan application has been lodged. Our Loan Agent and underwriting desk/i)
    ).toBeInTheDocument()

    // 3. Summary Card
    expect(screen.getByText(/Ref: TXE-LN-235646/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Copy Reference Number' })).toBeInTheDocument()
    expect(screen.getByText('Business Loan')).toBeInTheDocument()
    expect(screen.getByText('₹15,00,000')).toBeInTheDocument()
    expect(screen.getAllByText('Documents Received')[0]).toBeInTheDocument()

    // 4 Meta Columns
    expect(screen.getByText('Equipment')).toBeInTheDocument()
    expect(screen.getByText('CNC / Automation Machinery')).toBeInTheDocument()

    expect(screen.getByText('Tenure')).toBeInTheDocument()
    expect(screen.getByText('48 Months')).toBeInTheDocument()

    expect(screen.getByText('Disbursement Bank')).toBeInTheDocument()
    expect(screen.getByText('Primary Current Bank')).toBeInTheDocument()

    expect(screen.getByText('Loan Agent')).toBeInTheDocument()
    expect(screen.getByText('TaxEdge Loan Agent')).toBeInTheDocument()

    // 4. Milestones Card
    expect(screen.getByText('Application Lifecycle Milestones')).toBeInTheDocument()

    // Stage 1
    expect(screen.getByText('Application Submitted')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText(/25 Sep 2026/)).toBeInTheDocument()

    // Stage 2
    expect(screen.getByText('Agent Review')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('We are verifying your documents.')).toBeInTheDocument()

    // Stage 3
    expect(screen.getByText('Lender Review')).toBeInTheDocument()
    expect(screen.getByText('Will start after agent review.')).toBeInTheDocument()

    // Stage 4
    expect(screen.getByText('Sanctioned')).toBeInTheDocument()
    expect(screen.getByText('Will start after lender review.')).toBeInTheDocument()

    // Stage 5
    expect(screen.getByText('Disbursed')).toBeInTheDocument()
    expect(screen.getByText('Will start after sanction.')).toBeInTheDocument()

    // 5. Bottom Actions
    expect(screen.getByTestId('track-my-applications-btn')).toBeInTheDocument()
    expect(screen.getByTestId('go-to-home-btn')).toBeInTheDocument()
    expect(screen.getByTestId('download-receipt-btn')).toBeInTheDocument()
  })

  it('copies reference number to clipboard when clicking copy button', async () => {
    const writeTextSpy = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextSpy,
      },
    })

    render(
      <MemoryRouter initialEntries={['/loans/status/TXE-LN-235646']}>
        <Routes>
          <Route path="/loans/status/:id" element={<LoanApplicationStatus />} />
        </Routes>
      </MemoryRouter>
    )

    const copyBtn = screen.getByRole('button', { name: 'Copy Reference Number' })
    fireEvent.click(copyBtn)

    expect(writeTextSpy).toHaveBeenCalledWith('TXE-LN-235646')
    expect(screen.getByText('Copied!')).toBeInTheDocument()
  })

  it('fetches actual stored application data dynamically', () => {
    const mockApp: LoanApplicationBase = {
      id: 'TXE-LN-777123',
      refNumber: 'TXE-LN-777123',
      referenceNumber: 'TXE-LN-777123',
      loanType: 'Business Loan',
      loanCategory: 'Capital & Financing',
      loanAmount: 2500000,
      tenureYears: 3,
      tenureMonths: '36 Months',
      equipment: 'Industrial Laser Cutter',
      disbursementBank: 'HDFC Current Bank',
      loanAgent: 'TaxEdge Senior Advisor',
      status: 'submitted',
      statusLabel: 'Documents Received',
      createdAt: '2026-09-28T10:00:00Z',
      updatedAt: '2026-09-28T10:00:00Z',
      milestones: [
        { id: 'm1', title: 'Application Submitted', timestamp: '28 Sep 2026 10:00 AM', status: 'completed' },
        { id: 'm2', title: 'Agent Review', timestamp: 'Documents Received', status: 'current' },
        { id: 'm3', title: 'Lender Review', timestamp: 'Pending', status: 'pending' },
        { id: 'm4', title: 'Sanctioned', timestamp: 'Pending', status: 'pending' },
        { id: 'm5', title: 'Disbursed', timestamp: 'Pending', status: 'pending' },
      ],
    }

    loanApplicationService.saveApplication(mockApp)

    render(
      <MemoryRouter initialEntries={['/loans/status/TXE-LN-777123']}>
        <Routes>
          <Route path="/loans/status/:id" element={<LoanApplicationStatus />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText(/Ref: TXE-LN-777123/)).toBeInTheDocument()
    expect(screen.getByText('₹25,00,000')).toBeInTheDocument()
    expect(screen.getByText('Industrial Laser Cutter')).toBeInTheDocument()
    expect(screen.getByText('36 Months')).toBeInTheDocument()
    expect(screen.getByText('HDFC Current Bank')).toBeInTheDocument()
    expect(screen.getByText('TaxEdge Senior Advisor')).toBeInTheDocument()
    expect(screen.getByText('28 Sep 2026 10:00 AM')).toBeInTheDocument()
  })

  it('triggers download and shows toast feedback when clicking Download Sanction Letter / Receipt', () => {
    // Mock URL object
    window.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url')
    window.URL.revokeObjectURL = vi.fn()

    render(
      <MemoryRouter initialEntries={['/loans/status/TXE-LN-235646']}>
        <Routes>
          <Route path="/loans/status/:id" element={<LoanApplicationStatus />} />
        </Routes>
      </MemoryRouter>
    )

    const downloadBtn = screen.getByTestId('download-receipt-btn')
    fireEvent.click(downloadBtn)

    expect(
      screen.getByText('Application receipt downloaded successfully.')
    ).toBeInTheDocument()
  })
})
