// @vitest-environment jsdom
process.env.VITE_API_BASE_URL = 'http://localhost:3000'

import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { cleanup, render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { StateSelect } from '../../src/modules/loans/shared/StateSelect/StateSelect'
import { CANONICAL_INDIAN_STATES_AND_UTS } from '../../src/shared/services/indianStates'

describe('Loans StateSelect (modeled on GST Amendment select state field)', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders native select with label, placeholder and all 36 canonical states & UTs', () => {
    const handleChange = vi.fn()
    render(
      <StateSelect
        id="test-state"
        label="State / Union Territory"
        placeholder="Select State"
        value=""
        onChange={handleChange}
      />,
    )

    expect(screen.getByLabelText(/State \/ Union Territory/i)).toBeInTheDocument()

    const selectEl = screen.getByRole('combobox', { name: /State \/ Union Territory/i }) as HTMLSelectElement
    expect(selectEl).toBeInTheDocument()
    expect(selectEl.tagName).toBe('SELECT')

    // 1 placeholder option + 36 states/UTs = 37 total options
    expect(selectEl.options).toHaveLength(CANONICAL_INDIAN_STATES_AND_UTS.length + 1)
    expect(selectEl.options[0].text).toBe('Select State')
    expect(selectEl.options[0].value).toBe('')

    // Check specific states exist
    expect(screen.getByRole('option', { name: 'Telangana' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Maharashtra' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Karnataka' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Delhi' })).toBeInTheDocument()
  })

  it('selects option on change and triggers onChange callback', () => {
    const handleChange = vi.fn()
    render(
      <StateSelect
        id="test-state"
        label="State"
        value="Telangana"
        onChange={handleChange}
      />,
    )

    const selectEl = screen.getByRole('combobox', { name: /State/i }) as HTMLSelectElement
    expect(selectEl.value).toBe('Telangana')

    fireEvent.change(selectEl, { target: { value: 'Maharashtra' } })
    expect(handleChange).toHaveBeenCalledWith('Maharashtra')
  })

  it('displays error message and sets aria-invalid when error is provided', () => {
    const handleChange = vi.fn()
    render(
      <StateSelect
        id="test-state"
        label="State"
        value=""
        error="State is required"
        onChange={handleChange}
      />,
    )

    const selectEl = screen.getByRole('combobox', { name: /State/i })
    expect(selectEl).toHaveAttribute('aria-invalid', 'true')
    expect(selectEl).toHaveAttribute('aria-describedby', 'test-state-error')
    expect(screen.getByRole('alert')).toHaveTextContent('State is required')
  })
})
