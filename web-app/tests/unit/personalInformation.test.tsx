// @vitest-environment jsdom
import { render, screen, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { PersonalInformation } from '../../src/modules/profile/pages/PersonalInformation/PersonalInformation'
import type { AuthUser } from '@core/auth'

let mockUser: AuthUser | null = null

vi.mock('@store/index', () => ({
  useAuthStore: (selector: any) => selector({ user: mockUser }),
}))

vi.mock('@core/auth', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    authStorage: {
      getUser: () => mockUser,
    },
  }
})

describe('PersonalInformation component', () => {
  afterEach(() => {
    cleanup()
    mockUser = null
  })

  it('renders Address Line 2 without Pending badge, and does NOT render District or Area / Locality', () => {
    mockUser = {
      id: 'usr_test1',
      fullName: 'Sagarika Jena',
      email: 'sagarika@example.com',
      mobile: '9876543210',
      role: 'CUSTOMER',
      isProfileComplete: true,
      addressLine1: 'ameerpet, hyderabad',
      addressLine2: '',
      areaLocality: 'erragada',
      city: 'Hyderabad',
      district: 'Hyderabad',
      state: 'Telangana',
      pincode: '761118',
    }

    render(
      <MemoryRouter>
        <PersonalInformation />
      </MemoryRouter>
    )

    // ADDRESS LINE 1 should be visible
    expect(screen.getByText('ameerpet, hyderabad')).toBeDefined()

    // ADDRESS LINE 2 should display "erragada" (from user's input) and NOT Pending
    expect(screen.getByText('ADDRESS LINE 2')).toBeDefined()
    expect(screen.getByText('erragada')).toBeDefined()
    expect(screen.queryByTestId('pending-address-line-2')).toBeNull()

    // AREA / LOCALITY and DISTRICT must NOT be present
    expect(screen.queryByText('AREA / LOCALITY')).toBeNull()
    expect(screen.queryByText('DISTRICT')).toBeNull()

    // City, State, PIN code are visible
    expect(screen.getByText('Hyderabad')).toBeDefined()
    expect(screen.getByText('Telangana')).toBeDefined()
    expect(screen.getByText('761118')).toBeDefined()
  })

  it('does NOT render ADDRESS LINE 2 and does NOT show Pending when Address Line 2 was not provided', () => {
    mockUser = {
      id: 'usr_test2',
      fullName: 'Rahul Sharma',
      email: 'rahul@example.com',
      mobile: '9876543210',
      role: 'CUSTOMER',
      isProfileComplete: true,
      addressLine1: 'MG Road, Secunderabad',
      addressLine2: '',
      areaLocality: '',
      city: 'Hyderabad',
      district: 'Hyderabad',
      state: 'Telangana',
      pincode: '500003',
    }

    render(
      <MemoryRouter>
        <PersonalInformation />
      </MemoryRouter>
    )

    // ADDRESS LINE 1 is visible
    expect(screen.getByText('MG Road, Secunderabad')).toBeDefined()

    // ADDRESS LINE 2 must NOT be rendered at all
    expect(screen.queryByText('ADDRESS LINE 2')).toBeNull()
    expect(screen.queryByTestId('pending-address-line-2')).toBeNull()

    // AREA / LOCALITY and DISTRICT must NOT be present
    expect(screen.queryByText('AREA / LOCALITY')).toBeNull()
    expect(screen.queryByText('DISTRICT')).toBeNull()
  })

  it('renders explicit addressLine2 when provided', () => {
    mockUser = {
      id: 'usr_test3',
      fullName: 'Ananya Verma',
      email: 'ananya@example.com',
      mobile: '9876543210',
      role: 'CUSTOMER',
      isProfileComplete: true,
      addressLine1: 'Flat 302, Green Park',
      addressLine2: 'Near Metro Station',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560001',
    }

    render(
      <MemoryRouter>
        <PersonalInformation />
      </MemoryRouter>
    )

    expect(screen.getByText('Flat 302, Green Park')).toBeDefined()
    expect(screen.getByText('ADDRESS LINE 2')).toBeDefined()
    expect(screen.getByText('Near Metro Station')).toBeDefined()
    expect(screen.queryByTestId('pending-address-line-2')).toBeNull()
  })
})

