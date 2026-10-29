import React from 'react'
import { WalletIcon } from '@modules/loans/constants/loanMarketplace.icons'
import type { LoanMarketplaceHeaderProps } from '@modules/loans/types/loanMarketplace.types'

/**
 * Header component for the Loan Marketplace page.
 * Renders the dark blue hero banner with wallet icon and title.
 */
export const LoanMarketplaceHeader: React.FC<LoanMarketplaceHeaderProps> = ({
  eyebrow = 'Capital & Financing',
  title = 'Loan Marketplace & Assistance',
}) => {
  return (
    <div className="loan-marketplace__header-wrapper">
      {/* Hero Header Banner */}
      <section className="loan-marketplace__header-banner" aria-labelledby="loan-banner-title">
        <div className="loan-marketplace__header-content">
          <div className="loan-marketplace__header-main">
            <div className="loan-marketplace__wallet-icon-box" aria-hidden="true">
              <WalletIcon />
            </div>

            <div className="loan-marketplace__header-text">
              <span className="loan-marketplace__eyebrow">{eyebrow}</span>
              <h1 id="loan-banner-title" className="loan-marketplace__heading">{title}</h1>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LoanMarketplaceHeader
