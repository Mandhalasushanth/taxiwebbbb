import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EmptyState, Loader } from '@shared/components'
import { useAuthStore } from '@store/index'
import { authStorage, buildProfileCompletionPath } from '@core/auth'
import { routePaths } from '@core/config'
import { userStorage, type ApplicationDraft } from '@core/storage/userStorage'
import { calculateProfileProgress, CompleteProfileCard } from '@modules/profile'
import {
  DashboardHero,
  QuickServices,
  IncompleteApplicationBanner,
} from '../../components'
import { useDashboardSummary } from '../../hooks/useDashboardSummary'
import './CustomerDashboard.css'

export const CustomerDashboard = () => {
  const navigate = useNavigate()
  const storeUser = useAuthStore((state) => state.user)
  const user = storeUser || authStorage.getUser()
  const { percentage, isFullyComplete } = calculateProfileProgress(user)

  const { data, isLoading, error } = useDashboardSummary()
  const [drafts] = useState<ApplicationDraft[]>(() => {
    const all = userStorage.getAllDrafts()
    return [...all].sort((a, b) => (b.savedTimestamp || 0) - (a.savedTimestamp || 0))
  })

  const handleCompleteProfile = () => {
    navigate(buildProfileCompletionPath(routePaths.dashboard), {
      state: { returnTo: routePaths.dashboard, mobile: user?.mobile },
    })
  }

  if (isLoading) return <Loader fullPage label="Loading your dashboard" />
  if (error || !data) {
    return <EmptyState title="We could not load your dashboard" description={error ?? undefined} />
  }

  return (
    <div className="dashboard">
      {/* 1. Hero Banner */}
      <DashboardHero userName={user?.fullName || 'User'} brief={data.brief} />

      {/* Complete Profile Card (shown for new/incomplete users) */}
      {!isFullyComplete && (
        <CompleteProfileCard
          progress={percentage}
          onCompleteProfile={handleCompleteProfile}
        />
      )}

      {/* 2. Services Grid */}
      <QuickServices />

      {/* 3. Incomplete Application Drafts (Only latest 2, alternating Orange / Navy Blue) */}
      {drafts.length > 0 && (
        <div className="incomplete-banners-list">
          {drafts.slice(0, 2).map((draft, index) => (
            <IncompleteApplicationBanner
              key={draft.serviceId}
              draft={draft}
              colorScheme={index % 2 === 0 ? 'orange' : 'navy'}
            />
          ))}
        </div>
      )}

      {/* 4. Support Chat Section */}
      <div className="dashboard-support-banner" data-testid="dashboard-support-banner">
        <div className="dashboard-support-banner__left">
          <div className="dashboard-support-banner__icon-wrap">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="#ffffff" aria-hidden="true">
              <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.827 1.39 5.372 3.582 7.025V22l3.65-1.996c.883.242 1.81.373 2.768.373 5.523 0 10-4.145 10-9.258C22 6.145 17.523 2 12 2zm-4 10.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm4 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm4 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z" />
            </svg>
          </div>
          <div className="dashboard-support-banner__text">
            <h3 className="dashboard-support-banner__title">Need Help?</h3>
            <p className="dashboard-support-banner__subtitle">Our experts are available 24/7</p>
          </div>
        </div>
        <button
          type="button"
          className="dashboard-support-banner__chat-btn"
          onClick={() => navigate(routePaths.support)}
          aria-label="Chat with support"
        >
          Chat
        </button>
      </div>
    </div>
  )
}

export default CustomerDashboard
