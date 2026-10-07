import { useState } from "react";
import { routePaths } from "@core/config";
import { userStorage } from "@core/storage/userStorage";
import { useServiceDraft, readServiceDraft, hasFormChanged, DRAFT_NAMESPACES } from "@shared/saveDraft"
import { calculateItrTax } from "./itrTaxCalculator";
import {
  DEFAULT_PREVIOUS_ITR,
  DEFAULT_SALARY_DETAILS,
  DEFAULT_HOUSE_PROPERTY_DETAILS,
  DEFAULT_BUSINESS_DETAILS,
  DEFAULT_CAPITAL_GAINS_DETAILS,
  DEFAULT_OTHER_SOURCES_DETAILS,
  DEFAULT_DEDUCTIONS,
  ITR_STEP_LABELS,
  type ItrCategoryId,
  type AssessmentYearOption,
  type ResidentialStatusOption,
  type FilingTypeOption,
  type FilingBankAccount,
  type PreviousItrInfo,
  type SalaryDetails,
  type HousePropertyDetails,
  type BusinessDetails,
  type CapitalGainsDetails,
  type OtherSourcesDetails,
  type DeductionsData,
  type UploadedDocInfo,
} from "./itrFiling.constants";

const resolveSubmittedFormType = (selectedSources: string[]): string => {
  try {
    if (selectedSources.includes("business")) return "ITR-3";
    if (selectedSources.includes("capital_gains")) return "ITR-2";
    return "ITR-1";
  } catch {
    return "ITR-1";
  }
};

const resolveSubmittedSourceLabel = (
  selectedSources: string[],
  employerName?: string,
): string => {
  try {
    if (selectedSources.includes("salary")) return employerName || "Salaried";
    if (selectedSources.includes("business")) return "Business";
    if (selectedSources.includes("capital_gains")) return "Capital Gains";
    return "Income Tax Return";
  } catch {
    return "Income Tax Return";
  }
};

const SERVICE_ID = "itr-filing";
const TOTAL_STEPS = 5;

export function useItrFilingState() {
  const [existingDraft] = useState(() =>
    readServiceDraft<Record<string, unknown>>(SERVICE_ID, DRAFT_NAMESPACES.itr),
  );

  const [isStarted, setIsStarted] = useState<boolean>(() =>
    Boolean(existingDraft),
  );
  const [currentStep, setCurrentStep] = useState<number>(
    () => existingDraft?.currentStep || 1,
  );
  const [selectedCategoryId, setSelectedCategoryId] =
    useState<ItrCategoryId | null>(
      () =>
        (existingDraft?.formData?.selectedCategoryId as ItrCategoryId) || null,
    );
  const [assessmentYear, setAssessmentYear] = useState<AssessmentYearOption>(
    () =>
      (existingDraft?.formData?.assessmentYear as AssessmentYearOption) || "",
  );
  const [residentialStatus, setResidentialStatus] =
    useState<ResidentialStatusOption>(
      () =>
        (existingDraft?.formData
          ?.residentialStatus as ResidentialStatusOption) || "",
    );
  const [filingType, setFilingType] = useState<FilingTypeOption>(
    () => (existingDraft?.formData?.filingType as FilingTypeOption) || "",
  );
  const [bankAccounts, setBankAccounts] = useState<FilingBankAccount[]>(
    () => (existingDraft?.formData?.bankAccounts as FilingBankAccount[]) || [],
  );
  const [selectedBankId, setSelectedBankId] = useState<string>(
    () => (existingDraft?.formData?.selectedBankId as string) || "",
  );
  const [previousItr, setPreviousItr] = useState<PreviousItrInfo>(
    () =>
      (existingDraft?.formData?.previousItr as PreviousItrInfo) ||
      DEFAULT_PREVIOUS_ITR,
  );

  const [selectedSources, setSelectedSources] = useState<string[]>(
    () =>
      (existingDraft?.formData?.selectedSources as string[]) || [],
  );
  const [salaryDetails, setSalaryDetails] = useState<SalaryDetails>(
    () =>
      (existingDraft?.formData?.salaryDetails as SalaryDetails) ||
      DEFAULT_SALARY_DETAILS,
  );
  const [housePropertyDetails, setHousePropertyDetails] =
    useState<HousePropertyDetails>(
      () =>
        (existingDraft?.formData
          ?.housePropertyDetails as HousePropertyDetails) ||
        DEFAULT_HOUSE_PROPERTY_DETAILS,
    );
  const [businessDetails, setBusinessDetails] = useState<BusinessDetails>(
    () =>
      (existingDraft?.formData?.businessDetails as BusinessDetails) ||
      DEFAULT_BUSINESS_DETAILS,
  );
  const [capitalGainsDetails, setCapitalGainsDetails] =
    useState<CapitalGainsDetails>(
      () =>
        (existingDraft?.formData?.capitalGainsDetails as CapitalGainsDetails) ||
        DEFAULT_CAPITAL_GAINS_DETAILS,
    );
  const [otherSourcesDetails, setOtherSourcesDetails] =
    useState<OtherSourcesDetails>(
      () =>
        (existingDraft?.formData?.otherSourcesDetails as OtherSourcesDetails) ||
        DEFAULT_OTHER_SOURCES_DETAILS,
    );

  const [selectedRegime, setSelectedRegime] = useState<"new" | "old" | "">(
    () => (existingDraft?.formData?.selectedRegime as "new" | "old") || "",
  );
  const [deductions, setDeductions] = useState<DeductionsData>(
    () =>
      (existingDraft?.formData?.deductions as DeductionsData) ||
      DEFAULT_DEDUCTIONS,
  );
  const [uploadedDocs, setUploadedDocs] = useState<
    Record<string, UploadedDocInfo>
  >(
    () =>
      (existingDraft?.formData?.uploadedDocs as Record<
        string,
        UploadedDocInfo
      >) || {},
  );

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedRef, setSubmittedRef] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedBank =
    bankAccounts.find((b) => b.id === selectedBankId) || bankAccounts[0];

  // Everything the draft stores (also used to tell whether the user has changed anything)
  const draftFields = {
    selectedCategoryId,
    assessmentYear,
    residentialStatus,
    filingType,
    bankAccounts,
    selectedBankId,
    previousItr,
    selectedSources,
    salaryDetails,
    housePropertyDetails,
    businessDetails,
    capitalGainsDetails,
    otherSourcesDetails,
    selectedRegime,
    deductions,
    uploadedDocs,
  };
  const [initialFields] = useState(() => draftFields);

  const isDirty = Boolean(
    isStarted &&
      !isSubmitted &&
      (currentStep > 1 ||
        Boolean(existingDraft) ||
        hasFormChanged(draftFields, initialFields)),
  );

  // Same draft behaviour as loans and GST: auto-save, save / discard dialog, browser Back prompt
  const serviceDraft = useServiceDraft<Record<string, unknown>>({
    serviceId: SERVICE_ID,
    serviceTitle: "ITR Filing",
    totalSteps: TOTAL_STEPS,
    currentStep,
    stepLabel: ITR_STEP_LABELS[currentStep - 1] || "Personal & Filing Info",
    resumeRoute: routePaths.itr.itrFiling,
    exitRoute: routePaths.itr.root,
    formData: { isStarted, currentStep, ...draftFields },
    hasEnteredData: isDirty,
    isComplete: isSubmitted,
    storageNamespace: DRAFT_NAMESPACES.itr,
    onDiscard: () => {
      setIsStarted(false);
      setCurrentStep(1);
    },
  });
  const {
    isDraftModalOpen: isModalOpen,
    openDraftModal: openModal,
    handleSaveAndExit,
    handleDiscardAndExit,
    handleKeepEditing,
  } = serviceDraft;

  const handleUploadDoc = (docId: string, docInfo: UploadedDocInfo) => {
    try {
      setUploadedDocs((prev) => ({ ...prev, [docId]: docInfo }));
    } catch {
      // Fallback
    }
  };

  const handleRemoveDoc = (docId: string) => {
    try {
      setUploadedDocs((prev) => {
        const next = { ...prev };
        delete next[docId];
        return next;
      });
    } catch {
      // Fallback
    }
  };

  const handleFinalSubmit = () => {
    try {
      setIsSubmitting(true);
      const generatedRef = `ITR-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

      setTimeout(() => {
        try {
          const taxCalc = calculateItrTax({
            selectedSources,
            salaryDetails,
            housePropertyDetails,
            businessDetails,
            capitalGainsDetails,
            otherSourcesDetails,
            selectedRegime,
            deductions,
          });
          const formType = resolveSubmittedFormType(selectedSources);
          const sourceLabel = resolveSubmittedSourceLabel(
            selectedSources,
            salaryDetails.employerName,
          );

          userStorage.saveUserApplication({
            id: `app-itr-${Date.now()}`,
            code: generatedRef,
            title: `${formType} Filing — ${assessmentYear}`,
            meta: `${sourceLabel} · ₹${taxCalc.grossTotalIncome.toLocaleString("en-IN")}`,
            statusLabel: "Submitted",
            statusTone: "info",
            progress: 25,
            icon: "📄",
            to: `/applications/track/${generatedRef}`,
          });

          serviceDraft.clearDraft();
          setSubmittedRef(generatedRef);
          setIsSubmitting(false);
          setIsSubmitted(true);
          window.scrollTo({ top: 0, behavior: "smooth" });
        } catch {
          setIsSubmitting(false);
        }
      }, 600);
    } catch {
      setIsSubmitting(false);
    }
  };

  return {
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
    isDirty,
  };
}
