// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ProfileSectionModal } from './ProfileSectionModal'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@modules/applications', () => ({
  useApplications: () => ({ data: [] }),
}))

describe('ProfileSectionModal component', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders GST modal with exact empty state text and action buttons without overlap', () => {
    const handleClose = vi.fn()
    render(
      <MemoryRouter>
        <ProfileSectionModal isOpen={true} onClose={handleClose} modalType="gst" />
      </MemoryRouter>
    )

    expect(screen.getAllByText('GST Details').length).toBeGreaterThanOrEqual(1)
    expect(
      screen.getByText(
        'GST registration details, return filing records, and compliance summaries will be available here once you apply for GST services or connect your GSTIN.'
      )
    ).toBeDefined()

    const closeBtn = screen.getByRole('button', { name: /^Close$/i })
    const ctaBtn = screen.getByRole('button', { name: /Apply for GST Registration/i })

    expect(closeBtn).toBeDefined()
    expect(ctaBtn).toBeDefined()

    fireEvent.click(ctaBtn)
    expect(mockNavigate).toHaveBeenCalledWith('/gst')
    expect(handleClose).toHaveBeenCalled()
  })

  it('renders ITR modal with correct empty state and File ITR Now CTA', () => {
    const handleClose = vi.fn()
    render(
      <MemoryRouter>
        <ProfileSectionModal isOpen={true} onClose={handleClose} modalType="itr" />
      </MemoryRouter>
    )

    expect(screen.getByText('ITR History')).toBeDefined()
    expect(screen.getByText('No ITR Filings Yet')).toBeDefined()

    const ctaBtn = screen.getByRole('button', { name: /File ITR Now/i })
    fireEvent.click(ctaBtn)
    expect(mockNavigate).toHaveBeenCalledWith('/itr')
  })

  it('renders Loan History modal with Explore Loan Products CTA', () => {
    const handleClose = vi.fn()
    render(
      <MemoryRouter>
        <ProfileSectionModal isOpen={true} onClose={handleClose} modalType="loans" />
      </MemoryRouter>
    )

    expect(screen.getByText('Loan History')).toBeDefined()
    expect(screen.getByText('No Loan Applications Yet')).toBeDefined()

    const ctaBtn = screen.getByRole('button', { name: /Explore Loan Products/i })
    fireEvent.click(ctaBtn)
    expect(mockNavigate).toHaveBeenCalledWith('/loans')
  })

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <MemoryRouter>
        <ProfileSectionModal isOpen={false} onClose={vi.fn()} modalType="gst" />
      </MemoryRouter>
    )
    expect(container.firstChild).toBeNull()
  })
})
