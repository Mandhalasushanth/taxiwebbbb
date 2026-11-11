// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { GSTPaymentSuccess } from '../../src/modules/gst/components/GSTRegistration/GSTPaymentSuccess/GSTPaymentSuccess'
import { GSTFilingSuccess } from '../../src/modules/gst/components/GSTFiling/GSTFilingSuccess/GSTFilingSuccess'
import { GSTAmendmentSubmitted } from '../../src/modules/gst/components/GSTAmendment/GSTAmendmentSubmitted/GSTAmendmentSubmitted'
import { GSTSuccessView } from '../../src/modules/gst/components/GSTCompliance/GSTSuccessView'
import { GSTCertificateSubmitted } from '../../src/modules/gst/components/GSTCertificate/GSTCertificateSubmitted/GSTCertificateSubmitted'
import { GSTCancellationSubmitted } from '../../src/modules/gst/components/GSTCancellation/GSTCancellationSubmitted'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('Unified GST Application Submitted View Across Services', () => {
  it('1. GST Registration renders unified submission UI with correct user data', () => {
    render(
      <MemoryRouter>
        <GSTPaymentSuccess
          details={{ applicationRef: 'GST-2026-57284' } as any}
          businessName="sagarika traders"
        />
      </MemoryRouter>
    )

    expect(screen.getByText('Application Submitted!')).toBeDefined()
    expect(screen.getByText('GST-2026-57284')).toBeDefined()
    expect(screen.getByText('Under Verification')).toBeDefined()
    expect(screen.getByText('sagarika traders')).toBeDefined()
    expect(screen.getByText('GST Registration')).toBeDefined()
    expect(screen.getByText('Today')).toBeDefined()
    expect(screen.getByRole('button', { name: /Go to Dashboard/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /Contact Support \/ CA/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /Track in My Applications/i })).toBeDefined()
  })

  it('2. GST Filing renders unified submission UI with correct user data', () => {
    render(
      <MemoryRouter>
        <GSTFilingSuccess
          details={{ applicationRef: 'GST-2026-98765' } as any}
          businessName="sagarika traders"
        />
      </MemoryRouter>
    )

    expect(screen.getByText('Application Submitted!')).toBeDefined()
    expect(screen.getByText('GST-2026-98765')).toBeDefined()
    expect(screen.getByText('Under Verification')).toBeDefined()
    expect(screen.getByText('sagarika traders')).toBeDefined()
    expect(screen.getByText('GST Filing')).toBeDefined()
    expect(screen.getByRole('button', { name: /Go to Dashboard/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /Contact Support \/ CA/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /Track in My Applications/i })).toBeDefined()
  })

  it('3. GST Amendment renders unified submission UI with correct user data', () => {
    render(
      <MemoryRouter>
        <GSTAmendmentSubmitted
          arnNumber="GST-2026-44321"
          businessName="sagarika traders"
        />
      </MemoryRouter>
    )

    expect(screen.getByText('Application Submitted!')).toBeDefined()
    expect(screen.getByText('GST-2026-44321')).toBeDefined()
    expect(screen.getByText('Under Verification')).toBeDefined()
    expect(screen.getByText('sagarika traders')).toBeDefined()
    expect(screen.getByText('GST Amendment')).toBeDefined()
    expect(screen.getByRole('button', { name: /Go to Dashboard/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /Contact Support \/ CA/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /Track in My Applications/i })).toBeDefined()
  })

  it('4. GST Compliance renders unified submission UI with correct user data', () => {
    render(
      <MemoryRouter>
        <GSTSuccessView
          applicationId="GST-2026-11223"
          requestType="Notice Response"
          businessName="sagarika traders"
        />
      </MemoryRouter>
    )

    expect(screen.getByText('Application Submitted!')).toBeDefined()
    expect(screen.getByText('GST-2026-11223')).toBeDefined()
    expect(screen.getByText('Under Verification')).toBeDefined()
    expect(screen.getByText('sagarika traders')).toBeDefined()
    expect(screen.getByText('GST Compliance')).toBeDefined()
    expect(screen.getByRole('button', { name: /Go to Dashboard/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /Contact Support \/ CA/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /Track in My Applications/i })).toBeDefined()
  })

  it('5. GST Certificate renders unified submission UI with correct user data', () => {
    render(
      <MemoryRouter>
        <GSTCertificateSubmitted
          applicationId="GST-2026-33445"
          businessName="sagarika traders"
        />
      </MemoryRouter>
    )

    expect(screen.getByText('Application Submitted!')).toBeDefined()
    expect(screen.getByText('GST-2026-33445')).toBeDefined()
    expect(screen.getByText('Under Verification')).toBeDefined()
    expect(screen.getByText('sagarika traders')).toBeDefined()
    expect(screen.getByText('GST Certificate')).toBeDefined()
    expect(screen.getByRole('button', { name: /Go to Dashboard/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /Contact Support \/ CA/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /Track in My Applications/i })).toBeDefined()
  })

  it('6. GST Cancellation renders unified submission UI with correct user data', () => {
    render(
      <MemoryRouter>
        <GSTCancellationSubmitted
          applicationId="GST-2026-77889"
          gstin="29AAAAA0000A1Z5"
          businessName="sagarika traders"
        />
      </MemoryRouter>
    )

    expect(screen.getByText('Application Submitted!')).toBeDefined()
    expect(screen.getByText('GST-2026-77889')).toBeDefined()
    expect(screen.getByText('Under Verification')).toBeDefined()
    expect(screen.getByText('sagarika traders')).toBeDefined()
    expect(screen.getByText('GST Cancellation')).toBeDefined()
    expect(screen.getByRole('button', { name: /Go to Dashboard/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /Contact Support \/ CA/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /Track in My Applications/i })).toBeDefined()
  })
})

