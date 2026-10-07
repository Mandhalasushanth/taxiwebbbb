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
        onChange={setField}
        errors={errors}
        stepError={stepError}
        contact={user}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
