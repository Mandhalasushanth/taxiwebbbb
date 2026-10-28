// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { UnavailableModal } from './UnavailableModal'

describe('UnavailableModal component', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders nothing when isOpen is false', () => {
    render(<UnavailableModal isOpen={false} title="Rate TaxEdge" onClose={vi.fn()} />)
    expect(screen.queryByTestId('unavailable-modal-card')).toBeNull()
  })

  it('renders nothing when title is null', () => {
    render(<UnavailableModal isOpen={true} title={null} onClose={vi.fn()} />)
    expect(screen.queryByTestId('unavailable-modal-card')).toBeNull()
  })

  it('renders title "Rate TaxEdge", message "This section isn\'t available yet.", and "OK" button', () => {
    render(<UnavailableModal isOpen={true} title="Rate TaxEdge" onClose={vi.fn()} />)

    expect(screen.getByRole('heading', { name: 'Rate TaxEdge' })).toBeDefined()
    expect(screen.getByText("This section isn't available yet.")).toBeDefined()
    expect(screen.getByRole('button', { name: 'OK' })).toBeDefined()
  })

  it('renders dynamically with clicked item title (e.g. "Terms & Conditions", "Change Password")', () => {
    const { rerender } = render(
      <UnavailableModal isOpen={true} title="Terms & Conditions" onClose={vi.fn()} />
    )
    expect(screen.getByRole('heading', { name: 'Terms & Conditions' })).toBeDefined()

    rerender(<UnavailableModal isOpen={true} title="Change Password" onClose={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'Change Password' })).toBeDefined()

    rerender(<UnavailableModal isOpen={true} title="Privacy Policy" onClose={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'Privacy Policy' })).toBeDefined()
  })

  it('calls onClose when clicking the OK button', () => {
    const handleClose = vi.fn()
    render(<UnavailableModal isOpen={true} title="Rate TaxEdge" onClose={handleClose} />)

    fireEvent.click(screen.getByRole('button', { name: 'OK' }))
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when clicking the backdrop overlay', () => {
    const handleClose = vi.fn()
    render(<UnavailableModal isOpen={true} title="Rate TaxEdge" onClose={handleClose} />)

    fireEvent.click(screen.getByTestId('unavailable-modal-overlay'))
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when pressing Escape key', () => {
    const handleClose = vi.fn()
    render(<UnavailableModal isOpen={true} title="Rate TaxEdge" onClose={handleClose} />)

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(handleClose).toHaveBeenCalledTimes(1)
  })
})
