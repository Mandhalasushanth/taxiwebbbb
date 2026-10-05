import React, { useState, useEffect } from "react";
import { useAuthStore } from "@store/index";
import { StepActionBar } from "@shared/components";
import {
  ItrFilingHeaderStepper,
  getStoredTaxpayerProfile,
  type AssessmentYearOption,
  type FilingBankAccount,
  type FilingTypeOption,
  type PreviousItrInfo,
  type ResidentialStatusOption,
} from "../itrFiling.constants";
import {
  ItrTaxpayerProfileCard,
  ItrFilingOptionsCard,
  ItrFilingTypeCard,
} from "./ItrPersonalInfoCards";
import { ItrRefundBankSection } from "./ItrRefundBankSection";
import { ItrPreviousItrSection } from "./ItrPreviousItrSection";
import "./ItrPersonalInfoView.css";

export { ItrRefundBankSection } from "./ItrRefundBankSection";

export interface ItrPersonalInfoViewProps {
  onBack: () => void;
  onNext: () => void;
  onSaveDraft?: () => void;
  initialAssessmentYear?: AssessmentYearOption;
  onAssessmentYearChange?: (ay: AssessmentYearOption) => void;
  initialResidentialStatus?: ResidentialStatusOption;
  onResidentialStatusChange?: (status: ResidentialStatusOption) => void;
  initialFilingType?: FilingTypeOption;
  onFilingTypeChange?: (ft: FilingTypeOption) => void;
  initialBankAccounts?: FilingBankAccount[];
  onBankAccountsChange?: (accounts: FilingBankAccount[]) => void;
  initialSelectedBankId?: string;
  onSelectedBankIdChange?: (id: string) => void;
  initialPreviousItr?: PreviousItrInfo;
  onPreviousItrChange?: (info: PreviousItrInfo) => void;
}

export const ItrPersonalInfoView: React.FC<ItrPersonalInfoViewProps> = ({
  onBack,
  onNext,
  onSaveDraft,
  initialAssessmentYear,
  onAssessmentYearChange,
  initialResidentialStatus,
  onResidentialStatusChange,
  initialFilingType,
  onFilingTypeChange,
  initialBankAccounts,
  onBankAccountsChange,
  initialSelectedBankId,
  onSelectedBankIdChange,
  initialPreviousItr,
  onPreviousItrChange,
}) => {
  const authUser = useAuthStore((state) => state.user);
  const taxpayerProfile = getStoredTaxpayerProfile(authUser);

  const [assessmentYear, setAssessmentYear] = useState<AssessmentYearOption>(
    initialAssessmentYear || "",
  );
  const [residentialStatus, setResidentialStatus] =
    useState<ResidentialStatusOption>(initialResidentialStatus || "");
  const [filingType, setFilingType] = useState<FilingTypeOption>(
    initialFilingType || "",
  );
  const [bankAccounts, setBankAccounts] = useState<FilingBankAccount[]>(
    initialBankAccounts ?? [],
  );
  const [selectedBankId, setSelectedBankId] = useState<string>(
    initialSelectedBankId || initialBankAccounts?.[0]?.id || "",
  );
  const [showErrors, setShowErrors] = useState(false);

  const hasValidBank =
    bankAccounts.length > 0 && Boolean(selectedBankId || bankAccounts[0]?.id);

  const isFormValid =
    Boolean(assessmentYear) &&
    Boolean(residentialStatus) &&
    Boolean(filingType) &&
    hasValidBank;

  const scrollToFirstError = () => {
    try {
      const firstInvalid = document.querySelector(
        ".itr-info-card--error, .itr-field-error",
      );
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } catch {
      // Graceful fallback
    }
  };

  const handleNext = () => {
    try {
      if (!isFormValid) {
        setShowErrors(true);
        scrollToFirstError();
        return;
      }
      onNext();
    } catch {
      setShowErrors(true);
    }
  };

  const handleAyChange = (ay: AssessmentYearOption) => {
    setAssessmentYear(ay);
    onAssessmentYearChange?.(ay);
  };

  const handleResidentialChange = (status: ResidentialStatusOption) => {
    setResidentialStatus(status);
    onResidentialStatusChange?.(status);
  };

  const handleFilingTypeChange = (ft: FilingTypeOption) => {
    setFilingType(ft);
    onFilingTypeChange?.(ft);
  };

  const handleBankAccountsChange = (accs: FilingBankAccount[]) => {
    setBankAccounts(accs);
    if (!selectedBankId && accs.length > 0) {
      setSelectedBankId(accs[0].id);
    }
    onBankAccountsChange?.(accs);
  };

  const handleSelectedBankIdChange = (id: string) => {
    setSelectedBankId(id);
    onSelectedBankIdChange?.(id);
  };

  useEffect(() => {
    const handleAttempt = () => {
      try {
        if (!isFormValid) {
          setShowErrors(true);
          scrollToFirstError();
        }
      } catch {
        setShowErrors(true);
      }
    };
    window.addEventListener("step-action-bar:submit-attempt", handleAttempt);
    return () =>
      window.removeEventListener("step-action-bar:submit-attempt", handleAttempt);
  }, [isFormValid]);

  return (
    <div className="itr-step-view-container itr-step-personal-info">
      <ItrFilingHeaderStepper currentStepId={1} />

      {/* Taxpayer identity overview */}
      <ItrTaxpayerProfileCard taxpayerProfile={taxpayerProfile} />

      {/* Assessment Year & Residential Status */}
      <ItrFilingOptionsCard
        assessmentYear={assessmentYear}
        onAssessmentYearChange={handleAyChange}
        residentialStatus={residentialStatus}
        onResidentialStatusChange={handleResidentialChange}
        ayError={
          showErrors && !assessmentYear
            ? "Please select an Assessment Year to proceed."
            : undefined
        }
        resError={
          showErrors && !residentialStatus
            ? "Please select your residential status."
            : undefined
        }
      />

      {/* Return Filing Type */}
      <ItrFilingTypeCard
        filingType={filingType}
        onFilingTypeChange={handleFilingTypeChange}
        error={
          showErrors && !filingType
            ? "Please select a return filing type."
            : undefined
        }
      />

      {/* Refund Bank Selection and Addition */}
      <ItrRefundBankSection
        bankAccounts={bankAccounts}
        onBankAccountsChange={handleBankAccountsChange}
        selectedBankId={selectedBankId || (bankAccounts[0]?.id ?? "")}
        onSelectedBankIdChange={handleSelectedBankIdChange}
        error={
          showErrors && !hasValidBank
            ? "Please select or add at least one bank account for refund credit."
            : undefined
        }
      />

      {/* Previous Tax Return Details */}
      <ItrPreviousItrSection
        previousItr={initialPreviousItr ?? { hasPreviousReturn: false }}
        onPreviousItrChange={onPreviousItrChange ?? (() => {})}
      />

      {/* Sticky Step Navigation */}
      <StepActionBar
        onBack={onBack}
        onNext={handleNext}
        onSaveDraft={onSaveDraft}
        nextLabel="Continue"
        nextDisabled={!isFormValid}
      />
    </div>
  );
};

export default ItrPersonalInfoView;
