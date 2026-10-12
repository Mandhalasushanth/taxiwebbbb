// @vitest-environment jsdom
process.env.VITE_API_BASE_URL = 'http://localhost:3000'

import '@testing-library/jest-dom/vitest'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Suspense } from 'react'
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'

import { routeConfig } from '@app/router/routeConfig'
import { routePaths } from '@core/config'
import {
  ENQUIRY_INPUT_FILTERS,
  validateEnquiry,
  validateEnquiryField,
} from '@modules/marketing/validation/enquiryValidation'
import { COMPLIANCE_DEADLINE_RULES } from '@modules/marketing/data/marketingInteractive'
import { marketingService } from '@modules/marketing/services/marketingService'
import { getCountdownParts, getUpcomingDeadlines } from '@modules/marketing/utils/complianceDeadlines'

afterEach(cleanup)

/** Pages are lazy-loaded; the first import can take a moment in the test runner */
const LAZY_TIMEOUT_MS = 15000
/** Whole-test budget: rendering the full route tree is slow when the suite runs in parallel */
const ROUTE_TEST_TIMEOUT_MS = 30000

const renderAt = (path: string) => {
  const router = createMemoryRouter(routeConfig, { initialEntries: [path] })
  render(
    <Suspense fallback={null}>
      <RouterProvider router={router} />
    </Suspense>,
  )
  return router
}

describe('Marketing site routing', { timeout: ROUTE_TEST_TIMEOUT_MS }, () => {
  it('serves the marketing home at "/" instead of redirecting to login', async () => {
    const router = renderAt(routePaths.marketing.home)
    expect(
      await screen.findByRole('heading', { level: 1, name: /Tax, GST & Business Compliance/i }, { timeout: LAZY_TIMEOUT_MS }),
    ).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/')
  })

  it('header Login and Get Started lead to the existing auth screens', async () => {
    renderAt(routePaths.marketing.home)
    const nav = await screen.findByRole('navigation', { name: 'Main' }, { timeout: LAZY_TIMEOUT_MS })
    const header = nav.closest('header') as HTMLElement
    expect(within(header).getAllByRole('link', { name: 'Login' })[0]).toHaveAttribute('href', routePaths.auth.login)
    expect(within(header).getAllByRole('link', { name: /Get Started/ })[0]).toHaveAttribute(
      'href',
      routePaths.auth.register,
    )
  })

  it('renders pricing with category tabs and switches plans', async () => {
    renderAt(routePaths.marketing.pricing)
    const tabs = await screen.findAllByRole('tab', {}, { timeout: LAZY_TIMEOUT_MS })
    expect(tabs.map((tab) => tab.textContent)).toEqual(['GST', 'Income Tax', 'Company'])
    expect(screen.getByRole('heading', { name: 'GST Registration' })).toBeInTheDocument()
    await userEvent.click(tabs[1])
    expect(screen.getByRole('heading', { name: 'Salaried ITR' })).toBeInTheDocument()
  })

  it('renders the about page', async () => {
    renderAt(routePaths.marketing.about)
    expect(
      await screen.findByRole('heading', { level: 1, name: /compliance effortless/i }, { timeout: LAZY_TIMEOUT_MS }),
    ).toBeInTheDocument()
  })
})

describe('Interactive home sections', { timeout: ROUTE_TEST_TIMEOUT_MS }, () => {
  it('recommends services for the selected profile', async () => {
    renderAt(routePaths.marketing.home)
    const startup = await screen.findByRole('tab', { name: /Startup Founder/ }, { timeout: LAZY_TIMEOUT_MS })
    await userEvent.click(startup)
    const recommended = screen.getByRole('list', { name: 'Recommended services' })
    expect(within(recommended).getByText('Company Incorporation')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Launch your company/ })).toBeInTheDocument()
  })

  it('moves the testimonial carousel with the avatar buttons', async () => {
    renderAt(routePaths.marketing.home)
    const avatar = await screen.findByRole('button', { name: /review from Priya Sharma/ }, { timeout: LAZY_TIMEOUT_MS })
    await userEvent.click(avatar)
    expect(avatar).toHaveAttribute('aria-current', 'true')
  })

  it('shows a live countdown to the next deadline', async () => {
    renderAt(routePaths.marketing.home)
    expect(await screen.findByRole('timer', {}, { timeout: LAZY_TIMEOUT_MS })).toBeInTheDocument()
  })
})

describe('Compliance deadline dates', () => {
  it('picks the next monthly and yearly occurrences from a given day', () => {
    const from = new Date(2026, 9, 12) // 12 Oct 2026
    const [first, second, third] = getUpcomingDeadlines(COMPLIANCE_DEADLINE_RULES, 3, from)
    expect([first.id, first.dueDate.getDate(), first.dueDate.getMonth()]).toEqual(['gstr-3b', 20, 9])
    expect([second.id, second.dueDate.getDate()]).toEqual(['itr-audit', 31])
    expect([third.id, third.dueDate.getMonth()]).toEqual(['tds-deposit', 10])
  })

  it('treats a deadline as due until the end of its day', () => {
    const lateOnDueDay = new Date(2026, 9, 20, 18, 0)
    const [next] = getUpcomingDeadlines(COMPLIANCE_DEADLINE_RULES, 1, lateOnDueDay)
    expect(next.id).toBe('gstr-3b')
    expect(getCountdownParts(next.dueDate, lateOnDueDay)).toMatchObject({ days: 0, hours: 5 })
  })
})

describe('Contact enquiry form', { timeout: ROUTE_TEST_TIMEOUT_MS }, () => {
  it('shows field errors when submitted empty', async () => {
    renderAt(routePaths.marketing.contact)
    await userEvent.click(await screen.findByRole('button', { name: /Send enquiry/ }, { timeout: LAZY_TIMEOUT_MS }))
    await waitFor(() => expect(screen.getByText('Full name is required')).toBeInTheDocument())
    expect(screen.getByText('Mobile number is required')).toBeInTheDocument()
    expect(screen.getByText('Please select a service')).toBeInTheDocument()
  })

  it('selects a service pill and submits a valid enquiry', async () => {
    renderAt(routePaths.marketing.contact)
    await userEvent.type(await screen.findByLabelText(/Full name/, {}, { timeout: LAZY_TIMEOUT_MS }), 'Ravi Kumar')
    await userEvent.type(screen.getByLabelText(/Mobile number/), '9876543210')
    await userEvent.type(screen.getByLabelText(/Email address/), 'ravi@example.com')
    const gst = screen.getByRole('radio', { name: /GST Services/ })
    await userEvent.click(gst)
    expect(gst).toBeChecked()
    await userEvent.type(screen.getByLabelText(/Message/), 'Need help with GST registration')

    const submit = vi.spyOn(marketingService, 'submitEnquiry').mockResolvedValue({ reference: 'ENQ-TEST' })
    await userEvent.click(screen.getByRole('button', { name: /Send enquiry/ }))
    expect(await screen.findByText(/received your enquiry/, {}, { timeout: LAZY_TIMEOUT_MS })).toBeInTheDocument()
    expect(screen.getByText('ENQ-TEST')).toBeInTheDocument()
    expect(submit).toHaveBeenCalledWith(expect.objectContaining({ service: 'GST Services', mobile: '9876543210' }))
    submit.mockRestore()
  })

  it('validates each field by its type', () => {
    const errors = validateEnquiry({
      fullName: 'R2',
      email: 'not-an-email',
      mobile: '12345',
      service: '',
      message: 'short',
    })
    expect(Object.keys(errors).sort()).toEqual(['email', 'fullName', 'message', 'mobile', 'service'])
    expect(
      validateEnquiry({
        fullName: 'Ravi Kumar',
        email: 'ravi@example.com',
        mobile: '9876543210',
        service: 'GST Services',
        message: 'Need help with GST registration',
      }),
    ).toEqual({})
  })

  it('filters characters while typing', () => {
    expect(ENQUIRY_INPUT_FILTERS.fullName('Ravi123 Kumar')).toBe('Ravi Kumar')
    expect(ENQUIRY_INPUT_FILTERS.mobile('+91 98765-43210')).toBe('9876543210')
    expect(ENQUIRY_INPUT_FILTERS.email(' Ravi @Example.com')).toBe('ravi@example.com')
    expect(ENQUIRY_INPUT_FILTERS.email('ravi@@exa(mple).com')).toBe('ravi@example.com')
    expect(ENQUIRY_INPUT_FILTERS.message('\n\nHello\u0007\n\n\n\nthere')).toBe('Hello\n\nthere')
  })

  it.each([
    ['fullName', 'R.', /at least 2 letters/],
    ['fullName', 'Ravi--Kumar', /valid name/],
    ['fullName', 'Ravi-', /valid name/],
    ['email', 'ravi@example', /valid email/],
    ['mobile', '5876543210', /valid 10-digit/],
    ['mobile', '9999999999', /valid 10-digit/],
    ['service', 'Crypto trading', /from the list/],
    ['message', 'aaaaaaaaaaaa', /few words/],
    ['message', '1234567890', /few words/],
    ['message', 'See https://spam.example for details', /remove links/],
  ] as const)('rejects %s = "%s"', (field, value, expected) => {
    expect(validateEnquiryField(field, value)).toMatch(expected)
  })

  it.each([
    ['fullName', 'Ravi K.'],
    ['fullName', "D'Souza Anne-Marie"],
    ['message', 'Need help with my GST return for October.'],
  ] as const)('accepts %s = "%s"', (field, value) => {
    expect(validateEnquiryField(field, value)).toBeUndefined()
  })

  it('shows "required" when a field is left empty and clears the error while fixing it', async () => {
    renderAt(routePaths.marketing.contact)
    const name = await screen.findByLabelText(/Full name/, {}, { timeout: LAZY_TIMEOUT_MS })
    await userEvent.click(name)
    await userEvent.tab()
    expect(await screen.findByText('Full name is required')).toBeInTheDocument()

    await userEvent.type(name, 'Ravi')
    await waitFor(() => expect(screen.queryByText('Full name is required')).not.toBeInTheDocument())
  })
})
