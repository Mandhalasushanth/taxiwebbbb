import React, { useCallback, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { buildProfileCompletionPath } from '@core/auth'
import { useAuthStore } from '@store/index'
import { CompleteProfileModal } from '@shared/components'
import { LoanMarketplaceHeader } from './LoanMarketplaceHeader'
import { LoanMarketplaceCard } from './LoanMarketplaceCard'
import { LOAN_MARKETPLACE_ITEMS } from '@modules/loans/constants/loanMarketplace.constants'
import { safeNavigateTo, isValidLoanMarketplaceItem } from '@modules/loans/utils/loanMarketplace.utils'
import type { LoanMarketplaceItem } from '@modules/loans/types/loanMarketplace.types'
import { routePaths } from '@core/config'
import './LoanMarketplace.css'

/**
 * Main orchestrator component for the Loan Marketplace page.
 * Implements advanced modular architecture, strict functional separation,
 * and robust exception handling.
 */
export const LoanMarketplace: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [selectedTarget, setSelectedTarget] = useState('')

  // Open the profile prompt when redirected here with { openProfileModal } (e.g. from a loan form)
  const routeState = location.state as { openProfileModal?: boolean; returnTo?: string } | null
  const [handledRouteState, setHandledRouteState] = useState<typeof routeState>(null)
  if (routeState !== handledRouteState) {
    setHandledRouteState(routeState)
    if (routeState?.openProfileModal && !user?.isProfileComplete) {
      setSelectedTarget(routeState.returnTo || '')
      setIsProfileModalOpen(true)
    }
  }

  /**
   * Safe item selection handler with exception handling.
   * If user profile/registration is not complete, prompts with CompleteProfileModal
   * identical to GST services flow.
   */
  const handleLoanSelect = useCallback(
    (item: LoanMarketplaceItem): void => {
      if (!isValidLoanMarketplaceItem(item)) {
        return
      }

      if (!user?.isProfileComplete) {
        setSelectedTarget(item.applyPath)
        setIsProfileModalOpen(true)
      } else {
        safeNavigateTo(navigate, item.applyPath, routePaths.loans)
      }
    },
    [navigate, user?.isProfileComplete]
  )

  const handleConfirmProfile = useCallback(() => {
    setIsProfileModalOpen(false)
    navigate(buildProfileCompletionPath(selectedTarget), {
      state: { returnTo: selectedTarget, mobile: user?.mobile },
    })
  }, [navigate, selectedTarget, user?.mobile])

  const handleCloseModal = useCallback(() => {
    setIsProfileModalOpen(false)
  }, [])

  /**
   * Filters and validates items with error containment.
   */
  const validLoanItems = useMemo((): LoanMarketplaceItem[] => {
    return LOAN_MARKETPLACE_ITEMS.filter((item) => isValidLoanMarketplaceItem(item))
  }, [])

  return (
    <div className="loan-marketplace" data-testid="loan-marketplace-container">
      {/* Static Top Section Header Banner */}
      <LoanMarketplaceHeader />

      {/* Loan Catalog List */}
      <main className="loan-marketplace__list" role="feed" aria-label="Available loan products">
        {validLoanItems.map((item) => (
          <LoanMarketplaceCard
            key={item.id}
            item={item}
            onSelect={handleLoanSelect}
          />
        ))}
      </main>

      {/* Profile Completion Modal matching GST flow */}
      <CompleteProfileModal
        isOpen={isProfileModalOpen}
        onClose={handleCloseModal}
        onCompleteProfile={handleConfirmProfile}
      />
    </div>
  )
}

export default LoanMarketplace
