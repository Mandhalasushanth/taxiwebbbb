import { useCallback, useState } from 'react'

export interface ListboxNavigationOptions {
  optionCount: number
  isOpen: boolean
  onOpen: (initialIndex: number) => void
  onClose: (restoreFocus: boolean) => void
  onSelectIndex: (index: number) => void
  /** Index of the currently selected option, -1 when none */
  selectedIndex: number
  /** Option labels for type-ahead (first-letter jump) */
  labels: readonly string[]
}

const clampIndex = (index: number, count: number): number => Math.max(0, Math.min(index, count - 1))

/**
 * WAI-ARIA listbox keyboard model for a custom select:
 * ↓/↑ move, Home/End jump, Enter/Space select, Esc closes, Tab closes and moves on,
 * printable characters jump to the next option starting with that letter.
 */
export const useListboxNavigation = ({
  optionCount,
  isOpen,
  onOpen,
  onClose,
  onSelectIndex,
  selectedIndex,
  labels,
}: ListboxNavigationOptions) => {
  const [activeIndex, setActiveIndex] = useState(-1)

  const openAt = useCallback(
    (index: number) => {
      const next = optionCount > 0 ? clampIndex(index, optionCount) : -1
      setActiveIndex(next)
      onOpen(next)
    },
    [optionCount, onOpen],
  )

  const findByFirstLetter = (letter: string): number => {
    const lower = letter.toLowerCase()
    const ordered = labels.map((label, index) => ({ label, index }))
    const after = ordered.filter(({ index }) => index > activeIndex)
    const before = ordered.filter(({ index }) => index <= activeIndex)
    const match = [...after, ...before].find(({ label }) => label.toLowerCase().startsWith(lower))
    return match ? match.index : -1
  }

  const handleClosedKey = (event: React.KeyboardEvent) => {
    const openKeys: Record<string, () => number> = {
      ArrowDown: () => (selectedIndex >= 0 ? selectedIndex : 0),
      ArrowUp: () => (selectedIndex >= 0 ? selectedIndex : optionCount - 1),
      Enter: () => Math.max(selectedIndex, 0),
      ' ': () => Math.max(selectedIndex, 0),
      Home: () => 0,
      End: () => optionCount - 1,
    }
    const resolver = openKeys[event.key]
    if (!resolver) return
    event.preventDefault()
    openAt(resolver())
  }

  const handleOpenKey = (event: React.KeyboardEvent, allowSpaceSelect: boolean) => {
    const moves: Record<string, () => number> = {
      ArrowDown: () => activeIndex + 1,
      ArrowUp: () => activeIndex - 1,
      Home: () => 0,
      End: () => optionCount - 1,
      PageDown: () => activeIndex + 10,
      PageUp: () => activeIndex - 10,
    }

    if (moves[event.key]) {
      event.preventDefault()
      if (optionCount > 0) setActiveIndex(clampIndex(moves[event.key](), optionCount))
      return
    }

    const isSelectKey = event.key === 'Enter' || (allowSpaceSelect && event.key === ' ')
    if (isSelectKey) {
      event.preventDefault()
      if (activeIndex >= 0 && activeIndex < optionCount) onSelectIndex(activeIndex)
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      onClose(true)
      return
    }

    if (event.key === 'Tab') {
      onClose(false)
      return
    }

    const isPrintable = allowSpaceSelect && event.key.length === 1 && /\S/.test(event.key)
    if (isPrintable) {
      const match = findByFirstLetter(event.key)
      if (match >= 0) setActiveIndex(match)
    }
  }

  /**
   * @param allowSpaceSelect false while typing in a search box, where Space and letters are text
   */
  const handleKeyDown = (event: React.KeyboardEvent, allowSpaceSelect = true) => {
    if (isOpen) handleOpenKey(event, allowSpaceSelect)
    else handleClosedKey(event)
  }

  return { activeIndex, setActiveIndex, openAt, handleKeyDown }
}
