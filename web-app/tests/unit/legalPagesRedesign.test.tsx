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

  it('renders simple header with Finsolz logo without print button or marketing navigation', () => {
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

    // Print button should NOT be rendered
    expect(screen.queryByRole('button', { name: /Print this document/i })).toBeNull()
    expect(screen.queryByText('Print')).toBeNull()

    // Does NOT render marketing navigation links
    expect(screen.queryByRole('link', { name: 'Services' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Pricing' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Resources' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Get Started' })).toBeNull()
  })

  it('renders Terms & Conditions with Introduction, numbered sections, and bottom last-updated info', () => {
    render(
      <MemoryRouter initialEntries={['/legal/terms']}>
        <Routes>
          <Route path="/legal/:documentId" element={<LegalPage />} />
        </Routes>
      </MemoryRouter>
    )

    // Main title
    expect(screen.getByRole('heading', { level: 1, name: 'Terms & Conditions' })).toBeDefined()

    // Does NOT render Published / Effective date line in header
    expect(screen.queryByText(/Published:/i)).toBeNull()
    expect(screen.queryByText(/Effective: 1 October 2026/i)).toBeNull()

    // Intro box above Introduction
    const introBox = screen.getByTestId('legal-doc-intro-box')
    expect(introBox).toBeDefined()
    expect(introBox.textContent).toMatch(/These Terms & Conditions govern access to and use/i)

    // Introduction heading & intro text
    expect(screen.getByRole('heading', { level: 2, name: 'Introduction' })).toBeDefined()
    expect(screen.getByText(/These Terms & Conditions govern access to and use of the Tax Edge Fin Solutions website/i)).toBeDefined()

    // Numbered sections
    expect(screen.getByRole('heading', { level: 2, name: '1.1 Services' })).toBeDefined()
    expect(screen.getByRole('heading', { level: 2, name: '1.2 Engagement and scope' })).toBeDefined()
    expect(screen.getByRole('heading', { level: 2, name: '1.3 Client responsibilities' })).toBeDefined()
    expect(screen.getByRole('heading', { level: 2, name: '1.4 Professional advice and limitations' })).toBeDefined()
    expect(screen.getByRole('heading', { level: 2, name: '1.5 Fees and payments' })).toBeDefined()
    expect(screen.getByRole('heading', { level: 2, name: '1.6 Third-party services' })).toBeDefined()
    expect(screen.getByRole('heading', { level: 2, name: '1.7 Intellectual property and acceptable use' })).toBeDefined()
    expect(screen.getByRole('heading', { level: 2, name: '1.8 Account security and communications' })).toBeDefined()
    expect(screen.getByRole('heading', { level: 2, name: '1.9 Suspension, termination and liability' })).toBeDefined()
    expect(screen.getByRole('heading', { level: 2, name: '1.10 Changes, governing law and contact' })).toBeDefined()

    // Bottom section
    expect(screen.getByText(/Last updated:/i)).toBeDefined()
    expect(screen.getAllByRole('link', { name: /support@finsolz/i }).length).toBeGreaterThanOrEqual(1)
  })

  it('renders Privacy Policy with Introduction, numbered sections, and PDF text', () => {
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
    expect(screen.getByText(/This Privacy Policy explains how Tax Edge Fin Solutions LLP collects, uses, stores, shares and protects information/i)).toBeDefined()

    // Numbered sections
    expect(screen.getByRole('heading', { level: 2, name: '2.1 Information collected' })).toBeDefined()
    expect(screen.getByRole('heading', { level: 2, name: '2.2 Sources and purposes' })).toBeDefined()
    expect(screen.getByRole('heading', { level: 2, name: '2.3 Consent and choices' })).toBeDefined()
    expect(screen.getByRole('heading', { level: 2, name: '2.4 Sharing' })).toBeDefined()
    expect(screen.getByRole('heading', { level: 2, name: '2.5 Payments and security' })).toBeDefined()
    expect(screen.getByRole('heading', { level: 2, name: '2.6 Retention' })).toBeDefined()
    expect(screen.getByRole('heading', { level: 2, name: '2.7 Your requests and grievances' })).toBeDefined()
    expect(screen.getByRole('heading', { level: 2, name: '2.8 Children, cookies and updates' })).toBeDefined()

    // Bottom section
    expect(screen.getByText(/Last updated:/i)).toBeDefined()
  })

  it('renders Refund & Cancellation Policy with Introduction and numbered sections matching PDF', () => {
    render(
      <MemoryRouter initialEntries={['/legal/refund']}>
        <Routes>
          <Route path="/legal/:documentId" element={<LegalPage />} />
        </Routes>
      </MemoryRouter>
    )

    // Main title
    expect(screen.getByRole('heading', { level: 1, name: 'Refund & Cancellation Policy' })).toBeDefined()

    // Introduction heading & intro text
    expect(screen.getByRole('heading', { level: 2, name: 'Introduction' })).toBeDefined()
    expect(screen.getByText(/This policy applies to services purchased from Tax Edge Fin Solutions LLP/i)).toBeDefined()

    // Numbered sections
    expect(screen.getByRole('heading', { level: 2, name: '3.1 Before work begins' })).toBeDefined()
    expect(screen.getByRole('heading', { level: 2, name: '3.2 After work begins' })).toBeDefined()
    expect(screen.getByRole('heading', { level: 2, name: '3.3 Government and third-party charges' })).toBeDefined()
    expect(screen.getByRole('heading', { level: 2, name: '3.4 Circumstances where refunds may not be available' })).toBeDefined()
    expect(screen.getByRole('heading', { level: 2, name: '3.5 Cancellation by TaxEdge' })).toBeDefined()
    expect(screen.getByRole('heading', { level: 2, name: '3.6 Request process' })).toBeDefined()
    expect(screen.getByRole('heading', { level: 2, name: '3.7 Review and processing' })).toBeDefined()
    expect(screen.getByRole('heading', { level: 2, name: '3.8 Failed, pending or duplicate payments' })).toBeDefined()

    // Bottom section
    expect(screen.getByText(/Last updated:/i)).toBeDefined()
  })
})
