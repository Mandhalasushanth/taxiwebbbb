import type { NavigateFunction } from 'react-router-dom'
import type { LoanMarketplaceItem } from '@modules/loans/types/loanMarketplace.types'

/**
 * Navigates to a route path or history delta; empty paths go to `fallback`.
 */
export function safeNavigateTo(
  navigate: NavigateFunction,
  destination: string | number,
  fallback: string = '/loans'
): void {
  if (typeof destination === 'number') {
    try {
      navigate(destination)
    } catch {
      try {
        navigate(fallback)
      } catch {
        // ignore secondary failure
      }
    }
    return
  }
  const target = destination.trim() ? destination : fallback
  try {
    navigate(target)
  } catch {
    try {
      navigate(fallback)
    } catch {
      // ignore secondary failure
    }
  }
}

/**
 * Checks whether an object has the required LoanMarketplaceItem shape.
 */
export function isValidLoanMarketplaceItem(item: unknown): item is LoanMarketplaceItem {
  const candidate = item && typeof item === 'object' ? (item as Partial<LoanMarketplaceItem>) : null
  return Boolean(
    candidate &&
      typeof candidate.id === 'string' &&
      typeof candidate.title === 'string' &&
      typeof candidate.applyPath === 'string' &&
      typeof candidate.rate === 'string'
  )
}

/**
 * Generates an accessible ARIA label for screen readers.
 */
export function buildLoanCardAriaLabel(title: string, rate: string, desc: string): string {
  return `${title}, starting from ${rate}. ${desc}`
}
