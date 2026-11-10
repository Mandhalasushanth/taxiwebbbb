// @vitest-environment jsdom
process.env.VITE_API_BASE_URL = 'http://localhost:3000'

import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, describe, it, expect } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { authStorage, buildProfileCompletionPath, resolvePostLoginPath } from '../../src/core/auth'
import { maskAadhaar, maskAadhaarAsterisk, maskPan } from '../../src/shared/utils'
import { legalRoutes } from '../../src/modules/legal'
import { RegistrationSecurityFields } from '../../src/modules/authentication/components/RegistrationSecurityFields/RegistrationSecurityFields'
import { authFlowService } from '../../src/modules/authentication/services/authFlowService'
import {
  DuplicateIdentityError,
  DUPLICATE_MESSAGES,
  findIdentityConflicts,
} from '../../src/modules/authentication/services/identityRegistry'
import { PersonalInformation } from '../../src/modules/profile/pages/PersonalInformation/PersonalInformation'
import { KycDetails } from '../../src/modules/profile/pages/KycDetails/KycDetails'
import { useAuthStore } from '../../src/store'

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

describe('PersonalInformation Single Card & Inline Edit Feature', () => {
  beforeEach(() => {
    window.localStorage.clear()
    const testUser = {
      id: 'usr_sagarika',
      fullName: 'Sagarika jena',
      email: 'sagarika@gmail.com',
      mobile: '7008138785',
      role: 'CUSTOMER' as const,
      isProfileComplete: true,
      customerType: 'individual',
      gender: 'Female',
      dob: '18-01-2000',
      fatherSpouseName: 'santosh',
      addressLine1: 'ameerpet, hyderabad',
      addressLine2: 'erragada',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '761118',
    }
    authStorage.setUser(testUser)
    useAuthStore.getState().setUser(testUser)
  })

  it('renders only 1 card with the 6 specified details in exact order, omitting gender & father name', () => {
    const { container } = render(
      <MemoryRouter>
        <PersonalInformation />
      </MemoryRouter>
    )

    // Exactly 1 detail card should be rendered
    const cards = container.querySelectorAll('.profile-detail-card')
    expect(cards.length).toBe(1)
    expect(screen.getByText('Personal Information')).toBeInTheDocument()
    expect(screen.queryByText('Residential Address')).toBeNull()

    // Labels in exact order
    const labels = Array.from(container.querySelectorAll('.profile-detail-card__label')).map(
      (el) => el.textContent?.trim()
    )
    expect(labels).toEqual([
      'FULL NAME',
      'MOBILE NUMBER',
      'EMAIL ADDRESS',
      'DATE OF BIRTH',
      'CUSTOMER TYPE',
      'ADDRESS',
    ])

    // Verify values
    expect(screen.getByText('Sagarika jena')).toBeInTheDocument()
    expect(screen.getByText('+91 7008138785')).toBeInTheDocument()
    expect(screen.getByText('sagarika@gmail.com')).toBeInTheDocument()
    expect(screen.getByText('18-01-2000')).toBeInTheDocument()
    expect(screen.getByText('Individual')).toBeInTheDocument()
    expect(
      screen.getByText('ameerpet, hyderabad, erragada, Hyderabad, Telangana, 761118')
    ).toBeInTheDocument()

    // Omitted fields should not be present
    expect(screen.queryByText('GENDER')).toBeNull()
    expect(screen.queryByText('FATHER/SPOUSE NAME')).toBeNull()
    expect(screen.queryByText('Female')).toBeNull()
    expect(screen.queryByText('santosh')).toBeNull()
  })

  it('opens inline edit form on "Edit Details" click, allows editing, and returns to normal card on "OK"', () => {
    render(
      <MemoryRouter>
        <PersonalInformation />
      </MemoryRouter>
    )

    // Initially in normal view
    expect(screen.queryByRole('textbox', { name: /full name/i })).toBeNull()

    // Click "Edit Details"
    const editBtn = screen.getByRole('button', { name: /edit details/i })
    fireEvent.click(editBtn)

    // Inline edit form should be open inside the card
    const nameInput = screen.getByPlaceholderText('Enter full name') as HTMLInputElement
    const mobileInput = screen.getByPlaceholderText('Enter 10-digit mobile') as HTMLInputElement
    const emailInput = screen.getByPlaceholderText('Enter email address') as HTMLInputElement
    const dobInput = screen.getByPlaceholderText('DD-MM-YYYY') as HTMLInputElement
    const customerTypeSelect = screen.getByLabelText(/customer type/i) as HTMLSelectElement
    const addressInput = screen.getByPlaceholderText('Enter residential address') as HTMLTextAreaElement

    expect(nameInput.value).toBe('Sagarika jena')
    expect(mobileInput.value).toBe('7008138785')
    expect(emailInput.value).toBe('sagarika@gmail.com')
    expect(dobInput.value).toBe('18-01-2000')
    expect(customerTypeSelect.value).toBe('individual')
    expect(addressInput.value).toBe('ameerpet, hyderabad, erragada, Hyderabad, Telangana, 761118')

    // Perform edits
    fireEvent.change(nameInput, { target: { value: 'Sagarika Dash' } })
    fireEvent.change(mobileInput, { target: { value: '9876543210' } })
    fireEvent.change(customerTypeSelect, { target: { value: 'salaried' } })
    fireEvent.change(addressInput, { target: { value: 'Banjara Hills, Hyderabad, Telangana - 500034' } })

    // Click "OK"
    const okBtn = screen.getByRole('button', { name: 'OK' })
    fireEvent.click(okBtn)

    // Should return to normal card view with updated values
    expect(screen.queryByPlaceholderText('Enter full name')).toBeNull()
    expect(screen.getByText('Sagarika Dash')).toBeInTheDocument()
    expect(screen.getByText('+91 9876543210')).toBeInTheDocument()
    expect(screen.getByText('Salaried')).toBeInTheDocument()
    expect(screen.getByText('Banjara Hills, Hyderabad, Telangana - 500034')).toBeInTheDocument()

    // Storage is updated
    const updated = authStorage.getUser()
    expect(updated?.fullName).toBe('Sagarika Dash')
    expect(updated?.mobile).toBe('9876543210')
    expect(updated?.customerType).toBe('salaried')
  })

  it('cancels edits and returns to normal card on "Cancel"', () => {
    render(
      <MemoryRouter>
        <PersonalInformation />
      </MemoryRouter>
    )

    // Click "Edit Details"
    fireEvent.click(screen.getByRole('button', { name: /edit details/i }))

    const nameInput = screen.getByPlaceholderText('Enter full name')
    fireEvent.change(nameInput, { target: { value: 'Changed But Cancelled' } })

    // Click "Cancel"
    const cancelBtn = screen.getByRole('button', { name: 'Cancel' })
    fireEvent.click(cancelBtn)

    // Form closes and retains original name
    expect(screen.queryByPlaceholderText('Enter full name')).toBeNull()
    expect(screen.getByText('Sagarika jena')).toBeInTheDocument()
    expect(screen.queryByText('Changed But Cancelled')).toBeNull()
  })
})

describe('KYC Details display and masking', () => {
  it('masks PAN and Aadhaar numbers correctly', () => {
    expect(maskPan('CASPJ7434E')).toBe('CASPJ****E')
    expect(maskPan('DJKLH1234G')).toBe('DJKLH****G')
    expect(maskPan(undefined)).toBe('—')

    expect(maskAadhaarAsterisk('234567898557')).toBe('**** **** 8557')
    expect(maskAadhaarAsterisk('XXXX XXXX 8557')).toBe('**** **** 8557')
    expect(maskAadhaarAsterisk(undefined)).toBe('—')
  })

  it('renders KYC Details with PAN, Aadhaar, Verification Status, and footer note, without address', () => {
    const mockUser = {
      id: 'usr_kyc_test',
      fullName: 'Sagarika jena',
      mobile: '917008138785',
      pan: 'CASPJ7434E',
      aadhaar: 'XXXX XXXX 7654',
      isProfileComplete: true,
      addressLine1: 'ameerpet, hyderabad',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '761118',
    }
    authStorage.setUser(mockUser as any)
    useAuthStore.getState().setUser(mockUser as any)

    render(
      <MemoryRouter>
        <KycDetails />
      </MemoryRouter>
    )

    // Check PAN and Aadhaar masked values
    expect(screen.getByText('CASPJ****E')).toBeInTheDocument()
    expect(screen.getByText('**** **** 7654')).toBeInTheDocument()

    // Check Verification Status
    expect(screen.getByText('Verification Status')).toBeInTheDocument()
    expect(screen.getByTestId('kyc-verification-status')).toHaveTextContent('Verified')

    // Check footer note text
    expect(
      screen.getByText('Status reflects the PAN and Aadhaar documents uploaded against your applications.')
    ).toBeInTheDocument()

    // Address is removed from KYC card
    expect(screen.queryByText(/ameerpet, hyderabad/i)).toBeNull()
  })

  it('renders Customer Type as Pending for fresh unregistered mobile login user', () => {
    const freshUser = {
      id: 'usr_fresh_login',
      fullName: '',
      mobile: '8765467890',
      email: '',
      role: 'CUSTOMER' as const,
      isProfileComplete: false,
    }
    authStorage.setUser(freshUser as any)
    useAuthStore.getState().setUser(freshUser as any)

    render(
      <MemoryRouter>
        <PersonalInformation />
      </MemoryRouter>
    )

    // Full Name, Email Address, Date of Birth, Customer Type, Address should all be Pending
    expect(screen.getByTestId('pending-full-name')).toHaveTextContent('Pending')
    expect(screen.getByTestId('pending-email-address')).toHaveTextContent('Pending')
    expect(screen.getByTestId('pending-date-of-birth')).toHaveTextContent('Pending')
    expect(screen.getByTestId('pending-customer-type')).toHaveTextContent('Pending')
    expect(screen.getByTestId('pending-address')).toHaveTextContent('Pending')

    // Mobile should be verified
    expect(screen.getByText('+91 8765467890')).toBeInTheDocument()
    expect(screen.getByTestId('verified-mobile-number')).toHaveTextContent('Verified')

    // Should NOT show hardcoded "Individual"
    expect(screen.queryByText('Individual')).toBeNull()
  })
})
