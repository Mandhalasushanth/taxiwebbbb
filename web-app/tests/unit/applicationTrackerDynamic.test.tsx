// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ApplicationTrackerView } from '@modules/applications/components/ApplicationTracker/ApplicationTrackerView'
import { userStorage } from '@core/storage/userStorage'

describe('ApplicationTrackerView dynamic behavior across applications', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn()
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('renders GST Amendment with 2 documents and 4 steps instead of hardcoded 4', () => {
    userStorage.saveUserApplication({
      id: 'app-amd-101',
      code: 'GST-AMD-99123',
      title: 'GST Amendment',
      meta: 'Legal Name Change · Karnataka',
      statusLabel: 'Verification in Progress',
      statusTone: 'info',
      progress: 25,
      icon: '📄',
      to: '/applications/track/GST-AMD-99123',
    })

    render(
      <MemoryRouter initialEntries={['/applications/track/GST-AMD-99123?tab=documents']}>
        <Routes>
          <Route path="/applications/track/:id" element={<ApplicationTrackerView />} />
        </Routes>
      </MemoryRouter>
    )

    // Document badge must show 2/2 not 4/4
    expect(screen.getByText('2/2')).toBeDefined()
    expect(screen.getByText(/2 of 2 documents uploaded/i)).toBeDefined()
    expect(screen.getByText('Supporting Proof Document')).toBeDefined()
    expect(screen.getByText('Identity & Authorization Proof')).toBeDefined()
    expect(screen.queryByText('Bank Statement / Passbook')).toBeNull()
  })

  it('renders GST Registration with 3 documents and 6 timeline steps', () => {
    userStorage.saveUserApplication({
      id: 'app-reg-202',
      code: 'GST-REG-88231',
      title: 'GST Registration',
      meta: 'Acme Pvt Ltd · Maharashtra',
      statusLabel: 'Under Review',
      statusTone: 'warning',
      progress: 35,
      icon: '📄',
      to: '/applications/track/GST-REG-88231',
    })

    render(
      <MemoryRouter initialEntries={['/applications/track/GST-REG-88231?tab=status']}>
        <Routes>
          <Route path="/applications/track/:id" element={<ApplicationTrackerView />} />
        </Routes>
      </MemoryRouter>
    )

    // Step badge must show total 6 steps
    expect(screen.getByText(/Step \d\/6/)).toBeDefined()
    expect(screen.getByText('Customer Request')).toBeDefined()
    expect(screen.getByText('Staff Verification')).toBeDefined()
    expect(screen.getByText('Application Drafting')).toBeDefined()
    expect(screen.getByText('E-Sign / OTP Authentication')).toBeDefined()
    expect(screen.getByText('Portal E-Filing')).toBeDefined()
    expect(screen.getByText(/Acknowledgement Issuance/i)).toBeDefined()
  })

  it('renders ITR Filing with 8 steps and dynamic overview details', () => {
    userStorage.saveUserApplication({
      id: 'app-itr-303',
      code: 'ITR-2026-44812',
      title: 'ITR Filing - ITR-1 (Sahaj)',
      meta: 'Salaried · ₹12,50,000',
      statusLabel: 'Verification Pending',
      statusTone: 'info',
      progress: 20,
      icon: '📄',
      to: '/applications/track/ITR-2026-44812',
    })

    render(
      <MemoryRouter initialEntries={['/applications/track/ITR-2026-44812?tab=status']}>
        <Routes>
          <Route path="/applications/track/:id" element={<ApplicationTrackerView />} />
        </Routes>
      </MemoryRouter>
    )

    // Step badge must show total 8 steps
    expect(screen.getByText(/Step \d\/8/)).toBeDefined()
    expect(screen.getByText('Internal Tax Review')).toBeDefined()
    expect(screen.getByText('Customer Review & Approval')).toBeDefined()
    expect(screen.getByText('E-Verification')).toBeDefined()
  })
})

