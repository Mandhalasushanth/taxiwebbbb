// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'

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
import { MemoryRouter } from 'react-router-dom'
import { IncompleteApplicationBanner } from '../../src/modules/dashboard/components/IncompleteApplicationBanner/IncompleteApplicationBanner'
import { DashboardOverviewGrid } from '../../src/modules/dashboard/components/DashboardOverviewGrid/DashboardOverviewGrid'
import type { ApplicationDraft } from '../../src/core/storage/userStorage'
import type { RecentApplication } from '../../src/modules/dashboard/types/dashboard.types'

afterEach(() => {
  cleanup()
})

describe('IncompleteApplicationBanner', () => {
  const applicationDraft: ApplicationDraft = {
    serviceId: 'gst-registration',
    serviceTitle: 'GST Registration',
    currentStep: 1,
    totalSteps: 4,
    formData: {},
    savedAt: '3:32 am',
    savedTimestamp: 1727140000000,
    resumeRoute: '/services/gst/registration',
  }

  const filingDraft: ApplicationDraft = {
    serviceId: 'gst-filing',
    serviceTitle: 'GST Return Filing (FY 2024-25 (Full Year Return))',
    currentStep: 1,
    totalSteps: 4,
    formData: {},
    savedAt: '3:44 am',
    savedTimestamp: 1727140800000,
    resumeRoute: '/services/gst/filing',
  }

  it('renders application draft in orange theme with INCOMPLETE APPLICATION badge', () => {
    render(
      <MemoryRouter>
        <IncompleteApplicationBanner draft={applicationDraft} />
      </MemoryRouter>
    )

    expect(screen.getByText('INCOMPLETE APPLICATION')).toBeTruthy()
    expect(screen.getByText('GST Registration')).toBeTruthy()
    expect(screen.getByText(/Pick up right where you left off/)).toBeTruthy()
    expect(screen.getByText('Resume Application')).toBeTruthy()
    expect(screen.getByText(/Saved 3:32 am/)).toBeTruthy()
  })

  it('renders filing draft in blue theme with INCOMPLETE FILING badge', () => {
    render(
      <MemoryRouter>
        <IncompleteApplicationBanner draft={filingDraft} />
      </MemoryRouter>
    )

    expect(screen.getByText('INCOMPLETE FILING')).toBeTruthy()
    expect(screen.getByText('GST Return Filing (FY 2024-25 (Full Year Return))')).toBeTruthy()
    expect(screen.getByText(/Continue your return filing/)).toBeTruthy()
    expect(screen.getByText('Resume Filing')).toBeTruthy()
    expect(screen.getByText(/Saved 3:44 am/)).toBeTruthy()
  })

  it('triggers onDiscard callback when discard button is clicked', () => {
    const handleDiscard = vi.fn()
    render(
      <MemoryRouter>
        <IncompleteApplicationBanner draft={applicationDraft} onDiscard={handleDiscard} />
      </MemoryRouter>
    )

    const discardBtn = screen.getByRole('button', { name: /discard this draft/i })
    fireEvent.click(discardBtn)

    expect(handleDiscard).toHaveBeenCalledWith('gst-registration')
  })
})

describe('DashboardOverviewGrid Recent Applications', () => {
  const sampleApps: RecentApplication[] = [
    { id: 'app-1', code: 'DRAFT-GST-1', title: 'GST Registration', meta: 'Saved 1 hour ago', statusLabel: 'Draft', statusTone: 'info', progress: 25, to: '/service/gst-registration' },
    { id: 'app-2', code: 'DRAFT-FILING-2', title: 'GST Return Filing', meta: 'Saved 2 hours ago', statusLabel: 'Draft', statusTone: 'info', progress: 50, to: '/service/gst-filing' },
    { id: 'app-3', code: 'DRAFT-NOTICE-3', title: 'Tax Notice Assistance', meta: 'Saved 3 hours ago', statusLabel: 'Draft', statusTone: 'info', progress: 40, to: '/itr/tax-notice-assistance' },
    { id: 'app-4', code: 'ITR-2026-100', title: 'ITR-1 Filing', meta: 'Submitted yesterday', statusLabel: 'Submitted', statusTone: 'success', progress: 100, to: '/itr' },
    { id: 'app-5', code: 'LOAN-2026-200', title: 'Business Loan', meta: 'Submitted 2 days ago', statusLabel: 'Verification', statusTone: 'warning', progress: 75, to: '/loans' },
  ]

  it('keeps 3 applications visible by default and renders View All link pointing to applications manager', () => {
    render(
      <MemoryRouter>
        <DashboardOverviewGrid applications={sampleApps} />
      </MemoryRouter>
    )

    expect(screen.getByText('GST Registration')).toBeTruthy()
    expect(screen.getByText('GST Return Filing')).toBeTruthy()
    expect(screen.getByText('Tax Notice Assistance')).toBeTruthy()

    // 4th and 5th should not be visible on the dashboard card
    expect(screen.queryByText('ITR-1 Filing')).toBeNull()
    expect(screen.queryByText('Business Loan')).toBeNull()

    // View All link should point to /applications
    const viewAllLink = screen.getByRole('link', { name: /view all applications/i })
    expect(viewAllLink).toBeTruthy()
    expect(viewAllLink.getAttribute('href')).toBe('/applications')
  })

  it('does not stretch or expand in place and keeps 3 applications visible', () => {
    render(
      <MemoryRouter>
        <DashboardOverviewGrid applications={sampleApps} />
      </MemoryRouter>
    )

    // The dashboard card should stay compact and not expand inline
    expect(screen.getByText('GST Registration')).toBeTruthy()
    expect(screen.getByText('GST Return Filing')).toBeTruthy()
    expect(screen.getByText('Tax Notice Assistance')).toBeTruthy()
    expect(screen.queryByText('ITR-1 Filing')).toBeNull()
    expect(screen.queryByText('Business Loan')).toBeNull()

    // There should be no "Show Less" toggle button stretching the card
    expect(screen.queryByRole('button', { name: /show fewer applications/i })).toBeNull()
  })
})
