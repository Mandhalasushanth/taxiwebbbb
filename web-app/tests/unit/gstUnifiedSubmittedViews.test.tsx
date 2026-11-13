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

  it('5. GST Certificate renders dedicated REG-06 verification UI with correct user data', () => {
    render(
      <MemoryRouter>
        <GSTCertificateSubmitted
          applicationId="GST-2026-33445"
          businessName="sagarika traders"
        />
      </MemoryRouter>
    )

    expect(screen.getByText('Your Application Under Verification')).toBeDefined()
    expect(screen.getByText(/After the verification process, your GST certificate will be downloaded/i)).toBeDefined()
    expect(screen.getAllByText('sagarika traders').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: /Track Application/i })).toBeDefined()
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

  it('7. Action buttons trigger navigation callbacks on submitted page', () => {
    const onBackToDashboard = vi.fn()
    const onTrackApplication = vi.fn()
    const onContactSupport = vi.fn()

    render(
      <MemoryRouter>
        <GSTFilingSuccess
          details={{ applicationRef: 'GST-2026-98765' } as any}
          businessName="sagarika traders"
          onBackToDashboard={onBackToDashboard}
          onTrackApplication={onTrackApplication}
          onContactSupport={onContactSupport}
        />
      </MemoryRouter>
    )

    screen.getByRole('button', { name: /Go to Dashboard/i }).click()
    expect(onBackToDashboard).toHaveBeenCalledTimes(1)

    screen.getByRole('button', { name: /Contact Support \/ CA/i }).click()
    expect(onContactSupport).toHaveBeenCalledTimes(1)

    screen.getByRole('button', { name: /Track in My Applications/i }).click()
    expect(onTrackApplication).toHaveBeenCalledTimes(1)
  })

  it('8. GST Compliance GSTSuccessView action buttons trigger correct dashboard, track, and support callbacks', () => {
    const onBackToDashboard = vi.fn()
    const onTrackApplications = vi.fn()
    const onContactSupport = vi.fn()

    render(
      <MemoryRouter>
        <GSTSuccessView
          applicationId="GSTC-2026-49829"
          requestType="Notice Response"
          businessName="sagarika traders"
          onBackToDashboard={onBackToDashboard}
          onTrackApplications={onTrackApplications}
          onContactSupport={onContactSupport}
        />
      </MemoryRouter>
    )

    screen.getByRole('button', { name: /Go to Dashboard/i }).click()
    expect(onBackToDashboard).toHaveBeenCalledTimes(1)

    screen.getByRole('button', { name: /Contact Support \/ CA/i }).click()
    expect(onContactSupport).toHaveBeenCalledTimes(1)

    screen.getByRole('button', { name: /Track in My Applications/i }).click()
    expect(onTrackApplications).toHaveBeenCalledTimes(1)
  })

  it('9. All GST submitted views default buttons to dashboard, applications tracker, and support routes', () => {
    // Test GSTCancellationSubmitted
    const { unmount: unmount1 } = render(
      <MemoryRouter>
        <GSTCancellationSubmitted
          applicationId="GST-2026-11111"
          businessName="sagarika traders"
        />
      </MemoryRouter>
    )
    expect(screen.getByRole('button', { name: /Go to Dashboard/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /Contact Support \/ CA/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /Track in My Applications/i })).toBeDefined()
    unmount1()

    // Test GSTCertificateSubmitted
    const { unmount: unmount2 } = render(
      <MemoryRouter>
        <GSTCertificateSubmitted
          applicationId="GST-2026-22222"
          businessName="sagarika traders"
        />
      </MemoryRouter>
    )
    expect(screen.getByRole('button', { name: /Track Application/i })).toBeDefined()
    unmount2()

    // Test GSTAmendmentSubmitted
    const { unmount: unmount3 } = render(
      <MemoryRouter>
        <GSTAmendmentSubmitted
          arnNumber="GST-2026-33333"
          businessName="sagarika traders"
        />
      </MemoryRouter>
    )
    expect(screen.getByRole('button', { name: /Go to Dashboard/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /Contact Support \/ CA/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /Track in My Applications/i })).toBeDefined()
    unmount3()
  })
})

