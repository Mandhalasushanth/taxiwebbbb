import { useGSTCertificateFlow } from '@modules/gst/hooks/useGSTCertificateFlow'
import { useGSTSectionFocus } from '@modules/gst/shared/useGSTSectionFocus'
import { GSTCertificateForm } from './GSTCertificateForm/GSTCertificateForm'
import { GSTCertificateSubmitted } from './GSTCertificateSubmitted/GSTCertificateSubmitted'
import './GSTCertificate.css'

export default function GSTCertificate() {
  const flow = useGSTCertificateFlow()
  useGSTSectionFocus(flow.editSection)
  const {
    user,
    fields,
    setField, handleBlur,
    errors,
    isSubmitting,
    submittedRecord,
    handleSubmit,
    handleBackToForm,
    handleAllForms,
  } = flow

  if (submittedRecord) {
    return (
      <div className="gst-certificate-page">
        <GSTCertificateSubmitted
          applicationId={submittedRecord.reference}
          gstin={submittedRecord.gstin}
          requestType={submittedRecord.requestType}
          onBackToForm={handleBackToForm}
          onAllForms={handleAllForms}
        />
      </div>
    )
  }

  return (
    <div className="gst-certificate-page">
      <GSTCertificateForm
        values={fields}
        onChange={setField} onBlur={handleBlur}
        errors={errors}
        contact={user}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
