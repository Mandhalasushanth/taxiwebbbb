// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { LegalPage } from '../../src/modules/legal/pages/LegalPage/LegalPage'
import { legalRoutes } from '../../src/modules/legal/routes'

describe('Legal Pages Redesign (Terms & Conditions, Privacy Policy)', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('renders simple header with Finsolz logo and Print button without marketing navigation', () => {
    render(
      <MemoryRouter initialEntries={['/legal/terms']}>
        <Routes>
          <Route path="/legal/:documentId" element={<LegalPage />} />
        </Routes>
      </MemoryRouter>
    )

    // Brand logo & name
    expect(screen.getByLabelText(/Finsolz Home/i)).toBeDefined()
    expect(screen.getByText('Finsolz')).toBeDefined()

    // Print button
    const printBtn = screen.getByRole('button', { name: /Print this document/i })
    expect(printBtn).toBeDefined()
    expect(screen.getByText('Print')).toBeDefined()

    // Does NOT render marketing navigation links
    expect(screen.queryByRole('link', { name: 'Services' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Pricing' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Resources' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Get Started' })).toBeNull()
  })

  it('clicking Print invokes window.print()', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {})
    render(
      <MemoryRouter initialEntries={['/legal/terms']}>
        <Routes>
          <Route path="/legal/:documentId" element={<LegalPage />} />
        </Routes>
      </MemoryRouter>
    )

    const printBtn = screen.getByRole('button', { name: /Print this document/i })
    fireEvent.click(printBtn)
    expect(printSpy).toHaveBeenCalledTimes(1)
  })

  it('renders Terms of Service with Introduction, numbered sections, and bottom last-updated info', () => {
    render(
      <MemoryRouter initialEntries={['/legal/terms']}>
        <Routes>
          <Route path="/legal/:documentId" element={<LegalPage />} />
        </Routes>
      </MemoryRouter>
    )

    // Main title
    expect(screen.getByRole('heading', { level: 1, name: 'Terms of Service' })).toBeDefined()

    // Introduction heading & intro text
    expect(screen.getByRole('heading', { level: 2, name: 'Introduction' })).toBeDefined()
    expect(screen.getByText(/These Terms of Service govern your use of the Finsolz website and services/i)).toBeDefined()

    // Numbered sections
    expect(screen.getByRole('heading', { level: 2, name: '1. Our services' })).toBeDefined()
    expect(screen.getByRole('heading', { level: 2, name: '2. Your account' })).toBeDefined()
    expect(screen.getByRole('heading', { level: 2, name: '3. Your responsibilities' })).toBeDefined()
    expect(screen.getByRole('heading', { level: 2, name: '4. Fees and payments' })).toBeDefined()
    expect(screen.getByRole('heading', { level: 2, name: '5. Limitation of liability' })).toBeDefined()
    expect(screen.getByRole('heading', { level: 2, name: '6. Suspension and termination' })).toBeDefined()
    expect(screen.getByRole('heading', { level: 2, name: '7. Changes and contact' })).toBeDefined()

    // Bottom section
    expect(screen.getByText(/Last updated:/i)).toBeDefined()
    expect(screen.getAllByRole('link', { name: /support@finsolz/i }).length).toBeGreaterThanOrEqual(1)
  })

  it('renders Privacy Policy with Introduction, numbered sections, and DPDP Act text', () => {
    render(
      <MemoryRouter initialEntries={['/legal/privacy']}>
        <Routes>
          <Route path="/legal/:documentId" element={<LegalPage />} />
        </Routes>
      </MemoryRouter>
    )

    // Main title
    expect(screen.getByRole('heading', { level: 1, name: 'Privacy Policy' })).toBeDefined()

    // Introduction heading & intro text
    expect(screen.getByRole('heading', { level: 2, name: 'Introduction' })).toBeDefined()
    expect(screen.getByText(/Digital Personal Data Protection Act, 2023/i)).toBeDefined()

    // Numbered sections
    expect(screen.getByRole('heading', { level: 2, name: '1. Data we collect' })).toBeDefined()
    expect(screen.getByRole('heading', { level: 2, name: '2. How we use it' })).toBeDefined()
    expect(screen.getByRole('heading', { level: 2, name: '3. Aadhaar data' })).toBeDefined()
    expect(screen.getByRole('heading', { level: 2, name: '4. Sharing' })).toBeDefined()
    expect(screen.getByRole('heading', { level: 2, name: '5. Security and retention' })).toBeDefined()
    expect(screen.getByRole('heading', { level: 2, name: '6. Your rights' })).toBeDefined()

    // Bottom section
    expect(screen.getByText(/Last updated:/i)).toBeDefined()
  })
})
