import React, { forwardRef, useLayoutEffect, useRef, useState } from 'react'
import { calculateNextCaretPosition } from '../../utils/caretUtils'
import { CustomCalendarPopover } from './CustomCalendarPopover'

export interface CaretInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Optional callback invoked with the calculated target caret */
  onCaretChange?: (caret: number) => void
}

/**
 * CaretInput is a drop-in replacement for standard <input> elements in controlled forms.
 * It prevents the cursor from jumping to the end when state updates transform the text
 * (such as .toUpperCase(), regex masking, or alphanumeric filtering) while the user is
 * editing characters in the middle of a string.
 *
 * When type="date" is passed, it renders a custom calendar popover with Cancel (left)
 * and OK (right) buttons instead of the browser native date picker.
 */
export const CaretInput = forwardRef<HTMLInputElement, CaretInputProps>(
  ({ onChange, value, onCaretChange, type, onClick, min, max, ...props }, forwardedRef) => {
    const internalRef = useRef<HTMLInputElement | null>(null)
    const containerRef = useRef<HTMLDivElement | null>(null)
    const caretSnapshotRef = useRef<{ rawValue: string; caret: number } | null>(null)
    const [isCalendarOpen, setIsCalendarOpen] = useState(false)

    const setRef = (node: HTMLInputElement | null) => {
      internalRef.current = node
      if (node && type === 'date') {
        node.showPicker = () => {
          setIsCalendarOpen(true)
        }
      }
      if (typeof forwardedRef === 'function') {
        forwardedRef(node)
      } else if (forwardedRef) {
        ;(forwardedRef as React.MutableRefObject<HTMLInputElement | null>).current = node
      }
    }

    const restoreCaret = (rawValue: string, caret: number, input: HTMLInputElement) => {
      const targetCaret = calculateNextCaretPosition(rawValue, caret, input.value)
      try {
        input.setSelectionRange(targetCaret, targetCaret)
        onCaretChange?.(targetCaret)
      } catch {
        // Ignored for input types where selectionRange is unsupported (e.g. number/date/file)
      }
    }

    useLayoutEffect(() => {
      const input = internalRef.current
      if (caretSnapshotRef.current && input) {
        const { rawValue, caret } = caretSnapshotRef.current
        caretSnapshotRef.current = null
        restoreCaret(rawValue, caret, input)
      }
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = (e.currentTarget || e.target) as HTMLInputElement
      if (input) {
        const rawValue = input.value
        let caret = rawValue.length
        try {
          if (typeof input.selectionStart === 'number') {
            caret = input.selectionStart
          }
        } catch {
          // Unsupported input types in some browsers
        }
        caretSnapshotRef.current = { rawValue, caret }

        // Additional safeguard for microtasks/event queues
        if (typeof requestAnimationFrame !== 'undefined') {
          requestAnimationFrame(() => {
            if (caretSnapshotRef.current && internalRef.current) {
              const snap = caretSnapshotRef.current
              caretSnapshotRef.current = null
              restoreCaret(snap.rawValue, snap.caret, internalRef.current)
            }
          })
        }
      }
      onChange?.(e)
    }

    if (type === 'date') {
      const handleDatePicked = (selectedStr: string) => {
        if (internalRef.current) {
          internalRef.current.value = selectedStr
        }
        onChange?.({
          target: {
            name: props.name || props.id || '',
            value: selectedStr,
          },
        } as React.ChangeEvent<HTMLInputElement>)
      }

      return (
        <div ref={containerRef} style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
          <input
            {...props}
            ref={setRef}
            type="text"
            value={value}
            onClick={(e) => {
              setIsCalendarOpen(true)
              onClick?.(e)
            }}
            onChange={handleChange}
          />
          <CustomCalendarPopover
            isOpen={isCalendarOpen}
            value={String(value || '')}
            format="YYYY-MM-DD"
            minDate={min as string | undefined}
            maxDate={max as string | undefined}
            anchorRef={containerRef}
            onChange={handleDatePicked}
            onClose={() => setIsCalendarOpen(false)}
          />
        </div>
      )
    }

    return (
      <input
        {...props}
        type={type}
        ref={setRef}
        value={value}
        onChange={handleChange}
      />
    )
  }
)

CaretInput.displayName = 'CaretInput'

export default CaretInput
