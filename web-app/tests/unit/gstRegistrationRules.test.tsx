// @vitest-environment jsdom
process.env.VITE_API_BASE_URL = 'http://localhost:3000'

import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, describe, it, expect } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { authStorage } from '../../src/core/auth'
import { localStore } from '../../src/core/storage/localStorage'
import { userStorage } from '../../src/core/storage/userStorage'
import { getStatesForPincode, validateCommencementDate, validatePincodeMatchesState } from '../../src/shared/utils'
import { validateUploadFile, DOCUMENT_UPLOAD_RULE, PHOTO_UPLOAD_RULE } from '../../src/shared/upload'
import { validateGstBusinessForm } from '../../src/modules/gst/validation/gstStepBusiness.validator'
import { validateBusinessPan, getCompositionConflicts } from '../../src/modules/gst/validation/gstBusinessRules'
import { gstInput } from '../../src/modules/gst/utils/gstInputFormatters'
import { useServiceDraft, readServiceDraft, DRAFT_NAMESPACES } from '../../src/shared/saveDraft'
import { useGstRegistrationState } from '../../src/modules/gst/hooks/useGstRegistrationState'
import type { GstBusinessFormData } from '../../src/modules/gst/types/gstBusiness.types'
import { INITIAL_DOCUMENTS } from '../../src/modules/gst/utils/gstDocuments.constants'

afterEach(cleanup)

const VALID_FORM: GstBusinessFormData = {
  legalName: 'Tanvox Technologies Pvt Ltd',
  tradeName: 'Tanvox',
  constitution: 'Private Limited Company',
  businessPan: 'AAACT1234A',
  natureOfBusiness: 'Service Provision',
  commencementDate: '2021-04-12',
  registrationReason: 'Voluntary Basis',
  compositionScheme: 'No',
  placeOfBusiness: 'Rented',
  businessAddress: '12, MG Road, Ashok Nagar',
  city: 'Bengaluru',
  district: 'Bengaluru Urban',
  state: 'Karnataka',
  pinCode: '560001',
  hsnSacCode: '998313',
  accountHolderName: 'Ravi Kumar',
  accountNumber: '123456789012',
  confirmAccountNumber: '123456789012',
  ifscCode: 'HDFC0001234',
  bankName: 'HDFC Bank',
  branch: 'MG Road',
  accountType: 'Current',
  signatoryName: 'Ravi Kumar',
  signatoryPan: 'ABCPK1234F',
  dob: '1988-05-10',
  designation: 'Director',
  signatoryMobile: '9823145672',
  signatoryEmail: 'ravi@example.com',
  aadhaarConsent: true,
}

const errorsFor = (patch: Partial<GstBusinessFormData>) => validateGstBusinessForm({ ...VALID_FORM, ...patch })

describe('baseline', () => {
  it('accepts a complete, consistent form', () => {
    expect(errorsFor({})).toEqual({})
  })
})

describe('BUG-GST-001: Branch is mandatory', () => {
  it('blocks progression when Branch is empty', () => {
    expect(errorsFor({ branch: '' }).branch).toBe('Branch is required')
  })
})

describe('BUG-GST-002: Date of commencement range', () => {
  const today = new Date('2026-10-05T00:00:00')
  it('rejects implausible past and far-future dates', () => {
    expect(validateCommencementDate('1900-01-01', today)).toMatch(/100 years in the past/)
    expect(validateCommencementDate('2027-01-01', today)).toMatch(/30 days in the future/)
    expect(validateCommencementDate('2023-02-30', today)).toBe('Please select a valid date')
  })
  it('accepts recent and near-future dates', () => {
    expect(validateCommencementDate('1990-06-01', today)).toBeNull()
    expect(validateCommencementDate('2026-10-20', today)).toBeNull()
  })
})

describe('BUG-GST-003: HSN / SAC numeric 4, 6 or 8 digits', () => {
  it('rejects letters and wrong lengths', () => {
    expect(errorsFor({ hsnSacCode: 'AB12' }).hsnSacCode).toMatch(/digits only/)
    expect(errorsFor({ hsnSacCode: '12345' }).hsnSacCode).toMatch(/4, 6 or 8 digits/)
  })
  it('accepts 4, 6 and 8 digits and strips non-digits while typing', () => {
    expect(['1006', '998313', '10063010'].map((hsnSacCode) => errorsFor({ hsnSacCode }).hsnSacCode)).toEqual([
      undefined,
      undefined,
      undefined,
    ])
    expect(gstInput.hsnSac('AB12-34')).toBe('1234')
  })
})

describe('BUG-GST-004: PIN code must match the State', () => {
  it('rejects PIN 560001 with Maharashtra', () => {
    expect(validatePincodeMatchesState('560001', 'Maharashtra')).toBe('PIN code 560001 belongs to Karnataka, not Maharashtra')
    expect(errorsFor({ state: 'Maharashtra' }).pinCode).toMatch(/belongs to Karnataka/)
  })
  it('maps special prefixes and shared PIN areas', () => {
    expect(getStatesForPincode('403001')).toEqual(['Goa'])
    expect(getStatesForPincode('737101')).toEqual(['Sikkim'])
    expect(validatePincodeMatchesState('605001', 'Puducherry')).toBeNull()
    expect(validatePincodeMatchesState('400001', 'Maharashtra')).toBeNull()
  })
})

describe('BUG-GST-005: constitution vs PAN type', () => {
  it('rejects an individual PAN for a company', () => {
    expect(validateBusinessPan('ABCPK1234F', 'Private Limited Company')).toMatch(/"C" \(Company\)/)
    expect(errorsFor({ businessPan: 'ABCPK1234F' }).businessPan).toBeTruthy()
  })
  it('accepts matching PAN types', () => {
    expect(validateBusinessPan('AAACT1234A', 'Public Limited Company')).toBeUndefined()
    expect(validateBusinessPan('AAAFT1234A', 'Limited Liability Partnership (LLP)')).toBeUndefined()
    expect(validateBusinessPan('ABCPK1234F', 'Proprietorship')).toBeUndefined()
  })
  it('requires the signatory PAN to be an individual PAN', () => {
    expect(errorsFor({ signatoryPan: 'AAACT1234A' }).signatoryPan).toMatch(/individual PAN/)
  })
})

describe('BUG-GST-006: Composition Scheme eligibility', () => {
  it('flags e-commerce, inter-state and export selections when Composition = Yes', () => {
    const conflicts = getCompositionConflicts({
      compositionScheme: 'Yes',
      natureOfBusiness: 'E-Commerce Operator / Seller',
      registrationReason: 'Inter-State Supply',
    })
    expect(Object.keys(conflicts).sort()).toEqual(['natureOfBusiness', 'registrationReason'])
    expect(errorsFor({ compositionScheme: 'Yes', natureOfBusiness: 'Export of Goods / Services' }).natureOfBusiness).toMatch(/Composition Scheme/)
  })
  it('allows those options when Composition = No', () => {
    expect(errorsFor({ natureOfBusiness: 'E-Commerce Operator / Seller', registrationReason: 'Inter-State Supply' })).toEqual({})
  })
})

const fileFrom = (name: string, type: string, bytes: number[], size?: number) => {
  const file = new File([new Uint8Array(bytes)], name, { type })
  if (size) Object.defineProperty(file, 'size', { value: size })
  return file
}
const PDF_BYTES = [0x25, 0x50, 0x44, 0x46, 0x2d, 0x31]
const PNG_BYTES = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a]
const EXE_BYTES = [0x4d, 0x5a, 0x90, 0x00]
const XLSX_BYTES = [0x50, 0x4b, 0x03, 0x04, 0x14, 0x00]
const XLS_BYTES = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1]

describe('BUG-GST-009: upload type and size limits', () => {
  it('rejects executables, renamed executables and files over 10 MB', async () => {
    expect(await validateUploadFile(fileFrom('setup.exe', 'application/x-msdownload', EXE_BYTES), DOCUMENT_UPLOAD_RULE)).toMatch(/Only PDF, Excel, JPG or PNG/)
    expect(await validateUploadFile(fileFrom('invoice.pdf', 'application/pdf', EXE_BYTES), DOCUMENT_UPLOAD_RULE)).toMatch(/not a valid/)
    expect(await validateUploadFile(fileFrom('big.pdf', 'application/pdf', PDF_BYTES, 15 * 1024 * 1024), DOCUMENT_UPLOAD_RULE)).toMatch(/too large/)
  })
  it('accepts genuine Excel workbooks (.xlsx and .xls) and rejects other spreadsheets', async () => {
    expect(await validateUploadFile(fileFrom('gstr2b.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', XLSX_BYTES), DOCUMENT_UPLOAD_RULE)).toBeNull()
    expect(await validateUploadFile(fileFrom('register.xls', 'application/vnd.ms-excel', XLS_BYTES), DOCUMENT_UPLOAD_RULE)).toBeNull()
    expect(await validateUploadFile(fileFrom('fake.xlsx', '', PDF_BYTES), DOCUMENT_UPLOAD_RULE)).toMatch(/not a valid/)
    expect(await validateUploadFile(fileFrom('data.csv', 'text/csv', PDF_BYTES), DOCUMENT_UPLOAD_RULE)).toMatch(/Only PDF, Excel, JPG or PNG/)
  })
  it('accepts genuine PDFs and images; the photo slot accepts images only', async () => {
    expect(await validateUploadFile(fileFrom('pan.pdf', 'application/pdf', PDF_BYTES), DOCUMENT_UPLOAD_RULE)).toBeNull()
    expect(await validateUploadFile(fileFrom('photo.png', 'image/png', PNG_BYTES), PHOTO_UPLOAD_RULE)).toBeNull()
    expect(await validateUploadFile(fileFrom('photo.pdf', 'application/pdf', PDF_BYTES), PHOTO_UPLOAD_RULE)).toMatch(/Only JPG or PNG/)
  })
})

const SIGNED_IN_USER = { id: 'usr_gst', fullName: 'Ravi Kumar', email: 'ravi@example.com', mobile: '9823145672', role: 'CUSTOMER' as const, isProfileComplete: true }

describe('BUG-GST-008: Discard & Exit purges the draft', () => {
  beforeEach(() => {
    localStore.clear()
    authStorage.setUser(SIGNED_IN_USER)
  })

  const DraftHarness = () => {
    const draft = useServiceDraft({
    storageNamespace: DRAFT_NAMESPACES.gst,
      serviceId: 'gst-registration',
      serviceTitle: 'GST Registration',
      totalSteps: 4,
      currentStep: 2,
      stepLabel: 'Documents',
      resumeRoute: '/gst/registration',
      exitRoute: '/gst',
      formData: { businessData: { legalName: 'Typed value' } },
      hasEnteredData: true,
      isComplete: false,
    })
    return (
      <>
        <button onClick={draft.saveDraft}>save</button>
        <button onClick={draft.openDraftModal}>open</button>
        <button onClick={draft.handleDiscardAndExit}>discard</button>
        <span>{draft.isDraftModalOpen ? 'modal-open' : 'modal-closed'}</span>
      </>
    )
  }

  it('leaves no saved or auto-saved copy behind', () => {
    const router = createMemoryRouter(
      [{ path: '/gst/registration', element: <DraftHarness /> }, { path: '/gst', element: <p>GST home</p> }],
      { initialEntries: ['/gst/registration'] },
    )
    render(<RouterProvider router={router} />)
    fireEvent.click(screen.getByText('save'))
    expect(readServiceDraft('gst-registration', DRAFT_NAMESPACES.gst)).not.toBeNull()

    fireEvent.click(screen.getByText('open'))
    fireEvent.click(screen.getByText('discard'))

    expect(readServiceDraft('gst-registration', DRAFT_NAMESPACES.gst)).toBeNull()
    expect(userStorage.getDraft('gst-registration')).toBeNull()
    expect(localStore.get(`taxedge_gst_draft_${SIGNED_IN_USER.id}_gst-registration`)).toBeNull()
  })
})

/** Seeds the auto-saved draft the wizard resumes from (valid business details, no uploads yet) */
const seedRegistrationDraft = (currentStep = 1, documents = INITIAL_DOCUMENTS) =>
  localStore.set(`taxedge_gst_draft_${SIGNED_IN_USER.id}_gst-registration`, {
    formData: { businessData: VALID_FORM, documents },
    currentStep,
  })

describe('Browser Back on a GST step opens the save-draft dialog (same as the loans flows)', () => {
  beforeEach(() => {
    localStore.clear()
    authStorage.setUser(SIGNED_IN_USER)
    seedRegistrationDraft()
  })

  const WizardHarness = () => {
    const state = useGstRegistrationState()
    return (
      <>
        <span data-testid="step">{state.currentStep}</span>
        <span data-testid="draft-modal">{state.isDraftModalOpen ? 'open' : 'closed'}</span>
        <button onClick={state.handleStep1Next}>next1</button>
        <button onClick={state.handleStep2Back}>back2</button>
      </>
    )
  }

  const renderWizard = () => {
    const router = createMemoryRouter(
      [
        { path: '/gst', element: <span>GST HOME</span> },
        { path: '/gst/registration', element: <WizardHarness /> },
      ],
      { initialEntries: ['/gst', '/gst/registration'], initialIndex: 1 },
    )
    render(<RouterProvider router={router} />)
    return router
  }

  it('step changes replace the history entry instead of adding one', () => {
    const router = renderWizard()
    fireEvent.click(screen.getByText('next1'))
    expect(screen.getByTestId('step')).toHaveTextContent('2')
    expect(router.state.location.search).toBe('?step=documents')
    expect(router.state.historyAction).toBe('REPLACE')
  })

  it('browser Back from a later step stays on the step and asks to save the draft', async () => {
    const router = renderWizard()
    fireEvent.click(screen.getByText('next1'))
    await act(() => router.navigate(-1))
    expect(router.state.location.pathname).toBe('/gst/registration')
    expect(screen.getByTestId('step')).toHaveTextContent('2')
    expect(screen.getByTestId('draft-modal')).toHaveTextContent('open')
  })

  it('in-page Back still moves to the previous step without the dialog', async () => {
    renderWizard()
    fireEvent.click(screen.getByText('next1'))
    await act(async () => {
      fireEvent.click(screen.getByText('back2'))
    })
    expect(screen.getByTestId('step')).toHaveTextContent('1')
    expect(screen.getByTestId('draft-modal')).toHaveTextContent('closed')
  })
})

describe('Edit from Review opens the chosen section and returns with "Update & Review"', () => {
  beforeEach(() => {
    localStore.clear()
    authStorage.setUser(SIGNED_IN_USER)
    seedRegistrationDraft()
  })

  const EditHarness = () => {
    const state = useGstRegistrationState()
    return (
      <>
        <span data-testid="step">{state.currentStep}</span>
        <span data-testid="edit">{state.isEditMode ? 'editing' : 'normal'}</span>
        <span data-testid="section">{state.editSection ?? ''}</span>
        <button onClick={() => state.goToStep(3)}>review</button>
        <button onClick={() => state.startEditingFromReview(1, 'bank')}>editBank</button>
        <button onClick={() => state.startEditingFromReview(2, 'documents')}>editDocs</button>
        <button onClick={state.handleCancel}>back1</button>
        <button onClick={state.handleStep2Back}>back2</button>
        <button onClick={state.handleStep1Next}>next1</button>
      </>
    )
  }

  const renderEdit = () =>
    render(
      <RouterProvider
        router={createMemoryRouter([{ path: '/gst/registration', element: <EditHarness /> }], {
          initialEntries: ['/gst/registration'],
        })}
      />,
    )

  it('Edit on Bank Details opens step 1 at the bank section in edit mode', () => {
    renderEdit()
    fireEvent.click(screen.getByText('editBank'))
    expect(screen.getByTestId('step')).toHaveTextContent('1')
    expect(screen.getByTestId('edit')).toHaveTextContent('editing')
    expect(screen.getByTestId('section')).toHaveTextContent('bank')
  })

  it('Back while editing returns to Review instead of leaving', () => {
    renderEdit()
    fireEvent.click(screen.getByText('editBank'))
    fireEvent.click(screen.getByText('back1'))
    expect(screen.getByTestId('edit')).toHaveTextContent('normal')
    expect(screen.getByTestId('section')).toHaveTextContent('')
  })

  it('"Update & Review" on step 1 goes back to Review and leaves edit mode', () => {
    renderEdit()
    fireEvent.click(screen.getByText('editBank'))
    fireEvent.click(screen.getByText('next1'))
    expect(screen.getByTestId('edit')).toHaveTextContent('normal')
  })
})
