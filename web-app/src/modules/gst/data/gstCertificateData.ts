export interface CertificateRequestTypeOption {
  key: string
  label: string
}

export const GST_CERTIFICATE_REQUEST_TYPES: CertificateRequestTypeOption[] = [
  {
    key: 'download_existing',
    label: 'Download Existing Certificate (Form REG-06)',
  },
  {
    key: 'request_reprint',
    label: 'Request Reprint / Duplicate Copy',
  },
  {
    key: 'verification_status',
    label: 'Certificate Verification & Status Check',
  },
]
