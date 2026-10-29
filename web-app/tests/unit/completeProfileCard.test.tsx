// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { CompleteProfileCard } from '../../src/modules/profile/components/CompleteProfileCard/CompleteProfileCard'

describe('CompleteProfileCard component', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders title, description, progress percentage and button', () => {
    const handleComplete = vi.fn()
    render(
      <CompleteProfileCard
        progress={20}
        onCompleteProfile={handleComplete}
      />
    )

    expect(screen.getByText('Complete Your Profile')).toBeDefined()
    expect(
      screen.getByText(/Complete your personal information and KYC details to access all TaxEdge services/i)
    ).toBeDefined()
    expect(screen.getByText('20% Completed')).toBeDefined()

    const btn = screen.getByRole('button', { name: /Complete Profile/i })
    expect(btn).toBeDefined()
    fireEvent.click(btn)
    expect(handleComplete).toHaveBeenCalledTimes(1)
  })

  it('clamps progress between 0 and 100', () => {
    const { rerender } = render(
      <CompleteProfileCard progress={-10} onCompleteProfile={() => {}} />
    )
    expect(screen.getByText('0% Completed')).toBeDefined()

    rerender(<CompleteProfileCard progress={120} onCompleteProfile={() => {}} />)
    expect(screen.getByText('100% Completed')).toBeDefined()
  })
})

