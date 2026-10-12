import { useEffect, useState } from 'react'

const ONE_SECOND_MS = 1000

/** Current time, refreshed on an interval (drives live countdowns). */
export const useNow = (intervalMs = ONE_SECOND_MS): Date => {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), intervalMs)
    return () => window.clearInterval(timer)
  }, [intervalMs])

  return now
}
