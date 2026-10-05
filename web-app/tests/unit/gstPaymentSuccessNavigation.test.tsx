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

import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { GSTPaymentSuccess } from '../../src/modules/gst/components/GSTRegistration/GSTPaymentSuccess/GSTPaymentSuccess'
import { userStorage } from '../../src/core/storage/userStorage'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('GSTPaymentSuccess Action Buttons Navigation', () => {
  const mockDetails = {
    transactionId: 'TXN123456',
    receiptNumber: 'TE/2026/R-1001',
    method: 'UPI',
    dateText: '24 Sep 2026, 11:00 AM',
    applicationRef: 'GST-2026-99999',
    amount: 1499,
  }

  it('renders all three action buttons in the bottom row', () => {
    render(
      <MemoryRouter>
        <GSTPaymentSuccess details={mockDetails} businessName="Acme Corp" />
      </MemoryRouter>
    )

    expect(screen.getByText('Track in My Applications')).toBeDefined()
    expect(screen.getByText('Go to Home Dashboard')).toBeDefined()
    expect(screen.getByText('Contact Support / CA')).toBeDefined()
  })

  it('calls onTrackApplications callback when Track in My Applications is clicked', () => {
    const onTrack = vi.fn()
    render(
      <MemoryRouter>
        <GSTPaymentSuccess details={mockDetails} onTrackApplications={onTrack} />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByText('Track in My Applications'))
    expect(onTrack).toHaveBeenCalledTimes(1)
  })

  it('calls onBackToDashboard callback when Go to Home Dashboard is clicked', () => {
    const onDashboard = vi.fn()
    render(
      <MemoryRouter>
        <GSTPaymentSuccess details={mockDetails} onBackToDashboard={onDashboard} />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByText('Go to Home Dashboard'))
    expect(onDashboard).toHaveBeenCalledTimes(1)
  })

  it('calls onContactSupport callback when Contact Support / CA is clicked', () => {
    const onSupport = vi.fn()
    render(
      <MemoryRouter>
        <GSTPaymentSuccess details={mockDetails} onContactSupport={onSupport} />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByText('Contact Support / CA'))
    expect(onSupport).toHaveBeenCalledTimes(1)
  })

  it('registers the application in userStorage so it appears under My Applications', () => {
    render(
      <MemoryRouter>
        <GSTPaymentSuccess details={mockDetails} businessName="Acme Enterprises" />
      </MemoryRouter>
    )

    const apps = userStorage.getUserApplications()
    const saved = apps.find((a) => a.code === 'GST-2026-99999')
    expect(saved).toBeDefined()
    expect(saved?.title).toBe('GST Registration')
  })
})
