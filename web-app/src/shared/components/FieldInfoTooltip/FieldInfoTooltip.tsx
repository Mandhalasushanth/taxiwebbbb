import React, {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { Info, X } from 'lucide-react'

import { classNames } from '../../utils/formatUtils'
import './FieldInfoTooltip.css'

export interface FieldInfoTooltipProps {
  title: string
  description?: ReactNode
  ariaLabel?: string
  className?: string
  iconSize?: number
  children?: ReactNode
  placement?: 'auto' | 'right' | 'top' | 'bottom'
}

interface Coords {
  top: number
  left: number
  arrowOffset: number
  placement: 'right' | 'top' | 'bottom'
}

export const FieldInfoTooltip: React.FC<FieldInfoTooltipProps> = ({
  title,
  description,
  ariaLabel,
  className,
  iconSize = 16,
  children,
  placement = 'auto',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [coords, setCoords] = useState<Coords | null>(null)

  const triggerRef = useRef<HTMLButtonElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)

  // Sanitize useId colon tokens (:r0:) for valid CSS selectors and querySelector
  const rawId = useId()
  const id = rawId.replace(/[^a-zA-Z0-9_-]/g, '_')
  const titleId = `field-info-title-${id}`
  const descId = `field-info-desc-${id}`
  const popupId = `field-info-popup-${id}`

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return
    const triggerRect = triggerRef.current.getBoundingClientRect()
    const popupEl = popupRef.current

    const width = popupEl ? popupEl.offsetWidth : 360
    const height = popupEl ? popupEl.offsetHeight : 120

    const gap = 10
    const margin = 12
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // Check if placement should be right (forced or auto when space permits)
    const spaceRight = viewportWidth - triggerRect.right
    const canPlaceRight =
      placement === 'right' ||
      (placement === 'auto' && spaceRight >= width + gap + margin)

    if (canPlaceRight) {
      const left = triggerRect.right + gap
      let top = triggerRect.top + triggerRect.height / 2 - 28
      top = Math.max(margin, Math.min(top, viewportHeight - height - margin))
      const arrowOffset = Math.max(
        14,
        Math.min(triggerRect.top + triggerRect.height / 2 - top, height - 14)
      )

      setCoords({
        top,
        left,
        arrowOffset,
        placement: 'right',
      })
      return
    }

    // Otherwise, place below (or above if forced or space below is tight)
    const spaceBelow = viewportHeight - triggerRect.bottom
    const spaceAbove = triggerRect.top
    const placeAbove =
      placement === 'top' ||
      (placement !== 'bottom' && spaceBelow < height + gap && spaceAbove > spaceBelow)

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
    let arrowOffset = triggerCenter - left
    arrowOffset = Math.max(14, Math.min(arrowOffset, width - 14))

    setCoords({
      top,
      left,
      arrowOffset,
      placement: placeAbove ? 'top' : 'bottom',
    })
  }, [placement])

  // Position updates and scroll/resize handling
  useEffect(() => {
    if (!isOpen) {
      setCoords(null)
      return
    }

    updatePosition()

    const handleWindowEvents = () => {
      updatePosition()
    }

    window.addEventListener('resize', handleWindowEvents, { passive: true })
    window.addEventListener('scroll', handleWindowEvents, { capture: true, passive: true })

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
        document.contains(target) &&
        !triggerRef.current?.contains(target) &&
        !popupRef.current?.contains(target)
      ) {
        setIsOpen(false)
        setCoords(null)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown, { passive: true })

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
        setCoords(null)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleTriggerClick = (e: ReactMouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen((prev) => !prev)
  }

  const handleClose = (e: ReactMouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(false)
    setCoords(null)
    triggerRef.current?.focus()
  }

  const hasBodyContent = Boolean(children ?? description)

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
        onPointerDown={(e) => {
          // Stop propagation to prevent parent label from focusing input on pointer/mouse
          e.stopPropagation()
        }}
        onMouseDown={(e) => {
          // Stop propagation to prevent parent label from focusing input
          e.stopPropagation()
        }}
        onTouchStart={(e) => {
          // Stop propagation to prevent mobile labels from stealing focus
          e.stopPropagation()
        }}
      >
        <Info size={iconSize} className="field-info-tooltip__icon" aria-hidden="true" />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={popupRef}
            id={popupId}
            role="dialog"
            aria-modal="false"
            aria-labelledby={titleId}
            aria-describedby={hasBodyContent ? descId : undefined}
            className={classNames(
              'field-info-tooltip__popup',
              coords && `field-info-tooltip__popup--${coords.placement}`
            )}
            style={{
              top: coords ? `${coords.top}px` : '0px',
              left: coords ? `${coords.left}px` : '0px',
              visibility: coords ? 'visible' : 'hidden',
              pointerEvents: coords ? 'auto' : 'none',
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            {coords && (
              <span
                className={classNames(
                  'field-info-tooltip__arrow',
                  `field-info-tooltip__arrow--${coords.placement}`
                )}
                style={
                  coords.placement === 'right'
                    ? { top: `${coords.arrowOffset}px` }
                    : { left: `${coords.arrowOffset}px` }
                }
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

            {hasBodyContent && (
              <div id={descId} className="field-info-tooltip__description">
                {children ?? description}
              </div>
            )}
          </div>,
          document.body
        )}
    </span>
  )
}
