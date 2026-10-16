import React, { useCallback } from 'react'
import type { KeyboardEvent } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { useDropdown } from '@modules/loans/hooks/useDropdown'
import './InlineSelect.css'

export interface SelectOption {
  value: string
  label: string
}

export interface InlineSelectProps {
  id: string
  label: string
  options: readonly SelectOption[]
  value?: string
  placeholder?: string
  required?: boolean
  error?: string
  onChange: (value: string) => void
}

/** Dropdown whose list opens directly below the field (not a centred popup) */
export const InlineSelect: React.FC<InlineSelectProps> = ({
  id,
  label,
  options,
  value = '',
  placeholder = 'Select option',
  required = true,
  error,
  onChange,
}) => {
  const { isOpen, setIsOpen, dropdownRef } = useDropdown()
  const selectedOption = options.find((opt) => opt.value === value)
  const labelId = `${id}-label`
  const listId = `${id}-list`

  const choose = useCallback(
    (next: string) => {
      onChange(next)
      setIsOpen(false)
    },
    [onChange, setIsOpen],
  )

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const index = options.findIndex((opt) => opt.value === value)
    const moves: Record<string, number> = { ArrowDown: 1, ArrowUp: -1 }
    if (event.key === 'Escape') {
      setIsOpen(false)
      return
    }
    if (!(event.key in moves)) return
    event.preventDefault()
    const nextIndex = Math.min(Math.max(index + moves[event.key], 0), options.length - 1)
    onChange(options[nextIndex].value)
    setIsOpen(true)
  }

  return (
    <div className="pl-field" ref={dropdownRef}>
      <label id={labelId} className="pl-field__label" htmlFor={id}>
        {label} {required && <span className="pl-required">*</span>}
      </label>
      <div className="pl-inline-select">
        <button
          id={id}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-labelledby={`${labelId} ${id}`}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`pl-inline-select__trigger${error ? ' pl-inline-select__trigger--error' : ''}${
            isOpen ? ' pl-inline-select__trigger--open' : ''
          }`}
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
        >
          <span className={selectedOption ? 'pl-inline-select__value' : 'pl-inline-select__placeholder'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown size={18} className="pl-inline-select__chevron" aria-hidden="true" />
        </button>

        {isOpen && (
          <ul id={listId} className="pl-inline-select__list" role="listbox" aria-labelledby={labelId}>
            {options.map((opt) => {
              const isSelected = opt.value === value
              return (
                <li
                  key={opt.value}
                  id={`${id}-option-${opt.value.replace(/\W+/g, '-')}`}
                  role="option"
                  aria-selected={isSelected}
                  className={`pl-inline-select__option${isSelected ? ' pl-inline-select__option--selected' : ''}`}
                  onClick={() => choose(opt.value)}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check size={16} aria-hidden="true" />}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {error && (
        <p id={`${id}-error`} className="pl-field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default InlineSelect
