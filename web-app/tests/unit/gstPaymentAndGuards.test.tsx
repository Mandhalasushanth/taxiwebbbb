// @vitest-environment jsdom
process.env.VITE_API_BASE_URL = 'http://localhost:3000'
process.env.VITE_ENABLE_MOCKS = 'true'

import '@testing-library/jest-dom/vitest'
import { afterEach, beforeAll, beforeEach, describe, it, expect, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { authStorage } from '../../src/core/auth'
import { localStore } from '../../src/core/storage/localStorage'
import { paymentGateway, isVerifiedPayment } from '../../src/core/payments'
import { UploadDocument } from '../../src/shared/components/DocumentCard/uploadDocument'
import { PaymentCheckout } from '../../src/shared/components/PaymentCheckout/PaymentCheckout'
import { GSTDocPreviewModal } from '../../src/modules/gst/components/GSTRegistration/GSTStepDocuments/GSTDocPreviewModal'
import { useGstRegistrationState } from '../../src/modules/gst/hooks/useGstRegistrationState'
import { INITIAL_DOCUMENTS } from '../../src/modules/gst/utils/gstDocuments.constants'

vi.mock('../../src/core/config/environment', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/core/config/environment')>()
  return { ...actual, env: { ...actual.env, enableMocks: true } }
})

afterEach(cleanup)

/** Mock gateway: order + verification round trips */
const GATEWAY_WAIT = { timeout: 3000 }

beforeAll(() => {
  // jsdom has no object URLs
  Object.assign(URL, {
    createObjectURL: vi.fn(() => 'blob:preview-1'),
    revokeObjectURL: vi.fn(),
  })
})

describe('BUG-GST-010: real document preview', () => {
  it('renders an uploaded image and a PDF from a blob URL', () => {
    const image = new File([new Uint8Array([0x89, 0x50])], 'photo.png', { type: 'image/png' })
    const { rerender } = render(<GSTDocPreviewModal previewDoc={{ title: 'Photograph', fileName: 'photo.png', file: image }} onClose={() => undefined} />)
    expect(screen.getByRole('img')).toHaveAttribute('src', 'blob:preview-1')

    const pdf = new File([new Uint8Array([0x25, 0x50])], 'pan.pdf', { type: 'application/pdf' })
    rerender(<GSTDocPreviewModal previewDoc={{ title: 'PAN Card', fileName: 'pan.pdf', file: pdf }} onClose={() => undefined} />)
    expect(screen.getByTitle('PAN Card – pan.pdf')).toHaveAttribute('src', 'blob:preview-1')
  })

  it('explains when the file is no longer in memory (restored draft)', () => {
    render(<GSTDocPreviewModal previewDoc={{ title: 'PAN Card', fileName: 'pan.pdf' }} onClose={() => undefined} />)
    expect(screen.getByText('Preview not available')).toBeInTheDocument()
  })
})

describe('BUG-GST-011: labelled Delete action', () => {
  it('renders an accessible Delete button that removes the file', () => {
    const onRemove = vi.fn()
    render(<UploadDocument id="pan" title="PAN Card" isUploaded fileName="pan.pdf" onRemove={onRemove} />)
    const button = screen.getByRole('button', { name: 'Delete PAN Card (pan.pdf)' })
    expect(button).toHaveTextContent('Delete')
    expect(button).toHaveAttribute('title', 'Delete pan.pdf')
    fireEvent.click(button)
    expect(onRemove).toHaveBeenCalledWith('pan')
  })

  it('clicking Replace opens file input picker directly and replaces file on change', () => {
    const onReplace = vi.fn()
    const onUpload = vi.fn()
    const { container } = render(
      <UploadDocument
        id="pan"
        title="PAN Card"
        isUploaded
        fileName="old_pan.pdf"
        onReplace={onReplace}
        onUpload={onUpload}
      />
    )

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
    expect(fileInput).toBeTruthy()
    const clickSpy = vi.spyOn(fileInput, 'click')

    const replaceBtn = screen.getByTestId('replace-doc-pan')
    fireEvent.click(replaceBtn)

    expect(onReplace).toHaveBeenCalledWith('pan')
    expect(clickSpy).toHaveBeenCalled()

    const newFile = new File(['dummy'], 'new_pan.pdf', { type: 'application/pdf' })
    fireEvent.change(fileInput, { target: { files: [newFile] } })

    expect(onUpload).toHaveBeenCalledWith('pan', newFile)
  })

  it('clicking View Document opens the document in a new window', () => {
    const dummyFile = new File(['dummy content'], 'aadhaar.pdf', { type: 'application/pdf' })
    const windowOpenSpy = vi.spyOn(window, 'open').mockReturnValue({} as Window)

    render(
      <UploadDocument
        id="aadhaar"
        title="Aadhaar Card"
        isUploaded
        fileName="aadhaar.pdf"
        file={dummyFile}
      />
    )

    const viewBtn = screen.getByTestId('view-doc-aadhaar')
    fireEvent.click(viewBtn)

    expect(windowOpenSpy).toHaveBeenCalledWith(
      'blob:preview-1',
      '_blank'
    )
    windowOpenSpy.mockRestore()
  })
})

describe('BUG-GST-012: promo codes are validated by the payments service', () => {
  it('rejects unknown and expired codes, accepts active ones', async () => {
    expect(await paymentGateway.validateCoupon({ code: 'FAKE99', amount: 1499 })).toMatchObject({ valid: false, discountAmount: 0, message: 'Invalid promo code' })
    expect(await paymentGateway.validateCoupon({ code: 'WELCOME20', amount: 1499 })).toMatchObject({ valid: false, message: 'This promo code has expired' })
    expect(await paymentGateway.validateCoupon({ code: 'taxedge10', amount: 1499 })).toMatchObject({ valid: true, discountAmount: 150 })
  })

  it('shows an error and applies no discount for FAKE99', async () => {
    render(<PaymentCheckout amount={1499} applicationRef="GST-1" onSuccess={() => undefined} />)
    fireEvent.change(screen.getByLabelText('Promo code'), { target: { value: 'FAKE99' } })
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))
    expect(await screen.findByText('Invalid promo code')).toBeInTheDocument()
    expect(screen.getByTestId('payment-total-amount')).toHaveTextContent('1,499')
  })

  it('order amount comes from the server-side coupon, not the UI', async () => {
    const order = await paymentGateway.createOrder({ amount: 1499, applicationRef: 'GST-1', couponCode: 'FAKE99' })
    expect(order).toMatchObject({ payableAmount: 1499, discountAmount: 0 })
  })
})

describe('BUG-GST-013: only verified payments complete the flow', () => {
  it('a fake UPI handle is declined and onSuccess is never called', async () => {
    const onSuccess = vi.fn()
    render(<PaymentCheckout amount={1499} applicationRef="GST-1" onSuccess={onSuccess} />)
    fireEvent.change(screen.getByTestId('upi-id-input'), { target: { value: 'anything@fakebank' } })
    fireEvent.click(screen.getByTestId('payment-pay-now-btn'))
    expect(await screen.findByTestId('payment-error', {}, GATEWAY_WAIT)).toHaveTextContent(/could not be verified/)
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('a valid UPI payment is verified before onSuccess', async () => {
    const onSuccess = vi.fn()
    render(<PaymentCheckout amount={1499} applicationRef="GST-1" onSuccess={onSuccess} />)
    fireEvent.change(screen.getByTestId('upi-id-input'), { target: { value: 'ravi@okaxis' } })
    fireEvent.click(screen.getByTestId('payment-pay-now-btn'))
    await waitFor(() => expect(onSuccess).toHaveBeenCalled(), GATEWAY_WAIT)
    const result = onSuccess.mock.calls[0][0]
    expect(result).toMatchObject({ status: 'SUCCESS', verified: true, amount: 1499 })
    expect(isVerifiedPayment(result)).toBe(true)
  })
})

const SIGNED_IN_USER = { id: 'usr_guard', fullName: 'Ravi Kumar', email: 'ravi@example.com', mobile: '9823145672', role: 'CUSTOMER' as const, isProfileComplete: true }

const WizardStep = () => <span data-testid="step">{useGstRegistrationState().currentStep}</span>

const openWizardAt = (url: string) => {
  const router = createMemoryRouter([{ path: '/gst/registration', element: <WizardStep /> }], { initialEntries: [url] })
  render(<RouterProvider router={router} />)
  return router
}

describe('BUG-GST-014: wizard route guards', () => {
  beforeEach(() => {
    localStore.clear()
    authStorage.setUser(SIGNED_IN_USER)
  })

  it('sends ?step=payment and ?step=status back to Business when nothing is filled', async () => {
    const paymentRouter = openWizardAt('/gst/registration?step=payment')
    expect(screen.getByTestId('step')).toHaveTextContent('1')
    await waitFor(() => expect(paymentRouter.state.location.search).toBe('?step=business'))
    cleanup()

    openWizardAt('/gst/registration?step=status')
    expect(screen.getByTestId('step')).toHaveTextContent('1')
  })

  it('sends a deep link to the first pending step (Documents when uploads are missing)', async () => {
    const VALID_BUSINESS = {
      legalName: 'Tanvox Technologies Pvt Ltd', tradeName: 'Tanvox', constitution: 'Private Limited Company',
      businessPan: 'AAACT1234A', natureOfBusiness: 'Service Provision', commencementDate: '2021-04-12',
      registrationReason: 'Voluntary Basis', compositionScheme: 'No', placeOfBusiness: 'Rented',
      businessAddress: '12, MG Road, Ashok Nagar', city: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka',
      pinCode: '560001', hsnSacCode: '998313', accountHolderName: 'Ravi Kumar', accountNumber: '123456789012',
      confirmAccountNumber: '123456789012', ifscCode: 'HDFC0001234', bankName: 'HDFC Bank', branch: 'MG Road',
      accountType: 'Current', signatoryName: 'Ravi Kumar', signatoryPan: 'ABCPK1234F', dob: '1988-05-10',
      designation: 'Director', signatoryMobile: '9823145672', signatoryEmail: 'ravi@example.com', aadhaarConsent: true,
    }
    localStore.set(`taxedge_gst_draft_${SIGNED_IN_USER.id}_gst-registration`, {
      formData: { businessData: VALID_BUSINESS, documents: INITIAL_DOCUMENTS },
      currentStep: 1,
    })
    const router = openWizardAt('/gst/registration?step=status')
    expect(screen.getByTestId('step')).toHaveTextContent('2')
    await waitFor(() => expect(router.state.location.search).toBe('?step=documents'))
  })
})
