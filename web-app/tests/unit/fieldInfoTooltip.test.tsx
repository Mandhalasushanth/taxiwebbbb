// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { FieldInfoTooltip } from '@shared/components'
import { GSTBusinessIdentitySection } from '../../src/modules/gst/components/GSTRegistration/GSTBusinessDetails/GSTBusinessGeneralSection'
import { GSTBusinessAddressSection } from '../../src/modules/gst/components/GSTRegistration/GSTBusinessDetails/GSTBusinessAddressSection'
import { GSTPeriodFields } from '../../src/modules/gst/components/GSTFiling/GSTFilingPeriod/GSTPeriodFields'
import { GSTCompliance } from '../../src/modules/gst/components/GSTCompliance/GSTCompliance'
import { GSTNoticeResponseFields } from '../../src/modules/gst/shared/GSTComplianceCard/GSTNoticeResponseFields'
import { GSTAmendmentSelection } from '../../src/modules/gst/components/GSTAmendment/GSTAmendmentSelection/GSTAmendmentSelection'

afterEach(() => {
  cleanup()
})

describe('FieldInfoTooltip Component', () => {
  it('renders trigger button with accessible label and aria-expanded=false initially', () => {
    render(
      <FieldInfoTooltip
        title="Test Field Information"
        description="This is a test description for the field."
      />
    )

    const trigger = screen.getByRole('button', { name: /Field information/i })
    expect(trigger).toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('supports custom ariaLabel prop', () => {
    render(
      <FieldInfoTooltip
        title="Custom Field"
        description="Custom description"
        ariaLabel="Custom field help"
      />
    )

    const trigger = screen.getByRole('button', { name: 'Custom field help' })
    expect(trigger).toBeInTheDocument()
  })

  it('opens popup when clicking trigger icon, displaying title and description', () => {
    render(
      <FieldInfoTooltip
        title="Test Field Information"
        description="This is a test description for the field."
      />
    )

    const trigger = screen.getByRole('button', { name: /Field information/i })
    fireEvent.click(trigger)

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(screen.getByText('Test Field Information')).toBeInTheDocument()
    expect(screen.getByText('This is a test description for the field.')).toBeInTheDocument()
  })

  it('closes popup when clicking trigger icon again (toggle)', () => {
    render(
      <FieldInfoTooltip
        title="Test Field Information"
        description="This is a test description for the field."
      />
    )

    const trigger = screen.getByRole('button', { name: /Field information/i })
    fireEvent.click(trigger)
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    fireEvent.click(trigger)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes popup when clicking the close (X) button', () => {
    render(
      <FieldInfoTooltip
        title="Test Field Information"
        description="This is a test description for the field."
      />
    )

    const trigger = screen.getByRole('button', { name: /Field information/i })
    fireEvent.click(trigger)

    const closeBtn = screen.getByRole('button', { name: /Close/i })
    expect(closeBtn).toBeInTheDocument()
    fireEvent.click(closeBtn)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes popup on click outside', () => {
    render(
      <div>
        <div data-testid="outside-element">Outside</div>
        <FieldInfoTooltip
          title="Test Field Information"
          description="This is a test description for the field."
        />
      </div>
    )

    const trigger = screen.getByRole('button', { name: /Field information/i })
    fireEvent.click(trigger)
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    fireEvent.mouseDown(screen.getByTestId('outside-element'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes popup when pressing Escape key', () => {
    render(
      <FieldInfoTooltip
        title="Test Field Information"
        description="This is a test description for the field."
      />
    )

    const trigger = screen.getByRole('button', { name: /Field information/i })
    fireEvent.click(trigger)
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

describe('GST Module - FieldInfoTooltip Integration Across Specified Fields', () => {
  it('1. GST Registration: renders Trade Name Information tooltip with exact required copy', () => {
    render(
      <GSTBusinessIdentitySection
        data={{
          legalName: '',
          tradeName: '',
          constitution: '',
          businessPan: '',
          natureOfBusiness: '',
          commencementDate: '',
          registrationReason: '',
          compositionScheme: 'No',
        }}
        onChange={vi.fn()}
      />
    )

    const trigger = screen.getByRole('button', { name: /Field information/i })
    expect(trigger).toBeInTheDocument()

    fireEvent.click(trigger)
    expect(screen.getByText('Trade Name Information')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Enter the trade name under which your business operates. It should match the trade name used in your GST registration details, if applicable.'
      )
    ).toBeInTheDocument()
  })

  it('2. GST Registration: renders SAC Code Information tooltip with exact required copy', () => {
    render(
      <GSTBusinessAddressSection
        data={{
          placeOfBusiness: '',
          businessAddress: '',
          city: '',
          district: '',
          state: '',
          pinCode: '',
          hsnSacCode: '',
        }}
        onChange={vi.fn()}
      />
    )

    const trigger = screen.getByRole('button', { name: /Field information/i })
    expect(trigger).toBeInTheDocument()

    fireEvent.click(trigger)
    expect(screen.getByText('SAC Code Information')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Enter the appropriate Service Accounting Code (SAC) applicable to the services provided by your business. Ensure the code matches the nature of your services.'
      )
    ).toBeInTheDocument()
  })

  it('3. GST Filing: renders GSTIN Information tooltip on GSTIN (15-Character) field', () => {
    render(
      <GSTPeriodFields
        frequency="monthly"
        financialYear="2025-26"
        setFinancialYear={vi.fn()}
        returnPeriod="2025-04"
        setReturnPeriod={vi.fn()}
        periodOptions={[]}
        filingType="regular"
        setFilingType={vi.fn()}
        calculationMethod="manual"
        setCalculationMethod={vi.fn()}
        estimatedSales=""
        setEstimatedSales={vi.fn()}
        estimatedPurchases=""
        setEstimatedPurchases={vi.fn()}
        estimatedItc=""
        setEstimatedItc={vi.fn()}
        gstin=""
        setGstin={vi.fn()}
        returnType="gstr1"
        setReturnType={vi.fn()}
        errors={{}}
        handleClearError={vi.fn()}
      />
    )

    const trigger = screen.getByRole('button', { name: /Field information/i })
    expect(trigger).toBeInTheDocument()

    fireEvent.click(trigger)
    expect(screen.getByText('GSTIN Information')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Enter your valid 15-digit GST Identification Number. Ensure it matches your GST registration.'
      )
    ).toBeInTheDocument()
  })

  it('4. GST Compliance: renders GSTIN Information tooltip on GSTIN field', () => {
    render(
      <MemoryRouter>
        <GSTCompliance />
      </MemoryRouter>
    )

    const trigger = screen.getByRole('button', { name: /Field information/i })
    expect(trigger).toBeInTheDocument()

    fireEvent.click(trigger)
    expect(screen.getByText('GSTIN Information')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Enter the valid 15-digit GST Identification Number associated with the GST registration for which you want to manage compliance.'
      )
    ).toBeInTheDocument()
  })

  it('5. GST Compliance: renders Notice Number Information tooltip on Notice Number field', () => {
    render(
      <GSTNoticeResponseFields
        values={{
          noticeNumber: '',
          issueDate: '',
          dueDate: '',
          additionalInfo: '',
        }}
        errors={{}}
        onChange={vi.fn()}
      />
    )

    const trigger = screen.getByRole('button', { name: /Field information/i })
    expect(trigger).toBeInTheDocument()

    fireEvent.click(trigger)
    expect(screen.getByText('Notice Number Information')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Enter the notice or reference number mentioned in the GST notice issued by the GST department. Ensure the number matches the official notice.'
      )
    ).toBeInTheDocument()
  })

  it('6. GST Amendment: renders GSTIN to Amend Information tooltip on GSTIN to Amend field', () => {
    render(
      <GSTAmendmentSelection
        gstin=""
        onGstinChange={vi.fn()}
        onSelectOption={vi.fn()}
      />
    )

    const trigger = screen.getByRole('button', { name: /Field information/i })
    expect(trigger).toBeInTheDocument()

    fireEvent.click(trigger)
    expect(screen.getByText('GSTIN to Amend Information')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Enter the 15-digit GSTIN of the existing GST registration for which you want to request an amendment. Ensure you select the correct registration.'
      )
    ).toBeInTheDocument()
  })
})

describe('GST Registration - Primary HSN / SAC Code Classification Badge', () => {
  const baseData = {
    placeOfBusiness: '',
    businessAddress: '',
    city: '',
    district: '',
    state: '',
    pinCode: '',
    hsnSacCode: '',
  }

  it('displays "✓ HSN (Goods) — 4 digits" when a valid 4-digit HSN code is entered', () => {
    render(
      <GSTBusinessAddressSection
        data={{ ...baseData, hsnSacCode: '1234' }}
        onChange={vi.fn()}
      />
    )
    const badge = screen.getByTestId('gst-hsn-badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('✓ HSN (Goods) — 4 digits')
  })

  it('displays "✓ HSN (Goods) — 6 digits" when a valid 6-digit HSN code is entered', () => {
    render(
      <GSTBusinessAddressSection
        data={{ ...baseData, hsnSacCode: '123455' }}
        onChange={vi.fn()}
      />
    )
    const badge = screen.getByTestId('gst-hsn-badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('✓ HSN (Goods) — 6 digits')
  })

  it('displays "✓ HSN (Goods) — 8 digits" when a valid 8-digit HSN code is entered', () => {
    render(
      <GSTBusinessAddressSection
        data={{ ...baseData, hsnSacCode: '12345555' }}
        onChange={vi.fn()}
      />
    )
    const badge = screen.getByTestId('gst-hsn-badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('✓ HSN (Goods) — 8 digits')
  })

  it('displays "✓ SAC (Services) — 6 digits" when a valid 6-digit SAC code is entered', () => {
    render(
      <GSTBusinessAddressSection
        data={{ ...baseData, hsnSacCode: '998311' }}
        onChange={vi.fn()}
      />
    )
    const badge = screen.getByTestId('gst-hsn-badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('✓ SAC (Services) — 6 digits')
  })

  it('does not display badge for invalid, incomplete, or non-6-digit SAC codes', () => {
    const { rerender } = render(
      <GSTBusinessAddressSection
        data={{ ...baseData, hsnSacCode: '123' }}
        onChange={vi.fn()}
      />
    )
    expect(screen.queryByTestId('gst-hsn-badge')).not.toBeInTheDocument()

    rerender(
      <GSTBusinessAddressSection
        data={{ ...baseData, hsnSacCode: '9983' }}
        onChange={vi.fn()}
      />
    )
    expect(screen.queryByTestId('gst-hsn-badge')).not.toBeInTheDocument()

    rerender(
      <GSTBusinessAddressSection
        data={{ ...baseData, hsnSacCode: '0012' }}
        onChange={vi.fn()}
      />
    )
    expect(screen.queryByTestId('gst-hsn-badge')).not.toBeInTheDocument()
  })

  it('does not display badge when there is an explicit field error', () => {
    render(
      <GSTBusinessAddressSection
        data={{ ...baseData, hsnSacCode: '1234' }}
        errors={{ hsnSacCode: 'Invalid HSN' }}
        onChange={vi.fn()}
      />
    )
    expect(screen.queryByTestId('gst-hsn-badge')).not.toBeInTheDocument()
    expect(screen.getByText('Invalid HSN')).toBeInTheDocument()
  })
})
