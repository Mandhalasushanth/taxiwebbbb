import { Suspense, useEffect } from 'react'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { useAppStore, useAuthStore } from '@store/index'
import { Loader } from '@shared/components'

import { SessionTimeoutManager } from '../providers/SessionTimeoutManager'

import { routeConfig } from './routeConfig'

const router = createBrowserRouter(routeConfig)

// Clear notifications immediately whenever the user navigates between sections
let currentPath = window.location.pathname
router.subscribe((state) => {
  if (state.location.pathname !== currentPath) {
    currentPath = state.location.pathname
    useAppStore.getState().clearToasts()
  }
})

export const AppRouter = () => {
  const bootstrap = useAuthStore((s) => s.bootstrap)

  // Re-hydrate auth state from localStorage on every mount (page refresh)
  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  return (
    <Suspense fallback={<Loader fullPage />}>
      <SessionTimeoutManager />
      <RouterProvider router={router} />
    </Suspense>
  )
}
