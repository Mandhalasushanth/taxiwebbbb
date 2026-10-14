// @vitest-environment jsdom
process.env.VITE_API_BASE_URL = 'http://localhost:3000'

import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, describe, it, expect } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { routePaths } from '../../src/core/config'
import { userStorage } from '../../src/core/storage/userStorage'
import { applicationsService } from '../../src/modules/applications/services/applicationsService'
import { incorporationRoutes } from '../../src/modules/incorporation/routes'
import { INCORPORATION_FLOW_STEPS } from '../../src/modules/incorporation/components/IncorporationFlowSteps/IncorporationFlowSteps'
import { companyTypeOptions } from '../../src/modules/incorporation/data/companyRegistrationData'

afterEach(cleanup)

describe('SubmissionSuccess navigation buttons', () => {
  beforeEach(() => {
    window.scrollTo = () => {}
    localStorage.clear()
  })

  it('clicking "Go to Dashboard" redirects to /dashboard and persists application', async () => {
    const router = createMemoryRouter(
      [
        ...incorporationRoutes,
        { path: routePaths.dashboard, element: <span data-testid="dashboard-page">Dashboard</span> },
      ],
      { initialEntries: [routePaths.incorporation.submissionSuccess] },
    )
    render(<RouterProvider router={router} />)

    const dashboardBtn = await screen.findByRole('button', { name: /go to dashboard/i })
    expect(dashboardBtn).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(dashboardBtn)
    })

    expect(router.state.location.pathname).toBe(routePaths.dashboard)
    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument()
    // Verify no save draft modal exists
    expect(screen.queryByText(/save draft/i)).not.toBeInTheDocument()

    // Application is saved in userStorage
    const apps = userStorage.getUserApplications()
    expect(apps.some((a) => a.code === 'INC-800419')).toBe(true)
  })

  it('clicking "Track Application" redirects to /applications, persists application and appears under Business category', async () => {
    const router = createMemoryRouter(
      [
        ...incorporationRoutes,
        { path: routePaths.applications, element: <span data-testid="applications-page">Applications</span> },
      ],
      { initialEntries: [routePaths.incorporation.submissionSuccess] },
    )
    render(<RouterProvider router={router} />)

    const trackAppBtn = await screen.findByRole('button', { name: /track application/i })
    expect(trackAppBtn).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(trackAppBtn)
    })

    expect(router.state.location.pathname).toBe(routePaths.applications)
    expect(screen.getByTestId('applications-page')).toBeInTheDocument()
    // Verify no save draft modal exists
    expect(screen.queryByText(/save draft/i)).not.toBeInTheDocument()

    // Application is in userStorage
    const apps = userStorage.getUserApplications()
    const incApp = apps.find((a) => a.code === 'INC-800419')
    expect(incApp).toBeDefined()

    // Application is categorized under Business in applicationsService
    const listed = await applicationsService.list()
    const listedInc = listed.find((a) => a.reference === 'INC-800419')
    expect(listedInc).toBeDefined()
    expect(listedInc?.category).toBe('Business')
  })
})

describe('7 Common Incorporation Steps for all company types', () => {
  it('defines exactly the 7 common steps', () => {
    expect(INCORPORATION_FLOW_STEPS).toHaveLength(7)
    expect(INCORPORATION_FLOW_STEPS.map((s) => s.title)).toEqual([
      'Company Details',
      'Registered Office',
      'Promoter Details',
      'Capital Details',
      'Documents & KYC',
      'Review Application',
      'Submission Success',
    ])
  })

  it('all company type options map to the unified 7-step wizard', () => {
    const typeIds = companyTypeOptions.map((o) => o.id)
    expect(typeIds).toEqual(['pvt_ltd', 'llp', 'opc', 'section_8', 'public_ltd'])
  })
})

describe('Deprecated incorporation routes redirect outside 7 steps', () => {
  it('redirects /incorporation/fees-payment to submission success', async () => {
    const router = createMemoryRouter(incorporationRoutes, {
      initialEntries: [routePaths.incorporation.feesPayment],
    })
    render(<RouterProvider router={router} />)
    expect(router.state.location.pathname).toBe(routePaths.incorporation.submissionSuccess)
  })

  it('redirects /incorporation/application-tracking to /applications', async () => {
    const router = createMemoryRouter(
      [
        ...incorporationRoutes,
        { path: routePaths.applications, element: <span>Applications</span> },
      ],
      {
        initialEntries: [routePaths.incorporation.applicationTracking],
      },
    )
    render(<RouterProvider router={router} />)
    expect(router.state.location.pathname).toBe(routePaths.applications)
  })
})
