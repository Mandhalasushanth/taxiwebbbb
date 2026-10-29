// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ApplicationTrackerView } from '@modules/applications/components/ApplicationTracker/ApplicationTrackerView'

describe('ApplicationTrackerView component', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn()
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('renders Overview tab matching mobile screenshot data with Application Details and What happens next card', () => {
    render(
      <MemoryRouter initialEntries={['/applications/track/GST-FIL-2026-31583']}>
        <Routes>
          <Route path="/applications/track/:id" element={<ApplicationTrackerView />} />
        </Routes>
      </MemoryRouter>
    )

    // Heading and cards
    expect(screen.getAllByText('Overview').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Application Details').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Service')).toBeDefined()
    expect(screen.getByText('Application ID')).toBeDefined()
    expect(screen.getByText('Submission Date')).toBeDefined()
    expect(screen.getAllByText('Status').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Submitted').length).toBeGreaterThanOrEqual(1)

    // What happens next card
    expect(screen.getByText('What happens next?')).toBeDefined()
    expect(screen.getByText(/Your application has been submitted successfully/i)).toBeDefined()
    expect(screen.getByText(/Have questions\? Chat with CA/i)).toBeDefined()
  })

  it('navigates to Chat with CA when clicking "Have questions? Chat with CA >" on Overview tab', async () => {
    render(
      <MemoryRouter initialEntries={['/applications/track/GST-FIL-2026-31583']}>
        <Routes>
          <Route path="/applications/track/:id" element={<ApplicationTrackerView />} />
        </Routes>
      </MemoryRouter>
    )

    const chatLink = screen.getByText(/Have questions\? Chat with CA/i)
    await act(async () => {
      fireEvent.click(chatLink)
    })

    expect(screen.getAllByText('TaxEdge Support').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/Online · replies in a few minutes/i)).toBeDefined()
  })

  it('renders Status tab with Application Submitted banner, 4-step vertical timeline, and bottom received note', async () => {
    render(
      <MemoryRouter initialEntries={['/applications/track/GST-FIL-2026-31583?tab=status']}>
        <Routes>
          <Route path="/applications/track/:id" element={<ApplicationTrackerView />} />
        </Routes>
      </MemoryRouter>
    )

    // Top card
    expect(screen.getAllByText('Application Submitted').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/Application submitted successfully on/i)).toBeDefined()

    // 4 Steps matching Screenshot 2
    expect(screen.getByText('Filing Data Submitted')).toBeDefined()
    expect(screen.getByText('Document Collection')).toBeDefined()
    expect(screen.getByText('Verification')).toBeDefined()
    expect(screen.getAllByText('Completed').length).toBeGreaterThanOrEqual(1)

    // Status pill badges
    expect(screen.getByText('In Progress')).toBeDefined()

    // Bottom note
    expect(screen.getByText('Application received')).toBeDefined()
    expect(screen.getByText(/queued for verification/i)).toBeDefined()
  })

  it('renders Documents tab matching mobile screenshot 3 with 4 uploaded documents and View button', () => {
    render(
      <MemoryRouter initialEntries={['/applications/track/GST-FIL-2026-31583?tab=documents']}>
        <Routes>
          <Route path="/applications/track/:id" element={<ApplicationTrackerView />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getAllByText('Uploaded Documents').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Sales Invoices / Register')).toBeDefined()
    expect(screen.getByText('Purchase Invoices / Register')).toBeDefined()
    expect(screen.getByText('Bank Statement / Passbook')).toBeDefined()
    expect(screen.getByText('Other Supporting Documents')).toBeDefined()

    // View buttons
    const viewButtons = screen.getAllByRole('button', { name: /View/i })
    expect(viewButtons.length).toBeGreaterThanOrEqual(4)

    // Bottom note
    expect(screen.getByText('These are the documents you uploaded during the application.')).toBeDefined()
  })

  it('renders Payments tab matching mobile screenshot 4 with Payment Summary, Details, and Completed banner', () => {
    render(
      <MemoryRouter initialEntries={['/applications/track/GST-FIL-2026-31583?tab=payments']}>
        <Routes>
          <Route path="/applications/track/:id" element={<ApplicationTrackerView />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getAllByText('Payment Summary').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Total Amount')).toBeDefined()
    expect(screen.getByText('Payment Details')).toBeDefined()
    expect(screen.getByText('Fee Type')).toBeDefined()
    expect(screen.getByText('Filing Fee')).toBeDefined()
    expect(screen.getByText('Payment Mode')).toBeDefined()
    expect(screen.getByText('UPI')).toBeDefined()
    expect(screen.getByText('Transaction ID')).toBeDefined()
    expect(screen.getByText('Payment completed successfully.')).toBeDefined()
  })

  it('renders Chat with CA tab using common chat support component matching Support Chat', async () => {
    render(
      <MemoryRouter initialEntries={['/applications/track/GST-FIL-2026-31583?tab=chat']}>
        <Routes>
          <Route path="/applications/track/:id" element={<ApplicationTrackerView />} />
        </Routes>
      </MemoryRouter>
    )

    // Common Chat Support Header and Status
    expect(await screen.findByText('Online · replies in a few minutes')).toBeDefined()
    expect(screen.getAllByText('TaxEdge Support').length).toBeGreaterThanOrEqual(1)

    // Common Quick Action Prompts
    expect(await screen.findByText('Track my application')).toBeDefined()
    expect(screen.getByText('Payment issue')).toBeDefined()

    // Encryption & Input controls
    expect(screen.getByText('This chat is encrypted and monitored for service quality.')).toBeDefined()
    expect(screen.getByPlaceholderText('Type your message...')).toBeDefined()

    // Type and send a message via common chat support
    const input = screen.getByPlaceholderText('Type your message...')
    const sendBtn = screen.getByRole('button', { name: /Send message/i })

    await act(async () => {
      fireEvent.change(input, { target: { value: 'When will the verification be completed?' } })
      fireEvent.click(sendBtn)
    })

    expect(await screen.findByText('When will the verification be completed?')).toBeDefined()
  })
})
