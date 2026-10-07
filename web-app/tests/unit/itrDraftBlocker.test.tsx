// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { cleanup, render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('@core/config/environment', () => ({
  env: {
    appName: 'TaxEdge',
    apiBaseUrl: 'http://localhost:3000',
    enableMocks: true,
    isDev: true,
    isProd: false,
  },
}))

import { authStorage } from '../../src/core/auth'
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

      // Now on Step 1 Customer & Income - enter bank account number
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
    it('prompts draft confirm modal on Step 1 Back when started and saves draft', () => {
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

      // Click "Back"
      const backBtn = screen.getByRole('button', { name: /back/i })
      fireEvent.click(backBtn)

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
  })

  describe('Revised ITR Flow', () => {
    it('prompts draft confirm modal on Step 1 Back when ackNumber is entered', () => {
      render(
        <MemoryRouter>
          <RevisedItr />
        </MemoryRouter>
      )

      // Enter acknowledgment number
      const ackInput = screen.getByPlaceholderText(/enter acknowledgement number/i)
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
