// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { routePaths } from '../../src/core/config'
import { isProfileFreePath } from '../../src/app/router/profileGate'
import { calculateProfileProgress } from '../../src/modules/profile/utils/profileProgress'
import { CustomerDashboard } from '../../src/modules/dashboard/pages/CustomerDashboard/CustomerDashboard'
import { CibilScorePage } from '../../src/modules/cibil/pages/CibilScorePage'
import { cibilService, CIBIL_DEV_FIXTURES } from '../../src/modules/cibil/services/cibilService'
import { CibilRaiseIssueModal } from '../../src/modules/cibil/components/CibilRaiseIssueModal/CibilRaiseIssueModal'
import { CibilReportModal } from '../../src/modules/cibil/components/CibilReportModal/CibilReportModal'

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
    vi.useRealTimers()
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

  it('renders CIBIL score card on the dashboard and navigates to /cibil on click', () => {
    mockUser = {
      id: 'usr_complete_1',
      fullName: 'Sushanth Mandhala',
      mobile: '9876543210',
      isProfileComplete: true,
    }

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <CustomerDashboard />
      </MemoryRouter>
    )

    const cibilCard = screen.getByTestId('cibil-home-card')
    expect(cibilCard).toBeDefined()
    expect(screen.getByText('CIBIL Score')).toBeDefined()
    expect(screen.getByText('Free')).toBeDefined()
    expect(screen.getByText('Check your free credit score instantly')).toBeDefined()
    expect(screen.getByText('Quick Check')).toBeDefined()
    expect(screen.getByText('100% Secure')).toBeDefined()
    expect(screen.getByText('No Impact on Score')).toBeDefined()

    const checkScoreBtn = screen.getByRole('button', { name: /Check Score/i })
    fireEvent.click(checkScoreBtn)

    expect(mockNavigate).toHaveBeenCalledWith(routePaths.cibil)
    expect(isProfileFreePath(routePaths.cibil)).toBe(true)

    // Position check: Located above the support chat banner
    const dashboardContainer = cibilCard.parentElement
    const children = Array.from(dashboardContainer?.children || [])
    const cibilIndex = children.indexOf(cibilCard)
    const supportIndex = children.findIndex((el) => el.classList.contains('dashboard-support-banner'))
    expect(cibilIndex).toBeGreaterThanOrEqual(0)
    expect(supportIndex).toBe(cibilIndex + 1)
  })

  it('renders CibilScorePage through connection animation to full dashboard', async () => {
    mockUser = {
      id: 'usr_complete_1',
      fullName: 'Sagarika Sharma',
      mobile: '9876543210',
      pan: 'ABCDE1234F',
      isProfileComplete: true,
    }

    // Mock fetchCreditScore to return fixture
    vi.spyOn(cibilService, 'fetchCreditScore').mockResolvedValue(CIBIL_DEV_FIXTURES.successIncrease)

    render(
      <MemoryRouter initialEntries={['/cibil']}>
        <CibilScorePage />
      </MemoryRouter>
    )

    // Stage 1: Animation initially shown
    expect(screen.getByTestId('cibil-connection-animation')).toBeDefined()
    expect(screen.getByText('Connecting to Finsolz...')).toBeDefined()

    // Dashboard state loads after handshake
    const dashboard = await screen.findByTestId('cibil-dashboard', {}, { timeout: 3500 })
    expect(dashboard).toBeDefined()
    expect(screen.getByTestId('cibil-score-gauge')).toBeDefined()
    expect(screen.getByTestId('cibil-score-delta')).toBeDefined()
    expect(screen.getByText("Here's what's affecting your score.")).toBeDefined()
    expect(screen.getByText('Active Accounts')).toBeDefined()
    expect(screen.getByText('Payment History')).toBeDefined()
    expect(screen.getByText('Credit Utilisation')).toBeDefined()
    expect(screen.getByText('Do you know?')).toBeDefined()
  })

  it('opens and closes CibilReportModal with account details', () => {
    const reportData = {
      bureauName: 'TransUnion CIBIL',
      reportId: 'TU-2026-88491',
      generatedDate: '15 Oct 2026',
      panMasked: 'ABCDE****F',
      totalAccounts: 3,
      openAccounts: 2,
      closedAccounts: 1,
      totalEnquiriesLastYear: 1,
      accounts: [
        {
          accountType: 'Credit Card',
          institutionMasked: 'HDFC **** 4910',
          currentBalance: '₹12,450',
          status: 'Active / Regular',
          sanctionedAmount: '₹1,50,000',
          openedDate: 'Aug 2022',
        },
      ],
    }

    const onClose = vi.fn()
    const { rerender } = render(
      <CibilReportModal
        isOpen={true}
        onClose={onClose}
        reportData={reportData}
        isReportAvailable={true}
      />
    )

    expect(screen.getByText('Detailed Credit Report')).toBeDefined()
    expect(screen.getByText('TU-2026-88491')).toBeDefined()
    expect(screen.getByText('HDFC **** 4910')).toBeDefined()

    const closeBtn = screen.getByRole('button', { name: /Close dialog/i })
    fireEvent.click(closeBtn)
    expect(onClose).toHaveBeenCalled()

    rerender(
      <CibilReportModal
        isOpen={false}
        onClose={onClose}
        reportData={reportData}
        isReportAvailable={true}
      />
    )
    expect(screen.queryByText('Detailed Credit Report')).toBeNull()
  })

  it('enforces backend boundary on CibilRaiseIssueModal without fake success', async () => {
    const onNavigateSupport = vi.fn()
    const onClose = vi.fn()

    render(
      <CibilRaiseIssueModal
        isOpen={true}
        onClose={onClose}
        onNavigateSupport={onNavigateSupport}
      />
    )

    expect(screen.getByText('Raise a CIBIL Dispute / Issue')).toBeDefined()

    const textarea = screen.getByLabelText(/Dispute Details/i)
    fireEvent.change(textarea, { target: { value: 'My HDFC loan balance is reporting erroneously' } })

    const submitBtn = screen.getByRole('button', { name: /Submit Dispute/i })
    fireEvent.click(submitBtn)

    // Wait for submission response
    const unconfirmedNotice = await screen.findByText('Backend Connection In Progress')
    expect(unconfirmedNotice).toBeDefined()
    expect(
      screen.getByText(/Bureau dispute submission service is not yet connected/i)
    ).toBeDefined()

    // Confirm that fake success is NOT shown
    expect(screen.queryByText('Issue Submitted Successfully')).toBeNull()

    // Clicking Support Chat button navigates to support
    const chatBtn = screen.getByRole('button', { name: /Chat with Support/i })
    fireEvent.click(chatBtn)
    expect(onNavigateSupport).toHaveBeenCalled()
  })
})
