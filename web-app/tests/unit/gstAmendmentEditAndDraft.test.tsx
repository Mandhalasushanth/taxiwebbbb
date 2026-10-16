// @vitest-environment jsdom
process.env.VITE_API_BASE_URL = 'http://localhost:3000'

import '@testing-library/jest-dom/vitest'
import { pickFiles, uploadTestFile } from './helpers/uploadTestFiles'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom'
import { routePaths } from '../../src/core/config/routePaths'
import { GSTAmendment } from '../../src/modules/gst/components/GSTAmendment/GSTAmendment'
import { authStorage } from '../../src/core/auth'
import { localStore } from '../../src/core/storage/localStorage'
import { userStorage } from '../../src/core/storage/userStorage'

describe('GST Amendment Edit Flow & Draft Persistence', () => {
  afterEach(cleanup)

  beforeEach(() => {
    cleanup()
    window.scrollTo = () => {}
    localStorage.clear()
    localStore.clear()
    authStorage.setUser({
      id: 'test-user-gst',
      mobile: '9876543210',
      fullName: 'Test User',
      isLoggedIn: true,
      role: 'customer',
    })
  })

  it('preserves form field values when clicking Edit from the Review screen and shows Update & Review button', async () => {
    render(
      <BrowserRouter>
        <GSTAmendment />
      </BrowserRouter>
    )

    // Fill valid GSTIN first
    const gstinInput = screen.getByPlaceholderText('Enter 15-character GSTIN')
    fireEvent.change(gstinInput, { target: { value: '29AAAAA0000F1Z2' } })

    // Select Legal Business Name card
    const legalNameCard = screen.getByText('Legal Business Name')
    fireEvent.click(legalNameCard)

    // Form screen should be visible
    const input = screen.getByPlaceholderText('Enter legal business name')
    expect(input).toBeInTheDocument()

    // Type a new legal name
    fireEvent.change(input, { target: { value: 'Acme Global Enterprises' } })

    // Create a mock file and upload
    const file = uploadTestFile('incorporation_cert.pdf')
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(fileInput).toBeInTheDocument()
    await pickFiles(fileInput, [file])

    // Click Continue button
    const reviewBtn = screen.getByRole('button', { name: /Continue|Review Changes/i })
    fireEvent.click(reviewBtn)

    // Review screen should be displayed
    await waitFor(() => {
      expect(screen.getByText('Review Amendment')).toBeInTheDocument()
      expect(screen.getByText('Acme Global Enterprises')).toBeInTheDocument()
    })

    // Click Edit button on the review screen
    const editBtn = screen.getByRole('button', { name: /Edit/i })
    fireEvent.click(editBtn)

    // Form screen should be back with the typed value and file PRESERVED!
    await waitFor(() => {
      const restoredInput = screen.getByPlaceholderText('Enter legal business name') as HTMLInputElement
      expect(restoredInput.value).toBe('Acme Global Enterprises')
      expect(screen.getByText(/incorporation_cert\.pdf/i)).toBeInTheDocument()
    })

    // The button must now say "Update & Review"
    const updateAndReviewBtn = screen.getByRole('button', { name: /Update/i })
    expect(updateAndReviewBtn).toBeInTheDocument()
    expect(updateAndReviewBtn).toHaveTextContent('Update & Review')

    // Edit the input further
    const restoredInput = screen.getByPlaceholderText('Enter legal business name') as HTMLInputElement
    fireEvent.change(restoredInput, { target: { value: 'Acme Global Worldwide Enterprises' } })

    // Click Update & Review
    fireEvent.click(updateAndReviewBtn)

    // Should redirect back to Review Amendment screen with the updated value!
    await waitFor(() => {
      expect(screen.getByText('Review Amendment')).toBeInTheDocument()
      expect(screen.getByText('Acme Global Worldwide Enterprises')).toBeInTheDocument()
    })
  })

  it('shows selection page when returning from saved draft, restores where stopped for same service, and starts fresh for another service', async () => {
    // Pre-populate a saved draft in localStorage mimicking a previously saved draft
    const draftPayload = {
      gstin: '29AAAAA0000F1Z2',
      selectedOptionId: 'legal_name',
      savedFormData: {
        newValue: 'Saved Draft Corp Private Limited',
        fileName: 'certificate_draft.pdf',
        fileSizeText: '0.2 MB',
      },
      isReviewing: false,
    }

    userStorage.saveDraft({
      serviceId: 'gst-amendment',
      serviceTitle: 'GST Amendment',
      currentStep: 2,
      totalSteps: 3,
      stepLabel: 'Legal Business Name',
      formData: draftPayload,
      savedAt: '12:00 PM',
      savedTimestamp: Date.now(),
      resumeRoute: '/gst/amendment',
    })

    render(
      <BrowserRouter>
        <GSTAmendment />
      </BrowserRouter>
    )

    // 1. Should show the core and non-core services page with prefilled GSTIN
    await waitFor(() => {
      expect(screen.getByText('GST Amendment')).toBeInTheDocument()
      expect(screen.getByText('Select what you want to change')).toBeInTheDocument()
      const gstinInput = screen.getByPlaceholderText('Enter 15-character GSTIN') as HTMLInputElement
      expect(gstinInput.value).toBe('29AAAAA0000F1Z2')
    })

    // 2. If user selects same code (Legal Business Name), show where he stopped
    fireEvent.click(screen.getByText('Legal Business Name'))
    await waitFor(() => {
      const input = screen.getByPlaceholderText('Enter legal business name') as HTMLInputElement
      expect(input.value).toBe('Saved Draft Corp Private Limited')
      expect(screen.getByText(/certificate_draft\.pdf/i)).toBeInTheDocument()
    })

    // 3. User goes back to selection
    const backBtn = screen.getByRole('button', { name: /^Back$/i })
    fireEvent.click(backBtn)

    // If modal appears, click Discard or close to go back to selection
    // Note: if user clicks back and prompt appears, they can choose to go back:
    const discardBtn = screen.queryByRole('button', { name: /Discard/i })
    if (discardBtn) {
      fireEvent.click(discardBtn)
    }

    // 4. If user selects any other service, show from starting (clean form)
    await waitFor(() => {
      expect(screen.getByText('Select what you want to change')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText('Principal Place of Business'))
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Principal Place of Business', level: 1 })).toBeInTheDocument()
      const addressInput = screen.getByPlaceholderText('Enter business address') as HTMLInputElement
      expect(addressInput.value).toBe('')
    })
  })

  it('restores directly into review step if user had stopped at review when saving draft', async () => {
    const draftPayload = {
      gstin: '29AAAAA0000F1Z2',
      selectedOptionId: 'legal_name',
      savedFormData: {
        newValue: 'Review Stopped Corp Limited',
        fileName: 'review_cert.pdf',
        fileSizeText: '0.5 MB',
      },
      isReviewing: true,
    }

    userStorage.saveDraft({
      serviceId: 'gst-amendment',
      serviceTitle: 'GST Amendment',
      currentStep: 3,
      totalSteps: 3,
      stepLabel: 'Review Amendment',
      formData: draftPayload,
      savedAt: '01:00 PM',
      savedTimestamp: Date.now(),
      resumeRoute: '/gst/amendment',
    })

    render(
      <BrowserRouter>
        <GSTAmendment />
      </BrowserRouter>
    )

    // Lands on selection page first
    await waitFor(() => {
      expect(screen.getByText('Select what you want to change')).toBeInTheDocument()
    })

    // User clicks same service
    fireEvent.click(screen.getByText('Legal Business Name'))

    // Should restore directly into Review Amendment screen where user had stopped
    await waitFor(() => {
      expect(screen.getByText('Review Amendment')).toBeInTheDocument()
      expect(screen.getByText('Review Stopped Corp Limited')).toBeInTheDocument()
    })
  })

  it('correctly navigates back step-by-step from Review to Form, Form to Selection, and Selection to GST root for core amendments', async () => {
    render(
      <MemoryRouter initialEntries={[routePaths.gst.amendment]}>
        <Routes>
          <Route path={routePaths.gst.root} element={<p>GST Dashboard Root</p>} />
          <Route path={routePaths.gst.amendment} element={<GSTAmendment />} />
        </Routes>
      </MemoryRouter>
    )

    // Selection page has Back button
    expect(screen.getByText('GST Amendment')).toBeInTheDocument()
    const selectionBackBtn = screen.getByRole('button', { name: /^Back$/i })
    expect(selectionBackBtn).toBeInTheDocument()

    // Enter GSTIN and pick Legal Business Name (Core)
    const gstinInput = screen.getByPlaceholderText('Enter 15-character GSTIN')
    fireEvent.change(gstinInput, { target: { value: '29AAAAA0000F1Z2' } })
    fireEvent.click(screen.getByText('Legal Business Name'))

    // Form page visible
    const input = screen.getByPlaceholderText('Enter legal business name')
    fireEvent.change(input, { target: { value: 'Acme Test Corp' } })

    const file = uploadTestFile('cert.pdf')
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    await pickFiles(fileInput, [file])

    // Proceed to Review
    const continueBtn = screen.getByRole('button', { name: /Continue|Review Changes/i })
    fireEvent.click(continueBtn)

    await waitFor(() => {
      expect(screen.getByText('Review Amendment')).toBeInTheDocument()
    })

    // Click Back on Review screen
    const reviewBackBtn = screen.getByRole('button', { name: /^Back$/i })
    fireEvent.click(reviewBackBtn)

    // Should return to the Form page with data preserved
    await waitFor(() => {
      const formInput = screen.getByPlaceholderText('Enter legal business name') as HTMLInputElement
      expect(formInput.value).toBe('Acme Test Corp')
    })

    // Click Back on the Form page: when data is entered, it asks to save draft!
    const formBackBtn = screen.getByRole('button', { name: /^Back$/i })
    fireEvent.click(formBackBtn)

    await waitFor(() => {
      expect(screen.getByText('Save Application Progress?')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Save as Draft & Exit/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Discard & Exit/i })).toBeInTheDocument()
    })

    // Discard & Exit discards the draft and exits to GST root
    fireEvent.click(screen.getByRole('button', { name: /Discard & Exit/i }))
    await waitFor(() => {
      expect(screen.getByText('GST Dashboard Root')).toBeInTheDocument()
    })
  })

  it('navigates directly back to Selection when Back is clicked on an empty form', async () => {
    render(
      <MemoryRouter initialEntries={[routePaths.gst.amendment]}>
        <Routes>
          <Route path={routePaths.gst.root} element={<p>GST Dashboard Root</p>} />
          <Route path={routePaths.gst.amendment} element={<GSTAmendment />} />
        </Routes>
      </MemoryRouter>
    )

    const gstinInput = screen.getByPlaceholderText('Enter 15-character GSTIN')
    fireEvent.change(gstinInput, { target: { value: '29AAAAA0000F1Z2' } })
    fireEvent.click(screen.getByText('Legal Business Name'))

    // Form page visible with empty input
    expect(screen.getByPlaceholderText('Enter legal business name')).toBeInTheDocument()

    // Clicking Back without entering data goes directly to Selection page without prompt
    const formBackBtn = screen.getByRole('button', { name: /^Back$/i })
    fireEvent.click(formBackBtn)

    await waitFor(() => {
      expect(screen.getByText('GST Amendment')).toBeInTheDocument()
      expect(screen.getByText('Select what you want to change')).toBeInTheDocument()
      expect(screen.queryByText('Save Application Progress?')).not.toBeInTheDocument()
    })
  })

  it('prompts to save draft when Back is clicked from Form even when entered via Edit from Review', async () => {
    render(
      <MemoryRouter initialEntries={[routePaths.gst.amendment]}>
        <Routes>
          <Route path={routePaths.gst.root} element={<p>GST Dashboard Root</p>} />
          <Route path={routePaths.gst.amendment} element={<GSTAmendment />} />
        </Routes>
      </MemoryRouter>
    )

    const gstinInput = screen.getByPlaceholderText('Enter 15-character GSTIN')
    fireEvent.change(gstinInput, { target: { value: '29AAAAA0000F1Z2' } })
    fireEvent.click(screen.getByText('Contact Details'))

    // Non-core amendment: Contact Details
    const mobileInput = screen.getByPlaceholderText('Enter mobile number')
    fireEvent.change(mobileInput, { target: { value: '9876543210' } })

    const emailInput = screen.getByPlaceholderText('Enter email address')
    fireEvent.change(emailInput, { target: { value: 'updated@example.com' } })

    const file = uploadTestFile('contact_proof.pdf')
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    await pickFiles(fileInput, [file])

    // Proceed to Review
    fireEvent.click(screen.getByRole('button', { name: /Continue|Review Changes/i }))

    await waitFor(() => {
      expect(screen.getByText('Review Amendment')).toBeInTheDocument()
    })

    // Click Edit button on Review screen
    const editBtn = screen.getByRole('button', { name: /Edit/i })
    fireEvent.click(editBtn)

    // Form page with Update & Review button is visible
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Update/i })).toBeInTheDocument()
    })

    // Clicking Back from the form with entered data asks to save draft
    const formBackBtn = screen.getByRole('button', { name: /^Back$/i })
    fireEvent.click(formBackBtn)

    await waitFor(() => {
      expect(screen.getByText('Save Application Progress?')).toBeInTheDocument()
    })

    // Clicking Keep Editing closes the modal and stays on the form
    fireEvent.click(screen.getByRole('button', { name: /Keep Editing/i }))
    await waitFor(() => {
      expect(screen.queryByText('Save Application Progress?')).not.toBeInTheDocument()
      expect(screen.getByText('Contact Details')).toBeInTheDocument()
    })
  })
})
