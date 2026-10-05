import { appConfig } from '@core/config'

export type LegalDocumentId = 'terms' | 'privacy'

export interface LegalSection {
  heading: string
  paragraphs: string[]
}

export interface LegalDocumentContent {
  id: LegalDocumentId
  title: string
  /** ISO date the published version took effect */
  effectiveDate: string
  intro: string
  sections: LegalSection[]
}

const APP = appConfig.name
const SUPPORT = appConfig.supportEmail

/**
 * Published legal copy shown on /legal/* and in the registration consent dialog.
 * Update the effective date whenever the text changes.
 */
export const LEGAL_DOCUMENTS: Record<LegalDocumentId, LegalDocumentContent> = {
  terms: {
    id: 'terms',
    title: 'Terms of Service',
    effectiveDate: '2026-10-01',
    intro: `These Terms of Service govern your use of the ${APP} website and services. By creating an account you agree to these terms.`,
    sections: [
      {
        heading: '1. Our services',
        paragraphs: [
          `${APP} helps individuals and businesses with tax filing, GST, company incorporation, loans and related compliance services. Some services are carried out by qualified professionals on your behalf after you authorise them.`,
        ],
      },
      {
        heading: '2. Your account',
        paragraphs: [
          'You must be at least 18 years old and provide accurate, complete and current information, including your PAN, Aadhaar and contact details.',
          'Your account is linked to your verified mobile number. Keep your passcode confidential; you are responsible for activity carried out using your credentials.',
          'Only one account may be created per PAN and per email address.',
        ],
      },
      {
        heading: '3. Your responsibilities',
        paragraphs: [
          'You confirm that documents and information you upload are genuine and that you are authorised to share them.',
          'Filings are prepared using the information you provide. You must review drafts before approving their submission to any government portal.',
        ],
      },
      {
        heading: '4. Fees and payments',
        paragraphs: [
          'Service fees are shown before you pay. Government fees, taxes and penalties are payable in addition to service fees unless stated otherwise.',
          'Refunds, where applicable, are processed to the original payment method.',
        ],
      },
      {
        heading: '5. Limitation of liability',
        paragraphs: [
          `${APP} is not liable for delays or rejections caused by incorrect information, government portal downtime, or changes in law after a filing is submitted.`,
        ],
      },
      {
        heading: '6. Suspension and termination',
        paragraphs: [
          'We may suspend or close accounts that provide false information, misuse the platform or breach these terms. You may close your account at any time by contacting support.',
        ],
      },
      {
        heading: '7. Changes and contact',
        paragraphs: [
          'We may update these terms; the effective date above shows the current version. Continued use after an update means you accept the revised terms.',
          `Questions about these terms can be sent to ${SUPPORT}.`,
        ],
      },
    ],
  },
  privacy: {
    id: 'privacy',
    title: 'Privacy Policy',
    effectiveDate: '2026-10-01',
    intro: `This Privacy Policy explains how ${APP} collects, uses and protects your personal data in line with the Digital Personal Data Protection Act, 2023.`,
    sections: [
      {
        heading: '1. Data we collect',
        paragraphs: [
          'Identity and contact details: name, mobile number, email, date of birth, PAN, Aadhaar and address. For businesses: entity name, CIN / LLPIN and business PAN.',
          'Service data: documents you upload, financial details needed for filings, application and payment records.',
        ],
      },
      {
        heading: '2. How we use it',
        paragraphs: [
          'To verify your identity, provide the services you request, file returns and applications on your behalf, process payments and communicate with you about your account.',
        ],
      },
      {
        heading: '3. Aadhaar data',
        paragraphs: [
          'Aadhaar numbers are used only for the purposes you consent to, are never displayed in full (only the last 4 digits are shown) and are not shared except as required for the service or by law.',
        ],
      },
      {
        heading: '4. Sharing',
        paragraphs: [
          'We share data only with government portals and authorities needed to complete your request, with lending or insurance partners you choose to apply to, and with service providers bound by confidentiality. We do not sell personal data.',
        ],
      },
      {
        heading: '5. Security and retention',
        paragraphs: [
          'Data is encrypted in transit, access is restricted to authorised staff, and sessions sign out automatically after inactivity.',
          'We keep data for as long as your account is active and as required by tax and company law record-keeping rules.',
        ],
      },
      {
        heading: '6. Your rights',
        paragraphs: [
          `You can access, correct or request erasure of your data and withdraw consent by writing to ${SUPPORT}. Withdrawing consent may stop us from providing some services.`,
        ],
      },
    ],
  },
}

export const getLegalDocument = (id: string | undefined): LegalDocumentContent | null =>
  id === 'terms' || id === 'privacy' ? LEGAL_DOCUMENTS[id] : null
