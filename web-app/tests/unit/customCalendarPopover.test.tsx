// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { CustomCalendarPopover } from '../../src/shared/components/Input/CustomCalendarPopover'

describe('CustomCalendarPopover - Material Design Dialog with Cancel & OK', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders CANCEL and OK buttons and matches header date display', () => {
    const onClose = vi.fn()
    const onChange = vi.fn()

    render(
      <CustomCalendarPopover
        isOpen={true}
        value="01-01-1970"
        format="DD-MM-YYYY"
        onChange={onChange}
        onClose={onClose}
      />
    )

    // Verify "Clear" and "Today" are NOT present
    expect(screen.queryByRole('button', { name: /^clear$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^today$/i })).not.toBeInTheDocument()

    // Verify CANCEL and OK buttons
    const cancelBtn = screen.getByRole('button', { name: /^cancel$/i })
    const okBtn = screen.getByRole('button', { name: /^ok$/i })

    expect(cancelBtn).toBeInTheDocument()
    expect(okBtn).toBeInTheDocument()

    // Header date display
    expect(screen.getAllByText(/1970/).length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText(/Thu, 1 Jan/i)).toBeInTheDocument()

    // Single letter weekdays S M T W T F S
    expect(screen.getAllByText('S').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText('M')).toBeInTheDocument()
    expect(screen.getAllByText('T').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText('W')).toBeInTheDocument()
    expect(screen.getByText('F')).toBeInTheDocument()
  })

  it('clicking CANCEL calls onClose without calling onChange', () => {
    const onClose = vi.fn()
    const onChange = vi.fn()

    render(
      <CustomCalendarPopover
        isOpen={true}
        value="15-11-2026"
        format="DD-MM-YYYY"
        onChange={onChange}
        onClose={onClose}
      />
    )

    const cancelBtn = screen.getByRole('button', { name: /^cancel$/i })
    fireEvent.click(cancelBtn)

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('selecting a date and clicking OK confirms the selected date and calls onClose', () => {
    const onClose = vi.fn()
    const onChange = vi.fn()

    render(
      <CustomCalendarPopover
        isOpen={true}
        value="15-11-2026"
        format="DD-MM-YYYY"
        onChange={onChange}
        onClose={onClose}
      />
    )

    // Click day 20
    const day20 = screen.getByRole('button', { name: '20' })
    fireEvent.click(day20)

    const okBtn = screen.getByRole('button', { name: /^ok$/i })
    fireEvent.click(okBtn)

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('20-11-2026')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('supports YYYY-MM-DD ISO format for forms like GST', () => {
    const onClose = vi.fn()
    const onChange = vi.fn()

    render(
      <CustomCalendarPopover
        isOpen={true}
        value="2026-11-15"
        format="YYYY-MM-DD"
        onChange={onChange}
        onClose={onClose}
      />
    )

    const day10 = screen.getByRole('button', { name: '10' })
    fireEvent.click(day10)

    const okBtn = screen.getByRole('button', { name: /^ok$/i })
    fireEvent.click(okBtn)

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('2026-11-10')
  })
})
