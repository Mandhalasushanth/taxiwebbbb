import React, { useCallback } from 'react'
import type { KeyboardEvent } from 'react'
import { Check, ChevronDown, X } from 'lucide-react'
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
    <div className="veh-field" ref={dropdownRef}>
      <label id={labelId} className="veh-field__label" htmlFor={id}>
        {label} {required && <span className="veh-required">*</span>}
      </label>
      <div className="veh-inline-select">
        <button
          id={id}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-labelledby={`${labelId} ${id}`}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`veh-inline-select__trigger${error ? ' veh-inline-select__trigger--error' : ''}${
            isOpen ? ' veh-inline-select__trigger--open' : ''
          }`}
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
        >
          <span className={selectedOption ? 'veh-inline-select__value' : 'veh-inline-select__placeholder'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown size={18} className="veh-inline-select__chevron" aria-hidden="true" />
        </button>

        {isOpen && (
          <div className="veh-inline-select__dropdown-container">
            <div className="veh-inline-select__modal-header">
              <span className="veh-inline-select__modal-title">{label}</span>
              <button
                type="button"
                className="veh-inline-select__close-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsOpen(false)
                }}
                aria-label={`Close ${label}`}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <ul id={listId} className="veh-inline-select__list" role="listbox" aria-labelledby={labelId}>
              {options.map((opt) => {
                const isSelected = opt.value === value
                return (
                  <li
                    key={opt.value}
                    id={`${id}-option-${opt.value.replace(/\W+/g, '-')}`}
                    role="option"
                    aria-selected={isSelected}
                    className={`veh-inline-select__option${isSelected ? ' veh-inline-select__option--selected' : ''}`}
                    onClick={() => choose(opt.value)}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check size={16} aria-hidden="true" />}
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>

      {error && (
        <p id={`${id}-error`} className="veh-field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default InlineSelect
