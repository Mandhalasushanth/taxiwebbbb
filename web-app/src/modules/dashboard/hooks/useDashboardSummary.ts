import { useEffect } from 'react'
import { useAsync } from '@shared/hooks'
import { dashboardService } from '../services/dashboardService'
import type { DashboardSummary } from '../types/dashboard.types'

export const useDashboardSummary = () => {
  const result = useAsync<DashboardSummary>(() => dashboardService.getSummary(), [])

  useEffect(() => {
    const handleUpdate = () => {
      void result.refetch()
    }

    window.addEventListener('taxedge:applications-updated', handleUpdate)
    window.addEventListener('storage', handleUpdate)

    return () => {
      window.removeEventListener('taxedge:applications-updated', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [result.refetch])

  return result
}
