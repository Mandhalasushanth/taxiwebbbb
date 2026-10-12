import { useCallback, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'

const KEY_OFFSETS: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }

/** Wraps an index into [0, length) so arrow keys cycle through the tabs */
const wrapIndex = (index: number, length: number): number => (index + length) % length

/**
 * WAI-ARIA tabs behaviour: one tab in the tab order, arrow keys move selection and focus.
 * Spread `getTabProps(index)` on each tab button and `onKeyDown` on the tablist.
 */
export const useRovingTabs = (count: number) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      const offset = KEY_OFFSETS[event.key]
      if (offset === undefined || count === 0) return
      event.preventDefault()
      const next = wrapIndex(activeIndex + offset, count)
      setActiveIndex(next)
      tabRefs.current[next]?.focus()
    },
    [activeIndex, count],
  )

  const getTabProps = (index: number) => ({
    ref: (element: HTMLButtonElement | null) => {
      tabRefs.current[index] = element
    },
    type: 'button' as const,
    role: 'tab',
    'aria-selected': index === activeIndex,
    tabIndex: index === activeIndex ? 0 : -1,
    onClick: () => setActiveIndex(index),
  })

  return { activeIndex, onKeyDown, getTabProps }
}
