import { useEffect } from 'react'
import type { PageMeta } from '../types/marketing.types'

const DESCRIPTION_SELECTOR = 'meta[name="description"]'

const readDescription = (): string => document.querySelector(DESCRIPTION_SELECTOR)?.getAttribute('content') ?? ''

const writeDescription = (content: string): void => {
  document.querySelector(DESCRIPTION_SELECTOR)?.setAttribute('content', content)
}

/** Sets the document title and meta description for a marketing page, restoring both on leave. */
export const usePageMeta = ({ title, description }: PageMeta): void => {
  useEffect(() => {
    const previousTitle = document.title
    const previousDescription = readDescription()
    document.title = title
    writeDescription(description)

    return () => {
      document.title = previousTitle
      writeDescription(previousDescription)
    }
  }, [title, description])
}
