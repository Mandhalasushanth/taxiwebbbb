import type { ReactNode } from 'react'

/**
 * Definition of a single loan product card displayed in the marketplace.
 */
export interface LoanMarketplaceItem {
  id: string
  title: string
  desc: string
  rate?: string
  applyPath: string
  tileBg: string
  tileBorder: string
  icon: ReactNode
  badgeText?: string
  ariaLabel?: string
}

/**
 * Props for the header banner of the Loan Marketplace.
 */
export interface LoanMarketplaceHeaderProps {
  onBackClick?: () => void
  eyebrow?: string
  title?: string
}

/**
 * Props for individual loan marketplace item card.
 */
export interface LoanMarketplaceCardProps {
  item: LoanMarketplaceItem
  onSelect?: (item: LoanMarketplaceItem) => void
}
