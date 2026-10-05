import React from "react";
import { DraftConfirmModal } from "@shared/components";
import { ItrCategorySelectionView } from "./CategorySelection";
import { ItrPersonalInfoView } from "./PersonalInfo";
import { ItrIncomeSourcesView } from "./IncomeSources";
import { ItrRegimeDeductionsView } from "./RegimeDeductions";
import { ItrDocumentsChecklistView } from "./DocumentsChecklist";
import { ItrReviewSubmissionView } from "./ReviewSubmission";
import { ItrFilingSubmittedView } from "./FilingSubmitted";
import { useItrFilingState } from "./useItrFilingState";
import "./ItrFiling.css";

export const ItrFiling: React.FC = () => {
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
    setSelectedRegime,
    deductions,
    setDeductions,
    uploadedDocs,
    handleUploadDoc,
    handleRemoveDoc,
    isSubmitted,
    submittedRef,
    isSubmitting,
    handleFinalSubmit,
    isModalOpen,
    openModal,
    handleSaveAndExit,
    handleDiscardAndExit,
    handleKeepEditing,
  } = useItrFilingState();

  const navigateToStep = (step: number) => {
    try {
      setCurrentStep(step);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setCurrentStep(step);
    }
  };

  const stepRenderers: Record<number, () => React.ReactNode> = {
    1: () => (
      <ItrPersonalInfoView
        onBack={() => setIsStarted(false)}
        onNext={() => navigateToStep(2)}
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
        onBack={() => navigateToStep(1)}
        onNext={() => navigateToStep(3)}
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
      <ItrRegimeDeductionsView
        onBack={() => navigateToStep(2)}
        onNext={() => navigateToStep(4)}
        onSaveDraft={openModal}
        selectedSources={selectedSources}
        salaryDetails={salaryDetails}
        housePropertyDetails={housePropertyDetails}
        businessDetails={businessDetails}
        capitalGainsDetails={capitalGainsDetails}
        otherSourcesDetails={otherSourcesDetails}
        selectedRegime={selectedRegime}
        onRegimeChange={setSelectedRegime}
        deductions={deductions}
        onDeductionsChange={setDeductions}
      />
    ),
    4: () => (
      <ItrDocumentsChecklistView
        onBack={() => navigateToStep(3)}
        onNext={() => navigateToStep(5)}
        onSaveDraft={openModal}
        uploadedDocs={uploadedDocs}
        onUploadDoc={handleUploadDoc}
        onRemoveDoc={handleRemoveDoc}
      />
    ),
    5: () => (
      <ItrReviewSubmissionView
        onBack={() => navigateToStep(4)}
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
      <DraftConfirmModal
        isOpen={isModalOpen}
        serviceTitle="ITR filing"
        onSaveAndExit={handleSaveAndExit}
        onDiscardAndExit={handleDiscardAndExit}
        onKeepEditing={handleKeepEditing}
      />
    </>
  );
};

export default ItrFiling;
