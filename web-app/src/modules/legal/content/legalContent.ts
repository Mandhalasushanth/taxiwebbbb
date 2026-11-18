export type LegalDocumentId = 'terms' | 'privacy' | 'refund'

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

/**
 * Published legal copy matching the official policy document.
 */
export const LEGAL_DOCUMENTS: Record<LegalDocumentId, LegalDocumentContent> = {
  terms: {
    id: 'terms',
    title: 'Terms & Conditions',
    effectiveDate: '2026-10-01',
    intro:
      'These Terms & Conditions govern access to and use of the Tax Edge Fin Solutions website, TaxFinova application and related services offered by Tax Edge Fin Solutions LLP (“TaxEdge”, “we”, “us” or “our”). By accessing the platform, creating an account, requesting a service or making a payment, you (“you”, “user” or “client”) agree to these terms. If you do not agree, do not use the platform.',
    sections: [
      {
        heading: '1.1 Services',
        paragraphs: [
          'Depending on availability and the scope accepted for a particular engagement, TaxEdge may provide or coordinate GST registration, GST return filing and compliance support; income-tax return assistance and tax planning; TDS and related compliance support; accounting and bookkeeping; financial statements and management reporting; Virtual CFO services; business-loan and project-finance documentation, project reports and CMA support; company/LLP and business registration assistance; corporate documentation, contracts and legal retainership coordination; and other services expressly described in a quotation or engagement confirmation.',
        ],
      },
      {
        heading: '1.2 Engagement and scope',
        paragraphs: [
          '• A website visit, account creation, enquiry or preliminary discussion does not by itself create a professional engagement or guarantee acceptance of an assignment.',
          '• An engagement begins only after TaxEdge confirms the service scope, fees, deliverables, timelines and required documents through an engagement letter, quotation, order confirmation or written communication.',
          '• Services are limited to the agreed scope. Additional work, revisions, urgent work, government follow-up or work arising from changed facts may require a separate fee and approval.',
          '• Timelines depend on complete and accurate client information and the availability and processing times of government portals, banks, lenders and other third parties.',
        ],
      },
      {
        heading: '1.3 Client responsibilities',
        paragraphs: [
          '• Provide complete, accurate, current and genuine information and documents, and promptly notify TaxEdge of errors or changes.',
          '• Review drafts, calculations, returns, applications and documents before authorising submission wherever approval is requested.',
          '• Provide valid authorisations, signatures, OTPs or portal permissions personally where legally required. TaxEdge will not ask for passwords, PINs or card security codes.',
          '• Respond promptly to queries and meet payment, filing and document deadlines communicated by TaxEdge.',
          '• Keep copies of source records and final acknowledgements, certificates and filings.',
        ],
      },
      {
        heading: '1.4 Professional advice and limitations',
        paragraphs: [
          'Website and platform information is general and is not a substitute for advice based on the complete facts of a particular matter. Tax, legal and compliance outcomes depend on applicable law, facts, documentation and decisions of competent authorities. TaxEdge does not guarantee a particular tax outcome, registration, approval, refund, loan sanction, interest rate, investment return or regulatory decision.',
          'For loan and project-finance consultancy, TaxEdge may assist with eligibility assessment, financial analysis, project reports, CMA data, documentation and lender coordination. The lender alone decides whether to approve, reject, price or disburse a loan and determines sanction terms.',
        ],
      },
      {
        heading: '1.5 Fees and payments',
        paragraphs: [
          'Fees will be communicated before or at the time an order is placed. Unless expressly stated otherwise, applicable taxes, statutory charges, government fees, portal fees, bank charges and third-party costs may be additional. Payment confirmation does not mean a government filing, registration or third-party approval has been completed.',
        ],
      },
      {
        heading: '1.6 Third-party services',
        paragraphs: [
          'The platform may link to or rely on government portals, banks, payment processors, identity/KYC providers, communication services and other third parties. Their services are governed by their own terms and privacy policies. TaxEdge is not responsible for outages, delays, policy changes or decisions made by third parties, but will provide reasonable assistance within the agreed service scope.',
        ],
      },
      {
        heading: '1.7 Intellectual property and acceptable use',
        paragraphs: [
          'Unless stated otherwise, platform content, branding, text, designs, software and materials made available by TaxEdge are owned by or licensed to TaxEdge. You may use them only for lawful purposes connected with the services. You must not misuse the platform, attempt unauthorised access, interfere with its operation, upload malicious code, impersonate another person or submit unlawful, false or infringing material.',
        ],
      },
      {
        heading: '1.8 Account security and communications',
        paragraphs: [
          'You are responsible for maintaining account security and notifying TaxEdge promptly of suspected unauthorised access. TaxEdge may communicate through email, SMS, telephone, WhatsApp or in-app notifications using the contact details you provide.',
        ],
      },
      {
        heading: '1.9 Suspension, termination and liability',
        paragraphs: [
          'TaxEdge may suspend access where reasonably necessary for security, suspected fraud, unlawful use, non-payment or breach of these terms. Either party may end an engagement subject to its engagement letter and Refund & Cancellation Policy. Fees for work already completed and approved third-party/statutory costs remain payable.',
          'To the extent permitted by law, TaxEdge will not be liable for indirect or consequential loss, loss of profits or loss caused by inaccurate/incomplete client information, missed client approvals, third-party outages, government processing delays or decisions outside TaxEdge’s control. Nothing excludes liability that cannot lawfully be excluded.',
        ],
      },
      {
        heading: '1.10 Changes, governing law and contact',
        paragraphs: [
          'TaxEdge may update these terms to reflect changes in services, technology or law. The updated version will be published with a revised effective date. These terms are governed by the laws of India. Subject to applicable law, courts having jurisdiction at Vijayawada, Andhra Pradesh shall have jurisdiction. Contact: contact@taxedgefinsolutions.com or +91 90308 91212.',
        ],
      },
    ],
  },
  privacy: {
    id: 'privacy',
    title: 'Privacy Policy',
    effectiveDate: '2026-10-01',
    intro:
      'This Privacy Policy explains how Tax Edge Fin Solutions LLP collects, uses, stores, shares and protects information through its website, TaxFinova application, communication channels and service engagements.',
    sections: [
      {
        heading: '2.1 Information collected',
        paragraphs: [
          '• Contact details: name, business name, mobile number, email, postal address and preferred contact method.',
          '• Business/service details: entity type, industry, service interest, GSTIN, PAN, TAN, CIN/LLPIN and other identifiers where relevant.',
          '• KYC and verification information: identity/address documents and verification results only where necessary, lawful and supported by an approved process.',
          '• Tax, accounting and financial records: invoices, ledgers, bank statements, salary/vendor data, returns, challans, financial statements, project information and documents supplied for an assignment.',
          '• Transaction information: order ID, payment status, amount, date, payment reference and refund status. TaxEdge should not collect or store full card numbers, CVV, PINs or banking passwords.',
          '• Technical information: device/browser details, log data, IP address, app activity, cookies and diagnostic information where enabled.',
        ],
      },
      {
        heading: '2.2 Sources and purposes',
        paragraphs: [
          'Information may be collected directly when you create an account, submit an enquiry, upload documents, communicate with our team, request a service or make a payment. Relevant information may also be received from authorised government portals, verification providers, payment gateways or other providers where permitted and necessary.',
          '• Respond to enquiries and communicate with you.',
          '• Create and administer customer accounts and service applications.',
          '• Perform agreed tax, accounting, compliance, legal-documentation, financial-advisory or loan-documentation services.',
          '• Complete KYC, identity, business or registration checks where lawfully required.',
          '• Process payments, issue invoices/receipts, handle refunds and maintain transaction records.',
          '• Send service updates, reminders, filing alerts, OTPs, receipts and support communications.',
          '• Maintain security, prevent fraud, resolve disputes, meet legal obligations and improve platform reliability.',
        ],
      },
      {
        heading: '2.3 Consent and choices',
        paragraphs: [
          'Where consent is the applicable legal basis, we will request it appropriately and provide a way to withdraw it, subject to legal, contractual and operational requirements. You may choose not to provide certain information; however, TaxEdge may then be unable to provide the requested service. Separate consent should be obtained for optional marketing communications.',
        ],
      },
      {
        heading: '2.4 Sharing',
        paragraphs: [
          'Relevant information may be shared on a need-to-know basis with authorised employees and professionals, government departments/portals, banks or lenders, payment gateways (including Razorpay if selected), KYC/verification providers, cloud hosting and storage providers, email/SMS/WhatsApp providers, auditors, legal advisers and other vendors engaged to deliver the service. Disclosures may also be made where required by law, court order or competent authority.',
        ],
      },
      {
        heading: '2.5 Payments and security',
        paragraphs: [
          'Online payments may be processed by a third-party gateway under its own security and privacy terms. TaxEdge should receive transaction references and payment status rather than storing card PINs, CVVs, OTPs or full payment credentials.',
          'TaxEdge will use reasonable technical and organisational safeguards appropriate to the information, such as access controls, role-based permissions, secure transmission, protected storage, authentication, backups and audit records, where implemented. No digital system can be guaranteed completely secure. Users should not send passwords, OTPs, PINs or full card credentials to staff.',
        ],
      },
      {
        heading: '2.6 Retention',
        paragraphs: [
          'Information will be retained as reasonably necessary to provide services, maintain business and tax records, resolve disputes, enforce agreements and comply with applicable legal requirements. Retention periods may differ by record type. When information is no longer required, it will be securely deleted, anonymised or archived as permitted by law.',
        ],
      },
      {
        heading: '2.7 Your requests and grievances',
        paragraphs: [
          'Subject to applicable law, you may request access to, correction or updating of personal information, raise a grievance, withdraw consent where processing is based on consent, or request deletion where legally permissible. Some records may need to be retained for statutory, contractual or dispute-resolution reasons. Requests may be sent to contact@taxedgefinsolutions.com. Identity verification may be required.',
        ],
      },
      {
        heading: '2.8 Children, cookies and updates',
        paragraphs: [
          'The platform is intended for business owners, professionals and adult customers. Do not knowingly submit a child\'s information unless legally authorised and necessary for a specific service. The website may use cookies and analytics for functionality, traffic measurement and performance. Browser settings may allow cookie management. We may update this policy and publish the revised effective date.',
          'Privacy contact: contact@taxedgefinsolutions.com | +91 90308 91212.',
        ],
      },
    ],
  },
  refund: {
    id: 'refund',
    title: 'Refund & Cancellation Policy',
    effectiveDate: '2026-10-01',
    intro:
      'This policy applies to services purchased from Tax Edge Fin Solutions LLP through the website, TaxFinova application or an authorised sales/engagement channel. A service-specific quotation or engagement letter will prevail where it contains a clearly agreed cancellation/refund term, subject to applicable law.',
    sections: [
      {
        heading: '3.1 Before work begins',
        paragraphs: [
          'If cancellation is requested before TaxEdge starts substantive work and before third-party, government, portal or other non-recoverable costs are incurred, the customer may request a refund. The amount will be assessed against the payment received and any costs already incurred.',
        ],
      },
      {
        heading: '3.2 After work begins',
        paragraphs: [
          'If work has commenced, a refund will be assessed proportionately based on work completed, professional time committed, deliverables supplied and unavoidable costs incurred. Work already completed, delivered or approved may not be refundable. TaxEdge will communicate the basis for any approved partial refund.',
        ],
      },
      {
        heading: '3.3 Government and third-party charges',
        paragraphs: [
          'Government fees, statutory filing fees, stamp duty, portal charges, verification fees, bank/lender charges and third-party costs already paid or incurred on the customer\'s behalf are generally non-refundable, except where the authority/provider permits a refund or applicable law requires otherwise.',
        ],
      },
      {
        heading: '3.4 Circumstances where refunds may not be available',
        paragraphs: [
          '• A service has been fully delivered or the agreed filing/submission has been completed, except where a refund is required by law or the service was not delivered as agreed.',
          '• A delay, rejection or adverse decision is caused by a government authority, bank, lender or other third party, or by inaccurate, incomplete or late information supplied by the customer, provided TaxEdge performed the agreed scope.',
          '• The customer changes their mind after work has started and the agreed service has been substantially performed.',
          '• A third-party or statutory fee has already been paid and is not recoverable.',
        ],
      },
      {
        heading: '3.5 Cancellation by TaxEdge',
        paragraphs: [
          'If TaxEdge is unable to provide a purchased service for reasons within its reasonable control, it will inform the customer and may offer rescheduling, an alternative service with consent, or a full/partial refund for the undelivered portion, as appropriate.',
        ],
      },
      {
        heading: '3.6 Request process',
        paragraphs: [
          'Send a request from the registered email address to contact@taxedgefinsolutions.com or call +91 90308 91212. Include customer name, registered mobile/email, service/order ID, payment reference, reason for cancellation and supporting details. TaxEdge may request verification or additional information.',
        ],
      },
      {
        heading: '3.7 Review and processing',
        paragraphs: [
          'TaxEdge will review the request against service status, engagement terms and costs incurred. If approved, the refund will normally be initiated to the original payment method. The time for credit depends on the payment gateway, bank and payment network; any estimate is indicative.',
        ],
      },
      {
        heading: '3.8 Failed, pending or duplicate payments',
        paragraphs: [
          'If an amount is debited but the order shows failed or pending, contact TaxEdge with the transaction reference. TaxEdge will verify the gateway status and coordinate a reversal/refund where applicable. Duplicate successful payments for the same order will be reviewed and the excess amount refunded after verification.',
          'Customers should first contact TaxEdge to resolve disputes. This does not limit statutory consumer rights or remedies.',
        ],
      },
    ],
  },
}

export const getLegalDocument = (id: string | undefined): LegalDocumentContent | null =>
  id === 'terms' || id === 'privacy' || id === 'refund' ? LEGAL_DOCUMENTS[id] : null
