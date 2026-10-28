// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { DetailCard } from './DetailCard'

describe('DetailCard component', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders "Pending" badge for missing/empty fields and never displays "Not provided"', () => {
    render(
      <DetailCard
        title="Personal Information"
        items={[
          { label: 'Full Name', value: '' },
          { label: 'Email Address', value: null },
          { label: 'Gender', value: undefined },
          { label: 'Date of Birth', value: '   ' },
        ]}
      />
    )

    // Ensure "Not provided" is NEVER in the document
    expect(screen.queryByText('Not provided')).toBeNull()

    // Ensure all empty fields render as Pending
    const pendingBadges = screen.getAllByText('Pending')
    expect(pendingBadges.length).toBe(4)
  })

  it('renders actual values when present, including 0 and false', () => {
    render(
      <DetailCard
        title="Values Test"
        items={[
          { label: 'Name', value: 'John Doe' },
          { label: 'Zero Count', value: 0 },
          { label: 'False Flag', value: false },
        ]}
      />
    )

    expect(screen.getByText('John Doe')).toBeDefined()
    expect(screen.getByText('0')).toBeDefined()
    expect(screen.getByText('false')).toBeDefined()
    expect(screen.queryByText('Pending')).toBeNull()
    expect(screen.queryByText('Not provided')).toBeNull()
  })

  it('renders Verified badge for verified fields (like mobile number)', () => {
    render(
      <DetailCard
        title="Contact"
        items={[
          { label: 'Mobile Number', value: '+91 9121781234', isVerified: true },
        ]}
      />
    )

    expect(screen.getByText('+91 9121781234')).toBeDefined()
    expect(screen.getByText('Verified')).toBeDefined()
  })

  it('renders Edit Details button when onEdit callback is provided', () => {
    const handleEdit = vi.fn()
    render(
      <DetailCard
        title="Personal Information"
        items={[{ label: 'Full Name', value: 'Jane' }]}
        onEdit={handleEdit}
      />
    )

    const editBtn = screen.getByRole('button', { name: /Edit Details/i })
    expect(editBtn).toBeDefined()
    fireEvent.click(editBtn)
    expect(handleEdit).toHaveBeenCalledTimes(1)
  })
})
