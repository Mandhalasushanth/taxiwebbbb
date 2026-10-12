import { apiClient, apiEndpoints } from '@core/api'
import { env } from '@core/config'
import type { EnquiryFormData, EnquiryResponse } from '../types/marketing.types'

const MOCK_LATENCY_MS = 600

const buildReference = (): string => `ENQ-${Date.now().toString(36).toUpperCase()}`

const normaliseEnquiry = (data: EnquiryFormData): EnquiryFormData => ({
  fullName: data.fullName.trim(),
  email: data.email.trim().toLowerCase(),
  mobile: data.mobile.replace(/\D/g, '').slice(-10),
  service: data.service.trim(),
  message: data.message.trim(),
})

const submitMockEnquiry = (): Promise<EnquiryResponse> =>
  new Promise((resolve) => {
    setTimeout(() => resolve({ reference: buildReference() }), MOCK_LATENCY_MS)
  })

export const marketingService = {
  /** Sends a public (signed-out) enquiry from the Contact page. Throws AppError on failure. */
  submitEnquiry: (data: EnquiryFormData): Promise<EnquiryResponse> =>
    env.enableMocks
      ? submitMockEnquiry()
      : apiClient.post<EnquiryResponse>(apiEndpoints.marketing.enquiries, normaliseEnquiry(data)),
}
