// @vitest-environment jsdom
process.env.VITE_API_BASE_URL = 'http://localhost:3000'

import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Suspense } from 'react'
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'

import { routeConfig } from '@app/router/routeConfig'
import { authStorage } from '@core/auth'
import { routePaths } from '@core/config'
import { localStore } from '@core/storage/localStorage'
import { useAuthStore } from '@store/index'

const SIGNED_IN_USER = {
  id: 'usr_back_guard',
  fullName: 'Ravi Kumar',
  email: 'ravi@example.com',
  mobile: '9823145672',
  role: 'CUSTOMER' as const,
  isProfileComplete: true,
}

const LAZY_TIMEOUT_MS = 15000
/** Whole-test budget: rendering the full route tree is slow when the suite runs in parallel */
const ROUTE_TEST_TIMEOUT_MS = 30000

/** History as it is right after login: the marketing page, then the dashboard (login was replaced) */
const renderSignedInDashboard = async () => {
  const router = createMemoryRouter(routeConfig, {
    initialEntries: [routePaths.marketing.home, routePaths.dashboard],
    initialIndex: 1,
  })
  render(
    <Suspense fallback={null}>
      <RouterProvider router={router} />
    </Suspense>,
  )
  await screen.findByRole('button', { name: /Log out/ }, { timeout: LAZY_TIMEOUT_MS })
  return router
}

const pressBrowserBack = async (router: ReturnType<typeof createMemoryRouter>) => {
  await act(async () => {
    await router.navigate(-1)
  })
}

describe('Browser Back from the dashboard', { timeout: ROUTE_TEST_TIMEOUT_MS }, () => {
  beforeEach(() => {
    localStore.clear()
    authStorage.setUser(SIGNED_IN_USER)
    useAuthStore.getState().bootstrap()
  })

  afterEach(cleanup)

  it('asks to log out instead of leaving for the marketing site', async () => {
    const router = await renderSignedInDashboard()
    await pressBrowserBack(router)

    expect(await screen.findByRole('alertdialog', { name: 'Log out?' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe(routePaths.dashboard)
  })

  it('Cancel keeps the user signed in on the dashboard', async () => {
    const router = await renderSignedInDashboard()
    await pressBrowserBack(router)
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))

    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
    expect(router.state.location.pathname).toBe(routePaths.dashboard)
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
  })

  it('Log out ends the session and opens the login page', async () => {
    const router = await renderSignedInDashboard()
    await pressBrowserBack(router)
    const dialog = await screen.findByRole('alertdialog', { name: 'Log out?' })
    const confirm = Array.from(dialog.querySelectorAll('button')).find((button) => /Log out/.test(button.textContent ?? ''))
    await userEvent.click(confirm as HTMLButtonElement)

    await waitFor(() => expect(router.state.location.pathname).toBe(routePaths.auth.login))
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })

  it('does not interfere with normal in-app navigation', async () => {
    const router = await renderSignedInDashboard()
    await act(async () => {
      await router.navigate(routePaths.profile)
    })
    await pressBrowserBack(router)

    expect(router.state.location.pathname).toBe(routePaths.dashboard)
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })
})
