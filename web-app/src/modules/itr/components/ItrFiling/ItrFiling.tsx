import React from "react";
import { ServiceDraftModal } from "@shared/saveDraft"
import { useReviewEdit } from "@shared/edit"
import { ItrCategorySelectionView } from "./CategorySelection";
import { ItrPersonalInfoView } from "./PersonalInfo";
import { ItrIncomeSourcesView } from "./IncomeSources";
import { ItrDocumentsChecklistView } from "./DocumentsChecklist";
import { ItrReviewSubmissionView } from "./ReviewSubmission";
import { ItrFilingSubmittedView } from "./FilingSubmitted";
import { useItrFilingState } from "./useItrFilingState";
import "./ItrFiling.css";

const REVIEW_STEP = 4;

export const ItrFiling: React.FC = () => {
  const flow = useItrFilingState()
  const {
    isStarted,
    setIsStarted,
    currentStep,
    setCurrentStep,
    selectedCategoryId,
    setSelectedCategoryId,
    assessmentYear,
    setAssessmentYear,
    residentialStatus,
    setResidentialStatus,
    filingType,
    setFilingType,
    bankAccounts,
    setBankAccounts,
    selectedBankId,
    setSelectedBankId,
    selectedBank,
    previousItr,
    setPreviousItr,
    selectedSources,
    setSelectedSources,
    salaryDetails,
    setSalaryDetails,
    housePropertyDetails,
    setHousePropertyDetails,
    businessDetails,
    setBusinessDetails,
    capitalGainsDetails,
    setCapitalGainsDetails,
    otherSourcesDetails,
    setOtherSourcesDetails,
    selectedRegime,
    deductions,
    uploadedDocs,
    handleUploadDoc,
    handleRemoveDoc,
    isSubmitted,
    submittedRef,
    isSubmitting,
    handleFinalSubmit,
    openModal,
    isDirty,
  } = flow;

  const navigateToStep = (step: number) => {
    try {
      setCurrentStep(step);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setCurrentStep(step);
    }
  };

  // "Edit" from the review (step 4): the step shows "Update & Review" and Continue / Back return to the review
  const reviewEdit = useReviewEdit(() => navigateToStep(REVIEW_STEP));
  const { isEditMode, nextOrReview, backOrReview } = reviewEdit;

  const stepRenderers: Record<number, () => React.ReactNode> = {
    1: () => (
      <ItrPersonalInfoView
        onBack={backOrReview(() => {
          if (isDirty) {
            openModal();
          } else {
            setIsStarted(false);
          }
        })}
        onNext={nextOrReview(() => navigateToStep(2))}
        isEditMode={isEditMode}
        onSaveDraft={openModal}
        initialAssessmentYear={assessmentYear}
        onAssessmentYearChange={setAssessmentYear}
        initialResidentialStatus={residentialStatus}
        onResidentialStatusChange={setResidentialStatus}
        initialFilingType={filingType}
        onFilingTypeChange={setFilingType}
        initialBankAccounts={bankAccounts}
        onBankAccountsChange={setBankAccounts}
        initialSelectedBankId={selectedBankId}
        onSelectedBankIdChange={setSelectedBankId}
        initialPreviousItr={previousItr}
        onPreviousItrChange={setPreviousItr}
      />
    ),
    2: () => (
      <ItrIncomeSourcesView
        onBack={backOrReview(() => navigateToStep(1))}
        onNext={nextOrReview(() => navigateToStep(3))}
        isEditMode={isEditMode}
        onSaveDraft={openModal}
        salaryDetails={salaryDetails}
        onSalaryDetailsChange={setSalaryDetails}
        housePropertyDetails={housePropertyDetails}
        onHousePropertyDetailsChange={setHousePropertyDetails}
        businessDetails={businessDetails}
        onBusinessDetailsChange={setBusinessDetails}
        capitalGainsDetails={capitalGainsDetails}
        onCapitalGainsDetailsChange={setCapitalGainsDetails}
        otherSourcesDetails={otherSourcesDetails}
        onOtherSourcesDetailsChange={setOtherSourcesDetails}
        selectedSources={selectedSources}
        onSourcesChange={setSelectedSources}
        selectedCategoryId={selectedCategoryId}
      />
    ),
    3: () => (
      <ItrDocumentsChecklistView
        onBack={backOrReview(() => navigateToStep(2))}
        onNext={nextOrReview(() => navigateToStep(REVIEW_STEP))}
        isEditMode={isEditMode}
        onSaveDraft={openModal}
        uploadedDocs={uploadedDocs}
        onUploadDoc={handleUploadDoc}
        onRemoveDoc={handleRemoveDoc}
      />
    ),
    4: () => (
      <ItrReviewSubmissionView
        onBack={() => navigateToStep(3)}
        onEditStep={(step) => reviewEdit.startEdit(() => navigateToStep(step))}
        onSubmit={handleFinalSubmit}
        onSaveDraft={openModal}
        assessmentYear={assessmentYear}
        residentialStatus={residentialStatus}
        filingType={filingType}
        selectedBank={selectedBank}
        salaryDetails={salaryDetails}
        housePropertyDetails={housePropertyDetails}
        businessDetails={businessDetails}
        capitalGainsDetails={capitalGainsDetails}
        otherSourcesDetails={otherSourcesDetails}
        selectedSources={selectedSources}
        selectedRegime={selectedRegime}
        deductions={deductions}
        uploadedDocs={uploadedDocs}
        isSubmitting={isSubmitting}
      />
    ),
  };

  const renderActiveContent = () => {
    if (isSubmitted) {
      return (
        <ItrFilingSubmittedView
          submittedRef={submittedRef}
          assessmentYear={assessmentYear}
          selectedSources={selectedSources}
          selectedRegime={selectedRegime}
          bankAccounts={bankAccounts}
          selectedBankId={selectedBankId}
          docCount={Object.keys(uploadedDocs).length}
        />
      );
    }

    if (!isStarted) {
      return (
        <ItrCategorySelectionView
          selectedId={selectedCategoryId}
          onSelect={setSelectedCategoryId}
          onStart={(id) => {
            setSelectedCategoryId(id);
            setIsStarted(true);
            setCurrentStep(1);
          }}
        />
      );
    }

    return stepRenderers[currentStep]?.() ?? null;
  };

  return (
    <>
      {renderActiveContent()}
      <ServiceDraftModal draft={flow} serviceTitle="ITR filing" />
    </>
  );
};

export default ItrFiling;
