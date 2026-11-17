// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { getApplicationServiceIcon } from '@modules/applications/utils/applicationIconUtils'
import { ApplicationCard } from '@modules/applications/components/ApplicationCard'
import type { ApplicationsItem } from '@modules/applications/types/applications.types'

describe('Application respective service icons', () => {
  it('correctly maps each service to its respective 3D illustration icon path', () => {
    // 1. GST Services
    expect(getApplicationServiceIcon({ title: 'GST Registration', category: 'GST' })).toBe('/assets/icons/gst/gst-registration.png')
    expect(getApplicationServiceIcon({ title: 'GST Filing (GSTR_1 - July 2025)', category: 'GST' })).toBe('/assets/icons/gst/gst-filing.png')
    expect(getApplicationServiceIcon({ title: 'GST Amendment', category: 'GST' })).toBe('/assets/icons/gst/gst-amendment.png')
    expect(getApplicationServiceIcon({ title: 'GST Cancellation', category: 'GST' })).toBe('/assets/icons/gst/gst-cancellation.png')
    expect(getApplicationServiceIcon({ title: 'GST Certificate', category: 'GST' })).toBe('/assets/icons/gst/gst-certificate.png')
    expect(getApplicationServiceIcon({ title: 'GST Compliance', category: 'GST' })).toBe('/assets/icons/gst/gst-compliance.png')

    // 2. ITR & Tax Services
    expect(getApplicationServiceIcon({ title: 'TDS Refund Claim', category: 'ITR' })).toBe('/assets/icons/itr/tds-refund.png')
    expect(getApplicationServiceIcon({ title: 'ITR Filing (AY 2026-2027)', category: 'ITR' })).toBe('/assets/icons/itr/itr-filing.png')
    expect(getApplicationServiceIcon({ title: 'ITR Filing (AY 2025-2026)', category: 'ITR' })).toBe('/assets/icons/itr/itr-filing.png')
    expect(getApplicationServiceIcon({ title: 'Revised ITR Filing', category: 'ITR' })).toBe('/assets/icons/itr/revised-itr.png')
    expect(getApplicationServiceIcon({ title: 'Previous Year ITR', category: 'ITR' })).toBe('/assets/icons/itr/previous-year-itr.png')
    expect(getApplicationServiceIcon({ title: 'Tax Notice Assistance', category: 'ITR' })).toBe('/assets/icons/itr/tax-notice-assistance.png')

    // 3. Loans
    expect(getApplicationServiceIcon({ title: 'Personal Loan', category: 'Loans' })).toBe('/assets/icons/loans/personal-loan.png')
    expect(getApplicationServiceIcon({ title: 'Business Working Capital', category: 'Loans' })).toBe('/assets/icons/loans/business-loan.png')
    expect(getApplicationServiceIcon({ title: 'Home Loan', category: 'Loans' })).toBe('/assets/icons/loans/home-loan.png')
    expect(getApplicationServiceIcon({ title: 'Property Loan', category: 'Loans' })).toBe('/assets/icons/loans/property-loan.png')
    expect(getApplicationServiceIcon({ title: 'Vehicle Loan', category: 'Loans' })).toBe('/assets/icons/loans/vehicle-loan.png')
    expect(getApplicationServiceIcon({ title: 'Machinery Loan', category: 'Loans' })).toBe('/assets/icons/loans/machinery-loan.png')
    expect(getApplicationServiceIcon({ title: 'MSME Loan', category: 'Loans' })).toBe('/assets/icons/loans/msme-loan.png')
    expect(getApplicationServiceIcon({ title: 'Project Finance', category: 'Loans' })).toBe('/assets/icons/loans/project-finance.png')

    // 4. Incorporation
    expect(getApplicationServiceIcon({ title: 'Private Limited Company', category: 'Company Registration' })).toBe('/assets/icons/incorporation/pvt-ltd.png')
    expect(getApplicationServiceIcon({ title: 'Limited Liability Partnership', category: 'Company Registration' })).toBe('/assets/icons/incorporation/llp.png')
    expect(getApplicationServiceIcon({ title: 'One Person Company', category: 'Company Registration' })).toBe('/assets/icons/incorporation/opc.png')
    expect(getApplicationServiceIcon({ title: 'Section 8 Company', category: 'Company Registration' })).toBe('/assets/icons/incorporation/section-8.png')
    expect(getApplicationServiceIcon({ title: 'Public Limited Company', category: 'Company Registration' })).toBe('/assets/icons/incorporation/public-ltd.png')
  })

  it('renders TDS Refund Claim card with tds-refund.png image icon', () => {
    const tdsItem: ApplicationsItem = {
      id: 'app-tds-1',
      reference: 'TDS-2026-88192',
      title: 'TDS Refund Claim',
      category: 'ITR',
      status: 'SUBMITTED',
      statusLabel: 'Submitted',
      date: '5 Nov 2026, 5:07 pm',
    }

    render(
      <MemoryRouter>
        <ApplicationCard item={tdsItem} />
      </MemoryRouter>
    )

    const img = screen.getByRole('img', { name: 'TDS Refund Claim' }) as HTMLImageElement
    expect(img).toBeDefined()
    expect(img.src).toContain('/assets/icons/itr/tds-refund.png')
  })

  it('renders GST Registration card with gst-registration.png image icon', () => {
    const gstRegItem: ApplicationsItem = {
      id: 'app-gst-1',
      reference: 'GST-REG-2026-118',
      title: 'GST Registration',
      category: 'GST',
      status: 'SUBMITTED',
      statusLabel: 'Submitted',
      date: '9 Nov 2026, 5:48 pm',
    }

    render(
      <MemoryRouter>
        <ApplicationCard item={gstRegItem} />
      </MemoryRouter>
    )

    const img = screen.getByRole('img', { name: 'GST Registration' }) as HTMLImageElement
    expect(img).toBeDefined()
    expect(img.src).toContain('/assets/icons/gst/gst-registration.png')
  })

  it('renders GST Filing (GSTR_1 - July 2025) card with gst-filing.png image icon', () => {
    const gstFilItem: ApplicationsItem = {
      id: 'app-gst-fil-1',
      reference: 'GST-FIL-2026-31583',
      title: 'GST Filing (GSTR_1 - July 2025)',
      category: 'GST',
      status: 'SUBMITTED',
      statusLabel: 'Submitted',
      date: '9 Nov 2026, 5:47 pm',
    }

    render(
      <MemoryRouter>
        <ApplicationCard item={gstFilItem} />
      </MemoryRouter>
    )

    const img = screen.getByRole('img', { name: 'GST Filing (GSTR_1 - July 2025)' }) as HTMLImageElement
    expect(img).toBeDefined()
    expect(img.src).toContain('/assets/icons/gst/gst-filing.png')
  })

  it('renders ITR Filing (AY 2026-2027) card with itr-filing.png image icon', () => {
    const itrFilItem: ApplicationsItem = {
      id: 'app-itr-fil-1',
      reference: 'ITR-FIL-2026-44191',
      title: 'ITR Filing (AY 2026-2027)',
      category: 'ITR',
      status: 'SUBMITTED',
      statusLabel: 'Submitted',
      date: '5 Nov 2026, 5:11 pm',
    }

    render(
      <MemoryRouter>
        <ApplicationCard item={itrFilItem} />
      </MemoryRouter>
    )

    const img = screen.getByRole('img', { name: 'ITR Filing (AY 2026-2027)' }) as HTMLImageElement
    expect(img).toBeDefined()
    expect(img.src).toContain('/assets/icons/itr/itr-filing.png')
  })
})
