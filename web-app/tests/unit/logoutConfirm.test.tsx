// @vitest-environment jsdom
process.env.VITE_API_BASE_URL = 'http://localhost:3000'

import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { LogoutConfirmModal } from '../../src/shared/components/LogoutConfirmModal/LogoutConfirmModal'
import { useLogoutConfirm } from '../../src/modules/authentication/hooks/useLogoutConfirm'
import { authFlowService } from '../../src/modules/authentication/services/authFlowService'
import { useAuthStore } from '../../src/store/auth/authStore'

afterEach(cleanup)

const SESSION = {
  user: { id: 'usr_1', fullName: 'Sushanth', email: 's@x.in', mobile: '9823145672', role: 'CUSTOMER', permissions: [], isProfileComplete: true },
  tokens: { accessToken: 'tok', refreshToken: 'ref' },
} as const

const Harness = () => {
  const logout = useLogoutConfirm()
  return (
    <>
      <button onClick={logout.requestLogout}>Log out</button>
      <LogoutConfirmModal
        isOpen={logout.isConfirmOpen}
        isLoggingOut={logout.isLoggingOut}
        onConfirm={logout.confirmLogout}
        onCancel={logout.cancelLogout}
      />
    </>
  )
}

const renderHarness = () =>
  render(
    <MemoryRouter>
      <Harness />
    </MemoryRouter>,
  )

describe('Logout confirmation', () => {
  beforeEach(() => {
    vi.spyOn(authFlowService, 'logout').mockResolvedValue()
    useAuthStore.getState().signIn(SESSION as never)
  })

  it('asks before logging out and Cancel keeps the user signed in', () => {
    renderHarness()
    fireEvent.click(screen.getByRole('button', { name: 'Log out' }))
    const dialog = screen.getByRole('alertdialog', { name: 'Log out?' })
    expect(dialog).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus()

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
  })

  it('Escape also cancels', () => {
    renderHarness()
    fireEvent.click(screen.getByRole('button', { name: 'Log out' }))
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
  })

  it('confirming logs the user out', async () => {
    renderHarness()
    fireEvent.click(screen.getByRole('button', { name: 'Log out' }))
    const confirmButton = screen.getAllByRole('button', { name: /Log out/ }).at(-1) as HTMLElement
    fireEvent.click(confirmButton)
    await waitFor(() => expect(useAuthStore.getState().isAuthenticated).toBe(false))
    expect(authFlowService.logout).toHaveBeenCalled()
  })
})
