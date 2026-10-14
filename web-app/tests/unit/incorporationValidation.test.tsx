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
    expect(screen.getByText('Limited Liability Partnership (LLP)')).toBeInTheDocument()
    expect(screen.getAllByText('Start').length).toBe(5)
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
    expect(screen.getByText('Category of company is required')).toBeInTheDocument()
    expect(screen.getByText(/Sub-category of company is required/i)).toBeInTheDocument()
    expect(screen.queryByText(/Class of company/i)).not.toBeInTheDocument()
    expect(screen.getByText('Proposed company name is required')).toBeInTheDocument()
    expect(screen.getByText('Primary business activity is required')).toBeInTheDocument()
    expect(screen.getByText('NIC 5-digit code is required')).toBeInTheDocument()

    // NIC accepts digits only, max 5
    const nicInput = screen.getByPlaceholderText('Enter 5-digit NIC Code') as HTMLInputElement
    fireEvent.change(nicInput, { target: { value: '62a0119' } })
    expect(nicInput.value).toBe('62011')
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
    expect(screen.getByText(/Face value per share is required/i)).toBeInTheDocument()
  })

  it('CapitalDetails dynamically recalculates Authorised Shares and handles fractional shares', () => {
    render(
      <MemoryRouter>
        <IncorporationProvider>
          <CapitalDetails />
        </IncorporationProvider>
      </MemoryRouter>
    )

    const authCapInput = screen.getByPlaceholderText('e.g. 100000')
    const faceValueInput = screen.getByPlaceholderText('e.g. 10')

    // Initial state: -- shares (not misleading 0 shares)
    expect(screen.getByText('-- shares')).toBeInTheDocument()

    // Enter 100,000 and 10 -> 10,000 shares
    fireEvent.change(authCapInput, { target: { value: '100000' } })
    fireEvent.change(faceValueInput, { target: { value: '10' } })
    expect(screen.getByText('10,000 shares')).toBeInTheDocument()

    // Change face value to 100 -> dynamically recalculates to 1,000 shares
    fireEvent.change(faceValueInput, { target: { value: '100' } })
    expect(screen.getByText('1,000 shares')).toBeInTheDocument()

    // Test indivisible / fractional shares validation
    fireEvent.change(authCapInput, { target: { value: '100005' } })
    fireEvent.change(faceValueInput, { target: { value: '10' } })
    const continueBtn = screen.getByRole('button', { name: /Continue/i })
    fireEvent.click(continueBtn)
    expect(screen.getByText('Authorised capital must be a multiple of face value per share')).toBeInTheDocument()
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

    // With 0 directors, clicking continue displays the minimum directors warning
    expect(screen.getByText(/At least 2 promoter\/director\(s\) required for Private Limited\./i)).toBeInTheDocument()

    // Add Director #1
    const addBtn = screen.getByRole('button', { name: /\+ Add Promoter \/ Director/i })
    fireEvent.click(addBtn)

    // Now clicking continue validates Director #1 required fields
    fireEvent.click(continueBtn)

    expect(screen.getAllByText(/Name is required/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/PAN is required/i).length).toBeGreaterThan(0)
    expect(screen.getByText('Designation is required')).toBeInTheDocument()
    expect(screen.getByText('Mobile number is required')).toBeInTheDocument()
    expect(screen.queryByText(/Father's name is required/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/equity shares is required/i)).not.toBeInTheDocument()
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

  it('PromoterDetails requires adding Director #1, shows red warning for min 2 directors on continue, then succeeds with Director #2', () => {
    render(
      <MemoryRouter>
        <IncorporationProvider>
          <PromoterDetails />
        </IncorporationProvider>
      </MemoryRouter>
    )

    // 1. Initial state: No directors, no warnings, only + Add Promoter / Director button
    expect(screen.queryByText(/Director #1/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/At least 2 promoter\/director/i)).not.toBeInTheDocument()
    const addBtn = screen.getByRole('button', { name: /\+ Add Promoter \/ Director/i })
    expect(addBtn).toBeInTheDocument()

    // 2. Click + Add Promoter / Director -> Director #1 appears
    fireEvent.click(addBtn)
    expect(screen.getByText('Director #1')).toBeInTheDocument()

    // Fill Director #1 fields
    const nameInputs = screen.getAllByPlaceholderText('Full Legal Name')
    fireEvent.change(nameInputs[0], { target: { value: 'Sagarika Sen' } })

    const panInputs = screen.getAllByPlaceholderText('10-character PAN')
    fireEvent.change(panInputs[0], { target: { value: 'GHFTJ5678G' } })

    const dobInputs = screen.getAllByPlaceholderText('DD-MM-YYYY')
    fireEvent.change(dobInputs[0], { target: { value: '1990-05-15' } })

    const desigInputs = screen.getAllByPlaceholderText('e.g. Director')
    fireEvent.change(desigInputs[0], { target: { value: 'Director' } })

    const emailInputs = screen.getAllByPlaceholderText('Enter Email Address')
    fireEvent.change(emailInputs[0], { target: { value: 'sagarika@gmail.com' } })

    const mobileInputs = screen.getAllByPlaceholderText('Enter 10-digit Mobile')
    fireEvent.change(mobileInputs[0], { target: { value: '9876543210' } })

    // Save Director #1
    const saveBtn = screen.getByRole('button', { name: /✓ Save Changes/i })
    fireEvent.click(saveBtn)

    // 3. Click Continue with only 1 director -> shows red warning
    const continueBtn = screen.getByRole('button', { name: /Continue/i })
    fireEvent.click(continueBtn)
    expect(screen.getByText('At least 2 promoter/director(s) required for Private Limited.')).toBeInTheDocument()

    // 4. Click + Add Promoter / Director to add Director #2
    fireEvent.click(screen.getByRole('button', { name: /\+ Add Promoter \/ Director/i }))
    expect(screen.getByText('Director #2')).toBeInTheDocument()

    // Fill Director #2 fields (Director #1 is collapsed, so only Director #2 form is open)
    fireEvent.change(screen.getByPlaceholderText('Full Legal Name'), { target: { value: 'Vikram Sen' } })
    fireEvent.change(screen.getByPlaceholderText('10-character PAN'), { target: { value: 'ABCDE1234F' } })
    fireEvent.change(screen.getByPlaceholderText('DD-MM-YYYY'), { target: { value: '1988-10-20' } })
    fireEvent.change(screen.getByPlaceholderText('e.g. Director'), { target: { value: 'Director' } })
    fireEvent.change(screen.getByPlaceholderText('Enter Email Address'), { target: { value: 'vikram@gmail.com' } })
    fireEvent.change(screen.getByPlaceholderText('Enter 10-digit Mobile'), { target: { value: '9876543211' } })

    // 5. Click Continue with both directors valid -> warning is cleared and proceeds
    fireEvent.click(continueBtn)
    expect(screen.queryByText('At least 2 promoter/director(s) required for Private Limited.')).not.toBeInTheDocument()
  })

  it('DirectorCard collapses on Save Changes and on Collapse click, and expands on Edit click', () => {
    render(
      <MemoryRouter>
        <IncorporationProvider>
          <PromoterDetails />
        </IncorporationProvider>
      </MemoryRouter>
    )

    // Add Director #1
    fireEvent.click(screen.getByRole('button', { name: /\+ Add Promoter \/ Director/i }))

    // Form is open
    expect(screen.getByPlaceholderText('Full Legal Name')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /⌃ Collapse/i })).toBeInTheDocument()

    // Fill valid data
    fireEvent.change(screen.getByPlaceholderText('Full Legal Name'), { target: { value: 'Gouri Prasad Parichha' } })
    fireEvent.change(screen.getByPlaceholderText('10-character PAN'), { target: { value: 'CFADH5467R' } })
    fireEvent.change(screen.getByPlaceholderText('DD-MM-YYYY'), { target: { value: '1997-12-30' } })
    fireEvent.change(screen.getByPlaceholderText('e.g. Director'), { target: { value: 'Director' } })
    fireEvent.change(screen.getByPlaceholderText('Enter Email Address'), { target: { value: 'gouri@gmail.com' } })
    fireEvent.change(screen.getByPlaceholderText('Enter 10-digit Mobile'), { target: { value: '7654345678' } })

    // Clicking ✓ Save Changes collapses the card
    fireEvent.click(screen.getByRole('button', { name: /✓ Save Changes/i }))
    expect(screen.queryByPlaceholderText('Full Legal Name')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument()

    // Clicking Edit expands the card again
    fireEvent.click(screen.getByRole('button', { name: /Edit/i }))
    expect(screen.getByPlaceholderText('Full Legal Name')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /⌃ Collapse/i })).toBeInTheDocument()

    // Clicking ⌃ Collapse collapses the card
    fireEvent.click(screen.getByRole('button', { name: /⌃ Collapse/i }))
    expect(screen.queryByPlaceholderText('Full Legal Name')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument()
  })
})


