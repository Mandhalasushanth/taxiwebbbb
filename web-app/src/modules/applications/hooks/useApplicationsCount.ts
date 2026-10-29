import { useState, useEffect } from 'react'
import { userStorage } from '@core/storage/userStorage'

/**
 * Returns the live, real-time total applications count across the platform.
 * Synchronizes with userStorage updates and cross-tab storage events.
 */
export const useApplicationsCount = (): number => {
  const [count, setCount] = useState<number>(() => userStorage.getUserApplications().length)

  useEffect(() => {
    const handleUpdate = () => {
      setCount(userStorage.getUserApplications().length)
    }

    handleUpdate()
    window.addEventListener('taxedge:applications-updated', handleUpdate)
    window.addEventListener('storage', handleUpdate)

    return () => {
      window.removeEventListener('taxedge:applications-updated', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [])

  return count
}

