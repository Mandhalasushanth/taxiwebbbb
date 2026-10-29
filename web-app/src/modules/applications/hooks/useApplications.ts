import { useState, useEffect, useCallback } from 'react'
import { applicationsService } from '../services/applicationsService'
import type { ApplicationsFilters, ApplicationsItem } from '../types/applications.types'

export const useApplications = (filters?: ApplicationsFilters) => {
  const [data, setData] = useState<ApplicationsItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchApps = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await applicationsService.list(filters)
      setData(res)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchApps()

    const handleUpdate = () => {
      fetchApps()
    }

    window.addEventListener('taxedge:applications-updated', handleUpdate)
    window.addEventListener('storage', handleUpdate)

    return () => {
      window.removeEventListener('taxedge:applications-updated', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [fetchApps])

  return { data, isLoading, error, refetch: fetchApps }
}
