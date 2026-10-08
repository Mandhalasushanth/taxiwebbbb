import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import './DobDatePickerModal.css'

export interface DobDatePickerModalProps {
  isOpen: boolean
  value: string // Format: DD-MM-YYYY
  onApply: (formattedDate: string) => void
  onClose: () => void
  maxDate?: Date
  minDate?: Date
}

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

import { DobCalendarGrid } from './DobCalendarGrid'

export const DobDatePickerModal: React.FC<DobDatePickerModalProps> = ({
  isOpen,
  value,
  onApply,
  onClose,
  maxDate = new Date(),
  minDate = new Date(1900, 0, 1),
}) => {
  const containerRef = useRef<HTMLDivElement>(null)

  const parseDate = useCallback((val: string): Date | null => {
    const match = val.match(/^(\d{2})-(\d{2})-(\d{4})$/)
    if (!match) return null
    const day = parseInt(match[1], 10)
    const month = parseInt(match[2], 10) - 1
    const year = parseInt(match[3], 10)
    const d = new Date(year, month, day)
    if (d.getFullYear() === year && d.getMonth() === month && d.getDate() === day) {
      return d
    }
    return null
  }, [])

  const initialDate = useMemo(() => parseDate(value), [value, parseDate])

  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate)
  const [viewYear, setViewYear] = useState<number>(() => {
    if (initialDate) return initialDate.getFullYear()
    return 2000
  })
  const [viewMonth, setViewMonth] = useState<number>(() => {
    if (initialDate) return initialDate.getMonth()
    return 0
  })

  useEffect(() => {
    if (isOpen) {
      const parsed = parseDate(value)
      if (parsed) {
        setSelectedDate(parsed)
        setViewYear(parsed.getFullYear())
        setViewMonth(parsed.getMonth())
      } else {
        setSelectedDate(null)
        setViewYear(2000)
        setViewMonth(0)
      }
    }
  }, [isOpen, value, parseDate])

  useEffect(() => {
    if (!isOpen) return

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement | null
      if (target?.closest?.('.reg-field__picker-btn')) return
      if (containerRef.current && !containerRef.current.contains(target as Node)) {
        onClose()
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleOutsideClick)
      document.addEventListener('touchstart', handleOutsideClick)
      window.addEventListener('keydown', handleKeyDown)
    }, 0)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('touchstart', handleOutsideClick)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((prev) => prev - 1)
    } else {
      setViewMonth((prev) => prev - 1)
    }
  }

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((prev) => prev + 1)
    } else {
      setViewMonth((prev) => prev + 1)
    }
  }

  const handleJumpYear = (delta: number) => {
    setViewYear((prev) => {
      const next = prev + delta
      return Math.max(minDate.getFullYear(), Math.min(maxDate.getFullYear(), next))
    })
  }

  const daysInMonth = useMemo(() => {
    return new Date(viewYear, viewMonth + 1, 0).getDate()
  }, [viewYear, viewMonth])

  const firstDayOfWeek = useMemo(() => {
    return new Date(viewYear, viewMonth, 1).getDay()
  }, [viewYear, viewMonth])

  const handleSelectDay = (day: number) => {
    const candidate = new Date(viewYear, viewMonth, day, 23, 59, 59)
    if (candidate > maxDate) return
    const candidateStart = new Date(viewYear, viewMonth, day, 0, 0, 0)
    if (candidateStart < minDate) return
    setSelectedDate(new Date(viewYear, viewMonth, day))
  }

  const handleApply = () => {
    if (!selectedDate) return
    const dd = String(selectedDate.getDate()).padStart(2, '0')
    const mm = String(selectedDate.getMonth() + 1).padStart(2, '0')
    const yyyy = selectedDate.getFullYear()
    onApply(`${dd}-${mm}-${yyyy}`)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      ref={containerRef}
      className="dob-popover"
      role="dialog"
      aria-modal="false"
      aria-labelledby="dob-popover-title"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="dob-popover__header">
        <h4 id="dob-popover-title" className="dob-popover__title">
          Select Date of Birth
        </h4>
        <button
          type="button"
          className="dob-popover__close-btn"
          onClick={onClose}
          aria-label="Close calendar"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="dob-popover__nav-bar">
        <button
          type="button"
          className="dob-popover__nav-arrow"
          onClick={handlePrevMonth}
          aria-label="Previous month"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <span className="dob-popover__nav-label">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>

        <button
          type="button"
          className="dob-popover__nav-arrow"
          onClick={handleNextMonth}
          aria-label="Next month"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <div className="dob-popover__jump-row">
        <button type="button" className="dob-popover__jump-btn" onClick={() => handleJumpYear(-10)}>-10 Yrs</button>
        <button type="button" className="dob-popover__jump-btn" onClick={() => handleJumpYear(-5)}>-5 Yrs</button>
        <button type="button" className="dob-popover__jump-btn" onClick={() => handleJumpYear(5)}>+5 Yrs</button>
        <button type="button" className="dob-popover__jump-btn" onClick={() => handleJumpYear(10)}>+10 Yrs</button>
      </div>

      <DobCalendarGrid
        viewYear={viewYear}
        viewMonth={viewMonth}
        daysInMonth={daysInMonth}
        firstDayOfWeek={firstDayOfWeek}
        selectedDate={selectedDate}
        maxDate={maxDate}
        minDate={minDate}
        onSelectDay={handleSelectDay}
      />

      {/* Action Buttons */}
      <div className="dob-popover__actions">
        <button
          type="button"
          className="dob-popover__btn-cancel"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          className="dob-popover__btn-apply"
          onClick={handleApply}
          disabled={!selectedDate}
        >
          Apply Date
        </button>
      </div>
    </div>
  )
}
