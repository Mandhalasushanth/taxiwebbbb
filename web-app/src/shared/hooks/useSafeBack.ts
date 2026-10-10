import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

/** React Router gives the first entry of a fresh tab (direct URL, refresh) the key "default". */
const FIRST_HISTORY_KEY = 'default'

/**
 * Back navigation that never leaves the app: steps back through in-app history,
 * or goes to `fallback` when the page was opened directly (new tab, bookmark, refresh).
 */
export const useSafeBack = (fallback: string): (() => void) => {
  const navigate = useNavigate()
  const { key } = useLocation()

  return useCallback(() => {
    if (key === FIRST_HISTORY_KEY) {
      navigate(fallback, { replace: true })
      return
    }
    navigate(-1)
  }, [fallback, key, navigate])
}
