import React, { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronDownIcon } from '../RegistrationIcons/RegistrationIcons'
import { useListboxNavigation } from './useListboxNavigation'
import './RegistrationSelect.css'

export interface RegistrationSelectProps {
  /** Applied to the focusable trigger so <label htmlFor> focuses it */
  id: string
  name: string
  value: string
  placeholder: string
  options: readonly string[]
  icon?: React.ReactNode
  hasError?: boolean
  align?: 'left' | 'right'
  searchable?: boolean
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void
}

const optionId = (selectId: string, index: number) => `${selectId}-option-${index}`

/** Accessible custom select (WAI-ARIA combobox + listbox), operable by mouse, touch and keyboard. */
export const RegistrationSelect: React.FC<RegistrationSelectProps> = ({
  id,
  name,
  value,
  placeholder,
  options,
  icon,
  hasError = false,
  align = 'left',
  searchable = false,
  onChange,
  onBlur,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const listboxId = `${id}-listbox`

  const filteredOptions = searchable && searchQuery.trim()
    ? options.filter((item) => item.toLowerCase().includes(searchQuery.trim().toLowerCase()))
    : options

  const notifyBlur = useCallback(() => {
    onBlur?.({ target: { name, value } } as unknown as React.FocusEvent<HTMLSelectElement>)
  }, [onBlur, name, value])

  /** restoreFocus=false means focus is leaving the control (Tab / outside click): report a blur */
  const handleClose = useCallback(
    (restoreFocus: boolean) => {
      setIsOpen(false)
      setSearchQuery('')
      if (restoreFocus) triggerRef.current?.focus()
      else notifyBlur()
    },
    [notifyBlur],
  )

  const handleSelect = (selectedValue: string) => {
    onChange({ target: { name, value: selectedValue } } as unknown as React.ChangeEvent<HTMLSelectElement>)
    handleClose(true)
  }

  const { activeIndex, setActiveIndex, openAt, handleKeyDown } = useListboxNavigation({
    optionCount: filteredOptions.length,
    isOpen,
    onOpen: () => setIsOpen(true),
    onClose: handleClose,
    onSelectIndex: (index) => handleSelect(filteredOptions[index]),
    selectedIndex: filteredOptions.indexOf(value),
    labels: filteredOptions,
  })

  useEffect(() => {
    if (!isOpen) return undefined
    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        handleClose(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('touchstart', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('touchstart', handleOutsideClick)
    }
  }, [isOpen, handleClose])

  useEffect(() => {
    if (isOpen && searchable) searchInputRef.current?.focus()
  }, [isOpen, searchable])

  // Keep the highlighted option visible while moving with the keyboard
  useEffect(() => {
    if (!isOpen || activeIndex < 0) return
    document.getElementById(optionId(id, activeIndex))?.scrollIntoView?.({ block: 'nearest' })
  }, [isOpen, activeIndex, id])

  const handleTriggerClick = () => {
    if (isOpen) {
      handleClose(true)
      return
    }
    openAt(Math.max(filteredOptions.indexOf(value), 0))
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setActiveIndex(0)
  }

  const handleTriggerBlur = (e: React.FocusEvent<HTMLButtonElement>) => {
    const next = e.relatedTarget as Node | null
    if (!isOpen && !(next && containerRef.current?.contains(next))) notifyBlur()
  }

  const activeDescendant = isOpen && activeIndex >= 0 ? optionId(id, activeIndex) : undefined

  const renderOption = (item: string, index: number) => (
    <li
      key={item}
      id={optionId(id, index)}
      className={[
        'reg-select__item',
        item === value ? 'reg-select__item--selected' : '',
        index === activeIndex ? 'reg-select__item--active' : '',
      ].filter(Boolean).join(' ')}
      onMouseDown={(e) => e.preventDefault()}
      onMouseEnter={() => setActiveIndex(index)}
      onClick={() => handleSelect(item)}
      role="option"
      aria-selected={item === value}
    >
      <span>{item}</span>
      {item === value && (
        <svg className="reg-select__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <polyline points="20 6 9 17 4 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </li>
  )

  return (
    <div className="reg-select" ref={containerRef}>
      {/* Hidden input for DOM/form compliance */}
      <input type="hidden" name={name} value={value} />

      <button
        ref={triggerRef}
        id={id}
        type="button"
        className={`reg-select__trigger ${isOpen ? 'reg-select__trigger--open' : ''} ${
          hasError ? 'reg-select__trigger--error' : ''
        }`}
        onClick={handleTriggerClick}
        onKeyDown={(e) => handleKeyDown(e)}
        onBlur={handleTriggerBlur}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-activedescendant={searchable ? undefined : activeDescendant}
        aria-invalid={hasError}
      >
        {icon && <span className="reg-select__icon" aria-hidden="true">{icon}</span>}
        <span className={`reg-select__value ${!value ? 'reg-select__value--placeholder' : ''}`}>
          {value || placeholder}
        </span>
        <span className={`reg-select__chevron ${isOpen ? 'reg-select__chevron--open' : ''}`} aria-hidden="true">
          <ChevronDownIcon size={15} />
        </span>
      </button>

      {isOpen && (
        <div className={`reg-select__menu reg-select__menu--${align}`}>
          {searchable && (
            <div className="reg-select__search-wrapper">
              <input
                ref={searchInputRef}
                type="text"
                className="reg-select__search-input"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={(e) => handleKeyDown(e, false)}
                onClick={(e) => e.stopPropagation()}
                role="combobox"
                aria-label={`Search ${placeholder.toLowerCase()}`}
                aria-expanded={isOpen}
                aria-controls={listboxId}
                aria-autocomplete="list"
                aria-activedescendant={activeDescendant}
              />
            </div>
          )}

          <ul className="reg-select__list" id={listboxId} role="listbox" aria-label={placeholder}>
            {filteredOptions.length === 0 ? (
              <li className="reg-select__empty" role="presentation">No options found</li>
            ) : (
              filteredOptions.map(renderOption)
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
