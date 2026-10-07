import { routePaths } from '@core/config'
import { ServiceDraftModal } from '@shared/saveDraft'
import {
  GSTAmendmentSelection,
  GSTAmendmentDetailForm,
  GSTAmendmentAddressForm,
  GSTBankAccountsForm,
  GSTSignatoriesForm,
  GSTContactDetailsForm,
  GSTAmendmentReview,
  GSTAmendmentSubmitted,
} from './index'
import { getAmendmentConfig } from './amendmentConfigs'
import {
  getCurrentAddressDetails,
  getCurrentBankDetails,
  getCurrentContactDetails,
  getCurrentSignatoryDetails,
} from '@modules/gst/services/gstProfileDetails'
import { useGSTAmendmentFlow } from '@modules/gst/hooks/useGSTAmendmentFlow'
import { buildReviewData } from './gstAmendmentReviewHelpers'
import './GSTAmendment.css'

export const GSTAmendment = () => {
  const flow = useGSTAmendmentFlow()
  const {
    navigate,
    gstin,
    setGstin,
    selectedOption,
    setSelectedOption,
    formData,
    setFormData,
    isReviewing,
    isEditMode,
    returnToReview,
    isSubmitting,
    submittedRecord,
    openDraftModal,
    handleDetailFormSubmit,
    handleEdit,
    handleReviewBack,
    handleFormChange,
    handleFormSaveDraft,
    handleFinalSubmit,
    handleBackToDashboard,
  } = flow

  if (submittedRecord) {
    const sectionTitle = selectedOption
      ? getAmendmentConfig(selectedOption.id, selectedOption.title).title
      : 'Legal Business Name'

    return (
      <GSTAmendmentSubmitted
        arnNumber={submittedRecord.reference}
        submissionDateText={new Date(submittedRecord.createdAt).toLocaleDateString('en-US')}
        requestedSection={sectionTitle}
        gstin={gstin || '29AAAAA0000F1Z2'}
        onTrackAmendment={() => navigate(routePaths.applications)}
        onGoToDashboard={handleBackToDashboard}
      />
    )
  }

  if (selectedOption && isReviewing && formData) {
    const config = getAmendmentConfig(selectedOption.id, selectedOption.title)

    const reviewData = buildReviewData(selectedOption, formData, gstin, config.title)

    return (
      <div className="gst-amendment-page">
        <GSTAmendmentReview
          gstin={reviewData.reviewGstin}
          sectionTitle={reviewData.sectionTitle}
          amendmentType={selectedOption.type}
          currentValue={config.currentValue}
          requestedValue={formData.newValue}
          currentAddressDetails={reviewData.isAddressType ? reviewData.currentAddress : undefined}
          requestedAddressDetails={reviewData.isAddressType ? reviewData.requestedAddress : undefined}
          currentBankDetails={reviewData.currentBank}
          requestedBankDetails={reviewData.requestedBank}
          currentSignatoryDetails={reviewData.currentSig}
          requestedSignatoryDetails={reviewData.requestedSig}
          currentContactDetails={reviewData.currentContact}
          requestedContactDetails={reviewData.requestedContact}
          fileName={reviewData.fileName}
          fileSizeText={reviewData.fileSizeText}
          uploadDateText={`Uploaded on ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
          isSubmitting={isSubmitting}
          onBack={handleReviewBack}
          onEdit={handleEdit}
          onSubmit={handleFinalSubmit}
          onSaveDraft={openDraftModal}
        />
        <ServiceDraftModal draft={flow} serviceTitle="GST Amendment" />
      </div>
    )
  }

  if (selectedOption) {
    const config = getAmendmentConfig(selectedOption.id, selectedOption.title)

    const isAddressType =
      selectedOption.id === 'principal_place' || selectedOption.id === 'additional_place'

    const handleFormBack = () => {
      if (isEditMode) {
        returnToReview()
      } else {
        setSelectedOption(null)
        setFormData(null)
      }
    }

    return (
      <div className="gst-amendment-page">
        {selectedOption.id === 'bank_accounts' ? (
          <GSTBankAccountsForm
            currentDetails={getCurrentBankDetails()}
            initialBankDetails={formData?.bankDetails}
            initialFile={formData?.file}
            initialFileName={formData?.fileName}
            initialFileSize={formData?.fileSizeText}
            isSubmitting={isSubmitting}
            isEditMode={isEditMode}
            onBack={handleFormBack}
            onSubmit={handleDetailFormSubmit}
            onSaveDraft={handleFormSaveDraft}
            onChange={handleFormChange}
          />
        ) : selectedOption.id === 'authorised_signatories' ? (
          <GSTSignatoriesForm
            currentDetails={getCurrentSignatoryDetails()}
            initialSignatoryDetails={formData?.signatoryDetails}
            initialFile={formData?.file}
            initialFileName={formData?.fileName}
            initialFileSize={formData?.fileSizeText}
            isSubmitting={isSubmitting}
            isEditMode={isEditMode}
            onBack={handleFormBack}
            onSubmit={handleDetailFormSubmit}
            onSaveDraft={handleFormSaveDraft}
            onChange={handleFormChange}
          />
        ) : selectedOption.id === 'contact_details' ? (
          <GSTContactDetailsForm
            currentDetails={getCurrentContactDetails()}
            initialContactDetails={formData?.contactDetails}
            initialFile={formData?.file}
            initialFileName={formData?.fileName}
            initialFileSize={formData?.fileSizeText}
            isSubmitting={isSubmitting}
            isEditMode={isEditMode}
            onBack={handleFormBack}
            onSubmit={handleDetailFormSubmit}
            onSaveDraft={handleFormSaveDraft}
            onChange={handleFormChange}
          />
        ) : isAddressType ? (
          <GSTAmendmentAddressForm
            title={config.title}
            currentDetails={getCurrentAddressDetails(selectedOption.id === 'additional_place')}
            initialDetails={formData?.addressDetails}
            initialFile={formData?.file}
            initialFileName={formData?.fileName}
            initialFileSize={formData?.fileSizeText}
            isSubmitting={isSubmitting}
            isEditMode={isEditMode}
            onBack={handleFormBack}
            onSubmit={handleDetailFormSubmit}
            onSaveDraft={handleFormSaveDraft}
            onChange={handleFormChange}
          />
        ) : (
          <GSTAmendmentDetailForm
            title={config.title}
            currentValue={config.currentValue}
            inputLabel={config.inputLabel}
            placeholder={config.placeholder}
            proofs={config.proofs}
            initialValue={formData?.newValue}
            initialFile={formData?.file}
            initialFileName={formData?.fileName}
            initialFileSize={formData?.fileSizeText}
            isSubmitting={isSubmitting}
            isEditMode={isEditMode}
            onBack={handleFormBack}
            onSubmit={handleDetailFormSubmit}
            onSaveDraft={handleFormSaveDraft}
            onChange={handleFormChange}
          />
        )}
        <ServiceDraftModal draft={flow} serviceTitle="GST Amendment" />
      </div>
    )
  }

  return (
    <div className="gst-amendment-page">
      <GSTAmendmentSelection
        gstin={gstin}
        onGstinChange={setGstin}
        onSelectOption={(option) => {
          setSelectedOption(option)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
        onSaveDraft={openDraftModal}
      />
      <ServiceDraftModal draft={flow} serviceTitle="GST Amendment" />
    </div>
  )
}

export default GSTAmendment
