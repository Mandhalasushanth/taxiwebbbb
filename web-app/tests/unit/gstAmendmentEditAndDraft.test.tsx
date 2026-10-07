// @vitest-environment jsdom
process.env.VITE_API_BASE_URL = 'http://localhost:3000'

import '@testing-library/jest-dom/vitest'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { GSTAmendment } from '../../src/modules/gst/components/GSTAmendment/GSTAmendment'
import { authStorage } from '../../src/core/auth'
import { localStore } from '../../src/core/storage/localStorage'
import { userStorage } from '../../src/core/storage/userStorage'
import { readServiceDraft, DRAFT_NAMESPACES } from '../../src/shared/saveDraft'

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
    const gstinInput = screen.getByPlaceholderText('Enter your GSTIN')
    fireEvent.change(gstinInput, { target: { value: '29AAAAA0000F1Z2' } })

    // Select Legal Business Name card
    const legalNameCard = screen.getByText('Legal Business Name')
    fireEvent.click(legalNameCard)

    // Form screen should be visible
    const input = screen.getByPlaceholderText('As per PAN')
    expect(input).toBeInTheDocument()

    // Type a new legal name
    fireEvent.change(input, { target: { value: 'Acme Global Enterprises' } })

    // Create a mock file and upload
    const file = new File(['mock content'], 'incorporation_cert.pdf', { type: 'application/pdf' })
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(fileInput).toBeInTheDocument()
    fireEvent.change(fileInput, { target: { files: [file] } })

    // Click Review Changes button
    const reviewBtn = screen.getByRole('button', { name: /Review Changes/i })
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
      const restoredInput = screen.getByPlaceholderText('As per PAN') as HTMLInputElement
      expect(restoredInput.value).toBe('Acme Global Enterprises')
      expect(screen.getByText(/incorporation_cert\.pdf/i)).toBeInTheDocument()
    })

    // The button must now say "Update & Review"
    const updateAndReviewBtn = screen.getByRole('button', { name: /Update/i })
    expect(updateAndReviewBtn).toBeInTheDocument()
    expect(updateAndReviewBtn).toHaveTextContent('Update & Review')

    // Edit the input further
    const restoredInput = screen.getByPlaceholderText('As per PAN') as HTMLInputElement
    fireEvent.change(restoredInput, { target: { value: 'Acme Global Worldwide Enterprises' } })

    // Click Update & Review
    fireEvent.click(updateAndReviewBtn)

    // Should redirect back to Review Amendment screen with the updated value!
    await waitFor(() => {
      expect(screen.getByText('Review Amendment')).toBeInTheDocument()
      expect(screen.getByText('Acme Global Worldwide Enterprises')).toBeInTheDocument()
    })
  })

  it('restores entered form fields and file info when continuing from saved draft', async () => {
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

    // Should restore directly into the form step with prefilled values
    await waitFor(() => {
      const input = screen.getByPlaceholderText('As per PAN') as HTMLInputElement
      expect(input.value).toBe('Saved Draft Corp Private Limited')
      expect(screen.getByText(/certificate_draft\.pdf/i)).toBeInTheDocument()
    })
  })
})
