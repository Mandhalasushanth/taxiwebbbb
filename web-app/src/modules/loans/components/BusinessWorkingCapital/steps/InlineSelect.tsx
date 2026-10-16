import React, { useCallback } from 'react'
import type { KeyboardEvent } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { useDropdown } from '@modules/loans/hooks/useDropdown'
import type { SelectOption } from '@modules/loans/types/businessWorkingCapital.types'
import './InlineSelect.css'

export interface InlineSelectProps {
  id: string
  label: string
  placeholder: string
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
}

const optionId = (id: string, value: string) => `${id}-option-${value.replace(/\W+/g, '-')}`

/** Dropdown whose list opens directly below the field (not a centred popup) */
export const InlineSelect: React.FC<InlineSelectProps> = ({
  id,
  label,
  placeholder,
  options,
  value,
  onChange,
  error,
  required = true,
}) => {
  const { isOpen, setIsOpen, dropdownRef } = useDropdown()
  const selected = options.find((option) => option.value === value)
  const labelId = `${id}-label`
  const listId = `${id}-list`

  const choose = useCallback(
    (next: string) => {
      onChange(next)
      setIsOpen(false)
    },
    [onChange, setIsOpen],
  )

  const bufferRef = React.useRef('')
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const index = options.findIndex((option) => option.value === value)
    const moves: Record<string, number> = { ArrowDown: 1, ArrowUp: -1 }
    if (event.key === 'Escape') return setIsOpen(false)
    if (event.key in moves) {
      event.preventDefault()
      const nextIndex = Math.min(Math.max(index + moves[event.key], 0), options.length - 1)
      onChange(options[nextIndex].value)
      return setIsOpen(true)
    }
    // Alphabet navigation (type-ahead)
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey && event.key !== ' ') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      bufferRef.current += event.key.toLowerCase()
      const query = bufferRef.current
      const match = options.find(
        (opt) =>
          opt.label.toLowerCase().startsWith(query) ||
          opt.value.toLowerCase().startsWith(query)
      )
      if (match) {
        onChange(match.value)
        setIsOpen(true)
      } else {
        const singleMatch = options.find(
          (opt) =>
            opt.label.toLowerCase().startsWith(event.key.toLowerCase()) ||
            opt.value.toLowerCase().startsWith(event.key.toLowerCase())
        )
        if (singleMatch) {
          bufferRef.current = event.key.toLowerCase()
          onChange(singleMatch.value)
          setIsOpen(true)
        }
      }
      timeoutRef.current = setTimeout(() => {
        bufferRef.current = ''
      }, 700)
    }
  }

  return (
    <div className="bwc-field" ref={dropdownRef}>
      <span id={labelId} className="bwc-field__label">
        {label} {required && <span className="bwc-required">*</span>}
      </span>
      <div className="bwc-inline-select">
        <button
          id={id}
          type="button"
          className={`bwc-inline-select__trigger${error ? ' bwc-inline-select__trigger--error' : ''}${isOpen ? ' bwc-inline-select__trigger--open' : ''}`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-labelledby={`${labelId} ${id}`}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
        >
          <span className={selected ? 'bwc-inline-select__value' : 'bwc-inline-select__placeholder'}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown className="bwc-inline-select__chevron" size={20} aria-hidden="true" />
        </button>

        {isOpen && (
          <ul id={listId} className="bwc-inline-select__list" role="listbox" aria-labelledby={labelId}>
            {options.map((option) => {
              const isSelected = option.value === value
              return (
                <li
                  key={option.value}
                  id={optionId(id, option.value)}
                  role="option"
                  aria-selected={isSelected}
                  className={`bwc-inline-select__option${isSelected ? ' bwc-inline-select__option--selected' : ''}`}
                  onClick={() => choose(option.value)}
                >
                  <span>{option.label}</span>
                  {isSelected && <Check size={16} aria-hidden="true" />}
                </li>
              )
            })}
          </ul>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="bwc-field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default InlineSelect
