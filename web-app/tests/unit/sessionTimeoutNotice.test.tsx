// @vitest-environment jsdom
process.env.VITE_API_BASE_URL = 'http://localhost:3000'

import '@testing-library/jest-dom/vitest'
import { afterEach, describe, it, expect } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { authService } from '../../src/core/auth'
import { useAuthStore } from '../../src/store/auth/authStore'
import { SignInCard } from '../../src/modules/authentication/components/SignInCard/SignInCard'

afterEach(cleanup)

const NOTICE = /Automatic session timeout/

const renderLogin = () =>
  render(
    <MemoryRouter>
      <SignInCard />
    </MemoryRouter>,
  )

describe('Session timeout notice', () => {
  it('shows once right after a timeout, then not on later visits', () => {
    useAuthStore.getState().expireSession('timeout')
    renderLogin()
    expect(screen.getByRole('alert')).toHaveTextContent(NOTICE)
    expect(useAuthStore.getState().sessionEndReason).toBeNull()
    expect(authService.getSessionEndReason()).toBeNull()

    cleanup()
    renderLogin()
    expect(screen.queryByText(NOTICE)).not.toBeInTheDocument()
  })

  it('is not shown after a normal sign-out', () => {
    useAuthStore.getState().signOut()
    renderLogin()
    expect(screen.queryByText(NOTICE)).not.toBeInTheDocument()
  })
})
