// @vitest-environment jsdom
process.env.VITE_API_BASE_URL = 'http://localhost:3000'

import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, describe, it, expect } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import {
  authStorage,
  buildLoginPath,
  buildProfileCompletionPath,
  isSafeRedirect,
  resolvePostLoginPath,
} from '../../src/core/auth'
import { userStorage } from '../../src/core/storage/userStorage'
import { localStore } from '../../src/core/storage/localStorage'
import { readServiceDraft } from '../../src/shared/saveDraft'
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
    expect(titles).toEqual(['Terms & Conditions', 'Privacy Policy'])
  })

  it('serves refund policy on public route', () => {
    render(
      <MemoryRouter initialEntries={['/legal/refund']}>
        <Routes>
          {legalRoutes.map((route) => <Route key={route.path} path={route.path} element={route.element} />)}
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Refund & Cancellation Policy')
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
    const termsLink = screen.getByRole('link', { name: /Terms/i })
    expect(termsLink).toHaveAttribute('href', '/legal/terms')
    fireEvent.click(termsLink)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toHaveTextContent(/Terms & Conditions/i)
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

    // KYC details should not be editable (Edit Details button removed)
    expect(screen.queryByRole('button', { name: /edit details/i })).toBeNull()
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

describe('GLOBAL AUTHENTICATION REDIRECT, PREVIOUS PAGE RESTORATION AND AUTOMATIC DRAFT RESUME', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  afterEach(() => {
    cleanup()
    localStorage.clear()
    sessionStorage.clear()
  })

  // Scenario 1: GST Compliance -> Logout -> Login -> Return to GST Compliance
  it('Scenario 1: returns to GST Compliance after login when logged out from GST Compliance', () => {
    const loginUrl = buildLoginPath({ pathname: '/gst/compliance' })
    expect(loginUrl).toBe('/auth/login?redirect=%2Fgst%2Fcompliance')
    const search = loginUrl.slice(loginUrl.indexOf('?'))
    expect(resolvePostLoginPath(search, null, '/dashboard')).toBe('/gst/compliance')
  })

  // Scenario 2: GST Registration -> Logout -> Login -> Return to GST Registration
  it('Scenario 2: returns to GST Registration after login when logged out from GST Registration', () => {
    const loginUrl = buildLoginPath({ pathname: '/gst/registration' })
    expect(loginUrl).toBe('/auth/login?redirect=%2Fgst%2Fregistration')
    const search = loginUrl.slice(loginUrl.indexOf('?'))
    expect(resolvePostLoginPath(search, null, '/dashboard')).toBe('/gst/registration')
  })

  // Scenario 3: ITR -> Logout -> Login -> Return to previous ITR page
  it('Scenario 3: returns to relevant ITR page after login', () => {
    const loginUrl = buildLoginPath({ pathname: '/itr/file-itr', search: '?step=2' })
    expect(loginUrl).toBe('/auth/login?redirect=%2Fitr%2Ffile-itr%3Fstep%3D2')
    const search = loginUrl.slice(loginUrl.indexOf('?'))
    expect(resolvePostLoginPath(search, null, '/dashboard')).toBe('/itr/file-itr?step=2')
  })

  // Scenario 4: Payment -> Logout -> Login -> Return to Payment
  it('Scenario 4: returns to Payment page after login', () => {
    const loginUrl = buildLoginPath({ pathname: '/payments' })
    expect(loginUrl).toBe('/auth/login?redirect=%2Fpayments')
    const search = loginUrl.slice(loginUrl.indexOf('?'))
    expect(resolvePostLoginPath(search, null, '/dashboard')).toBe('/payments')
  })

  // Scenario 5: Loans -> Logout -> Login -> Return to Loans
  it('Scenario 5: returns to Loans page after login', () => {
    const loginUrl = buildLoginPath({ pathname: '/loans/personal-loan' })
    expect(loginUrl).toBe('/auth/login?redirect=%2Floans%2Fpersonal-loan')
    const search = loginUrl.slice(loginUrl.indexOf('?'))
    expect(resolvePostLoginPath(search, null, '/dashboard')).toBe('/loans/personal-loan')
  })

  // Scenario 6: Insurance -> Logout -> Login -> Return to Insurance
  it('Scenario 6: returns to Insurance page after login', () => {
    const loginUrl = buildLoginPath({ pathname: '/insurance' })
    expect(loginUrl).toBe('/auth/login?redirect=%2Finsurance')
    const search = loginUrl.slice(loginUrl.indexOf('?'))
    expect(resolvePostLoginPath(search, null, '/dashboard')).toBe('/insurance')
  })

  // Scenario 7: Projects -> Logout -> Login -> Return to Projects
  it('Scenario 7: returns to Projects page after login', () => {
    const loginUrl = buildLoginPath({ pathname: '/projects' })
    expect(loginUrl).toBe('/auth/login?redirect=%2Fprojects')
    const search = loginUrl.slice(loginUrl.indexOf('?'))
    expect(resolvePostLoginPath(search, null, '/dashboard')).toBe('/projects')
  })

  // Scenario 8: Any other protected page -> Logout -> Login -> Return to that page
  it('Scenario 8: returns to other protected pages such as Profile KYC and Applications', () => {
    const kycLoginUrl = buildLoginPath({ pathname: '/profile/kyc' })
    expect(kycLoginUrl).toBe('/auth/login?redirect=%2Fprofile%2Fkyc')
    const kycSearch = kycLoginUrl.slice(kycLoginUrl.indexOf('?'))
    expect(resolvePostLoginPath(kycSearch, null, '/dashboard')).toBe('/profile/kyc')

    const appsLoginUrl = buildLoginPath({ pathname: '/applications' })
    expect(appsLoginUrl).toBe('/auth/login?redirect=%2Fapplications')
    const appsSearch = appsLoginUrl.slice(appsLoginUrl.indexOf('?'))
    expect(resolvePostLoginPath(appsSearch, null, '/dashboard')).toBe('/applications')
  })

  // Scenario 9: Session expiry while filling a form -> Login -> Resume the same page
  it('Scenario 9: preserves intended destination across session expiry', () => {
    const expiryLoginUrl = buildLoginPath({ pathname: '/incorporation/company-details' })
    expect(expiryLoginUrl).toContain('redirect=%2Fincorporation%2Fcompany-details')
    // Destination is also kept safely in sessionStorage
    expect(resolvePostLoginPath('', null, '/dashboard')).toBe('/incorporation/company-details')
  })

  // Scenario 10 & 11: Session expiry during multi-step application -> Restore same step & entered info
  it('Scenario 10 & 11: restores exact step and previously entered values upon resuming draft', () => {
    const testUser = { id: 'usr_test_draft', mobile: '9988776655', fullName: 'Tester', role: 'CUSTOMER' as const, isProfileComplete: true }
    authStorage.setUser(testUser as any)

    // Save auto-saved draft simulating user work at step 3
    const draftData = {
      formData: {
        pan: 'ABCDE1234F',
        businessName: 'Apex Innovations Pvt Ltd',
        gstType: 'Regular',
        turnoverRange: '1.5cr_to_5cr',
      },
      currentStep: 3,
    }
    localStore.set(`taxedge_service_draft_${testUser.id}_gst-reg`, draftData)

    const restored = readServiceDraft<typeof draftData.formData>('gst-reg')
    expect(restored).not.toBeNull()
    expect(restored?.currentStep).toBe(3)
    expect(restored?.formData.pan).toBe('ABCDE1234F')
    expect(restored?.formData.businessName).toBe('Apex Innovations Pvt Ltd')
    expect(restored?.formData.gstType).toBe('Regular')
  })

  // Scenario 12: Verify saved document references and statuses are restored where available
  it('Scenario 12: restores document references and upload statuses from draft', () => {
    const testUser = { id: 'usr_doc_test', mobile: '9988776644', fullName: 'Doc User', role: 'CUSTOMER' as const, isProfileComplete: true }
    authStorage.setUser(testUser as any)

    const docDraft = {
      formData: {
        uploadedDocs: {
          panDoc: { fileName: 'pan_card.pdf', status: 'uploaded' },
          aadhaarDoc: { fileName: 'aadhaar_card.pdf', status: 'uploaded' },
        },
      },
      currentStep: 2,
    }
    localStore.set(`taxedge_service_draft_${testUser.id}_loan-home`, docDraft)

    const restored = readServiceDraft<typeof docDraft.formData>('loan-home')
    expect(restored?.formData.uploadedDocs.panDoc.fileName).toBe('pan_card.pdf')
    expect(restored?.formData.uploadedDocs.aadhaarDoc.status).toBe('uploaded')
  })

  // Scenario 14: Verify invalid redirect destinations are rejected
  it('Scenario 14: rejects unsafe open redirects and auth page loops', () => {
    expect(isSafeRedirect('//evil.com')).toBe(false)
    expect(isSafeRedirect('/\\attacker.com')).toBe(false)
    expect(isSafeRedirect('https://evil.com')).toBe(false)
    expect(isSafeRedirect('/auth/login')).toBe(false)
    expect(isSafeRedirect('/login')).toBe(false)
    expect(isSafeRedirect('javascript:alert(1)')).toBe(false)

    expect(resolvePostLoginPath('?redirect=%2F%2Fevil.com', null, '/dashboard')).toBe('/dashboard')
    expect(resolvePostLoginPath('?redirect=%2Fauth%2Flogin', null, '/dashboard')).toBe('/dashboard')
  })

  // Scenario 15: Verify a new login without a previous destination goes to Dashboard
  it('Scenario 15: routes new login with no previous destination to Dashboard', () => {
    sessionStorage.clear()
    const resolved = resolvePostLoginPath('', null, '/dashboard')
    expect(resolved).toBe('/dashboard')
  })

  // Scenario 16: Verify different users cannot access each other's drafts
  it('Scenario 16: ensures User B cannot access drafts created by User A', () => {
    const userA = { id: 'usr_alice', mobile: '9111111111', fullName: 'Alice', role: 'CUSTOMER' as const, isProfileComplete: true }
    authStorage.setUser(userA as any)

    userStorage.saveDraft({
      serviceId: 'itr-filing',
      serviceTitle: 'ITR Filing',
      currentStep: 4,
      totalSteps: 5,
      formData: { salary: 1200000, employer: 'Alice Tech Corp' },
      savedAt: '10:00 AM',
      savedTimestamp: Date.now(),
      resumeRoute: '/itr/itr-filing',
    })

    expect(userStorage.getDraft('itr-filing')?.formData).toEqual({ salary: 1200000, employer: 'Alice Tech Corp' })

    // User A logs out, User B logs in
    const userB = { id: 'usr_bob', mobile: '9222222222', fullName: 'Bob', role: 'CUSTOMER' as const, isProfileComplete: true }
    authStorage.setUser(userB as any)

    // User B should NOT see User A's draft
    expect(userStorage.getDraft('itr-filing')).toBeNull()
    expect(userStorage.getAllDrafts()).toEqual([])
    expect(readServiceDraft('itr-filing')).toBeNull()
  })
})
