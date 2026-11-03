import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Info, X } from 'lucide-react'

import { classNames } from '../../utils/formatUtils'
import './FieldInfoTooltip.css'

export interface FieldInfoTooltipProps {
  title: string
  description: string
  ariaLabel?: string
  className?: string
}

interface Coords {
  top: number
  left: number
  arrowLeft: number
  placement: 'top' | 'bottom'
}

export const FieldInfoTooltip = ({
  title,
  description,
  ariaLabel,
  className,
}: FieldInfoTooltipProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [coords, setCoords] = useState<Coords | null>(null)

  const triggerRef = useRef<HTMLButtonElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)

  const id = useId()
  const titleId = `field-info-title-${id}`
  const descId = `field-info-desc-${id}`
  const popupId = `field-info-popup-${id}`

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return
    const triggerRect = triggerRef.current.getBoundingClientRect()
    const popupEl = popupRef.current

    const width = popupEl ? popupEl.offsetWidth : 300
    const height = popupEl ? popupEl.offsetHeight : 110

    const gap = 8
    const margin = 12
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // Check vertical space (default to below, flip to above if not enough space below)
    const spaceBelow = viewportHeight - triggerRect.bottom
    const spaceAbove = triggerRect.top
    const placeAbove = spaceBelow < height + gap && spaceAbove > spaceBelow

    const top = placeAbove
      ? Math.max(margin, triggerRect.top - height - gap)
      : triggerRect.bottom + gap

    // Trigger icon horizontal center
    const triggerCenter = triggerRect.left + triggerRect.width / 2

    // Align popup horizontally near trigger icon with natural offset
    let left = triggerCenter - 36
    const maxLeft = Math.max(margin, viewportWidth - width - margin)
    left = Math.max(margin, Math.min(left, maxLeft))

    // Arrow caret position relative to the popup left edge
    let arrowLeft = triggerCenter - left
    arrowLeft = Math.max(14, Math.min(arrowLeft, width - 14))

    setCoords({
      top,
      left,
      arrowLeft,
      placement: placeAbove ? 'top' : 'bottom',
    })
  }, [])

  // Position updates and scroll/resize handling
  useEffect(() => {
    if (!isOpen) return

    updatePosition()

    const handleWindowEvents = () => {
      updatePosition()
    }

    window.addEventListener('resize', handleWindowEvents)
    window.addEventListener('scroll', handleWindowEvents, true)

    return () => {
      window.removeEventListener('resize', handleWindowEvents)
      window.removeEventListener('scroll', handleWindowEvents, true)
    }
  }, [isOpen, updatePosition])

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null
      if (
        target &&
        !triggerRef.current?.contains(target) &&
        !popupRef.current?.contains(target)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        setIsOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleTriggerClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen((prev) => !prev)
  }

  const handleClose = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(false)
    triggerRef.current?.focus()
  }

  return (
    <span className={classNames('field-info-tooltip', className)}>
      <button
        ref={triggerRef}
        type="button"
        className="field-info-tooltip__trigger"
        aria-label={ariaLabel || 'Field information'}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-controls={isOpen ? popupId : undefined}
        onClick={handleTriggerClick}
        onMouseDown={(e) => {
          // Stop propagation to prevent parent label from focusing input
          e.stopPropagation()
        }}
      >
        <Info size={16} className="field-info-tooltip__icon" aria-hidden="true" />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={popupRef}
            id={popupId}
            role="dialog"
            aria-modal="false"
            aria-labelledby={titleId}
            aria-describedby={descId}
            className={classNames(
              'field-info-tooltip__popup',
              coords && `field-info-tooltip__popup--${coords.placement}`
            )}
            style={{
              top: coords ? `${coords.top}px` : undefined,
              left: coords ? `${coords.left}px` : undefined,
              visibility: coords ? 'visible' : 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {coords && (
              <span
                className={classNames(
                  'field-info-tooltip__arrow',
                  `field-info-tooltip__arrow--${coords.placement}`
                )}
                style={{ left: `${coords.arrowLeft}px` }}
                aria-hidden="true"
              />
            )}

            <div className="field-info-tooltip__header">
              <div className="field-info-tooltip__header-lead">
                <span className="field-info-tooltip__header-icon" aria-hidden="true">
                  <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
                    <circle cx="10" cy="10" r="9" fill="#0ea5e9" />
                    <path
                      d="M10 6.5h.01M10 9.5v4"
                      stroke="#ffffff"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <h4 id={titleId} className="field-info-tooltip__title">
                  {title}
                </h4>
              </div>

              <button
                type="button"
                className="field-info-tooltip__close"
                onClick={handleClose}
                aria-label="Close"
              >
                <X size={15} aria-hidden="true" />
              </button>
            </div>

            <p id={descId} className="field-info-tooltip__description">
              {description}
            </p>
          </div>,
          document.body
        )}
    </span>
  )
}
