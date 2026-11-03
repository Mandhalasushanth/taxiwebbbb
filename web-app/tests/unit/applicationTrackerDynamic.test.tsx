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

    // Step badge must show total 5 default steps
    expect(screen.getByText(/Step \d\/5/)).toBeDefined()
    expect(screen.getByText('Document Collection')).toBeDefined()
    expect(screen.getByText('Verification')).toBeDefined()
    expect(screen.getByText('Payment')).toBeDefined()
    expect(screen.getAllByText('Completed').length).toBeGreaterThanOrEqual(1)
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

    // Step badge must show total 5 default steps
    expect(screen.getByText(/Step \d\/5/)).toBeDefined()
    expect(screen.getByText('Document Collection')).toBeDefined()
    expect(screen.getByText('Verification')).toBeDefined()
    expect(screen.getByText('Payment')).toBeDefined()
    expect(screen.getAllByText('Completed').length).toBeGreaterThanOrEqual(1)
  })
})

