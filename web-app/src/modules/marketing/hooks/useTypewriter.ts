import { useEffect, useState } from 'react'
import { prefersReducedMotion } from '../utils/motion'

const TYPE_DELAY_MS = 90
const DELETE_DELAY_MS = 45
const HOLD_DELAY_MS = 1800
const NEXT_WORD_DELAY_MS = 300

interface TypewriterState {
  wordIndex: number
  text: string
  isDeleting: boolean
}

const delayFor = ({ text, isDeleting }: TypewriterState, word: string): number => {
  if (!isDeleting && text === word) return HOLD_DELAY_MS
  if (isDeleting && text === '') return NEXT_WORD_DELAY_MS
  return isDeleting ? DELETE_DELAY_MS : TYPE_DELAY_MS
}

/** One typing step: type → hold → delete → move to the next word */
const nextState = (state: TypewriterState, words: readonly string[]): TypewriterState => {
  const word = words[state.wordIndex]
  if (!state.isDeleting && state.text === word) return { ...state, isDeleting: true }
  if (state.isDeleting && state.text === '') {
    return { wordIndex: (state.wordIndex + 1) % words.length, text: '', isDeleting: false }
  }
  const length = state.text.length + (state.isDeleting ? -1 : 1)
  return { ...state, text: word.slice(0, length) }
}

/**
 * Types and deletes each word in turn. Each step schedules the next with a timeout,
 * so there is no loop. Users who prefer reduced motion see the first word, static.
 */
export const useTypewriter = (words: readonly string[]): string => {
  const [isStatic] = useState(prefersReducedMotion)
  const [state, setState] = useState<TypewriterState>({ wordIndex: 0, text: words[0] ?? '', isDeleting: false })

  useEffect(() => {
    if (isStatic || words.length < 2) return undefined
    const timer = window.setTimeout(
      () => setState((current) => nextState(current, words)),
      delayFor(state, words[state.wordIndex]),
    )
    return () => window.clearTimeout(timer)
  }, [state, words, isStatic])

  return state.text
}
