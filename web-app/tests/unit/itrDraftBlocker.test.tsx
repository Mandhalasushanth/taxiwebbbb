// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { cleanup, render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('@core/config/environment', () => ({
  env: {
    appName: 'Finsolz',
    apiBaseUrl: 'http://localhost:3000',
    enableMocks: true,
    isDev: true,
    isProd: false,
  },
}))

import { authStorage } from '../../src/core/auth'
import { localStore } from '../../src/core/storage/localStorage'
import { TdsRefund } from '../../src/modules/itr/components/TdsRefund/TdsRefund'
import { ItrFiling } from '../../src/modules/itr/components/ItrFiling/ItrFiling'
import { RevisedItr } from '../../src/modules/itr/components/RevisedItr/RevisedItr'
import { TaxNoticeAssistance } from '../../src/modules/itr/components/TaxNoticeAssistance/TaxNoticeAssistance'
import { userStorage } from '../../src/core/storage/userStorage'

afterEach(() => {
  cleanup()
})

describe('ITR Module - Save Draft Confirmations', () => {
  beforeEach(() => {
    localStorage.clear()
    localStore.clear()
    window.scrollTo = () => {}
    authStorage.setUser({
      id: 'usr_test_itr',
      fullName: 'Test Taxpayer',
      email: 'taxpayer@example.com',
      mobile: '9876543210',
      role: 'CUSTOMER',
      isProfileComplete: true,
    })
  })

  describe('TDS Refund Flow', () => {
    it('prompts draft confirm modal on Step 1 Back when modified and saves draft', async () => {
      render(
        <MemoryRouter>
          <TdsRefund />
        </MemoryRouter>
      )

      // Click "Start TDS Refund" on Step 0 Overview
      const startBtn = screen.getByTestId('tds-start-refund-btn')
      fireEvent.click(startBtn)

      // Now on Step 1 Application Details - enter bank account number
      const accInputs = screen.getAllByPlaceholderText(/enter your bank account number/i)
      fireEvent.change(accInputs[0], { target: { value: '123456789012' } })

      // Click "Back"
      const backBtn = screen.getByRole('button', { name: /back/i })
      fireEvent.click(backBtn)

      // Modal should appear
      expect(screen.getByText(/save application progress\?/i)).toBeDefined()
      expect(screen.getByText(/save as draft & exit/i)).toBeDefined()

      // Click Save as Draft & Exit
      const saveDraftBtn = screen.getByText(/save as draft & exit/i)
      fireEvent.click(saveDraftBtn)

      const savedDraft = userStorage.getDraft('tds-refund')
      expect(savedDraft).toBeDefined()
      expect(savedDraft?.serviceId).toBe('tds-refund')
    })
  })

  describe('ITR Filing Flow', () => {
    it('prompts draft confirm modal on Step 1 Save Draft and redirects to Income Sources on Back', () => {
      render(
        <MemoryRouter>
          <ItrFiling />
        </MemoryRouter>
      )

      // Click Salaried category card to start
      const salariedCard = screen.getByText('Salaried')
      fireEvent.click(salariedCard)

      // Start filing CTA
      const continueBtn = screen.getByRole('button', { name: /start application/i })
      fireEvent.click(continueBtn)

      // Now on Step 1
      expect(screen.getByText('Taxpayer Identity')).toBeDefined()

      // Click "Save as Draft"
      const saveDraftTrigger = screen.getByTestId('step-save-draft-btn')
      fireEvent.click(saveDraftTrigger)

      // Modal should open
      expect(screen.getByText(/save application progress\?/i)).toBeDefined()
      expect(screen.getByText(/save as draft & exit/i)).toBeDefined()

      // Click Save as Draft & Exit
      const saveDraftBtn = screen.getByText(/save as draft & exit/i)
      fireEvent.click(saveDraftBtn)

      const savedDraft = userStorage.getDraft('itr-filing')
      expect(savedDraft).toBeDefined()
      expect(savedDraft?.serviceId).toBe('itr-filing')
    })

    it('redirects to Select Primary Income category selection when clicking Back on Step 1', () => {
      userStorage.deleteDraft('itr-filing')
      render(
        <MemoryRouter>
          <ItrFiling />
        </MemoryRouter>
      )

      const salariedCard = screen.queryByText('Salaried')
      if (salariedCard) {
        fireEvent.click(salariedCard)
        const continueBtn = screen.getByRole('button', { name: /start application/i })
        fireEvent.click(continueBtn)
      }

      expect(screen.getByText('Taxpayer Identity')).toBeDefined()

      const backBtn = screen.getByRole('button', { name: /back/i })
      fireEvent.click(backBtn)

      // Expect to be back on Select Primary Income (Category Selection view)
      expect(screen.getByText(/select primary income/i)).toBeDefined()
      expect(screen.getAllByText('Salaried').length).toBeGreaterThan(0)
    })

    it('does NOT ask to save draft when entering Step 1 without selecting any option or entering data', () => {
      render(
        <MemoryRouter>
          <ItrFiling />
        </MemoryRouter>
      )

      // Click Salaried category card to start
      const salariedCard = screen.getByText('Salaried')
      fireEvent.click(salariedCard)

      const continueBtn = screen.getByRole('button', { name: /start application/i })
      fireEvent.click(continueBtn)

      // Now on Step 1 Personal & Filing
      expect(screen.getByText('Taxpayer Identity')).toBeInTheDocument()

      // User has NOT selected any option or added anything to any field
      // Click application Back button
      const backBtn = screen.getByRole('button', { name: /back/i })
      fireEvent.click(backBtn)

      // Should return straight to Category Selection WITHOUT opening the Save Draft modal
      expect(screen.queryByText(/save application progress\?/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/save as draft & exit/i)).not.toBeInTheDocument()
      expect(screen.getByText(/select primary income/i)).toBeInTheDocument()
    })

    it('category selection footer renders Start Application without a back button', () => {
      userStorage.deleteDraft('itr-filing')
      render(
        <MemoryRouter>
          <ItrFiling />
        </MemoryRouter>
      )

      // Click Multiple Sources category
      const multiCard = screen.getByText('Multiple Sources')
      fireEvent.click(multiCard)

      // Start application button should exist, but no back button beside it
      const startBtn = screen.getByRole('button', { name: /start application/i })
      expect(startBtn).toBeDefined()
      expect(screen.queryByRole('button', { name: /^back$/i })).toBeNull()
    })
  })

  describe('Revised ITR Flow', () => {
    it('prompts draft confirm modal on Step 1 Back when ackNumber is entered', () => {
      render(
        <MemoryRouter>
          <RevisedItr />
        </MemoryRouter>
      )

      // Enter acknowledgment number
      const ackInput = screen.getByPlaceholderText(/enter.*acknowledgement number/i)
      fireEvent.change(ackInput, { target: { value: '123456789012345' } })

      // Click "Back"
      const backBtn = screen.getByRole('button', { name: /back/i })
      fireEvent.click(backBtn)

      // Modal should appear
      expect(screen.getByText(/save application progress\?/i)).toBeDefined()
      expect(screen.getByText(/save as draft & exit/i)).toBeDefined()

      // Click Save as Draft & Exit
      const saveDraftBtn = screen.getByText(/save as draft & exit/i)
      fireEvent.click(saveDraftBtn)

      const savedDraft = userStorage.getDraft('revised-itr')
      expect(savedDraft).toBeDefined()
      expect(savedDraft?.serviceId).toBe('revised-itr')
    })

    it('displays 3 rolling assessment years and navigates directly to Step 2 without showing Original Return Found', async () => {
      render(
        <MemoryRouter>
          <RevisedItr />
        </MemoryRouter>
      )

      // Open Assessment Year dropdown
      const aySelectBtn = screen.getByRole('button', { name: /select assessment year/i })
      fireEvent.click(aySelectBtn)

      // Verify the 3 rolling assessment years
      expect(screen.getByRole('option', { name: '2024-2025' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: '2025-2026' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: '2026-2027' })).toBeInTheDocument()

      // Select '2025-2026'
      fireEvent.click(screen.getByRole('option', { name: '2025-2026' }))

      // Enter acknowledgment number
      const ackInput = screen.getByPlaceholderText(/enter.*acknowledgement number/i)
      fireEvent.change(ackInput, { target: { value: '123456789012345' } })

      // Click Continue
      const continueBtn = screen.getByRole('button', { name: /continue/i })
      fireEvent.click(continueBtn)

      // Should directly advance to the inside page (Step 2: Reason for Revision)
      expect(await screen.findByText('Why are you revising your ITR?')).toBeInTheDocument()
      expect(screen.getByText('Missed Income')).toBeInTheDocument()

      // "Original Return Found" section should NOT be shown
      expect(screen.queryByText(/original return found/i)).not.toBeInTheDocument()

      // Select 'Missed Income' reason
      fireEvent.click(screen.getByText('Missed Income'))

      // Continue to Step 3 (Income Correction)
      const step2ContinueBtn = screen.getByRole('button', { name: /continue/i })
      fireEvent.click(step2ContinueBtn)

      // Step 3 should be displayed
      expect(await screen.findByText(/update (revised details|only what changed)/i)).toBeInTheDocument()
      expect(screen.getByText(/salary \/ business income/i)).toBeInTheDocument()

      // Neither "Original" label nor original amount row should exist in any card
      expect(screen.queryByText(/^Original$/i)).not.toBeInTheDocument()
      expect(document.querySelector('.correction-original-row')).toBeNull()
    })
  })

  describe('Tax Notice Assistance Flow', () => {
    it('prompts draft confirm modal on Step 1 Back when PAN is entered', () => {
      render(
        <MemoryRouter>
          <TaxNoticeAssistance />
        </MemoryRouter>
      )

      // Enter PAN
      const panInput = screen.getByPlaceholderText(/enter your pan/i)
      fireEvent.change(panInput, { target: { value: 'ABCDE1234F' } })

      // Click "Back"
      const backBtn = screen.getByRole('button', { name: /back/i })
      fireEvent.click(backBtn)

      // Modal should appear
      expect(screen.getByText(/save application progress\?/i)).toBeDefined()
      expect(screen.getByText(/save as draft & exit/i)).toBeDefined()

      // Click Save as Draft & Exit
      const saveDraftBtn = screen.getByText(/save as draft & exit/i)
      fireEvent.click(saveDraftBtn)

      const savedDraft = userStorage.getDraft('tax-notice-assistance')
      expect(savedDraft).toBeDefined()
      expect(savedDraft?.serviceId).toBe('tax-notice-assistance')
    })
  })
})
