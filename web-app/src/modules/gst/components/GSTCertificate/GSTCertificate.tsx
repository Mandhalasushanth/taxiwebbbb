import { ServiceDraftModal } from '@shared/saveDraft'
import { useGSTCertificateFlow } from '@modules/gst/hooks/useGSTCertificateFlow'
import { GSTCertificateForm } from './GSTCertificateForm/GSTCertificateForm'
import { GSTCertificateSubmitted } from './GSTCertificateSubmitted/GSTCertificateSubmitted'
import './GSTCertificate.css'

export default function GSTCertificate() {
  const flow = useGSTCertificateFlow()
  const {
    user,
    fields,
    setField,
    errors,
    stepError,
    isSubmitting,
    submittedRecord,
    handleSubmit,
    handleBackToForm,
    handleAllForms,
    openDraftModal,
  } = flow

  if (submittedRecord) {
    return (
      <GSTCertificateSubmitted
        applicationId={submittedRecord.reference}
        gstin={submittedRecord.gstin}
        requestType={submittedRecord.requestType}
        onBackToForm={handleBackToForm}
        onAllForms={handleAllForms}
      />
    )
  }

  return (
    <div className="gst-certificate-page">
      <div className="gst-cert-page-header">
        <div className="gst-cert-page-title-row">
          <div className="gst-cert-page-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <line x1="10" y1="9" x2="8" y2="9" />
            </svg>
          </div>
          <h1 className="gst-cert-page-title">GST Certificate</h1>
        </div>
        <p className="gst-cert-page-subtitle">Download your GST Registration Certificate (Form REG-06)</p>
      </div>
      <main className="gst-certificate-main">
        <GSTCertificateForm
          values={fields}
          onChange={setField}
          errors={errors}
          stepError={stepError}
          contact={user}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onSaveDraft={openDraftModal}
        />
      </main>

      <ServiceDraftModal draft={flow} serviceTitle="GST Certificate" />
    </div>
  )
}
