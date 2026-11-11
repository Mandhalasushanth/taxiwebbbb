// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { routePaths } from '../../src/core/config'
import { calculateProfileProgress } from '../../src/modules/profile/utils/profileProgress'
import { CustomerDashboard } from '../../src/modules/dashboard/pages/CustomerDashboard/CustomerDashboard'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@core/config/environment', () => ({
  env: {
    appName: 'Finsolz',
    apiBaseUrl: 'http://localhost:3000',
    enableMocks: true,
    isDev: true,
    isProd: false,
  },
}))

let mockUser: any = null

vi.mock('@store/index', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    useAuthStore: (selector: any) => selector({ user: mockUser }),
  }
})

vi.mock('@core/auth', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    authStorage: {
      getUser: () => mockUser,
    },
  }
})

vi.mock('../../src/modules/dashboard/hooks/useDashboardSummary', () => ({
  useDashboardSummary: () => ({
    data: {
      brief: { message: 'Welcome to Finsolz' },
      stats: [],
      recentApplications: [],
      upcomingDeadlinesList: [],
    },
    isLoading: false,
    error: null,
  }),
}))

describe('Dashboard CompleteProfileCard Integration & 60% Progress', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('calculates initial base progress as 60% for newly registered users with only mobile verified', () => {
    const newUser = {
      id: 'usr_new_1',
      fullName: '',
      mobile: '9876543210',
      email: '',
      isProfileComplete: false,
    }

    const { percentage, isFullyComplete } = calculateProfileProgress(newUser as any)
    expect(percentage).toBe(60)
    expect(isFullyComplete).toBe(false)
  })

  it('renders CompleteProfileCard on Customer Dashboard with 60% progress for new/incomplete users', () => {
    mockUser = {
      id: 'usr_new_1',
      mobile: '9876543210',
      isProfileComplete: false,
    }

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <CustomerDashboard />
      </MemoryRouter>
    )

    // Complete Profile Card is displayed
    const card = screen.getByTestId('complete-profile-card')
    expect(card).toBeDefined()
    expect(screen.getByText('Complete Your Profile')).toBeDefined()
    expect(screen.getByText(/Complete your personal information and KYC details/i)).toBeDefined()
    expect(screen.getByText('60% Completed')).toBeDefined()

    // Position check: Located between hero and services
    const dashboardContainer = card.parentElement
    expect(dashboardContainer).not.toBeNull()
    const children = Array.from(dashboardContainer?.children || [])
    const heroIndex = children.findIndex((el) => el.classList.contains('dashboard-hero'))
    const cardIndex = children.indexOf(card)
    const servicesIndex = children.findIndex((el) => el.classList.contains('quick-services'))

    expect(heroIndex).toBeGreaterThanOrEqual(0)
    expect(cardIndex).toBeGreaterThan(heroIndex)
    expect(servicesIndex).toBeGreaterThan(cardIndex)
  })

  it('clicking "Complete Profile" button on dashboard redirects to profile completion flow with returnTo: /dashboard', () => {
    mockUser = {
      id: 'usr_new_1',
      mobile: '9876543210',
      isProfileComplete: false,
    }

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <CustomerDashboard />
      </MemoryRouter>
    )

    const ctaButton = screen.getByRole('button', { name: /Complete Profile/i })
    fireEvent.click(ctaButton)

    expect(mockNavigate).toHaveBeenCalledTimes(1)
    const [targetPath, options] = mockNavigate.mock.calls[0]
    expect(targetPath).toBe(`/auth/register?redirect=${encodeURIComponent(routePaths.dashboard)}`)
    expect(options).toEqual({
      state: {
        returnTo: routePaths.dashboard,
        mobile: '9876543210',
      },
    })
  })

  it('hides CompleteProfileCard when profile is fully complete', () => {
    mockUser = {
      id: 'usr_complete_1',
      fullName: 'Sushanth Mandhala',
      mobile: '9876543210',
      email: 'sushanth@example.com',
      gender: 'Male',
      dob: '1995-05-15',
      pan: 'ABCDE1234F',
      aadhaar: '123456789012',
      addressLine1: '123 Main Street',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500001',
      isProfileComplete: true,
    }

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <CustomerDashboard />
      </MemoryRouter>
    )

    expect(screen.queryByTestId('complete-profile-card')).toBeNull()
    expect(screen.queryByText('Complete Your Profile')).toBeNull()
  })
})
