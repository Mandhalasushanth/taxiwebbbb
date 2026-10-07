import { useState } from 'react'
import { EmptyState, Loader } from '@shared/components'
import { useAuthStore } from '@store/index'
import { userStorage, type ApplicationDraft } from '@core/storage/userStorage'
import { deleteServiceDraft } from '@shared/saveDraft'
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
  const user = useAuthStore((state) => state.user)
  const { data, isLoading, error } = useDashboardSummary()
  const [drafts, setDrafts] = useState<ApplicationDraft[]>(() => {
    const all = userStorage.getAllDrafts()
    return [...all].sort((a, b) => (b.savedTimestamp || 0) - (a.savedTimestamp || 0))
  })

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

      {/* 2. Services Grid */}
      <QuickServices />

      {/* 3. Your Financial Overview */}
      <FinancialOverview
        stats={data.stats}
        activeCount={data.brief?.activeApplications}
        paymentDue={data.brief?.paymentDue}
      />

      {/* 4. Incomplete Application Drafts (Supports Multiple Drafts matching Mobile View) */}
      {drafts.length > 0 && (
        <div className="incomplete-banners-list">
          {drafts.map((draft) => (
            <IncompleteApplicationBanner
              key={draft.serviceId}
              draft={draft}
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

