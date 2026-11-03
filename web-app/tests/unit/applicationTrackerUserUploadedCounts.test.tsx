// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ApplicationTrackerView } from '@modules/applications/components/ApplicationTracker/ApplicationTrackerView'
import { userStorage } from '@core/storage/userStorage'
import { authStorage } from '@core/auth'

describe('ApplicationTrackerView user uploaded documents and dynamic details', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn()
    authStorage.setUser({
      id: 'usr_test_123',
      fullName: 'Rajesh Sharma',
      email: 'rajesh@example.com',
      mobile: '9876543210',
      role: 'CUSTOMER',
      isProfileComplete: true,
    })
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    userStorage.clearAllDrafts()
    userStorage.clearUserApplications()
  })

  it('renders GST Registration with all 6 uploaded documents matching mobile reference and 6 status steps', () => {
    userStorage.saveDraft({
      serviceId: 'gst-registration',
      serviceTitle: 'GST Registration',
      currentStep: 2,
      totalSteps: 3,
      savedAt: '11:36 am',
      savedTimestamp: Date.now(),
      resumeRoute: '/gst/register?step=documents',
      formData: {
        businessData: {
          legalName: 'Apex Logistics LLP',
          tradeName: 'Apex Swift Cargo',
          constitution: 'Limited Liability Partnership',
          businessPan: 'AAPCA1234F',
          natureOfBusiness: 'Logistics & Warehousing',
          principalAddress: 'Plot 42, Port Industrial Estate, JNPT, Navi Mumbai',
          state: 'Maharashtra',
          commencementDate: '15 May 2026',
        },
      },
    })

    render(
      <MemoryRouter initialEntries={['/applications/track/DRAFT-GST-REGISTRATION-5586?tab=documents']}>
        <Routes>
          <Route path="/applications/track/:id" element={<ApplicationTrackerView />} />
        </Routes>
      </MemoryRouter>
    )

    // Header badge & title
    expect(screen.getByText('6/6')).toBeDefined()
    expect(screen.getByText(/6 of 6 documents uploaded/i)).toBeDefined()

    // All 6 canonical documents matching mobile screen
    expect(screen.getByText('PAN Card')).toBeDefined()
    expect(screen.getByText('Aadhaar Card')).toBeDefined()
    expect(screen.getByText('Business Registration Proof')).toBeDefined()
    expect(screen.getByText('Principal Place Address Proof')).toBeDefined()
    expect(screen.getByText('Bank Passbook / Cancelled Cheque')).toBeDefined()
    expect(screen.getByText('Passport Size Photograph')).toBeDefined()

    // 6 View buttons
    const viewButtons = screen.getAllByRole('button', { name: /^View$/i })
    expect(viewButtons.length).toBe(6)
  })

  it('renders GST Registration Overview with user filled business details and Status with Step 2/6', () => {
    userStorage.saveDraft({
      serviceId: 'gst-registration',
      serviceTitle: 'GST Registration',
      currentStep: 2,
      totalSteps: 3,
      savedAt: '11:36 am',
      savedTimestamp: Date.now(),
      resumeRoute: '/gst/register?step=documents',
      formData: {
        businessData: {
          legalName: 'Apex Logistics LLP',
          tradeName: 'Apex Swift Cargo',
          constitution: 'Limited Liability Partnership',
          businessPan: 'AAPCA1234F',
          natureOfBusiness: 'Logistics & Warehousing',
          principalAddress: 'Plot 42, Port Industrial Estate, JNPT, Navi Mumbai',
          state: 'Maharashtra',
          commencementDate: '15 May 2026',
        },
      },
    })

    // Overview Tab
    const { unmount } = render(
      <MemoryRouter initialEntries={['/applications/track/DRAFT-GST-REGISTRATION-5586?tab=overview']}>
        <Routes>
          <Route path="/applications/track/:id" element={<ApplicationTrackerView />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Apex Logistics LLP')).toBeDefined()
    expect(screen.getByText('Apex Swift Cargo')).toBeDefined()
    expect(screen.getByText('Limited Liability Partnership')).toBeDefined()
    expect(screen.getByText('AAPCA1234F')).toBeDefined()
    expect(screen.getByText('Logistics & Warehousing')).toBeDefined()
    expect(screen.getByText('15 May 2026')).toBeDefined()
    unmount()

    // Status Tab
    render(
      <MemoryRouter initialEntries={['/applications/track/DRAFT-GST-REGISTRATION-5586?tab=status']}>
        <Routes>
          <Route path="/applications/track/:id" element={<ApplicationTrackerView />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Step 2/6')).toBeDefined()
    expect(screen.getByText('Customer Request')).toBeDefined()
    expect(screen.getByText('Staff Verification')).toBeDefined()
    expect(screen.getByText('Application Drafting')).toBeDefined()
    expect(screen.getByText('E-Sign / OTP Authentication')).toBeDefined()
    expect(screen.getByText('Portal E-Filing')).toBeDefined()
    expect(screen.getByText(/Acknowledgement Issuance/i)).toBeDefined()
  })

  it('renders GST Registration Payments with Awaiting Verification and Not Assigned amounts matching mobile screen', () => {
    userStorage.saveDraft({
      serviceId: 'gst-registration',
      serviceTitle: 'GST Registration',
      currentStep: 2,
      totalSteps: 3,
      savedAt: '11:36 am',
      savedTimestamp: Date.now(),
      resumeRoute: '/gst/register?step=documents',
      formData: {},
    })

    render(
      <MemoryRouter initialEntries={['/applications/track/DRAFT-GST-REGISTRATION-5586?tab=payments']}>
        <Routes>
          <Route path="/applications/track/:id" element={<ApplicationTrackerView />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getAllByText('Awaiting Verification').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Not Assigned').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText('The CA manager will assign the payment amount after verification is completed.')).toBeDefined()
    expect(screen.getByText('Registration')).toBeDefined()
    expect(screen.queryByText('Payment completed successfully.')).toBeNull()
    expect(screen.queryByText('Pay Now')).toBeNull()
  })

  it('renders GST Filing with all 12 uploaded documents and Step 2/4', () => {
    userStorage.saveDraft({
      serviceId: 'gst-filing',
      serviceTitle: 'GST Filing',
      currentStep: 2,
      totalSteps: 3,
      savedAt: '11:36 am',
      savedTimestamp: Date.now(),
      resumeRoute: '/gst/filing/upload',
      formData: {
        filingData: {
          businessName: 'Nova Retail Ventures',
          gstin: '27AABCN8899K1Z4',
          returnType: 'GSTR-3B',
          selectedMonth: 'August 2026',
          filingFrequency: 'Monthly',
          turnover: 1850000,
          taxAmount: 166500,
        },
      },
    })

    render(
      <MemoryRouter initialEntries={['/applications/track/DRAFT-GST-FILING-7452?tab=documents']}>
        <Routes>
          <Route path="/applications/track/:id" element={<ApplicationTrackerView />} />
        </Routes>
      </MemoryRouter>
    )

    // Header badge & title: 12/12
    expect(screen.getByText('12/12')).toBeDefined()
    expect(screen.getByText(/12 of 12 documents uploaded/i)).toBeDefined()

    // 12 documents
    expect(screen.getByText('Sales Invoices / Register')).toBeDefined()
    expect(screen.getByText('Credit Notes')).toBeDefined()
    expect(screen.getByText('Debit Notes')).toBeDefined()
    expect(screen.getByText('E-Invoice Data (IRN)')).toBeDefined()
    expect(screen.getByText('E-Way Bill Data')).toBeDefined()
    expect(screen.getByText('Purchase Invoices / Register')).toBeDefined()
    expect(screen.getByText('GSTR-2B ITC Statement')).toBeDefined()
    expect(screen.getByText('Expense Invoices & Vouchers')).toBeDefined()
    expect(screen.getByText('Bank Statement / Passbook')).toBeDefined()
    expect(screen.getByText('Previous GST Returns')).toBeDefined()
    expect(screen.getByText('Previous Filing Acknowledgement')).toBeDefined()
    expect(screen.getByText('Other Supporting Documents')).toBeDefined()

    // 12 View buttons
    const viewButtons = screen.getAllByRole('button', { name: /^View$/i })
    expect(viewButtons.length).toBe(12)
  })

  it('renders GST Filing Overview with user filled details and Payments Awaiting Verification', () => {
    userStorage.saveDraft({
      serviceId: 'gst-filing',
      serviceTitle: 'GST Filing',
      currentStep: 2,
      totalSteps: 3,
      savedAt: '11:36 am',
      savedTimestamp: Date.now(),
      resumeRoute: '/gst/filing/upload',
      formData: {
        filingData: {
          businessName: 'Nova Retail Ventures',
          gstin: '27AABCN8899K1Z4',
          returnType: 'GSTR-3B',
          selectedMonth: 'August 2026',
          filingFrequency: 'Monthly',
          turnover: 1850000,
          taxAmount: 166500,
        },
      },
    })

    // Overview Tab
    const { unmount } = render(
      <MemoryRouter initialEntries={['/applications/track/DRAFT-GST-FILING-7452?tab=overview']}>
        <Routes>
          <Route path="/applications/track/:id" element={<ApplicationTrackerView />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Nova Retail Ventures')).toBeDefined()
    expect(screen.getByText('27AABCN8899K1Z4')).toBeDefined()
    expect(screen.getByText('GSTR-3B')).toBeDefined()
    expect(screen.getByText('August 2026')).toBeDefined()
    expect(screen.getByText('₹18,50,000')).toBeDefined()
    expect(screen.getByText('₹1,66,500')).toBeDefined()
    unmount()

    // Payments Tab
    render(
      <MemoryRouter initialEntries={['/applications/track/DRAFT-GST-FILING-7452?tab=payments']}>
        <Routes>
          <Route path="/applications/track/:id" element={<ApplicationTrackerView />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getAllByText('Awaiting Verification').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Not Assigned').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText('The CA manager will assign the payment amount after verification is completed.')).toBeDefined()
    expect(screen.getByText('Filing')).toBeDefined()
  })

  it('opens the user uploaded file directly in a new tab when clicking View', async () => {
    const mockFile = new File(['mock content'], 'Modern GST Tax Compliance Workspace.png', { type: 'image/png' })
    const { gstUploadedFiles } = await import('@modules/gst/services/gstUploadedFiles')
    gstUploadedFiles.set('photo', mockFile)

    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

    userStorage.saveDraft({
      serviceId: 'gst-registration',
      serviceTitle: 'GST Registration',
      currentStep: 2,
      totalSteps: 3,
      savedAt: '11:36 am',
      savedTimestamp: Date.now(),
      resumeRoute: '/gst/register?step=documents',
      formData: {
        businessData: {
          legalName: 'Apex Logistics LLP',
          tradeName: 'Apex Swift Cargo',
        },
        documents: [
          {
            id: 'photo',
            title: 'Passport Size Photograph',
            name: 'Passport Size Photograph',
            fileName: 'Modern GST Tax Compliance Workspace.png',
            file: mockFile,
            isUploaded: true,
          },
        ],
      },
    })

    render(
      <MemoryRouter initialEntries={['/applications/track/DRAFT-GST-REGISTRATION-5586?tab=documents']}>
        <Routes>
          <Route path="/applications/track/:id" element={<ApplicationTrackerView />} />
        </Routes>
      </MemoryRouter>
    )

    const photoViewBtn = screen.getByTitle('View Passport Size Photograph')
    photoViewBtn.click()

    expect(openSpy).toHaveBeenCalledTimes(1)
    const openedUrl = openSpy.mock.calls[0][0] as string
    expect(openedUrl.startsWith('blob:')).toBe(true)
  })
})
