// @vitest-environment jsdom
process.env.VITE_API_BASE_URL = 'http://localhost:3000'

import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, describe, it, expect } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { authStorage, buildProfileCompletionPath, resolvePostLoginPath } from '../../src/core/auth'
import { maskAadhaar } from '../../src/shared/utils'
import { legalRoutes } from '../../src/modules/legal'
import { RegistrationSecurityFields } from '../../src/modules/authentication/components/RegistrationSecurityFields/RegistrationSecurityFields'
import { authFlowService } from '../../src/modules/authentication/services/authFlowService'
import {
  DuplicateIdentityError,
  DUPLICATE_MESSAGES,
  findIdentityConflicts,
} from '../../src/modules/authentication/services/identityRegistry'

afterEach(cleanup)

describe('BUG-CP-011: Terms and Privacy links', () => {
  it('serves both policies on public routes', () => {
    const paths = ['/legal/terms', '/legal/privacy']
    const titles = paths.map((path) => {
      render(
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            {legalRoutes.map((route) => <Route key={route.path} path={route.path} element={route.element} />)}
          </Routes>
        </MemoryRouter>,
      )
      const title = screen.getByRole('heading', { level: 1 }).textContent
      cleanup()
      return title
    })
    expect(titles).toEqual(['Terms of Service', 'Privacy Policy'])
  })

  it('opens the policy in a dialog from the registration form', () => {
    render(
      <MemoryRouter>
        <RegistrationSecurityFields
          values={{ password: '', confirmPassword: '', agreeTerms: false }}
          errors={{}}
          isFormValid={false}
          isSubmitting={false}
          onChange={() => undefined}
          onToggleTerms={() => undefined}
        />
      </MemoryRouter>,
    )
    const termsLink = screen.getByRole('link', { name: 'Terms of Service' })
    expect(termsLink).toHaveAttribute('href', '/legal/terms')
    fireEvent.click(termsLink)
    expect(screen.getByRole('dialog')).toHaveTextContent('Your account')
  })
})

describe('BUG-CP-012: Aadhaar masking', () => {
  it('shows only the last 4 digits', () => {
    expect(maskAadhaar('234567890124')).toBe('XXXX XXXX 0124')
    expect(maskAadhaar('2345 6789 0124')).toBe('XXXX XXXX 0124')
    expect(maskAadhaar(undefined)).toBe('—')
  })
})

describe('BUG-CP-013: return to the chosen service after completing the profile', () => {
  it('carries the service path through the profile URL', () => {
    const path = buildProfileCompletionPath('/gst/registration')
    expect(path).toBe('/auth/register?redirect=%2Fgst%2Fregistration')
    const search = path.slice(path.indexOf('?'))
    expect(resolvePostLoginPath(search, null, '/dashboard')).toBe('/gst/registration')
  })

  it('falls back to the plain profile URL for unsafe targets', () => {
    expect(buildProfileCompletionPath('//evil.com')).toBe('/auth/register')
    expect(buildProfileCompletionPath('')).toBe('/auth/register')
  })
})

describe('BUG-CP-014: duplicate PAN / email', () => {
  const EXISTING_MOBILE = '9876501234'
  const NEW_MOBILE = '9823145672'

  beforeEach(() => {
    window.localStorage.clear()
    authStorage.saveRegisteredUser({
      mobile: EXISTING_MOBILE,
      passcode: '581940',
      isRegistered: true,
      user: { id: 'usr_a', fullName: 'Existing', email: 'Ravi@Example.com', mobile: EXISTING_MOBILE, role: 'CUSTOMER', isProfileComplete: true, pan: 'ABCPE1234F' },
    })
    authStorage.setUser({ id: 'usr_b', fullName: '', email: '', mobile: NEW_MOBILE, role: 'CUSTOMER', isProfileComplete: false })
  })

  it('flags PAN and email already used by another account (case-insensitive)', () => {
    expect(findIdentityConflicts({ mobile: NEW_MOBILE, pan: 'abcpe1234f', email: 'ravi@example.com' })).toEqual({
      pan: DUPLICATE_MESSAGES.pan,
      email: DUPLICATE_MESSAGES.email,
    })
  })

  it('does not flag the same account re-saving its own details', () => {
    expect(findIdentityConflicts({ mobile: EXISTING_MOBILE, pan: 'ABCPE1234F', email: 'ravi@example.com' })).toEqual({})
  })

  it('rejects the registration on the service side', async () => {
    const attempt = authFlowService.saveRegistrationStep1({
      mobile: NEW_MOBILE,
      passcode: '581940',
      user: { id: 'usr_b', fullName: 'New', email: 'new@example.com', mobile: NEW_MOBILE, role: 'CUSTOMER', isProfileComplete: true, pan: 'ABCPE1234F' },
    })
    await expect(attempt).rejects.toBeInstanceOf(DuplicateIdentityError)
    await expect(attempt).rejects.toMatchObject({ conflicts: { pan: DUPLICATE_MESSAGES.pan } })
    expect(authStorage.getRegisteredUser(NEW_MOBILE)).toBeNull()
  })
})
