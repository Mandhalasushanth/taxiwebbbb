// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, afterEach } from 'vitest'

vi.mock('@core/config/environment', () => ({
  env: {
    appName: 'TaxEdge',
    apiBaseUrl: 'http://localhost:3000',
    enableMocks: true,
    isDev: true,
    isProd: false,
  },
}))

import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { IncorporationProvider } from '../../src/modules/incorporation/hooks'
import { SelectCompanyType } from '../../src/modules/incorporation/components/SelectCompanyType/SelectCompanyType'
import { CompanyDetails } from '../../src/modules/incorporation/components/CompanyDetails/CompanyDetails'
import { RegisteredOffice } from '../../src/modules/incorporation/components/RegisteredOffice/RegisteredOffice'
import { CapitalDetails } from '../../src/modules/incorporation/components/CapitalDetails/CapitalDetails'
import { PromoterDetails } from '../../src/modules/incorporation/components/PromoterDetails/PromoterDetails'
import { DocumentsKyc } from '../../src/modules/incorporation/components/DocumentsKyc/DocumentsKyc'

afterEach(() => {
  cleanup()
})

describe('Incorporation Required Fields Validation on Continue', () => {
  it('SelectCompanyType renders company type cards with Start action without bottom continue button', () => {
    render(
      <MemoryRouter>
        <IncorporationProvider>
          <SelectCompanyType />
        </IncorporationProvider>
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Company Registration' })).toBeInTheDocument()
    expect(screen.getByText(/Incorporate your Private Limited/i)).toBeInTheDocument()
    expect(screen.getByText('Private Limited Company (Pvt Ltd)')).toBeInTheDocument()
    expect(screen.getByText('One Person Company (OPC)')).toBeInTheDocument()
    expect(screen.getAllByText('Start').length).toBe(4)
    expect(screen.queryByRole('button', { name: /Continue/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Save Draft/i })).not.toBeInTheDocument()
  })

  it('CompanyDetails displays red warnings under required fields when clicking continue with empty fields', () => {
    render(
      <MemoryRouter>
        <IncorporationProvider>
          <CompanyDetails />
        </IncorporationProvider>
      </MemoryRouter>
    )

    const continueBtn = screen.getByRole('button', { name: /Continue/i })
    fireEvent.click(continueBtn)

    // Red warning texts
    expect(screen.getByText(/Primary business activity is required/i)).toBeInTheDocument()
    expect(screen.getByText(/First preferred name is required/i)).toBeInTheDocument()
    expect(screen.getByText(/Second preferred name is required/i)).toBeInTheDocument()
  })

  it('RegisteredOffice displays red warnings under all required address fields when clicking continue empty', () => {
    render(
      <MemoryRouter>
        <IncorporationProvider>
          <RegisteredOffice />
        </IncorporationProvider>
      </MemoryRouter>
    )

    const continueBtn = screen.getByRole('button', { name: /Continue/i })
    fireEvent.click(continueBtn)

    expect(screen.getByText(/Building \/ premises address is required/i)).toBeInTheDocument()
    expect(screen.getByText(/City is required/i)).toBeInTheDocument()
    expect(screen.getByText(/District is required/i)).toBeInTheDocument()
    expect(screen.getByText(/State is required/i)).toBeInTheDocument()
    expect(screen.getByText(/PIN code is required/i)).toBeInTheDocument()
    expect(screen.getByText(/Premises ownership status is required/i)).toBeInTheDocument()
    expect(screen.getByText(/Email address is required/i)).toBeInTheDocument()
    expect(screen.getByText(/Mobile number is required/i)).toBeInTheDocument()
  })

  it('CapitalDetails displays red warnings under all capital inputs when clicking continue empty', () => {
    render(
      <MemoryRouter>
        <IncorporationProvider>
          <CapitalDetails />
        </IncorporationProvider>
      </MemoryRouter>
    )

    const continueBtn = screen.getByRole('button', { name: /Continue/i })
    fireEvent.click(continueBtn)

    expect(screen.getByText(/Authorised capital is required/i)).toBeInTheDocument()
    expect(screen.getByText(/Subscribed capital is required/i)).toBeInTheDocument()
    expect(screen.getByText(/Total number of shares is required/i)).toBeInTheDocument()
    expect(screen.getByText(/Face value per share is required/i)).toBeInTheDocument()
  })

  it('PromoterDetails displays red warnings for required director fields when clicking continue empty', () => {
    render(
      <MemoryRouter>
        <IncorporationProvider>
          <PromoterDetails />
        </IncorporationProvider>
      </MemoryRouter>
    )

    const continueBtn = screen.getByRole('button', { name: /Continue/i })
    fireEvent.click(continueBtn)

    expect(screen.getAllByText(/Name is required/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/PAN is required/i).length).toBeGreaterThan(0)
  })

  it('DocumentsKyc displays red warnings under mandatory unuploaded documents when clicking continue', () => {
    render(
      <MemoryRouter>
        <IncorporationProvider>
          <DocumentsKyc />
        </IncorporationProvider>
      </MemoryRouter>
    )

    const continueBtn = screen.getByRole('button', { name: /Continue/i })
    fireEvent.click(continueBtn)

    expect(screen.getByText(/PAN Card is required/i)).toBeInTheDocument()
  })
})


