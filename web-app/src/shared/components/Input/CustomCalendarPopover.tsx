import React, { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react'
import './CustomCalendarPopover.css'

export interface CustomCalendarPopoverProps {
  isOpen: boolean
  value: string // DD-MM-YYYY or YYYY-MM-DD
  format?: 'DD-MM-YYYY' | 'YYYY-MM-DD'
  onChange: (dateStr: string) => void
  onClose: () => void
  minDate?: Date | string
  maxDate?: Date | string
  anchorRef?: React.RefObject<HTMLElement | null>
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const parseToDate = (val: string): Date | null => {
  if (!val) return null
  const clean = val.trim()
  const iso = clean.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (iso) return new Date(parseInt(iso[1], 10), parseInt(iso[2], 10) - 1, parseInt(iso[3], 10))
  const dmy = clean.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/)
  if (dmy) return new Date(parseInt(dmy[3], 10), parseInt(dmy[2], 10) - 1, parseInt(dmy[1], 10))
  return null
}

const formatDateStr = (d: Date, format: 'DD-MM-YYYY' | 'YYYY-MM-DD'): string => {
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return format === 'DD-MM-YYYY' ? `${dd}-${mm}-${yyyy}` : `${yyyy}-${mm}-${dd}`
}

export const CustomCalendarPopover: React.FC<CustomCalendarPopoverProps> = ({
  isOpen,
  value,
  format,
  onChange,
  onClose,
  minDate,
  maxDate,
  anchorRef,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null)
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null)

  const resolvedFormat = useMemo(() => {
    if (format) return format
    return value && /^\d{4}-\d{2}-\d{2}$/.test(value.trim()) ? 'YYYY-MM-DD' : 'DD-MM-YYYY'
  }, [format, value])

  const parsedMin = useMemo(() => {
    if (!minDate) return new Date(1900, 0, 1)
    return typeof minDate === 'string' ? parseToDate(minDate) || new Date(1900, 0, 1) : minDate
  }, [minDate])

  const parsedMax = useMemo(() => {
    if (!maxDate) return new Date(2100, 11, 31)
    return typeof maxDate === 'string' ? parseToDate(maxDate) || new Date(2100, 11, 31) : maxDate
  }, [maxDate])

  const [selectedDate, setSelectedDate] = useState<Date>(() => parseToDate(value) || new Date())
  const [viewYear, setViewYear] = useState<number>(selectedDate.getFullYear())
  const [viewMonth, setViewMonth] = useState<number>(selectedDate.getMonth())
  const [isYearPicker, setIsYearPicker] = useState<boolean>(false)

  useEffect(() => {
    if (isOpen) {
      const d = parseToDate(value) || new Date()
      setSelectedDate(d)
      setViewYear(d.getFullYear())
      setViewMonth(d.getMonth())
      setIsYearPicker(false)
    }
  }, [isOpen, value])

  // Compute popover position directly above or below the anchor field
  useLayoutEffect(() => {
    if (!isOpen) return

    const updatePosition = () => {
      if (!anchorRef?.current) {
        setCoords(null)
        return
      }

      const rect = anchorRef.current.getBoundingClientRect()
      const popoverWidth = 310
      const popoverHeight = 390
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top

      // Open on top if insufficient space below and more space above
      let top: number
      if (spaceBelow < popoverHeight && spaceAbove > spaceBelow) {
        top = Math.max(8, rect.top - popoverHeight - 6)
      } else {
        top = rect.bottom + 6
      }

      // Keep horizontal alignment within viewport
      let left = rect.left
      const maxLeft = window.innerWidth - popoverWidth - 12
      if (left > maxLeft) {
        left = Math.max(12, maxLeft)
      }
      if (left < 12) {
        left = 12
      }

      setCoords({ top, left })
    }

    updatePosition()
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [isOpen, anchorRef, isYearPicker])

  // Handle outside click & Escape key without any backdrop overlay
  useEffect(() => {
    if (!isOpen) return

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement | null
      if (popoverRef.current?.contains(target as Node) || anchorRef?.current?.contains(target as Node)) {
        return
      }
      onClose()
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleOutsideClick, true)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick, true)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose, anchorRef])

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((y) => y - 1)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((y) => y + 1)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  const handleDayClick = (day: number) => {
    const next = new Date(viewYear, viewMonth, day)
    setSelectedDate(next)
  }

  const handleApply = () => {
    onChange(formatDateStr(selectedDate, resolvedFormat))
    onClose()
  }

  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay() // 0 = Sun
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const yearsList = useMemo(() => {
    const list: number[] = []
    const minY = parsedMin.getFullYear()
    const maxY = parsedMax.getFullYear()
    for (let y = maxY; y >= minY; y--) list.push(y)
    return list
  }, [parsedMin, parsedMax])

  if (!isOpen) return null

  const popoverStyle: React.CSSProperties = coords
    ? {
        top: `${coords.top}px`,
        left: `${coords.left}px`,
      }
    : {
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
      }

  return (
    <div
      ref={popoverRef}
      className="custom-cal-popover-card"
      style={popoverStyle}
      role="dialog"
      aria-label="Choose date"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Blue Header: Selected Year button & Selected Weekday + Date */}
      <div className="custom-cal-card-header">
        <button
          type="button"
          className="custom-cal-header-year-btn"
          onClick={() => setIsYearPicker((prev) => !prev)}
          title="Select year"
        >
          {selectedDate.getFullYear()}
        </button>
        <div className="custom-cal-header-date-title">
          {WEEKDAYS[selectedDate.getDay()]}, {selectedDate.getDate()} {SHORT_MONTHS[selectedDate.getMonth()]}
        </div>
      </div>

      {/* Body: Year list or Month calendar */}
      {isYearPicker ? (
        <div className="custom-cal-year-list">
          {yearsList.map((y) => (
            <button
              key={y}
              type="button"
              className={`custom-cal-year-item-btn ${y === viewYear ? 'custom-cal-year-item-btn--active' : ''}`}
              onClick={() => {
                setViewYear(y)
                setSelectedDate(new Date(y, selectedDate.getMonth(), selectedDate.getDate()))
                setIsYearPicker(false)
              }}
            >
              {y}
            </button>
          ))}
        </div>
      ) : (
        <div className="custom-cal-card-body">
          {/* Month & Arrow navigation */}
          <div className="custom-cal-month-nav">
            <button
              type="button"
              className="custom-cal-nav-btn"
              onClick={handlePrevMonth}
              aria-label="Previous month"
            >
              &lsaquo;
            </button>
            <span className="custom-cal-month-title">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              className="custom-cal-nav-btn"
              onClick={handleNextMonth}
              aria-label="Next month"
            >
              &rsaquo;
            </button>
          </div>

          {/* Weekdays Header: S M T W T F S */}
          <div className="custom-cal-weekdays-row">
            {DAY_LETTERS.map((letter, idx) => (
              <span key={`${letter}-${idx}`} className="custom-cal-weekday-label">
                {letter}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="custom-cal-days-grid">
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="custom-cal-day-cell" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const isSelected =
                selectedDate.getDate() === day &&
                selectedDate.getMonth() === viewMonth &&
                selectedDate.getFullYear() === viewYear
              const currentDayDate = new Date(viewYear, viewMonth, day)
              const isDisabled = currentDayDate < parsedMin || currentDayDate > parsedMax

              return (
                <div key={`cell-${day}`} className="custom-cal-day-cell">
                  <button
                    type="button"
                    className={`custom-cal-day-btn ${isSelected ? 'custom-cal-day-btn--selected' : ''}`}
                    onClick={() => handleDayClick(day)}
                    disabled={isDisabled}
                  >
                    {day}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Footer Actions: CANCEL and OK on the right */}
      <div className="custom-cal-footer-actions">
        <button
          type="button"
          className="custom-cal-action-btn"
          onClick={onClose}
        >
          CANCEL
        </button>
        <button
          type="button"
          className="custom-cal-action-btn"
          onClick={handleApply}
        >
          OK
        </button>
      </div>
    </div>
  )
}

export default CustomCalendarPopover

