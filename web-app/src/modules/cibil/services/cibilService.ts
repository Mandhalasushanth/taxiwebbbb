import type { CibilScoreResponse } from '../types/cibil.types'

/**
 * CIBIL Bureau Provider Service
 * Clean frontend service that interfaces with the credit bureau provider.
 * Built to cleanly connect to real backend bureau APIs when provided by the backend teammate.
 */

// Simulated provider test fixtures to verify all application states
export const CIBIL_DEV_FIXTURES: Record<string, CibilScoreResponse> = {
  successIncrease: {
    score: 754,
    minScore: 300,
    maxScore: 900,
    previousScore: 747,
    scoreDelta: 7,
    lastUpdatedDate: '15 Oct 2026',
    nextReportDate: '15 Nov 2026',
    isFirstTimeCheck: false,
    hasCreditHistory: true,
    fullReportAvailable: true,
    insights: [
      {
        id: 'active-accounts',
        title: 'Active Accounts',
        valueDisplay: '2 Accounts',
        description: 'Healthy mix of secured and unsecured credit lines.',
        status: 'positive',
        indicatorColor: '#16A34A',
        iconName: 'wallet',
        cardTheme: 'green',
      },
      {
        id: 'payment-history',
        title: 'Payment History',
        valueDisplay: '100% On-Time',
        description: 'No late payments recorded in the past 24 months.',
        status: 'positive',
        indicatorColor: '#2563EB',
        iconName: 'check-circle',
        cardTheme: 'blue',
      },
      {
        id: 'credit-utilisation',
        title: 'Credit Utilisation',
        valueDisplay: '18% Utilised',
        description: 'Kept well below the recommended 30% threshold.',
        status: 'positive',
        indicatorColor: '#EA580C',
        iconName: 'pie-chart',
        cardTheme: 'orange',
      },
      {
        id: 'credit-age',
        title: 'Oldest Account',
        valueDisplay: '4 Yrs 2 Mos',
        description: 'Established credit history builds lender confidence.',
        status: 'neutral',
        indicatorColor: '#7C3AED',
        iconName: 'clock',
        cardTheme: 'purple',
      },
      {
        id: 'enquiries',
        title: 'Recent Enquiries',
        valueDisplay: '1 Enquiry',
        description: 'Minimal inquiries in the past 6 months.',
        status: 'positive',
        indicatorColor: '#0284C7',
        iconName: 'search',
        cardTheme: 'cyan',
      },
    ],
    fullReport: {
      bureauName: 'TransUnion CIBIL',
      reportId: 'TU-2026-88491',
      generatedDate: '15 Oct 2026',
      panMasked: 'ABCDE****F',
      totalAccounts: 5,
      openAccounts: 2,
      closedAccounts: 3,
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
        {
          accountType: 'Auto Loan',
          institutionMasked: 'SBI **** 1120',
          currentBalance: '₹2,10,000',
          status: 'Active / Regular',
          sanctionedAmount: '₹6,00,000',
          openedDate: 'Jan 2023',
        },
        {
          accountType: 'Consumer Loan',
          institutionMasked: 'Bajaj **** 9081',
          currentBalance: '₹0',
          status: 'Closed / Paid in full',
          sanctionedAmount: '₹45,000',
          openedDate: 'Feb 2021',
        },
      ],
    },
  },

  firstTimeUser: {
    score: 720,
    minScore: 300,
    maxScore: 900,
    previousScore: null,
    scoreDelta: null,
    lastUpdatedDate: '17 Nov 2026',
    nextReportDate: '17 Dec 2026',
    isFirstTimeCheck: true,
    hasCreditHistory: true,
    fullReportAvailable: true,
    insights: [
      {
        id: 'active-accounts',
        title: 'Active Accounts',
        valueDisplay: '1 Account',
        description: 'Maintain different credit accounts for a better score.',
        status: 'neutral',
        indicatorColor: '#16A34A',
        iconName: 'wallet',
        cardTheme: 'green',
      },
      {
        id: 'payment-history',
        title: 'Payment History',
        valueDisplay: '100% On-Time',
        description: 'All payments made on time since account opening.',
        status: 'positive',
        indicatorColor: '#2563EB',
        iconName: 'check-circle',
        cardTheme: 'blue',
      },
      {
        id: 'credit-utilisation',
        title: 'Credit Utilisation',
        valueDisplay: '10% Utilised',
        description: 'Kept well below the recommended 30% threshold.',
        status: 'positive',
        indicatorColor: '#EA580C',
        iconName: 'pie-chart',
        cardTheme: 'orange',
      },
      {
        id: 'credit-age',
        title: 'Oldest Account',
        valueDisplay: '1 Yr 1 Mo',
        description: 'Established credit history builds lender confidence.',
        status: 'neutral',
        indicatorColor: '#7C3AED',
        iconName: 'clock',
        cardTheme: 'purple',
      },
      {
        id: 'enquiries',
        title: 'Recent Enquiries',
        valueDisplay: '0 Enquiries',
        description: 'No inquiries in the last 6 months.',
        status: 'positive',
        indicatorColor: '#0284C7',
        iconName: 'search',
        cardTheme: 'cyan',
      },
    ],
  },

  noCreditHistory: {
    score: 0,
    minScore: 300,
    maxScore: 900,
    previousScore: null,
    scoreDelta: null,
    lastUpdatedDate: '17 Nov 2026',
    isFirstTimeCheck: true,
    hasCreditHistory: false,
    fullReportAvailable: false,
    insights: [],
  },

  reportUnavailable: {
    score: 685,
    minScore: 300,
    maxScore: 900,
    previousScore: 692,
    scoreDelta: -7,
    lastUpdatedDate: '10 Oct 2026',
    nextReportDate: '10 Nov 2026',
    isFirstTimeCheck: false,
    hasCreditHistory: true,
    fullReportAvailable: false,
    insights: [
      {
        id: 'active-accounts',
        title: 'Active Accounts',
        valueDisplay: '2 Accounts',
        description: 'Accounts active with ongoing repayments.',
        status: 'neutral',
        indicatorColor: '#16A34A',
        iconName: 'wallet',
        cardTheme: 'green',
      },
      {
        id: 'payment-history',
        title: 'Payment History',
        valueDisplay: '95% On-Time',
        description: 'Minor late payment recorded 18 months ago.',
        status: 'attention',
        indicatorColor: '#2563EB',
        iconName: 'check-circle',
        cardTheme: 'blue',
      },
      {
        id: 'credit-utilisation',
        title: 'Credit Utilisation',
        valueDisplay: '35% Utilised',
        description: 'Slightly higher than the recommended 30% threshold.',
        status: 'attention',
        indicatorColor: '#EA580C',
        iconName: 'pie-chart',
        cardTheme: 'orange',
      },
      {
        id: 'credit-age',
        title: 'Oldest Account',
        valueDisplay: '3 Yrs 4 Mos',
        description: 'Healthy credit history tenure.',
        status: 'neutral',
        indicatorColor: '#7C3AED',
        iconName: 'clock',
        cardTheme: 'purple',
      },
      {
        id: 'enquiries',
        title: 'Recent Enquiries',
        valueDisplay: '3 Enquiries',
        description: 'Multiple inquiries made in the last 6 months.',
        status: 'attention',
        indicatorColor: '#0284C7',
        iconName: 'search',
        cardTheme: 'cyan',
      },
    ],
  },
}

class CibilService {
  private activeFixtureKey: keyof typeof CIBIL_DEV_FIXTURES = 'successIncrease'

  public setFixtureForTesting(key: keyof typeof CIBIL_DEV_FIXTURES) {
    if (CIBIL_DEV_FIXTURES[key]) {
      this.activeFixtureKey = key
    }
  }

  /**
   * Fetches CIBIL credit score details.
   * Ready for backend teammate to replace simulated delay with `apiClient.get('/api/cibil/score')`.
   */
  public async fetchCreditScore(options?: {
    simulateError?: boolean
    fixture?: keyof typeof CIBIL_DEV_FIXTURES
    user?: { fullName?: string; pan?: string }
  }): Promise<CibilScoreResponse> {
    // Simulated network handshaking duration
    await new Promise((resolve) => setTimeout(resolve, 1500))

    if (options?.simulateError) {
      throw new Error(
        'Unable to establish secure handshake with bureau provider. Please check your network and try again.'
      )
    }

    const fixtureKey = options?.fixture || this.activeFixtureKey
    const data: CibilScoreResponse = JSON.parse(
      JSON.stringify(CIBIL_DEV_FIXTURES[fixtureKey] || CIBIL_DEV_FIXTURES.successIncrease)
    )

    // Dynamically personalize report metadata to logged-in user rather than hardcoded mock identities
    if (data.fullReport && options?.user?.pan) {
      const rawPan = options.user.pan.trim().toUpperCase()
      data.fullReport.panMasked =
        rawPan.length >= 5
          ? `${rawPan.slice(0, 5)}****${rawPan.slice(-1)}`
          : rawPan
    }

    return data
  }

  /**
   * Submits a dispute / issue to credit bureau.
   * Clean isolated interface for backend teammate to connect `apiClient.post('/api/cibil/disputes', payload)`.
   */
  public async submitDispute(_payload: {
    issueType: string
    description: string
  }): Promise<{ success: boolean; ticketId?: string; message?: string }> {
    // Simulated network latency
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Backend integration boundary:
    // Do not show a successful issue-submission message unless actual submission is confirmed by the backend.
    return {
      success: false,
      message:
        'Bureau dispute submission endpoint is pending backend deployment. Please contact Finsolz Support for immediate dispute handling.',
    }
  }
}

export const cibilService = new CibilService()
export default cibilService
