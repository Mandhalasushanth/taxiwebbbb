import React, { forwardRef, useLayoutEffect, useRef } from 'react'
import { calculateNextCaretPosition } from '../../utils/caretUtils'

export interface CaretInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Optional callback invoked with the calculated target caret */
  onCaretChange?: (caret: number) => void
}

/**
 * CaretInput is a drop-in replacement for standard <input> elements in controlled forms.
 * It prevents the cursor from jumping to the end when state updates transform the text
 * (such as .toUpperCase(), regex masking, or alphanumeric filtering) while the user is
 * editing characters in the middle of a string.
 */
export const CaretInput = forwardRef<HTMLInputElement, CaretInputProps>(
  ({ onChange, value, onCaretChange, ...props }, forwardedRef) => {
    const internalRef = useRef<HTMLInputElement | null>(null)
    const caretSnapshotRef = useRef<{ rawValue: string; caret: number } | null>(null)

    const setRef = (node: HTMLInputElement | null) => {
      internalRef.current = node
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
        const caret = typeof input.selectionStart === 'number' ? input.selectionStart : rawValue.length
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

    return (
      <input
        {...props}
        ref={setRef}
        value={value}
        onChange={handleChange}
      />
    )
  }
)

CaretInput.displayName = 'CaretInput'

export default CaretInput
