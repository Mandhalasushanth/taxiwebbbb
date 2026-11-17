// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import GSTCertificate from '../../src/modules/gst/components/GSTCertificate/GSTCertificate'
import { ApplicationTrackerView } from '../../src/modules/applications/components/ApplicationTracker/ApplicationTrackerView'
import { userStorage } from '../../src/core/storage/userStorage'
import { localStore } from '../../src/core/storage/localStorage'

beforeEach(() => {
  localStore.clear()
  userStorage.clearAllUserData()
  vi.restoreAllMocks()
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('GST Certificate Flow & Application Tracking Verification', () => {
  it('1. Renders Page 1 form and transitions to Page 2 verification view on CONTINUE click', async () => {
    render(
      <MemoryRouter initialEntries={['/gst/certificate']}>
        <Routes>
          <Route path="/gst/certificate" element={<GSTCertificate />} />
          <Route path="/applications/track/:id" element={<ApplicationTrackerView />} />
        </Routes>
      </MemoryRouter>
    )

    // Page 1 assertions
    expect(screen.getByText('OFFICIAL GOVERNMENT COPY')).toBeDefined()
    expect(screen.getByText('Download GST Registration Certificate')).toBeDefined()
    expect(screen.getByText(/Download Existing Certificate \(Form REG-06\)/i)).toBeDefined()
    expect(screen.getByText('Verified Delivery Channel')).toBeDefined()

    const submitBtn = screen.getByRole('button', { name: /CONTINUE →/i })
    expect(submitBtn).toBeDefined()

    // Enter valid 15-character GSTIN
    const input = screen.getByPlaceholderText(/Enter your GSTIN number/i)
    fireEvent.change(input, { target: { value: '29AAAAA0000A1Z5' } })

    // Click CONTINUE ->
    fireEvent.click(submitBtn)

    // Transitions to Page 2 (Under Verification)
    await waitFor(() => {
      expect(screen.getByText('Your Application Under Verification')).toBeDefined()
    })

    expect(
      screen.getByText(/After the verification process, your GST certificate will be downloaded/i)
    ).toBeDefined()
    expect(screen.getByText('Certificate of Registration')).toBeDefined()
    expect(screen.getByRole('button', { name: /Track Application/i })).toBeDefined()
  })

  it('2. Clicking Track Application navigates to application tracker showing Under Verification', async () => {
    // Seed application in userStorage with status "Under Verification"
    const ref = 'GST-CRT-88990'
    userStorage.saveUserApplication({
      id: `app-cert-1`,
      code: ref,
      title: 'GST Certificate (REG-06)',
      meta: '29AAAAA0000A1Z5 · Download Certificate',
      statusLabel: 'Under Verification',
      statusTone: 'warning',
      progress: 35,
      icon: '📜',
      to: `/applications/track/${ref}`,
      documents: [
        {
          id: 'REG-06',
          name: 'Registration Certificate (REG-06)',
          fileName: 'GST-REG-06-29AAAAA0000A1Z5.pdf',
          status: 'pending',
          meta: 'Under Verification · In Progress',
          date: 'Today',
        },
      ],
    })

    render(
      <MemoryRouter initialEntries={[`/applications/track/${ref}`]}>
        <Routes>
          <Route path="/applications/track/:id" element={<ApplicationTrackerView />} />
        </Routes>
      </MemoryRouter>
    )

    // Tracker loads for this certificate request
    expect(screen.getByText(`APPLICATION #${ref}`)).toBeDefined()
    expect(screen.getAllByText('GST Certificate (REG-06)').length).toBeGreaterThan(0)

    // Go to Documents tab
    const docsTab = screen.getByRole('button', { name: /Documents/i })
    fireEvent.click(docsTab)

    // Documents tab shows "Under Verification" status and not ready yet
    await waitFor(() => {
      expect(screen.getAllByText('Under Verification').length).toBeGreaterThan(0)
    })
    expect(screen.getByText(/Document will be ready upon manager approval/i)).toBeDefined()
  })

  it('3. When Manager approves the certificate, document status changes to Ready and Download button appears', async () => {
    const ref = 'GST-CRT-77112'
    userStorage.saveUserApplication({
      id: `app-cert-2`,
      code: ref,
      title: 'GST Certificate (REG-06)',
      meta: '29AAAAA0000A1Z5 · Download Certificate',
      statusLabel: 'Under Verification',
      statusTone: 'warning',
      progress: 35,
      icon: '📜',
      to: `/applications/track/${ref}`,
      documents: [
        {
          id: 'REG-06',
          name: 'Registration Certificate (REG-06)',
          fileName: 'GST-REG-06-29AAAAA0000A1Z5.pdf',
          status: 'pending',
          meta: 'Under Verification · In Progress',
          date: 'Today',
        },
      ],
    })

    render(
      <MemoryRouter initialEntries={[`/applications/track/${ref}`]}>
        <Routes>
          <Route path="/applications/track/:id" element={<ApplicationTrackerView />} />
        </Routes>
      </MemoryRouter>
    )

    // Click Manager Approve Certificate button
    const approveBtn = screen.getByRole('button', { name: /Approve Certificate & Mark Ready/i })
    fireEvent.click(approveBtn)

    // Status updates to Approved & Ready for Download
    await waitFor(() => {
      expect(screen.getAllByText(/Approved & Ready/i).length).toBeGreaterThan(0)
    })

    // Switch to Documents tab
    const docsTab = screen.getByRole('button', { name: /Documents/i })
    fireEvent.click(docsTab)

    // Download button is now available for user to download
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Download/i })).toBeDefined()
    })
  })
})
