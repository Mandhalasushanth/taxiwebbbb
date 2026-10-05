import React, { useState, useEffect } from "react";
import { StepActionBar } from "@shared/components";
import {
  ALL_SOURCES,
  CheckIcon,
  ItrFilingHeaderStepper,
  type ItrCategoryId,
  type SalaryDetails,
  type HousePropertyDetails,
  type BusinessDetails,
  type CapitalGainsDetails,
  type OtherSourcesDetails,
} from "../itrFiling.constants";
import {
  ItrSalaryIncomeCard,
  ItrHousePropertyCard,
  ItrBusinessIncomeCard,
  ItrCapitalGainsCard,
  ItrOtherSourcesCard,
} from "./ItrIncomeSourceCards";
import "./ItrIncomeSourcesView.css";

export type {
  SalaryDetails,
  HousePropertyDetails,
  BusinessDetails,
  CapitalGainsDetails,
  OtherSourcesDetails,
};

export interface ItrIncomeSourcesViewProps {
  onBack: () => void;
  onNext: () => void;
  onSaveDraft?: () => void;
  salaryDetails: SalaryDetails;
  onSalaryDetailsChange: (details: SalaryDetails) => void;
  housePropertyDetails: HousePropertyDetails;
  onHousePropertyDetailsChange: (details: HousePropertyDetails) => void;
  businessDetails: BusinessDetails;
  onBusinessDetailsChange: (details: BusinessDetails) => void;
  capitalGainsDetails: CapitalGainsDetails;
  onCapitalGainsDetailsChange: (details: CapitalGainsDetails) => void;
  otherSourcesDetails: OtherSourcesDetails;
  onOtherSourcesDetailsChange: (details: OtherSourcesDetails) => void;
  selectedSources?: string[];
  onSourcesChange?: (sources: string[]) => void;
  selectedCategoryId?: ItrCategoryId | null;
}

export const ItrIncomeSourcesView: React.FC<ItrIncomeSourcesViewProps> = ({
  onBack,
  onNext,
  onSaveDraft,
  salaryDetails,
  onSalaryDetailsChange,
  housePropertyDetails,
  onHousePropertyDetailsChange,
  businessDetails,
  onBusinessDetailsChange,
  capitalGainsDetails,
  onCapitalGainsDetailsChange,
  otherSourcesDetails,
  onOtherSourcesDetailsChange,
  selectedSources: initialSelectedSources,
  onSourcesChange,
  selectedCategoryId: _selectedCategoryId,
}) => {
  const [internalSources, setInternalSources] = useState<string[]>(
    initialSelectedSources ?? ["salary"],
  );

  const selectedSources = initialSelectedSources ?? internalSources;

  const toggleSource = (id: string) => {
    try {
      const updated = selectedSources.includes(id)
        ? selectedSources.filter((s) => s !== id)
        : [...selectedSources, id];

      if (onSourcesChange) {
        onSourcesChange(updated);
      } else {
        setInternalSources(updated);
      }
    } catch {
      // Graceful fallback
    }
  };

  const [showErrors, setShowErrors] = useState(false);

  const isIncomeSourcesValid = Boolean(
    selectedSources.length > 0 &&
      (!selectedSources.includes("salary") ||
        Boolean(
          salaryDetails.grossSalary?.trim() ||
            salaryDetails.employerName?.trim(),
        )) &&
      (!selectedSources.includes("house_property") ||
        housePropertyDetails.propertyType === "self_occupied" ||
        Boolean(housePropertyDetails.annualRentReceived?.trim())) &&
      (!selectedSources.includes("business") ||
        Boolean(
          businessDetails.grossTurnover?.trim() ||
            businessDetails.declaredNetProfit?.trim(),
        )) &&
      (!selectedSources.includes("capital_gains") ||
        Boolean(
          capitalGainsDetails.stcg?.trim() ||
            capitalGainsDetails.ltcg?.trim() ||
            capitalGainsDetails.assetTypes.length > 0,
        )) &&
      (!selectedSources.includes("other_sources") ||
        Boolean(
          otherSourcesDetails.interestIncome?.trim() ||
            otherSourcesDetails.dividendIncome?.trim() ||
            otherSourcesDetails.otherIncome?.trim(),
        )),
  );

  const handleNext = () => {
    try {
      if (!isIncomeSourcesValid) {
        setShowErrors(true);
        return;
      }
      onNext();
    } catch {
      setShowErrors(true);
    }
  };

  useEffect(() => {
    const handleAttempt = () => {
      try {
        if (!isIncomeSourcesValid) setShowErrors(true);
      } catch {
        setShowErrors(true);
      }
    };
    window.addEventListener("step-action-bar:submit-attempt", handleAttempt);
    return () =>
      window.removeEventListener("step-action-bar:submit-attempt", handleAttempt);
  }, [isIncomeSourcesValid]);

  const renderCard = (sourceId: string) => {
    switch (sourceId) {
      case "salary":
        return (
          <ItrSalaryIncomeCard
            key="salary"
            salaryDetails={salaryDetails}
            onSalaryDetailsChange={onSalaryDetailsChange}
            onToggle={() => toggleSource("salary")}
          />
        );
      case "house_property":
        return (
          <ItrHousePropertyCard
            key="house_property"
            housePropertyDetails={housePropertyDetails}
            onHousePropertyDetailsChange={onHousePropertyDetailsChange}
            onToggle={() => toggleSource("house_property")}
          />
        );
      case "business":
        return (
          <ItrBusinessIncomeCard
            key="business"
            businessDetails={businessDetails}
            onBusinessDetailsChange={onBusinessDetailsChange}
            onToggle={() => toggleSource("business")}
          />
        );
      case "capital_gains":
        return (
          <ItrCapitalGainsCard
            key="capital_gains"
            capitalGainsDetails={capitalGainsDetails}
            onCapitalGainsDetailsChange={onCapitalGainsDetailsChange}
            onToggle={() => toggleSource("capital_gains")}
          />
        );
      case "other_sources":
        return (
          <ItrOtherSourcesCard
            key="other_sources"
            otherSourcesDetails={otherSourcesDetails}
            onOtherSourcesDetailsChange={onOtherSourcesDetailsChange}
            onToggle={() => toggleSource("other_sources")}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="itr-step-view-container">
      <ItrFilingHeaderStepper currentStepId={2} />

      <div className="itr-step-card">
        <div className="itr-sources-header">
          <h2 className="itr-sources-title">Income Sources &amp; Activity</h2>
          <p className="itr-sources-subtitle">
            Select all sources of income you earned this year. Fields will
            adjust automatically.
          </p>
          <span className="itr-sources-label">Select your income sources:</span>
        </div>
        <div
          className="itr-pills-row"
          role="group"
          aria-label="Income sources selection"
        >
          {ALL_SOURCES.map((src) => {
            const isSelected = selectedSources.includes(src.id);
            return (
              <button
                key={src.id}
                type="button"
                className={`itr-source-pill ${isSelected ? "itr-source-pill--active" : ""}`}
                onClick={() => toggleSource(src.id)}
                aria-pressed={isSelected}
              >
                {isSelected ? (
                  <span className="itr-pill-icon-active" aria-hidden="true">
                    <CheckIcon size={10} />
                  </span>
                ) : (
                  <span className="itr-pill-icon-add" aria-hidden="true">
                    +
                  </span>
                )}
                <span>{src.label}</span>
              </button>
            );
          })}
        </div>
        {showErrors && selectedSources.length === 0 && (
          <div className="itr-field-error" role="alert">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            <span>Please select at least one income source to proceed.</span>
          </div>
        )}
      </div>

      {selectedSources.map(renderCard)}

      <StepActionBar
        onBack={onBack}
        onNext={handleNext}
        onSaveDraft={onSaveDraft}
        backLabel="Back"
        nextLabel="Continue"
        nextDisabled={!isIncomeSourcesValid}
      />
    </div>
  );
};

export default ItrIncomeSourcesView;
