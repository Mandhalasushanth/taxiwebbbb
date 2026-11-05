import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EmptyState, Loader } from '@shared/components'
import { useAuthStore } from '@store/index'
import { authStorage, buildProfileCompletionPath } from '@core/auth'
import { routePaths } from '@core/config'
import { userStorage, type ApplicationDraft } from '@core/storage/userStorage'
import { deleteServiceDraft } from '@shared/saveDraft'
import { calculateProfileProgress, CompleteProfileCard } from '@modules/profile'
import {
  DashboardHero,
  QuickServices,
  FinancialOverview,
  IncompleteApplicationBanner,
  DashboardOverviewGrid,
} from '../../components'
import { useDashboardSummary } from '../../hooks/useDashboardSummary'
import './CustomerDashboard.css'

export const CustomerDashboard = () => {
  const navigate = useNavigate()
  const storeUser = useAuthStore((state) => state.user)
  const user = storeUser || authStorage.getUser()
  const { percentage, isFullyComplete } = calculateProfileProgress(user)

  const { data, isLoading, error } = useDashboardSummary()
  const [drafts, setDrafts] = useState<ApplicationDraft[]>(() => {
    const all = userStorage.getAllDrafts()
    return [...all].sort((a, b) => (b.savedTimestamp || 0) - (a.savedTimestamp || 0))
  })

  const handleCompleteProfile = () => {
    navigate(buildProfileCompletionPath(routePaths.dashboard), {
      state: { returnTo: routePaths.dashboard, mobile: user?.mobile },
    })
  }

  const handleDiscardDraft = (serviceId: string) => {
    // Also clears the auto-saved copy, so reopening the service starts empty
    deleteServiceDraft(serviceId)
    setDrafts((prev) => prev.filter((d) => d.serviceId !== serviceId))
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

      {/* 3. Your Financial Overview */}
      <FinancialOverview
        stats={data.stats}
        activeCount={data.brief?.activeApplications}
        pendingDocsCount={data.brief?.pendingDocuments}
        paymentDue={data.brief?.paymentDue}
        completedCount={data.brief?.completedServices}
      />

      {/* 4. Incomplete Application Drafts (Only latest 3, alternating Orange / Navy Blue) */}
      {drafts.length > 0 && (
        <div className="incomplete-banners-list">
          {drafts.slice(0, 3).map((draft, index) => (
            <IncompleteApplicationBanner
              key={draft.serviceId}
              draft={draft}
              colorScheme={index % 2 === 0 ? 'orange' : 'navy'}
              onDiscard={handleDiscardDraft}
            />
          ))}
        </div>
      )}

      {/* 5. Overview Grid (Upcoming Deadlines & Applications) */}
      <DashboardOverviewGrid
        applications={data.recentApplications}
        deadlines={data.upcomingDeadlinesList}
      />
    </div>
  )
}

export default CustomerDashboard
